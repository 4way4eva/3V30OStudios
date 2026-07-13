# BLEU Coin™ Infrastructure System

## Overview

The BLEU Coin™ Infrastructure System establishes sovereign wealth infrastructure with pre-authorized interoperability between Civilian, Military, and Cosmic streams. This system provides soul-linked tracing, inflation resistance, and comprehensive audit trails for all wealth operations.

## Core Components

### 1. BLEUCoin Token Contract (`BLEUCoin.sol`)

**Purpose**: ERC-20 token with three-tier access control and soul-linked tracing

**Key Features**:
- Three independent wealth streams (Civilian, Military, Cosmic)
- Soul-link authentication for all accounts
- Inflation-resistant max supply controls
- Immutable mint records with celestial alignment
- Cross-ledger visibility
- Pausable for emergency scenarios

**Stream Types**:
1. **CIVILIAN_STREAM** (Type 1): BLEU Bills for public commerce, education, and civilian infrastructure
2. **MILITARY_STREAM** (Type 2): Enhanced Military Credits for strategic and defense operations
3. **COSMIC_STREAM** (Type 3): Plasma-Funded and Portal-Based Cosmic Credits

**Access Control Roles**:
- `MINTER_ROLE`: Authority to mint tokens and soul-link addresses
- `PAUSER_ROLE`: Emergency pause authority
- `AUDITOR_ROLE`: Read-only audit access
- Stream-specific roles for each tier

### 2. BLEUVault Treasury Contract (`BLEUVault.sol`)

**Purpose**: Multi-stream treasury management with reconciliation and restitution

**Key Features**:
- Separate vault balances for each stream
- Immutable receipt generation
- Treasury reconciliation snapshots with merkle root verification
- Taxation reversal mechanisms (restitution claims)
- Price index tracking
- EV0L wealth oversight integration

**Vault Operations**:
- **Deposit**: Users deposit BLEU into specific stream vaults
- **Withdrawal**: Treasurers withdraw with full audit trail
- **Snapshot**: Auditors create reconciliation checkpoints
- **Restitution**: Process taxation reversal claims

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BLEU Coin™ Infrastructure                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  BLEUCoin    │◄────────┤  BLEUVault   │                 │
│  │   (ERC-20)   │         │  (Treasury)  │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                         │                          │
│         │ Soul-Linked             │ Receipt-Based            │
│         │ Minting                 │ Withdrawals              │
│         ▼                         ▼                          │
│  ┌─────────────────────────────────────────┐                │
│  │         Three-Tier Stream System        │                │
│  ├─────────────────────────────────────────┤                │
│  │  1. Civilian   (BLEU Bills)             │                │
│  │  2. Military   (Enhanced Military)       │                │
│  │  3. Cosmic     (Plasma/Portal Credits)   │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Guide

### Prerequisites

```bash
npm install --legacy-peer-deps
```

### Step 1: Deploy Infrastructure

```bash
npx hardhat run scripts/deploy_bleu_coin_infrastructure.ts --network <network>
```

This deploys:
- BLEUCoin token contract
- BLEUVault treasury contract
- Sets up access control roles
- Records deployment manifest

### Step 2: Execute Inaugural Mass Mint

```bash
npx hardhat run scripts/bleu-coin-mass-mint.ts --network <network>
```

This executes:
- Soul-links all recipient addresses
- Mints initial token allocations across all three streams
- Generates immutable audit logs with:
  - Receipt IDs
  - Celestial alignment data
  - ☆seal verification hashes
  - Live-blue time linkages
  - Transaction hashes and block numbers

### Step 3: Create Treasury Snapshot

```bash
npx hardhat run scripts/bleu-treasury-snapshot.ts --network <network>
```

This generates:
- Reconciliation snapshot with merkle root
- Price index reference
- Stream-by-stream balance audit
- Delta calculations (minted vs. vaulted)

## Data Structures

### Mint Batch Specification

Located in `data/inaugural-mint-batch.json`, the mint batch follows the schema defined in `schemas/bleu-coin-mint-schema.json`.

**Key Fields**:
```json
{
  "mintBatch": {
    "batchId": "INAUGURAL-MINT-001",
    "timestamp": "ISO 8601 timestamp",
    "celestialAlignment": "JUDAH-COUNT alignment tick",
    "sealVerification": "0x... ☆seal hash",
    "totalAmount": "Total BLEU to mint",
    "streams": {
      "civilian": { ... },
      "military": { ... },
      "cosmic": { ... }
    }
  }
}
```

### Audit Trail Output

After mass minting, audit logs are saved to `data/snapshots/mint-audit-*.json` with:
- Complete transaction history
- Soul-link and mint record IDs
- Gas usage per transaction
- Celestial and seal alignments
- Success/failure status

### Treasury Snapshot Output

Snapshots are saved to `data/snapshots/treasury-snapshot-*.json` with:
- Vault balances per stream
- Total minted supply per stream
- Reconciliation deltas
- Merkle root verification
- Price index reference

## Security Features

### 1. Soul-Link Authentication
Every address must be soul-linked before receiving minted tokens. Soul-links include:
- Celestial alignment (Judah-count)
- ☆Seal hash verification
- Stream type authorization
- Immutable timestamp

### 2. Inflation Resistance
- Hard cap on max supply (1 Trillion BLEU default)
- Per-mint validation against total supply
- Admin-only supply adjustments (with safeguards)

### 3. Cross-Ledger Visibility
- All mint records stored on-chain with unique IDs
- Stream-specific supply tracking
- Vault reconciliation with merkle roots
- Public audit trail via events

### 4. Taxation Reversal (Restitution)
- Claims submitted by affected parties
- Approval required by RESTITUTION_ROLE holders
- Immutable receipt generation
- Funds drawn from civilian stream vault

### 5. Emergency Controls
- Pausable contracts for security incidents
- Multi-role access control
- Event logging for all critical operations

## Integration with Existing EV0L Infrastructure

The BLEU Coin Infrastructure integrates with:

1. **MEGAZION Treasury Ledger**: Three-tier yields now include BLEU Coin flows
2. **EV0L Codex NFT**: BLEU can be linked to NFT governance and restitution mechanisms
3. **Phase 77777 Protocol**: BLEU participates in reciprocity cycles
4. **Watchtower Systems**: Audit logs feed into watchtower monitoring

## API Reference

### BLEUCoin Contract

#### `soulLink(address account, string celestialAlignment, bytes32 sealHash, uint8 streamType)`
Links an address to the BLEU system with soul authentication.

**Parameters**:
- `account`: Address to soul-link
- `celestialAlignment`: Judah-count alignment string
- `sealHash`: ☆seal verification hash
- `streamType`: 1=Civilian, 2=Military, 3=Cosmic

**Access**: MINTER_ROLE

#### `mintWithReceipt(address recipient, uint256 amount, uint8 streamType, string receiptId, bytes32 sealVerification)`
Mints BLEU with full audit trail and receipt generation.

**Returns**: `bytes32` mint record ID

**Access**: MINTER_ROLE

#### `getStreamSupply(uint8 streamType)`
Returns total minted supply for a specific stream.

#### `getSoulLink(address account)`
Retrieves soul-link information for an address.

### BLEUVault Contract

#### `deposit(uint256 amount, StreamType streamType)`
Deposits BLEU into a specific vault stream.

#### `withdraw(address recipient, uint256 amount, StreamType streamType, ...)`
Withdraws from vault with receipt generation.

**Access**: TREASURER_ROLE

#### `createSnapshot(bytes32 merkleRoot, string priceIndex)`
Creates a treasury reconciliation snapshot.

**Returns**: `uint256` snapshot ID

**Access**: AUDITOR_ROLE

#### `submitRestitutionClaim(uint256 amount, string justification)`
Submits a taxation reversal claim.

**Returns**: `bytes32` claim ID

#### `processRestitutionClaim(bytes32 claimId, ...)`
Approves and processes a restitution claim.

**Access**: RESTITUTION_ROLE

## Compliance & Audit

### Immutable Audit Requirements

All BLEU Coin operations include:

✅ **Authenticity**: Soul-link verification with celestial alignment
✅ **Mint Window**: Timestamp and block number recording
✅ **☆Seal Alignment**: Cryptographic hash verification
✅ **Live-Blue Time Linkages**: Temporal coordination data
✅ **Celestial Judah-Count Alignment**: Cultural/ceremonial compliance

### Audit-Friendly JSON Structures

All system outputs conform to the audit schema:
- Recipient identification
- Amount and stream type
- Dual hash verification (soul-link + seal)
- Time-series linkages
- Transaction proof (tx hash + block)

### EV0L Wealth Oversight

The treasury provides:
- Real-time balance queries per stream
- Historical snapshot retrieval
- Merkle-proof verification
- Price index correlation
- Restitution claim tracking

## Taxation Reversal Mechanisms

### Philosophy

The BLEU Coin system recognizes that historical and ongoing taxation has often constituted unauthorized extraction. The restitution mechanism provides transparent, verifiable reversals.

### Process

1. **Claim Submission**: Affected party submits claim with justification
2. **Review**: RESTITUTION_ROLE holders evaluate claim
3. **Approval**: Approved claims are processed automatically
4. **Receipt Generation**: Immutable receipt issued to claimant
5. **Vault Deduction**: Funds drawn from civilian stream vault

### Righteous Receipts

Restitution receipts include:
- `isRestitution: true` flag
- Original claim justification
- Approval authority signature
- Full celestial and seal alignment
- BLEU oversight declaration

## Future Enhancements

### Planned Features
- Cross-chain bridge for BLEU transfers
- Staking mechanisms per stream
- Governance voting with BLEU holdings
- Automated price oracle integration
- ZK-proof privacy for sensitive transactions

### Integration Roadmap
- BLEUE Academy credential backing
- MirrorMarket commerce integration
- HoverLane-8 transport payments
- MetaCurriculum tokenized rewards

## Support & Documentation

For additional information:
- Smart Contract Source: `/contracts/BLEU*.sol`
- Deployment Scripts: `/scripts/deploy_bleu_coin_infrastructure.ts`
- Mint Scripts: `/scripts/bleu-coin-mass-mint.ts`
- Treasury Scripts: `/scripts/bleu-treasury-snapshot.ts`
- Data Schema: `/schemas/bleu-coin-mint-schema.json`
- Example Data: `/data/inaugural-mint-batch.json`

## License

SPDX-License-Identifier: MIT

---

**Status**: Infrastructure contracts deployed and ready for inaugural minting

**Version**: 1.0.0

**Last Updated**: 2025-11-07
