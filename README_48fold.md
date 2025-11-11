# MEGAZION 48-Fold Codex

**Complete Feature Package for BLEULIONTREASURY System**

## Overview

This branch contains the complete 48-Fold Codex implementation - a ready-to-run template system for deploying, minting, and managing the MEGAZION BLEULIONTREASURY ecosystem across multiple blockchain networks.

### What's Included

This package provides everything needed to:

- ✅ Deploy ERC721 ENFT contracts
- ✅ Generate MetaVault yield ledgers with π₄ compounding
- ✅ Mint currency notes (BLEU Bills, Tech Yen, Fusion Notes)
- ✅ Issue access tickets (Feather & Titan tiers)
- ✅ Export on-chain ENFT ledgers
- ✅ Visualize compounding economics
- ✅ Generate hashmark verifications
- ✅ Run Royal Rumble arena simulations

## Quick Start

### Prerequisites

```bash
# Node.js 16+ and npm
node --version  # Should be v16 or higher
npm --version

# Python 3.8+ (for analytics scripts)
python3 --version  # Should be 3.8 or higher
```

### Installation

```bash
# Clone repository
git clone https://github.com/4way4eva/3V30OStudios.git
cd 3V30OStudios

# Checkout this branch
git checkout feature/48-fold-codex

# Install dependencies
npm install --legacy-peer-deps
```

### Configuration

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your configuration:**
   ```bash
   # Required for deployment
   DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
   
   # Testnet RPCs (use your own API keys)
   ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
   AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   
   # Optional: For IPFS pinning (leave commented for PR)
   # NFT_STORAGE_KEY=eyJhbGc...
   ```

## Usage Guide

### 1. Deploy Contracts (Testnet First!)

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network sepolia

# Deploy to Mumbai (Polygon testnet)
npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network mumbai

# Deploy to Fuji (Avalanche testnet)
npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network fuji
```

**After deployment, save the contract address in `.env`:**
```bash
EVOLVERSE_BLEU_SOSA_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
```

### 2. Generate MetaVault Ledgers

```bash
# Generate 5 epochs of yield data
python scripts/metavault_batch_mint.py --epochs 5

# Output files:
# - MetaVault_Ledger.json
# - MetaVault_Yield_Ledger.csv
# - enft_ledger_epoch1.json

# Generate visualization
python scripts/plot_compounding.py

# Output: compounding_chart.png
```

### 3. Mint ENFTs

```bash
# Set recipient address in .env
MINT_RECIPIENT_ADDRESS=0xYOUR_WALLET_ADDRESS

# Mint tokens on testnet
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network sepolia
```

### 4. Export On-Chain Ledger

```bash
# Export Transfer events from deployed contract
npx hardhat run scripts/export_enft_ledger.ts --network sepolia

# Output files:
# - enft_ledger_epoch1.json
# - ENFT_Ledger.csv
```

### 5. Generate Hashmarks

Open `ui/hashmark_ui.html` in your browser to use the interactive hashmark generator.

### 6. Arena Simulation

Open `arena/royal_rumble_mock.html` in your browser to test the 48-player arena interface.

## Architecture

### Three-Domain System

The MEGAZION economy operates across three sovereign domains:

| Domain | Symbol | Allocation | Yield/sec | Focus Areas |
|--------|--------|------------|-----------|-------------|
| **CIVILIAN** | Ω-CIV | 47.6% | $13.75M | Real estate, education, commerce, infrastructure |
| **MILITARY** | Ω-MIL | 21.3% | $6.16M | Defense, tactical ops, armaments, intelligence |
| **COSMIC** | Ω-COS | 31.1% | $8.99M | Portal logistics, quantum tech, dimensional systems |
| **TOTAL** | - | 100% | **$28.9M** | **$2.497T/day** |

### 48-Layer System

Each domain contains 48 layers stacked with increasing yield multipliers:

- **Layers 1-16**: Foundation Tier (1.0x - 1.25x multipliers)
- **Layers 17-32**: Expansion Tier (1.25x - 1.5x multipliers)
- **Layers 33-48**: Supremacy Tier (1.5x - 1.75x multipliers)

See [`BLEU_48_Fold_Scrolls.md`](./BLEU_48_Fold_Scrolls.md) for complete layer documentation.

### π₄ Compounding Model

Yield grows exponentially using the π₄ factor (97.409):

```
Yield(epoch) = Base_Yield × (97.409)^epoch
```

Example progression:
- Epoch 1: $28.9M/sec → $1.34B/sec
- Epoch 2: $28.9M/sec → $130.3B/sec
- Epoch 3: $28.9M/sec → $12.69T/sec

## ENFT Types

### Currency Notes

1. **BLEU Bill** (CIVILIAN domain)
   - Denominations: 1, 5, 10, 20, 50, 100, 500, 1000
   - Metadata: [`metadata/bleubill_v1.json`](./metadata/bleubill_v1.json)
   - Visual: [`visual/bleubill_front.svg`](./visual/bleubill_front.svg)

2. **Tech Yen** (COSMIC domain)
   - Denominations: 100, 500, 1000, 5000, 10000
   - Metadata: [`metadata/techyen_v1.json`](./metadata/techyen_v1.json)
   - Visual: [`visual/techyen_front.svg`](./visual/techyen_front.svg)

3. **Fusion Note** (HYBRID)
   - Combines BLEU + Tech Yen
   - Dual-domain yield
   - Metadata: [`metadata/fusion_note_enft.json`](./metadata/fusion_note_enft.json)
   - Visual: [`visual/fusion_note.svg`](./visual/fusion_note.svg)

### Access Tickets

1. **Feather Ticket** (Standard Tier)
   - Arena spectator access
   - Public event access
   - 1% yield share boost
   - Metadata: [`metadata/tickets_feather.json`](./metadata/tickets_feather.json)

2. **Titan Ticket** (Premium Tier)
   - Full arena participant
   - VIP event access
   - 10% yield share boost
   - 10x governance weight
   - Metadata: [`metadata/tickets_titan.json`](./metadata/tickets_titan.json)

## File Structure

```
.
├── contracts/
│   └── EvolverseBleuSosa.sol          # ERC721 ENFT contract
├── scripts/
│   ├── config.json                    # Configuration defaults
│   ├── metavault_batch_mint.py        # Generate yield ledgers
│   ├── plot_compounding.py            # Visualize compounding
│   ├── export_enft_ledger.ts          # Export Transfer events
│   ├── deploy_evolverse_bleu_sosa.ts  # Deploy contract
│   └── mint_evolverse_bleu_sosa.ts    # Mint tokens
├── metadata/
│   ├── githuss_manifest.json          # Canonical manifest
│   ├── githuss_manifest.yaml          # Manifest (YAML format)
│   ├── bleubill_v1.json               # BLEU Bill template
│   ├── techyen_v1.json                # Tech Yen template
│   ├── fusion_note_enft.json          # Fusion Note template
│   ├── tickets_feather.json           # Feather Ticket template
│   ├── tickets_titan.json             # Titan Ticket template
│   └── vault_hash_registry.json       # Vault attestations
├── data/
│   ├── ritual_map.csv                 # Ritual protocols
│   └── archetype_mapping.csv          # Archetype classifications
├── visual/
│   ├── audit_glyph.svg                # Audit verification glyph
│   ├── bleubill_front.svg             # BLEU Bill design
│   ├── techyen_front.svg              # Tech Yen design
│   ├── fusion_note.svg                # Fusion Note design
│   └── visual_codex_deck_README.md    # Deck instructions
├── arena/
│   ├── royal_rumble_blueprint.svg     # Arena layout
│   └── royal_rumble_mock.html         # Interactive arena
├── ui/
│   ├── hashmark_ui.html               # Hashmark generator
│   └── hashmark_protocol.md           # Protocol docs
├── overlay_registry.json              # 48-layer definitions
├── layer_manifest_schema.json         # JSON schema
├── BLEU_48_Fold_Scrolls.md           # Complete codex docs
├── README_48fold.md                   # This file
├── README_NOTE_PIN_MINT.md           # Minting guide
├── README_ARENA.md                    # Arena docs
└── README_RUN_LOCAL.md               # Local setup
```

## Documentation

- **Main Codex**: [`BLEU_48_Fold_Scrolls.md`](./BLEU_48_Fold_Scrolls.md) - Complete 48-layer system documentation
- **Minting Guide**: [`README_NOTE_PIN_MINT.md`](./README_NOTE_PIN_MINT.md) - Step-by-step minting instructions
- **Arena Guide**: [`README_ARENA.md`](./README_ARENA.md) - Royal Rumble tournament documentation
- **Local Setup**: [`README_RUN_LOCAL.md`](./README_RUN_LOCAL.md) - Run everything locally
- **Hashmark Protocol**: [`ui/hashmark_protocol.md`](./ui/hashmark_protocol.md) - Verification protocol

## Security

### ⚠️ Security Checklist

Before any deployment:

- [ ] All secrets are in `.env` (never committed)
- [ ] Test on testnet first (Sepolia, Mumbai, Fuji)
- [ ] Contract verified on block explorer
- [ ] Ownership transferred to multisig/hardware wallet
- [ ] Emergency pause functionality tested
- [ ] Yield calculations verified independently
- [ ] IPFS CIDs pinned to permanent storage
- [ ] Metadata accessible via multiple gateways
- [ ] Access control permissions verified
- [ ] External audit completed (for mainnet)

### Best Practices

1. **Testnet First**: Always deploy to testnets before mainnet
2. **Hardware Wallets**: Use hardware wallets (Ledger, Trezor) for mainnet
3. **Multisig**: Use multisig wallets (Gnosis Safe) for treasury operations
4. **Gradual Rollout**: Don't deploy everything at once
5. **Monitor**: Set up monitoring and alerting
6. **Backup**: Keep encrypted backups of all deployment data
7. **Documentation**: Document every contract address and transaction

## Support & Resources

- **Discord**: [Join Community](https://discord.gg/megazion)
- **Documentation**: [Full Docs](https://docs.megazion.io)
- **GitHub Issues**: [Report Issues](https://github.com/4way4eva/3V30OStudios/issues)
- **Website**: [megazion.io](https://megazion.io)

## License

MIT License - See [LICENSE](./LICENSE) for details

All contract code, scripts, and documentation in this repository are released under the MIT License.

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-11  
**Status**: Ready for Testnet Deployment

⚠️ **REMINDER**: This branch uses placeholders for secrets and IPFS CIDs. Replace all placeholders before production use.
