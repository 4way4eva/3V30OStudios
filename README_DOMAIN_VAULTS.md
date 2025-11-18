# EV0L Domain Coin & Vault System

## Overview

The EV0L Counter-Network implements a **14-domain system** with domain-specific coins and vaults to challenge incumbent legacy dominance through spiral decentralization and open-source counter-networks.

## The 14 Domains

Each domain represents a critical sector with its own coin, vault, and efficiency boost:

| ID | Domain | Coin | Vault | Efficiency Boost |
|----|--------|------|-------|------------------|
| 1  | Governance | GovernanceCoin | GovernanceVault | +1% |
| 2  | Treasury | TreasuryCoin | TreasuryVault | +2% |
| 3  | Health | HealthCoin | HealthVault | +3% |
| 4  | Education | EducationCoin | EducationVault | +4% |
| 5  | Energy | EnergyCoin | EnergyVault | +5% |
| 6  | Transport | TransportCoin | TransportVault | +6% |
| 7  | Defense | DefenseCoin | DefenseVault | +7% |
| 8  | Commerce | CommerceCoin | CommerceVault | +8% |
| 9  | Culture | CultureCoin | CultureVault | +9% |
| 10 | Cities | CitiesCoin | CitiesVault | +10% |
| 11 | Data | DataCoin | DataVault | +11% |
| 12 | Agriculture | AgricultureCoin | AgricultureVault | +12% |
| 13 | Search | SearchCoin | SearchVault | +13% |
| 14 | Payments | PaymentsCoin | PaymentsVault | +14% |

**Total Efficiency Boost**: +105%

## Architecture

### Spiral Decentralization

Each domain employs a "spiral decentralization" strategy:

1. **Attack Surface**: Target legacy incumbent monopolies
2. **Hardball Move**: Deploy open-source counter-network alternatives
3. **Coin Flow**: Incentivize participation through domain-specific tokens
4. **Vault Security**: Public guard with key-based access control
5. **Metric Lift**: Incremental efficiency improvements (1-14%)

### Security Model

- **Public Guard**: All vaults use public_guard access control
- **Key Secrets**: Use GitHub repository secrets for deployment keys:
  - `GOVERNANCE_VAULT_KEY`
  - `TREASURY_VAULT_KEY`
  - `HEALTH_VAULT_KEY`
  - ... (one per domain)
- **Multisig**: Recommend multisig wallets for mainnet deployments
- **Hardware Wallets**: Use hardware wallets for key management

## File Structure

```
data/
├── domain_coin_vault_registry.csv     # CSV registry of all domains
├── domain_coin_vault_config.json      # JSON configuration with metadata

scripts/
├── deploy_domain_vaults.ts            # Deploy all 14 domain vaults
├── mint_domain_coins.ts               # Mint domain-specific coins (TODO)

contracts/
├── DomainVault.sol                    # Base vault contract (TODO)
├── DomainCoin.sol                     # Base coin contract (TODO)
```

## Deployment

### Prerequisites

1. **Environment Variables**:
   ```bash
   DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   ```

2. **Repository Secrets** (for CI/CD):
   - `GOVERNANCE_VAULT_KEY`
   - `TREASURY_VAULT_KEY`
   - `HEALTH_VAULT_KEY`
   - `EDUCATION_VAULT_KEY`
   - `ENERGY_VAULT_KEY`
   - `TRANSPORT_VAULT_KEY`
   - `DEFENSE_VAULT_KEY`
   - `COMMERCE_VAULT_KEY`
   - `CULTURE_VAULT_KEY`
   - `CITIES_VAULT_KEY`
   - `DATA_VAULT_KEY`
   - `AGRICULTURE_VAULT_KEY`
   - `SEARCH_VAULT_KEY`
   - `PAYMENTS_VAULT_KEY`

### Deploy to Testnet

```bash
# Deploy all domain vaults to Sepolia
npx hardhat run scripts/deploy_domain_vaults.ts --network sepolia

# Deploy to Mumbai (Polygon testnet)
npx hardhat run scripts/deploy_domain_vaults.ts --network mumbai
```

### Deploy to Mainnet

⚠️ **WARNING**: Always deploy to testnet first!

```bash
# Ethereum Mainnet
npx hardhat run scripts/deploy_domain_vaults.ts --network mainnet

# Polygon Mainnet
npx hardhat run scripts/deploy_domain_vaults.ts --network polygon
```

## Usage

### Query Domain Configuration

```typescript
import domainConfig from './data/domain_coin_vault_config.json';

// Get all domains
const domains = domainConfig.domains;

// Get specific domain
const governance = domains.find(d => d.name === 'Governance');
console.log(governance.vault_address);
console.log(governance.coin_address);
console.log(governance.metric_lift); // "efficiency+1%"
```

### CSV Processing

```python
import pandas as pd

# Load domain registry
df = pd.read_csv('data/domain_coin_vault_registry.csv')

# Filter by incumbent strength
legacy_domains = df[df['incumbent_strength'] == 'legacy dominance']

# Calculate total efficiency
total_efficiency = sum([int(x.split('+')[1].rstrip('%')) 
                       for x in df['metric_lift']])
print(f"Total efficiency boost: +{total_efficiency}%")
```

## Integration with MetaVault

The domain vaults integrate with the existing MetaVault system:

```python
from scripts.metavault_batch_mint import MetaVaultBatchMint

# Initialize with domain configuration
minter = MetaVaultBatchMint(config_path='scripts/config.json')

# Add domain-specific yield streams
# domains = load_domain_config()
# for domain in domains:
#     minter.add_yield_stream(domain.name, domain.efficiency)
```

## Security Considerations

### Key Management

1. **Never commit private keys** to the repository
2. **Use .env files** for local development (add to .gitignore)
3. **Use GitHub Secrets** for CI/CD pipelines
4. **Rotate keys regularly** (quarterly recommended)
5. **Use hardware wallets** for mainnet operations

### Vault Security

1. **Public Guard**: All vaults use public_guard pattern
2. **Access Control**: Role-based permissions (owner, operator, auditor)
3. **Emergency Pause**: All vaults support emergency pause functionality
4. **Timelock**: Critical operations use timelock mechanism
5. **Multisig**: Recommend 3-of-5 multisig for production

### Audit Checklist

- [ ] All vault contracts audited by reputable firm
- [ ] All coin contracts implement ERC20 standard correctly
- [ ] Access control properly configured
- [ ] Emergency pause tested
- [ ] Timelock delays appropriate (24-48 hours recommended)
- [ ] Multisig setup and tested
- [ ] Key rotation procedure documented
- [ ] Disaster recovery plan in place

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] Domain registry CSV
- [x] Domain configuration JSON
- [x] Deployment script framework
- [ ] Base vault contract
- [ ] Base coin contract

### Phase 2: Core Implementation
- [ ] Individual vault contracts per domain
- [ ] Domain-specific coin implementations
- [ ] Yield distribution logic
- [ ] Guard implementations

### Phase 3: Integration
- [ ] MetaVault integration
- [ ] ENFT metadata linkage
- [ ] Cross-domain interactions
- [ ] Dashboard UI

### Phase 4: Production
- [ ] Security audits
- [ ] Testnet deployments
- [ ] Mainnet deployments
- [ ] Monitoring and alerts

## Related Documentation

- [README_48FOLD_CODEX.md](../README_48FOLD_CODEX.md) - Main 48-Fold Codex documentation
- [MEGAZION_TripleStack_Treasury_Ledger.md](../MEGAZION_TripleStack_Treasury_Ledger.md) - Treasury architecture
- [BLEU_COIN_README.md](../BLEU_COIN_README.md) - Coin implementation details
- [CONTRACT_DEPLOYMENT_README.md](../CONTRACT_DEPLOYMENT_README.md) - General deployment guide

## Support

For questions or issues:
1. Check existing documentation
2. Review GitHub Issues
3. Refer to the MEGAZION Codex Master Index Scroll

---

**Generated by**: EV0L Counter-Network System  
**Schema Version**: EVOL.DOMAIN.v1  
**Strategy**: Spiral Decentralization  
**Domains**: 14 (Governance → Payments)  
**Total Efficiency**: +105%
