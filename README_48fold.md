# MEGAZION 48-Fold Codex Feature Package

## Overview

The **MEGAZION 48-Fold Codex** is a comprehensive blockchain treasury simulation and ENFT (Enhanced Non-Fungible Token) ledger generation system implementing the π₄ exponential compounding model across three sovereign economic domains.

## Features

### Three-Domain Economic System

- **Ω-CIV (Civilian)**: 47.6% allocation - Real estate, education, commerce, infrastructure
- **Ω-MIL (Military)**: 21.3% allocation - Defense, tactical operations, armaments, intelligence
- **Ω-COS (Cosmic)**: 31.1% allocation - Portal logistics, quantum tech, dimensional items, cosmic assets

### π₄ Compounding Model

- **Factor**: 97.409 (π⁴)
- **Base Yield**: $28.9M USD per second ($2.5T per day)
- **Compounding**: Exponential growth per tick/snapshot
- **Formula**: `yield(t) = base_yield × (1 + π₄/100)^(t/3600)`

### Generated Outputs

1. **MetaVault_Yield_Ledger.csv** - Tabular yield data across all domains and snapshots
2. **MetaVault_Ledger.json** - Complete structured ledger with metadata
3. **enft_ledger_epoch1.json** - ENFT records with IPFS metadata URIs
4. **compounding_chart.png** - Visual representation of yield curves
5. **ENFT_Ledger_<network>_<timestamp>.csv** - Blockchain transfer events export

## Scripts

### 1. MetaVault Batch Mint

**File**: `scripts/metavault_batch_mint.py`

Generates MetaVault yield ledger with π₄ compounding simulation.

```bash
# Basic usage (24 snapshots from config)
python3 scripts/metavault_batch_mint.py

# Custom snapshots
python3 scripts/metavault_batch_mint.py --snapshots 48

# Verbose output
python3 scripts/metavault_batch_mint.py --verbose

# Custom config
python3 scripts/metavault_batch_mint.py --config path/to/config.json
```

**Requirements**:
- Python 3.8+
- No external packages required (uses stdlib only)

**Outputs**:
- `outputs/MetaVault_Yield_Ledger.csv`
- `outputs/MetaVault_Ledger.json`
- `outputs/enft_ledger_epoch1.json`

### 2. Plot Compounding

**File**: `scripts/plot_compounding.py`

Visualizes π₄ compounding curves from generated ledger data.

```bash
# Basic usage
python3 scripts/plot_compounding.py

# Custom input/output
python3 scripts/plot_compounding.py --input outputs/MetaVault_Ledger.json --output charts/yield.png

# High resolution
python3 scripts/plot_compounding.py --dpi 300

# Interactive display
python3 scripts/plot_compounding.py --show
```

**Requirements**:
```bash
pip install matplotlib
```

**Outputs**:
- `outputs/compounding_chart.png` (default)

### 3. Export ENFT Ledger

**File**: `scripts/export_enft_ledger.ts`

Exports Transfer events from deployed ENFT contracts to structured ledger files.

```bash
# Export from Sepolia testnet
npx hardhat run scripts/export_enft_ledger.ts --network sepolia

# Export from Mumbai (Polygon testnet)
npx hardhat run scripts/export_enft_ledger.ts --network mumbai

# Local/test mode with placeholders
npx hardhat run scripts/export_enft_ledger.ts --network localhost
```

**Requirements**:
- Node.js 18+
- Hardhat environment configured
- Environment variables set (see .env.example)

**Environment Variables**:
```bash
# Optional - uses placeholder if not set
ENFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Network RPC endpoints
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY

# Read-only key (no transactions sent)
PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY
```

**Outputs**:
- `outputs/enft_ledger_<network>_<timestamp>.json`
- `outputs/ENFT_Ledger_<network>_<timestamp>.csv`

## Configuration

All scripts read from `scripts/config.json` using the `DEFAULT_CONFIG` section.

### Key Configuration Parameters

```json
{
  "DEFAULT_CONFIG": {
    "pi4_factor": 97.409,
    "base_yield_usd_per_sec": 28900000,
    "domains": {
      "CIVILIAN": { "percentage": 0.476 },
      "MILITARY": { "percentage": 0.213 },
      "COSMIC": { "percentage": 0.311 }
    },
    "simulation": {
      "tick_duration_seconds": 1,
      "ticks_per_snapshot": 3600,
      "total_snapshots": 24
    }
  }
}
```

## Workflow

### Complete 48-Fold Codex Pipeline

```bash
# 1. Generate MetaVault ledger (48 snapshots for full daily cycle)
python3 scripts/metavault_batch_mint.py --snapshots 48 --verbose

# 2. Visualize compounding model
python3 scripts/plot_compounding.py --dpi 300

# 3. Export on-chain ENFT ledger (if contracts deployed)
npx hardhat run scripts/export_enft_ledger.ts --network sepolia

# 4. Review outputs
ls -lh outputs/
```

### Expected Output Structure

```
outputs/
├── MetaVault_Yield_Ledger.csv          # Tabular yield data
├── MetaVault_Ledger.json               # Structured JSON ledger
├── enft_ledger_epoch1.json             # ENFT metadata records
├── compounding_chart.png               # Visual chart
├── enft_ledger_sepolia_2024-11-16.json # Blockchain export (JSON)
└── ENFT_Ledger_sepolia_2024-11-16.csv  # Blockchain export (CSV)
```

## NFT.Storage Integration

The repository includes a **gated workflow** for pinning metadata to NFT.Storage.

### Workflow File

`.github/workflows/nft-storage-pin.yml`

### Enabling the Workflow

The workflow is **disabled by default**. To enable:

1. Generate an API key at [nft.storage](https://nft.storage/)
2. Add the key as a repository secret named `NFT_STORAGE_KEY`
3. The workflow will automatically activate

### Manual Trigger

```bash
# Via GitHub UI: Actions → NFT.Storage Pin Workflow → Run workflow
# Options:
#   - metadata_dir: Directory to pin (default: 'metadata')
#   - dry_run: Test mode without actual pinning (default: 'true')
```

### Dry Run Mode

By default, the workflow runs in **dry run mode** to prevent accidental charges:

- Lists files that would be pinned
- No actual API calls to NFT.Storage
- Safe for testing and validation

To perform actual pinning, set `dry_run` to `false` when triggering the workflow.

## Security & Placeholders

### IPFS CID Placeholders

All generated metadata URIs use placeholder CIDs:
```
ipfs://REPLACE_WITH_CID/<token_id>.json
```

Replace with actual CIDs after pinning metadata to IPFS.

### Contract Address Placeholders

Default contract addresses are set to zero addresses:
```
0x0000000000000000000000000000000000000000
```

Update with actual deployed contract addresses in `.env` file.

### Private Keys

**Never commit private keys**. Use `.env` file (gitignored) and placeholders:
```
PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY
```

## Testing

### Python Scripts

```bash
# Test metavault_batch_mint.py
python3 scripts/metavault_batch_mint.py --snapshots 3 --verbose

# Verify outputs exist
ls -lh outputs/

# Check CSV format
head -10 outputs/MetaVault_Yield_Ledger.csv

# Validate JSON structure
cat outputs/MetaVault_Ledger.json | jq '.metadata'
```

### TypeScript Scripts

```bash
# Compile TypeScript
npm run compile

# Test with placeholder data (no actual blockchain query)
ENFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000 \
  npx hardhat run scripts/export_enft_ledger.ts --network localhost
```

### Visualization

```bash
# Install matplotlib if needed
pip install matplotlib

# Generate and view chart
python3 scripts/plot_compounding.py --show
```

## Architecture

### Data Flow

```
scripts/config.json
       ↓
[metavault_batch_mint.py]
       ↓
    outputs/
    ├── MetaVault_Yield_Ledger.csv
    ├── MetaVault_Ledger.json
    └── enft_ledger_epoch1.json
       ↓
[plot_compounding.py]
       ↓
    outputs/compounding_chart.png

Deployed ENFT Contract
       ↓
[export_enft_ledger.ts]
       ↓
    outputs/
    ├── enft_ledger_<network>_<timestamp>.json
    └── ENFT_Ledger_<network>_<timestamp>.csv
```

### Domain Distribution

| Domain   | Symbol | Percentage | USD/sec      | Daily USD       |
|----------|--------|------------|--------------|-----------------|
| Civilian | Ω-CIV  | 47.6%      | $13,755,429  | $1,188,469,714 |
| Military | Ω-MIL  | 21.3%      | $6,154,286   | $531,730,286   |
| Cosmic   | Ω-COS  | 31.1%      | $8,997,143   | $777,128,571   |
| **Total** | -   | **100%**   | **$28,906,857** | **$2,497,328,571** |

## Troubleshooting

### Common Issues

#### 1. Config file not found

```bash
Error: Config file not found at scripts/config.json
```

**Solution**: Ensure you're running from the repository root and `scripts/config.json` exists.

#### 2. matplotlib not installed

```bash
Error: matplotlib is required for this script
```

**Solution**: Install matplotlib:
```bash
pip install matplotlib
```

#### 3. Hardhat network error

```bash
Error: network not found
```

**Solution**: Check `hardhat.config.ts` for network configuration and ensure environment variables are set.

#### 4. NFT.Storage workflow not running

**Solution**: The workflow is gated. Add `NFT_STORAGE_KEY` secret to enable it.

## License

All code files include MIT License headers.

```
MIT License
Copyright (c) 2024 3V30OStudios / MEGAZION Codex
```

See individual file headers for complete license text.

## Support & Documentation

- **Main Documentation**: This file (README_48fold.md)
- **Local Setup**: README_RUN_LOCAL.md
- **Contract Docs**: See contracts/README.md
- **Deployment Guide**: DEPLOYMENT.md

## Contributing

1. Always maintain MIT license headers on new files
2. Use placeholder values for secrets and CIDs
3. Test scripts before committing
4. Update documentation for new features
5. Follow the π₄ compounding model specifications

## Version History

- **v1.0** - Initial 48-Fold Codex release
  - MetaVault batch minting
  - π₄ compounding visualization
  - ENFT ledger export
  - NFT.Storage workflow (gated)
  - Complete documentation

---

**MEGAZION / BLEULIONTREASURY** - Sovereign Web3 Protocol
