# Yellow SDK Demo

This repository is my take-home submission for the Developer Relations Engineer exercise.

It contains:

- **SUMMARY.md** → short overview of the Yellow SDK
- **GETTING_STARTED.md** → step-by-step guide for developers
- **demo-app/** → a small TypeScript demo app showcasing SDK usage

## Yellow SDK Flow


Demo App 
        |
        v
+-------------------+
|  ClearNode (WS)   |
+-------------------+
        |
        v
+-------------------+
| Authentication    |  (EIP-712 Challenge/Verify)
+-------------------+
        |
   +-----------+-----------+
   |                       |
   v                       v
Ledger Balances        App Session
   (Query)               (Create)





---

## Quick Links

- [Summary](./SUMMARY.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [Demo App](./demo-app)

---

## Running the Demo App

See [demo-app/README.md](./demo-app/README.md) for setup and usage.

