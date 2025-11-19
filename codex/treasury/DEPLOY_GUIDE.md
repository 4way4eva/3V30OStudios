# BLEULIONTREASURY™ Deployment & Pinning Guide

**Provenance:** 2025-11-19T17:57:01Z  
**Author:** Bleu (4way4eva)  
**Version:** 1.0.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [IPFS Pinning](#ipfs-pinning)
3. [PayString Resolver Deployment](#paystring-resolver-deployment)
4. [Mirror Agent Configuration](#mirror-agent-configuration)
5. [ENFT Minting](#enft-minting)
6. [Security Notes](#security-notes)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- Node.js 18+ with npm
- Python 3.8+
- Docker & Docker Compose
- Hardhat (for smart contract deployment)
- nft.storage account and API key
- Ethereum RPC provider (Alchemy, Infura, or self-hosted)

### Environment Setup

Create a `.env` file in the project root:

```bash
# Ethereum RPC Provider
ETH_PROVIDER=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
GOERLI_PROVIDER=https://eth-goerli.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Private Keys (NEVER COMMIT THESE!)
PRIVATE_KEY=0x...
MIRROR_SIGNER_PRIVATE_KEY=0x...

# Contract Addresses
PRIMARY_VAULT=0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be

# IPFS/Storage
NFT_STORAGE_KEY=your_nft_storage_api_key

# API Endpoints
CODEX_ENDPOINT=https://codex.evolvverse.io/api/v1/records
RESOLVER_ENDPOINT=https://resolver.evolvverse.io/api/v1

# PayString
PAYSTRING_ADDRESS=4waybleu$paystring.crypto.com
```

Secure the .env file:
```bash
chmod 600 .env
echo ".env" >> .gitignore
```

---

## IPFS Pinning

### Step 1: Install nft.storage CLI

```bash
npm install -g @nftstorage/cli
```

### Step 2: Authenticate

```bash
nftstorage login
# Or set API key directly
export NFT_STORAGE_KEY=your_api_key_here
```

### Step 3: Pin Treasury Charter

```bash
# Pin the charter document
nftstorage upload codex/treasury/CODEX_TREASURY_CHARTER.md

# Example output:
# ipfs://bafkreiabcd1234567890... (QmXXXXXX...)
# Save this CID!
```

### Step 4: Pin Treasury Schema

```bash
# Pin the schema
nftstorage upload codex/treasury/treasury_node_schema.json

# Save the returned CID
```

### Step 5: Pin ENFT Metadata

First, update `codex/treasury/enft_metadata.json` with the CIDs from steps 3 and 4:

```json
{
  "image": "ipfs://YOUR_IMAGE_CID",
  "provenance": {
    "charter_ipfs": "ipfs://YOUR_CHARTER_CID",
    "schema_ipfs": "ipfs://YOUR_SCHEMA_CID"
  }
}
```

Then pin the updated metadata:

```bash
nftstorage upload codex/treasury/enft_metadata.json
```

### Step 6: Verify Pinning

Check pin status:

```bash
nftstorage status YOUR_CID
```

Access via gateway:

```
https://nftstorage.link/ipfs/YOUR_CID
https://YOUR_CID.ipfs.nftstorage.link/
```

### Alternative: Use Pinata for Redundancy

```bash
# Install Pinata SDK
npm install @pinata/sdk

# Pin to Pinata (see tools/pin_to_pinata.js for script example)
node tools/pin_to_pinata.js codex/treasury/CODEX_TREASURY_CHARTER.md
```

---

## PayString Resolver Deployment

### Option 1: Deploy to Vercel (Recommended for Serverless)

1. Create resolver API (see example below)
2. Deploy to Vercel:

```bash
cd tools/resolver
vercel --prod
```

### Option 2: Deploy to AWS Lambda

Use the Serverless Framework:

```bash
cd tools/resolver
npm install -g serverless
serverless deploy --stage production
```

### Option 3: Deploy to Traditional Server

Using PM2 for process management:

```bash
cd tools/resolver
npm install
npm run build  # if using TypeScript

# Start with PM2
pm2 start server.js --name "paystring-resolver"
pm2 save
pm2 startup
```

### Example Resolver Implementation (Express.js)

Create `tools/resolver/server.js`:

```javascript
const express = require('express');
const app = express();

// In-memory registry (use database in production)
const registry = {
  '4waybleu$paystring.crypto.com': {
    ethereum: {
      chain_id: 1,
      vault_address: '0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be',
      vault_type: 'sovereign',
      verified: true,
      codex_schema_ipfs: 'QmAAAA...',
      signature: '0x...'
    }
  }
};

app.get('/api/v1/resolve/:paystring', (req, res) => {
  const paystring = req.params.paystring;
  const chain_id = req.query.chain_id;
  
  const entry = registry[paystring];
  if (!entry) {
    return res.status(404).json({ error: 'PayString not found' });
  }
  
  // Return specific chain or all
  if (chain_id) {
    const network = Object.values(entry).find(n => n.chain_id == chain_id);
    if (!network) {
      return res.status(404).json({ error: 'Chain not supported' });
    }
    return res.json({ paystring, ...network });
  }
  
  res.json({ paystring, vaults: entry });
});

app.listen(3000, () => console.log('Resolver listening on port 3000'));
```

---

## Mirror Agent Configuration

### Step 1: Configure Environment

Ensure these variables are set in `.env`:

```bash
ETH_PROVIDER=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
CODEX_ENDPOINT=https://codex.evolvverse.io/api/v1/records
MIRROR_SIGNER_PRIVATE_KEY=0x...
PRIMARY_VAULT=0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be
POLL_INTERVAL=15000  # 15 seconds
```

### Step 2: Test on Goerli Testnet

```bash
# Switch to testnet
export ETH_PROVIDER=https://eth-goerli.g.alchemy.com/v2/YOUR_KEY
export PRIMARY_VAULT=0xYourTestnetVaultAddress

# Run agent
cd tools/mirror
node mirror_to_codex.js
```

Monitor output for events. Generate test transactions to verify mirroring.

### Step 3: Deploy with Docker (Production)

```bash
cd tools/docker

# Create .env file for Docker
cat > .env << EOF
ETH_PROVIDER=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
CODEX_ENDPOINT=https://codex.evolvverse.io/api/v1/records
MIRROR_SIGNER_PRIVATE_KEY=0x...
PRIMARY_VAULT=0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be
POLL_INTERVAL=15000
EOF

chmod 600 .env

# Build and start
docker-compose up -d

# Monitor logs
docker-compose logs -f mirror_agent

# Check status
docker-compose ps
```

### Step 4: Set Up Monitoring

Add health checks and alerts:

```bash
# Check if container is running
docker-compose ps mirror_agent

# Set up a cron job or systemd timer to restart if down
# Or use a monitoring service like Datadog, New Relic, etc.
```

---

## ENFT Minting

### Step 1: Deploy ENFT Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet first
npx hardhat run scripts/deploy_bleu_sovereign_enft.ts --network goerli

# After testing, deploy to mainnet
npx hardhat run scripts/deploy_bleu_sovereign_enft.ts --network mainnet

# Note the deployed contract address
```

### Step 2: Prepare Metadata

Update `codex/treasury/enft_metadata.json` with:
- Correct IPFS CIDs from pinning step
- Contract address (if applicable)
- Any custom attributes

### Step 3: Mint ENFT

```bash
# Update minting script with metadata CID
# Then mint
npx hardhat run scripts/mint_bleu_sovereign_enft.ts --network mainnet

# Transaction will be broadcast
# Save the transaction hash and token ID
```

### Step 4: Verify on Etherscan/OpenSea

```bash
# Verify contract
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS

# Check on OpenSea (may take a few minutes to index)
# https://opensea.io/assets/ethereum/CONTRACT_ADDRESS/TOKEN_ID
```

---

## Security Notes

### Critical Security Practices

1. **Private Key Management**
   - Never commit private keys to git
   - Use hardware wallets for production signing
   - Rotate keys periodically
   - Use separate keys for different purposes

2. **Environment Variables**
   ```bash
   # Secure .env file
   chmod 600 .env
   
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo ".env.*" >> .gitignore
   ```

3. **Docker Secrets**
   For production, use Docker secrets instead of environment variables:
   ```bash
   echo "0x..." | docker secret create mirror_private_key -
   ```

4. **Multi-Signature Wallets**
   - Use Gnosis Safe or similar for production vaults
   - Require 3-of-5 signatures for critical operations
   - Distribute signers across trusted parties

5. **Rate Limiting**
   Implement rate limiting on resolver API:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

6. **HTTPS Only**
   - Always use HTTPS for API endpoints
   - Obtain SSL/TLS certificates (Let's Encrypt)
   - Enable HSTS headers

7. **Input Validation**
   - Validate all user inputs
   - Sanitize PayString addresses
   - Check Ethereum address checksums

8. **Monitoring & Alerts**
   - Set up monitoring for mirror agent
   - Alert on transaction failures
   - Monitor vault balances
   - Log all API requests

---

## Troubleshooting

### Mirror Agent Not Starting

**Problem:** Container exits immediately

**Solution:**
```bash
# Check logs
docker-compose logs mirror_agent

# Common issues:
# 1. Missing MIRROR_SIGNER_PRIVATE_KEY
# 2. Invalid RPC endpoint
# 3. Network connectivity

# Verify environment
docker-compose config
```

### IPFS Pins Not Accessible

**Problem:** CID not resolving on gateways

**Solution:**
```bash
# Wait 1-2 minutes for propagation
# Try multiple gateways:
curl https://ipfs.io/ipfs/YOUR_CID
curl https://nftstorage.link/ipfs/YOUR_CID
curl https://cloudflare-ipfs.com/ipfs/YOUR_CID

# Re-pin if still failing
nftstorage upload --car file.car
```

### Resolver API Returns 404

**Problem:** PayString not found in registry

**Solution:**
```bash
# Check registry configuration
# Ensure PayString format is correct: user$domain
# Verify database/registry is populated
# Check API logs for errors
```

### ENFT Metadata Not Showing on OpenSea

**Problem:** Metadata not displaying correctly

**Solution:**
```bash
# Verify IPFS CID is accessible
curl https://ipfs.io/ipfs/YOUR_METADATA_CID

# Check metadata format (must be valid JSON)
cat codex/treasury/enft_metadata.json | jq .

# Refresh OpenSea metadata
# https://opensea.io/assets/ethereum/CONTRACT/TOKEN_ID?force_update=true
```

### Gas Estimation Failed

**Problem:** Transaction reverts during gas estimation

**Solution:**
```bash
# Check:
# 1. Sufficient ETH balance for gas
# 2. Contract is not paused
# 3. You have required permissions/roles
# 4. Input parameters are valid

# Debug with Hardhat
npx hardhat run scripts/debug_transaction.ts --network mainnet
```

---

## Support

- **GitHub Issues:** https://github.com/4way4eva/3V30OStudios/issues
- **Documentation:** See CODEX_TREASURY_CHARTER.md
- **API Reference:** See paystring_resolver_openapi.yaml

---

**◈ DEPLOYMENT GUIDE COMPLETE ◈**

*Updated: 2025-11-19T17:57:01Z*
