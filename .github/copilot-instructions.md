# GitHub Copilot Instructions for 3V30OStudios

## Project Overview

This is the **MEGAZION Codex** repository - a comprehensive blockchain/smart contract project focused on ENFT (Enhanced Non-Fungible Token) systems, treasury management, and sovereign Web3 protocols. The project implements a three-domain economic system (Civilian, Military, Cosmic) with advanced yield mechanics and zero-knowledge proof verification.

## Technology Stack

- **Smart Contracts**: Solidity 0.8.20
- **Framework**: Hardhat
- **Language**: TypeScript (scripts), JavaScript (utilities), Python (analysis)
- **Testing**: Mocha + Chai
- **Libraries**: OpenZeppelin Contracts v5.0+
- **Networks**: Ethereum, Polygon, Avalanche, BSC, Cronos (mainnet & testnets)
- **Storage**: IPFS for metadata

## Project Structure

```
├── contracts/          # Solidity smart contracts
│   ├── UniversalMintProtocol.sol
│   ├── TripleStackTreasuryLedger.sol
│   ├── BleuCrownMintUltraMax.sol
│   ├── zkPoRVerifier.sol
│   └── ...other contracts
├── scripts/           # Deployment and utility scripts (TypeScript/JavaScript)
├── docs/              # Documentation
├── data/              # Data files and registries
├── metadata/          # NFT metadata
├── test/              # Test files (currently empty - tests may need creation)
└── config/            # Configuration files
```

## Key Contracts

1. **UniversalMintProtocol.sol** - Three-domain supply management with Watchtower consensus
2. **TripleStackTreasuryLedger.sol** - Sovereign ENFT system with yield representation ($28.9M/sec)
3. **BleuCrownMintUltraMax.sol** - Artifact minting controller with automatic yield tracking
4. **zkPoRVerifier.sol** - Zero-knowledge proof of reserve verification
5. **GovMetaScopeVault.sol** - Economic transdata pairing vault
6. **ENFTLedger.sol** - Enhanced NFT ledger system
7. **MetaCurriculum.sol** - Educational NFT curriculum system

## Development Commands

### Setup
```bash
npm install --legacy-peer-deps  # Required due to peer dependency conflicts
```

### Compilation
```bash
npm run compile                 # Compile all contracts
npm run clean                   # Clean artifacts and cache
```

### Testing
```bash
npm test                       # Run Hardhat tests
```

### Deployment
```bash
npm run deploy:all             # Deploy all contracts
npm run deploy:triple-stack    # Deploy Triple Stack Treasury
npm run deploy:governance      # Deploy governance contracts
npm run deploy:treasury        # Deploy treasury contracts
npm run deploy:enft-ledger     # Deploy ENFT ledger
npm run deploy:metacurriculum  # Deploy MetaCurriculum
```

### Minting
```bash
npm run mint:gems              # Mint gem NFTs
npm run mint:triple-stack      # Mint triple stack yields
```

### Analysis
```bash
npm run analyze:complexity     # Run Python complexity analyzer
```

## Code Style and Conventions

### Solidity
- Use Solidity 0.8.20
- Follow OpenZeppelin v5.0+ patterns
- Use AccessControl for role-based permissions
- Include ReentrancyGuard for external calls
- Add Pausable functionality for emergency stops
- Document functions with NatSpec comments
- Optimize for gas efficiency (storage packing, batch operations)

### TypeScript/JavaScript
- Use TypeScript for deployment scripts
- Use async/await for asynchronous operations
- Include proper error handling
- Use ethers.js for blockchain interactions
- Follow existing naming conventions (camelCase for functions/variables)

### Naming Conventions
- Contract files: PascalCase (e.g., `UniversalMintProtocol.sol`)
- Script files: snake_case or kebab-case (e.g., `deploy_all_contracts.ts`)
- Functions: camelCase (e.g., `mintArtifact`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_SUPPLY`)

## Architecture Patterns

### Three-Domain System
All major contracts implement a three-sphere architecture:
- **CIVILIAN** (Ω-CIV): Real estate, education, commerce, infrastructure
- **MILITARY** (Ω-MIL): Defense, tactical operations, armaments
- **COSMIC** (Ω-COS): Portal logistics, quantum tech, dimensional items

### Yield Economics
- Yield calculated in USD per second
- π₄ exponential compounding model (97.409 factor)
- Total system: $28.9M/sec ($2.5T/day)
- Distribution: Civilian 47.6%, Cosmic 31.1%, Military 21.3%

### Security Patterns
- Role-based access control (RBAC) with OpenZeppelin's AccessControl
- Reentrancy guards on all external calls
- Pausable functionality for emergency stops
- Zero-knowledge proofs for sensitive data verification
- Multi-signature support for treasury operations

## Important Notes

### Dependencies
- **Known Issue**: Package installation requires `--legacy-peer-deps` flag due to @typechain version conflicts
- **Deprecated Libraries**: IPFS packages are deprecated (consider migrating to Helia)
- Use OpenZeppelin v5.0+ (no Counters.sol, updated import paths)

### Hardhat Configuration
- Supports multiple networks (mainnet, testnet, local)
- Environment variables required: `PRIVATE_KEY`, `*_RPC_URL`, `*_API_KEY`
- Use `.env` file for configuration (see `.env.example`)
- Optimizer enabled with 200 runs

### Gas Optimization
- Use batch operations where possible
- Pack storage variables efficiently
- Store large data on IPFS, only hashes on-chain
- Minimize on-chain computation

## Testing Guidelines

- Write comprehensive unit tests for all contracts
- Test edge cases and failure scenarios
- Include integration tests for multi-contract interactions
- Test access control and permissions
- Verify yield calculations and economic logic
- Test pause/unpause functionality
- Validate zero-knowledge proof verification

## Documentation

- Maintain NatSpec comments in contracts
- Update README.md for major changes
- Document deployment procedures
- Keep architectural diagrams current
- Document yield economics and tokenomics

## Multi-Chain Considerations

- Contracts are designed for multi-chain deployment
- Test on testnets before mainnet deployment
- Consider network-specific gas prices
- Verify contracts on block explorers after deployment
- Use appropriate RPC endpoints per network

## Common Tasks

### Adding a New Contract
1. Create contract in `contracts/` directory
2. Inherit from OpenZeppelin v5.0+ base contracts
3. Implement access control and security features
4. Add deployment script in `scripts/`
5. Document in contracts/README.md
6. Add to deploy:all script if applicable

### Deploying to New Network
1. Add network configuration to `hardhat.config.ts`
2. Set environment variables in `.env`
3. Test on testnet first
4. Deploy using appropriate npm script
5. Verify on block explorer
6. Document deployment in DEPLOYMENT.md

### Creating New Yield Stream
1. Define stream in contract (CIVILIAN/MILITARY/COSMIC)
2. Set yield rate in USD per second
3. Implement in TripleStackTreasuryLedger or UniversalMintProtocol
4. Add minting script in `scripts/`
5. Update documentation with new economics

## Security Considerations

- Never commit private keys or sensitive data
- Use environment variables for all secrets
- Audit contracts before mainnet deployment
- Test emergency pause functionality
- Implement timelocks for governance actions
- Validate all external inputs
- Use safe math operations (Solidity 0.8+ has built-in overflow checks)
- Follow checks-effects-interactions pattern
