# ⚡ Quick Start: Contract Deployment

Get your EVOLVERSE / MEGAZION contracts deployed in 5 minutes.

## 🚀 Fastest Path to Deployment

### Step 1: Setup (30 seconds)

```bash
# Clone and navigate to repo (if not already)
cd 3V30OStudios

# Run automated setup
./scripts/setup-deployment.sh
```

### Step 2: Configure Environment (2 minutes)

Edit `.env` file:

```bash
nano .env  # or use your preferred editor
```

**Minimum required:**
```env
PRIVATE_KEY=your_private_key_without_0x

# Choose one network RPC URL:
POLYGON_RPC_URL=https://polygon-rpc.com
# or
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
# or  
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

**Optional for verification:**
```env
POLYGONSCAN_API_KEY=your_key
SNOWTRACE_API_KEY=your_key
```

### Step 3: Check Balance (10 seconds)

```bash
# Replace 'polygon' with your target network
npx hardhat run scripts/check-balance.ts --network polygon
```

**Need funds?**
- Testnet: Use faucets (search "\<network\> faucet")
- Mainnet: Transfer from exchange

### Step 4: Deploy! (2 minutes)

```bash
# Deploy all contracts
npx hardhat run scripts/deploy_all_contracts.ts --network polygon
```

**This will:**
- ✅ Deploy all 9 contracts in order
- ✅ Link dependencies automatically  
- ✅ Save deployment manifest
- ✅ Display all contract addresses

### Step 5: Verify (Optional, 1 minute)

```bash
# Verify on block explorer
npx hardhat run scripts/verify-all.ts --network polygon
```

## 📋 What Gets Deployed

| Contract | Purpose |
|----------|---------|
| BLEULION_CASCADE | Root ledger & registry |
| BLEU_WATCHTOWER | Audit & verification |
| BLEU_GOV_SCROLL | Governance system |
| BLEUToken | ERC-20 token |
| EV0L1155 | Multi-token treasury |
| EV0L721 | NFT collection |
| MEGAZIONHybrid1155 | 48-gem collection |
| WalletID | Wallet identification |
| BLEU_ENFT_MINT | Ceremonial minting |

## 🌐 Network Quick Reference

### Testnets (Recommended First)

```bash
# Ethereum Sepolia
npx hardhat run scripts/deploy_all_contracts.ts --network sepolia

# Polygon Mumbai  
npx hardhat run scripts/deploy_all_contracts.ts --network mumbai

# Avalanche Fuji
npx hardhat run scripts/deploy_all_contracts.ts --network fuji
```

### Mainnets

```bash
# Polygon (Low gas, fast)
npx hardhat run scripts/deploy_all_contracts.ts --network polygon

# Avalanche (Very fast)
npx hardhat run scripts/deploy_all_contracts.ts --network avalanche

# BSC (Very low gas)
npx hardhat run scripts/deploy_all_contracts.ts --network bsc

# Cronos (Crypto.com ecosystem)
npx hardhat run scripts/deploy_all_contracts.ts --network cronos
```

## 🎯 After Deployment

Your deployment addresses are saved in:
```
deployments/<network>_latest.json
```

Example:
```json
{
  "contracts": {
    "BLEULION_CASCADE": {
      "address": "0x1234...",
      "deploymentTx": "0xabcd...",
      "blockNumber": 12345678
    },
    ...
  }
}
```

## 🔥 Common Commands

```bash
# Check balance
npm run deploy:all -- --network polygon

# Deploy specific contract
npx hardhat run scripts/deploy_cascade.ts --network polygon

# Verify all
npx hardhat run scripts/verify-all.ts --network polygon

# Clean and recompile
npm run clean && npm run compile
```

## ⚠️ Troubleshooting

**"insufficient funds for gas"**
- Check balance: `npm run check-balance --network <network>`
- Add more funds to deployer wallet

**"nonce too low"**
- Clean cache: `npm run clean`
- Wait ~30 seconds and retry

**"contract code size exceeds 24576 bytes"**
- Already handled: Optimizer enabled in config

**"Already Verified"**
- This is fine! Contract was verified previously

## 📚 Full Documentation

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review deployment logs in console output
3. Check deployment manifest: `cat deployments/<network>_latest.json`
4. Open a GitHub issue

---

**Ready? Let's deploy! 🚀**

```bash
./scripts/setup-deployment.sh && npx hardhat run scripts/deploy_all_contracts.ts --network polygon
```
