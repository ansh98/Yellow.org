# Summary

The **Yellow SDK (Nitrolite)** is a developer toolkit for building decentralized applications on the Yellow Network.  
It abstracts away complex tasks like cryptographic signing, real-time messaging, and state-channel orchestration, letting developers focus on product logic instead of low-level protocol details.

### Key Features
- **Authentication** → Secure EIP-712–based flow to link a wallet and establish a ClearNode session.
- **Network Connectivity** → Simple WebSocket client for connecting to ClearNodes.
- **Ledger Balances** → Query off-chain balances with signed RPC messages.
- **Application Sessions** → Create state-channel sessions between participants for instant settlement.
- **Channel Lifecycle Helpers** → Deposit, open, close, and withdraw funds using higher-level APIs.

### Example Use Case
A strong use case is a **decentralized in-game marketplace**. Players buy and sell items frequently and in small amounts. Settling every trade on-chain would be slow and expensive.  
With the Yellow SDK, trades execute instantly off-chain inside application sessions, while only the final settlement is pushed to chain. This reduces fees, improves user experience, and enables high-frequency microtransactions.

By abstracting the heavy lifting, the Yellow SDK empowers developers to deliver Web2-smooth user experiences while maintaining Web3 trust guarantees.
