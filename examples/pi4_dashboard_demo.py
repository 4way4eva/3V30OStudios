#!/usr/bin/env python3
"""
Interactive π⁴ Compounding Dashboard Example
Demonstrates all advanced features with visual output
"""

import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pi4_advanced_compounding import Pi4AdvancedCompounding, CompoundingCurve, GrowthPhase


def print_header(title):
    """Print formatted section header."""
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def print_segment_detail(segment, show_streams=True):
    """Print detailed segment information with visual indicators."""
    vi = segment["visual_indicators"]
    
    print(f"\n{vi['phase_icon']} {segment['segment_label']} | {segment['growth_phase'].upper()}")
    print(f"{'─' * 70}")
    print(f"   💰 Total Yield:     ${segment['total_yield_usd']:>20,.2f}")
    print(f"   📊 Multiplier:      {vi['multiplier_display']:>20}")
    print(f"   ⚡ Speed:           {vi['speed_bar']:>20}")
    print(f"   📈 Delta:           {vi['delta_icon']} {segment['delta_percent']:>8.2f}%")
    
    if show_streams:
        print(f"\n   Stream Breakdown:")
        for stream_name, stream_data in segment["streams"].items():
            icon = stream_data["icon"]
            name = stream_data["name"]
            yield_val = stream_data["yield_usd"]
            speed = stream_data["speed_indicator"]
            print(f"     {icon} {name:40s} ${yield_val:>20,.2f} {speed}")


def demo_basic_simulation():
    """Demonstrate basic quarter segment simulation."""
    print_header("🌀 BASIC QUARTER SEGMENT SIMULATION")
    
    engine = Pi4AdvancedCompounding()
    
    print("\n📊 Simulating 4 quarters with SIGMOID curve...")
    simulation = engine.simulate_full_year_quarters(4, CompoundingCurve.SIGMOID)
    
    # Show first segment of each quarter
    print("\n🎯 First Segment of Each Quarter:")
    for q in range(1, 5):
        seg = simulation[(q-1) * 4]  # First segment of quarter q
        print_segment_detail(seg, show_streams=False)
    
    # Show phase transitions
    print("\n\n🔄 Growth Phase Transitions:")
    current_phase = None
    for seg in simulation:
        if seg["growth_phase"] != current_phase:
            current_phase = seg["growth_phase"]
            phase_icons = {
                "base": "🟢",
                "acceleration": "🟡",
                "overscale": "🔴",
                "sovereign_override": "👑"
            }
            icon = phase_icons.get(current_phase, "❓")
            print(f"   {icon} {seg['segment_label']}: Entering {current_phase.upper()} phase")


def demo_curve_comparison():
    """Compare different compounding curves."""
    print_header("📈 COMPOUNDING CURVE COMPARISON")
    
    engine = Pi4AdvancedCompounding()
    
    curves = [
        CompoundingCurve.LINEAR,
        CompoundingCurve.EXPONENTIAL,
        CompoundingCurve.SIGMOID,
        CompoundingCurve.HYPERBOLIC
    ]
    
    print("\n🎯 Q2:S4 Yields by Curve Type:\n")
    
    for curve in curves:
        seg = engine.calculate_quarter_segment_yield(2, 4, curve)
        print(f"   {curve.value:15s}: ${seg['total_yield_usd']:>25,.2f}")


def demo_acceleration_report():
    """Demonstrate growth acceleration reporting."""
    print_header("📊 GROWTH ACCELERATION REPORT")
    
    engine = Pi4AdvancedCompounding()
    report = engine.generate_acceleration_report(4)
    
    print("\n⏰ Quarterly Acceleration Rates:")
    print(f"{'Quarter':<10} {'Acceleration':<15} {'Phase':<20}")
    print("─" * 50)
    for qr in report["quarterly_acceleration"]:
        q = qr["quarter"]
        accel = qr["acceleration_percent"]
        phase = qr["growth_phase"]
        print(f"Q{q:<9} {accel:>12.2f}% {phase:>20}")
    
    print("\n\n📅 Daily Acceleration Sample (First Week):")
    print(f"{'Segment':<10} {'Acceleration':<15} {'Phase':<20}")
    print("─" * 50)
    for i in range(min(7, len(report["daily_acceleration"]))):
        dr = report["daily_acceleration"][i]
        seg = dr["segment_label"]
        accel = dr["acceleration_percent"]
        phase = dr["growth_phase"]
        print(f"{seg:<10} {accel:>12.2f}% {phase:>20}")


def demo_fail_safe_system():
    """Demonstrate fail-safe mechanisms."""
    print_header("🛡️ FAIL-SAFE SYSTEM DEMONSTRATION")
    
    engine = Pi4AdvancedCompounding()
    
    print("\n⚙️ Fail-Safe Configuration:")
    print(f"   Enabled:         {engine.fail_safe_enabled}")
    print(f"   Min Growth Rate: {engine.min_growth_rate}")
    print(f"   Max Growth Rate: {engine.max_growth_rate}")
    
    print("\n🧪 Testing Fail-Safe Triggers:")
    
    # Test excessive rate
    print("\n   Testing excessive rate (300.0):")
    excessive = 300.0
    bounded = engine.apply_fail_safe(excessive, "demo_excessive")
    print(f"   Input:  {excessive}")
    print(f"   Output: {bounded}")
    
    # Test low rate
    print("\n   Testing low rate (0.5):")
    low = 0.5
    bounded = engine.apply_fail_safe(low, "demo_low")
    print(f"   Input:  {low}")
    print(f"   Output: {bounded}")
    
    print("\n📋 Fail-Safe Log Entries:")
    for i, entry in enumerate(engine.acceleration_log[-2:], 1):  # Last 2 entries
        print(f"\n   Entry {i}:")
        print(f"   Type:     {entry['trigger_type']}")
        print(f"   Original: {entry['original_rate']:.4f}")
        print(f"   Bounded:  {entry['bounded_rate']:.4f}")
        print(f"   Override: {entry['sovereign_override_required']}")


def demo_sovereign_override():
    """Demonstrate sovereign override protocol."""
    print_header("👑 SOVEREIGN OVERRIDE PROTOCOL")
    
    engine = Pi4AdvancedCompounding()
    
    print("\n📡 Initial Status:")
    print(f"   Override Active: {engine.sovereign_override_active}")
    
    print("\n🔐 Activating Sovereign Override...")
    engine.enable_sovereign_override("Manual intervention for realignment")
    
    print("\n📊 Testing growth phase under override:")
    phase = engine.calculate_growth_phase(50.0)
    print(f"   Phase returned: {phase.value}")
    print(f"   (All phases return SOVEREIGN when override is active)")
    
    print("\n✅ Disabling Sovereign Override...")
    engine.disable_sovereign_override()
    
    print("\n📡 Final Status:")
    print(f"   Override Active: {engine.sovereign_override_active}")


def demo_visual_counters():
    """Demonstrate visual speed counters and deltas."""
    print_header("📊 VISUAL SPEED COUNTERS & DELTAS")
    
    engine = Pi4AdvancedCompounding()
    
    print("\n⚡ Compounding Speed Evolution:")
    print("\nShowing speed indicators across quarters:\n")
    
    segments_to_show = [0, 3, 7, 11, 15]  # Q1:S1, Q1:S4, Q2:S4, Q3:S4, Q4:S4
    simulation = engine.simulate_full_year_quarters(4)
    
    for idx in segments_to_show:
        seg = simulation[idx]
        vi = seg["visual_indicators"]
        
        print(f"{vi['phase_icon']} {seg['segment_label']}")
        print(f"   Speed Bar:  {vi['speed_bar']}")
        print(f"   Multiplier: {vi['multiplier_display']}")
        
        # Show stream-specific speeds
        for stream_name, stream_data in seg["streams"].items():
            print(f"      {stream_data['icon']} {stream_name}: {stream_data['speed_indicator']}")
        print()
    
    print("\n📈 Delta Progression (Base → Overscale):")
    print(f"{'Segment':<12} {'Delta %':<12} {'Delta Icon':<12} {'Phase'}")
    print("─" * 55)
    
    for idx in segments_to_show:
        seg = simulation[idx]
        vi = seg["visual_indicators"]
        print(f"{seg['segment_label']:<12} {seg['delta_percent']:>8.2f}% {vi['delta_icon']:>12} {seg['growth_phase']}")


def demo_asset_logic_export():
    """Demonstrate π⁴-based asset logic encoding."""
    print_header("💎 π⁴-BASED ASSET LOGIC ENCODING")
    
    engine = Pi4AdvancedCompounding()
    
    print("\n🔧 Encoding asset logic for 4 quarters...")
    asset_logic = engine.encode_pi4_asset_logic(4)
    
    print("\n📋 Asset Logic Summary:")
    print(f"   Asset Type:         {asset_logic['asset_type']}")
    print(f"   Version:            {asset_logic['version']}")
    print(f"   Compounding Factor: {asset_logic['compounding_factor']}")
    
    econ_pred = asset_logic["economic_predictability"]
    print(f"\n✅ Economic Predictability:")
    print(f"   Certified:          {econ_pred['certified']}")
    print(f"   Fail-Safe Enabled:  {econ_pred['fail_safe_enabled']}")
    print(f"   Override Protocol:  {econ_pred['sovereign_override_protocol']}")
    
    print(f"\n📊 Encoded Data:")
    print(f"   Quarter Segments:   {len(asset_logic['quarter_segments'])}")
    print(f"   Stream Vectors:     {len(asset_logic['stream_vectors'])}")
    
    print("\n💰 Sample Encoded Segment (Q2:S2):")
    sample_seg = asset_logic["quarter_segments"][5]  # Q2:S2
    print(f"   ID:          {sample_seg['id']}")
    print(f"   Yield USD:   ${sample_seg['yield_usd']:,.2f}")
    print(f"   Growth Phase: {sample_seg['growth_phase']}")
    print(f"   Multiplier:  {sample_seg['multiplier']:.2f}×")
    
    print("\n📈 Stream Vector Sample (Civilian, First 3 segments):")
    civilian_vector = asset_logic["stream_vectors"]["civilian"]
    for i in range(3):
        entry = civilian_vector[i]
        print(f"   {entry['segment_label']}: ${entry['yield_usd']:,.2f} {entry['speed_indicator']}")


def demo_complete_dashboard():
    """Show complete dashboard with all streams."""
    print_header("🌀 COMPLETE DASHBOARD - ALL STREAMS")
    
    engine = Pi4AdvancedCompounding()
    
    print("\n🎯 Current Configuration:")
    print(f"   π⁴ Factor:          {engine.pi4}")
    print(f"   Fail-Safe:          {'Enabled' if engine.fail_safe_enabled else 'Disabled'}")
    print(f"   Sovereign Override:  {'Active' if engine.sovereign_override_active else 'Inactive'}")
    
    # Show Q4:S4 (final segment) with full details
    simulation = engine.simulate_full_year_quarters(4)
    final_seg = simulation[-1]
    
    print("\n" + "▼" * 70)
    print("📊 FINAL QUARTER SEGMENT (Q4:S4) - COMPLETE BREAKDOWN")
    print("▲" * 70)
    
    print_segment_detail(final_seg, show_streams=True)
    
    # Summary metrics
    total_year = sum(seg["total_yield_usd"] for seg in simulation)
    print(f"\n\n💎 Annual Summary:")
    print(f"   Total Segments:     {len(simulation)}")
    print(f"   Total Year Yield:   ${total_year:,.2f}")
    print(f"   Final Multiplier:   {final_seg['multiplier']:.2f}×")
    print(f"   Final Phase:        {final_seg['growth_phase'].upper()}")


def main():
    """Run all demonstrations."""
    print("\n" + "🌀" * 35)
    print("   ADVANCED π⁴ COMPOUNDING MECHANICS")
    print("   Interactive Dashboard Demonstration")
    print("🌀" * 35)
    
    # Run all demos
    demo_basic_simulation()
    demo_curve_comparison()
    demo_acceleration_report()
    demo_fail_safe_system()
    demo_sovereign_override()
    demo_visual_counters()
    demo_asset_logic_export()
    demo_complete_dashboard()
    
    print("\n\n" + "=" * 70)
    print("✅ ALL DEMONSTRATIONS COMPLETE")
    print("=" * 70)
    print("\nAdvanced Features Demonstrated:")
    print("  ✓ Non-linear compounding curves")
    print("  ✓ Quarter segment visualization (4 per quarter)")
    print("  ✓ Fail-safe bounds and logging")
    print("  ✓ Sovereign override protocol")
    print("  ✓ Visual speed counters")
    print("  ✓ Growth phase deltas (base → overscale)")
    print("  ✓ Daily/Weekly/Quarterly acceleration reports")
    print("  ✓ π⁴-encoded asset logic")
    print("  ✓ Economic predictability certification")
    
    print("\n🌀 BLEUE ∞ GRID Treasury System - Enhanced Edition")
    print("   All mechanics operational and certified.\n")


if __name__ == "__main__":
    main()
