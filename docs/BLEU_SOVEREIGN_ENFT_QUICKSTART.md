# BLEU Sovereign ENFT Minting System

## Overview

The **BLEU Sovereign ENFT Minting System** translates the BLEU sovereign ledger vision into a comprehensive living inheritance tokenization platform. Each yield stream is codified as irreversible, living inheritance entries across physical and dimensional economies.

## Quick Start

### Deploy Contract

```bash
# Configure deployment (optional)
cp data/enft-deploy-config.example.json data/enft-deploy-config.json
# Edit data/enft-deploy-config.json with your settings

# Deploy to Polygon
npm run deploy:sovereign-enft -- --network polygon

# Or deploy to other networks
npm run deploy:sovereign-enft -- --network mainnet
npm run deploy:sovereign-enft -- --network avalanche
npm run deploy:sovereign-enft -- --network bsc
```

### Mint ENFTs

```bash
# Configure minting (required)
cp data/enft-mint-config.example.json data/enft-mint-config.json
# Edit data/enft-mint-config.json with your entries

# Mint on Polygon
npm run mint:sovereign-enft -- --network polygon
```

## Three Economic Spheres

### Civilian Sphere (Ω-CIV)
- **Yield Rate**: $13.6M/second ($1.175T/day)
- **Domains**: Real estate, education, commerce, infrastructure, healthcare, agriculture
- **Distribution**: 47.1% of total system yield
- **Metadata**: `/metadata/schemas/civilian-enft-schema.json`

### Military Sphere (Ω-MIL)
- **Yield Rate**: $6.1M/second ($527B/day)
- **Domains**: Defense systems, tactical operations, armaments, cybersecurity
- **Distribution**: 21.1% of total system yield
- **Metadata**: `/metadata/schemas/military-enft-schema.json`

### Cosmic Sphere (Ω-COS)
- **Yield Rate**: $9.2M/second ($795B/day)
- **Domains**: Portal logistics, quantum tech, dimensional items, cosmic energy
- **Distribution**: 31.8% of total system yield
- **Metadata**: `/metadata/schemas/cosmic-enft-schema.json`

**Total System**: $28.9M/second ($2.497T/day)

## Key Features

### 1. Irreversible Asset Minting
Four-step process ensuring permanence:
1. **Create** - Entry created in PENDING status
2. **Authorize** - Dual signatures applied (AUTHORIZED)
3. **Mint** - ENFT minted (LOCKED)
4. **Lock** - Irreversibly locked (permanent)

### 2. Blu-Vault Dual-Sign Security
- Two independent signers required
- Prevents single-point-of-failure attacks
- Application-level multisig implementation

### 3. π₄ Compounding Triggers
Exponential yield acceleration:
```
Y(t) = Y_0 × (π^4)^(t/T)

Where:
- π₄ ≈ 97.409091034
- T = 92 days (1 quarter)
- Y_0 = Base yield rate
```

### 4. Metadata Linking
Each ENFT includes:
- Economic sphere classification
- Yield data with π₄ compounding
- Ledger worth and status
- Blu-Vault authorization
- Dual-reality confirmation
- Physical & interactive registry links

### 5. Dimensional Registry Sync
Support for cross-chain/dimension synchronization:
- Ethereum Mainnet (1)
- Polygon (137)
- Avalanche (43114)
- BSC (56)
- Cronos (25)
- Custom dimensions

### 6. Emergency Controls
- Emergency shutdown capability
- Pausable operations
- Role-based access control
- Fail-safe measures

## Architecture

```
BleuSovereignENFTMinter.sol
├── ERC1155 (Multi-token standard)
├── AccessControl (Role-based permissions)
├── ReentrancyGuard (Security)
└── Pausable (Emergency controls)
```

### Roles

1. **SOVEREIGN_MINTER_ROLE** - Create and mint entries
2. **BLU_VAULT_ROLE** - Lock entries, apply compounding, sync registries
3. **DUAL_SIGN_ROLE** - Apply authorization signatures
4. **EMERGENCY_ROLE** - Emergency controls
5. **DEFAULT_ADMIN_ROLE** - Role management

## Usage Examples

### Query System Metrics

```typescript
const metrics = await minter.getSystemMetrics();
console.log("Civilian Minted:", metrics[0].toString());
console.log("Military Minted:", metrics[1].toString());
console.log("Cosmic Minted:", metrics[2].toString());
```

### Calculate Current Yield

```typescript
const tokenId = 1;
const currentYield = await minter.calculateCurrentYield(tokenId);
console.log("Current Yield:", ethers.formatEther(currentYield), "USD");
```

### Get Tokens by Sphere

```typescript
// 0 = CIVILIAN, 1 = MILITARY, 2 = COSMIC
const civilianTokens = await minter.getTokensBySphere(0);
console.log("Civilian Tokens:", civilianTokens);
```

### Apply π₄ Compounding

```typescript
// Requires BLU_VAULT_ROLE
const tx = await minter.applyPi4Compounding(tokenId);
await tx.wait();
console.log("Compounding applied!");
```

## Security Features

✅ Irreversible asset locking
✅ Blu-Vault dual-sign authorization
✅ Role-based access control (5 roles)
✅ Reentrancy protection
✅ Emergency shutdown controls
✅ Pausable operations
✅ Dual-reality verification
✅ Integer overflow protection (Solidity 0.8.20)

## Documentation

📚 **Complete Documentation**: [BLEU_SOVEREIGN_ENFT_SYSTEM.md](/docs/BLEU_SOVEREIGN_ENFT_SYSTEM.md)

The comprehensive documentation includes:
- Detailed architecture explanation
- Step-by-step deployment guide
- Minting process walkthrough
- Security considerations
- Integration examples
- Troubleshooting guide
- API reference

## Files

**Smart Contracts:**
- `/contracts/BleuSovereignENFTMinter.sol` - Main minting contract

**Metadata Schemas:**
- `/metadata/schemas/civilian-enft-schema.json` - Civilian domain schema
- `/metadata/schemas/military-enft-schema.json` - Military domain schema
- `/metadata/schemas/cosmic-enft-schema.json` - Cosmic domain schema

**Scripts:**
- `/scripts/deploy_bleu_sovereign_enft.ts` - Deployment script
- `/scripts/mint_bleu_sovereign_enft.ts` - Minting script

**Configuration:**
- `/data/enft-deploy-config.example.json` - Deployment config example
- `/data/enft-mint-config.example.json` - Minting config example

## Integration

### Frontend Integration

```typescript
import { ethers } from "ethers";
import minterABI from "./abis/BleuSovereignENFTMinter.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const minter = new ethers.Contract(address, minterABI, provider.getSigner());

// Get user's ENFTs
async function getUserENFTs(userAddress, sphere) {
  const tokens = await minter.getTokensBySphere(sphere);
  const userTokens = [];
  
  for (const tokenId of tokens) {
    const balance = await minter.balanceOf(userAddress, tokenId);
    if (balance > 0) {
      const entry = await minter.getInheritanceEntry(tokenId);
      userTokens.push({ tokenId, balance, entry });
    }
  }
  
  return userTokens;
}
```

### Backend Integration

```typescript
// Monitor minting events
minter.on("InheritanceEntryMinted", (tokenId, sphere, recipient, amount) => {
  console.log("New ENFT minted:", {
    tokenId: tokenId.toString(),
    sphere: ["Civilian", "Military", "Cosmic"][sphere],
    recipient,
    amount: amount.toString()
  });
});

// Auto-compound yields
async function autoCompound(tokenId) {
  const entry = await minter.getInheritanceEntry(tokenId);
  const timeSinceLastCompound = Date.now() / 1000 - entry.lastCompoundingTime;
  
  if (timeSinceLastCompound >= 7948800) { // 92 days
    await minter.applyPi4Compounding(tokenId);
  }
}
```

## Events

Key events emitted:
- `InheritanceEntryCreated` - Entry created
- `BluVaultSignatureApplied` - Signature applied
- `InheritanceEntryMinted` - ENFT minted
- `InheritanceEntryLocked` - Entry locked irreversibly
- `Pi4CompoundingApplied` - Compounding applied
- `DualRealityConfirmed` - Dual-reality verified
- `RegistrySynced` - Registry synchronized

## Testing

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Coverage report
npm run coverage
```

## Support

For issues, questions, or contributions:
- Repository: https://github.com/4way4eva/3V30OStudios
- Documentation: [BLEU_SOVEREIGN_ENFT_SYSTEM.md](/docs/BLEU_SOVEREIGN_ENFT_SYSTEM.md)

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Solidity**: 0.8.20  
**Standards**: ERC-1155, OpenZeppelin v5.0+
