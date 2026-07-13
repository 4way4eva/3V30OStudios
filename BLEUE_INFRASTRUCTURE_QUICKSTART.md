# BLEUE Infrastructure Map Scroll - Quick Start Guide

## Overview

The BLEUE Infrastructure Map Scroll is a comprehensive smart contract system that implements a ceremonial and technical registry for nine types of infrastructure nodes, each with its own governance circuit, vault system, and BleuCoin variant.

## Architecture

### Node Types

1. **Jaguar Cities** - Defense, Governance, Art
2. **Mega Parks** - Art, Healing, Education
3. **Blue Banks** - Trade, Audit
4. **Alien Embassies** - Trade, Education, Diplomacy
5. **Healing Temples** - Healing, Education
6. **Ritual Kitchens** - Trade, Art
7. **Codex Compilers** - Education, Art
8. **Spiral Nodes** - Education, Defense, Healing
9. **144 Divisions** - Governance, Defense

### Core Contracts

- **BLEUEInfrastructureRegistry.sol** - Central registry for all nodes and tokens
- **BLEUEBaseVault.sol** - Base vault implementation with ERC-4626 patterns
- **BLEUESpecializedVaults.sol** - Specialized vaults (Council, Nature, Embassy, Healing)
- **BLEUEAdditionalVaults.sol** - Additional vaults (Larder, Scriptorium, Cycle, Fractal)

## Installation

```bash
npm install --legacy-peer-deps
```

## Compilation

```bash
npx hardhat compile
```

## Deployment

### 1. Deploy All Contracts

```bash
npx hardhat run scripts/deploy_bleue_infrastructure.ts --network sepolia
```

This will deploy:
- BLEUEInfrastructureRegistry
- All 8 specialized vault contracts

### 2. Initialize Nodes

After deployment, update the contract addresses in your `.env` file:

```env
REGISTRY_ADDRESS=0x...
COUNCIL_VAULT_ADDRESS=0x...
NATURE_VAULT_ADDRESS=0x...
HEALING_POOL_ADDRESS=0x...
LARDER_VAULT_ADDRESS=0x...
SCRIPTORIUM_VAULT_ADDRESS=0x...
CYCLE_VAULT_ADDRESS=0x...
FRACTAL_VAULT_ADDRESS=0x...
```

Then initialize the nodes:

```bash
npx hardhat run scripts/initialize_bleue_nodes.ts --network sepolia
```

## Usage Examples

### Register a BleuCoin Variant

```javascript
const registry = await ethers.getContractAt("BLEUEInfrastructureRegistry", registryAddress);

await registry.registerBleuCoin(
    "JaguarCoin",           // Coin name
    tokenAddress,           // Token contract address
    "Council Vault",        // Vault route
    vaultAddress,           // Vault contract address
    1,                      // YieldCycle.EventDriven
    7,                      // AccessTier.High
    "CouncilSigil",         // Scroll seal
    "20% to festivals",     // Reinvestment logic
    "Codex #7"              // Scholarship reference
);
```

### Register an Infrastructure Node

```javascript
await registry.registerNode(
    0,                              // NodeType.JaguarCity
    "Tenochtitlan Prime",           // Node name
    "Sector 7, Grid Alpha",         // Location
    ["Defense", "Governance"],      // Core functions
    "Spiral Council",               // Governance circuit
    governanceAddress,              // Governance contract
    0,                              // BleuCoin ID
    ceremonialSeal                  // Ceremonial seal (bytes32)
);
```

### Confirm Dual-Reality Validation

```javascript
await registry.confirmDualReality(nodeId);
```

### Use Council Vault

```javascript
const councilVault = await ethers.getContractAt("CouncilVault", councilVaultAddress);

// Add council member
await councilVault.addCouncilMember(memberAddress);

// Change mood state
await councilVault.changeMood(0); // 0 = Joy

// Approve decree
const decreeId = ethers.keccak256(ethers.toUtf8Bytes("decree-001"));
await councilVault.approveDecree(decreeId);
```

### Use Nature Vault

```javascript
const natureVault = await ethers.getContractAt("NatureVault", natureVaultAddress);

// Add ecological steward
await natureVault.addSteward(stewardAddress);

// Propose art grant
const grantId = ethers.keccak256(ethers.toUtf8Bytes("grant-001"));
await natureVault.proposeGrant(grantId, recipientAddress, amount);

// Vote on grant (quadratic)
await natureVault.voteOnGrant(grantId, voteWeight);
```

### Use Healing Pool

```javascript
const healingPool = await ethers.getContractAt("HealingPool", healingPoolAddress);

// Update wellness score
await healingPool.updateWellnessScore(userAddress, 150);

// Record ritual (ZK hash)
const ritualHash = ethers.keccak256(ethers.toUtf8Bytes("ritual-data"));
await healingPool.recordRitual(ritualHash);

// Claim (requires wellness score >= 100)
await healingPool.claim();
```

### Use Larder Vault

```javascript
const larderVault = await ethers.getContractAt("LarderVault", larderVaultAddress);

// Create feast
const feastId = ethers.keccak256(ethers.toUtf8Bytes("feast-001"));
await larderVault.createFeast(feastId, "Harvest Festival", totalReward);

// Record attendance
await larderVault.recordAttendance(feastId, attendeeAddress);

// Distribute rewards
await larderVault.distributeFeastRewards(feastId);
```

### Use Scriptorium Vault

```javascript
const scriptoriumVault = await ethers.getContractAt("ScriptoriumVault", scriptoriumVaultAddress);

// Register scholar
await scriptoriumVault.registerScholar(scholarAddress);

// Record scroll compilation
const scrollId = ethers.keccak256(ethers.toUtf8Bytes("scroll-001"));
await scriptoriumVault.recordScrollCompilation(scrollId, scholarAddress, reward);

// Verify scroll
await scriptoriumVault.verifyScroll(scrollId);
```

### Use Cycle Vault

```javascript
const cycleVault = await ethers.getContractAt("CycleVault", cycleVaultAddress);

// Advance mood cycle
await cycleVault.advanceCycle(0); // 0 = Joy

// Update spiral progression
await cycleVault.updateSpiralProgression(userAddress, progression);

// Set user mood
await cycleVault.setUserMood(2); // 2 = Envy
```

### Use Fractal Vault

```javascript
const fractalVault = await ethers.getContractAt("FractalVault", fractalVaultAddress);

// Create division (1-144)
await fractalVault.createDivision(1, "Orion", divisionHeadAddress);

// Add division member
await fractalVault.addDivisionMember(1, memberAddress, stakeAmount);

// Allocate resources
await fractalVault.allocateResources(1, amount);
```

## Enumerations

### NodeType
```
0 - JaguarCity
1 - MegaPark
2 - BlueBank
3 - AlienEmbassy
4 - HealingTemple
5 - RitualKitchen
6 - CodexCompiler
7 - SpiralNode
8 - Division144
```

### AccessTier
```
0 - Open
1 - Quadratic
2 - Steward
3 - RitualLeader
4 - Scholar
5 - Master
6 - WellnessTier
7 - High
8 - Mission
9 - DivisionStake
```

### YieldCycle
```
0 - Continuous
1 - EventDriven
2 - Seasonal
3 - MoonCycle
4 - FeastEvent
5 - ScrollCompletion
6 - MoodCycle
7 - CosmicAlign
```

## Security Features

- **Role-Based Access Control** - OpenZeppelin AccessControl
- **Reentrancy Protection** - ReentrancyGuard on all external calls
- **Pull Payment Pattern** - Users claim rewards (anti-reentrancy)
- **Time Locks** - Configurable lock durations
- **Emergency Pause** - Guardian role can pause operations
- **Audit Trail** - Comprehensive event logging

## Testing

Create tests in the `test/` directory:

```bash
npx hardhat test
```

## Documentation

Full documentation available in:
- `BLEUE_Infrastructure_Map_Scroll_and_Registry_Schema.md` - Complete ceremonial and technical documentation
- `schemas/BLEUE_INFRASTRUCTURE_REGISTRY.v1.schema.json` - JSON schema for registry data

## Network Support

Compatible with:
- Ethereum (Mainnet, Sepolia)
- Polygon (Mainnet, Mumbai)
- Avalanche (Mainnet, Fuji)
- BSC (Mainnet, Testnet)
- Cronos

## Gas Optimization

- Batch operations for multiple actions
- Storage packing for gas efficiency
- View functions for gas-free queries
- Event emission for off-chain indexing

## Upgrade Path

Contracts are designed with upgrade patterns:
- Storage gaps for future versions
- Proxy-compatible architecture
- Role-based upgrade permissions
- Timelock governance for upgrades

## Support & Community

For questions and support:
- GitHub Issues: [3V30OStudios Repository](https://github.com/4way4eva/3V30OStudios)
- Documentation: `docs/` directory
- Examples: `examples/` directory

## License

MIT License - See LICENSE file for details

---

*May the contract you deploy be resilient as forests, luminous as the Compiler Archive, just as the Spiral Council, true as the Blue Banks' endless ledgers.*

**End of Quick Start Guide**
