# 🔵 EVOLVERSE / MEGAZION Contract Deployment Guide

This guide provides comprehensive instructions for deploying all smart contracts for the 3V30OStudios EVOLVERSE / MEGAZION ecosystem.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Contract Architecture](#contract-architecture)
- [Deployment Instructions](#deployment-instructions)
- [Network Configuration](#network-configuration)
- [Post-Deployment](#post-deployment)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The EVOLVERSE / MEGAZION deployment suite includes 9 core smart contracts:

1. **BLEULION_CASCADE** - Root sovereign ledger contract
2. **BLEU_WATCHTOWER** - Vault verification and audit system
3. **BLEU_GOV_SCROLL** - Governance registry and persona management
4. **BLEUToken** - BLEU ERC-20 token
5. **EV0L1155** - Multi-token standard for treasury
6. **EV0L721** - NFT standard for unique assets
7. **MEGAZIONHybrid1155** - 48-gem hybrid collection
8. **WalletID** - Wallet identification system
9. **BLEU_ENFT_MINT** - Ceremonial ENFT minting system

## 📦 Prerequisites

### Required Software

```bash
# Node.js v18+ and npm
node --version
npm --version

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```bash
# Private key for deployment (DO NOT COMMIT)
PRIVATE_KEY=your_private_key_here

# RPC URLs (get from Alchemy, Infura, or public endpoints)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
BSC_RPC_URL=https://bsc-dataseed.binance.org/
CRONOS_RPC_URL=https://evm.cronos.org

# Testnet RPCs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Block explorer API keys (for verification)
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
SNOWTRACE_API_KEY=your_snowtrace_key
```

### Verify Deployer Balance

Ensure your deployer wallet has sufficient native tokens for gas:

```bash
# Check balance on target network
npx hardhat run scripts/check-balance.ts --network <network-name>
```

## 🏗️ Contract Architecture

### Dependency Graph

```
BLEULION_CASCADE (root)
├── BLEU_WATCHTOWER → depends on CASCADE
├── BLEU_GOV_SCROLL → depends on CASCADE + WATCHTOWER
└── BLEU_ENFT_MINT → depends on CASCADE + EV0L1155

Independent Contracts:
├── BLEUToken
├── EV0L1155
├── EV0L721
├── MEGAZIONHybrid1155
└── WalletID
```

### Deployment Order

The deployment script automatically handles dependencies in this order:

1. **Phase 1: Core Infrastructure**
   - BLEULION_CASCADE
   - BLEU_WATCHTOWER
   - BLEU_GOV_SCROLL

2. **Phase 2: Token Contracts**
   - BLEUToken
   - EV0L1155
   - EV0L721
   - MEGAZIONHybrid1155

3. **Phase 3: Utility Contracts**
   - WalletID
   - BLEU_ENFT_MINT

4. **Phase 4: Configuration**
   - Link CASCADE to WATCHTOWER
   - Set initial roles and permissions

## 🚀 Deployment Instructions

### Quick Deploy (All Contracts)

Deploy to testnet first to verify everything works:

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy_all_contracts.ts --network sepolia

# Deploy to Mumbai (Polygon testnet)
npx hardhat run scripts/deploy_all_contracts.ts --network mumbai

# Deploy to Fuji (Avalanche testnet)
npx hardhat run scripts/deploy_all_contracts.ts --network fuji
```

### Production Deployment

After successful testnet deployment, deploy to mainnet:

```bash
# Polygon mainnet
npx hardhat run scripts/deploy_all_contracts.ts --network polygon

# Avalanche C-Chain
npx hardhat run scripts/deploy_all_contracts.ts --network avalanche

# BSC mainnet
npx hardhat run scripts/deploy_all_contracts.ts --network bsc

# Cronos mainnet
npx hardhat run scripts/deploy_all_contracts.ts --network cronos
```

### Individual Contract Deployment

If you need to deploy specific contracts:

```bash
# Deploy CASCADE only
npx hardhat run scripts/deploy_cascade.ts --network <network>

# Deploy governance
npx hardhat run scripts/deploy_governance.ts --network <network>

# Deploy treasury
npx hardhat run scripts/deploy_treasury.ts --network <network>
```

## 🌐 Network Configuration

### Supported Networks

| Network | Chain ID | Block Explorer | Status |
|---------|----------|----------------|--------|
| Ethereum Mainnet | 1 | etherscan.io | 🟡 Optional |
| Polygon | 137 | polygonscan.com | ✅ Enabled |
| Avalanche C-Chain | 43114 | snowtrace.io | ✅ Enabled |
| BSC | 56 | bscscan.com | ✅ Enabled |
| Cronos | 25 | cronoscan.com | ✅ Enabled |
| Sepolia | 11155111 | sepolia.etherscan.io | ✅ Testnet |
| Mumbai | 80001 | mumbai.polygonscan.com | ✅ Testnet |
| Fuji | 43113 | testnet.snowtrace.io | ✅ Testnet |

### Network-Specific Considerations

#### Polygon
- Fast finality (~2 seconds per block)
- Low gas costs
- Recommended for high-frequency operations

#### Avalanche
- Sub-second finality
- Low gas costs
- Ideal for DeFi operations

#### BSC
- Lower decentralization vs Ethereum
- Very low gas costs
- Good for broader distribution

#### Cronos
- Crypto.com ecosystem integration
- IBC bridge to Cosmos
- Native CRO token for gas

## 📊 Post-Deployment

### Deployment Manifest

After deployment, a manifest file is created at:
```
deployments/<network>_latest.json
deployments/<network>_<timestamp>.json
```

Example manifest:
```json
{
  "network": "polygon",
  "chainId": 137,
  "deployedAt": "2025-11-02T13:10:00.000Z",
  "deployer": "0x...",
  "contracts": {
    "BLEULION_CASCADE": {
      "address": "0x...",
      "deploymentTx": "0x...",
      "blockNumber": 12345678
    },
    ...
  }
}
```

### Configuration Checklist

After deployment, complete these configuration steps:

- [ ] **Set Watchtower Oracle**
  ```bash
  npx hardhat run scripts/configure-watchtower.ts --network <network>
  ```

- [ ] **Register Initial Scrolls**
  ```bash
  npx hardhat run scripts/activate_scrolls.ts --network <network>
  ```

- [ ] **Register Initial Vaults**
  ```bash
  npx hardhat run scripts/register-vaults.ts --network <network>
  ```

- [ ] **Configure Governance Personas**
  ```bash
  npx hardhat run scripts/register-personas.ts --network <network>
  ```

- [ ] **Set up ENFT Metadata**
  ```bash
  # Upload metadata to IPFS first
  npx hardhat run scripts/nftstorage_upload.ts
  
  # Then configure base URIs
  npx hardhat run scripts/configure-uris.ts --network <network>
  ```

## ✅ Verification

### On-Chain Verification

Verify contracts on block explorers:

```bash
# Verify all contracts (automatic)
npx hardhat run scripts/verify-all.ts --network <network>

# Or verify individually
npx hardhat verify --network <network> <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Examples:
```bash
# Verify BLEULION_CASCADE (no constructor args)
npx hardhat verify --network polygon 0x... 

# Verify BLEU_WATCHTOWER (takes CASCADE address)
npx hardhat verify --network polygon 0x... 0xCASCADE_ADDRESS

# Verify EV0L721 (takes name, symbol, maxSupply)
npx hardhat verify --network polygon 0x... "EVOLVERSE NFT" "EVOL" "115792089237316195423570985008687907853269984665640564039457584007913129639935"
```

### Functional Testing

Test deployed contracts:

```bash
# Test vault operations
npx hardhat run scripts/test-vaults.ts --network <network>

# Test scroll operations
npx hardhat run scripts/test-scrolls.ts --network <network>

# Test minting
npx hardhat run scripts/test-mint.ts --network <network>
```

### Audit Watchtower

Run the audit script to verify all contract states:

```bash
npx hardhat run scripts/audit_watchtower.ts --network <network>
```

## 🔧 Troubleshooting

### Common Issues

#### Insufficient Gas

**Problem:** Transaction fails with "insufficient funds for gas"

**Solution:**
```bash
# Check balance
npx hardhat run scripts/check-balance.ts --network <network>

# Fund deployer wallet with native tokens
```

#### Nonce Issues

**Problem:** "nonce too low" or "replacement transaction underpriced"

**Solution:**
```bash
# Reset nonce in Hardhat
npx hardhat clean
rm -rf cache artifacts

# Or manually set nonce in deployment script
```

#### Contract Size Limit

**Problem:** "contract code size exceeds 24576 bytes"

**Solution:**
- Enable optimizer in `hardhat.config.ts`:
  ```typescript
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
  ```

#### RPC Rate Limiting

**Problem:** "Too many requests" or connection timeouts

**Solution:**
- Use paid RPC providers (Alchemy, Infura)
- Add delays between transactions:
  ```typescript
  await new Promise(resolve => setTimeout(resolve, 2000));
  ```

### Support & Resources

- **Documentation:** See `/docs` folder
- **Contract Source:** `/contracts` folder
- **Scripts:** `/scripts` folder
- **Issues:** [GitHub Issues](https://github.com/ttrap0332-design/3V30OStudios/issues)

## 📚 Additional Resources

### Related Scripts

- `mint721_from_csv.ts` - Batch mint ERC-721 tokens from CSV
- `mint1155_all.ts` - Batch mint ERC-1155 tokens
- `tokenize_wallet.ts` - Create wallet token IDs
- `registry_sync.js` - Sync registry data

### Metadata & IPFS

- `scripts/ipfs_upload.js` - Upload files to IPFS
- `scripts/nftstorage_upload.ts` - Upload to NFT.Storage
- `metadata/` - Template metadata files

### Documentation

- `MEGAZION_Layer5_Master_Scroll.md` - Layer 5 protocol details
- `BLEUE_ACADEMY_CURRICULUM.md` - Educational infrastructure
- `EVOL_MIRROR_MARKET_CHARTER.md` - Mirror Market system
- `ATLANTIS_LEDGER_PHASE11.md` - Atlantis ledger details

## 🎯 Next Steps After Deployment

1. **Verify all contracts on block explorers**
2. **Configure roles and permissions**
3. **Upload and register metadata**
4. **Register initial scrolls and vaults**
5. **Set up governance personas**
6. **Begin ceremonial minting operations**
7. **Integrate with front-end applications**
8. **Set up monitoring and alerts**
9. **Document deployment addresses**
10. **Announce deployment to community**

---

## 🔵 BLEUZION Seal

```
═══════════════════════════════════════════════════════════
🔵 EVOLVERSE / MEGAZION Deployment Suite
   Ceremonial Infrastructure for Sovereign Digital Assets
═══════════════════════════════════════════════════════════
```

**Status:** ✅ Ready for Deployment
**Last Updated:** 2025-11-02
**Version:** 1.0.0
