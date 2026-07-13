#!/usr/bin/env python3
"""
Test suite for Advanced π⁴ Compounding Mechanics
Validates enhanced features, fail-safes, and visual indicators
"""

import json
import sys
import math
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from pi4_advanced_compounding import (
    Pi4AdvancedCompounding,
    GrowthPhase,
    CompoundingCurve
)


def test_growth_phase_detection():
    """Test growth phase detection logic."""
    print("Testing growth phase detection...")
    engine = Pi4AdvancedCompounding()
    
    # Test base phase
    phase = engine.calculate_growth_phase(0.5)
    assert phase == GrowthPhase.BASE, "Should be BASE phase for low multiplier"
    
    # Test acceleration phase
    phase = engine.calculate_growth_phase(10.0)
    assert phase == GrowthPhase.ACCELERATION, "Should be ACCELERATION phase"
    
    # Test overscale phase
    phase = engine.calculate_growth_phase(50.0)
    assert phase == GrowthPhase.OVERSCALE, "Should be OVERSCALE phase"
    
    # Test sovereign override
    engine.enable_sovereign_override("Test override")
    phase = engine.calculate_growth_phase(1.0)
    assert phase == GrowthPhase.SOVEREIGN, "Should be SOVEREIGN phase when override active"
    engine.disable_sovereign_override()
    
    print("  ✅ Growth phase detection validated")


def test_compounding_curves():
    """Test non-linear compounding curves."""
    print("Testing compounding curves...")
    engine = Pi4AdvancedCompounding()
    
    base_value = 1000000
    
    # Test at different time factors
    for time_factor in [0.25, 0.5, 0.75, 1.0]:
        # Test linear curve
        linear = engine.apply_curve(base_value, CompoundingCurve.LINEAR, time_factor)
        assert linear >= base_value, f"Linear curve should not decrease value at t={time_factor}"
        
        # Test exponential curve
        exponential = engine.apply_curve(base_value, CompoundingCurve.EXPONENTIAL, time_factor)
        expected_exp = base_value * math.pow(engine.pi4, time_factor)
        assert abs(exponential - expected_exp) < 1, f"Exponential curve calculation error at t={time_factor}"
        
        # Test sigmoid curve
        sigmoid = engine.apply_curve(base_value, CompoundingCurve.SIGMOID, time_factor)
        assert sigmoid >= base_value, f"Sigmoid curve should not decrease value at t={time_factor}"
        
        # Test hyperbolic curve
        hyperbolic = engine.apply_curve(base_value, CompoundingCurve.HYPERBOLIC, time_factor)
        assert hyperbolic >= base_value, f"Hyperbolic curve should not decrease value at t={time_factor}"
    
    # At full time (t=1.0), exponential should match pi4 factor exactly
    exponential_full = engine.apply_curve(base_value, CompoundingCurve.EXPONENTIAL, 1.0)
    expected_full = base_value * engine.pi4
    assert abs(exponential_full - expected_full) < 1, "Exponential at t=1.0 should equal base * pi4"
    
    print("  ✅ Compounding curves validated")


def test_fail_safe_mechanisms():
    """Test fail-safe bounds and logging."""
    print("Testing fail-safe mechanisms...")
    engine = Pi4AdvancedCompounding()
    
    # Test max bound
    excessive_rate = 300.0
    bounded = engine.apply_fail_safe(excessive_rate, "test_max")
    assert bounded == engine.max_growth_rate, "Should apply max bound"
    assert len(engine.acceleration_log) > 0, "Should log fail-safe trigger"
    
    # Test min bound
    engine.acceleration_log = []  # Reset log
    low_rate = 0.5
    bounded = engine.apply_fail_safe(low_rate, "test_min")
    assert bounded == engine.min_growth_rate, "Should apply min bound"
    assert len(engine.acceleration_log) > 0, "Should log fail-safe trigger"
    
    # Test within bounds (no change)
    engine.acceleration_log = []  # Reset log
    normal_rate = 50.0
    bounded = engine.apply_fail_safe(normal_rate, "test_normal")
    assert bounded == normal_rate, "Should not change rate within bounds"
    assert len(engine.acceleration_log) == 0, "Should not log when within bounds"
    
    # Test with fail-safe disabled
    engine.fail_safe_enabled = False
    unbounded = engine.apply_fail_safe(excessive_rate, "test_disabled")
    assert unbounded == excessive_rate, "Should not bound when fail-safe disabled"
    engine.fail_safe_enabled = True
    
    print("  ✅ Fail-safe mechanisms validated")


def test_quarter_segment_calculation():
    """Test quarter segment yield calculations."""
    print("Testing quarter segment calculations...")
    engine = Pi4AdvancedCompounding()
    
    # Test Q1:S1 (first segment, should be base)
    seg = engine.calculate_quarter_segment_yield(1, 1, CompoundingCurve.SIGMOID)
    assert seg["quarter"] == 1, "Quarter should be 1"
    assert seg["segment"] == 1, "Segment should be 1"
    assert seg["segment_label"] == "Q1:S1", "Label should be Q1:S1"
    assert seg["growth_phase"] == GrowthPhase.BASE.value, "Should be BASE phase"
    assert "streams" in seg, "Should have streams data"
    assert "civilian" in seg["streams"], "Should have civilian stream"
    assert "visual_indicators" in seg, "Should have visual indicators"
    
    # Test Q2:S1 (should have π⁴ multiplier applied)
    seg_q2 = engine.calculate_quarter_segment_yield(2, 1, CompoundingCurve.SIGMOID)
    assert seg_q2["multiplier"] > seg["multiplier"], "Q2 should have higher multiplier than Q1"
    assert seg_q2["total_yield_usd"] > seg["total_yield_usd"], "Q2 should have higher yield than Q1"
    
    # Test segment progression within quarter
    seg_s1 = engine.calculate_quarter_segment_yield(1, 1, CompoundingCurve.SIGMOID)
    seg_s4 = engine.calculate_quarter_segment_yield(1, 4, CompoundingCurve.SIGMOID)
    assert seg_s4["total_yield_usd"] > seg_s1["total_yield_usd"], "S4 should have higher yield than S1"
    
    # Test delta calculation
    seg_with_delta = engine.calculate_quarter_segment_yield(1, 2, CompoundingCurve.SIGMOID)
    assert seg_with_delta["delta_usd"] != 0, "Should have non-zero delta"
    assert seg_with_delta["delta_percent"] > 0, "Should have positive delta percent"
    
    print("  ✅ Quarter segment calculations validated")


def test_visual_indicators():
    """Test visual indicator generation."""
    print("Testing visual indicators...")
    engine = Pi4AdvancedCompounding()
    
    # Test base phase indicators
    indicators = engine._generate_visual_indicators(GrowthPhase.BASE, 1.0, 5.0)
    assert indicators["phase_icon"] == "🟢", "BASE should have green icon"
    assert "▰" in indicators["speed_bar"], "Should have speed bar"
    assert indicators["delta_icon"] in ["⬆️", "⏫"], "Should have delta icon"
    
    # Test overscale phase indicators
    indicators = engine._generate_visual_indicators(GrowthPhase.OVERSCALE, 100.0, 150.0)
    assert indicators["phase_icon"] == "🔴", "OVERSCALE should have red icon"
    assert indicators["speed_bar"] == "▰▰▰▰▰", "Should show max speed"
    assert indicators["delta_icon"] == "⏫⏫⏫", "Should show high delta"
    
    # Test speed indicator calculation
    speed = engine._calculate_speed_indicator(1, 1, "civilian")
    assert speed in ["▸", "▸▸", "▸▸▸", "▸▸▸▸"], "Speed indicator should be valid"
    
    # Test that higher quarters have faster speed indicators
    speed_q1 = engine._calculate_speed_indicator(1, 1, "civilian")
    speed_q4 = engine._calculate_speed_indicator(4, 4, "civilian")
    assert len(speed_q4) >= len(speed_q1), "Q4 should have equal or more speed arrows"
    
    print("  ✅ Visual indicators validated")


def test_full_year_simulation():
    """Test full year quarter simulation."""
    print("Testing full year simulation...")
    engine = Pi4AdvancedCompounding()
    
    simulation = engine.simulate_full_year_quarters(4, CompoundingCurve.SIGMOID)
    
    # Should have 16 segments (4 quarters × 4 segments)
    assert len(simulation) == 16, f"Should have 16 segments, got {len(simulation)}"
    
    # Check segment progression
    assert simulation[0]["segment_label"] == "Q1:S1", "First should be Q1:S1"
    assert simulation[15]["segment_label"] == "Q4:S4", "Last should be Q4:S4"
    
    # Check monotonic growth
    for i in range(1, len(simulation)):
        prev_yield = simulation[i-1]["total_yield_usd"]
        curr_yield = simulation[i]["total_yield_usd"]
        assert curr_yield >= prev_yield, f"Yield should not decrease at segment {i}"
    
    # Check all segments have required fields
    required_fields = ["quarter", "segment", "segment_label", "total_yield_usd",
                      "growth_phase", "streams", "visual_indicators"]
    for seg in simulation:
        for field in required_fields:
            assert field in seg, f"Missing field {field} in segment"
    
    print("  ✅ Full year simulation validated")


def test_acceleration_report():
    """Test growth acceleration report generation."""
    print("Testing acceleration report...")
    engine = Pi4AdvancedCompounding()
    
    report = engine.generate_acceleration_report(4)
    
    # Check report structure
    assert "report_type" in report, "Should have report_type"
    assert report["report_type"] == "growth_acceleration", "Should be growth_acceleration report"
    assert "daily_acceleration" in report, "Should have daily acceleration"
    assert "weekly_acceleration" in report, "Should have weekly acceleration"
    assert "quarterly_acceleration" in report, "Should have quarterly acceleration"
    assert "fail_safe_log" in report, "Should have fail_safe_log"
    assert "sovereign_override_status" in report, "Should have sovereign override status"
    
    # Check daily acceleration has correct number of entries (16 segments)
    assert len(report["daily_acceleration"]) == 16, "Should have 16 daily entries"
    
    # Check weekly acceleration has correct number of entries
    assert len(report["weekly_acceleration"]) == 16, "Should have 16 weekly entries"
    
    # Check quarterly acceleration has correct number of entries
    assert len(report["quarterly_acceleration"]) == 4, "Should have 4 quarterly entries"
    
    # Check quarterly acceleration shows growth
    for i in range(1, len(report["quarterly_acceleration"])):
        # Q2+ should show positive acceleration from compounding
        assert report["quarterly_acceleration"][i]["acceleration_percent"] > 0, \
            f"Q{i+1} should show positive acceleration"
    
    print("  ✅ Acceleration report validated")


def test_asset_logic_encoding():
    """Test π⁴-based asset logic encoding."""
    print("Testing asset logic encoding...")
    engine = Pi4AdvancedCompounding()
    
    asset_logic = engine.encode_pi4_asset_logic(4)
    
    # Check structure
    assert "asset_type" in asset_logic, "Should have asset_type"
    assert asset_logic["asset_type"] == "PI4_COMPOUND_STREAM", "Should be PI4_COMPOUND_STREAM"
    assert "compounding_factor" in asset_logic, "Should have compounding_factor"
    assert asset_logic["compounding_factor"] == engine.pi4, "Factor should match engine"
    assert "economic_predictability" in asset_logic, "Should have economic_predictability"
    assert "quarter_segments" in asset_logic, "Should have quarter_segments"
    assert "stream_vectors" in asset_logic, "Should have stream_vectors"
    
    # Check economic predictability certification
    econ_pred = asset_logic["economic_predictability"]
    assert econ_pred["certified"] == True, "Should be certified"
    assert econ_pred["fail_safe_enabled"] == True, "Should show fail_safe enabled"
    
    # Check quarter segments
    segments = asset_logic["quarter_segments"]
    assert len(segments) == 16, "Should have 16 encoded segments"
    
    for seg in segments:
        assert "id" in seg, "Segment should have id"
        assert seg["id"].startswith("SEGMENT::"), "ID should have SEGMENT prefix"
        assert "yield_usd" in seg, "Segment should have yield_usd"
        assert "growth_phase" in seg, "Segment should have growth_phase"
        assert "visual_indicators" in seg, "Segment should have visual_indicators"
        assert "timestamp_range" in seg, "Segment should have timestamp_range"
    
    # Check stream vectors
    vectors = asset_logic["stream_vectors"]
    assert "civilian" in vectors, "Should have civilian vector"
    assert "military" in vectors, "Should have military vector"
    assert "cosmic" in vectors, "Should have cosmic vector"
    
    for stream_name, vector in vectors.items():
        assert len(vector) == 16, f"{stream_name} vector should have 16 entries"
        for entry in vector:
            assert "segment_label" in entry, "Entry should have segment_label"
            assert "yield_usd" in entry, "Entry should have yield_usd"
            assert "speed_indicator" in entry, "Entry should have speed_indicator"
    
    print("  ✅ Asset logic encoding validated")


def test_sovereign_override():
    """Test sovereign override functionality."""
    print("Testing sovereign override...")
    engine = Pi4AdvancedCompounding()
    
    # Check initial state
    assert engine.sovereign_override_active == False, "Should start inactive"
    
    # Enable override
    initial_log_size = len(engine.acceleration_log)
    engine.enable_sovereign_override("Test activation")
    assert engine.sovereign_override_active == True, "Should be active after enable"
    assert len(engine.acceleration_log) > initial_log_size, "Should log activation"
    
    # Check that growth phase returns SOVEREIGN when override active
    phase = engine.calculate_growth_phase(1.0)
    assert phase == GrowthPhase.SOVEREIGN, "Should return SOVEREIGN phase"
    
    # Disable override
    initial_log_size = len(engine.acceleration_log)
    engine.disable_sovereign_override()
    assert engine.sovereign_override_active == False, "Should be inactive after disable"
    assert len(engine.acceleration_log) > initial_log_size, "Should log deactivation"
    
    # Check that growth phase returns normal after disable
    phase = engine.calculate_growth_phase(1.0)
    assert phase == GrowthPhase.BASE, "Should return BASE phase after override disabled"
    
    print("  ✅ Sovereign override validated")


def test_export_functions():
    """Test data export functionality."""
    print("Testing export functions...")
    engine = Pi4AdvancedCompounding()
    
    # Export data
    output_dir = Path(".")
    engine.export_simulation_data(4, str(output_dir))
    
    # Check files exist
    files = [
        "pi4_advanced_simulation.json",
        "pi4_acceleration_report.json",
        "pi4_asset_logic.json",
        "pi4_quarter_segments_visual.csv"
    ]
    
    for filename in files:
        filepath = output_dir / filename
        assert filepath.exists(), f"{filename} should exist"
    
    # Validate JSON files
    with open("pi4_advanced_simulation.json", 'r') as f:
        sim_data = json.load(f)
        assert isinstance(sim_data, list), "Simulation data should be list"
        assert len(sim_data) == 16, "Should have 16 segments"
    
    with open("pi4_acceleration_report.json", 'r') as f:
        report_data = json.load(f)
        assert isinstance(report_data, dict), "Report data should be dict"
        assert "report_type" in report_data, "Should have report_type"
    
    with open("pi4_asset_logic.json", 'r') as f:
        asset_data = json.load(f)
        assert isinstance(asset_data, dict), "Asset logic should be dict"
        assert "asset_type" in asset_data, "Should have asset_type"
    
    print("  ✅ Export functions validated")


def test_stream_specific_data():
    """Test stream-specific yield data."""
    print("Testing stream-specific data...")
    engine = Pi4AdvancedCompounding()
    
    seg = engine.calculate_quarter_segment_yield(1, 1, CompoundingCurve.SIGMOID)
    streams = seg["streams"]
    
    # Check all three streams exist
    assert "civilian" in streams, "Should have civilian stream"
    assert "military" in streams, "Should have military stream"
    assert "cosmic" in streams, "Should have cosmic stream"
    
    # Check stream data structure
    for stream_name, stream_data in streams.items():
        assert "yield_usd" in stream_data, f"{stream_name} should have yield_usd"
        assert "name" in stream_data, f"{stream_name} should have name"
        assert "icon" in stream_data, f"{stream_name} should have icon"
        assert "color" in stream_data, f"{stream_name} should have color"
        assert "speed_indicator" in stream_data, f"{stream_name} should have speed_indicator"
    
    # Check proportions sum to total
    total_from_streams = sum(s["yield_usd"] for s in streams.values())
    assert abs(total_from_streams - seg["total_yield_usd"]) < 1, \
        "Stream yields should sum to total (within floating point error)"
    
    print("  ✅ Stream-specific data validated")


def run_all_tests():
    """Run all test functions."""
    print("\n" + "=" * 70)
    print("Advanced π⁴ Compounding Mechanics Test Suite")
    print("=" * 70 + "\n")
    
    tests = [
        test_growth_phase_detection,
        test_compounding_curves,
        test_fail_safe_mechanisms,
        test_quarter_segment_calculation,
        test_visual_indicators,
        test_full_year_simulation,
        test_acceleration_report,
        test_asset_logic_encoding,
        test_sovereign_override,
        test_export_functions,
        test_stream_specific_data
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
            import traceback
            traceback.print_exc()
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("=" * 70 + "\n")
    
    if failed > 0:
        sys.exit(1)
    else:
        print("🌀 All advanced tests passed! Enhanced system validated.")
        sys.exit(0)


if __name__ == "__main__":
    run_all_tests()
