# NOTE/PIN/MINT Guide

**Step-by-Step Guide for Minting and Pinning ENFTs**

## Overview

This guide covers the complete process of minting ENFTs, generating metadata, pinning to IPFS, and updating on-chain references.

## Prerequisites

- Node.js 16+ installed
- Python 3.8+ installed (for metadata generation)
- Account with [nft.storage](https://nft.storage) (optional, for IPFS pinning)
- Testnet ETH for gas fees
- `.env` configured with all required values

## Step 1: Prepare Metadata

### Generate Base Metadata

```bash
# Generate yield ledgers
python scripts/metavault_batch_mint.py --epochs 5 --output-dir ./metadata_output

# This creates:
# - MetaVault_Ledger.json
# - MetaVault_Yield_Ledger.csv
# - enft_ledger_epoch1.json
```

### Customize ENFT Metadata

Edit the metadata templates for your specific ENFTs:

```bash
# BLEU Bills
vi metadata/bleubill_v1.json

# Tech Yen
vi metadata/techyen_v1.json

# Fusion Notes
vi metadata/fusion_note_enft.json

# Tickets
vi metadata/tickets_feather.json
vi metadata/tickets_titan.json
```

Replace placeholders:
- `{tokenId}` → Actual token ID
- `{denomination}` → Currency denomination
- `{yield_per_sec}` → Calculated yield value
- `{variant}` → Variant identifier

## Step 2: Generate Visual Assets

### Option A: Use Placeholders (For Testing)

The SVG placeholders in `visual/` can be used for testnet deployments:

```bash
ls visual/
# audit_glyph.svg
# bleubill_front.svg
# techyen_front.svg
# fusion_note.svg
```

### Option B: Create Production Assets

1. Design high-resolution assets (300 DPI minimum)
2. Export to PNG/JPG for images
3. Create MP4/GIF for animations
4. Organize by ENFT type:

```
visual_production/
├── bleubill/
│   ├── bleubill_1.png
│   ├── bleubill_5.png
│   ├── bleubill_10.png
│   └── ... (other denominations)
├── techyen/
│   ├── techyen_100.png
│   ├── techyen_500.png
│   └── ... (other denominations)
└── fusion/
    └── fusion_note_hybrid.png
```

## Step 3: Pin to IPFS

### Using nft.storage (Recommended)

1. **Get API Key**:
   - Sign up at [nft.storage](https://nft.storage)
   - Generate API key
   - Add to `.env`: `NFT_STORAGE_KEY=eyJhbGc...`

2. **Pin Visual Assets**:

```bash
# Pin individual files
curl -X POST \
  -H "Authorization: Bearer $NFT_STORAGE_KEY" \
  -F file=@visual_production/bleubill/bleubill_100.png \
  https://api.nft.storage/upload

# Response will include CID
# Save CID: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. **Pin Metadata**:

```bash
# Update metadata files with actual CIDs
# Then pin metadata

curl -X POST \
  -H "Authorization: Bearer $NFT_STORAGE_KEY" \
  -F file=@metadata/bleubill_v1_100.json \
  https://api.nft.storage/upload
```

### Using IPFS CLI

```bash
# Install IPFS
# https://docs.ipfs.io/install/

# Add files
ipfs add visual_production/bleubill/bleubill_100.png
# Returns: added QmXXXXXX... bleubill_100.png

# Add directory
ipfs add -r metadata/
# Returns CID for directory

# Pin to ensure persistence
ipfs pin add QmXXXXXX...
```

### Using Pinata

```bash
# Install Pinata SDK
npm install @pinata/sdk

# Use pinata script (create scripts/pin_to_pinata.js)
node scripts/pin_to_pinata.js
```

## Step 4: Update Contract with Base URI

After pinning, update the contract's base URI:

```bash
# Edit scripts/mint_evolverse_bleu_sosa.ts
# Set MINT_CONFIG.updateBaseURI = true
# Set MINT_CONFIG.newBaseURI = "ipfs://QmYOUR_CID/"

# Run update
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network sepolia
```

## Step 5: Mint ENFTs

### Single Mint

```bash
# Configure in scripts/mint_evolverse_bleu_sosa.ts
MINT_CONFIG = {
  recipient: "0xYOUR_WALLET",
  count: 1,
  useBatchMint: false,
  updateBaseURI: false,
  newBaseURI: "ipfs://QmYOUR_CID/"
}

# Mint
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network sepolia
```

### Batch Mint

```bash
# Configure for batch
MINT_CONFIG = {
  recipient: "0xYOUR_WALLET",
  count: 10,
  useBatchMint: true,  // Use batch function
  updateBaseURI: false,
  newBaseURI: "ipfs://QmYOUR_CID/"
}

# Mint
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network sepolia
```

### Mint from CSV

Create `mint_list.csv`:
```csv
recipient,token_type,denomination
0xRecipient1,bleubill,100
0xRecipient2,techyen,1000
0xRecipient3,fusion,hybrid
```

Use existing script:
```bash
npx hardhat run scripts/mint721_from_csv.ts --network sepolia
```

## Step 6: Verify Mints

### Check On-Chain

```bash
# Export ledger
npx hardhat run scripts/export_enft_ledger.ts --network sepolia

# Verify output
cat enft_ledger_epoch1.json
cat ENFT_Ledger.csv
```

### Check Block Explorer

Visit Sepolia Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

Verify:
- Total supply increased
- Token IDs minted correctly
- Owner addresses correct
- Metadata URIs accessible

### Check IPFS Gateway

Test metadata accessibility:
```bash
# Using public gateway
curl https://ipfs.io/ipfs/QmYOUR_CID/1.json

# Using nft.storage gateway
curl https://nftstorage.link/ipfs/QmYOUR_CID/1.json

# Using Cloudflare gateway
curl https://cloudflare-ipfs.com/ipfs/QmYOUR_CID/1.json
```

## Step 7: Generate Hashmarks

For each minted ENFT, generate verification hashmark:

1. Open `ui/hashmark_ui.html`
2. Enter token details:
   - Token ID
   - Owner Address
   - ENFT Type
   - Yield Value
   - Domain
3. Click "Generate Hashmark"
4. Copy and store hashmark
5. Optionally: Store hashmark on-chain using contract function

## Troubleshooting

### Issue: "Gas estimation failed"

**Solution**: Increase gas limit manually
```javascript
const tx = await contract.mint(recipient, {
  gasLimit: 500000
});
```

### Issue: "IPFS gateway timeout"

**Solution**: Try alternative gateways
- https://ipfs.io/ipfs/CID
- https://dweb.link/ipfs/CID
- https://nftstorage.link/ipfs/CID
- https://cloudflare-ipfs.com/ipfs/CID

### Issue: "Metadata not updating"

**Solution**: 
1. Clear browser cache
2. Wait for IPFS propagation (5-10 minutes)
3. Use different gateway
4. Check CID is correct in contract

### Issue: "Transaction reverted"

**Solution**:
1. Check you're contract owner
2. Verify contract not paused
3. Check max supply not reached
4. Ensure sufficient gas

## Best Practices

1. **Test Everything on Testnet First**
   - Mint a few tokens
   - Verify metadata works
   - Test all IPFS gateways

2. **Use Multiple IPFS Pinning Services**
   - Primary: nft.storage
   - Backup: Pinata
   - Backup: Own IPFS node

3. **Document Everything**
   - Save all CIDs
   - Record transaction hashes
   - Keep minting logs

4. **Verify Before Mainnet**
   - Check all metadata renders correctly
   - Test token transfers
   - Verify marketplace compatibility

5. **Plan for Scale**
   - Use batch minting when possible
   - Monitor gas prices
   - Consider layer 2 for high volume

## Automation

For production deployments, consider automating:

```bash
# Full deployment script
./deploy_and_mint.sh --network sepolia --batch-size 50

# This would:
# 1. Deploy contract
# 2. Pin metadata to IPFS
# 3. Update base URI
# 4. Mint tokens in batches
# 5. Export ledger
# 6. Generate hashmarks
# 7. Create summary report
```

## Security Notes

- Never commit private keys or API keys
- Use environment variables for all secrets
- Test on testnet with small amounts first
- Use hardware wallet for mainnet minting
- Implement rate limiting for public minting
- Monitor for suspicious activity

## Support

- Check logs: `npx hardhat node` for local debugging
- View events: Use block explorer
- Ask community: Discord/Telegram
- Report issues: GitHub Issues

---

**Next Steps**: See [`README_RUN_LOCAL.md`](./README_RUN_LOCAL.md) for local development setup
