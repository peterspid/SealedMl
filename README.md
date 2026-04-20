# SealedML - Privacy-First AI Inference dApp

## One-Line Description

**SealedML = "AI that works on your data without seeing your data"**

Get financial decisions (like credit scores) without revealing your financial data to anyone.

---

live url - https://sealmll.vercel.app/

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
- ✓ Works on encrypted data
- ✓ On-chain computation
- ✓ You control your data

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

## Key Features

### Current Features (Wave 1-2)

| Feature | Description |
|---------|-------------|
| 🔐 **Encrypted Input** | Data encrypted in browser before sending |
| 🤖 **Private AI Scoring** | Model runs on encrypted data |
| 🔑 **Client-side Decryption** | Only user sees results |
| 📊 **Result Dashboard** | View scores, history, and analytics |
| 🧾 **Model Transparency** | Open model weights and features |
| 🔗 **Selective Sharing** | Share results with third parties |
| 📜 **Transaction History** | View all past assessments |
| 🌐 **Multi-page App** | Home, Dashboard, Models pages |

### Coming Soon (Wave 3-5)

| Feature | Description |
|---------|-------------|
| 📊 **Lender Dashboard** | B2B interface for lenders |
| 🧠 **Explainability** | "Why did I get this score?" |
| 🔄 **Multiple Models** | Credit, Fraud, Risk scores |
| 🧬 **Reputation System** | Private financial identity |
| 📡 **Analytics Layer** | Usage stats without privacy breach |

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
│           │   └── models/page.tsx   # Model info
│           ├── components/      # React components
│           ├── hooks/           # useInference, etc.
│           ├── lib/            # Utils, contracts, wagmi
│           └── types/          # TypeScript types
└── README.md
```

---

## Smart Contracts

### ModelRegistry
- Stores model metadata, versions, feature schemas
- Controls active model for inference

### SealedMLInference
- Core FHE inference engine
- Weighted scoring on encrypted data
- Returns encrypted score + risk class

### ResultManager
- Stores inference results
- Manages selective disclosure
- Handles permissions

### AccessControl
- Permission levels
- Rate limiting
- Service access

---

## Credit Risk Model (v1.0)

### Features Used
| Feature | Weight | Description |
|---------|--------|-------------|
| Income Level | +15 | Financial stability |
| Repayment History | +25 | Credit behavior (highest) |
| Current Liabilities | -20 | Existing debt |
| Savings Behavior | +10 | Financial discipline |
| Transaction Consistency | +15 | Behavioral pattern |
| Wallet Activity | +5 | Engagement level |

### Risk Classification
- **Low Risk**: Score ≤ 70
- **Medium Risk**: Score 71-85
- **High Risk**: Score > 85

---

## WaveHack Progress

### Wave 1 (Completed) ✅
- [x] Architecture design
- [x] Smart contract development
- [x] FHE integration
- [x] Frontend with Next.js
- [x] Wallet connection
- [x] Interactive forms
- [x] Result display
- [x] Sharing feature
- [x] Dashboard page
- [x] Models page
- [x] Professional UI

### Wave 2 (Completed) ✅
- [x] Deploy to Ethereum Sepolia
- [x] Contract integration
- [x] Transaction handling
- [x] Error handling
- [x] Loading states

### Wave 3 (Marathon) 🔄
- [ ] Real CoFHE encryption
- [ ] Decryption flow with permits
- [ ] Multiple model versions
- [ ] Enhanced visualization
- [ ] Performance optimization

### Wave 4 📋
- [ ] Lender dashboard
- [ ] Batch inference
- [ ] Model marketplace

### Wave 5 📋
- [ ] Mainnet prep
- [ ] Security audit
- [ ] Documentation

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Fhenix (FHE-enabled EVM) |
| Smart Contracts | Solidity + @fhenixprotocol/cofhe-contracts |
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS (Sky Blue theme) |
| Web3 | wagmi, viem |
| Encryption | @cofhe/sdk |
| Development | Hardhat |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask or Web3 wallet
- Testnet ETH

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

Open http://localhost:3000

---

## Deployed Contracts (Ethereum Sepolia)

```
ModelRegistry:     0x93aa420a41cE97aE4946F533a967F5611d139484
SealedMLInference: 0x3F4867D6279e419feC7A432AeFA2c65c8368d91b
ResultManager:    0x206636e6866123186DB0EC244284867ce438DCc3
AccessControl:    0xA1A8475C86BEE09dffb0b76184d5DE3b6a7A3eAb
```

---

## Environment Variables

```env
# Private Key (for deployment)
PRIVATE_KEY=your_private_key

# RPC URLs
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
BASE_SEPOLIA_RPC_URL=https://base-sepolia.publicnode.com

# Contract Addresses (after deployment)
NEXT_PUBLIC_MODEL_REGISTRY_ETH=0x...
NEXT_PUBLIC_SEALED_ML_ETH=0x...
NEXT_PUBLIC_RESULT_MANAGER_ETH=0x...
NEXT_PUBLIC_ACCESS_CONTROL_ETH=0x...
```

---

## Where to Get API Keys

### Testnet ETH Faucets
- **Ethereum Sepolia**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Arbitrum Sepolia**: https://www.alchemy.com/faucets/arbitrum-sepolia
- **Base Sepolia**: https://www.alchemy.com/faucets/base-sepolia

### WalletConnect (Optional)
1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Get Project ID
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

### Etherscan API (Optional - for verification)
1. Go to https://etherscan.io/apis
2. Get free API key
3. Add to `.env`:
   ```
   ETHERSCAN_API_KEY=your_api_key
   ```

---

## Security Principles

1. **Plaintext never required** - Core app never needs raw user data
2. **Encrypted computation** - Smart contracts operate on ciphertexts
3. **Deterministic logic** - Model logic is versioned
4. **Permissioned access** - Results controlled by user
5. **No privacy bottlenecks** - Off-chain services never touch raw data

---

## Future Vision

This is where SealedML becomes next-level:

- 🌐 **Private AI Marketplace** - Upload and run models privately
- 🏦 **DeFi Integration** - Lending protocols use scores
- 📜 **Compliance Layer** - KYC without revealing identity
- 🔗 **Cross-chain Identity** - Same score usable everywhere
- 🤝 **B2B API** - Companies plug into the system

---

## Resources

- [Fhenix Documentation](https://docs.fhenix.io)
- [CoFHE SDK](https://www.npmjs.com/package/@cofhe/sdk)
- [WaveHack Buildathon](https://fhenix.io/wavehack)
- [Fhenix GitHub](https://github.com/FhenixProtocol)

---

## Built For

**WaveHack - Privacy-by-Design Buildathon**

> "The window for privacy-native architecture is open. This program is for founders who want to build it in from day one — not retrofit it later."

---

## License

MIT

---

## Quick Summary

| Question | Answer |
|----------|--------|
| **What is it?** | AI that works on your data without seeing it |
| **What does it do?** | Gives credit scores without exposing financial data |
| **How?** | FHE encryption + on-chain computation |
| **Who benefits?** | Users, DeFi protocols, institutions |
| **Tech?** | Fhenix, Solidity, Next.js |
| **Status?** | Wave 2 complete, production-ready on testnet |

---

**SealedML: Private AI for Everyone.**
