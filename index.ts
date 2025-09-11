// src/index.ts
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

// ---- env
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
  console.error('Set PRIVATE_KEY in .env');
  process.exit(1);
}

// ---- wallet client (used for EIP-712 auth signing via SDK helper)
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(RPC_URL),
});

// ---- util: message signer for non-auth RPC helpers
// Follows docs pattern: hash JSON, sign as message (EIP-191). :contentReference[oaicite:3]{index=3}
async function messageSigner(payload: unknown): Promise<`0x${string}`> {
  const msg = JSON.stringify(payload);
  const digest = keccak256(stringToBytes(msg));
  // Sign the digest bytes as a message; returns 0x… signature
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
  // 1) Send auth_request (wallet, participant, app info). :contentReference[oaicite:4]{index=4}
  const authRequest = await createAuthRequestMessage({
    wallet: account.address,
    participant: account.address,
    app_name: APP_NAME,
    expire: Math.floor(Date.now() / 1000) + 3600,
    scope: 'console',
    application: APPLICATION_ADDRESS as `0x${string}`,
    allowances: [], // refine as needed
  });
  ws.send(authRequest);

  // 2) Handle challenge → sign EIP-712 → auth_verify. :contentReference[oaicite:5]{index=5}
  return new Promise<void>((resolve, reject) => {
    const onMessage = async (raw: WebSocket.MessageEvent) => {
      try {
        const message = parseRPCResponse(
          (raw as unknown as MessageEvent).data ?? (raw as any)
        );

        switch (message.method) {
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
            const verifyMsg = await createAuthVerifyMessage(signer, message);
            ws.send(verifyMsg);
            break;
          }
          case RPCMethod.AuthVerify: {
            if (!message.params?.success) return reject(new Error('Auth failed'));
            // store JWT if provided for reconnects
            if (message.params?.jwtToken) {
              // in a real app, persist JWT securely
              console.log('Authenticated. JWT issued.');
            } else {
              console.log('Authenticated.');
            }
            ws.off('message', onMessage as any);
            resolve();
            break;
          }
          case RPCMethod.Error: {
            reject(new Error(`Auth error: ${message.params?.error}`));
            break;
          }
        }
      } catch (err) {
        // ignore non-RPC payloads
      }
    };
    ws.on('message', onMessage as any);
  });
}

// Get off-chain balances for our participant. :contentReference[oaicite:6]{index=6}
async function getBalances(ws: WebSocket, participant: `0x${string}`) {
  return new Promise<void>((resolve, reject) => {
    const onMessage = (raw: WebSocket.MessageEvent) => {
      try {
        const msg = parseRPCResponse(
          (raw as unknown as MessageEvent).data ?? (raw as any)
        );
        if (msg.method === RPCMethod.GetLedgerBalances) {
          ws.off('message', onMessage as any);
          console.log('Balances:', JSON.stringify(msg.params, null, 2));
          resolve();
        }
      } catch (_) {}
    };
    ws.on('message', onMessage as any);
    createGetLedgerBalancesMessage(messageSigner, participant)
      .then((m) => ws.send(m))
      .catch(reject);
  });
}

// Create an application session between us & a counterparty. :contentReference[oaicite:7]{index=7}
async function createAppSession(
  ws: WebSocket,
  me: `0x${string}`,
  other: `0x${string}`,
  amount: string = '100' // e.g. 100 units of the asset (string)
) {
  return new Promise<void>((resolve, reject) => {
    const onMessage = (raw: WebSocket.MessageEvent) => {
      try {
        const msg = parseRPCResponse(
          (raw as unknown as MessageEvent).data ?? (raw as any)
        );
        if (msg.method === RPCMethod.CreateAppSession) {
          ws.off('message', onMessage as any);
          console.log('App Session:', JSON.stringify(msg.params, null, 2));
          resolve();
        }
      } catch (_) {}
    };
    ws.on('message', onMessage as any);

    const appDefinition = {
      protocol: 'nitroliterpc',
      participants: [me, other],
      weights: [100, 0],
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
    };
    const allocations = [
      { participant: me, asset: 'usdc', amount },
      { participant: other, asset: 'usdc', amount: '0' },
    ];

    createAppSessionMessage(messageSigner, [{ definition: appDefinition, allocations }])
      .then((m) => ws.send(m))
      .catch(reject);
  });
}

(async () => {
  console.log('Connecting to ClearNode:', CLEARNODE_WS);
  const ws = await connectWS(CLEARNODE_WS);
  await authenticate(ws); // auth handshake (request → challenge → verify) :contentReference[oaicite:8]{index=8}
  await getBalances(ws, account.address); // read off-chain ledger balances :contentReference[oaicite:9]{index=9}
  await createAppSession(ws, account.address, COUNTERPARTY, '100'); // open an app session :contentReference[oaicite:10]{index=10}
  ws.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
