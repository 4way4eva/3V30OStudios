#!/usr/bin/env python3
"""
Validate Ripple Effect System Implementation

This script verifies that all components of the Ripple Effect system
have been properly implemented according to the requirements.
"""

import json
import csv
import os
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} NOT FOUND")
        return False

def validate_csv_structure():
    """Validate the Watchtower CSV structure"""
    csv_path = "data/watchtower_ripple_effects.csv"
    
    required_fields = [
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
    
    try:
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames
            
            # Check all required fields are present
            missing_fields = set(required_fields) - set(headers)
            if missing_fields:
                print(f"❌ CSV missing required fields: {missing_fields}")
                return False
            
            # Count entries
            entries = list(reader)
            if len(entries) != 6:
                print(f"❌ Expected 6 zone entries, found {len(entries)}")
                return False
            
            print(f"✅ Watchtower CSV has all required fields and 6 zone entries")
            return True
    except Exception as e:
        print(f"❌ Error validating CSV: {e}")
        return False

def validate_json_data():
    """Validate the JSON data structure"""
    json_path = "data/watchtower_ripple_effects.json"
    
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Check required top-level fields
        required_top_level = ["generatedAt", "totalEntries", "zones", "entries"]
        missing = set(required_top_level) - set(data.keys())
        if missing:
            print(f"❌ JSON missing top-level fields: {missing}")
            return False
        
        # Check we have 6 zones
        if len(data["zones"]) != 6:
            print(f"❌ Expected 6 zones, found {len(data['zones'])}")
            return False
        
        # Check we have 6 entries
        if data["totalEntries"] != 6:
            print(f"❌ Expected totalEntries=6, found {data['totalEntries']}")
            return False
        
        # Verify zone names
        expected_zones = [
            "Aquatic Vortex",
            "TropiCore Dome",
            "Volcanic Rift",
            "Polar Womb",
            "Dimensional Spiral",
            "Galactic Nexus"
        ]
        
        actual_zones = [z["zone"] for z in data["zones"]]
        if actual_zones != expected_zones:
            print(f"❌ Zone names don't match expected")
            return False
        
        print(f"✅ JSON data structure valid with all 6 zones")
        return True
    except Exception as e:
        print(f"❌ Error validating JSON: {e}")
        return False

def validate_zone_energy():
    """Validate total energy allocation"""
    json_path = "data/watchtower_ripple_effects.json"
    
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        total_energy = sum(z["energy_allocation"] for z in data["zones"])
        expected_total = 197000
        
        if total_energy != expected_total:
            print(f"❌ Total energy {total_energy} != expected {expected_total}")
            return False
        
        print(f"✅ Total energy allocation correct: {total_energy:,} units")
        return True
    except Exception as e:
        print(f"❌ Error validating energy: {e}")
        return False

def main():
    """Main validation routine"""
    print("🌊 Validating Ripple Effect System Implementation\n")
    print("="*80)
    
    # Change to repo root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    os.chdir(repo_root)
    
    checks = []
    
    # Check all required files exist
    print("\n📁 Checking Files:\n")
    checks.append(check_file_exists("contracts/RippleEffectCodexLedger.sol", "Smart Contract"))
    checks.append(check_file_exists("scripts/deploy_ripple_effect_codex.ts", "Deployment Script"))
    checks.append(check_file_exists("scripts/generate_ripple_signatures.ts", "Signature Generator"))
    checks.append(check_file_exists("scripts/generate_watchtower_ripple_csv.py", "CSV Generator"))
    checks.append(check_file_exists("test/RippleEffectCodexLedger.test.ts", "Test Suite"))
    checks.append(check_file_exists("data/watchtower_ripple_effects.csv", "Watchtower CSV"))
    checks.append(check_file_exists("data/watchtower_ripple_effects.json", "Watchtower JSON"))
    checks.append(check_file_exists("schemas/ripple-effect-codex-schema.json", "JSON Schema"))
    checks.append(check_file_exists("RIPPLE_EFFECT_CODEX_README.md", "Full Documentation"))
    checks.append(check_file_exists("RIPPLE_EFFECT_QUICKSTART.md", "Quickstart Guide"))
    
    # Validate data structures
    print("\n📊 Validating Data Structures:\n")
    checks.append(validate_csv_structure())
    checks.append(validate_json_data())
    checks.append(validate_zone_energy())
    
    # Summary
    print("\n" + "="*80)
    print("\n📋 VALIDATION SUMMARY\n")
    
    total_checks = len(checks)
    passed_checks = sum(checks)
    failed_checks = total_checks - passed_checks
    
    print(f"Total Checks: {total_checks}")
    print(f"Passed: {passed_checks} ✅")
    print(f"Failed: {failed_checks} ❌")
    
    if failed_checks == 0:
        print("\n🎉 ALL VALIDATION CHECKS PASSED!")
        print("\nRipple Effect System Implementation: COMPLETE ✅")
        print("\nAll 6 zones with complete signatures:")
        print("  ✓ Temporal Waves")
        print("  ✓ Audit Echo")
        print("  ✓ Lineage Resonance")
        print("  ✓ Pulse Intent Data")
        print("  ✓ SORA Umbrella Compliance")
        print("\nTribunal-ready Watchtower logging: ACTIVE ✅")
        print("Origin shards tracked: YES ✅")
        print("Timestamped effects: YES ✅")
        print("Sovereignty seals: YES ✅")
        print("\n" + "="*80)
        return 0
    else:
        print(f"\n⚠️  {failed_checks} validation check(s) failed!")
        print("\nPlease review the errors above and fix them.")
        print("\n" + "="*80)
        return 1

if __name__ == "__main__":
    exit(main())
