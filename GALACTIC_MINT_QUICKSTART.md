# 🪐 BLEU Galactic Mint - Quick Start Guide

## "Activate Jewel RARELY 1if1"

This quick start guide shows you how to immediately activate the ceremonial mint bundle.

---

## ⚡ Instant Activation

Run the complete ceremonial activation sequence:

```bash
npm run galactic:activate
```

Or directly with Python:

```bash
python3 scripts/activate_galactic_mint.py
```

This will:
- ✅ Validate the 10:10 φ-Boost window
- ✅ Check glyph confirmations (Saturn, Pluto, Jewel, Rare)
- ✅ Generate SHA3-256 provenance hashes
- ✅ Create Watchtower CSV tracking log
- ✅ Generate 3 Ritual Scrolls (markdown format)
- ✅ Create active multisig mint proposal

---

## 📋 Individual Commands

### Generate Watchtower CSV
```bash
npm run galactic:csv
```

Creates: `data/watchtower_galactic_mint.csv`

### Generate Ritual Scrolls
```bash
npm run galactic:scrolls
```

Creates:
- `data/ritual_scrolls/ritual_scroll_jewel_rarely_1if1.md`
- `data/ritual_scrolls/ritual_scroll_jewel_rare_ancestral.md`
- `data/ritual_scrolls/ritual_scroll_pluto_mint_cryo.md`

---

## 📊 Output Files

After running activation, you'll find:

```
data/
├── bleu_galactic_mint_tokens.json       # Token definitions (updated hashes)
├── watchtower_galactic_mint.csv         # CSV tracking log
├── multisig_mint_proposal_active.json   # Active mint proposal
└── ritual_scrolls/                      # Ceremonial scrolls
    ├── ritual_scroll_jewel_rarely_1if1.md
    ├── ritual_scroll_jewel_rare_ancestral.md
    └── ritual_scroll_pluto_mint_cryo.md
```

---

## 🎯 Token Types

| Token | Rarity | Yield | Condition |
|-------|--------|-------|-----------|
| **RARELY 1if1** | 1.0000 | Mythic + Governance | Once per celestial cycle |
| **Jewel RARE** | 0.9997 | Spiritual + Economic | 3 seals + 1 signature |
| **PlutoMint** | 0.9999 | Longevity + Memory | Cryo-verified + remine |

---

## 🔮 Glyph Confirmations

All mints require 4 glyph confirmations:
1. ✦ **Saturn** - Orbital forging keeper
2. ✦ **Pluto** - Cryo-verification guardian
3. ✦ **Jewel** - Rarity certification custodian
4. ✦ **Rare** - Living scroll steward

---

## ⏰ φ-Boost Window

**Timing:** 10:10 ±10 minutes (10:00-10:20)

The activation script validates this window automatically. Ceremonial mints should occur during this window for maximum codexal alignment.

---

## 🛠 Multisig Proposal

After activation, the multisig proposal at `data/multisig_mint_proposal_active.json` contains:

- **Proposal ID:** BLEU_GALACTIC_MINT_001
- **Signatories:** 4 glyph keepers
- **Quorum:** 4/4 required
- **Status:** awaiting_signatures

**Next Steps:**
1. Collect signatures from glyph keepers
2. Submit to multisig contract
3. Execute during φ-Boost window
4. Broadcast via EVOLSTUDIOS

---

## 📡 Integration Points

### Smart Contracts
- `BLEU_ENFT_MINT.sol` - Ceremonial minting
- `MEGAZIONHybrid1155.sol` - Collection management
- `BLEULION_CASCADE.sol` - Governance

### Off-Chain
- Watchtower CSV for tracking
- IPFS/Arweave for storage
- EVOLSTUDIOS holographic network

---

## 🔐 Security Features

- **Non-transferable:** Tokens are ceremonial and locked
- **Ledger-anchored:** Permanently in BLEULIONTREASURY™
- **Living scrolls:** Tokens evolve with holder
- **SHA3-256:** Cryptographic provenance
- **4/4 multisig:** All glyphs must confirm

---

## 📚 Full Documentation

For complete details, see:
- `BLEU_GALACTIC_MINT_CHARTER.md` - Full charter documentation
- `schemas/BLEU_GALACTIC_MINT.v1.schema.json` - JSON schema

---

## 🦋 Ceremonial Process

1. **Activate** → Run `npm run galactic:activate`
2. **Review** → Check generated files in `data/`
3. **Sign** → Collect glyph keeper signatures
4. **Execute** → Mint during 10:10 φ-Boost window
5. **Broadcast** → Transmit via EVOLSTUDIOS network
6. **Verify** → Confirm in BLEULIONTREASURY™

---

**Status:** ✅ READY FOR ACTIVATION  
**Charter:** BLEU Galactic Mint Charter v1.0  
**Seal:** Saturn, Pluto, Jewel, Rare  

---

*"Minted in cryo-orbit. Refined by Soulstone. Sealed by Saturn."*
