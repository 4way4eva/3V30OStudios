# Codex Sovereign ENFT Infrastructure

## Overview

This implementation provides the ceremonial infrastructure for the EVOLVERSE Codex Sovereign system, establishing compliance-driven infrastructure binding the triple-stack treasury economy with ENFT-based governance, education, and automation.

## Contracts

### 1. CodexSovereignGovernance.sol

Complete governance system for the EVOLVERSE infrastructure.

**Features:**
- **Triple-Stack Treasury Management**: Civilian ($13.6M/sec), Military ($6.1M/sec), Cosmic ($9.2M/sec)
- **Metawing Hierarchies**: Tokenized command chains for military/strategic operations
- **Tribunal Structures**: Recall and abandon mechanisms with tribunal order verification
- **Vault Automation**: 3x Oversync protocol for treasury synchronization
- **Atlantis Rules**: Multi-trigger system for π⁴ compounding thresholds

**Key Functions:**
```solidity
// Issue a command chain
function issueCommandChain(address commander, TreasuryStream stream, string metadata) returns (uint256)

// Recall a command chain by tribunal order
function recallCommandChain(uint256 chainId, bytes32 tribunalOrderHash)

// Create vault automation thread
function createVaultThread(TreasuryStream stream) returns (uint256)

// Execute vault sync (3x Oversync protocol)
function executeVaultSync(uint256 threadId)

// Create Atlantis rule
function createAtlantisRule(string description, uint256 triggerThreshold) returns (uint256)
```

**Roles:**
- `CODEX_SOVEREIGN_ROLE`: Supreme authority, can update yield rates
- `TRIBUNAL_ROLE`: Can recall/abandon command chains
- `METAWING_COMMANDER_ROLE`: Can issue command chains
- `VAULT_OVERSEER_ROLE`: Manages vault threads and Atlantis rules
- `WATCHTOWER_ROLE`: Monitoring and alert capabilities

### 2. ENFTLedger.sol

Hybrid ERC-721/1155 ENFT system with audit compliance and chain-agnostic triggers.

**Features:**
- **ERC-721 Base**: Unique ceremonial artifacts with full NFT standard compliance
- **Batch Minting**: ERC-1155-like batch operations for efficient deployment
- **Audit Compliance**: Complete audit trail with status tracking
- **Chain-Agnostic Triggers**: Cross-chain bridge preparation system
- **Domain Categorization**: Civilian, Military, and Cosmic domain separation

**Key Functions:**
```solidity
// Mint single ENFT
function mintENFT(address to, ENFTDomain domain, string metadataURI, bytes32 ceremorialHash, bool isBridgeable) returns (uint256)

// Batch mint ENFTs
function batchMintENFT(address to, ENFTDomain domain, uint256 count, string baseMetadataURI, bytes32 ceremorialHash, bool isBridgeable) returns (uint256[])

// Update compliance status
function updateComplianceStatus(uint256 tokenId, ComplianceStatus newStatus, bytes32 auditHash, string notes)

// Create chain trigger for bridging
function createChainTrigger(uint256 tokenId, uint256 targetChainId, bytes triggerData) returns (uint256)
```

**Roles:**
- `MINTER_ROLE`: Can mint ENFTs (single or batch)
- `AUDITOR_ROLE`: Can update compliance status and add audit logs
- `CHAIN_BRIDGE_ROLE`: Can create and execute chain triggers

**Supported Chains:**
- Ethereum Mainnet (Chain ID: 1)
- Polygon (Chain ID: 137)
- Avalanche C-Chain (Chain ID: 43114)
- BNB Smart Chain (Chain ID: 56)

### 3. MetaCurriculum.sol

ENFT proof system for ZIONAIRE certifications and curriculum compliance tracking.

**Features:**
- **Curriculum Module System**: Complete module creation and tracking
- **ZIONAIRE Certifications**: Verified certifications backed by ENFT proofs
- **Prerequisites Management**: Automatic enforcement of course prerequisites
- **Compliance Tracking**: Real-time compliance status per education level
- **Multi-Level Support**: Preschool through Doctoral level education paths

**Key Functions:**
```solidity
// Create curriculum module
function createModule(string moduleName, string description, EducationLevel level, uint256 creditHours, bytes32 contentHash, uint256[] prerequisites) returns (uint256)

// Enroll student in module
function enrollStudent(uint256 moduleId, address student)

// Complete module
function completeModule(uint256 moduleId, address student, uint256 score, bytes32 proofHash)

// Verify completed module
function verifyModule(uint256 moduleId, address student)

// Issue ZIONAIRE certification
function issueCertification(address holder, EducationLevel level, uint256[] moduleIds, string metadataURI, uint256 expiryDuration) returns (uint256)
```

**Roles:**
- `CURRICULUM_ADMIN_ROLE`: Can create modules and update requirements
- `EDUCATOR_ROLE`: Can enroll students and mark modules complete
- `CERTIFIER_ROLE`: Can verify modules and issue certifications

**Education Levels:**
- Preschool (0 credits required)
- Elementary (24 credits)
- Middle School (36 credits)
- High School (48 credits)
- Undergraduate (120 credits)
- Graduate (36 credits)
- Doctoral (72 credits)
- Professional (60 credits)

## Deployment

### Prerequisites

```bash
npm install
```

### Deploy Individual Contracts

```bash
# Deploy Codex Sovereign Governance
npx hardhat run scripts/deploy_codex_governance.ts --network <network>

# Deploy ENFT Ledger
npx hardhat run scripts/deploy_enft_ledger.ts --network <network>

# Deploy MetaCurriculum
npx hardhat run scripts/deploy_metacurriculum.ts --network <network>
```

### Supported Networks

- `localhost`: Local development
- `hardhat`: Hardhat network
- `sepolia`: Ethereum Sepolia testnet
- `mumbai`: Polygon Mumbai testnet
- `fuji`: Avalanche Fuji testnet
- `mainnet`: Ethereum mainnet
- `polygon`: Polygon mainnet
- `avalanche`: Avalanche C-Chain mainnet
- `bsc`: BNB Smart Chain mainnet

## Integration with Existing Infrastructure

### Triple-Stack Treasury Ledger

The CodexSovereignGovernance contract directly implements and extends the Triple-Stack Treasury system documented in `MEGAZION_TripleStack_Treasury_Ledger.md`:

- **Civilian Stream**: $13,600,000/sec (Ω-CIV-01)
- **Military Stream**: $6,100,000/sec (Ω-MIL-01)
- **Cosmic Stream**: $9,200,000/sec (Ω-COS-01)
- **Total**: $28,900,000/sec = $2.497T/day

### BLEUE Academy Curriculum

The MetaCurriculum contract integrates with the BLEUE Academy infrastructure documented in `BLEUE_ACADEMY_CURRICULUM.md`:

- Ritual-sealed education system
- ENFT-based credentialing
- Job and military placement architecture
- Blockchain-verified academic credits

### OPTINUS PRIME Assembly

The ENFTLedger contract follows the ceremonial assembly protocols from `OPTINUS_PRIME_CEREMONIAL_ASSEMBLY_SCROLL.md`:

- Ceremonial metadata and ancestral hashes
- Lineage tree verification concepts
- Deployment permissions (curriculum, cinematic, tribunal, infrastructure, military, agricultural)
- Automated restitution flows

## Security Considerations

### Access Control

All contracts implement OpenZeppelin's `AccessControl` for role-based permissions:
- Multi-signature recommendations for admin roles in production
- Separate roles for different operational functions
- Time-locked upgrades for critical parameters

### Reentrancy Protection

All state-changing functions that involve external calls use OpenZeppelin's `ReentrancyGuard`:
- Minting operations protected
- Treasury operations secured
- Certification issuance guarded

### Audit Trail

Complete audit logging for compliance:
- ENFTLedger maintains full audit history per token
- MetaCurriculum tracks all module completions and verifications
- CodexSovereignGovernance logs all command chain and vault operations

## Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/CodexSovereignGovernance.test.ts

# Run with coverage
npx hardhat coverage
```

## Verification

After deployment, verify contracts on block explorers:

```bash
# Verify CodexSovereignGovernance
npx hardhat verify --network <network> <contract-address> <admin-address>

# Verify ENFTLedger
npx hardhat verify --network <network> <contract-address> <admin-address>

# Verify MetaCurriculum
npx hardhat verify --network <network> <contract-address> <admin-address>
```

## Example Usage

### Create and Execute a Command Chain

```javascript
const governance = await ethers.getContractAt("CodexSovereignGovernance", address);

// Issue command chain
const tx = await governance.issueCommandChain(
  commanderAddress,
  0, // CIVILIAN stream
  "ipfs://QmCommandMetadata"
);
await tx.wait();

// Later: recall by tribunal if needed
await governance.recallCommandChain(
  chainId,
  ethers.keccak256(ethers.toUtf8Bytes("Tribunal Order #123"))
);
```

### Mint and Audit an ENFT

```javascript
const ledger = await ethers.getContractAt("ENFTLedger", address);

// Mint ENFT
const mintTx = await ledger.mintENFT(
  recipientAddress,
  0, // CIVILIAN domain
  "ipfs://QmMetadata",
  ethers.keccak256(ethers.toUtf8Bytes("Ceremonial Assembly")),
  true // bridgeable
);
const receipt = await mintTx.wait();

// Update compliance
await ledger.updateComplianceStatus(
  tokenId,
  2, // VERIFIED status
  ethers.keccak256(ethers.toUtf8Bytes("Audit Data")),
  "Passed all compliance checks"
);
```

### Issue a ZIONAIRE Certification

```javascript
const curriculum = await ethers.getContractAt("MetaCurriculum", address);

// Create and complete modules first...

// Issue certification
const certTx = await curriculum.issueCertification(
  studentAddress,
  4, // UNDERGRADUATE level
  [0, 1, 2], // completed module IDs
  "ipfs://QmCertificateMetadata",
  0 // no expiry
);
await certTx.wait();
```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For issues and questions:
- GitHub Issues: https://github.com/4way4eva/3V30OStudios/issues
- Documentation: See individual contract NatSpec comments

---

**⚠️ Important**: These contracts handle critical governance, financial, and educational infrastructure. Always conduct thorough testing and security audits before production deployment.
