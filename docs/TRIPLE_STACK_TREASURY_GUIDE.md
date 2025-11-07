# Triple-Stack Treasury Ledger - Implementation Guide

## Overview

The **Triple-Stack Treasury Ledger** is an ENFT (Encrypted Non-Fungible Token) system that codifies the three-sphere yield representation as living inheritance entries on-chain. This implementation provides:

- **Three Yield Streams**: Civilian, Military, and Cosmic
- **π₄ Compounding**: Exponential yield growth using π^4 scaling
- **Blu-Vault Authorization**: Secure authorization tags for minting operations
- **Dual-Reality Confirmation**: Cross-dimensional ledger validation
- **Sovereign Override**: Manual authorization system for 4way4eva
- **Interoperable Contracts**: Seamless sync across Snowtrace and Cronos chains

## Architecture

### Smart Contract: `TripleStackTreasuryLedger.sol`

The core contract is an ERC-1155 multi-token standard with access control and reentrancy protection.

#### Token IDs
- **Token ID 1**: Civilian Yield Stream (Ω-CIV-01)
- **Token ID 2**: Military Yield Stream (Ω-MIL-01)
- **Token ID 3**: Cosmic Yield Stream (Ω-COS-01)

#### Roles
- `DEFAULT_ADMIN_ROLE`: Contract administration
- `MINTER_ROLE`: Ability to mint yield stream ENFTs
- `BLU_VAULT_ROLE`: Blu-Vault authorization management
- `SOVEREIGN_OVERRIDE_ROLE`: Reserved for 4way4eva - can reverse or modify yields
- `DUAL_REALITY_VALIDATOR`: Cross-dimensional confirmation validation

### Yield Streams

Each yield stream represents a sphere of the treasury with specific domains:

#### 1. Civilian Yield (Ω-CIV-01)
- **Yield**: $13.6M per second
- **Domains**: Retail, education, ES0IL real estate, wearables, hospitality
- **Security**: π₄ scaling beacons, Blu-Vault dual-sign, citizen tithe mirrors

#### 2. Military Yield (Ω-MIL-01)
- **Yield**: $6.1M per second
- **Domains**: Weapons, defense grids, orbital/maritime, AI targeting
- **Security**: Quad-octa locks, live-fire sentinel AI, breach nullifiers

#### 3. Cosmic Yield (Ω-COS-01)
- **Yield**: $9.2M per second
- **Domains**: Portal energy, quantum matter, multidimensional logistics
- **Security**: Dual-reality confirmation, portal locks, entanglement escrow

### π₄ Compounding Model

The treasury employs π₄ (π^4) compounding for exponential yield growth:

**Formula**: `Y(t) = Y_0 × (π^4)^(t/T)`

Where:
- `Y_0` = Base yield per second ($28.9M total)
- `t` = Elapsed time in seconds
- `T` = Compounding interval (7,948,800 seconds = 92 days per quarter)
- `π^4` ≈ 97.409

**Metrics**:
- **Per Second**: $28,900,000
- **Per Day**: $2,496,960,000,000 (~$2.5 trillion)
- **Per Quarter** (before π₄): $229,720,320,000,000

## Deployment

### Prerequisites

1. Node.js and npm installed
2. Hardhat development environment
3. Private key with sufficient gas funds
4. Environment variables configured

### Environment Setup

Create `.env` file:

```bash
# Network RPC URLs
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
CRONOS_RPC_URL=https://evm.cronos.org

# API Keys for verification
SNOWTRACE_API_KEY=your_snowtrace_api_key
CRONOSCAN_API_KEY=your_cronoscan_api_key

# Deployment
PRIVATE_KEY=your_private_key_here
TREASURY_BASE_URI=https://megazion.enft/treasury/

# Contract addresses (set after deployment)
TREASURY_LEDGER_ADDRESS=
```

### Deploy Contract

```bash
# Compile contracts
npm run compile

# Deploy to Avalanche (Snowtrace)
npx hardhat run scripts/deploy_triple_stack_treasury.ts --network avalanche

# Deploy to Cronos
npx hardhat run scripts/deploy_triple_stack_treasury.ts --network cronos

# Deploy to testnet (Fuji)
npx hardhat run scripts/deploy_triple_stack_treasury.ts --network fuji
```

### Verify Contract

```bash
# After deployment, verify on block explorer
npx hardhat verify --network avalanche <CONTRACT_ADDRESS> "https://megazion.enft/treasury/"
```

## Minting

### Configure Recipients

Edit `data/treasury-mint-config.json`:

```json
{
  "treasuryAddress": "0x...",
  "recipients": [
    {
      "address": "0x4way4eva_address",
      "civilianAmount": 10,
      "militaryAmount": 10,
      "cosmicAmount": 10
    }
  ]
}
```

### Execute Minting

```bash
# Mint using configuration file
export TREASURY_LEDGER_ADDRESS=0x...
npx hardhat run scripts/mint_triple_stack_yields.ts --network avalanche

# Or specify custom config
export MINT_CONFIG=/path/to/custom-config.json
npx hardhat run scripts/mint_triple_stack_yields.ts --network avalanche
```

### Minting Process

1. **Blu-Vault Authorization**: Script generates unique auth tag
2. **Batch Minting**: All three streams minted in single transaction
3. **Event Emission**: `YieldStreamMinted` events for each stream
4. **Balance Verification**: Confirms recipient balances
5. **Report Generation**: Saves mint report to `deployments/` directory

## Verification

### Run Verification Script

```bash
export TREASURY_LEDGER_ADDRESS=0x...
npx hardhat run scripts/verify_triple_stack_treasury.ts --network avalanche
```

### Verification Checks

The verification script validates:
1. ✅ Contract deployment and code existence
2. ✅ Role configuration (Admin, Minter, Blu-Vault, Sovereign, Dual-Reality)
3. ✅ Treasury metrics ($28.9M/sec, $2.5T/day, π₄ constant)
4. ✅ Yield stream configuration (codes, yields, activation)
5. ✅ π₄ compounding parameters (intervals, base yields)
6. ✅ Current yield accumulation
7. ✅ Token URI configuration
8. ✅ Interface support (ERC1155, AccessControl)
9. ✅ Minted token balances

## Smart Contract Functions

### Minting Functions

#### `mintYieldStream(address to, uint256 tokenId, uint256 amount, bytes32 authTag)`
Mint a single yield stream ENFT with Blu-Vault authorization.

#### `mintAllYieldStreams(address to, uint256 civilianAmount, uint256 militaryAmount, uint256 cosmicAmount, bytes32 authTag)`
Mint all three yield streams in a single transaction.

### Yield Functions

#### `accumulateYield(uint256 tokenId)`
Accumulate yield for a stream based on time elapsed. Applies π₄ compounding if enabled.

#### `calculateCurrentYield(uint256 tokenId)`
View function to calculate current accumulated yield without state changes.

#### `applyPi4Compounding(uint256 tokenId)`
Manually apply π₄ compounding adjustment. Requires `BLU_VAULT_ROLE`.

### Authorization Functions

#### `setDualRealityConfirmation(uint256 tokenId, bytes32 confirmationHash)`
Set dual-reality confirmation lock. Requires `DUAL_REALITY_VALIDATOR` role.

#### `verifyDualReality(bytes32 confirmationHash)`
Verify if a dual-reality confirmation exists.

#### `sovereignOverride(uint256 tokenId, string action, uint256 newValue)`
Sovereign override function. Requires `SOVEREIGN_OVERRIDE_ROLE` (4way4eva only).

**Actions**:
- `RESET_YIELD`: Reset total accumulated yield
- `SET_YIELD_RATE`: Modify yield per second
- `TOGGLE_ACTIVE`: Activate/deactivate stream

### View Functions

#### `getYieldMetadata(uint256 tokenId)`
Get complete metadata for a yield stream.

#### `getBluVaultAuth(uint256 tokenId)`
Get Blu-Vault authorization details.

#### `getPi4Parameters(uint256 tokenId)`
Get π₄ compounding parameters.

#### `getTreasuryMetrics()`
Get global treasury metrics (total yield/sec, daily yield, π₄ constant).

## Integration Examples

### Web3.js Integration

```javascript
const Web3 = require('web3');
const web3 = new Web3('https://api.avax.network/ext/bc/C/rpc');

const contract = new web3.eth.Contract(ABI, contractAddress);

// Get current yield for Civilian stream
const currentYield = await contract.methods.calculateCurrentYield(1).call();
console.log('Civilian yield:', web3.utils.fromWei(currentYield, 'ether'), 'USD');

// Get all treasury metrics
const metrics = await contract.methods.getTreasuryMetrics().call();
console.log('Total yield/sec:', web3.utils.fromWei(metrics[0], 'ether'), 'USD');
```

### Ethers.js Integration

```javascript
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const contract = new ethers.Contract(contractAddress, ABI, provider);

// Get yield metadata
const metadata = await contract.getYieldMetadata(1);
console.log('Civilian stream:', metadata.name);
console.log('Yield/sec:', ethers.formatEther(metadata.yieldPerSecond), 'USD');
console.log('Active:', metadata.isActive);
```

## Security Considerations

### Blu-Vault Authorization
- All minting operations require valid Blu-Vault authorization tags
- Tags are generated using keccak256 hash of deployer, timestamp, and authorization string
- Tags are stored on-chain and linked to specific token IDs

### Dual-Reality Confirmation
- Cross-dimensional validation ensures ledger integrity
- Confirmations stored as hashes in mapping
- Validator role required to set confirmations

### Sovereign Override
- Reserved exclusively for 4way4eva address
- Provides emergency controls for yield management
- Actions emit `SovereignOverride` events for transparency

### Reentrancy Protection
- All state-changing functions protected with `nonReentrant` modifier
- Guards against reentrancy attacks on minting and yield accumulation

### Access Control
- Role-based permissions using OpenZeppelin AccessControl
- Multiple roles for segregation of duties
- Role admin can grant/revoke roles

## Chain Interoperability

### Snowtrace (Avalanche)
- Chain ID: 43114
- Explorer: https://snowtrace.io
- Verification: Supported via Hardhat plugin

### Cronos
- Chain ID: 25
- Explorer: https://cronoscan.com
- Verification: Custom chain configuration required

### Multi-Chain URI
- Contract supports chain-specific base URIs
- `configureChainURI(chainId, baseURI)` sets per-chain metadata
- Falls back to default URI if chain-specific not configured

## Monitoring & Analytics

### Events to Monitor

```solidity
event YieldStreamMinted(address indexed to, uint256 indexed tokenId, YieldStream stream, uint256 amount, bytes32 authTag)
event YieldAccumulated(uint256 indexed tokenId, uint256 amount, uint256 totalAccumulated)
event Pi4CompoundingApplied(uint256 indexed tokenId, uint256 oldYield, uint256 newYield, uint256 timestamp)
event BluVaultAuthorizationSet(uint256 indexed tokenId, bytes32 authTag, address authorizedBy)
event DualRealityConfirmed(uint256 indexed tokenId, bytes32 confirmationHash, address validator)
event SovereignOverride(uint256 indexed tokenId, string action, address indexed sovereignAddress)
```

### Recommended Monitoring
1. Track `YieldAccumulated` events for treasury growth
2. Monitor `Pi4CompoundingApplied` for compounding cycles
3. Alert on `SovereignOverride` events (emergency actions)
4. Verify `DualRealityConfirmed` for cross-dimensional validation

## Troubleshooting

### Common Issues

#### "Insufficient gas"
- Increase gas limit in transaction
- Check network gas prices
- Ensure sufficient native token balance

#### "Not authorized"
- Verify sender has required role
- Check role assignments with `hasRole()`
- Grant role using `grantRole()` if admin

#### "Invalid auth tag"
- Ensure Blu-Vault authorization is set
- Verify auth tag is non-zero bytes32
- Check `getBluVaultAuth()` for current tag

#### "Yield stream not active"
- Verify stream is initialized
- Check `isActive` in metadata
- Activate with sovereign override if needed

## Support & Resources

- **Documentation**: `/docs/TRIPLE_STACK_TREASURY_GUIDE.md`
- **Treasury Ledger**: `MEGAZION_TripleStack_Treasury_Ledger.md`
- **Phase 77777**: `Phase_77777_Reciprocal_Protocol.md`
- **Deployment Records**: `/deployments/` directory

## License

MIT License - MEGAZION Sovereign Treasury System

---

**Commander Bleu** retains sovereign override authority.  
**Status**: Vault conduits open, triple-stack streams flowing, reciprocity pulse recorded.
