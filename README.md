# Yellow SDK Demo

This repository is my take-home submission for the Developer Relations Engineer exercise.

It contains:

- **SUMMARY.md** → short overview of the Yellow SDK
- **GETTING_STARTED.md** → step-by-step guide for developers
- **demo-app/** → a small TypeScript demo app showcasing SDK usage

## Yellow SDK Flow


## 🔄 Yellow SDK Flow (Step by Step)

(1) Demo App (TypeScript CLI)
              |
              v
+---------------------------+
|  (2) Connect to ClearNode |
|        via WebSocket      |
+---------------------------+
              |
              v
+---------------------------+
|  (3) Authentication       |
|   EIP-712 Challenge/Verify|
+---------------------------+
              |
     +-------------------+-------------------+
     |                                       |
     v                                       v
+-------------------+              +-------------------+
| (4) Ledger        |              | (5) App Session   |
|     Balances      |              |   Creation        |
|   (Query funds)   |              | (Open channel)    |
+-------------------+              +-------------------+






---

## Quick Links

- [Summary](./SUMMARY.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [Demo App](./demo-app)

---

## Running the Demo App

See [demo-app/README.md](./demo-app/README.md) for setup and usage.

