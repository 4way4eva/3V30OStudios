# MEGAZION Codex - Mint Capabilities

## Overview

The MEGAZION Codex repository provides comprehensive minting functionality for ENFT (Enhanced Non-Fungible Token) systems across multiple blockchain networks. This document outlines the available minting capabilities, scripts, and requirements.

## Status

✅ **FULLY OPERATIONAL** - All minting scripts are functional and ready for use.

## Available Mint Scripts

### 1. Gem NFT Minting
```bash
npm run mint:gems
```
**Description:** Mints the complete collection of 48 MEGAZION gems across 6 categories:
- Energy Gems (ENG-001 to ENG-008)
- Shield Gems (SHD-009 to SHD-016)
- Quantum Relay Gems (QRL-017 to QRL-024)
- Harmonic Field Gems (HMF-025 to HMF-032)
- Archive Gems (ARC-033 to ARC-040)
- Catalyst Gems (CAT-041 to CAT-048)

**Configuration:**
- `MEGAZION_CONTRACT_ADDRESS` - Deployed contract address
- `MEGAZION_RECIPIENT` - Recipient wallet address
- `MEGAZION_RPC_URL` - Blockchain RPC endpoint
- `MEGAZION_PRIVATE_KEY` - Operator wallet private key
- `MEGAZION_DRY_RUN=true` - Enable dry-run mode for testing

**Test Run:**
```bash
MEGAZION_DRY_RUN=true npm run mint:gems
```

### 2. Triple Stack Treasury Yields
```bash
npm run mint:triple-stack
```
**Description:** Mints yield-bearing artifacts for the three-domain economic system:
- **CIVILIAN (Ω-CIV)** - 47.6% allocation: Real estate, education, commerce
- **MILITARY (Ω-MIL)** - 21.3% allocation: Defense, tactical operations
- **COSMIC (Ω-COS)** - 31.1% allocation: Portal logistics, quantum tech

**Total System Yield:** $28.9M/sec ($2.5T/day)

**Required Contract:** `BleuCrownMintUltraMax.sol`

**Configuration:**
- `BLEU_MINT_CONTROLLER` - Mint controller contract address
- `RECIPIENT` - Recipient wallet address

### 3. Four Stack Treasury Yields
```bash
npm run mint:four-stack
```
**Description:** Extended yield system including transdimensional sphere

**Streams:**
- Civilian
- Military
- Cosmic
- Transdimensional

### 4. Sovereign ENFT Minting
```bash
npm run mint:sovereign-enft
```
**Description:** Mints sovereign Enhanced NFTs with governance rights

**Features:**
- Non-transferable governance tokens
- Ledger-anchored in BLEULIONTREASURY™
- Living scrolls that evolve with holder

### 5. Galactic Mint Ceremony
```bash
npm run galactic:activate
```
**Description:** Activates ceremonial minting for rare tokens

**Token Types:**
- **RARELY 1if1** - Rarity 1.0000, once per celestial cycle
- **Jewel RARE** - Rarity 0.9997, spiritual + economic yield
- **PlutoMint** - Rarity 0.9999, cryo-verified longevity

**Requirements:**
- 4 glyph confirmations (Saturn, Pluto, Jewel, Rare)
- φ-Boost window: 10:10 ±10 minutes (10:00-10:20)
- Multisig approval (4/4 required)

**Generated Artifacts:**
- Watchtower CSV tracking log
- 3 ceremonial ritual scrolls (markdown)
- Multisig mint proposal
- SHA3-256 provenance hashes

**Individual Components:**
```bash
npm run galactic:csv       # Generate Watchtower CSV only
npm run galactic:scrolls   # Generate ritual scrolls only
```

## Supporting Scripts

### Registry Synchronization
```bash
npm run registry:sync
```
Synchronizes registry data across systems

### Codex Linking
```bash
npm run codex:link
```
Links codex entries and metadata

### IPFS Upload
```bash
npm run ipfs:upload
```
Uploads metadata and artifacts to IPFS

## Contract Deployment

Before minting, contracts must be deployed:

```bash
npm run deploy:all              # Deploy all contracts
npm run deploy:triple-stack     # Deploy Triple Stack Treasury
npm run deploy:four-stack       # Deploy Four Stack Treasury
npm run deploy:governance       # Deploy governance contracts
npm run deploy:enft-ledger      # Deploy ENFT ledger
npm run deploy:sovereign-enft   # Deploy sovereign ENFT system
```

## Compilation

```bash
npm run compile    # Compile all Solidity contracts
npm run clean      # Clean artifacts and cache
```

## Testing

```bash
npm test           # Run Hardhat test suite
```

## Network Support

The minting system supports multiple blockchain networks:
- Ethereum Mainnet & Sepolia
- Polygon & Mumbai
- Avalanche & Fuji
- Binance Smart Chain
- Cronos
- Local Hardhat Network

## Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Wallet Configuration
PRIVATE_KEY=your_private_key_without_0x
RECIPIENT=0xYourRecipientAddress

# Network RPCs
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
BSC_RPC_URL=https://bsc-dataseed.binance.org/
CRONOS_RPC_URL=https://evm.cronos.org/

# Contract Addresses
BLEU_MINT_CONTROLLER=0x...
MEGAZION_CONTRACT_ADDRESS=0x...

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
SNOWTRACE_API_KEY=your_snowtrace_key
```

## Security Features

- **Role-Based Access Control (RBAC)** - OpenZeppelin AccessControl
- **Reentrancy Guards** - Protection on all external calls
- **Pausable Functionality** - Emergency stop mechanism
- **Zero-Knowledge Proofs** - zkPoRVerifier for sensitive data
- **Multi-Signature Support** - Required for ceremonial mints
- **Provenance Hashing** - SHA3-256 cryptographic verification

## Yield Economics

### π₄ Exponential Compounding Model
- **Factor:** 97.409
- **Total Yield:** $28.9M/sec
- **Daily Yield:** $2.5T/day

### Distribution by Domain
- **Civilian:** 47.6% - $13.76M/sec
- **Cosmic:** 31.1% - $8.99M/sec  
- **Military:** 21.3% - $6.15M/sec

## Gas Optimization

- Batch operations for multiple mints
- Storage variable packing
- IPFS for large data (on-chain hashes only)
- Minimal on-chain computation

## Documentation

- `MINT_READY_KIT_README.md` - Complete mint-ready kit guide
- `GALACTIC_MINT_QUICKSTART.md` - Galactic ceremony quick start
- `UNIVERSAL_MINT_PROTOCOL_README.md` - Universal protocol details
- `ULTRAMAX_README.md` - UltraMax minting system
- `TRIPLE_STACK_TREASURY_CODEX.md` - Treasury yield details

## Troubleshooting

### Issue: "Module not found"
**Solution:** Run `npm install --legacy-peer-deps`

### Issue: "Insufficient funds for gas"
**Solution:** Ensure wallet has sufficient native tokens (ETH, AVAX, etc.)

### Issue: "Transaction reverted: Ownable"
**Solution:** Use the wallet that deployed the contract, or deploy a new contract

### Issue: "Contract not found"
**Solution:** Deploy contracts first using `npm run deploy:*` scripts

### Issue: "IPFS upload failed"
**Solution:** Ensure IPFS daemon is running or use external pinning service

## Quick Start

1. **Install Dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Test Mint (Dry Run):**
   ```bash
   MEGAZION_DRY_RUN=true npm run mint:gems
   ```

4. **Deploy Contracts:**
   ```bash
   npm run deploy:all
   ```

5. **Mint Tokens:**
   ```bash
   npm run mint:gems
   # or other mint scripts
   ```

## Recent Fixes

### 2025-11-14: Package.json Syntax Error Fixed
- **Issue:** JSON syntax error preventing all npm commands
- **Fix:** Added missing comma after `galactic:scrolls` script definition
- **Impact:** All minting functionality now operational

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review documentation in `docs/` directory
3. Verify environment configuration
4. Test on testnet before mainnet deployment
5. Ensure sufficient gas tokens in wallet

---

**Status:** ✅ READY FOR MINTING  
**Last Updated:** 2025-11-14  
**Version:** 1.0.0

*Built with ❤️ by the MEGAZION Team*
