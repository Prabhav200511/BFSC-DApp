read me mein ye copy paste krdena
# BFSC-DApp — Blockchain Public Distribution System

> **Transparent & Secure Food Supply Chain — powered by Blockchain**

REPORT LINK : https://drive.google.com/file/d/13DPUz7OtsCSAMm3dCXqnGvwJCML9fG-M/view?usp=sharing

VIDEO DEMO LINK :   https://drive.google.com/file/d/1fvYZnVYHHRwJvwYngx5X9hAX-TISEPTW/view?usp=sharing

## 📖 What is this project? 

In India, the government distributes food (rice, wheat, sugar, etc.) to poor families through **Ration Shops** under the **Public Distribution System (PDS)**. However, this system loses thousands of crores every year to corruption:
- Officials divert bags of food before they reach shops.
- Shop owners hoard rations to sell on the black market. 
- Ghost consumers are created to claim extra rations.

**Our Solution**: BFSC-DApp replaces paper records with a **tamper-proof blockchain ledger**. Every bag of food gets a digital serial number. When bags move from the State Warehouse → District → Ration Shop, the transfers are immutably recorded on the Ethereum blockchain. When a consumer buys their rations, the order is permanently logged. 

Additionally, an integrated **AI Engine (Isolation Forest)** analyzes orders in real-time to flag fraudulent patterns (e.g., suspiciously large orders, odd hours).

| Problem (Current System) | Solution (Our System) |
|---|---|
| Paper records can be faked | Blockchain records are unfakeable and immutable |
| Missing bags go unnoticed | Sent vs Received quantities must match on-chain |
| Fraud discovered months later | AI flags suspicious transactions instantly |
| Opaque to citizens | 100% transparent audit trail accessible to anyone |

**REPORT LINK :**

**Demonstration Video Link:**

---

## 💻 How to Run the Demo (Single-Laptop Setup)

This project is built using React, Truffle, Solidity, and Python (FastAPI). The demo is designed to run locally on one machine:

- **Ganache** runs a local Ethereum blockchain.
- **MetaMask** connects to `http://127.0.0.1:7545`.
- Different Ganache accounts are imported into MetaMask to demonstrate State Admin, District Admin, Shop Owner, Consumer, and Delivery Agent roles.
- The Web3 Console shows active wallet role proof, contract counters, block number, transaction hashes, and the latest smart contract events.

## Main Blockchain Features

- Role-based access control for Creator, State Admin, District Admin, Shop Owner, Consumer, and Delivery Agent.
- On-chain bag tokenization and item catalog management.
- District-to-shop transfer and receipt event logs.
- Delivery pickup lifecycle: assigned, picked up, delivered, confirmed.
- Shop inventory attestation with low-stock alerts.
- Consumer-signed ration request transaction through MetaMask.
- Shop-owner order fulfillment receipt.
- Event stream for auditability and demo proof.

## Single-Laptop Demo

Open three terminals in this folder.

Terminal 1: start Ganache.

```
npm run chain
```

Terminal 2: compile, deploy, and seed demo data.

```
npm run contracts:compile
npm run contracts:migrate
npm run demo:seed
npm run demo:roles
```

Terminal 3: start React.

```
npm start
```

If port `3000` is already occupied, start React on another port:

```
$env:PORT=3001
npm start
```

MetaMask setup:

1. Add a custom network with RPC URL `http://127.0.0.1:7545`.
2. Import the private keys printed by Ganache for `accounts[1]` to `accounts[5]`.
3. Use these accounts as:

| Ganache account | Demo role |
|---|---|
| `accounts[1]` | State Admin |
| `accounts[2]` | District Admin |
| `accounts[3]` | Shop Owner for Shop `100` |
| `accounts[4]` | Consumer |
| `accounts[5]` | Delivery Agent |

Open `http://localhost:3000/#/blockchain-console` and switch MetaMask accounts to demonstrate each role. If you used another port, replace `3000` with that port.

## Flow

1. State Admin: tokenize a new bag, add a new item, register a delivery agent, assign pickup `1`.
2. District Admin: register a shop or consumer.
3. Consumer: request ration from shop `100` using item IDs `1,2`.
4. Delivery Agent: mark pickup `1` as picked up, then delivered.
5. Shop Owner: confirm pickup `1`, attest inventory, and fulfill a consumer order from the existing Make Order page.
6. Consumer : Can request Items from the particular shop if they have a vaild adress.
7. Transactions and Web3 Console: show event logs, block numbers, counters, and transaction hashes.

## Useful IDs

- Shop ID: `100`
- Pickup ID after fresh seed: `1`
- Bag IDs: `1001,1002,1003,1004,1005`
- Item IDs: `1=Rice`, `2=Wheat`, `3=Sugar`, `4=Cooking Oil`

## Project Structure

```text
src/contracts/PDS.sol       Solidity smart contract
src/abis/                   Truffle-generated ABIs
src/components/             React UI pages
src/store/                  Redux/Web3 wiring
migrations/                 Truffle deployments
scripts/demo_setup.js       Single-laptop demo seed script
test/PDS.t.sol              Foundry contract tests
```