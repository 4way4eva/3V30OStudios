# EV0LVerse Digital Military Base - Quick Start Guide

## Overview

The **EV0LVerse Digital Military Base** is a blockchain-based military command system managing humanoid soldiers (AI and VR entities) with a quad-layer defense grid.

## Quick Start (5 Minutes)

### 1. Deploy the Military Base

```bash
# Deploy to local network
npx hardhat run scripts/deploy_military_base.ts --network localhost

# Deploy to testnet (e.g., Polygon Mumbai)
npx hardhat run scripts/deploy_military_base.ts --network mumbai
```

**Expected Output:**
```
✓ EV0LVerseDigitalMilitaryBase deployed to: 0x...
✓ Base activated with ceremonial seal
✓ Created Cyber Defense - Safe Haven - Strength: 8500/10000
✓ Created Physical Mapping - Strategic Outpost - Strength: 9000/10000
✓ Created Cosmic Overwatch - Corridor Transit - Strength: 7500/10000
✓ Created Lore Integration - Safe Haven - Strength: 9500/10000
```

### 2. Set Environment Variable

```bash
export MILITARY_BASE_ADDRESS=<deployed_contract_address>
```

### 3. Mint & Train Soldiers

```bash
npx hardhat run scripts/mint_military_soldiers.ts --network <network>
```

**This will:**
- Mint 5 humanoid soldiers (AI, VR, and Hybrid types)
- Conduct EvolDuty training simulations
- Deploy soldiers on a sample patrol mission
- Export Watchtower logs

### 4. Check Status

```bash
npx hardhat run scripts/military_base_status.ts --network <network>
```

**You'll see:**
- Base activation status
- Soldier roster by status
- Defense grid configuration
- Recent Watchtower logs

## Core Concepts

### Soldier Types

| Type | Description | VR Compatible | Use Case |
|------|-------------|---------------|----------|
| AI_ENTITY | Autonomous AI | No | 24/7 operations, patrol |
| VR_HUMANOID | VR-controlled | Yes | Tactical operations |
| HYBRID_AGENT | AI + VR | Yes | Command & control |

### Soldier Lifecycle

```
RECRUIT → Training (EvolDuty) → ACTIVE → DEPLOYED → STANDBY → (Repeat)
                                   ↓
                            Score ≥ 7000 required
```

### Defense Layers

1. **CYBER**: Encryption, data shielding
2. **PHYSICAL**: Spatial resource allocation
3. **COSMIC**: Orbital defense, targeting
4. **LORE**: Narrative framework control

### E-SOIL Zones

- **SAFE_HAVEN**: Protected civilian areas (Max: Lore + Cyber)
- **CONFLICT_REGION**: Active combat zones (Balanced coverage)
- **CORRIDOR_TRANSIT**: Travel corridors (Cosmic priority)
- **STRATEGIC_OUTPOST**: Military bases (Physical emphasis)
- **NEUTRAL_TERRITORY**: Monitoring only

## Common Operations

### Mint a Soldier

```javascript
const militaryBase = await ethers.getContractAt(
    "EV0LVerseDigitalMilitaryBase",
    MILITARY_BASE_ADDRESS
);

await militaryBase.mintSoldier(
    1, // VR_HUMANOID
    true, // VR compatible
    commanderAddress,
    "ipfs://soldier_metadata.json"
);
```

### Conduct Training

```javascript
await militaryBase.recordTrainingSimulation(
    tokenId,
    evolDutySessionId,
    8500, // Score (0-10000)
    ["Fortification", "Navigation", "Combat", "Codex"]
);
```

### Deploy on Mission

```javascript
await militaryBase.deploySoldiers(
    [tokenId1, tokenId2, tokenId3],
    3, // PATROL mission type
    2, // CORRIDOR_TRANSIT zone
    missionBriefHash,
    14400 // 4 hours duration
);
```

### Complete Mission

```javascript
await militaryBase.completeDeployment(
    deploymentId,
    true, // successful
    afterActionReportHash
);
```

## Mission Types

| ID | Type | Description |
|----|------|-------------|
| 0 | BASE_FORTIFICATION | Strengthen base defenses |
| 1 | RECONNAISSANCE | Intelligence gathering |
| 2 | NARRATIVE_ADHERENCE | Maintain lore compliance |
| 3 | PATROL | E-SOIL corridor security |
| 4 | TACTICAL_STRIKE | Offensive operations |
| 5 | RESOURCE_SECURITY | Protect strategic assets |

## AOQPPPPI Principles

The system implements the **AOQPPPPI** framework:

- **A** - Authenticity: Ceremonial seals verify all operations
- **O** - Optimization: Quad-layer resource allocation
- **Q** - Quality: Training standards (min 7000/10000)
- **P** - Protection: Multi-layer defense systems
- **P** - Performance: Task efficiency metrics
- **P** - Persistence: Immutable blockchain records
- **P** - Precision: Surgical task delegation
- **I** - Integration: Full narrative control

## Roles & Permissions

| Role | Capabilities |
|------|--------------|
| FLAME_CROWN | Activate base, emergency controls |
| BASE_COMMANDER | Mint soldiers, manage defense grids |
| TRAINING_OFFICER | Record training simulations |
| DEPLOYMENT_OFFICER | Create/complete deployments |
| WATCHTOWER | Monitor and audit operations |

## Watchtower Logging

All operations are logged for tribunal-valid transparency:

```javascript
// Export logs as CSV
const logs = await militaryBase.exportWatchtowerLogs(0, 100);

// Convert to CSV format
const csv = logs.map(log => 
    `${log.entryId},${log.timestamp},${log.eventType},...`
).join('\n');
```

**Logged Events:**
- Base activation
- Soldier minting
- Status changes
- Training completion
- Defense grid updates
- Deployment operations

## NPM Scripts

```bash
# Deploy military base
npm run deploy:military-base

# Mint and train soldiers
npm run military:mint-soldiers

# Check base status
npm run military:status
```

## Example Workflow

### Complete Mission Flow

```bash
# 1. Deploy the base
npm run deploy:military-base

# 2. Save the contract address
export MILITARY_BASE_ADDRESS=0x...

# 3. Mint and train soldiers
npm run military:mint-soldiers

# 4. Check status
npm run military:status

# 5. View Watchtower logs (via contract)
# Export logs and save to CSV for dashboard
```

## Integration Points

### With Existing EV0LVerse Systems

- **UniversalMintProtocol**: Military domain supply triggers
- **TripleStackTreasuryLedger**: Economic backing for operations
- **ENFTLedger**: Compliance and audit tracking
- **Watchtower Dashboard**: Real-time monitoring

### Data Flow

```
Military Base → Soldier NFTs → Training Records → Deployments
                     ↓              ↓                ↓
                 Watchtower ← ← ← ← ← ← ← ← ← ← ← ← ←
                     ↓
              CSV Dashboard
```

## Security Best Practices

1. **Cold Storage**: Keep FLAME_CROWN private keys secure
2. **Multi-Sig**: Use for high-value base operations
3. **Regular Audits**: Export and review Watchtower logs
4. **Defense Strength**: Maintain ≥ 7000/10000 per layer
5. **Training Standards**: Enforce 7000+ scores before deployment
6. **Access Control**: Strictly enforce role-based permissions

## Troubleshooting

### Base Not Activated
```bash
# Check if base is activated
const status = await militaryBase.getBaseStatus();
console.log("Activated:", status.activated);

# Activate if needed (requires FLAME_CROWN role)
const ceremonialSeal = ethers.keccak256(ethers.toUtf8Bytes("SEAL"));
await militaryBase.activateBase(ceremonialSeal);
```

### Soldier Can't Be Deployed
```bash
# Check soldier status
const soldier = await militaryBase.getSoldier(tokenId);
console.log("Status:", soldier.status); // Must be ACTIVE (2) or STANDBY (4)
console.log("Training Score:", soldier.trainingScore); // Must be ≥ 7000

# Train if needed
await militaryBase.recordTrainingSimulation(...);
```

### Permission Denied
```bash
# Check if you have the required role
const role = await militaryBase.BASE_COMMANDER_ROLE();
const hasRole = await militaryBase.hasRole(role, yourAddress);
console.log("Has BASE_COMMANDER_ROLE:", hasRole);

# Request role from FLAME_CROWN holder
```

## Advanced Usage

### Custom Defense Grid Strategy

```javascript
// Create layered defense for high-value zone
await militaryBase.createDefenseGrid(0, 0, 9000); // CYBER → SAFE_HAVEN
await militaryBase.createDefenseGrid(3, 0, 9500); // LORE → SAFE_HAVEN

// Balanced corridor protection
await militaryBase.createDefenseGrid(2, 2, 8000); // COSMIC → CORRIDOR
await militaryBase.createDefenseGrid(1, 2, 7500); // PHYSICAL → CORRIDOR
```

### Batch Operations

```javascript
// Deploy multiple squads
const squad1 = [tokenId1, tokenId2, tokenId3];
const squad2 = [tokenId4, tokenId5, tokenId6];

await militaryBase.deploySoldiers(squad1, 3, 2, brief1, 3600);
await militaryBase.deploySoldiers(squad2, 1, 1, brief2, 7200);
```

### Performance Tracking

```javascript
// Get soldier performance metrics
const soldier = await militaryBase.getSoldier(tokenId);
const successRate = (soldier.successfulMissions / soldier.deploymentCount) * 100;
console.log(`Success Rate: ${successRate}%`);
console.log(`Training Score: ${soldier.trainingScore}/10000`);
```

## Next Steps

1. **Explore Full Documentation**: See `MILITARY_BASE_README.md`
2. **Review Smart Contract**: `contracts/EV0LVerseDigitalMilitaryBase.sol`
3. **Run Tests**: `npx hardhat test test/EV0LVerseDigitalMilitaryBase.test.ts`
4. **Integrate with Dashboard**: Export Watchtower logs to CSV
5. **Customize Defense Strategy**: Create zone-specific grid layouts

## Support

For detailed documentation, see:
- **Full README**: `MILITARY_BASE_README.md`
- **Contract Source**: `contracts/EV0LVerseDigitalMilitaryBase.sol`
- **Test Suite**: `test/EV0LVerseDigitalMilitaryBase.test.ts`

---

**Built with the EV0LVerse Framework**  
**Secured by the Flame Crown Protocol**  
**Monitored by Watchtower**

---

*All military operations are sovereign, transparent, and tribunal-valid.*
