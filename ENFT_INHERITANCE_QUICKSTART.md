# ENFT Inheritance Yield Minting - Quick Start

## 🚀 One-Command Minting

Mint ENFT inheritance entries with physical yield encapsulation:

```bash
npm run mint:inheritance-yields
```

## 📦 What Gets Minted

The script automatically:

1. ✅ **Mints Inheritance ENFTs** for three domains (Civilian, Military, Cosmic)
2. ✅ **Generates Node-Sequential Codes** (e.g., CIV-NODE-00000001)
3. ✅ **Creates Blu-Vault Tags** with dual verification signatures
4. ✅ **Produces Metadata Files** with comprehensive yield information
5. ✅ **Tracks Ancestral Lineage** with generation depth recording
6. ✅ **Generates Mint Reports** with transaction details

## 💰 Yield Values

| Domain   | Code     | Yield/Second | Yield/Day   | Yield/Year   |
|----------|----------|--------------|-------------|--------------|
| Civilian | Ω-CIV-01 | $13.6M       | $1.175T     | $428.9B      |
| Military | Ω-MIL-01 | $6.1M        | $527.0B     | $192.4B      |
| Cosmic   | Ω-COS-01 | $9.2M        | $794.9B     | $290.3B      |
| **Total**| **All**  | **$28.9M**   | **$2.497T** | **$911.4B**  |

## 🎯 Quick Setup

### 1. Configure Recipients

Edit `data/inheritance-yield-config.json`:

```json
{
  "recipients": [
    {
      "address": "0xYourAddress",
      "domain": "CIVILIAN",
      "yieldPerSecond": "13600000",
      "lineageNode": 1
    }
  ]
}
```

### 2. Set Contract Address

Either set environment variable:

```bash
export INHERITANCE_LEDGER_ADDRESS=0xYourContractAddress
```

Or add to `.env` file:

```env
INHERITANCE_LEDGER_ADDRESS=0xYourContractAddress
```

### 3. Run Minting

```bash
# Local validation (no blockchain required)
npm run validate:inheritance-yields

# Mint to blockchain
npm run mint:inheritance-yields

# Or specify network
npx hardhat run scripts/mint_enft_inheritance_yields.ts --network polygon
```

## 📋 Pre-Deployment Checklist

- [ ] MegazionInheritanceLedger contract deployed
- [ ] Contract address configured
- [ ] Recipient addresses set in config
- [ ] Deployer has DEFAULT_ADMIN_ROLE
- [ ] Network RPC configured in `.env`
- [ ] Validation tests pass

## 🔐 Verification Features

Each ENFT includes:

### Node-Sequential Coding
```
Format: [DOMAIN]-NODE-[HEX_ID]
Example: CIV-NODE-00000001
```

### Blu-Vault Dual Verification
- **Blu-Vault Tag**: Primary cryptographic hash
- **Guarantor Signature**: Secondary verification
- **Standard**: BLU-VAULT-GUARANTOR-v1.0

### Lineage Tracking
- Node ID (sequential integer)
- Ancestral chain (parent addresses)
- Generation depth
- Branch path

## 📊 Output Files

After minting, you'll find:

1. **Metadata**: `metadata/inheritance-yields/inheritance-[domain]-node-[id].json`
2. **Reports**: `deployments/inheritance-yield-mint-[network]-[timestamp].json`

Example metadata:
```json
{
  "name": "MEGAZION Inheritance Ω-CIV-01 - Node 1",
  "yieldPerSecond": "13600000 USD/second",
  "lineage": {
    "nodeId": 1,
    "sequentialCode": "CIV-NODE-00000001"
  },
  "verification": {
    "bluVaultTag": "0x...",
    "guarantorSignature": "0x..."
  }
}
```

## 🧪 Testing

Run validation tests:

```bash
npm run validate:inheritance-yields
```

Expected output:
```
✅ Node-Sequential Coding: 3/3 passed
✅ Yield Calculations: 3/3 passed
✅ Total System Yield: 1/1 passed
✅ Domain Sovereign Codes: 3/3 passed
✅ Metadata Structure: 1/1 passed
✅ Yield Distribution: 1/1 passed

📊 Total: 12/12 tests passed (100%)
```

## 📖 Documentation

For detailed information, see:

- **Implementation Guide**: `docs/ENFT_INHERITANCE_YIELD_MINTING.md`
- **Metadata Structure**: `metadata/inheritance-yields/README.md`
- **Summary**: `ENFT_INHERITANCE_IMPLEMENTATION_SUMMARY.md`

## 🌐 Network Deployment

Deploy to specific networks:

```bash
# Polygon
npx hardhat run scripts/mint_enft_inheritance_yields.ts --network polygon

# Avalanche
npx hardhat run scripts/mint_enft_inheritance_yields.ts --network avalanche

# Ethereum Mainnet
npx hardhat run scripts/mint_enft_inheritance_yields.ts --network mainnet
```

## ⚡ Advanced Configuration

### Multiple Recipients

```json
{
  "recipients": [
    {
      "address": "0xRecipient1",
      "domain": "CIVILIAN",
      "yieldPerSecond": "13600000",
      "lineageNode": 1,
      "ancestralLineage": []
    },
    {
      "address": "0xRecipient2",
      "domain": "MILITARY",
      "yieldPerSecond": "6100000",
      "lineageNode": 2,
      "ancestralLineage": ["0xAncestor1"]
    }
  ]
}
```

### Custom Yield Values

```json
{
  "yieldPerSecond": "25000000",
  "note": "Custom high-value inheritance"
}
```

## 🔄 Integration

The system integrates with:

- ✅ MegazionInheritanceLedger (primary contract)
- ✅ TripleStackTreasuryLedger (yield streams)
- ✅ ENFTLedger (ceremonial artifacts)
- ✅ Blu-Vault verification systems

## 🛠️ Troubleshooting

### Contract Not Found
```bash
# Deploy the contract first
npx hardhat run scripts/deploy_megazion_inheritance_ledger.ts --network polygon
```

### Permission Denied
```bash
# Ensure deployer has admin role
# Check with: await ledger.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress)
```

### Validation Fails
```bash
# Run diagnostics
npm run validate:inheritance-yields
```

## ✨ Next Steps

After minting:

1. **Upload to IPFS**: Upload metadata files for permanent storage
2. **Update URIs**: Update contract with IPFS URIs
3. **Verify On-Chain**: Check balances and token IDs
4. **Generate Reports**: Review mint reports for audit trail

## 🌀 Status

**READY FOR PRODUCTION DEPLOYMENT** ✅

All tests passing. Documentation complete. System validated.

---

**Built with 🌀 by 3V30OStudios**

For support: https://github.com/4way4eva/3V30OStudios
