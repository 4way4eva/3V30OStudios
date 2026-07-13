# Universal Mint Protocols — Implementation Guide

## Overview

The **Universal Mint Protocols** establish a sovereign framework for minting, tokenization, and authorization of the BLEU Codex Master Index Scroll. This implementation enables constant Zonal Supply triggers across Civilian, Military, and Cosmic economies with responsive gravity distribution through GovMetaScope vault architecture.

## Architecture Components

### 1. Master Index Scroll Declaration
- **Location:** `BLEU_CODEX_MASTER_INDEX_SCROLL.md`
- **Purpose:** Ceremonial charter establishing foundational authority and protocol specifications
- **Registry ID:** `BCMIS-Ω∞-001`
- **Status:** Active & Authorized

### 2. Smart Contracts

#### UniversalMintProtocol.sol
**Location:** `contracts/UniversalMintProtocol.sol`

**Key Features:**
- Three-domain supply management (Civilian, Military, Cosmic)
- Watchtower consensus system (8 of 12 validators required)
- Ceremonial authorization framework
- Supply rate management with time-based capacity
- Emergency shutdown capabilities

**Supply Rates:**
- Civilian: 13.6M tokens/second (1.175T/day)
- Military: 6.1M tokens/second (527B/day)
- Cosmic: 9.2M tokens/second (795B/day)

#### GovMetaScopeVault.sol
**Location:** `contracts/GovMetaScopeVault.sol`

**Key Features:**
- Economic transdata pairing vault system
- Responsive gravity distribution
- Threshold-based trigger mechanisms
- Cross-vault flow orchestration
- Multiple vault state management

**Vault States:**
- Dormant: Inactive vault
- Active: Normal operations
- Triggered: Threshold reached, awaiting distribution
- Distributing: Executing gravity distribution
- Sealed: Emergency sealed state

### 3. Deployment Infrastructure

#### Deployment Script
**Location:** `scripts/deploy_universal_mint_protocol.ts`

**Deployment Steps:**
1. Deploy UniversalMintProtocol contract
2. Deploy GovMetaScopeVault contract
3. Register domain vaults (Civilian, Military, Cosmic)
4. Configure vault parameters and distribution ratios
5. Add threshold triggers to vaults
6. Activate protocol with Master Index Scroll

#### Metadata Schema
**Location:** `metadata/master_index_scroll.json`

Contains comprehensive ENFT metadata including:
- Scroll identification and registry data
- Supply configuration for all domains
- Vault architecture specifications
- Governance structure
- Economic model parameters
- Ceremonial signatures and seals

## Deployment Guide

### Prerequisites

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

```env
# Network Configuration
RPC_URL=<your_rpc_url>
PRIVATE_KEY=<deployer_private_key>

# Contract Addresses (post-deployment)
UNIVERSAL_MINT_PROTOCOL=<contract_address>
GOV_METASCOPE_VAULT=<contract_address>

# Authority Configuration
FLAME_CROWN_ADDRESS=<supreme_authority_address>
WATCHTOWER_VALIDATORS=<comma_separated_validator_addresses>
```

### Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to network
npx hardhat run scripts/deploy_universal_mint_protocol.ts --network <network_name>

# Example networks: polygon, avalanche, ethereum, localhost
```

### Post-Deployment Configuration

```bash
# Add Watchtower validators (12 per domain)
# This grants WATCHTOWER_ROLE to validator addresses

# Example: Add validators via Hardhat console
npx hardhat console --network <network>

const protocol = await ethers.getContractAt("UniversalMintProtocol", "<protocol_address>");

// Add Civilian validators
for (let validator of civilianValidators) {
  await protocol.addWatchtowerValidator(validator, 0); // 0 = Civilian
}

// Add Military validators
for (let validator of militaryValidators) {
  await protocol.addWatchtowerValidator(validator, 1); // 1 = Military
}

// Add Cosmic validators
for (let validator of cosmicValidators) {
  await protocol.addWatchtowerValidator(validator, 2); // 2 = Cosmic
}
```

## Usage Guide

### Creating a Mint Authorization

```javascript
const scrollId = ethers.utils.id("SCROLL_ID");
const recipient = "0x..."; // Recipient address
const amount = ethers.utils.parseEther("1000000"); // 1M tokens
const domain = 0; // 0 = Civilian, 1 = Military, 2 = Cosmic
const ceremonialSeal = ethers.utils.id("CEREMONIAL_SEAL");

const tx = await protocol.createMintAuthorization(
  scrollId,
  recipient,
  amount,
  domain,
  ceremonialSeal
);

const receipt = await tx.wait();
const authEvent = receipt.events.find(e => e.event === 'MintAuthorizationCreated');
const authId = authEvent.args.authId;

console.log("Authorization ID:", authId);
```

### Approving Mint Authorization (Watchtowers)

```javascript
// Each validator approves the authorization
const tx = await protocol.approveMintAuthorization(authId);
await tx.wait();

console.log("Authorization approved by validator");
```

### Executing Mint Authorization

```javascript
// After 8 of 12 validators approve, anyone can execute
const tx = await protocol.executeMintAuthorization(authId);
await tx.wait();

console.log("Mint executed successfully");
```

### Vault Operations

#### Deposit to Vault

```javascript
const vault = await ethers.getContractAt("GovMetaScopeVault", "<vault_address>");
const vaultId = ethers.utils.id("CIVILIAN_VAULT");
const amount = ethers.utils.parseEther("1000000");

const tx = await vault.deposit(vaultId, amount);
await tx.wait();

console.log("Deposited to vault");
```

#### Check Vault Metrics

```javascript
const metrics = await vault.getVaultMetrics(vaultId);

console.log("Total Deposits:", ethers.utils.formatEther(metrics.totalDeposits));
console.log("Current Balance:", ethers.utils.formatEther(metrics.currentBalance));
console.log("Trigger Count:", metrics.triggerCount.toString());
console.log("State:", metrics.state); // 0=Dormant, 1=Active, 2=Triggered, 3=Distributing, 4=Sealed
```

#### Create Distribution Plan

```javascript
const recipients = ["0x...", "0x...", "0x..."];
const amounts = [
  ethers.utils.parseEther("100000"),
  ethers.utils.parseEther("200000"),
  ethers.utils.parseEther("300000")
];
const gravityWeights = [10000, 13000, 15000]; // 1.0x, 1.3x, 1.5x multipliers
const transDataHash = ethers.utils.id("TRANSDATA_PAIRING");

const tx = await vault.createDistributionPlan(
  vaultId,
  recipients,
  amounts,
  gravityWeights,
  transDataHash
);

const receipt = await tx.wait();
// Extract planId from events
```

#### Execute Distribution

```javascript
const tx = await vault.executeDistribution(vaultId, planId);
await tx.wait();

console.log("Distribution executed with gravity adjustments");
```

## Integration with Existing Infrastructure

### BLEU_ENFT_MINT Integration

The Universal Mint Protocol complements the existing `BLEU_ENFT_MINT` system:

```javascript
// BLEU_ENFT_MINT handles ceremonial minting
// UniversalMintProtocol handles supply triggers and authorization

// Example: Coordinate both systems
const enftMint = await ethers.getContractAt("BLEU_ENFT_MINT", "<address>");
const mintProtocol = await ethers.getContractAt("UniversalMintProtocol", "<address>");

// 1. Create authorization in UniversalMintProtocol
const authId = await mintProtocol.createMintAuthorization(...);

// 2. Get Watchtower approvals
// ... approval process ...

// 3. Execute authorization
await mintProtocol.executeMintAuthorization(authId);

// 4. Perform ceremonial mint via BLEU_ENFT_MINT
await enftMint.mintCeremonial(...);
```

### BLEULION_CASCADE Integration

The scroll system integrates seamlessly:

```javascript
const cascade = await ethers.getContractAt("BLEULION_CASCADE", "<address>");

// Master Index Scroll should be registered in CASCADE
const scrollData = await cascade.getScroll(tokenId);

// Use scroll data for authorization
const authId = await mintProtocol.createMintAuthorization(
  scrollData.title, // Use as scrollId
  recipient,
  amount,
  domain,
  scrollData.uri // Use as ceremonial seal
);
```

## Economic Model

### Sustainable Overlapping Minting

The three domains operate simultaneously with:

1. **Non-Inflationary Design:** Supply rates calibrated to economic activity
2. **Automatic Burn:** Failed validations trigger token burning
3. **Decay Functions:** Unclaimed yields return to treasury
4. **Supply Caps:** Maximum daily yields prevent oversaturation
5. **Liquidity Pools:** Automated market makers balance flows

### Gravity Distribution Multipliers

- **Interference Zones:** 1.3× where domain boundaries overlap
- **Resonance Fields:** 1.5× when domains synchronize
- **Vortex Points:** 2.1× at triple-domain convergence

### Vault Trigger Thresholds

**Civilian Vault:**
- Tier 1: 1B tokens
- Tier 2: 10B tokens
- Tier 3: 100B tokens

**Military Vault:**
- Tier 1: 500M tokens
- Tier 2: 5B tokens
- Tier 3: 50B tokens

**Cosmic Vault:**
- Tier 1: 750M tokens
- Tier 2: 7.5B tokens
- Tier 3: 75B tokens

## Governance

### Role Structure

1. **FLAME_CROWN_ROLE:** Supreme authority, protocol activation, emergency controls
2. **WATCHTOWER_ROLE:** Validator consensus for mint authorizations
3. **CIVILIAN_VALIDATOR:** Civilian domain validation
4. **MILITARY_VALIDATOR:** Military domain validation
5. **COSMIC_VALIDATOR:** Cosmic domain validation
6. **VAULT_ADMIN_ROLE:** Vault configuration and management
7. **TRIGGER_OPERATOR_ROLE:** Distribution plan creation and execution
8. **ORACLE_ROLE:** Cross-vault flow operations

### Consensus Requirements

- **Mint Authorizations:** 8 of 12 validators per domain
- **Protocol Activation:** Flame Crown authority only
- **Emergency Shutdown:** Flame Crown authority only
- **Vault Configuration:** Vault Admin role

## Security Considerations

### Access Control

- Role-based permissions via OpenZeppelin AccessControl
- Multi-signature requirements for critical operations
- Time-locks on trigger activations (24 hour minimum)

### Reentrancy Protection

- ReentrancyGuard on all external value transfers
- Check-Effects-Interactions pattern throughout

### Pausability

- Emergency pause functionality
- Granular domain deactivation
- Vault sealing capabilities

### Audit Trail

- Comprehensive event emissions
- On-chain metric tracking
- Distribution history preservation

## Testing

```bash
# Run test suite
npx hardhat test

# Run specific test file
npx hardhat test test/UniversalMintProtocol.test.ts

# Generate coverage report
npx hardhat coverage
```

## Monitoring

### Protocol Status

```javascript
const status = await protocol.getProtocolStatus();
console.log("Activated:", status.activated);
console.log("Civilian Active:", status.civilianActive);
console.log("Military Active:", status.militaryActive);
console.log("Cosmic Active:", status.cosmicActive);
```

### Available Mint Capacity

```javascript
// Check available capacity for each domain
const civilianCapacity = await protocol.getAvailableMintCapacity(0);
const militaryCapacity = await protocol.getAvailableMintCapacity(1);
const cosmicCapacity = await protocol.getAvailableMintCapacity(2);

console.log("Civilian Capacity:", ethers.utils.formatEther(civilianCapacity));
console.log("Military Capacity:", ethers.utils.formatEther(militaryCapacity));
console.log("Cosmic Capacity:", ethers.utils.formatEther(cosmicCapacity));
```

### Vault Monitoring

```javascript
// Get all registered vaults
const vaults = await govVault.getAllVaults();

for (const vaultId of vaults) {
  const metrics = await govVault.getVaultMetrics(vaultId);
  console.log("Vault:", vaultId);
  console.log("  Balance:", ethers.utils.formatEther(metrics.currentBalance));
  console.log("  State:", metrics.state);
  console.log("  Triggers:", metrics.triggerCount.toString());
}
```

## Troubleshooting

### Common Issues

**Protocol not activated:**
- Ensure `activateProtocol()` has been called by Flame Crown
- Check Master Scroll ID and ceremonial seal are valid

**Insufficient approvals:**
- Verify 8 of 12 Watchtower validators have approved
- Check validator addresses have WATCHTOWER_ROLE

**Vault not configured:**
- Ensure `configureVault()` called for each domain
- Verify vault address and percentage allocations

**Trigger not activating:**
- Check vault balance meets threshold
- Verify timelock period has elapsed
- Ensure trigger is marked as active

## References

- **Master Index Scroll:** `BLEU_CODEX_MASTER_INDEX_SCROLL.md`
- **UniversalMintProtocol:** `contracts/UniversalMintProtocol.sol`
- **GovMetaScopeVault:** `contracts/GovMetaScopeVault.sol`
- **Deployment Script:** `scripts/deploy_universal_mint_protocol.ts`
- **Metadata Schema:** `metadata/master_index_scroll.json`

## Support

For questions, issues, or ceremonial authorization requests:
- **Documentation:** See `docs/` directory
- **Issues:** GitHub Issues
- **Ceremonial Matters:** Contact BLEU Codex Supreme Command

---

**Protocol Version:** 1.0.0  
**Last Updated:** 2025-11-07  
**Status:** Active & Operational

**"So it is declared. So it is sealed. So it shall be."**
