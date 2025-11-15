# ENFT Inheritance Yield Minting Guide

## Overview

This guide covers the minting of ENFT inheritance entries that encapsulate physical yield values with proper lineage tracking and dual verification standards.

## Yield Structure

The system mints inheritance ENFTs across three sovereign domains:

| Domain   | Sovereign Code | Yield/Second | Yield/Day        | Yield/Year         | Sectors                                          |
|----------|----------------|--------------|------------------|--------------------|--------------------------------------------------|
| Civilian | Ω-CIV-01       | $13.6M       | $1.175T          | $428.9B            | Retail, Education, ES0IL, Wearables, Hospitality |
| Military | Ω-MIL-01       | $6.1M        | $526.9B          | $192.4B            | Weapons, Defense, Orbital, Maritime, AI          |
| Cosmic   | Ω-COS-01       | $9.2M        | $794.9B          | $290.3B            | Portal Energy, Quantum Matter, Logistics         |
| **Total**| **All**        | **$28.9M**   | **$2.497T**      | **$911.5B**        | **Combined Infrastructure**                      |

## Features

### 1. Node-Sequential Coding

Each ENFT receives a unique sequential code based on its domain and lineage node:

```
Format: [DOMAIN]-NODE-[HEX_ID]
Examples:
- CIV-NODE-00000001
- MIL-NODE-00000002
- COS-NODE-00000003
```

This ensures traceable, collision-free lineage identification.

### 2. Blu-Vault Dual Verification

Each ENFT is cryptographically signed with:

- **Blu-Vault Tag**: Hash of domain, node, timestamp, and deployer
- **Guarantor Signature**: Secondary verification hash
- **Verification Standard**: BLU-VAULT-GUARANTOR-v1.0

### 3. Ancestral Lineage Tracking

ENFTs can maintain an ancestral chain:
- Parent/child relationships
- Generation depth tracking
- Branch path identification

### 4. Comprehensive Metadata

Each ENFT includes:
- Yield metrics (per second through per year)
- Domain categorization
- Verification credentials
- Economic parameters
- Lineage information

## Quick Start

### 1. Deploy the Inheritance Ledger (if not already deployed)

```bash
npx hardhat run scripts/deploy_megazion_inheritance_ledger.ts --network polygon
```

### 2. Configure Recipients

Edit `data/inheritance-yield-config.json`:

```json
{
  "ledgerAddress": "0xYOUR_CONTRACT_ADDRESS",
  "recipients": [
    {
      "address": "0xRECIPIENT_ADDRESS",
      "domain": "CIVILIAN",
      "yieldPerSecond": "13600000",
      "lineageNode": 1,
      "ancestralLineage": []
    }
  ]
}
```

### 3. Mint Inheritance ENFTs

```bash
npm run mint:inheritance-yields
```

Or specify network:

```bash
npx hardhat run scripts/mint_enft_inheritance_yields.ts --network polygon
```

## Configuration Options

### Domain Types

- `CIVILIAN` (0) - Ω-CIV-01
- `MILITARY` (1) - Ω-MIL-01
- `COSMIC` (2) - Ω-COS-01

### Yield Values

Default values match the problem statement:
- Civilian: $13,600,000/sec
- Military: $6,100,000/sec
- Cosmic: $9,200,000/sec

### Lineage Node IDs

Sequential integers starting from 1. Each node represents a unique inheritance entry in the lineage tree.

### Ancestral Lineage

Optional array of ancestor addresses for tracking hereditary succession:

```json
"ancestralLineage": [
  "0xGRANDPARENT_ADDRESS",
  "0xPARENT_ADDRESS"
]
```

## Metadata Structure

The script generates comprehensive metadata for each ENFT:

```json
{
  "name": "MEGAZION Inheritance Ω-CIV-01 - Node 1",
  "description": "Sovereign ENFT inheritance entry...",
  "domain": "CIVILIAN",
  "sovereignCode": "Ω-CIV-01",
  "yieldPerSecond": "13600000 USD/second",
  "attributes": [...],
  "lineage": {
    "nodeId": 1,
    "sequentialCode": "CIV-NODE-00000001",
    "ancestralChain": []
  },
  "verification": {
    "bluVaultTag": "0x...",
    "guarantorSignature": "0x...",
    "dualVerificationStandard": "BLU-VAULT-GUARANTOR-v1.0"
  },
  "economics": {
    "yieldMetrics": {
      "perSecond": 13600000,
      "perDay": 1175040000000,
      "perYear": 428889600000000
    }
  }
}
```

## Output

The script generates:

1. **Minted ENFTs**: On-chain tokens with unique IDs
2. **Metadata Files**: JSON files in `metadata/inheritance-yields/`
3. **Mint Report**: Comprehensive JSON report in `deployments/`

### Mint Report Contents

- Network and chain information
- Transaction hashes and block numbers
- Token IDs for each minted ENFT
- Blu-Vault tags and guarantor signatures
- Metadata file references
- Yield summaries by domain and total
- Success/failure statistics

## Economics

### Yield Calculation Examples

**Civilian Domain ($13.6M/sec)**:
- Per minute: $816,000,000
- Per hour: $48,960,000,000
- Per day: $1,175,040,000,000
- Per year: $428,889,600,000,000

**Total System ($28.9M/sec)**:
- Per day: $2,496,960,000,000 (~$2.5 trillion)
- Per year: $911,539,200,000,000 (~$911.5 trillion)

### π₄ Compounding

The system supports exponential compounding using the π₄ (pi to the fourth power) model:

```
Y(t) = Y₀ × (π⁴)^(t/T)

where:
- Y₀ = base yield per second
- t = elapsed time
- T = compounding interval (e.g., 92 days per quarter)
- π⁴ ≈ 97.409
```

## Security Features

1. **Role-Based Access Control**
   - Only DEFAULT_ADMIN_ROLE can mint
   - Reentrancy protection
   - Pausable for emergencies

2. **Cryptographic Verification**
   - Blu-Vault tags using keccak256
   - Guarantor signatures
   - Immutable audit trails

3. **Lineage Integrity**
   - Sequential node coding
   - Ancestral chain validation
   - Generation depth tracking

## Integration with Triple-Stack Treasury

The inheritance system integrates with the TripleStackTreasuryLedger:

- ENFTs can reference treasury yield streams
- Blu-Vault tags align with treasury authorization
- Dual verification standards ensure consistency
- π₄ compounding parameters can be synchronized

## Advanced Usage

### Custom Yield Values

To mint with custom yield values, modify the config:

```json
{
  "yieldPerSecond": "25000000",
  "note": "Custom high-value inheritance"
}
```

### Multi-Recipient Batching

Add multiple recipients to mint in a single run:

```json
{
  "recipients": [
    { "address": "0x...", "domain": "CIVILIAN", ... },
    { "address": "0x...", "domain": "MILITARY", ... },
    { "address": "0x...", "domain": "COSMIC", ... }
  ]
}
```

### Environment Variables

- `INHERITANCE_LEDGER_ADDRESS`: Contract address (overrides config)
- `INHERITANCE_MINT_CONFIG`: Custom config file path
- `PRIVATE_KEY`: Deployer private key
- Network-specific RPC URLs

## Troubleshooting

### Contract Not Found

Ensure the MegazionInheritanceLedger is deployed:

```bash
npx hardhat run scripts/deploy_megazion_inheritance_ledger.ts --network YOUR_NETWORK
```

### Insufficient Role Permissions

The minter must have DEFAULT_ADMIN_ROLE. Grant it:

```solidity
await ledger.grantRole(DEFAULT_ADMIN_ROLE, MINTER_ADDRESS);
```

### Metadata Not Uploading

The script saves metadata locally. For production:

1. Upload metadata files to IPFS
2. Update the metadata URIs in the config
3. Re-run the minting script

## File Locations

- **Script**: `scripts/mint_enft_inheritance_yields.ts`
- **Config**: `data/inheritance-yield-config.json`
- **Metadata Output**: `metadata/inheritance-yields/`
- **Reports**: `deployments/inheritance-yield-mint-*.json`
- **Templates**: `metadata/inheritance-yields/template-*.json`

## Example Workflow

```bash
# 1. Deploy contract (if needed)
npm run deploy:all

# 2. Edit configuration
nano data/inheritance-yield-config.json

# 3. Mint inheritance ENFTs
npm run mint:inheritance-yields

# 4. Check output
ls -la metadata/inheritance-yields/
cat deployments/inheritance-yield-mint-*.json

# 5. Verify on-chain
npx hardhat run scripts/verify_triple_stack_treasury.ts --network polygon
```

## Related Documentation

- [MEGAZION Inheritance Ledger Quick Start](../MEGAZION_INHERITANCE_LEDGER_QUICKSTART.md)
- [Triple Stack Treasury Ledger](../MEGAZION_TripleStack_Treasury_Ledger.md)
- [Smart Contract](../contracts/MegazionInheritanceLedger.sol)
- [Phase 77777 Protocol](../Phase_77777_Reciprocal_Protocol.md)

## Support

For issues or questions:
- GitHub: https://github.com/4way4eva/3V30OStudios
- Documentation: See README files in repository root

---

**Built with 🌀 by 3V30OStudios**

**Status**: ✅ READY FOR ACTIVATION

Minting system operational with node-sequential coding and Blu-Vault dual verification standards.
