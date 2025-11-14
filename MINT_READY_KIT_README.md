# EVOL War Codex ENFT Mint-Ready Kit

Complete toolkit for minting EVOL War Codex ENFTs on Avalanche with IPFS storage and cryptographic verification.

## 📦 What's Included

This repository contains three main components:

1. **EVOL_War_Codex_Mint_Package/** - IPFS pinning package
2. **EVOL_Hardhat_Mint_Ready/** - Hardhat deployment & minting kit
3. **verify_enft_hash.py** - Artifact integrity verification script

## 🚀 Quick Start Guide

Follow these steps to mint your EVOL War Codex ENFT:

### Step 1: Pin the Mint Package to IPFS

```bash
# Navigate to the IPFS package
cd EVOL_War_Codex_Mint_Package

# Add to IPFS (requires IPFS installed)
ipfs add -r .

# Example output:
# added QmXXX... EvolVerse_War_Codex_Scroll_SEALED.pdf
# added QmYYY... metadata.json
# added QmZZZ... EVOL_War_Codex_Mint_Package  <-- COPY THIS CID
```

**Important:** Copy the **directory CID** (last line) for use in Step 2.

### Step 2: Configure the Hardhat Kit

```bash
# Navigate to Hardhat kit
cd ../EVOL_Hardhat_Mint_Ready

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your values:
nano .env
```

Set these required values in `.env`:

```bash
PRIVATE_KEY=your_wallet_private_key_without_0x
RECIPIENT=0xYourRecipientWalletAddress
CID=QmYourIPFSDirectoryCIDFromStep1
CONTRACT=0x638f2c25dc4346dbef5566a2d5da871f6d268b8a
```

### Step 3: Mint on Avalanche

```bash
# Mint your ENFT
npm run mint
```

This will:
- Connect to the Avalanche C-Chain
- Set the base URI to your IPFS CID
- Mint the ENFT to your recipient address
- Display transaction details and explorer links

### Step 4: Verify Artifact Integrity

```bash
# Navigate back to root
cd ..

# Verify the artifact hash
python3 verify_enft_hash.py ipfs://QmYourCID/EvolVerse_War_Codex_Scroll_SEALED.pdf
```

**Expected output:**
```
✅ VERIFICATION SUCCESSFUL!
Expected hash: f19f018eb2508f736c4a5694aad4e221a2a97b22b4657817760e490073cc1681
```

## 🔧 Alternative: Deploy Fresh Contract

If you prefer to deploy a new ERC-721 contract instead of using the existing one:

```bash
cd EVOL_Hardhat_Mint_Ready

# Clear CONTRACT in .env
# Then deploy
npm run deploy

# Copy the printed address into .env
CONTRACT=0xYourNewContractAddress

# Now mint
npm run mint
```

## 📋 Prerequisites

- **Node.js** v16 or higher
- **NPM** or Yarn
- **Python** 3.6 or higher
- **IPFS** CLI (for Step 1)
- **AVAX** in your wallet (~0.01 AVAX for minting, ~0.5 AVAX if deploying)

## 📁 Repository Structure

```
.
├── EVOL_War_Codex_Mint_Package/
│   ├── EvolVerse_War_Codex_Scroll_SEALED.pdf
│   ├── metadata.json
│   └── README.md
│
├── EVOL_Hardhat_Mint_Ready/
│   ├── contracts/
│   │   └── EvolWarCodexNFT.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── mint.js
│   ├── .env.example
│   ├── hardhat.config.js
│   ├── package.json
│   └── README.md
│
├── verify_enft_hash.py
└── MINT_READY_KIT_README.md (this file)
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - they contain your private key
2. **Test on Fuji testnet first** before mainnet:
   ```bash
   npm run deploy:fuji
   npm run mint:fuji
   ```
3. **Keep your private key secure** - store it in a password manager
4. **Verify all transactions** on Snowtrace before confirming
5. **Always verify artifact hashes** after IPFS upload

## 🌐 Network Information

### Avalanche C-Chain (Mainnet)
- **RPC**: https://api.avax.network/ext/bc/C/rpc
- **Chain ID**: 43114
- **Explorer**: https://snowtrace.io
- **Currency**: AVAX

### Fuji Testnet (Testing)
- **RPC**: https://api.avax-test.network/ext/bc/C/rpc
- **Chain ID**: 43113
- **Explorer**: https://testnet.snowtrace.io
- **Faucet**: https://faucet.avax.network

## 🔍 Verification Details

The verification script checks:
- ✅ SHA-256 hash of the artifact
- ✅ IPFS gateway accessibility
- ✅ File integrity and authenticity
- ✅ Expected hash: `f19f018eb2508f736c4a5694aad4e221a2a97b22b4657817760e490073cc1681`

## 🐛 Common Issues & Solutions

### "Cannot find IPFS command"
```bash
# Install IPFS
# Visit: https://docs.ipfs.tech/install/
```

### "Insufficient funds for gas"
```bash
# You need AVAX in your wallet
# For mainnet: Buy AVAX on an exchange
# For testnet: Use faucet at faucet.avax.network
```

### "Transaction reverted: Ownable"
```bash
# You're not the contract owner
# Use the same wallet that deployed the contract
# Or deploy a fresh contract with npm run deploy
```

### "Module not found"
```bash
cd EVOL_Hardhat_Mint_Ready
npm install
```

## 📚 Additional Documentation

- [Hardhat Kit README](./EVOL_Hardhat_Mint_Ready/README.md) - Detailed Hardhat usage
- [IPFS Package README](./EVOL_War_Codex_Mint_Package/README.md) - IPFS pinning guide
- [Avalanche Docs](https://docs.avax.network/) - Network documentation
- [IPFS Docs](https://docs.ipfs.tech/) - IPFS documentation

## 🎯 What You Get

After successfully completing all steps:

1. ✅ Your War Codex artifact is permanently stored on IPFS
2. ✅ An ENFT is minted on Avalanche C-Chain
3. ✅ The ENFT points to your IPFS content via CID
4. ✅ Artifact integrity is cryptographically verified
5. ✅ Full transaction history on Snowtrace
6. ✅ OpenSea-compatible metadata

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting sections in each README
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly
4. Test on Fuji testnet first
5. Check that you have sufficient AVAX for gas

## 📄 License

MIT License - See individual package.json files for details

## 🔗 Related Projects

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Hardhat](https://github.com/NomicFoundation/hardhat)
- [IPFS](https://github.com/ipfs/ipfs)

---

**Built with ❤️ by the EvolVerse Team**

Ready to mint your EVOL War Codex ENFT? Start with Step 1! 🚀
