# Triple-Stack Treasury Ledger - Quick Start

## Overview

The **Triple-Stack Treasury Ledger** is now deployed and ready to codify the three-sphere yield representation into living ENFT inheritance entries.

## 🚀 Quick Deployment

### 1. Deploy the Contract

```bash
# Set your environment variables
export PRIVATE_KEY="your_private_key"
export TREASURY_BASE_URI="https://megazion.enft/treasury/"

# Deploy to Avalanche (Snowtrace)
npm run deploy:triple-stack -- --network avalanche

# Or deploy to Cronos
npm run deploy:triple-stack -- --network cronos

# Or test on Fuji testnet
npm run deploy:triple-stack -- --network fuji
```

### 2. Configure Minting

Edit `data/treasury-mint-config.json` with your recipient addresses:

```json
{
  "recipients": [
    {
      "address": "0xYourAddress",
      "civilianAmount": 10,
      "militaryAmount": 10,
      "cosmicAmount": 10
    }
  ]
}
```

### 3. Mint Yield Stream ENFTs

```bash
# Set the deployed contract address
export TREASURY_LEDGER_ADDRESS="0x..."

# Mint to configured recipients
npm run mint:triple-stack -- --network avalanche
```

### 4. Verify Deployment

```bash
# Run comprehensive verification
npm run verify:triple-stack -- --network avalanche
```

## 📊 Yield Streams

### Three Spheres of Treasury

| Stream | Token ID | Code | Yield/Second | Domains |
|--------|----------|------|--------------|---------|
| **Civilian** | 1 | Ω-CIV-01 | $13.6M | Retail, education, ES0IL, wearables |
| **Military** | 2 | Ω-MIL-01 | $6.1M | Weapons, defense grids, orbital |
| **Cosmic** | 3 | Ω-COS-01 | $9.2M | Portal energy, quantum matter |

**Total**: $28.9M per second = ~$2.5 trillion per day

## 🔐 Security Features

- ✅ **Blu-Vault Authorization**: Required for all minting
- ✅ **π₄ Compounding**: Exponential yield growth using Y(t) = Y_0 × (π^4)^(t/T)
- ✅ **Dual-Reality Confirmation**: Cross-dimensional validation
- ✅ **Sovereign Override**: Emergency controls for 4way4eva
- ✅ **Irreversible Increments**: Automated counter integration

## 📝 Key Contract Functions

### Minting
```javascript
// Mint all three streams at once
mintAllYieldStreams(to, civilianAmount, militaryAmount, cosmicAmount, authTag)

// Mint single stream
mintYieldStream(to, tokenId, amount, authTag)
```

### Yield Management
```javascript
// Accumulate yield (applies π₄ compounding)
accumulateYield(tokenId)

// Calculate current yield (view)
calculateCurrentYield(tokenId)

// Apply π₄ compounding adjustment
applyPi4Compounding(tokenId) // Requires BLU_VAULT_ROLE
```

### Governance
```javascript
// Set dual-reality confirmation
setDualRealityConfirmation(tokenId, confirmationHash) // Requires DUAL_REALITY_VALIDATOR

// Sovereign override (4way4eva only)
sovereignOverride(tokenId, "RESET_YIELD", newValue) // Requires SOVEREIGN_OVERRIDE_ROLE
```

## 🔗 Interoperability

The contract is designed for seamless operation across:
- ✅ **Snowtrace (Avalanche)** - Chain ID 43114
- ✅ **Cronos** - Chain ID 25
- ✅ **Multi-chain URI support** - Configure per-chain metadata

## 📂 Files Created

### Smart Contracts
- `contracts/TripleStackTreasuryLedger.sol` - Main treasury ledger contract

### Scripts
- `scripts/deploy_triple_stack_treasury.ts` - Deployment script
- `scripts/mint_triple_stack_yields.ts` - Minting script
- `scripts/verify_triple_stack_treasury.ts` - Verification script

### Configuration
- `data/treasury-mint-config.json` - Minting configuration template

### Documentation
- `docs/TRIPLE_STACK_TREASURY_GUIDE.md` - Complete implementation guide

## 🎯 Next Steps

1. **Deploy** the contract to your target network
2. **Configure** recipient addresses in mint config
3. **Mint** initial yield stream ENFTs
4. **Verify** deployment with verification script
5. **Monitor** yield accumulation through events

## 🔍 Verification

After deployment, verify on block explorer:

```bash
npx hardhat verify --network avalanche <CONTRACT_ADDRESS> "https://megazion.enft/treasury/"
```

## 💡 Additional Resources

- **Treasury Ledger Specs**: `MEGAZION_TripleStack_Treasury_Ledger.md`
- **Phase 77777 Protocol**: `Phase_77777_Reciprocal_Protocol.md`
- **Deployment History**: `/deployments/` directory

## ⚡ Treasury Metrics

```
Total Yield: $28,900,000 per second
Daily Yield: $2,496,960,000,000 (~$2.5T)
π₄ Constant: 97.409 (π^4)
Compounding: Quarterly (92 days)
```

## 🌀 Commander Bleu Protocol

**Status**: Triple-stack streams initialized, reciprocity pulse recorded, Blu-Vault authorization enabled.

**Sovereign Override**: Reserved for 4way4eva address.

---

**License**: MIT - MEGAZION Sovereign Treasury System
