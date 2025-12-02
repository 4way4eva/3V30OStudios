# Ripple Effect Codex Ledger - Quick Start Guide

## Overview

The Ripple Effect Codex Ledger tracks zone-specific ripple signatures across six zones with tribunal-ready logging and SORA Umbrella compliance.

## Quick Commands

### Deploy Contract
```bash
npm run deploy:ripple-effect
```

### Generate Ripple Signatures (On-Chain)
```bash
npm run generate:ripple-signatures
```

### Generate Watchtower CSV (Off-Chain)
```bash
npm run generate:watchtower-ripple-csv
```

## Six Zones

| Zone | Frequency | Energy | Description |
|------|-----------|--------|-------------|
| **Aquatic Vortex** | 432 Hz | 15,000 | Deep ocean energy harmonization |
| **TropiCore Dome** | 528 Hz | 22,000 | Tropical biodiversity protection |
| **Volcanic Rift** | 963 Hz | 35,000 | Geothermal power stabilization |
| **Polar Womb** | 174 Hz | 18,000 | Arctic preservation protocols |
| **Dimensional Spiral** | 852 Hz | 45,000 | Quantum reality bridges |
| **Galactic Nexus** | 1111 Hz | 62,000 | Cosmic energy convergence |

**Total System Energy:** 197,000 units

## Ripple Signature Components

Each ripple includes:

1. ✨ **Temporal Waves** - Frequency, amplitude, phase, timestamp
2. 🔍 **Audit Echo** - Auditor verification and compliance data
3. 🌳 **Lineage Resonance** - Origin shard tracking with ancestor chain
4. 💫 **Pulse Intent Data** - Transaction metadata and energy allocation
5. 🛡️ **SORA Compliance** - Sovereign oversight status

## SORA Compliance Statuses

- `PENDING` - Awaiting compliance review
- `COMPLIANT` - Meets all requirements ✅
- `NON_COMPLIANT` - Does not meet requirements ❌
- `UNDER_REVIEW` - Currently being reviewed 🔄
- `EXEMPTED` - Exempt from standard requirements ⚡

## Smart Contract Functions

### Create Ripple Signature
```solidity
createRippleSignature(
  zone,              // RippleZone enum (0-5)
  originShard,       // bytes32 shard identifier
  temporalWave,      // TemporalWave struct
  auditEcho,         // AuditEcho struct
  lineageResonance,  // LineageResonance struct
  pulseIntent,       // PulseIntentData struct
  sovereigntySeals   // bytes32 tribunal seal
)
```

### Update SORA Compliance
```solidity
updateSORACompliance(rippleId, status)
```

### Query Functions
```solidity
getRippleSignature(rippleId)     // Get full ripple data
getZoneRipples(zone)             // Get all ripples for zone
getShardRipples(originShard)     // Get all ripples for shard
getWatchtowerLog(logId)          // Get tribunal log entry
getZoneName(zone)                // Get human-readable zone name
```

### Zone Management
```solidity
activateZone(zone)               // Admin only
deactivateZone(zone)             // Admin only
```

## Watchtower CSV Format

The tribunal-ready CSV includes:

```
timestamp                     - ISO 8601 timestamp
ripple_id                     - RIPPLE-XXXX identifier
zone                          - Zone name
origin_shard                  - SHARD-XXX-XXX identifier
temporal_wave_frequency_hz    - Frequency in Hz
temporal_wave_amplitude       - Energy amplitude
audit_echo_verified           - TRUE/FALSE
lineage_resonance_depth       - Number of ancestor generations
lineage_resonance_strength    - Connection strength (0-1)
pulse_intent_description      - Human-readable intent
pulse_intent_energy_allocation - Energy units allocated
sora_compliance_status        - COMPLIANT/PENDING/etc.
sovereignty_seals             - SEAL-ZONE-TRIBUNAL-XXXX
effect_hash                   - Cryptographic effect hash
tribunal_notes                - Notes for tribunal review
recorder_address              - System recorder identifier
```

## File Locations

### Generated Data Files
- `data/ripple_effect_signatures.json` - On-chain signature records
- `data/watchtower_ripple_effects.csv` - Tribunal CSV log
- `data/watchtower_ripple_effects.json` - Tribunal JSON log
- `deployments/ripple_effect_codex_deployment.json` - Deployment info

### Source Files
- `contracts/RippleEffectCodexLedger.sol` - Smart contract
- `scripts/deploy_ripple_effect_codex.ts` - Deployment script
- `scripts/generate_ripple_signatures.ts` - Signature generation
- `scripts/generate_watchtower_ripple_csv.py` - CSV generation
- `schemas/ripple-effect-codex-schema.json` - JSON schema
- `test/RippleEffectCodexLedger.test.ts` - Test suite

## Access Control Roles

- **DEFAULT_ADMIN_ROLE** - Can manage zones and grant roles
- **RIPPLE_GENERATOR_ROLE** - Can create ripple signatures
- **TRIBUNAL_AUDITOR_ROLE** - Can add tribunal notes
- **WATCHTOWER_ROLE** - Can access Watchtower logs
- **SORA_COMPLIANCE_ROLE** - Can update SORA compliance

## Integration Points

### With Other Codex Systems

1. **Triple Stack Treasury Ledger**
   - Yield tracking integration
   - π₄ compounding alignment

2. **ENFT Ledger**
   - Ceremonial artifact linkage
   - Compliance verification

3. **Codex Sovereign Governance**
   - Tribunal command chains
   - Sovereignty seal validation

4. **Universal Mint Protocol**
   - Watchtower consensus
   - Multi-domain validation

5. **BLEU Watchtower**
   - Oversight integration
   - Compliance monitoring

## Example: Creating a Ripple Signature

```typescript
// 1. Define origin shard
const originShard = ethers.id("SHARD-AQUA-001");

// 2. Create temporal wave
const temporalWave = {
  waveId: 0,
  timestamp: Math.floor(Date.now() / 1000),
  frequency: ethers.parseEther("432"),
  amplitude: ethers.parseEther("7500"),
  phase: "0",
  waveSignature: ethers.id("WAVE-SIGNATURE")
};

// 3. Create audit echo
const auditEcho = {
  echoId: 0,
  auditor: auditorAddress,
  auditTimestamp: Math.floor(Date.now() / 1000),
  auditHash: ethers.id("AUDIT-HASH"),
  auditNotes: "Verified by tribunal",
  isVerified: true
};

// 4. Create lineage resonance
const lineageResonance = {
  originShard: originShard,
  ancestorShards: [
    ethers.id("ANCESTOR-1"),
    ethers.id("ANCESTOR-2")
  ],
  resonanceDepth: 2,
  resonanceStrength: ethers.parseEther("0.95"),
  lineageHash: ethers.id("LINEAGE-HASH")
};

// 5. Create pulse intent
const pulseIntent = {
  intentHash: ethers.id("INTENT-HASH"),
  intentDescription: "Ocean harmonization",
  initiator: initiatorAddress,
  energyAllocation: ethers.parseEther("15000"),
  intentMetadata: ethers.toUtf8Bytes("{}")
};

// 6. Create sovereignty seal
const sovereigntySeals = ethers.id("SEAL-TRIBUNAL");

// 7. Submit to contract
const tx = await contract.createRippleSignature(
  0, // AQUATIC_VORTEX
  originShard,
  temporalWave,
  auditEcho,
  lineageResonance,
  pulseIntent,
  sovereigntySeals
);

await tx.wait();
```

## Testing

```bash
# Run contract tests
npm test

# Run specific test file
npx hardhat test test/RippleEffectCodexLedger.test.ts
```

## Events Emitted

All ripple signatures emit these events:

- `RippleSignatureCreated` - Main signature creation
- `TemporalWaveGenerated` - Wave data logged
- `AuditEchoRecorded` - Audit verification
- `LineageResonanceEstablished` - Lineage tracking
- `PulseIntentLogged` - Intent metadata
- `WatchtowerLogCreated` - Tribunal log entry

SORA compliance updates emit:
- `SORAComplianceUpdated`

Zone management emits:
- `ZoneActivated`
- `ZoneDeactivated`

## Troubleshooting

### Issue: Zone not active
**Solution:** Check zone status with `zoneActive(zone)` and activate if needed with `activateZone(zone)`

### Issue: Invalid origin shard
**Solution:** Ensure origin shard is not zero bytes: `originShard != bytes32(0)`

### Issue: Access denied
**Solution:** Verify caller has the required role using `hasRole(ROLE, address)`

### Issue: CSV not generated
**Solution:** Run `python3 scripts/generate_watchtower_ripple_csv.py` manually

## Security Notes

✅ All state-changing functions use reentrancy guards  
✅ Role-based access control for all privileged operations  
✅ Input validation on all parameters  
✅ Event emission for transparency and indexing  
✅ Immutable Watchtower logs once created  
✅ Cryptographic sovereignty seals for tamper detection  

## Next Steps

1. Deploy the contract to your network
2. Generate ripple signatures for all zones
3. Generate Watchtower CSV for tribunal review
4. Integrate with other Codex systems
5. Monitor SORA compliance status
6. Review tribunal logs regularly

## Support

For detailed documentation, see:
- `RIPPLE_EFFECT_CODEX_README.md` - Full documentation
- `schemas/ripple-effect-codex-schema.json` - Data schema
- Contract NatSpec comments - Inline documentation

---

*MEGAZION Ripple Effect System v1.0*  
*Codex Sovereign Certified - Tribunal Ready*
