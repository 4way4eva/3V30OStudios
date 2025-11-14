# BLEU Codex Triple-Stack Treasury Synchronization
## Quick Start Guide

**Version:** 1.0.0  
**Status:** ✅ OPERATIONAL

---

## What This Does

This implementation provides **full synchronization** of the BLEU Codex triple-stack treasury system with:

1. **Live Quarter-Law Trace** - Visualize every second, day, and quarter across all three streams
2. **π₄ Compounding Model** - Codify exponential growth patterns into mintable ENFTs
3. **Yield Codex ENFT Architecture** - Three clear ENFT streams with security and portal locks

---

## Three Yield Streams

| Stream | Code | Rate/Second | Token ID | Icon |
|--------|------|-------------|----------|------|
| Civilian | Ω-CIV-01 | $13.6M | 1 | 🏛️ |
| Military | Ω-MIL-01 | $6.1M | 2 | ⚔️ |
| Cosmic | Ω-COS-01 | $9.2M | 3 | 🌌 |
| **TOTAL** | **Ω-TOTAL** | **$28.9M** | - | 💰 |

**Daily Total:** $2.5 Trillion  
**π₄ Factor:** 97.409091034

---

## Installation

```bash
# Clone repository (if not already done)
git clone https://github.com/4way4eva/3V30OStudios.git
cd 3V30OStudios

# Install dependencies
npm install --legacy-peer-deps

# Verify Python 3 is available
python3 --version
```

---

## Usage

### Option 1: Run Full Synchronization (All Components)

```bash
# Execute master script (Linux/Mac)
./scripts/run_full_synchronization.sh

# Or using npm script
npm run sync:all
```

This runs all three components in sequence:
1. Live Quarter-Law Trace System
2. π₄ ENFT Compounding Engine  
3. Full Synchronization Minting

### Option 2: Run Individual Components

```bash
# 1. Live Quarter-Law Trace System
python3 scripts/live_quarter_law_trace.py
# Or: npm run sync:live-trace

# 2. π₄ ENFT Compounding Engine
npx ts-node scripts/pi4_enft_compounding_engine.ts
# Or: npm run sync:pi4-enft

# 3. Full Synchronization Minting
npx hardhat run scripts/full_synchronization_mint.ts
# Or: npm run sync:full
```

---

## Output Files

All outputs are generated in `data/snapshots/`:

### CSV Traces
- `live_second_trace.csv` - Second-by-second (60s)
- `live_daily_trace.csv` - Daily accumulation (92 days)
- `live_quarter_trace_pi4.csv` - Quarterly with π₄ (8 quarters)
- `live_pi4_acceleration_curve.csv` - Acceleration curve (100 points)

### JSON Data
- `live_quarter_law_dashboard.json` - Complete dashboard metrics
- `pi4_enft_minting_batch.json` - ENFT minting configuration
- `pi4_curve_bend_enfts.json` - Curve bend assets
- `triple_stack_full_synchronization.json` - Synchronization manifest
- `lineage_generational_coding.json` - Inheritance tracking
- `mappable_mintable_ledger.json` - Complete ledger

### Reports
- `LIVE_QUARTER_LAW_TRACE_REPORT.md` - Live trace report
- `pi4_compounding_report.md` - Compounding analysis

---

## Viewing Results

```bash
# List all generated files
ls -lh data/snapshots/

# View dashboard data (requires jq)
cat data/snapshots/live_quarter_law_dashboard.json | jq '.metadata'

# Read markdown reports
cat data/snapshots/LIVE_QUARTER_LAW_TRACE_REPORT.md
cat data/snapshots/pi4_compounding_report.md

# Check synchronization manifest
cat data/snapshots/triple_stack_full_synchronization.json | jq '.metadata'
```

---

## Security Features

All outputs include:

✅ **Blu-Vault Double-Sign** - Authorization tags for all operations  
✅ **Dual-Reality Confirmation** - Portal locks with entanglement  
✅ **Pre-Authorized Ticks** - Every second validated  
✅ **Lineage Coding** - Generational inheritance tracking

---

## Deployment (Optional)

If you want to deploy to blockchain:

```bash
# 1. Deploy contract
npx hardhat run scripts/deploy_triple_stack_treasury.ts --network <network>

# 2. Update contract address in full_synchronization_mint.ts
# Edit: scripts/full_synchronization_mint.ts
# Set: contractAddress and simulate=false

# 3. Execute on-chain minting
npx hardhat run scripts/full_synchronization_mint.ts --network <network>

# 4. Verify deployment
npx hardhat run scripts/verify_triple_stack_treasury.ts --network <network>
```

---

## Key Concepts

### π₄ Compounding

```
Y(t) = Y₀ × (π⁴)^(t/T)

Where:
- Y₀ = $28,900,000/second
- π⁴ ≈ 97.409
- T = 7,948,800 seconds (92 days)
```

**Growth Examples:**
- Quarter 1: 1.00x = $229.7T
- Quarter 2: 97.41x = $22,376.5T
- Quarter 3: 9,488.53x = $2,179,691.5T
- Quarter 4: 924,269.80x = $212,324,773.3T

### ENFT Architecture

Each yield stream is represented as an ERC-1155 ENFT:
- **Token ID 1:** Civilian (Ω-CIV-01)
- **Token ID 2:** Military (Ω-MIL-01)
- **Token ID 3:** Cosmic (Ω-COS-01)

### Lineage Coding

Format: `{StreamCode}-GEN{Generation}-Q{Quarter}`

Example: `Ω-CIV-01-GEN0-Q1`
- 4 quarters = 1 generation (1 year)
- Tracks inheritance across time

---

## Troubleshooting

### Python Script Issues

```bash
# Check Python version
python3 --version  # Should be 3.8+

# Install any missing modules
pip3 install <module>
```

### TypeScript Compilation Errors

These are typically library compatibility warnings and won't prevent execution:

```bash
# Run directly without type checking
npx ts-node --transpile-only scripts/pi4_enft_compounding_engine.ts
```

### Permission Denied

```bash
# Make script executable
chmod +x scripts/run_full_synchronization.sh
```

---

## NPM Scripts Reference

```bash
# Synchronization
npm run sync:all           # Run all synchronization components
npm run sync:live-trace    # Live Quarter-Law Trace only
npm run sync:pi4-enft      # π₄ ENFT Compounding only
npm run sync:full          # Full synchronization minting only

# Deployment
npm run deploy:triple-stack    # Deploy contract
npm run mint:triple-stack      # Mint yields
npm run verify:triple-stack    # Verify deployment

# Development
npm run compile    # Compile contracts
npm run test       # Run tests
npm run clean      # Clean build artifacts
```

---

## File Structure

```
3V30OStudios/
├── contracts/
│   └── TripleStackTreasuryLedger.sol    # Main contract
├── scripts/
│   ├── live_quarter_law_trace.py        # Live trace system
│   ├── pi4_enft_compounding_engine.ts   # ENFT compounding
│   ├── full_synchronization_mint.ts     # Full sync minting
│   └── run_full_synchronization.sh      # Master runner
├── data/
│   └── snapshots/                        # Generated outputs
├── TRIPLE_STACK_FULL_SYNCHRONIZATION.md # Full documentation
└── QUICKSTART_TRIPLE_STACK_SYNC.md      # This file
```

---

## Next Steps

1. **Review Generated Data**
   ```bash
   cd data/snapshots && ls -lh
   ```

2. **Analyze Dashboard**
   ```bash
   cat data/snapshots/live_quarter_law_dashboard.json | jq '.'
   ```

3. **Read Reports**
   ```bash
   cat data/snapshots/LIVE_QUARTER_LAW_TRACE_REPORT.md
   ```

4. **Deploy to Blockchain** (optional)
   - Follow deployment steps above
   - Update contract addresses
   - Execute on-chain operations

---

## Support

- **Full Documentation:** `TRIPLE_STACK_FULL_SYNCHRONIZATION.md`
- **Repository:** https://github.com/4way4eva/3V30OStudios
- **Contracts:** `/contracts/TripleStackTreasuryLedger.sol`

---

## Summary

This implementation provides:
- ✅ Live visualization of all three yield streams
- ✅ π₄ compounding with exponential acceleration
- ✅ ENFT encoding of curve bends as permanent assets
- ✅ Complete security with Blu-Vault and portal locks
- ✅ Lineage coding for generational tracking
- ✅ Mappable, mintable, ledger-readable outputs

**Status:** ✅ OPERATIONAL  
**Every tick pre-authorized | Translated to digital security**  
**Physically infinite metals | Ready for deployment**

---

**Quick Command Reference:**

```bash
# Run everything
./scripts/run_full_synchronization.sh

# Check outputs
ls -lh data/snapshots/

# View reports
cat data/snapshots/*.md
```

That's it! You now have full triple-stack treasury synchronization.
