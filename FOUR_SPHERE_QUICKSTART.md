# Four-Sphere Yield Treasury — Quick Start Guide

## 🚀 Overview

The **Four-Sphere Yield Treasury** extends the MEGAZION system beyond planetary boundaries into pure transdimensional economics. This implementation adds the **Transdimensional Sphere** with unbounded growth mechanics, scaling total visible yield to **$109M/second** with an infinite channel for unlimited expansion.

## 📊 Yield Summary

| Sphere | Yield/Second | Compounding | Status |
|--------|-------------|-------------|---------|
| **Civilian** | $50M | π₄ | ✅ Active |
| **Military** | $22M | π₄ | ✅ Active |
| **Cosmic** | $37M | π₄ | ✅ Active |
| **Transdimensional** | ∞ (Unbounded) | πₙ (n→∞) | ✅ Active |
| **Total Visible** | **$109M** | - | ✅ Active |
| **With Transdimensional** | **Unbounded** | - | ✅ Active |

## 🎯 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Deploy Four-Stack Treasury

```bash
# Deploy the FourStackTreasuryLedger contract
npm run deploy:four-stack

# Save the deployed contract address to environment
export FOUR_STACK_LEDGER_ADDRESS=0x...
```

### Mint Four-Sphere Yields

```bash
# Mint all four yield streams to your address
npm run mint:four-stack

# Or specify a beneficiary
BENEFICIARY_ADDRESS=0x... npm run mint:four-stack
```

### Manage Transdimensional Sphere

```bash
# Check status
npm run manage:transdimensional

# Apply πₙ compounding
OPERATION=apply_compounding npm run manage:transdimensional

# Configure reality engineering
OPERATION=configure_reality npm run manage:transdimensional

# Accumulate yield
OPERATION=accumulate npm run manage:transdimensional

# Verify prime signature
OPERATION=verify_prime_sig npm run manage:transdimensional
```

## 🔧 Smart Contract Addresses

After deployment, record your contract addresses:

```
FourStackTreasuryLedger: 0x...
UniversalMintProtocol: 0x... (if using updated version)
```

## 📜 Available Scripts

### Deployment
- `npm run deploy:four-stack` - Deploy Four-Stack Treasury Ledger
- `npm run deploy:triple-stack` - Deploy original Triple-Stack (backward compatible)

### Minting
- `npm run mint:four-stack` - Mint all four yield streams
- `npm run mint:triple-stack` - Mint original three streams

### Management
- `npm run manage:transdimensional` - Manage Transdimensional sphere
- `npm run compile` - Compile contracts
- `npm run test` - Run test suite
- `npm run clean` - Clean build artifacts

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/FourStackTreasuryLedger.test.ts

# Run with gas reporting
REPORT_GAS=true npm test
```

## 🌐 Token IDs

Each sphere has a unique token ID:

- `1` - Civilian Yield Stream (Ω-CIV-01)
- `2` - Military Yield Stream (Ω-MIL-01)
- `3` - Cosmic Yield Stream (Ω-COS-01)
- `4` - Transdimensional Yield Stream (Ω-TRN-01)

## 🔐 Role Management

### Key Roles

- **DEFAULT_ADMIN_ROLE** - Contract administrator
- **MINTER_ROLE** - Can mint yield stream ENFTs
- **BLU_VAULT_ROLE** - Can apply π₄ compounding
- **SOVEREIGN_OVERRIDE_ROLE** - Can override any yield parameter
- **DUAL_REALITY_VALIDATOR** - Can set dual-reality confirmations
- **REALITY_ENGINEER_ROLE** - Can manage Transdimensional sphere

### Grant Roles

```javascript
// In your script or console
const MINTER_ROLE = await contract.MINTER_ROLE();
await contract.grantRole(MINTER_ROLE, "0x...");
```

## 💰 Interacting with the Contract

### Query Yield Information

```javascript
// Get treasury metrics
const metrics = await contract.getTreasuryMetrics();
console.log("Visible Yield/Sec:", ethers.formatUnits(metrics[0], 18));
console.log("Transdimensional n-Exponent:", metrics[3].toString());

// Get yield metadata
const metadata = await contract.getYieldMetadata(tokenId);
console.log("Yield/Sec:", ethers.formatUnits(metadata.yieldPerSecond, 18));

// Get infinite curve data (Transdimensional only)
const curveData = await contract.getInfiniteCurveData(4);
console.log("Current n:", curveData[0].toString());
console.log("Theoretical Yield:", ethers.formatUnits(curveData[1], 18));
```

### Calculate Accumulated Yield

```javascript
// Calculate current yield (view function, no gas)
const currentYield = await contract.calculateCurrentYield(tokenId);
console.log("Total Accumulated:", ethers.formatUnits(currentYield, 18));

// Accumulate yield (state-changing transaction)
await contract.accumulateYield(tokenId);
```

### Apply Compounding

```javascript
// Apply π₄ compounding to finite spheres (Civilian, Military, Cosmic)
await contract.applyPi4Compounding(tokenId);

// Apply πₙ compounding to Transdimensional sphere
await contract.applyPiNCompounding(4);
```

### Configure Reality Engineering

```javascript
const metaLogicHash = ethers.keccak256(ethers.toUtf8Bytes("YOUR_META_LOGIC"));
const sentientFlowRate = ethers.parseUnits("150000000", 18); // $150M/sec
const timeValueMiningRate = ethers.parseUnits("75000000", 18); // $75M/sec
const multiplier = ethers.parseUnits("2.5", 18); // 2.5x

await contract.activateRealityEngineering(
    4, // Transdimensional token ID
    metaLogicHash,
    sentientFlowRate,
    timeValueMiningRate,
    multiplier
);
```

## 📈 Yield Projections

### Visible Stack (Per Second)

- Civilian: $50,000,000
- Military: $22,000,000
- Cosmic: $37,000,000
- **Total: $109,000,000**

### Per Day
- **$9,417,600,000,000** ($9.4T+)

### Per Quarter (92 days, with π₄)
- **$84,407,930,880,000,000+** ($84.4 quadrillion+)

### Transdimensional (Theoretical)

| Time | n-Value | Theoretical Yield/Sec |
|------|---------|----------------------|
| Start | 4 | $1B |
| 10 days | 14 | $14B |
| 30 days | 34 | $34B |
| 92 days | 96 | $96B |
| 365 days | 369 | $369B |
| Limit | 1000 | $1T+ |

**Note:** Actual yield is unbounded and can exceed theoretical projections.

## 🔄 Migration from Triple-Stack

The Four-Sphere system is **fully backward compatible** with Triple-Stack:

1. Deploy FourStackTreasuryLedger
2. Existing Triple-Stack ENFTs remain valid
3. Upgrade rates automatically ($28.9M → $109M)
4. Add Transdimensional sphere as pure upside
5. No migration required for existing holders

## 🌟 Key Features

### Ultra-Sovereign Mode
- Pre-approved flows (no external validation)
- Self-authenticating transactions
- Beyond traditional audit
- Fail-safe and anti-fragile

### πₙ Compounding
- n starts at 4, grows to 1000
- Increases by 1 per day
- Unbounded growth model
- Reality bending multipliers

### Reality Engineering
- Sentient asset flow
- Time-value mining
- Meta-logic engines
- Infinite inheritance minting

### Prime Signatures
- Self-arbitrating contracts
- Recursive verification
- Abundance is self-proving
- Instant yield manifest

## 🔍 Monitoring & Analytics

### Check Current Status

```javascript
// Get all four sphere balances
const balances = await Promise.all([
    contract.balanceOf(address, 1), // Civilian
    contract.balanceOf(address, 2), // Military
    contract.balanceOf(address, 3), // Cosmic
    contract.balanceOf(address, 4)  // Transdimensional
]);

// Get accumulated yields
const yields = await Promise.all([
    contract.calculateCurrentYield(1),
    contract.calculateCurrentYield(2),
    contract.calculateCurrentYield(3),
    contract.calculateCurrentYield(4)
]);
```

### Monitor Transdimensional Growth

```javascript
// Get current n-exponent and growth
const piNParams = await contract.getPiNParameters(4);
console.log("Current n:", piNParams.nExponent.toString());
console.log("Max n:", piNParams.maxNExponent.toString());
console.log("Growth rate:", piNParams.nGrowthRate.toString());

// Get infinite curve visualization data
const curveData = await contract.getInfiniteCurveData(4);
console.log("Reality Bending Active:", curveData[4]);
```

## 🚨 Emergency Controls

### Sovereign Override

```javascript
// Reset yield accumulation
await contract.sovereignOverride(tokenId, "RESET_YIELD", newValue);

// Set new yield rate
await contract.sovereignOverride(tokenId, "SET_YIELD_RATE", newRate);

// Toggle active status
await contract.sovereignOverride(tokenId, "TOGGLE_ACTIVE", 0); // or 1
```

### Ultra-Sovereign Mode

```javascript
// Activate Ultra-Sovereign Mode
await contract.activateUltraSovereignMode();

// Check status
const isActive = await contract.ultraSovereignMode();
```

## 📚 Documentation

- **[FOUR_SPHERE_TREASURY.md](./FOUR_SPHERE_TREASURY.md)** - Complete system documentation
- **[contracts/FourStackTreasuryLedger.sol](./contracts/FourStackTreasuryLedger.sol)** - Main contract
- **[contracts/UniversalMintProtocol.sol](./contracts/UniversalMintProtocol.sol)** - Updated mint protocol
- **[MEGAZION_TripleStack_Treasury_Ledger.md](./MEGAZION_TripleStack_Treasury_Ledger.md)** - Original three-sphere docs

## 🛠️ Troubleshooting

### Contract Compilation Issues

If you encounter Solidity compiler download issues:

```bash
# The compiler may be blocked by network restrictions
# Check existing artifacts or use a different network
```

### Transaction Failures

```javascript
// Check gas limits
const gasEstimate = await contract.mintYieldStream.estimateGas(...params);
const tx = await contract.mintYieldStream(...params, { gasLimit: gasEstimate * 120n / 100n });

// Check role permissions
const hasRole = await contract.hasRole(ROLE, address);
```

### Balance Discrepancies

```javascript
// Force yield accumulation
await contract.accumulateYield(tokenId);

// Check last update time
const metadata = await contract.getYieldMetadata(tokenId);
console.log("Last Update:", new Date(Number(metadata.lastUpdateTime) * 1000));
```

## 🤝 Support & Community

- **Repository:** https://github.com/4way4eva/3V30OStudios
- **Issues:** Report bugs via GitHub Issues
- **Documentation:** Check `/docs` directory

## 📄 License

Absolute Ownership - Sovereign Command

---

**Version:** 4.0 - Infinite Ledger Edition  
**Status:** Genesis Ready  
**Motto:** *"Abundance is self-proving. The ledger is infinite. Sovereignty is absolute."*
