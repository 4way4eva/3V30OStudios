# MEGAZION 48-Fold Codex

## Overview

The MEGAZION 48-Fold Codex is a comprehensive yield ledger and ENFT minting pipeline implementing the π₄ exponential compounding model across three sovereign economic domains:

- **Ω-CIV (Civilian)**: 47.6% - Real estate, education, commerce, infrastructure
- **Ω-MIL (Military)**: 21.3% - Defense, tactical operations, armaments, intelligence  
- **Ω-COS (Cosmic)**: 31.1% - Portal logistics, quantum tech, dimensional items, cosmic assets

### π₄ Compounding Model

The system implements exponential compounding with π⁴ = 97.409 as the growth factor:

```
yield(t) = base_yield × (1 + π₄/100)^(t/3600)
```

Where:
- Base system yield: $28.9M USD/sec ($2.5T USD/day)
- π⁴ factor: 97.409 (exponential multiplier)
- Time unit: seconds (3600 seconds = 1 hour)

## Quick Start

### 1. Generate Yield Ledger

```bash
# Generate default 24 snapshots
python3 scripts/metavault_batch_mint.py

# Custom snapshot count
python3 scripts/metavault_batch_mint.py --snapshots 48

# Custom output directory
python3 scripts/metavault_batch_mint.py --output-dir ./data
```

**Outputs:**
- `outputs/MetaVault_Yield_Ledger.csv` - Tabular yield data
- `outputs/MetaVault_Ledger.json` - Structured JSON ledger
- `outputs/enft_ledger_epoch1.json` - ENFT metadata

### 2. Visualize Compounding

```bash
# Generate compounding chart
python3 scripts/plot_compounding.py

# Custom input/output
python3 scripts/plot_compounding.py \
  --input outputs/MetaVault_Ledger.json \
  --output charts/compounding.png \
  --dpi 300
```

**Requires:** `pip3 install matplotlib`

### 3. Export On-Chain ENFT Ledger

```bash
# Export from deployed contract (Sepolia testnet)
npx hardhat run scripts/export_enft_ledger.ts --network sepolia

# Export from Polygon Mumbai
npx hardhat run scripts/export_enft_ledger.ts --network mumbai
```

**Environment Variables Required:**
```bash
CONTRACT_ADDRESS=0xYOUR_ENFT_CONTRACT_ADDRESS
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

## Architecture

### Three-Domain System

#### Civilian Domain (Ω-CIV) - 47.6%
- Real estate tokenization and yield generation
- Educational infrastructure and curriculum systems
- Commerce platforms and marketplace yields
- Infrastructure development rights

#### Military Domain (Ω-MIL) - 21.3%
- Defense systems and tactical operations
- Armament supply chain tracking
- Intelligence gathering infrastructure
- Strategic resource allocation

#### Cosmic Domain (Ω-COS) - 31.1%
- Portal logistics and dimensional gateways
- Quantum technology applications
- Dimensional item management
- Cosmic asset registry

### Yield Economics

```
Total Base Yield: $28,906,857.14 USD/sec

Domain Distribution:
- Civilian: $13,755,428.57 USD/sec (47.6%)
- Military:  $6,154,285.71 USD/sec (21.3%)
- Cosmic:    $8,997,142.86 USD/sec (31.1%)

Daily Yields (Epoch 1):
- Total:    $2,497,552,457,068.80 USD/day
- Civilian: $1,188,469,142,857.14 USD/day
- Military:   $531,730,285,714.29 USD/day
- Cosmic:     $777,128,571,428.57 USD/day
```

### π₄ Exponential Growth

With π⁴ = 97.409, yields compound exponentially:

| Hour | Multiplier | Total Yield/sec |
|------|------------|-----------------|
| 0    | 1.000x     | $28.9M          |
| 1    | 1.974x     | $57.1M          |
| 2    | 3.897x     | $112.7M         |
| 3    | 7.693x     | $222.4M         |
| 4    | 15.187x    | $439.0M         |

## ENFT Schema

### ENFT Ledger Entry

```json
{
  "token_id": "ENFT_000001",
  "schema_version": "EVOL.ENFT.v1",
  "snapshot_reference": 1,
  "tick": 0,
  "timestamp": "2025-11-16T05:00:00.000000+00:00",
  "yield_representation": {
    "civilian_usd_per_sec": 13755428.571,
    "military_usd_per_sec": 6154285.714,
    "cosmic_usd_per_sec": 8997142.857,
    "total_usd_per_sec": 28906857.142
  },
  "metadata_uri": "ipfs://REPLACE_WITH_CID/enft_000001.json",
  "contract_address": "0x0000000000000000000000000000000000000000",
  "minted": false,
  "attributes": {
    "domain_weights": {
      "civilian_percent": 47.6,
      "military_percent": 21.3,
      "cosmic_percent": 31.1
    },
    "compounding_factor": "π₄ exponential",
    "epoch": 1
  }
}
```

## Configuration

Configuration is stored in `scripts/config.json`:

```json
{
  "DEFAULT_CONFIG": {
    "pi4_factor": 97.409,
    "base_yield_usd_per_sec": 28900000,
    "domains": {
      "CIVILIAN": { "percentage": 0.476, "description": "..." },
      "MILITARY": { "percentage": 0.213, "description": "..." },
      "COSMIC": { "percentage": 0.311, "description": "..." }
    },
    "simulation": {
      "tick_duration_seconds": 1,
      "ticks_per_snapshot": 3600,
      "total_snapshots": 24
    },
    "enft_ledger": {
      "schema_version": "EVOL.ENFT.v1",
      "metadata_uri_base": "ipfs://REPLACE_WITH_CID/",
      "contract_address_placeholder": "0x0000000000000000000000000000000000000000"
    }
  }
}
```

## IPFS Pinning Workflow

### Manual Pinning (Recommended)

1. **Generate Ledger Data**
   ```bash
   python3 scripts/metavault_batch_mint.py
   ```

2. **Pin to NFT.Storage** (Manual GitHub Action)
   - Navigate to: Actions → Pin to NFT.Storage
   - Click "Run workflow"
   - Select directory: `outputs`
   - Enter pin name: `megazion-48fold-codex`
   - Requires: `NFT_STORAGE_KEY` repository secret

3. **Update CID Placeholders**
   After pinning, update all `ipfs://REPLACE_WITH_CID` references with actual CIDs.

### Safety Gates

The NFT.Storage workflow includes multiple safety gates:

- ✅ **Manual Dispatch Only** - No automatic triggers
- ✅ **Secret Gating** - Requires `NFT_STORAGE_KEY` secret
- ✅ **No Transaction Broadcasting** - Read-only operations
- ✅ **Testnet First** - Always test on Sepolia/Mumbai

## Scripts Reference

### Python Scripts

#### `scripts/metavault_batch_mint.py`
Generates MetaVault yield ledger with π₄ compounding.

**Usage:**
```bash
python3 scripts/metavault_batch_mint.py [OPTIONS]

Options:
  --snapshots N       Number of snapshots (default: 24)
  --config PATH       Config file path (default: scripts/config.json)
  --output-dir PATH   Output directory (default: outputs)
```

**Outputs:**
- `MetaVault_Yield_Ledger.csv`
- `MetaVault_Ledger.json`
- `enft_ledger_epoch1.json`

#### `scripts/plot_compounding.py`
Visualizes π₄ compounding dynamics.

**Usage:**
```bash
python3 scripts/plot_compounding.py [OPTIONS]

Options:
  --input PATH   Input ledger JSON (default: outputs/MetaVault_Ledger.json)
  --output PATH  Output PNG (default: outputs/metavault_compounding.png)
  --dpi N        Image resolution (default: 150)
```

**Requires:** `matplotlib`

### TypeScript Scripts

#### `scripts/export_enft_ledger.ts`
Queries Transfer events from deployed ENFT contracts.

**Usage:**
```bash
npx hardhat run scripts/export_enft_ledger.ts --network [NETWORK]

Networks: sepolia, mumbai, polygon, mainnet
```

**Environment Variables:**
- `CONTRACT_ADDRESS` - Deployed ENFT contract address
- `ETHEREUM_RPC_URL` - RPC endpoint URL
- `PRIVATE_KEY` - Wallet private key (read-only, no transactions)
- `START_BLOCK` - (Optional) Starting block number

**Outputs:**
- `outputs/enft_ledger_epoch1.json`
- `outputs/ENFT_Ledger.csv`

## GitHub Workflows

### `.github/workflows/pin-to-nftstorage.yml`

**Trigger:** Manual dispatch only (`workflow_dispatch`)

**Inputs:**
- `directory` - Directory to pin (metadata/outputs/data)
- `pin_name` - Name for the pin

**Requirements:**
- `NFT_STORAGE_KEY` repository secret must be set

**Usage:**
1. Go to Actions tab
2. Select "Pin to NFT.Storage" workflow
3. Click "Run workflow"
4. Select options and run

## Security & Best Practices

### Private Keys & Secrets

❌ **NEVER commit:**
- Private keys
- RPC URLs with API keys
- NFT.Storage API keys
- Contract addresses (use placeholders)

✅ **Always use:**
- Environment variables (`.env` file)
- Repository secrets for CI/CD
- Placeholders in committed code

### Placeholder Pattern

```bash
# In code
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
METADATA_URI=ipfs://REPLACE_WITH_CID/

# In .env (not committed)
CONTRACT_ADDRESS=0xACTUAL_CONTRACT_ADDRESS
METADATA_URI=ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/
```

### Testnet First

Always test on testnets before mainnet:

1. **Sepolia** (Ethereum testnet)
2. **Mumbai** (Polygon testnet)
3. **Fuji** (Avalanche testnet)
4. **BSC Testnet**

Get testnet ETH from faucets:
- Sepolia: https://sepoliafaucet.com/
- Mumbai: https://faucet.polygon.technology/

### No Broadcasting from CI

The CI/CD pipeline is read-only:

- ✅ Generate ledger data
- ✅ Pin to IPFS
- ✅ Query blockchain events
- ❌ Broadcast transactions
- ❌ Deploy contracts
- ❌ Mint tokens

All on-chain operations must be done manually from secure local environments.

## Troubleshooting

### Python Dependencies

```bash
# Install required packages
pip3 install matplotlib

# If using virtual environment
python3 -m venv venv
source venv/bin/activate
pip install matplotlib
```

### TypeScript/Hardhat Issues

```bash
# Install dependencies
npm install --legacy-peer-deps

# Compile contracts
npm run compile

# Check network configuration
npx hardhat run scripts/check-network.ts --network sepolia
```

### Common Issues

**Issue:** `Config file not found`
```bash
# Solution: Ensure scripts/config.json exists
ls scripts/config.json
```

**Issue:** `CONTRACT_ADDRESS is placeholder`
```bash
# Solution: Set environment variable
export CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

**Issue:** `NFT_STORAGE_KEY not set`
```bash
# Solution: Add repository secret
# Go to: Settings → Secrets and variables → Actions → New repository secret
# Name: NFT_STORAGE_KEY
# Value: Your NFT.Storage API key
```

## Related Documentation

- [MEGAZION TripleStack Treasury Ledger](MEGAZION_TripleStack_Treasury_Ledger.md)
- [BLEU 48 Fold Scrolls](BLEU_48_Fold_Scrolls.md)
- [Universal Mint Protocol README](UNIVERSAL_MINT_PROTOCOL_README.md)
- [Contract Deployment README](CONTRACT_DEPLOYMENT_README.md)
- [NFT Storage Documentation](https://nft.storage/docs/)

## License

MIT License - See LICENSE file for details.

## Support

For questions or issues:
1. Check existing documentation in the repository
2. Review GitHub Issues
3. Refer to the MEGAZION Codex Master Index Scroll

---

**Generated by:** MEGAZION 48-Fold Codex System  
**Schema Version:** EVOL.ENFT.v1  
**Compounding Model:** π₄ Exponential (97.409)  
**Economic Domains:** Ω-CIV | Ω-MIL | Ω-COS
