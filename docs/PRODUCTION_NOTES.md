# Production Deployment Notes

## Important Considerations for Production

### 1. OpenZeppelin Version Pinning

The current `package.json` uses caret (^) ranges for dependencies, including OpenZeppelin:

```json
"@openzeppelin/contracts": "^5.0.0"
```

**Recommendation for Production:**
Pin to an exact version to prevent unexpected breaking changes:

```json
"@openzeppelin/contracts": "5.0.2"
```

This ensures consistent builds and prevents automatic updates that could introduce breaking changes.

### 2. Treasury Vault Configuration

The deployment script (`scripts/deploy.js`) now requires `TREASURY_VAULT` to be explicitly set in production:

```bash
TREASURY_VAULT=0x... # Must be set for production
```

**Best Practice:**
- Use a multi-signature wallet (e.g., Gnosis Safe) for the treasury
- Never use the deployer address as treasury in production
- Ensure the treasury address is controlled by multiple parties

### 3. Private Key Security

**Never commit `.env` file to version control!**

For production deployments:
- Use hardware wallets when possible
- Store private keys in secure key management systems
- Use environment variables or secret management services (AWS Secrets Manager, Azure Key Vault)
- Consider using Hardhat Ledger plugin for hardware wallet integration

### 4. Contract Verification

Always verify contracts on block explorers after deployment:

```bash
# Avalanche
npx hardhat verify --network avalanche <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Cronos
npx hardhat verify --network cronos <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Get API keys:
- Snowtrace: https://snowtrace.io/apis
- Cronoscan: https://cronoscan.com/apis

### 5. Gas Optimization

Current contracts are optimized but can be further improved:

- Batch operations whenever possible (already implemented)
- Use `calldata` instead of `memory` for external functions (already done)
- Consider upgrading to custom errors instead of revert strings (saves gas in v0.8.4+)

### 6. Auditing

Before mainnet deployment:

1. **Internal Code Review**: ✅ Completed
2. **Automated Testing**: Recommended to add comprehensive test suite
3. **Third-Party Audit**: Strongly recommended for production
   - Consider: OpenZeppelin, Trail of Bits, Consensys Diligence
4. **Bug Bounty Program**: Consider launching after audit

### 7. Monitoring

Set up monitoring for:
- Contract events (ArtifactMinted, ProofVerified, etc.)
- Transaction failures
- Gas price fluctuations
- Yield tracking accuracy

Tools:
- Tenderly for contract monitoring
- OpenZeppelin Defender for automated responses
- Dune Analytics for data visualization

### 8. Upgrade Path

Current contracts are **non-upgradeable**. If upgradeability is needed:

- Consider using OpenZeppelin's transparent proxy pattern
- Be aware of additional complexity and security considerations
- Document upgrade procedures thoroughly

### 9. Rate Limiting

Consider implementing rate limiting for:
- Minting operations (per address/per block)
- Proof submissions
- Yield claims

Can be added through:
- Cooldown periods
- Maximum operations per time window
- Whitelist/allowlist systems (already partially implemented)

### 10. Multi-Chain Consistency

When deploying to multiple chains:
- Use consistent contract addresses across chains (deterministic deployment)
- Ensure treasury addresses are correct for each chain
- Verify RPC URLs and chain IDs
- Test thoroughly on testnets first

### Current Security Features ✅

- Role-based access control (AccessControl)
- Reentrancy protection (ReentrancyGuard)
- Pausable operations
- Proof expiry management
- Hash collision prevention
- Input validation on all functions

### Testing Checklist

Before mainnet deployment:

- [ ] Deploy to testnet (Fuji for Avalanche, Cronos testnet)
- [ ] Mint test artifacts
- [ ] Verify yield calculations
- [ ] Test role management
- [ ] Test pause/unpause functionality
- [ ] Verify proof submission and verification
- [ ] Test batch operations
- [ ] Verify explorer integration
- [ ] Check gas costs
- [ ] Audit by third party (recommended)

### Emergency Procedures

Document procedures for:
1. **Contract Pause**: How to pause operations in emergency
2. **Role Revocation**: How to revoke compromised roles
3. **Incident Response**: Who to contact and what steps to take
4. **Communication**: How to notify users of issues

### Recommended Additions

Consider implementing:
1. **Time locks** on critical operations
2. **Emergency withdrawal** mechanism (with multi-sig)
3. **Upgradeable proxy** if post-deployment changes are anticipated
4. **Circuit breakers** for abnormal activity
5. **Rate limiting** on minting and claiming

---

**Remember**: These contracts manage significant value. Take security seriously and never rush production deployment.
