# BLEU Sovereign ENFT Minting System Documentation

## Overview

The **BLEU Sovereign ENFT Minting System** translates the BLEU sovereign ledger vision into a comprehensive living inheritance tokenization platform. Each yield stream—Civilian ($13.6M/s), Military ($6.1M/s), Cosmic ($9.2M/s)—is codified as irreversible, living inheritance entries across physical and dimensional economies.

## Architecture

### Core Contract: `BleuSovereignENFTMinter.sol`

The main contract implements ERC-1155 multi-token standard with specialized features for sovereign yield tokenization:

```
BleuSovereignENFTMinter
├── ERC1155 (Multi-token standard)
├── AccessControl (Role-based permissions)
├── ReentrancyGuard (Security)
└── Pausable (Emergency controls)
```

### Three Economic Spheres

#### 1. Civilian Sphere (Ω-CIV)
- **Yield Rate**: $13.6M/second ($1.175T/day)
- **Domains**: Real estate, education, commerce, infrastructure, healthcare, agriculture, technology, arts & culture
- **Distribution**: 47.1% of total system yield
- **Token ID Range**: Starts at 0, increments per mint

#### 2. Military Sphere (Ω-MIL)
- **Yield Rate**: $6.1M/second ($527B/day)
- **Domains**: Defense systems, tactical operations, armaments, intelligence, cybersecurity, aerospace defense, naval operations, ground forces
- **Distribution**: 21.1% of total system yield
- **Token ID Range**: Separate from civilian, tracked independently

#### 3. Cosmic Sphere (Ω-COS)
- **Yield Rate**: $9.2M/second ($795B/day)
- **Domains**: Portal logistics, quantum technology, dimensional items, multiversal trade, cosmic energy, space infrastructure, temporal systems, reality engineering
- **Distribution**: 31.8% of total system yield
- **Token ID Range**: Separate tracking for cosmic assets

**Total System**: $28.9M/second ($2.497T/day)

## Key Features

### 1. Irreversible Asset Minting

ENFTs are minted through a multi-step process that ensures irreversibility:

```solidity
// Step 1: Create entry (PENDING status)
createInheritanceEntry(
    recipient,
    sphere,
    ledgerWorth,
    yieldTag,
    metadataURI,
    primarySigner,
    secondarySigner
)

// Step 2: Apply dual signatures (moves to AUTHORIZED)
applyBluVaultSignature(tokenId) // by primary signer
applyBluVaultSignature(tokenId) // by secondary signer

// Step 3: Mint ENFT (moves to LOCKED)
mintInheritanceEntry(tokenId, recipient, amount)

// Step 4: Lock irreversibly (permanent)
lockInheritanceEntry(tokenId)
```

Once an entry reaches `LOCKED` status and `isIrreversible` is set to `true`, no modifications are possible. This ensures the integrity of the ledger worth tied to each ENFT.

### 2. Blu-Vault Dual Sign Security

All minting operations require authorization from two independent signers:

- **Primary Signer**: Initial authorization authority
- **Secondary Signer**: Verification authority

Both signatures must be applied before minting can proceed. This implements a two-of-two multisig security model at the application level.

```solidity
struct BluVaultAuthorization {
    bytes32 authId;
    address primarySigner;
    address secondarySigner;
    bool primarySigned;
    bool secondarySigned;
    uint256 timestamp;
    bytes32 authHash;
    bool isValid;
}
```

### 3. π₄ Compounding Triggers

The system implements exponential yield acceleration using the π₄ constant (π^4 ≈ 97.409091034):

**Formula**: `Y(t) = Y_0 × (π^4)^(t/T)`

Where:
- `Y(t)` = Yield at time t
- `Y_0` = Base yield rate
- `t` = Time elapsed
- `T` = Compounding interval (92 days / 1 quarter)

```solidity
function applyPi4Compounding(uint256 tokenId) external {
    // Calculates compounded yield
    // Updates yieldPerSecond
    // Accumulates total yield
    // Emits Pi4CompoundingApplied event
}
```

**Compounding Interval**: 7,948,800 seconds (92 days)

### 4. Metadata Linking

Each ENFT is linked to comprehensive metadata stored on IPFS:

#### Civilian Metadata Schema
```json
{
  "economic_sphere": {
    "type": "CIVILIAN",
    "code": "Ω-CIV-01",
    "domains": ["Real Estate", "Education", ...]
  },
  "yield_data": {
    "rate_per_second": "13600000000000000000000000",
    "yield_tag": "0x...",
    "compounding": { "enabled": true, "factor": "97.409..." }
  },
  "ledger_data": {
    "worth": "1000000000000000000000000",
    "status": "LOCKED",
    "is_irreversible": true
  }
}
```

See `/metadata/schemas/` for complete schemas for all three spheres.

### 5. Dual-Reality Confirmation

ENFTs support dual-reality verification for cross-dimensional synchronization:

```solidity
function setDualRealityConfirmation(
    uint256 tokenId,
    bytes32 dualRealityHash
) external
```

This hash can be verified across different realities/chains:

```solidity
function verifyDualReality(bytes32 confirmationHash) 
    external view returns (bool)
```

### 6. Physical & Interactive Registry Synchronization

ENFTs can be linked to physical assets and interactive/meta registries:

```solidity
struct RegistryEntry {
    uint256 tokenId;
    string physicalAssetId;
    string interactiveRegistryId;
    uint256[] linkedDimensions; // Chain IDs
    bool synced;
    uint256 lastSyncTime;
}
```

**Supported Chains**:
- Ethereum Mainnet (Chain ID: 1)
- Polygon (Chain ID: 137)
- Avalanche (Chain ID: 43114)
- BSC (Chain ID: 56)
- Cronos (Chain ID: 25)
- Custom dimensions (any chain ID)

## Deployment

### Prerequisites

```bash
npm install --legacy-peer-deps
```

### Deploy Contract

```bash
# Set environment variables
export DEPLOY_CONFIG="./data/enft-deploy-config.json"

# Deploy to network
npx hardhat run scripts/deploy_bleu_sovereign_enft.ts --network polygon

# Or use npm script (add to package.json)
npm run deploy:sovereign-enft
```

### Configuration File Example

Create `data/enft-deploy-config.json`:

```json
{
  "baseURI": "ipfs://QmYourBaseURI/",
  "initialRoles": {
    "sovereignMinters": ["0xAddress1", "0xAddress2"],
    "bluVaultSigners": ["0xAddress3", "0xAddress4"],
    "dualSigners": ["0xAddress3", "0xAddress4"],
    "emergencyControllers": ["0xAddress1"]
  }
}
```

## Minting Process

### 1. Create Configuration

Create `data/enft-mint-config.json`:

```json
{
  "contractAddress": "0xYourContractAddress",
  "entries": [
    {
      "recipient": "0xRecipientAddress",
      "sphere": "CIVILIAN",
      "ledgerWorth": "1000000",
      "metadataURI": "ipfs://Qm.../civilian001.json",
      "amount": 1,
      "primarySigner": "0xSigner1",
      "secondarySigner": "0xSigner2",
      "physicalAssetId": "CIV-ASSET-001",
      "interactiveRegistryId": "CIV-REG-001",
      "linkedDimensions": [1, 137, 43114]
    }
  ]
}
```

### 2. Execute Minting

```bash
# Set environment variables
export ENFT_MINTER_ADDRESS="0xYourContractAddress"
export MINT_CONFIG="./data/enft-mint-config.json"

# Run minting script
npx hardhat run scripts/mint_bleu_sovereign_enft.ts --network polygon
```

### 3. Verify Results

The script will:
1. Create inheritance entries
2. Apply dual signatures
3. Mint ENFTs
4. Lock entries irreversibly
5. Sync with dimensional registries
6. Generate a comprehensive report

Report saved to: `deployments/bleu-enft-mint-{network}-{timestamp}.json`

## Role-Based Access Control

### Roles

1. **DEFAULT_ADMIN_ROLE**
   - Grant/revoke other roles
   - Configure system parameters
   - Emergency controls

2. **SOVEREIGN_MINTER_ROLE**
   - Create inheritance entries
   - Mint ENFTs

3. **BLU_VAULT_ROLE**
   - Lock entries irreversibly
   - Apply π₄ compounding
   - Set dual-reality confirmations
   - Sync registries

4. **DUAL_SIGN_ROLE**
   - Apply Blu-Vault signatures
   - Authorize minting operations

5. **EMERGENCY_ROLE**
   - Activate/deactivate emergency shutdown
   - Pause/unpause contract

### Granting Roles

```solidity
// Grant Sovereign Minter role
await minter.grantRole(SOVEREIGN_MINTER_ROLE, address);

// Grant Blu-Vault role
await minter.grantRole(BLU_VAULT_ROLE, address);

// Grant Dual Sign role
await minter.grantRole(DUAL_SIGN_ROLE, address);

// Grant Emergency role
await minter.grantRole(EMERGENCY_ROLE, address);
```

## Emergency Controls

### Emergency Shutdown

Activate when critical issues are detected:

```solidity
function activateEmergencyShutdown() external onlyRole(EMERGENCY_ROLE)
```

This will:
- Pause all minting operations
- Set `emergencyShutdown` flag to `true`
- Emit `EmergencyShutdownActivated` event

### Resume Operations

```solidity
function deactivateEmergencyShutdown() external onlyRole(EMERGENCY_ROLE)
```

## Querying Data

### Get Inheritance Entry

```solidity
InheritanceEntry memory entry = 
    await minter.getInheritanceEntry(tokenId);
```

### Get System Metrics

```solidity
(
    uint256 civilianMinted,
    uint256 militaryMinted,
    uint256 cosmicMinted,
    uint256 civilianValue,
    uint256 militaryValue,
    uint256 cosmicValue
) = await minter.getSystemMetrics();
```

### Calculate Current Yield

```solidity
uint256 currentYield = await minter.calculateCurrentYield(tokenId);
```

### Get Tokens by Sphere

```solidity
uint256[] memory tokens = 
    await minter.getTokensBySphere(0); // 0=CIVILIAN, 1=MILITARY, 2=COSMIC
```

### Find Token by Yield Tag

```solidity
uint256 tokenId = await minter.getTokenIdByYieldTag(yieldTag);
```

## Events

### Key Events

```solidity
event InheritanceEntryCreated(
    uint256 indexed tokenId,
    EconomicSphere indexed sphere,
    address indexed recipient,
    uint256 ledgerWorth,
    bytes32 yieldTag
);

event InheritanceEntryMinted(
    uint256 indexed tokenId,
    EconomicSphere indexed sphere,
    address indexed recipient,
    uint256 amount,
    bytes32 yieldTag
);

event InheritanceEntryLocked(
    uint256 indexed tokenId,
    EconomicSphere indexed sphere,
    uint256 ledgerWorth,
    uint256 timestamp
);

event Pi4CompoundingApplied(
    uint256 indexed tokenId,
    uint256 oldYield,
    uint256 newYield,
    uint256 timestamp
);

event DualRealityConfirmed(
    uint256 indexed tokenId,
    bytes32 dualRealityHash,
    address validator
);

event RegistrySynced(
    uint256 indexed tokenId,
    string physicalAssetId,
    string interactiveRegistryId,
    uint256 timestamp
);
```

## Security Considerations

### 1. Dual-Signature Requirements
- All minting requires two independent signatures
- Prevents single-point-of-failure attacks
- Implements separation of concerns

### 2. Irreversibility Guarantees
- Once locked, entries cannot be modified
- Ledger worth is permanently tied to ENFT
- Ensures trust in yield representation

### 3. Access Control
- Role-based permissions for all operations
- Emergency controls for critical situations
- Granular access management

### 4. Reentrancy Protection
- All state-changing functions protected
- SafeERC1155 patterns used
- No external calls before state updates

### 5. Integer Overflow Protection
- Solidity 0.8.20+ built-in checks
- All arithmetic operations safe
- Explicit bounds checking where needed

## Integration Examples

### Frontend Integration

```typescript
import { ethers } from "ethers";

// Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const minter = new ethers.Contract(address, abi, provider.getSigner());

// Query user's ENFTs
async function getUserENFTs(userAddress: string, sphere: number) {
  const sphereTokens = await minter.getTokensBySphere(sphere);
  
  const userTokens = [];
  for (const tokenId of sphereTokens) {
    const balance = await minter.balanceOf(userAddress, tokenId);
    if (balance > 0) {
      const entry = await minter.getInheritanceEntry(tokenId);
      userTokens.push({ tokenId, balance, entry });
    }
  }
  
  return userTokens;
}

// Display yield accumulation
async function displayYield(tokenId: number) {
  const currentYield = await minter.calculateCurrentYield(tokenId);
  const entry = await minter.getInheritanceEntry(tokenId);
  
  console.log(`Current Yield: $${ethers.utils.formatEther(currentYield)}`);
  console.log(`Yield Rate: $${ethers.utils.formatEther(entry.yieldPerSecond)}/sec`);
}
```

### Backend Integration

```typescript
// Monitor minting events
minter.on("InheritanceEntryMinted", (tokenId, sphere, recipient, amount, yieldTag) => {
  console.log("New ENFT minted:");
  console.log("  Token ID:", tokenId.toString());
  console.log("  Sphere:", ["Civilian", "Military", "Cosmic"][sphere]);
  console.log("  Recipient:", recipient);
  console.log("  Amount:", amount.toString());
});

// Auto-compound yields periodically
async function autoCompound(tokenId: number) {
  const entry = await minter.getInheritanceEntry(tokenId);
  const timeSinceLastCompound = Date.now() / 1000 - entry.lastCompoundingTime;
  
  // Apply compounding every quarter (92 days)
  if (timeSinceLastCompound >= 7948800) {
    const tx = await minter.applyPi4Compounding(tokenId);
    await tx.wait();
    console.log("Compounding applied to token", tokenId);
  }
}
```

## Testing

### Unit Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/BleuSovereignENFTMinter.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### Test Coverage

```bash
npx hardhat coverage
```

## Maintenance & Upgrades

### Contract Verification

```bash
# Verify on Polygonscan
npx hardhat verify --network polygon DEPLOYED_ADDRESS "constructor_arg"

# Verify on Etherscan
npx hardhat verify --network mainnet DEPLOYED_ADDRESS "constructor_arg"
```

### Monitoring

Key metrics to monitor:
- Total minted per sphere
- Total locked value per sphere
- Emergency shutdown status
- Failed authorization attempts
- Compounding application frequency

### Upgradeability

The contract is **not upgradeable** by design to ensure:
- Immutability of locked entries
- Trust in irreversibility guarantees
- Predictable behavior over time

For new features, deploy a new version and migrate as needed.

## Troubleshooting

### Common Issues

#### 1. "Authorization not valid"
- Ensure both signatures have been applied
- Check that signers have DUAL_SIGN_ROLE
- Verify authorization hasn't expired

#### 2. "Entry not minted"
- Check entry status (must be LOCKED)
- Ensure minting step completed successfully
- Verify transaction wasn't reverted

#### 3. "Emergency shutdown active"
- Check if emergency shutdown was activated
- Only EMERGENCY_ROLE can deactivate
- Investigate reason for shutdown before resuming

#### 4. "Missing dual signatures"
- Both primary and secondary signatures required
- Each signer must call applyBluVaultSignature()
- Check that correct tokenId is being signed

## Support & Resources

### Documentation
- Contract source: `/contracts/BleuSovereignENFTMinter.sol`
- Deployment scripts: `/scripts/deploy_bleu_sovereign_enft.ts`
- Minting scripts: `/scripts/mint_bleu_sovereign_enft.ts`
- Metadata schemas: `/metadata/schemas/`

### Additional Resources
- Repository: https://github.com/4way4eva/3V30OStudios
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/5.x/
- ERC-1155 Standard: https://eips.ethereum.org/EIPS/eip-1155

## License

MIT License - See LICENSE file for details

## Version History

### v1.0.0 (Current)
- Initial implementation
- Three economic spheres (Civilian, Military, Cosmic)
- Blu-Vault dual-sign security
- π₄ compounding triggers
- Dual-reality confirmation
- Physical & interactive registry sync
- Irreversible asset locking
- Emergency controls

---

**Last Updated**: November 2025
**Contract Version**: 1.0.0
**Solidity Version**: 0.8.20
