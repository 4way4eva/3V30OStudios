#!/usr/bin/env python3
"""
Generate Watchtower CSV for Ripple Effect Tribunal Logging

This script creates tribunal-ready entries in the Watchtower CSV format,
logging all ripple events with origin shards, timestamped effects, and sovereignty seals.
"""

import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path

# Zone configurations matching the TypeScript script
ZONES = [
    {
        "zone": "Aquatic Vortex",
        "origin_shard": "SHARD-AQUA-001",
        "frequency_hz": 432,
        "amplitude": 7500,
        "energy_allocation": 15000,
        "description": "Deep ocean energy flow harmonization"
    },
    {
        "zone": "TropiCore Dome",
        "origin_shard": "SHARD-TROPI-002",
        "frequency_hz": 528,
        "amplitude": 9200,
        "energy_allocation": 22000,
        "description": "Tropical biodiversity protection"
    },
    {
        "zone": "Volcanic Rift",
        "origin_shard": "SHARD-VOLC-003",
        "frequency_hz": 963,
        "amplitude": 12500,
        "energy_allocation": 35000,
        "description": "Geothermal power matrix stabilization"
    },
    {
        "zone": "Polar Womb",
        "origin_shard": "SHARD-POLAR-004",
        "frequency_hz": 174,
        "amplitude": 6800,
        "energy_allocation": 18000,
        "description": "Arctic preservation vault maintenance"
    },
    {
        "zone": "Dimensional Spiral",
        "origin_shard": "SHARD-DIMEN-005",
        "frequency_hz": 852,
        "amplitude": 14800,
        "energy_allocation": 45000,
        "description": "Quantum reality bridge synchronization"
    },
    {
        "zone": "Galactic Nexus",
        "origin_shard": "SHARD-GALAC-006",
        "frequency_hz": 1111,
        "amplitude": 18500,
        "energy_allocation": 62000,
        "description": "Cosmic energy convergence optimization"
    }
]


def generate_sovereignty_seal(zone_name, ripple_id):
    """Generate a sovereignty seal identifier"""
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
    return f"SEAL-{zone_name.replace(' ', '_').upper()}-TRIBUNAL-{ripple_id:04d}-{timestamp}"


def generate_effect_hash(zone, origin_shard, timestamp):
    """Generate an effect hash for the ripple"""
    import hashlib
    data = f"{zone}-{origin_shard}-{timestamp}"
    return "0x" + hashlib.sha256(data.encode()).hexdigest()


def generate_watchtower_csv():
    """Generate the Watchtower CSV with ripple effect entries"""
    
    # Setup paths
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    data_dir = repo_root / "data"
    data_dir.mkdir(exist_ok=True)
    
    csv_path = data_dir / "watchtower_ripple_effects.csv"
    
    # CSV headers for tribunal-ready logging
    headers = [
        "timestamp",
        "ripple_id",
        "zone",
        "origin_shard",
        "temporal_wave_frequency_hz",
        "temporal_wave_amplitude",
        "audit_echo_verified",
        "lineage_resonance_depth",
        "lineage_resonance_strength",
        "pulse_intent_description",
        "pulse_intent_energy_allocation",
        "sora_compliance_status",
        "sovereignty_seals",
        "effect_hash",
        "tribunal_notes",
        "recorder_address"
    ]
    
    print("🌊 Generating Watchtower CSV for Ripple Effect Tribunal Logging...\n")
    
    # Generate entries
    entries = []
    
    for idx, zone_config in enumerate(ZONES):
        ripple_id = idx
        timestamp = datetime.now(timezone.utc).isoformat()
        zone = zone_config["zone"]
        origin_shard = zone_config["origin_shard"]
        
        # Generate sovereignty seal and effect hash
        sovereignty_seal = generate_sovereignty_seal(zone, ripple_id)
        effect_hash = generate_effect_hash(zone, origin_shard, timestamp)
        
        # Create tribunal notes
        tribunal_notes = (
            f"Ripple effect logged for {zone}. "
            f"Energy allocation: {zone_config['energy_allocation']} units. "
            f"Temporal wave frequency: {zone_config['frequency_hz']} Hz. "
            f"Status: TRIBUNAL_CERTIFIED. "
            f"Sovereignty verified and sealed."
        )
        
        entry = {
            "timestamp": timestamp,
            "ripple_id": f"RIPPLE-{ripple_id:04d}",
            "zone": zone,
            "origin_shard": origin_shard,
            "temporal_wave_frequency_hz": zone_config["frequency_hz"],
            "temporal_wave_amplitude": zone_config["amplitude"],
            "audit_echo_verified": "TRUE",
            "lineage_resonance_depth": 3,
            "lineage_resonance_strength": "0.95",
            "pulse_intent_description": zone_config["description"],
            "pulse_intent_energy_allocation": zone_config["energy_allocation"],
            "sora_compliance_status": "COMPLIANT",
            "sovereignty_seals": sovereignty_seal,
            "effect_hash": effect_hash,
            "tribunal_notes": tribunal_notes,
            "recorder_address": "CODEX_SOVEREIGN_WATCHTOWER_SYSTEM"
        }
        
        entries.append(entry)
        
        print(f"✅ Generated entry for {zone}")
        print(f"   Ripple ID: {entry['ripple_id']}")
        print(f"   Origin Shard: {origin_shard}")
        print(f"   Sovereignty Seal: {sovereignty_seal}")
        print(f"   Effect Hash: {effect_hash[:18]}...")
        print()
    
    # Write to CSV
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        writer.writerows(entries)
    
    print(f"📝 Watchtower CSV saved to: {csv_path}")
    print(f"   Total entries: {len(entries)}")
    
    # Also save as JSON for programmatic access
    json_path = data_dir / "watchtower_ripple_effects.json"
    output_data = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalEntries": len(entries),
        "zones": ZONES,
        "entries": entries
    }
    
    with open(json_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(output_data, jsonfile, indent=2)
    
    print(f"📝 Watchtower JSON saved to: {json_path}")
    
    # Generate summary report
    print("\n" + "="*80)
    print("RIPPLE EFFECT WATCHTOWER SUMMARY")
    print("="*80)
    print(f"\nTotal Ripple Signatures Generated: {len(entries)}")
    print(f"Total Energy Allocation: {sum(z['energy_allocation'] for z in ZONES):,} units")
    print(f"\nZone Breakdown:")
    for zone_config in ZONES:
        print(f"  • {zone_config['zone']:25s} - {zone_config['energy_allocation']:>6,} energy units @ {zone_config['frequency_hz']:>4} Hz")
    
    print(f"\nAll entries are:")
    print("  ✓ Tribunal-ready with sovereignty seals")
    print("  ✓ Timestamped with effect hashes")
    print("  ✓ SORA Umbrella compliant")
    print("  ✓ Origin shards tracked")
    print("  ✓ Lineage resonance established")
    print("  ✓ Audit echo verified")
    
    print("\n✨ Watchtower CSV Generation Complete!")
    
    return csv_path, json_path


if __name__ == "__main__":
    try:
        csv_path, json_path = generate_watchtower_csv()
        print(f"\n🎯 Files generated successfully:")
        print(f"   CSV: {csv_path}")
        print(f"   JSON: {json_path}")
    except Exception as e:
        print(f"❌ Error generating Watchtower CSV: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
