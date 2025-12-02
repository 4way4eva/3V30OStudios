# BLEU Coin™ Operations Guide

## Quick Start

### 1. Initial Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env with your private keys and RPC URLs
```

### 2. Deploy Infrastructure

```bash
# Deploy to testnet (e.g., Sepolia)
npx hardhat run scripts/deploy_bleu_coin_infrastructure.ts --network sepolia

# Or deploy to mainnet
npx hardhat run scripts/deploy_bleu_coin_infrastructure.ts --network polygon
```

**Output**: Creates `deployments/bleu-coin-<network>.json` with contract addresses

### 3. Execute Inaugural Mint

```bash
# Review mint batch data first
cat data/inaugural-mint-batch.json

# Execute mass mint
npx hardhat run scripts/bleu-coin-mass-mint.ts --network <network>
```

**Output**: Creates `data/snapshots/mint-audit-INAUGURAL-MINT-001-<timestamp>.json`

### 4. Create Treasury Snapshot

```bash
# Generate first snapshot
npx hardhat run scripts/bleu-treasury-snapshot.ts --network <network>
```

**Output**: Creates `data/snapshots/treasury-snapshot-<id>-<timestamp>.json`

## Configuration Files

### Mint Batch Configuration

Edit `data/inaugural-mint-batch.json` to customize:
- Batch ID and timestamp
- Celestial alignment values
- Seal verification hashes
- Total allocation amounts
- Recipient addresses and amounts per stream

**Important**: Ensure addresses are valid Ethereum addresses (0x prefix, 40 hex characters)

### Stream Type Reference

- `streamType: 1` = CIVILIAN
- `streamType: 2` = MILITARY
- `streamType: 3` = COSMIC

## Common Operations

### Adding New Recipients

To add recipients to a mint batch:

```json
{
  "address": "0x...",
  "amount": "1000000000000000000000",  // in wei (1000 BLEU = 1000 * 10^18)
  "soulLinkId": "SOUL-CIV-004",
  "receiptId": "RECEIPT-CIV-004",
  "metadata": {
    "celestialAlignment": "JUDAH-COUNT-77777-THETA",
    "sealHash": "0x1234...",
    "liveBlueTimeLinkage": "BLUE-TIME-2025-11-07-008",
    "notes": "Description of allocation"
  }
}
```

### Creating Additional Mint Batches

1. Copy `inaugural-mint-batch.json` to new file (e.g., `mint-batch-002.json`)
2. Update batch ID, timestamp, and recipients
3. Modify mint script to point to new file:

```typescript
const mintDataPath = path.join(__dirname, "..", "data", "mint-batch-002.json");
```

### Checking Balances

Use Hardhat console:

```bash
npx hardhat console --network <network>
```

```javascript
const bleuCoin = await ethers.getContractAt("BLEUCoin", "<address>");
const balance = await bleuCoin.balanceOf("<address>");
console.log(ethers.formatEther(balance), "BLEU");
```

### Checking Soul Links

```javascript
const soulLink = await bleuCoin.getSoulLink("<address>");
console.log({
  account: soulLink.account,
  timestamp: new Date(Number(soulLink.timestamp) * 1000).toISOString(),
  celestialAlignment: soulLink.celestialAlignment,
  streamType: soulLink.streamType
});
```

### Checking Stream Supplies

```javascript
const civilianSupply = await bleuCoin.getStreamSupply(1);
const militarySupply = await bleuCoin.getStreamSupply(2);
const cosmicSupply = await bleuCoin.getStreamSupply(3);

console.log("Civilian:", ethers.formatEther(civilianSupply), "BLEU");
console.log("Military:", ethers.formatEther(militarySupply), "BLEU");
console.log("Cosmic:", ethers.formatEther(cosmicSupply), "BLEU");
```

## Vault Operations

### Depositing to Vault

```javascript
const bleuCoin = await ethers.getContractAt("BLEUCoin", "<coin-address>");
const bleuVault = await ethers.getContractAt("BLEUVault", "<vault-address>");

// Approve vault to spend tokens
await bleuCoin.approve("<vault-address>", ethers.parseEther("1000"));

// Deposit to civilian stream (0 = CIVILIAN)
await bleuVault.deposit(ethers.parseEther("1000"), 0);
```

### Withdrawing from Vault (Treasurer Only)

```javascript
const tx = await bleuVault.withdraw(
  "<recipient>",
  ethers.parseEther("100"),
  0, // StreamType.CIVILIAN
  "JUDAH-COUNT-77777-ALPHA",
  "0xsealHash...",
  "BLUE-TIME-2025-11-07-009"
);

const receipt = await tx.wait();
console.log("Receipt ID from event:", receipt.events[...]);
```

### Creating Snapshots (Auditor Only)

```javascript
// Generate merkle root (simplified - use proper library in production)
const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("snapshot-data"));
const priceIndex = "BLEU-USD-1.00-2025-11-07";

const tx = await bleuVault.createSnapshot(merkleRoot, priceIndex);
await tx.wait();
```

## Restitution Claims

### Submitting a Claim

```javascript
const claimId = await bleuVault.submitRestitutionClaim(
  ethers.parseEther("500"),
  "Historical taxation reversal for period 2020-2023"
);
console.log("Claim ID:", claimId);
```

### Processing a Claim (Restitution Role Only)

```javascript
await bleuVault.processRestitutionClaim(
  "<claim-id>",
  "JUDAH-COUNT-77777-OMEGA",
  "0xsealHash...",
  "BLUE-TIME-2025-11-07-010"
);
```

## Access Control

### Granting Roles

```javascript
const MINTER_ROLE = await bleuCoin.MINTER_ROLE();
await bleuCoin.grantRole(MINTER_ROLE, "<address>");
```

### Checking Roles

```javascript
const hasMinterRole = await bleuCoin.hasRole(MINTER_ROLE, "<address>");
console.log("Has minter role:", hasMinterRole);
```

### Available Roles

**BLEUCoin**:
- `MINTER_ROLE` - Can soul-link addresses and mint tokens
- `PAUSER_ROLE` - Can pause/unpause contract
- `AUDITOR_ROLE` - Read-only audit access
- `CIVILIAN_STREAM` - Access to civilian stream
- `MILITARY_STREAM` - Access to military stream
- `COSMIC_STREAM` - Access to cosmic stream

**BLEUVault**:
- `TREASURER_ROLE` - Can withdraw from vault
- `AUDITOR_ROLE` - Can create snapshots
- `RESTITUTION_ROLE` - Can process restitution claims

## Emergency Procedures

### Pausing Contracts

```javascript
// Pause BLEUCoin (PAUSER_ROLE required)
await bleuCoin.pause();

// Pause BLEUVault (DEFAULT_ADMIN_ROLE required)
await bleuVault.pause();
```

### Unpausing Contracts

```javascript
await bleuCoin.unpause();
await bleuVault.unpause();
```

## Monitoring & Audit

### Event Monitoring

Listen for key events:

```javascript
// Soul link events
bleuCoin.on("SoulLinked", (account, timestamp, celestialAlignment) => {
  console.log(`Soul linked: ${account} at ${new Date(Number(timestamp) * 1000)}`);
});

// Mint events
bleuCoin.on("MintRecorded", (recordId, recipient, amount, streamType) => {
  console.log(`Minted: ${ethers.formatEther(amount)} BLEU to ${recipient}`);
});

// Vault deposits
bleuVault.on("Deposit", (from, amount, streamType) => {
  console.log(`Deposit: ${ethers.formatEther(amount)} BLEU from ${from}`);
});

// Treasury snapshots
bleuVault.on("SnapshotCreated", (snapshotId, timestamp, totalBalance) => {
  console.log(`Snapshot ${snapshotId}: ${ethers.formatEther(totalBalance)} BLEU`);
});
```

### Reading Audit Logs

Audit logs are saved in `data/snapshots/`:

```bash
# View latest mint audit
ls -lt data/snapshots/mint-audit-* | head -1

# View latest treasury snapshot
ls -lt data/snapshots/treasury-snapshot-* | head -1

# Parse with jq
cat data/snapshots/mint-audit-*.json | jq '.transactions[] | {recipient, amount, receiptId}'
```

## Integration with Existing Systems

### MEGAZION Treasury Ledger

BLEU Coin flows integrate with the Triple-Stack Treasury:

```javascript
// Track BLEU in treasury yields
const civilianYield = await bleuVault.vaultBalances(0);
const militaryYield = await bleuVault.vaultBalances(1);
const cosmicYield = await bleuVault.vaultBalances(2);

// Correlate with MEGAZION rates
// Civilian: 13.6M/sec * π⁴ compounding
// Military: 6.1M/sec * π⁴ compounding
// Cosmic: 9.2M/sec * π⁴ compounding
```

### Phase 77777 Reciprocity

BLEU participates in reciprocity cycles:

```javascript
// Calculate reciprocity allocation (50% return to holders)
const totalSupply = await bleuCoin.totalSupply();
const reciprocityAmount = totalSupply / 2n;

// Trigger at 77,777-second intervals
// Implementation TBD in Phase 77777 smart contract integration
```

## Troubleshooting

### Common Issues

**Error: "Recipient not soul-linked"**
- Solution: Call `soulLink()` before minting to the address

**Error: "Stream type mismatch"**
- Solution: Ensure soul-link stream type matches mint stream type

**Error: "Max supply exceeded"**
- Solution: Check current supply vs. max supply, or increase max supply (admin only)

**Error: "Insufficient vault balance"**
- Solution: Ensure vault has enough balance for withdrawal/restitution

### Debugging

Enable verbose logging:

```bash
npx hardhat run scripts/bleu-coin-mass-mint.ts --network <network> --verbose
```

Check transaction status on block explorer:
- Ethereum: https://etherscan.io
- Polygon: https://polygonscan.com
- Sepolia: https://sepolia.etherscan.io

## Security Best Practices

1. **Private Key Management**
   - Never commit `.env` files
   - Use hardware wallets for mainnet
   - Rotate keys after deployment

2. **Role Management**
   - Use multi-sig wallets for admin roles
   - Limit minter role to secure addresses
   - Regular audit of role holders

3. **Mint Verification**
   - Always review mint batch data before execution
   - Verify recipient addresses
   - Double-check amounts (remember 18 decimals!)

4. **Backup Procedures**
   - Save all deployment manifests
   - Archive audit logs off-chain (IPFS recommended)
   - Document all manual interventions

## Support

For issues or questions:
- Documentation: `/docs/BLEU_COIN_INFRASTRUCTURE.md`
- Smart Contracts: `/contracts/BLEU*.sol`
- Scripts: `/scripts/bleu-*.ts`
- Schema: `/schemas/bleu-coin-mint-schema.json`

---

**Version**: 1.0.0
**Last Updated**: 2025-11-07
