# 🗂️ DEV WORK PLAN — Team 186 (Snake_Eyes)
### Project: Public Distribution System (PDS) — Blockchain DApp
### Hackathon: DotSlash 5.0 | Duration: 36 Hours

---

## 👥 Team Members & Roles

| Name | GitHub | Primary Role |
|---|---|---|
| Raghavendra Reddy | [@PRR184](https://github.com/PRR184) | Smart Contract + Transactions UI |
| Aviraj Rathod | [@aviraj1703](https://github.com/aviraj1703) | Web3 Integration + District/Transfer UI |
| Hariom Vyas | [@Hariom1509](https://github.com/Hariom1509) | Blockchain Setup + Consumer/Order UI |
| Manik (Prabhav) | [@Prabhav200511](https://github.com/Prabhav200511) | Project Lead + Repo Management + UI Polish |

---

## 🗓️ DAY 1 — Setup & Smart Contract (Hours 1–12)

### 🔵 Raghavendra Reddy — Smart Contract Development

```bash
# 1. Initialize Truffle project
truffle init

# 2. Write the PDS Smart Contract (Solidity)
#    → src/contracts/PDS.sol
#    (Roles: State, District, Shop, Consumer)
#    (Functions: addBags, transferBags, receiveBags, placeOrder)

# 3. Write migration scripts
#    → migrations/1_initial_migration.js
#    → migrations/2_deploy_pds.js

# 4. Compile contracts
truffle compile

# 5. Deploy to local Ganache
truffle migrate --reset --network development

# 6. Verify contract deployed correctly
truffle console --network development
```

---

### 🟢 Aviraj Rathod — React App + Redux Store Setup

```bash
# 1. Bootstrap React application
npx create-react-app BFSC2
cd BFSC2

# 2. Install all dependencies
npm install web3 redux react-redux react-bootstrap bootstrap react-router-dom

# 3. Create Redux store structure
#    → src/store/configureStore.js
#    → src/store/actions.js
#    → src/store/reducers.js
#    → src/store/selectors.js

# 4. Build Web3 interaction layer
#    → src/store/interactions.js
#    (loadProvider, loadAccount, loadNetwork, loadPDS)

# 5. Run app to verify base setup
npm start
```

---

### 🟡 Hariom Vyas — Ganache + Scripts Setup

```bash
# 1. Configure Truffle for local Ganache
#    → truffle-config.js  (network: development, port: 7545)

# 2. Start local Ganache blockchain
npx ganache-cli --deterministic --port 7545

# 3. Write role-granting script
#    → scripts/grant_roles.js

# 4. Write seed/dummy data script
#    → scripts/seed.js
#    → scripts/dummyData.js

# 5. Write fund accounts script
#    → scripts/fund.js

# 6. Run seed after deployment
truffle exec scripts/grant_roles.js --network development
truffle exec scripts/seed.js --network development
```

---

## 🗓️ DAY 2 — Component Development (Hours 13–30)

### 🔵 Raghavendra Reddy — Transaction & Home Components

```bash
# Files to build:
#    → src/components/Home.js          (dashboard: state-level overview)
#    → src/components/Transactions.js  (on-chain event table)
#    → src/components/Grid.js          (reusable data grid)
#    → src/components/Results.js       (query results wrapper)
#    → src/components/Shopres.js       (shop-level result display)

# Test component rendering
npm start
```

---

### 🟢 Aviraj Rathod — District & Bag Transfer Components

```bash
# Files to build:
#    → src/components/Districtres.js     (district resource overview)
#    → src/components/Adddistrict.js     (add district form)
#    → src/components/Transfer.js        (district → shop bag transfer)
#    → src/components/AddReceivedBags.js (shop confirms received bags)

# Connect each component to Redux store
# Wire Web3 calls via interactions.js

# Test form submissions on local blockchain
npm start
```

---

### 🟡 Hariom Vyas — Consumer Order & User Components

```bash
# Files to build:
#    → src/components/Order.js       (consumer places grain order)
#    → src/components/Addconsumer.js (register consumer with MetaMask)
#    → src/components/Usertrans.js   (consumer transaction history)
#    → src/components/Details.js     (shop/consumer detail page)

# Verify MetaMask integration for consumer payments
npm start
```

---

## 🗓️ DAY 2 FINAL PUSH — Integration & Polish (Hours 31–36)

### 🔴 All Developers Together

```bash
# 1. Wire all routes in the main App
#    → src/components/App.js
#    → src/components/NavbarComp.js  (role-based navigation)

# 2. Apply global styling
#    → src/components/App.css
#    → src/index.css

# 3. Link compiled contract ABIs
#    → src/abis/PDS.json
#    → src/abis/Migrations.json

# 4. Recompile and redeploy contract (final version)
truffle compile
truffle migrate --reset --network development

# 5. Seed test data
truffle exec scripts/grant_roles.js --network development
truffle exec scripts/seed.js --network development

# 6. Run full test suite
truffle test

# 7. Start app and do end-to-end testing
npm start

# 8. Build production bundle (for demo)
npm run build
```

---

## 🚀 Running the Project (For Any Developer)

### Prerequisites
- Node.js v14+
- Truffle (`npm install -g truffle`)
- Ganache CLI (`npm install -g ganache-cli`)
- MetaMask browser extension

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Prabhav200511/BFSC-DApp.git
cd BFSC-DApp

# 2. Install dependencies
npm install

# 3. Start local blockchain (in a separate terminal)
npx ganache-cli --deterministic --port 7545

# 4. Compile & deploy smart contract
truffle compile
truffle migrate --reset --network development

# 5. Grant roles and seed data
truffle exec scripts/grant_roles.js --network development
truffle exec scripts/seed.js --network development

# 6. Start the React frontend
npm start
```

---

## 📁 Project Structure

```
BFSC-DApp/
├── migrations/             # Truffle deployment scripts
├── scripts/                # Utility scripts (seed, fund, grant_roles)
├── src/
│   ├── abis/               # Compiled contract ABIs
│   ├── components/         # React components (UI)
│   ├── contracts/          # Solidity smart contracts
│   └── store/              # Redux state management
├── test/                   # Smart contract tests
├── truffle-config.js       # Truffle network configuration
├── DEV_PLAN.md             # This file
└── README.md               # Project overview
```

---

## 🔗 Links
- **Demo Video**: https://youtu.be/EIseC_4NrEk
- **Repository**: https://github.com/Prabhav200511/BFSC-DApp
