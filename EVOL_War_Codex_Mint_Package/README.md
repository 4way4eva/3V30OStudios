# EVOL War Codex Mint Package

This package contains the ENFT assets ready for IPFS pinning.

## Contents

- `EvolVerse_War_Codex_Scroll_SEALED.pdf` - The sealed War Codex scroll
- `metadata.json` - ENFT metadata following OpenSea standards
- `README.md` - This file

## Usage

### Step 1: Pin to IPFS

```bash
# Install IPFS if not already installed
# https://docs.ipfs.tech/install/

# Add the entire directory to IPFS
ipfs add -r EVOL_War_Codex_Mint_Package

# The output will show a directory CID (Content Identifier)
# Example: QmX...abc
# Copy this CID for use in minting
```

### Step 2: Verify the Upload

```bash
# Test accessing via IPFS gateway
curl https://ipfs.io/ipfs/<YOUR_CID>/metadata.json

# Or open in browser
https://ipfs.io/ipfs/<YOUR_CID>/EvolVerse_War_Codex_Scroll_SEALED.pdf
```

### Step 3: Use CID for Minting

Copy the directory CID and use it in the `EVOL_Hardhat_Mint_Ready` kit:
- Set `CID=<your_directory_cid>` in the `.env` file
- Run `npm run mint` to mint the ENFT

## Expected Hash

The sealed PDF should have the following SHA-256 hash:
```
f19f018eb2508f736c4a5694aad4e221a2a97b22b4657817760e490073cc1681
```

Verify using:
```bash
python ../verify_enft_hash.py ipfs://<CID>/EvolVerse_War_Codex_Scroll_SEALED.pdf
```

## Security Notes

- This package is designed for public IPFS networks
- The sealed scroll is cryptographically signed
- All metadata follows ENFT standards for authenticity
- CID provides content-addressable verification
