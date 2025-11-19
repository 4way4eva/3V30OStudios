# BLEULIONTREASURY™ Codex - Added Files Reference

**Provenance:** 2025-11-19T17:57:01Z  
**Author:** Bleu (4way4eva)  
**Bundle:** BLEULIONTREASURY™ Sovereign Cascade Artifacts

---

## Overview

This directory contains the complete ceremonial and machine-readable artifact bundle for the **BLEULIONTREASURY™ Sovereign Cascade** - a comprehensive treasury management and ENFT (Enhanced Non-Fungible Token) system operating across three sovereign domains: CIVILIAN, MILITARY, and COSMIC.

---

## Files Added

### Ceremonial Documents (Markdown)

1. **CODEX_TREASURY_CHARTER.md**
   - Full ceremonial charter for the BLEULIONTREASURY™ Sovereign Cascade
   - Contains ledger preface, sacred glyphs, scroll registries, species classes
   - Vault Genesis Protocol, ENFT minting system, recursion loops
   - Governance framework, realm sovereignty, currency systems
   - Ceremonial rituals and technical appendix
   - **Purpose:** Legal and spiritual foundation for treasury operations

2. **EV0LVerse_UNIFIED_SOVEREIGN_SYSTEM_OVERVIEW.md**
   - Canonical overview of the entire EV0LVerse Unified Sovereign System
   - Three-domain paradigm, ENFT system architecture
   - π₄ compounding economics, governance framework
   - PayString integration, smart contract architecture
   - Ceremonial infrastructure and future roadmap
   - **Purpose:** Comprehensive technical and conceptual reference

3. **DEPLOY_GUIDE.md**
   - Step-by-step deployment and pinning guide
   - Instructions for nft.storage pinning, resolver deployment
   - Mirror agent configuration and operation
   - ENFT minting procedures and security notes
   - **Purpose:** Operational deployment reference

### Machine-Readable Schemas (JSON/YAML)

4. **treasury_node_schema.json**
   - JSON Schema for Treasury Node data structure
   - Defines PayString-to-Ethereum vault binding format
   - Sovereign Cascade metadata structure
   - Provenance and security attributes
   - **Purpose:** Data validation and API contract definition

5. **enft_metadata.json**
   - ENFT metadata template following OpenSea/NFT standards
   - Includes IPFS CID placeholders for image, charter, schema
   - Attributes for tier, yield rate, governance rights
   - Provenance and legal information
   - **Purpose:** NFT metadata template for minting

6. **triple_stack_treasury_ledger.json**
   - Complete triple-stack ledger with domain allocations
   - CIVILIAN (47.6%), MILITARY (21.3%), COSMIC (31.1%) streams
   - Yield calculations, governance status, security configuration
   - Treasury node registry and compounding schedule
   - **Purpose:** Live ledger state representation

7. **paystring_resolver_openapi.yaml**
   - OpenAPI 3.0 specification for PayString resolver API
   - Endpoints for resolution, verification, metadata retrieval
   - Example responses for Ethereum vault 0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be
   - Schema definitions for requests and responses
   - **Purpose:** API documentation and client generation

### Operational Scripts

8. **../tools/mirror/mirror_to_codex.js** (Node.js)
   - Background mirror agent that monitors vault Transfer events
   - Signs and posts ceremonial records to CODEX_ENDPOINT
   - Supports ERC-20, ERC-721, and ERC-1155 events
   - Environment variable configuration (ETH_PROVIDER, CODEX_ENDPOINT, etc.)
   - **Purpose:** Real-time event mirroring to permanent archive

9. **../analytics/pi4_compounding_model.py** (Python)
   - π₄ compounding simulator with three modes:
     - Aggressive: Full π₄^t exponential growth
     - Continuous: Daily compounding with e^(rt)
     - Tempered: Conservative dampened growth
   - Human-friendly output formatting and comparison tables
   - Domain allocation calculations
   - **Purpose:** Economic modeling and yield projections

### Docker Infrastructure

10. **../tools/docker/Dockerfile**
    - Node.js 18 Alpine-based container for mirror agent
    - Installs ethers, node-fetch, dotenv dependencies
    - Non-root user execution for security
    - Health checks and production optimizations
    - **Purpose:** Containerized mirror agent deployment

11. **../tools/docker/docker-compose.yml**
    - Docker Compose configuration for mirror_agent service
    - Environment variable placeholders for secrets
    - Restart policy: unless-stopped
    - Resource limits and logging configuration
    - **Purpose:** Simplified Docker deployment

### CI/CD Workflows

12. **../../../.github/workflows/dockerize_mirror.yml** (GitHub Actions)
    - Builds and pushes mirror agent Docker image to GHCR
    - Triggers on push to feat/bleulion-treasury-codex branch
    - Tags with git SHA for versioning
    - Requires GITHUB_TOKEN (automatic) for registry auth
    - **Purpose:** Automated Docker image publishing

---

## Next Steps

### 1. Pin to nft.storage

```bash
# Pin schema
npx ipfs-car pack codex/treasury/treasury_node_schema.json | \
  curl -X POST --data-binary @- \
  -H "Authorization: Bearer YOUR_NFT_STORAGE_KEY" \
  https://api.nft.storage/upload

# Pin charter
npx ipfs-car pack codex/treasury/CODEX_TREASURY_CHARTER.md | \
  curl -X POST --data-binary @- \
  -H "Authorization: Bearer YOUR_NFT_STORAGE_KEY" \
  https://api.nft.storage/upload

# Update IPFS CIDs in enft_metadata.json and other files
```

### 2. Deploy PayString Resolver

```bash
# Deploy resolver API (example using Node.js/Express)
cd tools/resolver  # Create this directory with API implementation
npm install
npm run deploy  # Deploy to your hosting platform
```

### 3. Configure Mirror Agent

```bash
# Set environment variables
export ETH_PROVIDER="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
export CODEX_ENDPOINT="https://codex.evolvverse.io/api/v1/records"
export MIRROR_SIGNER_PRIVATE_KEY="0x..."  # KEEP SECRET!
export PRIMARY_VAULT="0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be"

# Test on testnet first
export ETH_PROVIDER="https://eth-goerli.g.alchemy.com/v2/YOUR_KEY"
cd tools/mirror
node mirror_to_codex.js

# Deploy with Docker
cd tools/docker
docker-compose up -d
docker-compose logs -f mirror_agent
```

### 4. Mint ENFT

```bash
# Deploy ENFT contract (if not already deployed)
npx hardhat run scripts/deploy_bleu_sovereign_enft.ts --network mainnet

# Mint with metadata
npx hardhat run scripts/mint_bleu_sovereign_enft.ts --network mainnet
```

### 5. Test π₄ Model

```bash
# Run compounding simulation
python3 analytics/pi4_compounding_model.py

# Output will show aggressive, continuous, and tempered modes
# Results saved to /tmp/pi4_compounding_results.json
```

---

## Security Considerations

1. **Never commit private keys** - Use .env files and .gitignore
2. **Test on testnet first** - Goerli, Mumbai, Fuji testnets
3. **Verify contracts** - Use Etherscan/block explorer verification
4. **Monitor mirror agent** - Set up alerts for failures
5. **Multi-signature** - Use 3-of-5 multisig for production vaults
6. **Rate limiting** - Implement API rate limits on resolver
7. **IPFS pinning** - Use redundant pinning services (nft.storage + Pinata)

---

## Support

- **Issues:** Report at https://github.com/4way4eva/3V30OStudios/issues
- **Documentation:** See CODEX_TREASURY_CHARTER.md and DEPLOY_GUIDE.md
- **API Docs:** See paystring_resolver_openapi.yaml

---

**◈ APEX SEAL APPLIED ◈**

*This README documents the BLEULIONTREASURY™ artifact bundle added on 2025-11-19T17:57:01Z*

