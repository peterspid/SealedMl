# SealedML - Privacy-First AI Inference dApp

## One-Line Description

**SealedML = "AI that works on your data without seeing your data"**

Get financial decisions (like credit scores) without revealing your financial data to anyone.

---

## What Is SealedML?

SealedML is a **privacy-preserving on-chain AI inference protocol** that enables users to receive credit scores and risk assessments **without revealing their sensitive financial data to anyone**.





### The Simple Version

```
You get: Credit Score ✓
Without sharing: Bank statements, Income data, Financial history ✗
```

### Why This Matters

**Traditional AI:**

- ❌ Needs your raw data
- ❌ Centralized servers see everything
- ❌ Data leaks, misuse risk

**SealedML:**

- ✅ Works on encrypted data
- ✅ On-chain computation
- ✅ You control your data

---

## How It Works (Simple Flow)

```
1️⃣ User enters financial data
         ↓
2️⃣ Browser encrypts locally (FHE)
         ↓
3️⃣ Smart contract runs AI on encrypted data
         ↓
4️⃣ Encrypted result returned
         ↓
5️⃣ Only user can decrypt
         ↓
6️⃣ User sees their score
```

### User POV

```
User: "I got a credit score without sharing my data with anyone."
```

That's HUGE.

---

## Real Use Cases

### For Users

- **Loan Approval** - Get approved without sharing bank statements
- **DeFi Lending** - Prove creditworthiness without exposing finances
- **Fraud Detection** - Detect fraud without revealing patterns
- **Insurance Risk** - Assess risk without sharing personal details
- **Financial Reputation** - Build a private financial identity

### For Protocols

- **Private lending decisions** - Lend without seeing borrower data
- **Risk assessment** - Evaluate users without data exposure
- **Confidential scoring** - Score without storing data

### For Institutions

- **Compliance-aware analysis** - Meet regulations without data exposure
- **Audits** - Verify without compromising privacy
- **Underwriting** - Assess risk privately

---

## Core Features

### 🔐 Encrypted Data Input

- User inputs data → encrypted in browser
- Uses `@cofhe/sdk` for client-side encryption
- No plaintext ever leaves user device

### 🤖 Private AI Scoring

- Model runs on encrypted data via FHE smart contracts
- Weighted scoring / logistic model on-chain
- AI works WITHOUT seeing data

### 🔑 Client-side Decryption

- User decrypts result locally
- Only user sees the output
- Zero-knowledge proof verified

### 📊 Result Dashboard

- Score display
- Risk level visualization
- Assessment history
- Makes it usable in the real app flow

### 🧾 Model Transparency

- Model version display
- Feature weights visible
- Builds trust in the system

### 🔗 Selective Sharing

- Share results with third parties
- CoFHE decrypt access is granted through `SealedMLInference.grantResultAccess`
- Lenders can decrypt shared score/risk handles from `/lenders`
- User controls WHO sees WHAT

---

## Advanced Features Roadmap

### 🏦 Lender Dashboard (Wave 3 MVP, Wave 4 Expansion)

- B2B interface for banks and lenders is available at `/lenders`
- Verify user-shared result records
- Decrypt score and risk handles after the user grants wallet access
- Next: institution authentication and verification request workflow
- **Why:** B2B use case = real revenue

### 🧠 Explainability (Wave 3)

- "Why did I get this score?"
- Precomputed logic explanations
- Encrypted feature importance
- **Why:** Makes AI trustworthy

### 🔄 Multiple Models (Wave 3-4)

- Credit score model
- Fraud detection model
- Risk assessment model
- **Why:** Platform, not just one tool

### 🧬 Reputation System (Wave 5)

- User builds private financial identity
- Historical score tracking
- Private credit history
- **Why:** Web3 version of CIBIL score

### 📡 Event & Analytics Layer (Wave 4)

- Track usage statistics
- Public model metrics
- Zero privacy breach
- **Why:** Improves UX without breaking privacy

### 🌐 Private AI Marketplace (Wave 5)

- Upload and run private models
- Model versioning
- Community models
- **Why:** Platform expansion

---

## Project Structure

```
sealedml/
├── contracts/                    # Smart Contracts
│   ├── src/
│   │   ├── ModelRegistry.sol    # Model versioning
│   │   ├── SealedMLInference.sol # FHE inference engine
│   │   ├── ResultManager.sol     # Result storage & sharing
│   │   └── AccessControl.sol     # Permissions
│   └── scripts/
│       └── deploy.ts             # Deployment
├── apps/
│   └── web/                     # Frontend (Next.js)
│       └── src/
│           ├── app/
│           │   ├── page.tsx          # Home page
│           │   ├── dashboard/page.tsx # User dashboard
│           │   ├── models/page.tsx   # Model info
│           │   └── about/page.tsx    # About page
│           ├── components/      # React components
│           ├── hooks/           # useInference, useModelInfo
│           ├── lib/            # Utils, contracts, wagmi, store
│           ├── providers/      # Wagmi + React Query
│           └── types/          # TypeScript types
└── README.md
```

---

## Smart Contracts

### ModelRegistry

- Stores model metadata, versions, feature schemas
- Controls active model for inference
- Supports model upgrades without breaking trust

### SealedMLInference

- Core FHE inference engine
- Weighted scoring on encrypted data
- Returns encrypted score + risk class
- Handles FHE operations (add, mul, div, compare)

### ResultManager

- Stores inference results with references
- Manages selective disclosure permissions
- Handles result sharing with third parties
- Permissioned access controls

### AccessControl

- Permission levels (None, ViewOnly, Decrypt, Full)
- Rate limiting for decryption requests
- Service access management
- Decryption request tracking

---

## Credit Risk Model (v1.1)

### Features Used


| Feature                 | Weight | Description                      |
| ----------------------- | ------ | -------------------------------- |
| Income Level            | -2     | Higher income lowers risk        |
| Repayment History       | -3     | Good repayment lowers risk       |
| Current Liabilities     | +6     | Existing debt raises risk        |
| Savings Behavior        | -2     | Better savings lower risk        |
| Transaction Consistency | -2     | Consistency lowers uncertainty   |
| Wallet Activity         | -1     | Healthy activity lowers risk     |


### Risk Classification

- **Low Risk**: Score ≤ 40
- **Medium Risk**: Score 41-70
- **High Risk**: Score > 70

### Score Formula

```
Risk score = 70 (bias) + Σ(feature_value × weight) / 10
Final score is floored, capped to 0-100, and classified on-chain.
```

---

## WaveHack Progress

### Wave 1 (Completed) ✅

- Architecture design
- Smart contract development (4 contracts)
- FHE integration patterns
- Frontend with Next.js 16
- Wallet connection (wagmi)
- Interactive feature forms
- Result display with risk classification
- Sharing feature with permits
- Dashboard page with history
- Models transparency page
- Professional Sky Blue UI
- Multi-page navigation
- Zustand state management

### Wave 2 (Completed) ✅

- Deploy to Ethereum Sepolia testnet
- All 4 contracts deployed and verified
- Model initialized with v1.1 weights [-2, -3, 6, -2, -2, -1]
- Contract integration in frontend
- Transaction handling with wagmi
- Error handling and user feedback
- Loading states and progress indicators
- Network detection and switching
- Real on-chain inference execution
- Encrypted result handles from contract
- Result history persistence
- Deployment scripts with plain Hardhat/Ethers

### Wave 3 - Marathon (Completed) ✅

**Timeline:** April 8 - May 8

**Goals:** Production-ready FHE integration

#### Core Features

- **Real CoFHE Encryption** - Client-side ZK-proof encryption
  - Integrated `@cofhe/sdk` for encrypted `InEuint8` inputs
  - ZK proof generation handled by the CoFHE client SDK
  - Production CoFHE testnet communication on Sepolia
  - **Full Decryption Flow**
  - Self-permit creation and validation
  - Off-chain decrypt-to-view via the CoFHE threshold network
  - Client-side result display
  - **Enhanced Visualization**
  - Real-time encryption and transaction progress UI
  - Decryption status indicators
  - FHE handle visibility for verification
  - **Model Versioning**
  - Active v1.1.0 model registered on-chain
  - Model metadata and feature schema visible in the app
  - Result sharing and lender decrypt verification flow added

#### Technical Requirements

- `@cofhe/sdk` full integration
- Web Worker/ZK proof flow through the SDK
- Permit management system
- Threshold network integration
- Error recovery for decryption
- Bounded encrypted scoring to avoid unsigned underflow

### Wave 4 (Planned) 📋

**Timeline:** May 11 - May 20

**Goals:** B2B features and platform expansion

#### Features

- **Lender Dashboard**
  - B2B interface for financial institutions
  - Score verification requests
  - Shared result management
  - Institution authentication
- **Batch Inference**
  - Multiple assessments in one transaction
  - Batch result retrieval
  - Cost optimization
- **Model Marketplace**
  - Community model submissions
  - Model ratings and reviews
  - Governance for model approval
- **Analytics Layer**
  - Public model usage statistics
  - System health monitoring
  - Performance metrics

### Wave 5 (Planned) 📋

**Timeline:** May 23 - June 5

**Goals:** Mainnet and production

#### Features

- **Multi-chain Deployment**
  - Fhenix mainnet
  - Arbitrum One
  - Ethereum mainnet
- **Security Audit**
  - Professional smart contract audit
  - Frontend security review
  - Penetration testing
- **Documentation**
  - Developer API docs
  - Integration guides
  - User documentation
- **Reputation System**
  - Private financial identity
  - Historical score tracking
  - Identity aggregation

---

## Tech Stack


| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Blockchain      | Fhenix (FHE-enabled EVM)                          |
| Smart Contracts | Solidity 0.8.25 + @fhenixprotocol/cofhe-contracts |
| Frontend        | Next.js 16.2, React 18, TypeScript 6              |
| Styling         | Tailwind CSS (Sky Blue theme)                     |
| Web3            | wagmi 3.6, viem 2.48                              |
| Encryption      | @cofhe/sdk 0.5                                    |
| State           | Zustand 4.5                                       |
| Development     | Hardhat, npm workspaces                           |


---

## Getting Started

### Prerequisites

- Node.js 20.9+
- MetaMask or Web3 wallet
- Testnet ETH (Ethereum Sepolia)

### Installation

```bash
# Clone and install
cd sealedml
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your private key
```

### Deploy Contracts

```bash
cd contracts
npm run deploy:sepolia
```

### Update Frontend

After deployment, update `apps/web/.env.local` with addresses:

```env
NEXT_PUBLIC_MODEL_REGISTRY_ETH=<address>
NEXT_PUBLIC_SEALED_ML_ETH=<address>
NEXT_PUBLIC_RESULT_MANAGER_ETH=<address>
NEXT_PUBLIC_ACCESS_CONTROL_ETH=<address>
```

### Run Frontend

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Live App

Production deployment: [https://sealedml.vercel.app](https://sealedml.vercel.app)

Latest Vercel deployment: May 14, 2026.

---

## Deployed Contracts (Ethereum Sepolia)


| Contract          | Address                                      |
| ----------------- | -------------------------------------------- |
| ModelRegistry     | `0x1693D5B9F4865859A97322447eaB5151187499F1` |
| SealedMLInference | `0x9a40477EBbB85F2f82C4F9FB7809a2Bd11542760` |
| ResultManager     | `0xBc5364271B67C30d8d7a4608ED772D9fa5cB8740` |
| AccessControl     | `0x99C49AE558FeCD440f0e8df5B7c2787415f21B82` |

Latest deployment: May 14, 2026 on Ethereum Sepolia.

### Production Readiness Notes

- Contract input path uses CoFHE `InEuint8` encrypted structs generated by `@cofhe/sdk`.
- The inference contract stores encrypted score and risk-class handles, not plaintext results.
- `ResultManager` records each completed inference and supports on-chain selective sharing metadata with expiration.
- CoFHE decrypt sharing is granted from `SealedMLInference` with `FHE.allow`; direct ResultManager-only grants are blocked so metadata cannot imply decrypt access that does not exist.
- Frontend supports local encryption, permit-based decrypt-to-view, result history, and lender verification with actual shared-handle decryption.
- The browser may show an on-device estimate before submission, but final result cards only show decrypted output from a confirmed on-chain inference. If decryption fails, the app shows encrypted handles instead of a fallback score.
- Contract tests cover scoring, encrypted feature caps, sharing, expiry, revocation, and direct ResultManager grant rejection.


---

## Environment Variables

```env
# Private Key (for deployment only)
PRIVATE_KEY=your_private_key

# RPC URLs
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
BASE_SEPOLIA_RPC_URL=https://base-sepolia.publicnode.com

# Contract Addresses (auto-filled after deploy)
NEXT_PUBLIC_MODEL_REGISTRY_ETH=0x...
NEXT_PUBLIC_SEALED_ML_ETH=0x...
NEXT_PUBLIC_RESULT_MANAGER_ETH=0x...
NEXT_PUBLIC_ACCESS_CONTROL_ETH=0x...

# Browser wallet
# Use an injected wallet extension such as MetaMask on Sepolia.
```

---

## Where to Get API Keys

### Testnet ETH Faucets

- **Ethereum Sepolia**: [https://www.alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia)
- **Arbitrum Sepolia**: [https://www.alchemy.com/faucets/arbitrum-sepolia](https://www.alchemy.com/faucets/arbitrum-sepolia)
- **Base Sepolia**: [https://www.alchemy.com/faucets/base-sepolia](https://www.alchemy.com/faucets/base-sepolia)

### Etherscan API (Optional)

1. Go to [https://etherscan.io/apis](https://etherscan.io/apis)
2. Get free API key
3. Add to `.env`

---

## Security Principles

1. **Plaintext never required** - Core app never needs raw user data
2. **Encrypted computation** - Smart contracts operate on ciphertexts
3. **Deterministic logic** - Model logic is versioned
4. **Permissioned access** - Results controlled by user
5. **No privacy bottlenecks** - Off-chain services never touch raw data

---

## Future Vision

### Wave 5+ Roadmap

1. **🌐 Private AI Marketplace**
  - Upload and run private models
  - Model versioning and governance
  - Community model submissions
2. **🏦 DeFi Integration**
  - Direct lending protocol connectors
  - Aave, Compound integration
  - Automated collateral assessment
3. **📜 Compliance Layer**
  - KYC without revealing identity
  - Regulatory reporting
  - Audit trails without data exposure
4. **🔗 Cross-chain Identity**
  - Same score usable across chains
  - Bridge attestation
  - Multi-chain verification
5. **🤝 B2B API**
  - REST API for institutions
  - Webhook notifications
  - Rate-limited access

---

## Resources

- [CoFHE Documentation](https://cofhe-docs.fhenix.zone/)
- [CoFHE Client SDK](https://cofhe-docs.fhenix.zone/client-sdk/introduction/overview)
- [CoFHE FHE Library](https://cofhe-docs.fhenix.zone/fhe-library/introduction/overview)
- [WaveHack Buildathon](https://fhenix.io/wavehack)
- [Fhenix GitHub](https://github.com/FhenixProtocol)
- [Awesome Fhenix](https://github.com/FhenixProtocol/awesome-fhenix)

---

## Built For

**WaveHack - Privacy-by-Design Buildathon**

> "The window for privacy-native architecture is open. This program is for founders who want to build it in from day one — not retrofit it later."

---

## License

MIT

---

## Quick Summary


| Question             | Answer                                              |
| -------------------- | --------------------------------------------------- |
| **What is it?**      | AI that works on your data without seeing it        |
| **What does it do?** | Gives credit scores without exposing financial data |
| **How?**             | FHE encryption + on-chain computation               |
| **Who benefits?**    | Users, DeFi protocols, institutions                 |
| **Tech?**            | Fhenix, Solidity, Next.js                           |
| **Status?**          | Wave 3 complete; production testnet MVP live        |
| **Testnet?**         | ✅ Deployed on Ethereum Sepolia                      |


---

**SealedML: Private AI for Everyone.**
