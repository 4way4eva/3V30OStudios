# NFT Forensic Tools - Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Module not found: ethers"

**Cause**: Dependencies not installed

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Issue: "PROVIDER_URL environment variable is required"

**Cause**: RPC endpoint not configured

**Solution**:
```bash
# Get free endpoint from Infura or Alchemy
export PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_API_KEY"
```

### Issue: "Failed to fetch metadata"

**Cause**: IPFS gateway down or blocked

**Solution**:
```bash
# Try alternative gateways
export IPFS_GATEWAY="https://cloudflare-ipfs.com"
# or
export IPFS_GATEWAY="https://gateway.pinata.cloud"
# or
export IPFS_GATEWAY="https://dweb.link"
```

### Issue: "TypeError: Cannot read property 'parseLog' of null"

**Cause**: Invalid contract address or network mismatch

**Solution**:
```bash
# Verify contract address is correct
# Ensure PROVIDER_URL matches the network where the contract is deployed
```

### Issue: "Contract may not support ERC721Enumerable interface"

**Cause**: Contract doesn't implement `tokenOfOwnerByIndex`

**Solution**:
```bash
# Use --tokenIds instead of --wallet
npm run forensic:check -- --contract 0x... --tokenIds "1,2,3,4,5"
```

### Issue: Slow performance when checking many tokens

**Cause**: Rate limiting on free RPC tier

**Solution**:
```bash
# Use premium RPC endpoint
# or add delays between requests
# or batch requests in smaller groups
```

### Issue: "HTTP 429: Too Many Requests"

**Cause**: RPC provider rate limit exceeded

**Solution**:
```bash
# Wait and retry
# Use different RPC provider
# Upgrade to paid tier
# Run your own node
```

### Issue: IPFS image won't download

**Cause**: Gateway timeout or CID not pinned

**Solution**:
```bash
# Try multiple gateways automatically (tool does this)
# Check if CID is still pinned
# Use IPFS Desktop to pin locally
```

### Issue: Metadata hash doesn't match expected

**Cause**: Metadata was actually changed OR using different gateway

**Solution**:
```bash
# This is the evidence you need!
# Generate evidence bundle
npm run forensic:bundle -- --forensic outputs/report.json --wallet 0x...

# Compare hashes over time
# Check for setBaseURI/setTokenURI transactions
```

### Issue: Can't run ts-node scripts

**Cause**: TypeScript or ts-node not installed

**Solution**:
```bash
# Install dependencies
npm install --legacy-peer-deps

# Or use npx
npx ts-node scripts/nft_forensic_checker.ts --contract 0x... --tokenId 123
```

### Issue: Permission denied on forensic_example.sh

**Cause**: Script not executable

**Solution**:
```bash
chmod +x scripts/forensic_example.sh
./scripts/forensic_example.sh
```

### Issue: Network timeout or connection errors

**Cause**: Network restrictions or firewall

**Solutions**:
1. Use VPN if network is restricted
2. Try different RPC provider
3. Check firewall rules
4. Use public RPC endpoint from https://chainlist.org

### Issue: Evidence bundle README shows wrong token count

**Cause**: Multiple forensic reports in directory

**Solution**:
```bash
# Generate bundle from specific report
npm run forensic:bundle -- --forensic outputs/forensic_SPECIFIC.json --wallet 0x...

# Or clean outputs directory first
rm outputs/forensic_*.json
# Then run forensic check again
```

### Issue: Screenshot hashes not matching

**Cause**: Screenshot was edited or compressed

**Solution**:
```bash
# Always use original screenshots
# Don't edit, crop, or compress
# Include device info and timestamp in filename
# Compute hash immediately after capture
```

## Advanced Troubleshooting

### Debug Mode

Add verbose logging by editing the scripts:

```typescript
// Add at top of main()
console.log("Debug: Starting forensic check");
console.log("Debug: Contract:", contractAddress);
console.log("Debug: Token ID:", tokenId);
```

### Manual Metadata Fetch

Test metadata fetching manually:

```bash
# For IPFS
curl -s "https://ipfs.io/ipfs/YOUR_CID" | jq .

# For HTTP
curl -s "https://example.com/metadata/123" | jq .

# Compute hash
curl -s "https://ipfs.io/ipfs/YOUR_CID" | shasum -a 256
```

### Manual Contract Check

Use Etherscan to verify contract functions:

1. Go to contract page on Etherscan
2. Click "Contract" tab
3. Click "Read Contract"
4. Call `tokenURI(tokenId)` manually
5. Call `ownerOf(tokenId)` manually
6. Check "Write Contract" for setBaseURI, setTokenURI

### Check Block Explorer

Verify transfer history manually:

1. Go to contract on Etherscan
2. Search for your token ID in Events tab
3. Filter by "Transfer" events
4. Compare with forensic report

## Getting Help

### Before Asking for Help

- [ ] Read NFT_FORENSIC_TOOLS_README.md
- [ ] Check this troubleshooting guide
- [ ] Verify PROVIDER_URL is set correctly
- [ ] Try with a known good contract (e.g., BAYC)
- [ ] Check npm dependencies are installed
- [ ] Review error messages carefully

### What to Include When Reporting Issues

1. **Error message** (full stack trace)
2. **Command used** (exact command)
3. **Environment**:
   - Node.js version: `node --version`
   - NPM version: `npm --version`
   - OS: Linux/Mac/Windows
4. **Contract details** (if not sensitive):
   - Contract address
   - Token ID
   - Network (mainnet, polygon, etc.)
5. **RPC provider** (Infura, Alchemy, etc.)
6. **What you expected vs what happened**

### Support Channels

- GitHub Issues: https://github.com/4way4eva/3V30OStudios/issues
- Check existing issues first
- Provide reproducible example
- Include all information listed above

## Preventive Best Practices

### Before Running Forensics

1. Install dependencies fresh: `npm ci`
2. Verify RPC endpoint works: `curl $PROVIDER_URL`
3. Test with small batch first (1-2 tokens)
4. Check network connectivity

### During Investigation

1. Capture screenshots IMMEDIATELY
2. Don't edit or modify evidence
3. Compute hashes right away
4. Save all outputs to multiple locations
5. Document everything (timestamps, device info, etc.)

### After Evidence Collection

1. Backup evidence bundle to 3+ locations
2. Don't delete original files
3. Pin to IPFS/Arweave if possible
4. Keep metadata hashes secure
5. Consider legal consultation early

## Known Limitations

### Current Limitations

1. **ERC721Enumerable Required**: Wallet scanning requires ERC721Enumerable
   - Workaround: Use `--tokenIds` instead of `--wallet`

2. **Rate Limits**: Free RPC tiers have limits
   - Workaround: Use paid tier or batch in smaller groups

3. **IPFS Gateway Availability**: Gateways can be slow or down
   - Workaround: Tool tries multiple gateways automatically

4. **Historical Metadata**: Can't retrieve past metadata if changed
   - No workaround: This is why forensics must be done ASAP

5. **Network Restrictions**: Some corporate/ISP networks block crypto sites
   - Workaround: Use VPN or mobile hotspot

### Future Improvements

- [ ] Automated IPFS pinning via Pinata/NFT.Storage API
- [ ] Historical metadata comparison (requires archive node)
- [ ] Email sending for marketplace disputes
- [ ] PDF report generation
- [ ] Video evidence capture
- [ ] Integration with on-chain Watchtower contracts
- [ ] Automated monitoring for metadata changes
- [ ] Multi-wallet batch processing
- [ ] Support for ERC-1155 NFTs

## Emergency Procedures

### If Evidence is Critical (Legal/High Value)

1. **STOP** - Don't modify anything
2. **Capture** screenshots from multiple devices
3. **Run** forensic checker immediately
4. **Generate** evidence bundle
5. **Backup** to 3+ secure locations
6. **Pin** to IPFS/Arweave NOW
7. **Contact** legal counsel
8. **Preserve** all devices used for investigation
9. **Document** every action taken
10. **Don't** discuss publicly until advised by counsel

### If Metadata Changed While Investigating

1. **Capture** new evidence immediately
2. **Run** forensic checker again
3. **Compare** hashes (old vs new)
4. **Check** Etherscan for setBaseURI/setTokenURI transaction
5. **Document** timing (proves you had original evidence)
6. **Generate** new evidence bundle
7. **Include** both reports in dispute

### If Token Transferred/Listed Unexpectedly

1. **Check** wallet for approval transactions
2. **Review** WalletConnect session logs
3. **Revoke** all approvals immediately
4. **Run** forensic checker on transferred token
5. **Contact** marketplace support
6. **File** police report if theft suspected
7. **Generate** evidence bundle with timeline
8. **Preserve** all logs and evidence

## Performance Optimization

### For Large Batches (100+ tokens)

```bash
# Process in chunks
for i in {1..20}; do
  npm run forensic:check -- --contract 0x... --tokenIds "$((i*5-4)),$((i*5-3)),$((i*5-2)),$((i*5-1)),$((i*5))"
  sleep 5  # Rate limit protection
done
```

### For Faster IPFS Resolution

```bash
# Use local IPFS node
export IPFS_GATEWAY="http://localhost:8080"

# Or use fastest public gateway
export IPFS_GATEWAY="https://cloudflare-ipfs.com"
```

### For Better Privacy

```bash
# Use Tor with SOCKS proxy
export HTTP_PROXY="socks5://127.0.0.1:9050"
export HTTPS_PROXY="socks5://127.0.0.1:9050"

# Or VPN
# Or run your own node
```

---

**Need more help?** See NFT_FORENSIC_TOOLS_README.md for detailed documentation.

© 2024 3V30OStudios / MEGAZION Codex - MIT License
