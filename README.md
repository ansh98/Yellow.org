# Yellow.org


The Yellow SDK (Nitrolite) is a developer toolkit for building decentralized applications on the Yellow Network, a global clearing layer for off-chain trading and settlement. Instead of manually handling WebSocket messaging, cryptography, and state-channel orchestration, developers can use the SDK’s high-level APIs to authenticate, establish sessions, and manage asset transfers seamlessly.
Key features include:
Authentication: EIP-712–based flow that securely links a wallet to a ClearNode session.
Network connectivity: Easy WebSocket connection to ClearNodes for real-time off-chain interaction.
Ledger & balances: Query off-chain balances and allocations with signed RPC requests.
Application sessions: Create and manage state-channel–based sessions between participants, enabling near-instant settlement and programmable interactions.
Channel lifecycle helpers (NitroliteClient): Deposit, open/close, and withdraw funds from state channels without writing low-level contract calls.
Together, these features let developers deliver Web2-level responsiveness while retaining the trust guarantees of Web3.
Example use case:
Imagine a decentralized in-game marketplace. Players buy and sell items continuously, often in small amounts. Settling every micro-trade on-chain would be slow and expensive. With Yellow SDK, trades happen instantly in off-chain sessions, with only final outcomes settled on-chain. This reduces gas costs, improves UX, and makes it feasible to run high-frequency or micro-payment–driven applications like games, live auctions, subscriptions, or even high-throughput trading apps.
By abstracting the protocol details, the Yellow SDK empowers developers to focus on product logic while leveraging Yellow’s scalable, decentralized infrastructure.
