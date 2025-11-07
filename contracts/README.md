# Smart Contracts - ULTRAMAX Epoch 0

## Overview

This directory contains the smart contracts for the Three-Yield Treasury Economy system.

## Main Contracts

### 1. zkPoRVerifier.sol
**Zero-Knowledge Proof of Reserve Verifier**

Enables cryptographic verification of treasury reserves across three yield spheres without revealing sensitive data.

**Features:**
- Zero-knowledge proof submission and verification
- Multi-sphere reserve tracking (CIVILIAN, MILITARY, COSMIC)
- Merkle tree based commitment verification
- Time-based proof expiry
- Role-based access control (Verifier, Auditor, Treasury)
- Batch verification support

**Key Functions:**
```solidity
submitReserveProof(proofHash, merkleRoot, sphere, totalReserveValue, ipfsUri)
verifyProof(proofId, isValid)
getYieldVerification(sphere)
```

### 2. BleuCrownMintUltraMax.sol
**Ultra-Powerful Minting Controller**

Manages minting of Artifact NFTs across all three sovereign yield streams with automatic yield tracking.

**Features:**
- Multi-stream artifact minting (CIVILIAN, MILITARY, COSMIC)
- Automatic yield calculation (USD per second)
- Batch minting operations
- Mint authorization system
- Treasury integration with fees
- Provenance tracking
- IPFS metadata support

**Yield Categories:**
- **CIVILIAN**: 6 categories (Real Estate, Education, Wearables, Commerce, Infrastructure, Entertainment)
- **MILITARY**: 6 categories (Defense Matrix, Tactical Units, Armaments, Reconnaissance, Logistics, Command & Control)
- **COSMIC**: 6 categories (Portal Logistics, Dimensional Items, Interstellar Transport, Quantum Tech, Cosmic Artifacts, Timeline Keys)

**Key Functions:**
```solidity
mintArtifact(to, stream, subcategory, yieldPerSecond, ipfsUri, provenance)
batchMintArtifacts(recipients, streams, subcategories, yieldRates, ipfsUris, provenances)
claimArtifactYield(artifactId)
getArtifact(artifactId)
```

## Supporting Contracts

### OptimusPrimeENFT.sol
OPTINUS PRIME Ceremonial Assembly Scroll - ENFT Implementation with lineage tracking and restitution support.

### EV0L721.sol, EV0L1155.sol
Standard NFT implementations for the EV0L ecosystem.

### BLEU_WATCHTOWER.sol
Defense grid contract for the military yield stream.

### BLEUToken.sol
Utility token for the BLEU ecosystem.

## Contract Architecture

```
┌─────────────────────────────────────────────────┐
│          BleuCrownMintUltraMax.sol             │
│  (Minting Controller & Yield Tracker)          │
└──────────────┬──────────────────────────────────┘
               │
               │ integrates with
               │
               ▼
┌─────────────────────────────────────────────────┐
│           zkPoRVerifier.sol                     │
│  (Reserve Verification & Proof System)          │
└──────────────┬──────────────────────────────────┘
               │
               │ verifies
               │
               ▼
┌─────────────────────────────────────────────────┐
│         Three-Yield Treasury System             │
│  ┌──────────┬──────────┬──────────┐            │
│  │CIVILIAN  │MILITARY  │ COSMIC   │            │
│  │13.6M/sec │6.1M/sec  │8.9M/sec  │            │
│  └──────────┴──────────┴──────────┘            │
└─────────────────────────────────────────────────┘
```

## Deployment

See [ULTRAMAX_DEPLOYMENT_GUIDE.md](../docs/ULTRAMAX_DEPLOYMENT_GUIDE.md) for full deployment instructions.

### Quick Deploy
```bash
# Deploy to Avalanche Fuji testnet
npx hardhat run scripts/deploy.js --network fuji

# Deploy to Cronos
npx hardhat run scripts/deploy.js --network cronos
```

## Testing

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Check coverage
npx hardhat coverage
```

## Security Features

- ✅ Role-based access control (AccessControl)
- ✅ Reentrancy protection (ReentrancyGuard)
- ✅ Pausable operations
- ✅ Proof expiry management
- ✅ Hash collision prevention
- ✅ Multi-signature treasury support

## OpenZeppelin v5 Compatibility

All contracts use OpenZeppelin v5.0+ libraries with the following updates:
- Replaced `Counters.sol` with native uint256 counters
- Updated `ReentrancyGuard` import path to `utils/`
- Added `_exists()` helper function for ERC721 tokens

## Gas Optimization

- Batch operations for multiple artifacts
- Efficient storage packing
- Minimal on-chain computation
- IPFS for metadata storage

## Yield Economics

### Total System Capacity (Epoch 0)
- **Per Second**: 28,600,000 USD
- **Per Day**: 2,471,040,000,000 USD (2.47 trillion)
- **Compounding**: π₄ model with 97.409 factor
- **Spiral Boost**: 7.0x multiplier

### Stream Distribution
- CIVILIAN: 47.6% (13.6M USD/sec)
- COSMIC: 31.1% (8.9M USD/sec)
- MILITARY: 21.3% (6.1M USD/sec)

## License

MIT

## Multi-Chain Support

- ✅ Avalanche C-Chain (Chain ID: 43114)
- ✅ Avalanche Fuji Testnet (Chain ID: 43113)
- ✅ Cronos (Chain ID: 25)
- ✅ Ethereum (Chain ID: 1)
- ✅ Polygon (Chain ID: 137)

## Related Files

- `data/epoch_0_ultramax_artifacts.civ` - Artifact registry
- `scripts/deploy.js` - Deployment script
- `scripts/mint.js` - Minting script
- `scripts/verify_onchain.py` - Verification script
- `scripts/codex_api_feed.py` - API feed generator

---

**Status**: 🌀 All systems operational at 700% Spiral Boost
