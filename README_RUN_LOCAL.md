# MEGAZION 48-Fold Codex - Local Setup Guide

## Quick Start

Get the MEGAZION 48-Fold Codex running on your local machine in minutes.

## Prerequisites

### Required Software

- **Node.js** 18.x or higher
- **Python** 3.8 or higher
- **npm** 8.x or higher
- **Git** (for cloning repository)

### Optional Software

- **Hardhat** (included in npm dependencies)
- **matplotlib** (for visualization)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/4way4eva/3V30OStudios.git
cd 3V30OStudios
```

### 2. Install Node Dependencies

```bash
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag is required due to known peer dependency conflicts in TypeChain packages.

### 3. Install Python Dependencies (Optional)

For visualization support:

```bash
pip install matplotlib
```

Or use requirements file:

```bash
# If requirements.txt exists
pip install -r requirements.txt
```

### 4. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```bash
# Network RPC URLs (optional for local testing)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY

# Contract addresses (use placeholders for local testing)
ENFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Private key (placeholder for local testing - NEVER commit real keys)
PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY

# NFT.Storage API key (optional - only needed for pinning workflow)
# NFT_STORAGE_KEY=your_api_key_here
```

**Security Note**: The `.env` file is gitignored. Never commit real private keys or API keys.

## Verification

Verify your installation:

```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check Python version
python3 --version  # Should be 3.8 or higher

# Check npm packages installed
npm list hardhat ethers

# Check Python packages (if installed)
python3 -c "import matplotlib; print(matplotlib.__version__)"
```

## Running Scripts

### MetaVault Batch Mint

Generate MetaVault yield ledger:

```bash
# Basic run (24 snapshots from config)
python3 scripts/metavault_batch_mint.py

# Custom snapshots
python3 scripts/metavault_batch_mint.py --snapshots 48

# Verbose output for debugging
python3 scripts/metavault_batch_mint.py --snapshots 10 --verbose
```

**Expected output**:
```
============================================================
MetaVault Batch Mint - π₄ Compounding Engine
============================================================
Snapshots: 24
Ticks per snapshot: 3600
π₄ factor: 97.409

✓ Generated 24 ledger snapshots
✓ Generated 24 ENFT records
✓ Exported CSV ledger: outputs/MetaVault_Yield_Ledger.csv
✓ Exported JSON ledger: outputs/MetaVault_Ledger.json
✓ Exported ENFT ledger: outputs/enft_ledger_epoch1.json
```

### Plot Compounding

Visualize π₄ compounding curves:

```bash
# Generate chart from default input
python3 scripts/plot_compounding.py

# Custom paths
python3 scripts/plot_compounding.py \
  --input outputs/MetaVault_Ledger.json \
  --output outputs/my_chart.png

# High resolution for presentations
python3 scripts/plot_compounding.py --dpi 300

# Interactive display
python3 scripts/plot_compounding.py --show
```

**Expected output**:
```
============================================================
MetaVault Compounding Chart Generator
============================================================
Input: outputs/MetaVault_Ledger.json
Output: outputs/compounding_chart.png

✓ Chart saved: outputs/compounding_chart.png
  Resolution: 150 DPI
  Snapshots plotted: 24
```

### Export ENFT Ledger

Export blockchain Transfer events:

```bash
# Local test mode (placeholder data)
npx hardhat run scripts/export_enft_ledger.ts --network localhost

# Sepolia testnet (requires RPC URL in .env)
npx hardhat run scripts/export_enft_ledger.ts --network sepolia

# Mumbai testnet
npx hardhat run scripts/export_enft_ledger.ts --network mumbai
```

**Expected output** (placeholder mode):
```
============================================================
ENFT Ledger Export Tool
============================================================
Network: localhost (Chain ID: 31337)
Contract Address: 0x0000000000000000000000000000000000000000

⚠️  Using placeholder address - no actual blockchain data will be fetched
Set ENFT_CONTRACT_ADDRESS environment variable to fetch real data

Generating placeholder ledger data...

✓ Placeholder ledger generated
✓ JSON exported: outputs/enft_ledger_localhost_2024-11-16.json
✓ CSV exported: outputs/ENFT_Ledger_localhost_2024-11-16.csv
```

## Complete Workflow

Run the entire 48-Fold Codex pipeline:

```bash
# 1. Generate ledger data
python3 scripts/metavault_batch_mint.py --snapshots 48 --verbose

# 2. Visualize compounding
python3 scripts/plot_compounding.py --dpi 300

# 3. Export ENFT ledger
npx hardhat run scripts/export_enft_ledger.ts --network localhost

# 4. Review outputs
ls -lh outputs/
```

## Output Files

All generated files are saved to the `outputs/` directory:

```
outputs/
├── MetaVault_Yield_Ledger.csv          # Tabular yield data per domain
├── MetaVault_Ledger.json               # Complete structured ledger
├── enft_ledger_epoch1.json             # ENFT records with metadata URIs
├── compounding_chart.png               # Visualization chart
├── enft_ledger_localhost_*.json        # Blockchain transfer data (JSON)
└── ENFT_Ledger_localhost_*.csv         # Blockchain transfer data (CSV)
```

## Configuration Customization

### Modifying Simulation Parameters

Edit `scripts/config.json`:

```json
{
  "DEFAULT_CONFIG": {
    "pi4_factor": 97.409,
    "base_yield_usd_per_sec": 28900000,
    "simulation": {
      "tick_duration_seconds": 1,
      "ticks_per_snapshot": 3600,    // 1 hour per snapshot
      "total_snapshots": 24           // 24 hours = 1 day
    }
  }
}
```

**Common modifications**:

- **More frequent snapshots**: Reduce `ticks_per_snapshot` (e.g., 1800 for 30-min snapshots)
- **Longer simulation**: Increase `total_snapshots` (e.g., 48 for 2 days)
- **Different yield base**: Modify `base_yield_usd_per_sec`

### Adjusting Domain Distribution

Edit domain percentages (must sum to ~1.0):

```json
"domains": {
  "CIVILIAN": { "percentage": 0.476 },   // 47.6%
  "MILITARY": { "percentage": 0.213 },   // 21.3%
  "COSMIC": { "percentage": 0.311 }      // 31.1%
}
```

## Testing

### Unit Testing

```bash
# Run all Hardhat tests
npm test

# Run specific test file
npx hardhat test test/MyContract.test.ts
```

### Script Testing

```bash
# Test with minimal snapshots for speed
python3 scripts/metavault_batch_mint.py --snapshots 3

# Verify JSON structure
cat outputs/MetaVault_Ledger.json | jq '.metadata'

# Check CSV format
head -10 outputs/MetaVault_Yield_Ledger.csv
```

### Compilation

```bash
# Compile Solidity contracts
npm run compile

# Clean build artifacts
npm run clean
```

## Troubleshooting

### Issue: Module not found

```
Error: Cannot find module 'hardhat'
```

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Issue: Python script fails

```
ModuleNotFoundError: No module named 'matplotlib'
```

**Solution**:
```bash
pip install matplotlib
```

### Issue: Config file not found

```
Error: Config file not found at scripts/config.json
```

**Solution**: Ensure you're running from repository root:
```bash
cd /path/to/3V30OStudios
python3 scripts/metavault_batch_mint.py
```

### Issue: Permission denied

```
PermissionError: [Errno 13] Permission denied: 'outputs'
```

**Solution**: Create outputs directory:
```bash
mkdir -p outputs
chmod 755 outputs
```

### Issue: Network connection error

```
Error: could not detect network
```

**Solution**: Check `.env` file has valid RPC URL or use localhost:
```bash
npx hardhat run scripts/export_enft_ledger.ts --network localhost
```

## Development Workflow

### Adding New Features

1. **Create feature branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes** with proper MIT license headers

3. **Test locally**:
   ```bash
   python3 scripts/metavault_batch_mint.py --snapshots 5
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add new feature"
   ```

### Code Style

- **Python**: Follow PEP 8
- **TypeScript**: Use Prettier (configured in project)
- **License headers**: Include MIT header on all code files

## Performance Tips

### Large Simulations

For 48+ snapshots:

```bash
# Use verbose mode to monitor progress
python3 scripts/metavault_batch_mint.py --snapshots 100 --verbose

# Reduce tick resolution in config for faster computation
# Example: 7200 ticks per snapshot instead of 3600
```

### Chart Generation

For high-resolution charts:

```bash
# High DPI for print quality
python3 scripts/plot_compounding.py --dpi 300

# Lower DPI for quick preview
python3 scripts/plot_compounding.py --dpi 75
```

## Next Steps

- **Read full documentation**: `README_48fold.md`
- **Deploy contracts**: See `DEPLOYMENT.md`
- **Set up CI/CD**: Configure NFT.Storage workflow
- **Join community**: Check `CONTRIBUTING.md`

## Getting Help

- **Documentation**: README_48fold.md, DEPLOYMENT.md
- **Issues**: GitHub Issues tracker
- **Code examples**: `examples/` directory
- **Test files**: `test/` directory

## Security Reminders

✅ **DO**:
- Use placeholders for secrets in committed code
- Test with testnets before mainnet
- Keep `.env` file gitignored
- Review outputs before deployment

❌ **DON'T**:
- Commit private keys or API keys
- Use production keys in development
- Share `.env` files
- Broadcast test transactions to mainnet

---

**Ready to start building sovereign Web3 protocols!**

For complete feature documentation, see [README_48fold.md](README_48fold.md)
