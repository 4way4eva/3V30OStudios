# 🔵 3V30OStudios Contract Deployment System

## Overview

This repository contains a complete smart contract deployment system for the EVOLVERSE / MEGAZION ecosystem. Deploy all 9 core contracts with a single command across multiple blockchain networks.

## 🚀 Quick Start

### 1. Setup (30 seconds)

```bash
./scripts/setup-deployment.sh
```

This will:
- Install all dependencies
- Create `.env` configuration file
- Compile all contracts
- Verify your environment

### 2. Configure (2 minutes)

Edit `.env` file with your credentials:

```env
# Required: Deployer wallet private key (without 0x)
PRIVATE_KEY=your_private_key_here

# Required: RPC URL for target network
POLYGON_RPC_URL=https://polygon-rpc.com
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Optional: For contract verification
POLYGONSCAN_API_KEY=your_key
SNOWTRACE_API_KEY=your_key
```

### 3. Check Balance (10 seconds)

```bash
npx hardhat run scripts/check-balance.ts --network polygon
```

### 4. Deploy! (2 minutes)

```bash
npx hardhat run scripts/deploy_all_contracts.ts --network polygon
```

### 5. Verify (Optional)

```bash
npx hardhat run scripts/verify-all.ts --network polygon
```

## 📦 What Gets Deployed

| # | Contract | Purpose | Dependencies |
|---|----------|---------|--------------|
| 1 | **BLEULION_CASCADE** | Root sovereign ledger | None |
| 2 | **BLEU_WATCHTOWER** | Audit & verification | CASCADE |
| 3 | **BLEU_GOV_SCROLL** | Governance registry | CASCADE, WATCHTOWER |
| 4 | **BLEUToken** | ERC-20 token | None |
| 5 | **EV0L1155** | Multi-token standard | None |
| 6 | **EV0L721** | NFT standard | None |
| 7 | **MEGAZIONHybrid1155** | 48-gem collection | None |
| 8 | **WalletID** | Wallet identification | None |
| 9 | **BLEU_ENFT_MINT** | Ceremonial minting | CASCADE, EV0L1155 |

## 🌐 Supported Networks

### Mainnets

```bash
# Polygon (Low gas, fast finality)
npx hardhat run scripts/deploy_all_contracts.ts --network polygon

# Avalanche C-Chain (Sub-second finality)
npx hardhat run scripts/deploy_all_contracts.ts --network avalanche

# BSC (Very low gas)
npx hardhat run scripts/deploy_all_contracts.ts --network bsc

# Cronos (Crypto.com ecosystem)
npx hardhat run scripts/deploy_all_contracts.ts --network cronos

# Ethereum (Most decentralized)
npx hardhat run scripts/deploy_all_contracts.ts --network mainnet
```

### Testnets (Recommended First!)

```bash
# Ethereum Sepolia
npx hardhat run scripts/deploy_all_contracts.ts --network sepolia

# Polygon Mumbai
npx hardhat run scripts/deploy_all_contracts.ts --network mumbai

# Avalanche Fuji
npx hardhat run scripts/deploy_all_contracts.ts --network fuji
```

## 📊 Deployment Output

After deployment, you'll find:

### 1. Console Output
```
═══════════════════════════════════════════════════════════
✅ All Contracts Deployed Successfully!
═══════════════════════════════════════════════════════════

📋 Deployment Summary:

   BLEULION_CASCADE          0x1234...
   BLEU_WATCHTOWER          0x5678...
   BLEU_GOV_SCROLL          0x9abc...
   ...
```

### 2. Deployment Manifest

Location: `deployments/<network>_latest.json`

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
    }
  }
}
```

### 3. Network Manifest

Location: `config/network_manifest.json`

Unified manifest tracking all deployments across all networks.

## 🛠️ Available Scripts

```bash
# Deploy all contracts
npm run deploy:all -- --network polygon

# Deploy specific contracts
npm run deploy:cascade -- --network polygon
npm run deploy:governance -- --network polygon
npm run deploy:treasury -- --network polygon

# Check deployer balance
npx hardhat run scripts/check-balance.ts --network polygon

# Verify all contracts
npx hardhat run scripts/verify-all.ts --network polygon

# Compile contracts
npm run compile

# Clean build artifacts
npm run clean
```

## 🎯 Post-Deployment Configuration

After deployment, configure your contracts:

### 1. Register Initial Scrolls

```bash
npx hardhat run scripts/activate_scrolls.ts --network polygon
```

### 2. Register Vaults

```bash
npx hardhat run scripts/register-vaults.ts --network polygon
```

### 3. Configure Governance Personas

```bash
npx hardhat run scripts/register-personas.ts --network polygon
```

### 4. Upload Metadata to IPFS

```bash
npx hardhat run scripts/nftstorage_upload.ts
```

### 5. Set Token URIs

```bash
npx hardhat run scripts/configure-uris.ts --network polygon
```

## 📚 Documentation

- **[QUICKSTART_DEPLOYMENT.md](./QUICKSTART_DEPLOYMENT.md)** - 5-minute quick start
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide (10,000+ words)
- **[contracts/](./contracts/)** - Smart contract source code
- **[scripts/](./scripts/)** - Deployment and utility scripts

## 🔧 Troubleshooting

### Common Issues

**Problem:** "insufficient funds for gas"
```bash
# Check balance
npx hardhat run scripts/check-balance.ts --network polygon
# Fund your wallet and retry
```

**Problem:** "nonce too low"
```bash
# Clean cache
npm run clean
# Wait 30 seconds and retry
```

**Problem:** "Already Verified"
```
# This is fine! Contract was already verified
```

**Problem:** RPC connection issues
```
# Use alternative RPC URLs in .env
# Or get API keys from Alchemy/Infura
```

## ⚡ Advanced Usage

### Custom Gas Prices

Edit `hardhat.config.ts`:

```typescript
polygon: {
  gasPrice: 50000000000, // 50 gwei
}
```

### Deploy to Custom Network

Add to `hardhat.config.ts`:

```typescript
customNetwork: {
  url: "https://your-rpc-url.com",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 12345,
}
```

### Batch Operations

Deploy to multiple networks:

```bash
for network in sepolia mumbai fuji; do
  echo "Deploying to $network..."
  npx hardhat run scripts/deploy_all_contracts.ts --network $network
done
```

## 🔐 Security Notes

1. **Never commit `.env` file** - It contains your private key
2. **Use testnet first** - Test on Sepolia/Mumbai/Fuji before mainnet
3. **Verify balance** - Ensure sufficient funds before deployment
4. **Backup manifests** - Keep deployment manifests for reference
5. **Multi-sig for production** - Use multi-signature wallets for contract ownership

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ttrap0332-design/3V30OStudios/issues)
- **Docs:** See `docs/` folder
- **Scripts:** See `scripts/` folder

## 🎓 Learn More

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js](https://docs.ethers.org/)

---

## 🔵 BLEUZION Seal

```
═══════════════════════════════════════════════════════════
🔵 EVOLVERSE / MEGAZION Deployment System
   Ceremonial Infrastructure for Sovereign Digital Assets
═══════════════════════════════════════════════════════════
```

**Status:** ✅ Ready for Deployment  
**Version:** 1.0.0  
**Last Updated:** 2025-11-02
