# Bleu Multi-chain Deploy & Mint

This repo adds a simple ERC-1155 ENFT contract, Hardhat deployment and batch-minting scripts, IPFS pin helper, and a GitHub Actions workflow to run deploys/mints once you add secrets.

Required GitHub Secrets (recommended names):
- DEPLOY_PRIVATE_KEY — private key for the deployer (0x... format)
- SEPOLIA_RPC_URL
- MUMBAI_RPC_URL
- FUJI_RPC_URL
- BSC_RPC_URL
- CRONOS_RPC_URL
- BASE_URI — base metadata URI (e.g. ipfs://.../{id}.json)
- PINATA_API_KEY / PINATA_API_SECRET (optional, for pinning)

Quick start (locally):
1. npm ci
2. npx hardhat compile
3. export DEPLOY_PRIVATE_KEY=0x...
   export MUMBAI_RPC_URL=https://...
   export BASE_URI=ipfs://Qm.../{id}.json
4. npx hardhat run --network mumbai scripts/deploy.js
5. create recipients.json with addresses and run:
   node scripts/mint_all.js

Security note: Never commit private keys. Use GitHub Secrets or run scripts locally with env vars.