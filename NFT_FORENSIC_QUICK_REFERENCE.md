# NFT Forensic Tools - Quick Reference Card

## 🚀 Quick Start (30 seconds)

```bash
# 1. Get free RPC endpoint (Infura/Alchemy)
export PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_API_KEY"

# 2. Inspect a token
npm run forensic:check -- --contract 0xContractAddress --tokenId 123

# 3. Generate evidence bundle
npm run forensic:bundle -- --forensic outputs/forensic_*.json --wallet 0xYourWallet
```

## 📋 Common Commands

### Single Token Investigation
```bash
PROVIDER_URL="..." npm run forensic:check -- \
  --contract 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D \
  --tokenId 1234
```

### Batch Check Multiple Tokens
```bash
PROVIDER_URL="..." npm run forensic:check -- \
  --contract 0xContractAddress \
  --tokenIds "1,2,3,4,5,10,20"
```

### Scan Entire Wallet (requires ERC721Enumerable)
```bash
PROVIDER_URL="..." npm run forensic:check -- \
  --contract 0xContractAddress \
  --wallet 0xYourWalletAddress
```

### Generate Evidence Bundle
```bash
npm run forensic:bundle -- \
  --forensic outputs/forensic_report.json \
  --wallet 0xYourWalletAddress \
  --marketplace opensea
```

### Batch Bundle from Directory
```bash
npm run forensic:bundle -- \
  --forensic-dir outputs/ \
  --wallet 0xYourWalletAddress
```

## 🌐 Multi-Chain Support

### Ethereum Mainnet
```bash
export PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY"
```

### Polygon
```bash
export PROVIDER_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"
```

### Arbitrum
```bash
export PROVIDER_URL="https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY"
```

### Avalanche
```bash
export PROVIDER_URL="https://api.avax.network/ext/bc/C/rpc"
```

### BSC (Binance Smart Chain)
```bash
export PROVIDER_URL="https://bsc-dataseed1.binance.org"
```

## 📁 Output Files

### Forensic Checker Output
- `outputs/forensic_<contract>_<tokenId>_<timestamp>.json` - Full forensic report
- `outputs/forensic_evidence_<timestamp>.csv` - CSV summary

### Evidence Bundle Output
- `outputs/evidence_bundle_<timestamp>/`
  - `pattern_ledger.json` - XX/YY/ZZ/TT/WW analysis
  - `watchtower.csv` - Audit trail
  - `dispute_opensea.txt` - Marketplace complaint
  - `dispute_looksrare.txt`
  - `dispute_magiceden.txt`
  - `pulse_manifest.json` - IPFS/Arweave manifest
  - `enft_seal.json` - On-chain evidence metadata
  - `README.md` - Bundle documentation

## 🔍 What Gets Checked

### Token Analysis
- ✅ Current owner verification
- ✅ TokenURI and metadata JSON
- ✅ SHA256 hash of metadata
- ✅ Image URI and image hash
- ✅ Transfer history (all events)
- ✅ Approval history
- ✅ Marketplace approvals

### Contract Analysis
- ✅ Metadata mutability detection
  - `setBaseURI()` function
  - `setTokenURI()` function
  - `setContractURI()` function
  - `updateMetadata()` function
- ✅ Contract owner identification
- ✅ Base URI extraction

### Warnings Detected
- ⚠️ Mutable metadata contracts
- ⚠️ Active marketplace approvals
- ⚠️ Ownership mismatches
- ⚠️ Centralized metadata hosting (HTTP vs IPFS)

## 🔐 Security Notes

### What These Tools DON'T Do
- ❌ Send transactions
- ❌ Require private keys
- ❌ Access your wallet
- ❌ Modify blockchain data
- ❌ Share data with third parties

### What These Tools DO
- ✅ Read public blockchain data only
- ✅ Fetch publicly available metadata
- ✅ Compute hashes locally
- ✅ Generate evidence files locally

## 📊 Pattern Ledger (XX/YY/ZZ/TT/WW)

### XX - Cut (First Anomaly)
- What wallet UI shows vs expected
- Contract address and token ID
- Warnings and initial observations

### YY - Return (Fund Flows)
- Transfer history
- Approval events
- Marketplace activity

### ZZ - Depth (Off-Chain)
- Metadata hosting (IPFS vs HTTP)
- Mutability functions detected
- Contract owner analysis

### TT - Timing (Temporal)
- Mint timestamp
- Transfer timestamps
- Analysis timestamp
- Session correlations

### WW - Intent (Motive)
- Suspected cause analysis
- Confidence level
- Recommended actions

**Possible Motives:**
- `METADATA_MANIPULATION` - Owner changing artwork
- `MARKETPLACE_RELISTING` - Cache override tactics
- `CENTRALIZED_METADATA_OVERRIDE` - Server-side changes
- `INVESTIGATION_REQUIRED` - Unclear pattern

## 🆘 Troubleshooting

### Error: PROVIDER_URL not set
```bash
export PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_API_KEY"
```

### Error: Failed to fetch metadata
```bash
# Try different IPFS gateway
export IPFS_GATEWAY="https://cloudflare-ipfs.com"
```

### Error: Contract may not support enumeration
```bash
# Use --tokenIds instead of --wallet
npm run forensic:check -- --contract 0x... --tokenIds "1,2,3"
```

### Network timeout/slow response
```bash
# Use a faster RPC endpoint or dedicated node
export PROVIDER_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
```

## 📚 Use Case Flowcharts

### Case 1: Wrong Artwork in Wallet
1. Screenshot the wallet UI ✓
2. Run `forensic:check` on the token ✓
3. Review `metadata.metadataHash` ✓
4. Check `mutability.hasSetTokenURI` ✓
5. Generate evidence bundle ✓
6. File marketplace dispute ✓

### Case 2: Political/Censorship Imagery
1. Capture screenshots immediately ✓
2. Run `forensic:check` to get hashes ✓
3. Review `ZZ_depth.metadata_hosting` ✓
4. Check `WW_intent.suspected_motive` ✓
5. Generate bundle for legal consultation ✓

### Case 3: Collection-Wide Changes
1. Batch check: `--tokenIds "1,2,3..."` ✓
2. Review all reports for `hasSetBaseURI` ✓
3. Check Etherscan for `setBaseURI` transactions ✓
4. Contact collection creator ✓
5. Generate multi-token evidence bundle ✓

## 🎯 Key Features

### Forensic Checker
- Read-only blockchain analysis
- No private keys required
- SHA256 hash computation
- Transfer/approval history
- Metadata mutability detection
- Multi-chain support

### Evidence Bundle Generator
- Pattern Ledger (XX/YY/ZZ/TT/WW)
- Watchtower audit CSV
- Marketplace dispute templates
- Pulse manifest for IPFS
- ENFT seal for on-chain proof
- Complete documentation

## 📞 Getting Help

### Documentation
- Full README: `NFT_FORENSIC_TOOLS_README.md` (16KB)
- Example script: `scripts/forensic_example.sh`
- This quick ref: `NFT_FORENSIC_QUICK_REFERENCE.md`

### Common Questions

**Q: Do I need private keys?**
A: No! Read-only RPC endpoint only.

**Q: Is this safe to run?**
A: Yes. No transactions, no wallet access, no blockchain modifications.

**Q: What chains are supported?**
A: All EVM chains (Ethereum, Polygon, Arbitrum, Avalanche, BSC, etc.)

**Q: Can I automate this?**
A: Yes! Write scripts that call the forensic tools programmatically.

**Q: How do I preserve evidence permanently?**
A: Pin the evidence bundle to IPFS/Arweave. See bundle README for details.

## 🔗 External Resources

### RPC Providers (Free Tier)
- Infura: https://infura.io
- Alchemy: https://www.alchemy.com
- QuickNode: https://www.quicknode.com
- Public endpoints: https://chainlist.org

### Block Explorers
- Etherscan: https://etherscan.io
- Polygonscan: https://polygonscan.com
- Arbiscan: https://arbiscan.io

### Marketplace Support
- OpenSea: support@opensea.io
- LooksRare: support@looksrare.org
- Magic Eden: https://magiceden.io/help

### IPFS Tools
- IPFS Desktop: https://docs.ipfs.tech/install/ipfs-desktop/
- Pinata: https://www.pinata.cloud
- NFT.Storage: https://nft.storage

---

**MEGAZION Codex - Sovereign Infrastructure for Web3 Evidence Collection**

*"Read-only truth extraction at the intersection of law, code, and cryptography."*

© 2024 3V30OStudios / MEGAZION Codex - MIT License
