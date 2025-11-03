#!/usr/bin/env python3
"""
Test suite for π⁴ Quarter-Lattice Dashboard
Validates calculations and data integrity
"""

import json
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from pi4_quarter_lattice_engine import Pi4QuarterLatticeEngine


def test_per_second_yields():
    """Test per-second yield calculations."""
    print("Testing per-second yields...")
    engine = Pi4QuarterLatticeEngine()
    current = engine.calculate_per_second_yield()
    
    assert current["total_per_second"] == 28900000, "Total per-second yield mismatch"
    assert "civilian" in current["streams"], "Missing civilian stream"
    assert "military" in current["streams"], "Missing military stream"
    assert "cosmic" in current["streams"], "Missing cosmic stream"
    
    print("  ✅ Per-second yields validated")


def test_daily_yields():
    """Test daily yield calculations."""
    print("Testing daily yields...")
    engine = Pi4QuarterLatticeEngine()
    daily = engine.calculate_daily_yield(1)
    
    expected_daily = 28900000 * 86400  # per_second * seconds_per_day
    assert daily["total_daily"] == expected_daily, "Daily total mismatch"
    
    print("  ✅ Daily yields validated")


def test_quarter_trace():
    """Test quarter yield trace generation."""
    print("Testing quarter trace...")
    engine = Pi4QuarterLatticeEngine()
    trace = engine.calculate_quarter_yield_trace(90)
    
    assert len(trace) == 90, f"Expected 90 days, got {len(trace)}"
    assert trace[0]["day"] == 1, "First day should be 1"
    assert trace[-1]["day"] == 90, "Last day should be 90"
    
    # Check cumulative growth (linear accumulation within quarter, not compounded)
    # Day 1 cumulative = 1 day of yield
    # Day 90 cumulative = 90 days of yield (sum of daily yields)
    day1_total = trace[0]["total_cumulative"]
    day90_total = trace[-1]["total_cumulative"]
    # Within a quarter, yields accumulate linearly (compounding happens between quarters)
    expected_day90 = day1_total * 90
    assert day90_total == expected_day90, f"Cumulative totals incorrect: {day90_total} vs {expected_day90}"
    
    print("  ✅ Quarter trace validated")


def test_pi4_compounding():
    """Test π⁴ compounding calculations."""
    print("Testing π⁴ compounding...")
    engine = Pi4QuarterLatticeEngine()
    projection = engine.calculate_pi4_compounding(4)
    
    assert len(projection) == 4, f"Expected 4 quarters, got {len(projection)}"
    
    # Verify compounding factor
    q1_yield = projection[0]["quarter_yield_usd"]
    q2_yield = projection[1]["quarter_yield_usd"]
    
    expected_ratio = engine.pi4
    actual_ratio = q2_yield / q1_yield
    
    # Allow small floating point error
    assert abs(actual_ratio - expected_ratio) < 0.01, f"π⁴ ratio incorrect: {actual_ratio} vs {expected_ratio}"
    
    print("  ✅ π⁴ compounding validated")


def test_bleu_sector_allocation():
    """Test BLEU sector allocation calculations."""
    print("Testing BLEU sector allocations...")
    engine = Pi4QuarterLatticeEngine()
    
    test_amount = 1_000_000_000_000  # $1 Trillion
    allocation = engine.calculate_bleu_sector_allocation(test_amount)
    
    assert len(allocation) == 8, f"Expected 8 sectors, got {len(allocation)}"
    
    # Check that each sector has subsectors
    for sector_name, sector_data in allocation.items():
        assert "subsectors" in sector_data, f"Missing subsectors in {sector_name}"
        assert "symbol" in sector_data, f"Missing symbol in {sector_name}"
        assert "vault_id" in sector_data, f"Missing vault_id in {sector_name}"
        
        # Verify subsector percentages sum to 100%
        subsectors = sector_data["subsectors"]
        total_percent = sum(s["percent"] for s in subsectors.values())
        assert abs(total_percent - 100.0) < 0.01, f"Sector {sector_name} percentages don't sum to 100%"
    
    print("  ✅ BLEU sector allocations validated")


def test_json_files_validity():
    """Test that all JSON configuration files are valid."""
    print("Testing JSON file validity...")
    
    json_files = [
        "data/METAVAULT_config.json",
        "data/BLEU_FLOWMAP.json",
        "data/PPPPI_layers.json",
        "data/pi4_dashboard_data.json"
    ]
    
    for filepath in json_files:
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                assert isinstance(data, dict), f"{filepath} root should be a dictionary"
                print(f"  ✅ {filepath} is valid")
        except json.JSONDecodeError as e:
            raise AssertionError(f"{filepath} has invalid JSON: {e}")
        except FileNotFoundError:
            raise AssertionError(f"{filepath} not found")


def test_dashboard_data_structure():
    """Test dashboard data has expected structure."""
    print("Testing dashboard data structure...")
    
    with open("data/pi4_dashboard_data.json", 'r') as f:
        data = json.load(f)
    
    required_keys = [
        "generated_at",
        "current_yields",
        "today_yield",
        "pi4_projection",
        "bleu_sector_allocations",
        "ppppi_layers",
        "infrastructure",
        "meta"
    ]
    
    for key in required_keys:
        assert key in data, f"Missing required key: {key}"
    
    # Check pi4_projection has 4 quarters
    assert len(data["pi4_projection"]) == 4, "Should have 4 quarters in projection"
    
    # Check infrastructure has evol_malls and safe_haven_cities
    infra = data["infrastructure"]
    assert "evol_malls" in infra, "Missing evol_malls"
    assert "safe_haven_cities" in infra, "Missing safe_haven_cities"
    
    print("  ✅ Dashboard data structure validated")


def test_ppppi_layers():
    """Test PPPPI layers configuration."""
    print("Testing PPPPI layers...")
    
    with open("data/PPPPI_layers.json", 'r') as f:
        data = json.load(f)
    
    layers = data.get("ppppi_layers", {})
    expected_layers = [
        "infinity_core",
        "assurance_layer",
        "knowledge_layer",
        "weapons_layer",
        "meds_layer",
        "transport_layer"
    ]
    
    for layer_name in expected_layers:
        assert layer_name in layers, f"Missing layer: {layer_name}"
        layer = layers[layer_name]
        assert "symbol" in layer, f"Missing symbol in {layer_name}"
        assert "name" in layer, f"Missing name in {layer_name}"
        assert "description" in layer, f"Missing description in {layer_name}"
    
    print("  ✅ PPPPI layers validated")


def run_all_tests():
    """Run all test functions."""
    print("\n" + "=" * 70)
    print("π⁴ Quarter-Lattice Dashboard Test Suite")
    print("=" * 70 + "\n")
    
    tests = [
        test_per_second_yields,
        test_daily_yields,
        test_quarter_trace,
        test_pi4_compounding,
        test_bleu_sector_allocation,
        test_json_files_validity,
        test_dashboard_data_structure,
        test_ppppi_layers
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            test_func()
            passed += 1
        except AssertionError as e:
            print(f"  ❌ FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"  ❌ ERROR: {e}")
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("=" * 70 + "\n")
    
    if failed > 0:
        sys.exit(1)
    else:
        print("🌀 All tests passed! Dashboard system validated.")
        sys.exit(0)


if __name__ == "__main__":
    run_all_tests()
