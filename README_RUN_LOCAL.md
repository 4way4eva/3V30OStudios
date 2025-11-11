# Run Local Development Environment

**Complete guide for running MEGAZION 48-Fold Codex locally**

## Prerequisites

### Required Software

```bash
# Node.js 16+ and npm
node --version  # v16.0.0 or higher
npm --version   # 8.0.0 or higher

# Python 3.8+
python3 --version  # 3.8.0 or higher
pip3 --version

# Git
git --version
```

### Optional (Recommended)

```bash
# Hardhat (global install)
npm install -g hardhat

# IPFS Desktop (for local IPFS node)
# Download from: https://docs.ipfs.io/install/ipfs-desktop/

# Ganache (alternative to Hardhat node)
npm install -g ganache
```

## Setup Instructions

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/4way4eva/3V30OStudios.git
cd 3V30OStudios

# Checkout feature branch
git checkout feature/48-fold-codex

# Install Node.js dependencies
npm install --legacy-peer-deps

# Install Python dependencies
pip3 install matplotlib  # For plotting scripts
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env for local development
vi .env
```

**Local `.env` configuration:**
```bash
# Local development - no real keys needed
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Local Hardhat node
ETHEREUM_RPC_URL=http://127.0.0.1:8545

# Not needed for local
# NFT_STORAGE_KEY=
# ETHERSCAN_API_KEY=
```

> **Note**: The private key above is Hardhat's default test account #0. Safe for local development only.

### 3. Start Local Blockchain

#### Option A: Hardhat Node (Recommended)

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# You should see:
# Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
# 
# Accounts:
# Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
# Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# ...
```

#### Option B: Ganache

```bash
# Start Ganache
ganache --port 8545 --accounts 10 --defaultBalanceEther 10000

# Or use Ganache UI
```

### 4. Deploy Contracts Locally

```bash
# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network localhost

# Save the deployed address
# EVOLVERSE_BLEU_SOSA_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Add to .env
echo "EVOLVERSE_BLEU_SOSA_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" >> .env
```

### 5. Generate Test Data

```bash
# Generate MetaVault ledgers
python scripts/metavault_batch_mint.py --epochs 5

# Output files:
# - MetaVault_Ledger.json
# - MetaVault_Yield_Ledger.csv
# - enft_ledger_epoch1.json

# Generate visualization
python scripts/plot_compounding.py
# Output: compounding_chart.png
```

### 6. Mint Test ENFTs

```bash
# Update mint script with local address
vi scripts/mint_evolverse_bleu_sosa.ts

# Change recipient to Hardhat test account
# recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Mint tokens
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network localhost

# Mint 10 tokens in batch
# count: 10, useBatchMint: true
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network localhost
```

### 7. Export and Verify

```bash
# Export on-chain ledger
npx hardhat run scripts/export_enft_ledger.ts --network localhost

# Check outputs
cat enft_ledger_epoch1.json
cat ENFT_Ledger.csv
```

## Running UI Components

### Hashmark Generator

```bash
# Option 1: Direct file open
open ui/hashmark_ui.html

# Option 2: Simple HTTP server
cd ui
python3 -m http.server 8000
# Visit: http://localhost:8000/hashmark_ui.html
```

### Arena Mock

```bash
# Option 1: Direct file open
open arena/royal_rumble_mock.html

# Option 2: HTTP server
cd arena
python3 -m http.server 8001
# Visit: http://localhost:8001/royal_rumble_mock.html
```

### Full Development Server

For a complete development setup with hot reload:

```bash
# Install http-server
npm install -g http-server

# Serve entire project
http-server . -p 8080

# Access:
# - Arena: http://localhost:8080/arena/royal_rumble_mock.html
# - Hashmark: http://localhost:8080/ui/hashmark_ui.html
# - Visuals: http://localhost:8080/visual/
```

## Local IPFS Setup

### Install IPFS Desktop

1. Download from [ipfs.io](https://docs.ipfs.io/install/ipfs-desktop/)
2. Install and start
3. IPFS daemon runs at `http://127.0.0.1:5001`

### Add Files to Local IPFS

```bash
# Add visual assets
ipfs add visual/bleubill_front.svg
# Returns: added QmXXXXX... bleubill_front.svg

# Add metadata
ipfs add metadata/bleubill_v1.json
# Returns: added QmYYYYY... bleubill_v1.json

# Add directory
ipfs add -r metadata/
# Returns directory CID

# View on local gateway
open http://127.0.0.1:8080/ipfs/QmXXXXX...
```

### Test IPFS in Contracts

```javascript
// Use local gateway for testing
const baseURI = "http://127.0.0.1:8080/ipfs/QmXXXXX/";

// Update contract
await contract.setBaseURI(baseURI);

// Test token URI
const uri = await contract.tokenURI(1);
console.log(uri);
// http://127.0.0.1:8080/ipfs/QmXXXXX/1.json
```

## Testing Workflows

### Full Integration Test

Create `test/integration.test.js`:

```javascript
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("48-Fold Codex Integration", function() {
  let contract;
  let owner;
  
  before(async function() {
    [owner] = await ethers.getSigners();
    
    // Deploy
    const EvolverseBleuSosa = await ethers.getContractFactory("EvolverseBleuSosa");
    contract = await EvolverseBleuSosa.deploy(
      "EvolverseBleuSosa",
      "EVBS",
      "http://localhost:8080/ipfs/QmTest/",
      10000
    );
    await contract.waitForDeployment();
  });
  
  it("Should mint tokens", async function() {
    await contract.mint(owner.address);
    expect(await contract.totalSupply()).to.equal(1);
  });
  
  it("Should batch mint", async function() {
    await contract.mintBatch(owner.address, 5);
    expect(await contract.totalSupply()).to.equal(6);
  });
  
  it("Should update base URI", async function() {
    await contract.setBaseURI("ipfs://QmNewCID/");
    const uri = await contract.tokenURI(1);
    expect(uri).to.include("ipfs://QmNewCID/");
  });
});
```

Run tests:
```bash
npx hardhat test test/integration.test.js
```

### Contract Verification

```bash
# Check contract state
npx hardhat console --network localhost

# In console:
const contract = await ethers.getContractAt(
  "EvolverseBleuSosa",
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"
);

await contract.totalSupply();
// Returns: BigNumber { value: "6" }

await contract.ownerOf(1);
// Returns: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

await contract.tokenURI(1);
// Returns: "ipfs://QmNewCID/1.json"
```

## Debugging

### Enable Verbose Logging

```bash
# Hardhat verbose
DEBUG=hardhat:* npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network localhost

# Hardhat trace
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network localhost --trace
```

### Common Issues

#### Issue: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Issue: "network timeout"

```bash
# Restart Hardhat node
# Ctrl+C in Terminal 1
npx hardhat node
```

#### Issue: "nonce too high"

```bash
# Reset Hardhat node
# Ctrl+C and restart
npx hardhat node

# Or reset specific account
npx hardhat reset --network localhost
```

#### Issue: "insufficient funds"

```bash
# Use Hardhat's default funded accounts
# Account #0 has 10,000 ETH by default
```

## Development Workflow

### Typical Development Day

```bash
# 1. Start Hardhat node
npx hardhat node

# 2. Deploy contracts (or use existing)
npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network localhost

# 3. Generate test data
python scripts/metavault_batch_mint.py --epochs 3

# 4. Mint test tokens
npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network localhost

# 5. Start UI server
http-server . -p 8080

# 6. Develop and test
# - Make code changes
# - Test in browser/console
# - Repeat
```

### Hot Reload Setup

For automatic recompilation on changes:

```bash
# Terminal 1: Watch for Solidity changes
npx hardhat watch compile

# Terminal 2: Run node
npx hardhat node

# Terminal 3: Development
# Make changes, they auto-compile
```

## Performance Tips

1. **Use Hardhat Cache**: Don't clean unless necessary
2. **Batch Operations**: Mint multiple tokens at once
3. **Skip Verification**: No need to verify on localhost
4. **Reuse Deployments**: Keep contracts deployed between sessions
5. **Optimize Gas**: Use `gasPrice: 0` for free transactions locally

## Next Steps

Once comfortable with local development:

1. **Deploy to Testnet**: See [`README_48fold.md`](./README_48fold.md)
2. **Mint Production NFTs**: See [`README_NOTE_PIN_MINT.md`](./README_NOTE_PIN_MINT.md)
3. **Test Arena**: See [`README_ARENA.md`](./README_ARENA.md)

## Support

- **Hardhat Docs**: [hardhat.org/docs](https://hardhat.org/docs)
- **IPFS Docs**: [docs.ipfs.io](https://docs.ipfs.io)
- **Discord**: #dev-support channel
- **GitHub**: [Issues](https://github.com/4way4eva/3V30OStudios/issues)

---

**Status**: Complete Local Development Guide  
**Last Updated**: 2024-11-11  
**Version**: 1.0.0
