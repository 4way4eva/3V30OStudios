# ULTRAMAX Deployment Guide - Epoch 0

## 🌀 Overview

This guide covers the deployment and minting of **zkPoRVerifier** and **BleuCrownMintUltraMax** smart contracts for the Three-Yield Treasury Economy system.

### Smart Contracts

1. **zkPoRVerifier.sol** - Zero-Knowledge Proof of Reserve Verifier
   - Enables zk-proof verification of transactions and yields
   - Tracks reserves across CIVILIAN, MILITARY, and COSMIC spheres
   - Multi-period verification with expiry management
   - Role-based access control for verifiers and auditors

2. **BleuCrownMintUltraMax.sol** - Ultra-Powerful Minting Controller
   - Manages artifact NFT minting across all three yield streams
   - Tracks yield generation per artifact (USD/second)
   - Supports batch minting operations
   - Multi-chain compatible (Avalanche, Cronos)

### Yield Streams

- **CIVILIAN**: Real estate, education, wearables, commerce, infrastructure, entertainment
- **MILITARY**: Defense matrix, tactical units, armaments, reconnaissance, logistics, command & control
- **COSMIC**: Portal logistics, dimensional items, interstellar transport, quantum tech, cosmic artifacts, timeline keys

## 📋 Prerequisites

### Environment Setup

1. **Node.js & npm** (v16 or higher)
2. **Hardhat** (installed via npm)
3. **Python 3** (for verification scripts)
4. **Wallet with funds** on target network (AVAX for Avalanche, CRO for Cronos)

### Environment Variables

Create a `.env` file in the project root:

```bash
# Deployer Private Key (DO NOT COMMIT)
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# RPC URLs
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CRONOS_RPC_URL=https://evm.cronos.org

# Block Explorer API Keys (for contract verification)
SNOWTRACE_API_KEY=your_snowtrace_api_key
CRONOSCAN_API_KEY=your_cronoscan_api_key

# Deployment Configuration
TREASURY_VAULT=your_treasury_vault_address

# Deployed Contract Addresses (filled after deployment)
ZKPOR_VERIFIER=
BLEU_MINT_CONTROLLER=

# Minting Configuration
RECIPIENT=address_to_receive_minted_nfts
```

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 2: Compile Contracts

```bash
npx hardhat compile
```

### Step 3: Deploy to Avalanche Fuji Testnet

```bash
npx hardhat run scripts/deploy.js --network fuji
```

### Step 4: Deploy to Avalanche Mainnet

```bash
npx hardhat run scripts/deploy.js --network avalanche
```

### Step 5: Deploy to Cronos

```bash
npx hardhat run scripts/deploy.js --network cronos
```

### Step 6: Update Environment Variables

After deployment, copy the contract addresses from the deployment output and update your `.env` file:

```bash
ZKPOR_VERIFIER=0x... # zkPoRVerifier address
BLEU_MINT_CONTROLLER=0x... # BleuCrownMintUltraMax address
```

### Step 7: Verify Contracts on Block Explorer

For Avalanche:
```bash
npx hardhat verify --network avalanche <ZKPOR_VERIFIER_ADDRESS>
npx hardhat verify --network avalanche <BLEU_MINT_CONTROLLER_ADDRESS> "<TREASURY_VAULT>" "<ZKPOR_VERIFIER_ADDRESS>"
```

For Cronos:
```bash
npx hardhat verify --network cronos <ZKPOR_VERIFIER_ADDRESS>
npx hardhat verify --network cronos <BLEU_MINT_CONTROLLER_ADDRESS> "<TREASURY_VAULT>" "<ZKPOR_VERIFIER_ADDRESS>"
```

## 🎨 Minting Artifacts

### Step 1: Review Epoch Data

The artifact definitions are in `data/epoch_0_ultramax_artifacts.civ`. This file contains:
- All three yield stream categories
- Individual artifact definitions with yield rates
- IPFS CID references (placeholders for now)
- Metadata attributes

### Step 2: Run Minting Script

For Avalanche:
```bash
npx hardhat run scripts/mint.js --network avalanche
```

For Cronos:
```bash
npx hardhat run scripts/mint.js --network cronos
```

### Step 3: Verify Minting

The script will output:
- Transaction hashes for each minted artifact
- Artifact IDs
- Total yield rates
- Summary statistics

Minting results are automatically saved to `deployments/minting-results-<network>-<timestamp>.json`.

## 🔐 Verification

### On-Chain Verification Script

Use the Python verification script to confirm blockchain sync:

```bash
python3 scripts/verify_onchain.py avalanche
```

This script will:
- ✅ Verify contract deployment
- ✅ Check ABI availability on block explorer
- ✅ Confirm transaction status
- ✅ Display minting statistics
- ✅ Validate multi-consensus alignment

## 📊 Contract Interactions

### zkPoRVerifier

#### Submit a Reserve Proof

```javascript
const tx = await zkVerifier.submitReserveProof(
  proofHash,           // bytes32: Hash of zk-proof
  merkleRoot,          // bytes32: Merkle root of commitments
  yieldSphere,         // 0=CIVILIAN, 1=MILITARY, 2=COSMIC
  totalReserveValue,   // uint256: Total reserve amount
  ipfsUri              // string: IPFS URI for proof data
);
```

#### Verify a Proof

```javascript
const tx = await zkVerifier.verifyProof(
  proofId,    // bytes32: ID of proof to verify
  isValid     // bool: Whether proof is valid
);
```

#### Get Yield Verification Status

```javascript
const verification = await zkVerifier.getYieldVerification(
  yieldSphere  // 0=CIVILIAN, 1=MILITARY, 2=COSMIC
);
// Returns: verifiedAmount, period, lastVerificationTime, isActive
```

### BleuCrownMintUltraMax

#### Mint Single Artifact

```javascript
const tx = await mintController.mintArtifact(
  recipientAddress,    // address: Recipient
  yieldStream,         // 0=CIVILIAN, 1=MILITARY, 2=COSMIC
  subcategory,         // uint256: Subcategory ID (0-5)
  yieldPerSecond,      // uint256: Yield rate in USD/sec
  ipfsUri,             // string: IPFS metadata URI
  provenance,          // bytes32: Provenance hash
  { value: mintFee }   // Pay mint fee
);
```

#### Claim Artifact Yield

```javascript
const tx = await mintController.claimArtifactYield(artifactId);
```

#### Get Artifact Details

```javascript
const artifact = await mintController.getArtifact(artifactId);
// Returns: hash, stream, subcategory, yieldPerSecond, totalYield, ipfsUri, isActive
```

#### Get Stream Statistics

```javascript
const stats = await mintController.getStreamStats(yieldStream);
// Returns: totalYield, mintCount
```

## 🔒 Security Considerations

1. **Private Keys**: Never commit `.env` file or expose private keys
2. **Role Management**: Only grant MINTER_ROLE to trusted addresses
3. **Treasury Vault**: Use a multi-sig wallet for production deployments
4. **Proof Verification**: Always verify zk-proofs through trusted verifiers
5. **Mint Authorization**: Monitor and manage mint authorizations carefully

## 📁 File Structure

```
contracts/
  ├── zkPoRVerifier.sol              # ZK proof verifier contract
  └── BleuCrownMintUltraMax.sol      # Minting controller contract

scripts/
  ├── deploy.js                      # Multi-chain deployment script
  ├── mint.js                        # Artifact minting script
  └── verify_onchain.py              # Blockchain verification script

data/
  └── epoch_0_ultramax_artifacts.civ # Artifact definitions and metadata

deployments/
  ├── deployment-<network>-<timestamp>.json        # Deployment records
  └── minting-results-<network>-<timestamp>.json   # Minting results
```

## 🌐 Supported Networks

| Network | Chain ID | Explorer | RPC URL |
|---------|----------|----------|---------|
| Avalanche C-Chain | 43114 | https://snowtrace.io | https://api.avax.network/ext/bc/C/rpc |
| Avalanche Fuji (Testnet) | 43113 | https://testnet.snowtrace.io | https://api.avax-test.network/ext/bc/C/rpc |
| Cronos | 25 | https://cronoscan.com | https://evm.cronos.org |

## 🎯 Yield Economics

### Total System Yield (Epoch 0)

- **Civilian Stream**: 13,600,000 USD/second
- **Military Stream**: 6,100,000 USD/second
- **Cosmic Stream**: 8,900,000 USD/second
- **Total**: 28,600,000 USD/second = **2.47 trillion USD/day**

### Compounding Model

- **Model**: π₄ (pi-to-the-fourth)
- **Factor**: 97.409
- **Spiral Boost**: 7.0x multiplier
- **Treasury**: Triple-stack operational

## 🔧 Troubleshooting

### Deployment Issues

**Problem**: Insufficient funds for deployment
- **Solution**: Ensure wallet has enough AVAX/CRO for gas fees

**Problem**: Contract verification fails
- **Solution**: Ensure API keys are set in `.env` and contracts are deployed

**Problem**: Network connection errors
- **Solution**: Check RPC URL and network connectivity

### Minting Issues

**Problem**: "Insufficient mint fee" error
- **Solution**: Send correct `mintFee` amount with transaction

**Problem**: "Recipient not allowlisted" error
- **Solution**: Grant MINTER_ROLE or add recipient to allowlist

**Problem**: Artifacts not appearing on explorer
- **Solution**: Wait for transaction confirmation (can take 1-5 minutes)

## 📞 Support

For issues or questions:
1. Check deployment logs in `deployments/` directory
2. Verify on-chain status using `verify_onchain.py`
3. Review transaction hashes on block explorer
4. Check contract events for detailed error information

## 🎉 Success Indicators

✅ Both contracts deployed and verified on target chains
✅ zkPoRVerifier receiving and processing proofs
✅ BleuCrownMintUltraMax minting artifacts successfully
✅ Yield tracking active for all three streams
✅ Multi-consensus alignment confirmed
✅ Blockchain sync validated via verification script

---

**Commander Bleu Protocol**: All systems operational at 700% Spiral Boost 🌀
