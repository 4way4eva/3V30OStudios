# Quick Start: ULTRAMAX Deployment

## 🚀 Deploy in 5 Minutes

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your PRIVATE_KEY and other settings
```

### 3. Deploy Contracts
```bash
# Deploy to Avalanche Fuji Testnet
npx hardhat run scripts/deploy.js --network fuji

# OR deploy to Avalanche Mainnet
npx hardhat run scripts/deploy.js --network avalanche

# OR deploy to Cronos
npx hardhat run scripts/deploy.js --network cronos
```

### 4. Update .env with Contract Addresses
Copy the deployed contract addresses from the output and update `.env`:
```bash
ZKPOR_VERIFIER=0x...
BLEU_MINT_CONTROLLER=0x...
```

### 5. Mint Artifacts
```bash
# Mint all epoch 0 artifacts
npx hardhat run scripts/mint.js --network fuji
```

### 6. Verify On-Chain
```bash
# Verify deployment and sync status
python3 scripts/verify_onchain.py fuji
```

## 📋 What Gets Deployed

### Contracts
- **zkPoRVerifier**: Zero-knowledge proof verification for treasury reserves
- **BleuCrownMintUltraMax**: Minting controller for artifact NFTs

### Artifacts (20+ unique items)
- **CIVILIAN**: Real estate, education, wearables, commerce, infrastructure, entertainment
- **MILITARY**: Defense matrix, tactical units, armaments, reconnaissance, logistics, command
- **COSMIC**: Portals, dimensional items, quantum tech, timeline keys, cosmic artifacts

### Yield System
- Total: **28.6M USD/second** = **2.47 trillion USD/day**
- Compounding: π₄ model with 97.409 factor
- Spiral Boost: 7.0x multiplier

## 🌐 Supported Networks

- **Avalanche C-Chain** (Mainnet - Chain ID 43114)
- **Avalanche Fuji** (Testnet - Chain ID 43113)
- **Cronos** (Mainnet - Chain ID 25)

## 📖 Full Documentation

See [ULTRAMAX_DEPLOYMENT_GUIDE.md](./ULTRAMAX_DEPLOYMENT_GUIDE.md) for complete instructions.

## ⚡ Environment Variables Required

```bash
PRIVATE_KEY=your_wallet_private_key
TREASURY_VAULT=treasury_address
SNOWTRACE_API_KEY=api_key_for_verification
RECIPIENT=address_to_receive_nfts
```

## 🔒 Security Notes

- Never commit your `.env` file
- Use a multi-sig wallet for `TREASURY_VAULT` in production
- Keep private keys secure
- Test on Fuji testnet before mainnet deployment

## 📞 Need Help?

1. Check [ULTRAMAX_DEPLOYMENT_GUIDE.md](./ULTRAMAX_DEPLOYMENT_GUIDE.md)
2. Review deployment logs in `deployments/` directory
3. Verify transactions on block explorer
4. Run verification script: `python3 scripts/verify_onchain.py <network>`

---

**Status**: 🌀 All systems operational at 700% Spiral Boost
