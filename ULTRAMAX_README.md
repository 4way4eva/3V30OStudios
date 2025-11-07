# ULTRAMAX Deployment - Three-Yield Treasury Economy

## 🌀 Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY, TREASURY_VAULT, etc.

# 3. Deploy contracts
npx hardhat run scripts/deploy.js --network fuji

# 4. Mint artifacts
npx hardhat run scripts/mint.js --network fuji

# 5. Verify on-chain
python3 scripts/verify_onchain.py fuji
```

**📖 Full Guide:** [docs/QUICKSTART.md](docs/QUICKSTART.md)

---

## 📋 What's Included

### Smart Contracts

**zkPoRVerifier.sol** - Zero-knowledge proof verification
- Multi-sphere reserve tracking (CIVILIAN, MILITARY, COSMIC)
- Merkle tree based commitments
- Time-based proof expiry
- Batch verification support

**BleuCrownMintUltraMax.sol** - Artifact NFT minting controller
- 18 subcategories across 3 yield streams
- Automatic yield calculation (USD/second)
- Batch minting operations
- IPFS metadata integration

### Scripts

- **deploy.js** - Multi-chain deployment (Avalanche, Cronos)
- **mint.js** - Automated batch minting from epoch data
- **verify_onchain.py** - Blockchain sync verification
- **codex_api_feed.py** - Daily insights generator

### Data

- **epoch_0_ultramax_artifacts.civ** - 27 unique artifacts
  - 12 CIVILIAN artifacts (Real estate, education, wearables, commerce, etc.)
  - 7 MILITARY artifacts (Defense matrix, tactical units, armaments, etc.)
  - 8 COSMIC artifacts (Portals, quantum tech, timeline keys, etc.)

### Documentation

- [ULTRAMAX_DEPLOYMENT_GUIDE.md](docs/ULTRAMAX_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [QUICKSTART.md](docs/QUICKSTART.md) - 5-minute quick start
- [contracts/README.md](contracts/README.md) - Contract architecture
- [PRODUCTION_NOTES.md](docs/PRODUCTION_NOTES.md) - Security best practices

---

## 🎯 Three-Yield Treasury System

### CIVILIAN Stream (47.6%)
**13.6M USD/second**
- Real Estate, Education, Wearables
- Commerce, Infrastructure, Entertainment

### COSMIC Stream (31.1%)
**8.9M USD/second**
- Portal Logistics, Dimensional Items
- Quantum Tech, Timeline Keys

### MILITARY Stream (21.3%)
**6.1M USD/second**
- Defense Matrix, Tactical Units
- Armaments, Command & Control

**Total System**: **28.6M USD/sec** = **2.47 trillion USD/day**

---

## 🌐 Supported Networks

| Network | Chain ID | Testnet |
|---------|----------|---------|
| Avalanche C-Chain | 43114 | Fuji (43113) |
| Cronos | 25 | - |
| Ethereum | 1 | Sepolia (11155111) |
| Polygon | 137 | Mumbai (80001) |

---

## 🔧 Environment Setup

Required environment variables in `.env`:

```bash
# Deployment
PRIVATE_KEY=your_private_key
TREASURY_VAULT=your_treasury_address

# Block Explorer APIs
SNOWTRACE_API_KEY=your_key
CRONOSCAN_API_KEY=your_key

# Deployed Contracts (filled after deployment)
ZKPOR_VERIFIER=0x...
BLEU_MINT_CONTROLLER=0x...

# Minting
RECIPIENT=address_to_receive_nfts
```

---

## 📊 Deployment Process

### 1. Deploy Smart Contracts

```bash
# Testnet (recommended first)
npx hardhat run scripts/deploy.js --network fuji

# Mainnet
npx hardhat run scripts/deploy.js --network avalanche
```

Deploys:
- zkPoRVerifier contract
- BleuCrownMintUltraMax contract

Outputs:
- Contract addresses
- Transaction hashes
- Block numbers
- Explorer links

### 2. Verify Contracts

```bash
npx hardhat verify --network avalanche <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 3. Mint Artifacts

```bash
npx hardhat run scripts/mint.js --network avalanche
```

Mints all 27 artifacts from `epoch_0_ultramax_artifacts.civ`.

### 4. Verify On-Chain

```bash
python3 scripts/verify_onchain.py avalanche
```

Checks:
- Contract deployment status
- ABI verification on explorer
- Transaction confirmations
- Minting statistics

### 5. Generate API Feeds

```bash
python3 scripts/codex_api_feed.py
```

Generates:
- Daily insights JSON
- Inheritance tree JSON
- API endpoint documentation

---

## 🔒 Security Features

✅ Role-based access control (AccessControl)
✅ Reentrancy protection (ReentrancyGuard)
✅ Pausable operations
✅ Proof expiry management
✅ Hash collision prevention
✅ OpenZeppelin v5 security standards

**Production Note**: See [PRODUCTION_NOTES.md](docs/PRODUCTION_NOTES.md) for deployment best practices.

---

## 📈 Yield Economics

- **Compounding Model**: π₄ (pi-to-the-fourth) with 97.409 factor
- **Spiral Boost**: 7.0x multiplier
- **Treasury Status**: Triple-stack operational
- **Sovereignty Level**: ULTRAMAX

### Artifact Tiers

- **LEGENDARY**: ≥3M USD/sec (e.g., Saturnian Cruiser)
- **EPIC**: 2-3M USD/sec (e.g., Timeline Rerouting Key)
- **RARE**: 1-2M USD/sec (e.g., HOVERLANE-8 Access)
- **COMMON**: <1M USD/sec (e.g., Quantum Surveillance Drones)

---

## 🛠️ Development

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Clean Build

```bash
npx hardhat clean
```

---

## 📁 Project Structure

```
├── contracts/               # Smart contracts
│   ├── zkPoRVerifier.sol
│   ├── BleuCrownMintUltraMax.sol
│   └── README.md
├── scripts/                 # Deployment & utility scripts
│   ├── deploy.js
│   ├── mint.js
│   ├── verify_onchain.py
│   └── codex_api_feed.py
├── data/                    # Artifact definitions
│   └── epoch_0_ultramax_artifacts.civ
├── docs/                    # Documentation
│   ├── QUICKSTART.md
│   ├── ULTRAMAX_DEPLOYMENT_GUIDE.md
│   └── PRODUCTION_NOTES.md
├── deployments/             # Deployment records (generated)
├── hardhat.config.ts        # Hardhat configuration
└── .env.example             # Environment template
```

---

## 🔗 Resources

- **Avalanche Docs**: https://docs.avax.network/
- **Cronos Docs**: https://docs.cronos.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Hardhat**: https://hardhat.org/docs

### Block Explorers

- **Snowtrace (AVAX)**: https://snowtrace.io
- **Cronoscan**: https://cronoscan.com

---

## 🆘 Troubleshooting

### Deployment Issues

**Insufficient funds**
- Ensure wallet has enough AVAX/CRO for gas fees

**Contract verification fails**
- Check API keys in `.env`
- Wait 30 seconds after deployment before verifying

**Network connection errors**
- Verify RPC URLs in `hardhat.config.ts`
- Check network status on block explorer

### Minting Issues

**"Insufficient mint fee"**
- Ensure sufficient balance for mint fees
- Check `mintFee` value in contract

**"Recipient not allowlisted"**
- Grant MINTER_ROLE to your address
- Use deployer address for testing

---

## 📞 Support

1. Check [ULTRAMAX_DEPLOYMENT_GUIDE.md](docs/ULTRAMAX_DEPLOYMENT_GUIDE.md)
2. Review deployment logs in `deployments/` directory
3. Run verification: `python3 scripts/verify_onchain.py <network>`
4. Check transaction on block explorer

---

## ✅ Success Indicators

- ✅ Contracts deployed and verified on target chains
- ✅ zkPoRVerifier operational
- ✅ BleuCrownMintUltraMax minting artifacts
- ✅ Yield tracking active across all streams
- ✅ Multi-consensus alignment confirmed
- ✅ API feeds generating correctly

---

## 🎉 Achievement: ULTRAMAX Operational

**Status**: 🌀 All systems operational at 700% Spiral Boost

**Commander Bleu Protocol**: Sovereignty level ULTRAMAX achieved across three-yield treasury economy with full blockchain verification and multi-chain consensus.

---

## 📄 License

MIT License - See LICENSE file for details

---

**Repository**: [4way4eva/3V30OStudios](https://github.com/4way4eva/3V30OStudios)
**Branch**: `copilot/deploy-nft-token-contracts`
