# 🌊 Ripple Effect Quick Reference

## Quick Start

### 1. Deploy Contract
```bash
npm run deploy:ripple-effect -- --network <network>
```

### 2. Set Environment Variable
```bash
export RIPPLE_EFFECT_LEDGER_ADDRESS=0x...
```

### 3. Activate Ripples
```bash
npm run ripple:activate -- --network <network>
```

### 4. Generate Zone Ledger
```bash
npm run ripple:generate-ledger -- --network <network>
```

---

## Zone Quick Reference

| Zone | ID | Amplification | Ripple Type |
|------|----|--------------:|-------------|
| 🌊 Aquatic Vortex | 0 | 1.10x | Hydro-Spiral |
| 🌴 TropiCore Dome | 1 | 1.20x | Bio-Thermal |
| 🌋 Volcanic Rift | 2 | 1.50x | Geo-Seismic |
| ❄️ Polar Womb | 3 | 1.30x | Cryo-Aurora |
| 🌀 Dimensional Spiral | 4 | 2.00x | Quantum-Portal |
| 🌌 Galactic Nexus | 5 | 1.80x | Stellar-Cosmic |

---

## Shard Types

| Type | ID | Description |
|------|---:|-------------|
| HEALING | 0 | Healing shards and cure loops |
| GEM | 1 | 48 Divine Techno-Mystical Gems |
| ZONE | 2 | Sovereign zone activations |
| INGREDIENT | 3 | Craft and ritual ingredients |
| JOB | 4 | Operational and ceremonial jobs |
| ARTIFACT | 5 | ENFT artifacts and relics |
| SCROLL | 6 | Codex scrolls and documentation |

---

## Umbrella Systems

| System | ID | Purpose |
|--------|---:|---------|
| SORA | 0 | Primary sovereign umbrella |
| BLEULION | 1 | Lion cascade protection |
| WATCHTOWER | 2 | Audit trail umbrella |
| TEMPORAL | 3 | Time-bridge umbrella |

---

## Core Functions

### Activate Ripple
```typescript
await rippleEffectLedger.activateRipple(
  "Dimensional Spiral Port",           // originShard
  "0x43dC17dF7919D25c06a01D52aAad...", // contractAddress
  ShardType.ARTIFACT,                   // shardType (5)
  Zone.DIMENSIONAL_SPIRAL,              // zone (4)
  Umbrella.SORA,                        // umbrella (0)
  ceremorialHash                        // bytes32
);
```

### Add Echo
```typescript
await rippleEffectLedger.addEcho(
  rippleId,
  "Echo across Healing shards"
);
```

### Amplify Through SORA
```typescript
await rippleEffectLedger.amplifyRipple(rippleId);
```

### Record Audit
```typescript
await rippleEffectLedger.recordAuditEcho(
  rippleId,
  auditHash,
  "2025-11-18T23:45:00Z,ZONE,1,ACTIVATED,SORA,GREEN_TIER"
);
```

### Archive Pulse
```typescript
await rippleEffectLedger.archivePulse(
  rippleId,
  pulseData
);
```

### Extend Lineage
```typescript
await rippleEffectLedger.extendLineage(
  parentRippleId,
  childRippleId
);
```

### Seal Ripple
```typescript
await rippleEffectLedger.sealRipple(rippleId);
```

### Get Ripple Trace
```typescript
const [event, effect, lineage] = await rippleEffectLedger.getRippleTrace(rippleId);
```

---

## Watchtower CSV Format

```csv
timestamp,zone,ripple_id,origin_shard,status,umbrella,density_tier
2025-11-18T23:45:00.000Z,DIMENSIONAL_SPIRAL,1,Dimensional Spiral Port,ACTIVATED,SORA,GREEN_TIER
```

---

## Density Tiers

| Tier | Score Range | Description |
|------|------------:|-------------|
| 🔴 RED | 0-39 | Low density, needs amplification |
| 🟡 YELLOW | 40-69 | Medium density, improving |
| 🟢 GREEN | 70+ | High density, tribunal-ready |

**Note:** SORA amplification ensures all ripples reach Green tier (≥70)

---

## Protection Mechanisms

### ✅ SORA Umbrella
- Shelters all ripples
- Amplifies by zone factor
- Ensures Green tier density

### ✅ Watchtower CSV
- Timestamped entries
- Tribunal-ready format
- Immutable audit trail

### ✅ Pulse Archive
- Electromagnetic memory
- Off-chain data storage
- Retrieval hashes

### ✅ Style Signature
- Unique cryptographic fingerprint
- Anti-mimicry protection
- Cannot be forged

### ✅ Lineage Tracking
- Ancestral root preservation
- Parent-child linking
- Generation depth tracking

---

## Anti-Mimicry Features

🛡️ **Thieves can copy names, but not ripples**

| Feature | Your Ripple | Thief's Copy |
|---------|-------------|--------------|
| Depth | Recursive ∞ | Flat (1D) |
| Signature | Unique hash | Generic |
| Lineage | Verified chain | None |
| Amplification | Zone-specific | None |
| Temporal | Anchored | Forged |
| Protection | SORA Umbrella | None |

---

## Example Ripple Trace

```json
{
  "rippleId": "1",
  "zone": "DIMENSIONAL_SPIRAL",
  "density_score": 140,
  "is_amplified": true,
  "tribunal_ready": true,
  "sora_protected": true,
  "echoes": [
    "Echo across Healing shards",
    "Amplification in Gem Scrolls",
    "Memory seal in Pulse Archive"
  ]
}
```

---

## Integration Examples

### ENFTLedger
```solidity
function mintENFT(...) external {
    // Mint ENFT
    uint256 tokenId = _mint(...);
    
    // Activate ripple
    rippleEffectLedger.activateRipple(
        tokenId,
        address(this),
        ShardType.ARTIFACT,
        zone,
        Umbrella.SORA,
        ceremorialHash
    );
}
```

### Watchtower
```solidity
function recordVaultRoot(...) external {
    // Record audit
    _auditLog[vaultId].push(...);
    
    // Add to ripple
    rippleEffectLedger.recordAuditEcho(
        rippleId,
        auditHash,
        watchtowerEntry
    );
}
```

### Treasury
```solidity
function mintYield(...) external {
    // Mint yield
    uint256 childYieldId = _mintYield(...);
    
    // Extend lineage
    rippleEffectLedger.extendLineage(
        parentYieldId,
        childYieldId
    );
}
```

---

## Troubleshooting

### Error: "zone not active"
**Solution:** Check zone status with `zoneSignatures(zoneId).isActive`

### Error: "already amplified"
**Solution:** Each ripple can only be amplified once

### Error: "ripple is sealed"
**Solution:** Sealed ripples cannot be modified

### Error: "ripple does not exist"
**Solution:** Verify ripple ID is valid with `getRippleTrace(rippleId)`

---

## Gas Optimization Tips

✅ Batch echoes when possible  
✅ Archive pulse data off-chain, store hash on-chain  
✅ Use events for historical data  
✅ Seal ripples only when finalized  

---

## Support

📖 Full Documentation: `RIPPLE_EFFECT_README.md`  
📄 Contract: `contracts/RippleEffectLedger.sol`  
🧪 Tests: `test/RippleEffectLedger.test.ts`  
📊 Examples: `data/ripple_trace_example.json`  

---

**Remember: The ripple is memory itself, carried forward in waves.** 🌊⚖️
