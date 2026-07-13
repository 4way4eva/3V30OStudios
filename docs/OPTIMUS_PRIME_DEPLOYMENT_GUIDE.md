# OPTINUS PRIME Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying and operating the OPTINUS PRIME Ceremonial Assembly Scroll infrastructure across all designated domains.

---

## Table of Contents

1. [Smart Contract Deployment](#smart-contract-deployment)
2. [Ceremonial Minting Process](#ceremonial-minting-process)
3. [Domain-Specific Deployment](#domain-specific-deployment)
   - [Academy Curriculum](#academy-curriculum)
   - [Cinematic Media](#cinematic-media)
   - [Tribunal Restitution](#tribunal-restitution)
   - [Military & Security](#military--security)
   - [Agricultural & Economic](#agricultural--economic)
4. [ENFT Metadata Management](#enft-metadata-management)
5. [Governance & Access Control](#governance--access-control)
6. [Restitution Protocols](#restitution-protocols)

---

## Smart Contract Deployment

### Prerequisites

- Node.js v16+ and npm/yarn
- Hardhat development environment
- Funded wallet with ETH/MATIC for gas fees
- IPFS node or Pinata/NFT.Storage account for metadata

### Environment Setup

1. **Clone repository and install dependencies:**
   ```bash
   cd /home/runner/work/3V30OStudios/3V30OStudios
   npm install
   ```

2. **Configure environment variables:**
   Create `.env` file with:
   ```
   PRIVATE_KEY=your_private_key
   TREASURY_VAULT_ADDRESS=0x...
   CODEX_EMISSARY_ADDRESS=0x...
   TRIBUNAL_ADDRESS=0x...
   ETHEREUM_RPC_URL=https://...
   POLYGON_RPC_URL=https://...
   ETHERSCAN_API_KEY=your_api_key
   ```

3. **Compile contracts:**
   ```bash
   npx hardhat compile
   ```

### Deploy OptimusPrimeENFT Contract

1. **Deploy to testnet (Polygon Mumbai):**
   ```bash
   npx hardhat run scripts/deploy_optimus_prime_enft.ts --network mumbai
   ```

2. **Deploy to mainnet (Polygon):**
   ```bash
   npx hardhat run scripts/deploy_optimus_prime_enft.ts --network polygon
   ```

3. **Verify contract on block explorer:**
   ```bash
   npx hardhat verify --network polygon CONTRACT_ADDRESS TREASURY_VAULT_ADDRESS
   ```

### Post-Deployment Configuration

1. **Grant roles to designated addresses:**
   - MINTER_ROLE: Authorized minting addresses
   - CODEX_EMISSARY_ROLE: Assembly protocol managers
   - TRIBUNAL_ROLE: Restitution distribution authorities

2. **Configure allowlist:**
   Add initial addresses to allowlist for minting eligibility

3. **Set royalty percentages:**
   Adjust restitution and community royalty basis points if needed

---

## Ceremonial Minting Process

### Standard Minting Flow

The 9-stage assembly protocol must be followed for each transformer:

1. **Stage 0: Invocation and Blessing**
   - Mint initial ENFT with ancestral hash
   - Record ceremonial invocation on-chain

2. **Stage 1: Core Placement**
   - Install magnetic backbone (scroll axis)
   - Anoint with purified transformer oil (symbolic libation)

3. **Stage 2: Winding the Bands**
   - Attach primary and secondary windings
   - Mint cryptographic keys for heritage transmission

4. **Stage 3: Insulation and Sanctification**
   - Apply spiritual shield layers
   - Recite protection prayers

5. **Stage 4: Cooling Integration**
   - Install oil and radiator systems
   - Register sensor data streams on-chain

6. **Stage 5: Interface Integration**
   - Connect terminals, bushings, breathers
   - Map to wallet/contract addresses

7. **Stage 6: Enclosure and Scroll Embedding**
   - Secure tank and outer shell
   - Embed digital/physical scroll fragments

8. **Stage 7: Calibration and Testing**
   - Validate all systems
   - Conduct communal ceremony (live/virtual)

9. **Stage 8: Final Blessing**
   - Complete lineage activation ritual
   - Unlock heritage functions

### Execute Minting Script

```bash
npx hardhat run scripts/mint_optimus_prime.ts --network polygon
```

### Batch Minting for Academy/Restitution

For mass deployment (e.g., 100+ students or restitution recipients):

```typescript
const recipients = []; // Array of addresses
const ancestralHashes = []; // Array of hashes
const tokenURIs = []; // Array of metadata URIs

await contract.batchMintTransformers(
  recipients,
  ancestralHashes,
  tokenURIs,
  parentTokenId
);
```

---

## Domain-Specific Deployment

### Academy Curriculum

**Objective:** Integrate OPTINUS PRIME framework into STEAM education

**Implementation Steps:**

1. **Create Curriculum Modules:**
   - Build OTU (Optimus Transformer Unit) workshops
   - Map transformer mechanics to Afrocentric cosmology
   - Design digital sovereignty lessons

2. **Issue Education Credits (ENFTs):**
   - Mint badge for each completed module
   - Enable vertical/horizontal credit transfer
   - Record on-chain credentials

3. **Community Archive Access:**
   - Students build personal lineage archives
   - Contribute to community scroll repositories
   - Merge archive science with ritual performance

4. **Deployment Permissions:**
   Set CURRICULUM permission for academy-deployed tokens:
   ```typescript
   await contract.setDeploymentPermission(
     tokenId,
     DeploymentPermission.CURRICULUM,
     true
   );
   ```

### Cinematic Media

**Objective:** Create NFT-driven storytelling and hybrid narrative experiences

**Implementation Steps:**

1. **NFT-Driven Plot Integration:**
   - Design modular story arcs unlocked by ENFT ownership
   - Create alternate scenes accessible to token holders
   - Enable community-driven narrative expansion

2. **Ritualized Premieres:**
   - Trigger on-chain events at screenings
   - Distribute digital relics to attendees
   - Unlock new codex chapters post-premiere

3. **Restitution Flow:**
   - Direct % of proceeds to restitution fund
   - Automate creator guild distributions
   - Track impact on-chain

4. **Deployment Permissions:**
   ```typescript
   await contract.setDeploymentPermission(
     tokenId,
     DeploymentPermission.CINEMATIC,
     true
   );
   ```

### Tribunal Restitution

**Objective:** Automated, transparent dispute resolution and reparations

**Implementation Steps:**

1. **Configure Tribunal Roles:**
   Grant TRIBUNAL_ROLE to authorized adjudicators

2. **Link Justice Tokens to Cases:**
   Each tribunal case gets associated ENFT for tracking

3. **Automated Distribution:**
   ```typescript
   await contract.distributeRestitution(
     tokenId,
     [beneficiary1, beneficiary2, ...],
     [amount1, amount2, ...],
     { value: totalAmount }
   );
   ```

4. **Hybrid Protocol Integration:**
   - Combine on-chain evidence trails
   - Honor off-chain ceremonial testimony
   - Use multi-sig for tribunal decisions

### Military & Security

**Objective:** Supply chain transparency and tokenized resource management

**Implementation Steps:**

1. **Equipment Lifecycle Tracking:**
   - Link ENFTs to physical assets
   - Record maintenance, deployment, decommission
   - Enable predictive analytics

2. **Smart Contract Logistics:**
   - Automate procurement workflows
   - Track resource allocation from source to field
   - Reduce fraud with immutable audit trails

3. **Deployment Permissions:**
   ```typescript
   await contract.setDeploymentPermission(
     tokenId,
     DeploymentPermission.MILITARY,
     true
   );
   ```

### Agricultural & Economic

**Objective:** Crop tokenization and programmable restitution models

**Implementation Steps:**

1. **Crop NFT Minting:**
   - Farmers mint tokens for land/harvests
   - Enable fractional ownership
   - Expand market access

2. **Supply Chain Tracking:**
   - Monitor from seed to sale
   - Verify organic/sustainable practices
   - Automate compliance checking

3. **Restitution Integration:**
   - Program ceremonial redistribution events
   - Link to harvest festivals
   - Track economic equity impact

4. **Deployment Permissions:**
   ```typescript
   await contract.setDeploymentPermission(
     tokenId,
     DeploymentPermission.AGRICULTURAL,
     true
   );
   ```

---

## ENFT Metadata Management

### Metadata Structure

All OPTINUS PRIME ENFTs follow the schema defined in:
`metadata/optimus_prime_metadata_schema.json`

### Creating Metadata

1. **Prepare metadata JSON:**
   - Use schema as template
   - Fill transformer-specific details
   - Include all assembly protocol records

2. **Upload to IPFS:**
   ```bash
   # Using IPFS CLI
   ipfs add metadata/optimus_prime_genesis_alpha.json
   
   # Or use Pinata/NFT.Storage
   node scripts/ipfs_upload.js metadata/optimus_prime_genesis_alpha.json
   ```

3. **Set token URI:**
   Include IPFS hash in minting call:
   ```typescript
   const tokenURI = "ipfs://QmHash.../metadata.json";
   ```

### Updating Metadata

For dynamic attributes (e.g., restitution totals, lineage additions):

1. Update JSON file
2. Re-upload to IPFS (new hash)
3. Update token URI (if contract supports)
4. Emit event for indexers to refresh

---

## Governance & Access Control

### Role Management

**DEFAULT_ADMIN_ROLE:**
- Can grant/revoke all other roles
- Manage allowlist
- Update treasury settings

**MINTER_ROLE:**
- Authorized to mint new transformers
- Can execute batch mints

**CODEX_EMISSARY_ROLE:**
- Complete assembly stages
- Activate lineages
- Set deployment permissions
- Execute heritage transfers

**TRIBUNAL_ROLE:**
- Distribute restitution funds
- Execute justice token transfers

### Granting Roles

```typescript
const CODEX_EMISSARY_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("CODEX_EMISSARY_ROLE")
);

await contract.grantRole(CODEX_EMISSARY_ROLE, newEmissaryAddress);
```

### Revoking Roles

```typescript
await contract.revokeRole(CODEX_EMISSARY_ROLE, addressToRevoke);
```

---

## Restitution Protocols

### Configuring Restitution

1. **Set Royalty Percentages:**
   Adjust basis points for restitution and community royalties
   (Default: 5% restitution, 3% community)

2. **Define Beneficiaries:**
   Create beneficiary lists for each restitution case

3. **Calculate Allocations:**
   Determine distribution amounts per beneficiary

### Executing Distribution

```typescript
const tokenId = 1;
const beneficiaries = [
  "0xBeneficiary1...",
  "0xBeneficiary2...",
  "0xBeneficiary3..."
];
const amounts = [
  ethers.utils.parseEther("1.0"),
  ethers.utils.parseEther("0.5"),
  ethers.utils.parseEther("0.25")
];
const totalAmount = ethers.utils.parseEther("1.75");

await contract.distributeRestitution(
  tokenId,
  beneficiaries,
  amounts,
  { value: totalAmount }
);
```

### Tracking Restitution

Query on-chain records:

```typescript
const restitutionData = await contract.getRestitutionRecord(tokenId);
console.log("Total Distributed:", restitutionData.totalDistributed);
console.log("Last Distribution:", restitutionData.lastDistributionTime);
```

---

## Monitoring & Analytics

### On-Chain Queries

**Get Transformer Metadata:**
```typescript
const metadata = await contract.getTransformerMetadata(tokenId);
```

**Check Lineage Tree:**
```typescript
const lineage = await contract.getLineageTree(tokenId);
```

**Verify Permissions:**
```typescript
const hasPermission = await contract.hasDeploymentPermission(
  tokenId,
  DeploymentPermission.CURRICULUM
);
```

**Component Registry:**
```typescript
const components = await contract.getComponentRegistry(tokenId);
```

### Event Monitoring

Listen for key events:

```typescript
contract.on("TransformerMinted", (tokenId, owner, ancestralHash, lineageNumber) => {
  console.log(`New Transformer #${tokenId} minted to ${owner}`);
});

contract.on("LineageActivated", (tokenId, timestamp) => {
  console.log(`Transformer #${tokenId} activated at ${timestamp}`);
});

contract.on("RestitutionDistributed", (tokenId, amount, beneficiaryCount) => {
  console.log(`Restitution of ${amount} distributed to ${beneficiaryCount} beneficiaries`);
});
```

---

## Security Considerations

1. **Multi-Signature Wallets:**
   Use multi-sig for admin and tribunal roles

2. **Access Control:**
   Regularly audit role assignments
   Revoke unused or compromised roles

3. **Restitution Escrow:**
   Consider timelock or vesting for large distributions

4. **Metadata Integrity:**
   Pin metadata to multiple IPFS nodes
   Consider backup on Arweave for permanence

5. **Smart Contract Audits:**
   Conduct professional security audit before mainnet deployment
   Implement bug bounty program

---

## Support & Resources

- **Documentation:** `/docs/OPTINUS_PRIME_CEREMONIAL_ASSEMBLY_SCROLL.md`
- **Contract Source:** `/contracts/OptimusPrimeENFT.sol`
- **Metadata Schema:** `/metadata/optimus_prime_metadata_schema.json`
- **Example Metadata:** `/metadata/optimus_prime_genesis_alpha.json`

---

**Let the assembly—and the future—commence.** 🌀
