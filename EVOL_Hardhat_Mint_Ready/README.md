# EVOL Hardhat Mint Ready Kit

Complete toolkit for deploying and minting EVOL War Codex ENFTs on Avalanche C-Chain.

## 📋 Prerequisites

- Node.js v16 or higher
- NPM or Yarn
- AVAX in your wallet for gas fees
- Private key from your wallet
- IPFS CID from `EVOL_War_Codex_Mint_Package` upload

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
# Your wallet's private key (without 0x prefix)
PRIVATE_KEY=abc123...

# Recipient address (from PayString or your wallet)
RECIPIENT=0x1234...

# IPFS directory CID (from War Codex package upload)
CID=QmABC123...

# Optional: Use existing contract or leave empty to deploy new
CONTRACT=0x638f2c25dc4346dbef5566a2d5da871f6d268b8a
```

### 3. Deploy Contract (Optional)

If you want to deploy a fresh ERC-721 contract instead of using the existing one:

```bash
# Clear the CONTRACT variable in .env first
CONTRACT=

# Then deploy
npm run deploy
```

Copy the printed contract address into your `.env` file:

```bash
CONTRACT=0xYourNewContractAddress
```

### 4. Mint Your ENFT

```bash
npm run mint
```

This will:
- Set the base URI to your IPFS CID
- Mint an ENFT to the recipient address
- Display the transaction hash and explorer links

## 📦 What's Included

```
EVOL_Hardhat_Mint_Ready/
├── contracts/
│   └── EvolWarCodexNFT.sol      # Simple ERC-721 with safeMint
├── scripts/
│   ├── deploy.js                 # Deploy new contract
│   └── mint.js                   # Mint ENFT to recipient
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── hardhat.config.js             # Hardhat configuration
├── package.json                  # NPM dependencies
└── README.md                     # This file
```

## 🔧 Available Scripts

### Deploy Scripts

```bash
npm run deploy          # Deploy to Avalanche mainnet
npm run deploy:fuji     # Deploy to Fuji testnet (for testing)
```

### Mint Scripts

```bash
npm run mint           # Mint on Avalanche mainnet
npm run mint:fuji      # Mint on Fuji testnet (for testing)
```

### Utility Scripts

```bash
npm run compile        # Compile contracts
npm run test          # Run tests (if any)
```

## 🌐 Network Configuration

### Avalanche C-Chain (Mainnet)
- **RPC**: https://api.avax.network/ext/bc/C/rpc
- **Chain ID**: 43114
- **Currency**: AVAX
- **Explorer**: https://snowtrace.io

### Fuji Testnet
- **RPC**: https://api.avax-test.network/ext/bc/C/rpc
- **Chain ID**: 43113
- **Currency**: AVAX (testnet)
- **Explorer**: https://testnet.snowtrace.io
- **Faucet**: https://faucet.avax.network

## 🔐 Security Notes

- **Never commit your `.env` file** - it contains your private key
- Keep your private key secure
- Test on Fuji testnet before mainnet deployment
- Verify contract on Snowtrace after deployment

## 📝 Contract Details

### EvolWarCodexNFT.sol

Simple ERC-721 implementation with:
- `safeMint(address to)` - Mint ENFT to address
- `setBaseURI(string memory baseURI)` - Set IPFS base URI
- `getCurrentTokenId()` - Get current token counter
- Owner-only minting and URI setting
- OpenZeppelin security standards

### Features
- ✅ Owner-only minting
- ✅ Safe transfer checks
- ✅ Base URI configuration
- ✅ Event logging
- ✅ Token counter tracking

## 🐛 Troubleshooting

### "Insufficient funds for gas"
- Ensure you have AVAX in your wallet
- Check balance: ~0.5 AVAX recommended for deployment, 0.01 for minting

### "Transaction reverted: Ownable"
- You're not the contract owner
- Make sure you're using the same wallet that deployed the contract

### "CID not set"
- Run: `ipfs add -r EVOL_War_Codex_Mint_Package`
- Copy the directory CID to your `.env` file

### "Cannot find module '@openzeppelin/contracts'"
- Run: `npm install`

## 📖 Full Workflow Example

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your values

# 3a. Option A: Use existing contract
# Set CONTRACT=0x638f2c25dc4346dbef5566a2d5da871f6d268b8a in .env

# 3b. Option B: Deploy new contract
npm run deploy
# Copy printed address to CONTRACT in .env

# 4. Mint!
npm run mint

# 5. Verify on explorer
# Visit the printed Snowtrace URL
```

## 🔗 Related Files

- **IPFS Package**: `../EVOL_War_Codex_Mint_Package/`
- **Verification Script**: `../verify_enft_hash.py`

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Avalanche Documentation](https://docs.avax.network/)
- [IPFS Documentation](https://docs.ipfs.tech/)

## 📄 License

MIT License - See package.json for details

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure you have sufficient AVAX for gas
4. Test on Fuji testnet first

---

**Built with ❤️ by the EvolVerse Team**
