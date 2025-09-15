# 🚀 Getting Started with Yellow SDK: Build a Demo App in Minutes

When I first explored the **Yellow SDK (Nitrolite)**, I wanted to see if I could build something small, fast, and clear.  
The goal: connect to the Yellow Network, authenticate, check balances, and create an app session ,all in less than 200 lines of code.  

Spoiler: it works, and here’s how you can try it too.  



🌍 What is the Yellow SDK?

The **Yellow SDK** is a developer toolkit for building decentralized applications (dApps) on the Yellow Network.  
It abstracts away complex tasks like authentication and message signing, and provides easy-to-use methods for:

- 🔐 Authentication — EIP-712 challenge/verify flow  
- 🌐 Network connectivity — connect to ClearNodes via WebSocket  
- 📊 Ledger balances — query off-chain balances with signed RPC calls  
- 🔗 Application sessions— open/close state-channel sessions for fast settlement  

In short: it lets you deliver **Web2-like user experience with Web3 trust.


🛠 The Demo App

Inside this repo, there’s a folder called [`demo-app/`](./demo-app).  
It’s a simple TypeScript CLI that does four things:

1. Connects to a ClearNode  
2. Authenticates the user via EIP-712  
3. Queries ledger balances  
4. Creates an application session with a counterparty  
