import 'dotenv/config';
import WebSocket from 'ws';
import {
  RPCMethod,
  parseRPCResponse,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  createGetLedgerBalancesMessage,
  createAppSessionMessage,
} from '@erc7824/nitrolite';
import {
  createWalletClient,
  http,
  privateKeyToAccount,
  keccak256,
  stringToBytes,
} from 'viem';
import { base } from 'viem/chains';

const CLEARNODE_WS = process.env.CLEARNODE_WS || 'wss://clearnet.yellow.com/ws';
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';
const APP_NAME = process.env.APP_NAME || 'demo-app.local';
const APPLICATION_ADDRESS =
  process.env.APPLICATION_ADDRESS ||
  '0x0000000000000000000000000000000000000000';
const COUNTERPARTY =
  process.env.COUNTERPARTY || '0x000000000000000000000000000000000000dead';

if (!PRIVATE_KEY) {
  console.error('Missing PRIVATE_KEY in .env');
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(RPC_URL),
});

async function messageSigner(payload: unknown): Promise<`0x${string}`> {
  const digest = keccak256(stringToBytes(JSON.stringify(payload)));
  return walletClient.signMessage({ message: { raw: digest } });
}

function connectWS(url: string) {
  return new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

async function authenticate(ws: WebSocket) {
  const authRequest = await createAuthRequestMessage({
    wallet: account.address,
    participant: account.address,
    app_name: APP_NAME,
    expire: Math.floor(Date.now() / 1000) + 3600,
    scope: 'console',
    application: APPLICATION_ADDRESS as `0x${string}`,
    allowances: [],
  });
  ws.send(authRequest);

  return new Promise<void>((resolve, reject) => {
    ws.on('message', async (raw) => {
      const msg = parseRPCResponse(raw.toString());
      switch (msg.method) {
        case RPCMethod.AuthChallenge: {
          const signer = createEIP712AuthMessageSigner(
            walletClient,
            {
              scope: 'console',
              application: APPLICATION_ADDRESS as `0x${string}`,
              participant: account.address,
              expire: Math.floor(Date.now() / 1000) + 3600,
              allowances: [],
            },
            { name: APP_NAME }
          );
          const verify = await createAuthVerifyMessage(signer, msg);
          ws.send(verify);
          break;
        }
        case RPCMethod.AuthVerify: {
          if (!msg.params?.success) return reject('Auth failed');
          console.log('✅ Authenticated');
          resolve();
          break;
        }
      }
    });
  });
}

async function getBalances(ws: WebSocket) {
  return new Promise<void>((resolve) => {
    ws.on('message', (raw) => {
      const msg = parseRPCResponse(raw.toString());
      if (msg.method === RPCMethod.GetLedgerBalances) {
        console.log('📊 Balances:', JSON.stringify(msg.params, null, 2));
        resolve();
      }
    });
    createGetLedgerBalancesMessage(messageSigner, account.address).then((m) =>
      ws.send(m)
    );
  });
}

async function createSession(ws: WebSocket) {
  return new Promise<void>((resolve) => {
    ws.on('message', (raw) => {
      const msg = parseRPCResponse(raw.toString());
      if (msg.method === RPCMethod.CreateAppSession) {
        console.log('🔗 Session created:', JSON.stringify(msg.params, null, 2));
        resolve();
      }
    });

    const definition = {
      protocol: 'nitroliterpc',
      participants: [account.address, COUNTERPARTY],
      weights: [100, 0],
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
    };
    const allocations = [
      { participant: account.address, asset: 'usdc', amount: '100' },
      { participant: COUNTERPARTY, asset: 'usdc', amount: '0' },
    ];

    createAppSessionMessage(messageSigner, [
      { definition, allocations },
    ]).then((m) => ws.send(m));
  });
}

(async () => {
  const ws = await connectWS(CLEARNODE_WS);
  await authenticate(ws);
  await getBalances(ws);
  await createSession(ws);
  ws.close();
})();
