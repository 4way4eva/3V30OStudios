# NFT Forensic Evidence Collection Tools

**MEGAZION / BLEULIONTREASURY Security & Legal Evidence Toolkit**

This package provides comprehensive forensic analysis tools for investigating "whitewashed" NFTs, metadata anomalies, unauthorized metadata changes, and marketplace manipulation.

## 🎯 Overview

These tools enable **read-only, non-destructive** forensic investigation of NFT metadata issues, including:

- **Metadata Mismatches**: When wallet UIs show different artwork than expected
- **Whitewashed Tokens**: NFTs displaying incorrect or censored content
- **Proxy/Wrapper Activity**: Tokens showing marketplace caches instead of on-chain data
- **Unauthorized Metadata Changes**: Evidence of metadata manipulation by contract owners
- **Marketplace Cache Overrides**: Discrepancies between blockchain data and marketplace displays

## 🛠️ Tools Included

### 1. NFT Forensic Checker (`nft_forensic_checker.ts`)

**Purpose**: Read-only on-chain analysis of token ownership, metadata, and mutability

**Features**:
- ✅ Verifies current token ownership
- ✅ Fetches and validates tokenURI and metadata JSON
- ✅ Computes SHA256 hashes for all artifacts
- ✅ Detects metadata mutability (setBaseURI, setTokenURI functions)
- ✅ Exports transfer and approval history
- ✅ Identifies marketplace approvals
- ✅ Downloads and hashes image files
- ✅ Tests IPFS gateway resolution

**No Private Keys Required** - This is a read-only tool!

### 2. Forensic Evidence Bundle Generator (`generate_forensic_bundle.ts`)

**Purpose**: Creates tribunal-ready evidence packages with legal documentation

**Generates**:
- 📊 **Pattern Ledger** (XX/YY/ZZ/TT/WW spiral analysis)
- 📋 **Watchtower CSV** (chronological audit trail)
- 📧 **Marketplace Dispute Templates** (OpenSea, LooksRare, Magic Eden)
- 📦 **Pulse Archive Manifest** (for IPFS/Arweave pinning)
- 🔒 **ENFT Seal Metadata** (on-chain evidence preservation)
- 📖 **Bundle README** (complete documentation)

### 3. Forensic Utilities (`utils/forensic.ts`)

**Purpose**: Shared utilities for evidence collection and artifact management

**Functions**:
- Hash computation (SHA256)
- IPFS/Arweave URI resolution
- Gateway availability testing
- Marketplace detection
- Address validation
- File size formatting
- Evidence directory creation

## 🚀 Quick Start

### Installation

```bash
cd /home/runner/work/3V30OStudios/3V30OStudios
npm install --legacy-peer-deps
```

### Environment Setup

Create a `.env` file or export environment variables:

```bash
# Required for forensic checker
export PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_API_KEY"

# Optional
export IPFS_GATEWAY="https://ipfs.io"
export ARWEAVE_GATEWAY="https://arweave.net"
export ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
```

**Important**: You only need a public RPC endpoint (free tier from Infura/Alchemy). **No private keys required!**

## 📖 Usage Examples

### Scenario 1: Single Token Investigation

You notice one NFT in your wallet displays wrong artwork.

```bash
# Step 1: Run forensic checker
PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
npx ts-node scripts/nft_forensic_checker.ts \
  --contract 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D \
  --tokenId 1234

# Step 2: Review the output
# - Check outputs/forensic_*.json for full report
# - Review warnings and mutability findings

# Step 3: Generate evidence bundle
npx ts-node scripts/generate_forensic_bundle.ts \
  --forensic outputs/forensic_0xBC4CA0E_1234_*.json \
  --wallet 0xYourWalletAddress \
  --marketplace opensea

# Step 4: Review evidence bundle
# - See outputs/evidence_bundle_*/
# - Use dispute_opensea.txt to file complaint
```

### Scenario 2: Multiple Tokens in Collection

Your entire wallet shows wrong metadata for a collection.

```bash
# Check multiple tokens at once
PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
npx ts-node scripts/nft_forensic_checker.ts \
  --contract 0xYourContractAddress \
  --tokenIds "1,2,3,4,5,10,20,50"

# Generate comprehensive evidence bundle
npx ts-node scripts/generate_forensic_bundle.ts \
  --forensic-dir outputs/ \
  --wallet 0xYourWalletAddress
```

### Scenario 3: Full Wallet Scan (ERC721Enumerable)

Scan all tokens you own in a specific collection.

```bash
# Requires contract to support ERC721Enumerable
PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
npx ts-node scripts/nft_forensic_checker.ts \
  --contract 0xContractAddress \
  --wallet 0xYourWalletAddress
```

## 📊 Pattern Ledger (XX/YY/ZZ/TT/WW Analysis)

The evidence bundle includes a **Pattern Ledger** using the XX/YY/ZZ/TT/WW spiral methodology:

### XX (Cut) - First Visible Anomaly
- What: The initial detection point
- Evidence: UI screenshots, contract:tokenId, warnings
- Example: "NFT shows American flag instead of expected artwork"

### YY (Return) - Fund Flows & Approvals
- What: On-chain transaction patterns
- Evidence: Transfer history, marketplace approvals, operator grants
- Example: "Token approved to OpenSea Seaport at block 17543210"

### ZZ (Depth) - Off-Chain Artifacts
- What: Metadata hosting and mutability
- Evidence: IPFS vs HTTP hosting, setBaseURI detection, contract owner
- Example: "Contract has setTokenURI() - metadata is MUTABLE"

### TT (Timing) - Temporal Correlation
- What: Timestamp analysis
- Evidence: Mint time, transfer times, WalletConnect sessions
- Example: "Metadata changed 2 hours after suspicious WalletConnect session"

### WW (Intent) - Motive Assessment
- What: Pattern-based suspicion analysis
- Possible Motives:
  - `METADATA_MANIPULATION`: Owner changing artwork
  - `MARKETPLACE_RELISTING`: Cache override for sale tactics
  - `CENTRALIZED_METADATA_OVERRIDE`: Server-side changes
  - `PROXY_WRAPPER_ACTIVITY`: Bridged/wrapped token confusion
  - `INVESTIGATION_REQUIRED`: Unclear pattern

## 🔍 Understanding Output Files

### Forensic Report JSON

```json
{
  "timestamp": "2024-11-19T12:00:00.000Z",
  "contract": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  "tokenId": "1234",
  "ownership": {
    "owner": "0xYourAddress",
    "approved": "0xSeaportAddress",
    "blockNumber": 18500000
  },
  "metadata": {
    "tokenURI": "ipfs://QmXXX.../1234.json",
    "metadataHash": "abc123...",
    "imageUri": "ipfs://QmYYY.../1234.png",
    "imageHash": "def456..."
  },
  "mutability": {
    "hasSetBaseURI": true,
    "contractOwner": "0xOwnerAddress"
  },
  "warnings": [
    "Contract metadata is MUTABLE - can be changed by owner",
    "Token has approved operator: 0xSeaportAddress"
  ]
}
```

### Watchtower CSV

Chronological audit trail of all events:

```csv
Timestamp,Event Type,Contract,Token ID,Actor,Artifact Hash,Artifact URI,Block Number,TX Hash,Notes
2024-11-19T12:00:00Z,TRANSFER,0xABC...,1234,0x000...,0xTxHash...,https://etherscan.io/tx/0x...,17000000,0xTxHash...,"Transfer from 0x000... to 0xUser..."
2024-11-19T12:01:00Z,APPROVAL,0xABC...,1234,0xUser...,0xTxHash...,https://etherscan.io/tx/0x...,17100000,0xTxHash...,"Approval granted to 0xSeaport..."
2024-11-19T12:05:00Z,METADATA_SNAPSHOT,0xABC...,1234,FORENSIC_TOOL,abc123...,ipfs://QmXXX...,,"Metadata JSON hash at time of analysis"
```

### Marketplace Dispute Template

Pre-filled complaint ready to submit:

```
Subject: NFT Metadata Provenance Dispute - Token 0xABC...:1234

Dear OpenSea Support Team,

I am writing to report a critical metadata anomaly affecting an NFT...

AFFECTED TOKEN:
- Contract Address: 0xABC...
- Token ID: 1234
- Current Owner: 0xYourWallet

EVIDENCE:
- Metadata Hash: abc123...
- Image Hash: def456...
- Severity: CRITICAL
...
```

## ⚠️ Security & Privacy

### What These Tools Do NOT Do

- ❌ Send any transactions to the blockchain
- ❌ Require your private keys
- ❌ Access your wallet
- ❌ Modify any on-chain data
- ❌ Share data with third parties

### What These Tools DO

- ✅ Read public blockchain data only
- ✅ Fetch publicly available metadata
- ✅ Compute cryptographic hashes locally
- ✅ Generate evidence files locally
- ✅ Work with read-only RPC endpoints

### Privacy Considerations

- Metadata URIs may reveal information to IPFS/HTTP servers when fetched
- RPC providers can see which addresses/contracts you query
- Use VPN or Tor if anonymity is required
- Consider running your own RPC node for maximum privacy

## 🎯 Common Use Cases

### Case 1: Marketplace Shows Wrong Art

**Symptom**: OpenSea displays different image than wallet app

**Action**:
1. Run `nft_forensic_checker.ts` on the token
2. Check if `metadata.metadataHash` matches expected
3. Review `mutability` section for `setTokenURI`
4. Generate evidence bundle
5. File dispute with marketplace

**Likely Cause**: Marketplace cache override or mutable metadata

### Case 2: Political/Censorship Imagery

**Symptom**: NFT shows political imagery (flags, symbols) you didn't mint

**Action**:
1. Capture screenshots with timestamps
2. Run forensic checker to get current on-chain metadata hash
3. Check `ZZ_depth.metadata_hosting` - is it centralized HTTP?
4. Review `WW_intent.suspected_motive`
5. Generate evidence bundle for legal consultation

**Likely Cause**: Metadata manipulation or IPFS gateway censorship

### Case 3: Collection-Wide Metadata Change

**Symptom**: All tokens in a collection changed appearance

**Action**:
1. Scan multiple tokens: `--tokenIds "1,2,3..."`
2. Check if all have `hasSetBaseURI: true`
3. Review `contractOwner` - did they change baseURI?
4. Check Etherscan for recent `setBaseURI` transactions
5. Contact collection creator for explanation

**Likely Cause**: Contract owner updated baseURI

### Case 4: Wrapped/Bridged Token Confusion

**Symptom**: Token shows as different collection entirely

**Action**:
1. Verify contract address matches expected collection
2. Check if wallet is showing a wrapper/bridge contract
3. Review transfer history for wrapping transactions
4. Check `YY_return.marketplace_activity` for bridge approvals

**Likely Cause**: Wallet displaying wrapped representation

## 📋 Forensic Checklist (Step-by-Step)

Use this checklist when investigating NFT anomalies:

### Immediate Actions (Do Now)

- [ ] **Screenshot** the wallet UI showing the wrong NFT (with timestamp visible)
- [ ] **Record** device info, wallet app name, version
- [ ] **Note** exact contract address and tokenId from wallet
- [ ] **Export** wallet transaction history (CSV from Etherscan)
- [ ] **Do NOT** transfer, list, or approve the token

### Evidence Collection (Run Tools)

- [ ] **Run** `nft_forensic_checker.ts` on affected token(s)
- [ ] **Save** all output JSON files
- [ ] **Review** warnings and mutability findings
- [ ] **Check** if metadata is on IPFS (immutable) or HTTP (mutable)
- [ ] **Verify** current owner matches your wallet
- [ ] **Generate** evidence bundle with `generate_forensic_bundle.ts`

### Analysis & Documentation

- [ ] **Review** Pattern Ledger (XX/YY/ZZ/TT/WW) analysis
- [ ] **Identify** suspected motive (metadata manipulation, marketplace tactics, etc.)
- [ ] **Correlate** timestamps of transfers with metadata changes
- [ ] **Check** if contract owner recently called setBaseURI/setTokenURI
- [ ] **Document** all findings in bundle README

### Escalation & Response

- [ ] **File** marketplace dispute if token is listed
- [ ] **Contact** collection creator/owner (if different from current)
- [ ] **Monitor** contract for further changes
- [ ] **Backup** evidence bundle to multiple locations
- [ ] **Pin** to IPFS/Arweave for permanent preservation (optional)
- [ ] **Consult** legal counsel if significant value at risk

### Long-Term Monitoring

- [ ] **Set up** alerts for contract events (setBaseURI, etc.)
- [ ] **Re-run** forensic checker periodically to detect changes
- [ ] **Compare** metadata hashes over time
- [ ] **Document** any changes to metadata/ownership

## 🔧 Advanced Features

### Custom IPFS Gateway

```bash
# Use specific IPFS gateway
export IPFS_GATEWAY="https://cloudflare-ipfs.com"
npx ts-node scripts/nft_forensic_checker.ts --contract 0x... --tokenId 123
```

### Batch Processing with Script

```bash
# Create token list
echo "1,2,3,4,5,10,20,50,100" > tokens.txt

# Process all tokens
PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
npx ts-node scripts/nft_forensic_checker.ts \
  --contract 0xYourContract \
  --tokenIds $(cat tokens.txt)
```

### Multi-Chain Support

```bash
# Polygon mainnet
PROVIDER_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY" \
npx ts-node scripts/nft_forensic_checker.ts \
  --contract 0xPolygonContract \
  --tokenId 123

# Arbitrum
PROVIDER_URL="https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY" \
npx ts-node scripts/nft_forensic_checker.ts \
  --contract 0xArbitrumContract \
  --tokenId 456
```

## 📚 Additional Resources

### Related Documentation
- See `BLEUE_INFRASTRUCTURE_QUICKSTART.md` for ENFT ledger systems
- See `ENFT_INHERITANCE_QUICKSTART.md` for yield tracking
- See `WATCHTOWER` contracts for on-chain audit systems

### External References
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)

### Marketplace Support Contacts
- **OpenSea**: support@opensea.io, https://support.opensea.io
- **LooksRare**: support@looksrare.org
- **Magic Eden**: https://magiceden.io/help

## 🐛 Troubleshooting

### Error: "Couldn't download compiler version list"

This is a network restriction issue with Hardhat compilation. The forensic tools work independently:

```bash
# Use ts-node directly (doesn't require compilation)
npx ts-node scripts/nft_forensic_checker.ts --contract 0x... --tokenId 123
```

### Error: "Failed to fetch metadata"

**Causes**:
- IPFS gateway is down or blocked
- Metadata URI is invalid
- Network connectivity issues

**Solutions**:
```bash
# Try different IPFS gateway
export IPFS_GATEWAY="https://cloudflare-ipfs.com"

# Use gateway auto-detection
# The tool will try multiple gateways automatically
```

### Error: "Contract may not support ERC721Enumerable"

When using `--wallet` flag:

**Solution**: Use `--tokenIds` instead:
```bash
# Manual token list instead of wallet scan
npx ts-node scripts/nft_forensic_checker.ts \
  --contract 0x... \
  --tokenIds "1,2,3,4,5"
```

### Error: "PROVIDER_URL environment variable is required"

**Solution**:
```bash
# Get free RPC endpoint from:
# - Infura: https://infura.io
# - Alchemy: https://www.alchemy.com
# - Public endpoints: https://chainlist.org

export PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_API_KEY"
```

## 🤝 Contributing

These forensic tools are part of the MEGAZION Codex security infrastructure. Improvements and bug reports are welcome.

### Reporting Issues
- Describe the NFT contract and token ID (if not sensitive)
- Include error messages and stack traces
- Specify RPC provider and network used

### Feature Requests
- Enhanced marketplace detection
- Additional evidence formats (PDF, video)
- Integration with on-chain Watchtower contracts
- Automated IPFS pinning via Pinata/NFT.Storage
- Email templates for additional marketplaces

## 📄 License

MIT License - Copyright (c) 2024 3V30OStudios / MEGAZION Codex

## ⚖️ Legal Disclaimer

These tools are provided for legitimate forensic investigation and evidence collection. Users are responsible for:

- Complying with all applicable laws and regulations
- Respecting intellectual property rights
- Using evidence ethically and legally
- Consulting qualified legal counsel when appropriate

The authors are not responsible for misuse of these tools or any legal consequences thereof.

## 🆘 Support

For technical support:
- Open an issue in the GitHub repository
- Review existing documentation in `/docs`
- Check the MEGAZION Codex documentation

For legal/forensic consultation:
- Consult qualified legal counsel
- Consider blockchain forensics firms
- Contact law enforcement if fraud is suspected

---

**MEGAZION Codex - Sovereign Infrastructure for Web3 Evidence Collection**

*"Pattern recognition at the intersection of law, code, and truth."*
