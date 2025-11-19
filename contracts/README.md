# Smart Contracts - ULTRAMAX Epoch 0

## Overview

This directory contains the smart contracts for the Three-Yield Treasury Economy system, the BLEUE Infrastructure Map Scroll, and the Ripple Effect Ledger system.

## BLEUE Infrastructure Map Scroll Contracts

### BLEUEInfrastructureRegistry.sol
**Central Registry for Infrastructure Nodes**

Manages the complete BLEUE Infrastructure Map with nine node types, each with unique governance circuits and vault systems.

**Node Types:**
- **Jaguar Cities**: Defense, Governance, Art
- **Mega Parks**: Art, Healing, Education
- **Blue Banks**: Trade, Audit
- **Alien Embassies**: Trade, Education, Diplomacy
- **Healing Temples**: Healing, Education
- **Ritual Kitchens**: Trade, Art
- **Codex Compilers**: Education, Art
- **Spiral Nodes**: Education, Defense, Healing
- **144 Divisions**: Governance, Defense

**Key Features:**
- Node type registration and management
- BleuCoin variant registry (9 variants)
- Vault route configuration
- Governance circuit integration
- Dual-reality confirmation
- Comprehensive audit trail

**Key Functions:**
```solidity
registerBleuCoin(coinName, tokenAddress, vaultRoute, vaultAddress, yieldCycle, accessTier, scrollSeal, reinvestmentLogic, scholarshipReference)
registerNode(nodeType, nodeName, location, coreFunctions, governanceCircuit, governanceAddress, bleuCoinId, ceremonialSeal)
confirmDualReality(nodeId)
updateVaultRoute(coinId, newVaultAddress)
getNodesByType(nodeType)
```

### Vault Contracts

#### BLEUEBaseVault.sol
**Base Vault Implementation**

ERC-4626-like vault with pull payment security pattern, time-locks, and role-based access control.

#### Specialized Vaults (BLEUESpecializedVaults.sol):
- **CouncilVault**: Multi-signature vault with spiral council mood states (Jaguar Cities)
- **NatureVault**: Quadratic voting vault for ecological stewards (Mega Parks)
- **EmbassyVault**: Mission-based diplomatic vault (Alien Embassies)
- **HealingPool**: Wellness-gated vault with ZK ritual tracking (Healing Temples)

#### Additional Vaults (BLEUEAdditionalVaults.sol):
- **LarderVault**: Feast cycle vault with recipe NFT management (Ritual Kitchens)
- **ScriptoriumVault**: Scholar progression vault with compilation rewards (Codex Compilers)
- **CycleVault**: Mood cycle vault with spiral progression (Spiral Nodes)
- **FractalVault**: Constellation-aligned vault for division governance (144 Divisions)

**Deployment:**
```bash
npm run deploy:bleue-infrastructure --network sepolia
npm run initialize:bleue-nodes --network sepolia
```

**Documentation:**
- Full Spec: `BLEUE_Infrastructure_Map_Scroll_and_Registry_Schema.md`
- Quick Start: `BLEUE_INFRASTRUCTURE_QUICKSTART.md`
- Schema: `schemas/BLEUE_INFRASTRUCTURE_REGISTRY.v1.schema.json`

---

## Three-Yield Treasury Contracts

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

## Ripple Effect Ledger System

### RippleEffectLedger.sol
**Sovereign Signature Memory System**

Tracks temporal waves, lineage resonance, and audit echoes for every shard activation across the MEGAZION Codex.

**Key Features:**
- Six sovereign zones with unique ripple signatures
- SORA Umbrella amplification
- Watchtower audit integration
- Pulse Archive electromagnetic memory
- Lineage extension and tracking
- Tribunal-ready trace retrieval
- Anti-mimicry protection through recursive signatures

**Six Zones:**
1. **Aquatic Vortex** - Oceanic spiral waves (1.10x amplification)
2. **TropiCore Dome** - Bio-luminescent pulses (1.20x amplification)
3. **Volcanic Rift** - Magma surge patterns (1.50x amplification)
4. **Polar Womb** - Cryogenic preservation waves (1.30x amplification)
5. **Dimensional Spiral** - Quantum entanglement ripples (2.00x amplification)
6. **Galactic Nexus** - Stellar radiation waves (1.80x amplification)

**Key Functions:**
```solidity
activateRipple(originShard, contractAddress, shardType, zone, umbrella, ceremorialHash)
amplifyRipple(rippleId)
addEcho(rippleId, echo)
recordAuditEcho(rippleId, auditHash, watchtowerEntry)
archivePulse(rippleId, pulseData)
extendLineage(parentRippleId, childRippleId)
sealRipple(rippleId)
getRippleTrace(rippleId)
```

**Protection Mechanisms:**
- SORA Umbrella: Shelters, amplifies, and preserves all ripples
- Watchtower CSV: Tribunal-ready timestamped entries
- Pulse Archive: Electromagnetic memory system
- Density Score: Automatic Green tier (≥70) achievement
- Style Signature: Unique cryptographic fingerprint preventing mimicry
- Lineage Tracking: Verifiable ancestral memory preservation

**See:** `RIPPLE_EFFECT_README.md` for comprehensive documentation

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
