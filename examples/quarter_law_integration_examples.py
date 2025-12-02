#!/usr/bin/env python3
"""
Quarter-Law Visual Counters Integration Example

This example demonstrates how to integrate and use the Quarter-Law Visual Counters
system in other applications and scripts.
"""

import json
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'scripts'))

from quarter_law_visual_counters import QuarterLawVisualCounters


def example_basic_usage():
    """Example: Basic system usage"""
    print("=" * 80)
    print("Example 1: Basic System Usage")
    print("=" * 80)
    
    # Initialize the system
    system = QuarterLawVisualCounters()
    
    # Get quarterly counters for first 4 quarters
    counters = system.calculate_quarterly_counters(4)
    
    # Display summary
    print(f"\nGenerated {len(counters)} quarterly counters")
    print(f"Quarters analyzed: {max(c.quarter for c in counters)}")
    print(f"Streams tracked: {len(set(c.stream_name for c in counters))}")
    
    # Show Q1 data
    q1_counters = [c for c in counters if c.quarter == 1]
    print(f"\nQuarter 1 Summary:")
    for counter in q1_counters:
        print(f"  {counter.stream_name:10s}: ${counter.base_yield_usd:,.0f}")


def example_tipping_detection():
    """Example: Detect when tipping points occur"""
    print("\n" + "=" * 80)
    print("Example 2: Tipping Point Detection")
    print("=" * 80)
    
    system = QuarterLawVisualCounters()
    tipping_points = system.detect_pi4_tipping_points(8)
    
    print(f"\nAnalyzed {len(tipping_points)} quarters for tipping events\n")
    
    for tp in tipping_points:
        status = "✅ TIPPED" if tp.all_streams_tipped else "⏳ Linear"
        print(f"Q{tp.quarter} [{tp.time_arc:15s}]: {tp.phase:12s} - {status}")
        
        if tp.all_streams_tipped:
            print(f"     Tipping Factor: {tp.tipping_factor:.2f}x")
            print(f"     Acceleration: {tp.acceleration_rate:.2e}")


def example_ledger_verification():
    """Example: Verify ledger alignment"""
    print("\n" + "=" * 80)
    print("Example 3: Ledger Alignment Verification")
    print("=" * 80)
    
    system = QuarterLawVisualCounters()
    alignments = system.verify_physical_ledger_alignment(4)
    
    # Calculate alignment rate
    total = len(alignments)
    aligned = sum(1 for a in alignments if a.aligned)
    rate = (aligned / total) * 100
    
    print(f"\nAlignment Report:")
    print(f"  Total Verifications: {total}")
    print(f"  Aligned: {aligned}")
    print(f"  Alignment Rate: {rate:.2f}%")
    
    # Show any misalignments (if any)
    misaligned = [a for a in alignments if not a.aligned]
    if misaligned:
        print(f"\n⚠️  Found {len(misaligned)} misalignments:")
        for a in misaligned:
            print(f"  Q{a.quarter} {a.stream_name}: {a.variance_percentage:.4f}% variance")
    else:
        print("\n✅ All verifications aligned!")


def example_cumulative_tracking():
    """Example: Track cumulative yields"""
    print("\n" + "=" * 80)
    print("Example 4: Cumulative Yield Tracking")
    print("=" * 80)
    
    system = QuarterLawVisualCounters()
    
    # Get counters for 8 quarters
    counters = system.calculate_quarterly_counters(8)
    
    # Track civilian stream cumulative growth
    civilian = [c for c in counters if c.stream_name == "Civilian"]
    
    print(f"\nCivilian Stream Cumulative Growth:\n")
    print(f"{'Quarter':>8s} {'Compounded':>25s} {'Cumulative':>25s} {'Growth':>10s}")
    print("-" * 80)
    
    for c in civilian[:4]:  # Show first 4 quarters
        print(f"Q{c.quarter:>7d} ${c.compounded_yield_usd:>23,.0f} "
              f"${c.cumulative_from_start:>23,.0f} {c.growth_percentage:>9.1f}%")


def example_sovereign_time_arcs():
    """Example: Access sovereign time arc data"""
    print("\n" + "=" * 80)
    print("Example 5: Sovereign Time Arc Mapping")
    print("=" * 80)
    
    system = QuarterLawVisualCounters()
    dashboard = system.generate_visual_counter_dashboard()
    arcs = dashboard["sovereign_time_arcs"]
    
    print(f"\nSovereign Time Arc Map:\n")
    print(f"{'Arc ID':15s} {'Quarter':>8s} {'Days':>12s} {'Phase':25s}")
    print("-" * 80)
    
    for arc_id, arc_data in list(arcs.items())[:4]:  # Show first 4 arcs
        days_range = f"{arc_data['start_day']}-{arc_data['end_day']}"
        print(f"{arc_id:15s} Q{arc_data['quarter']:>7d} {days_range:>12s} "
              f"{arc_data['sovereign_phase']:25s}")


def example_json_export():
    """Example: Export and load JSON data"""
    print("\n" + "=" * 80)
    print("Example 6: JSON Data Export/Import")
    print("=" * 80)
    
    system = QuarterLawVisualCounters()
    
    # Generate dashboard
    dashboard = system.generate_visual_counter_dashboard()
    
    print(f"\nDashboard Structure:")
    for key, value in dashboard.items():
        if isinstance(value, list):
            print(f"  {key:25s}: {len(value)} items")
        elif isinstance(value, dict):
            print(f"  {key:25s}: {len(value)} keys")
        else:
            print(f"  {key:25s}: {type(value).__name__}")
    
    # Example: Access specific data
    print(f"\nMetadata:")
    print(f"  System: {dashboard['metadata']['system']}")
    print(f"  Version: {dashboard['metadata']['version']}")
    print(f"  Generated: {dashboard['metadata']['generated_at']}")
    
    # Example: Access stream configurations
    print(f"\nStream Configurations:")
    for stream_name, config in dashboard['stream_configurations'].items():
        print(f"  {stream_name.title():10s}: ${config['per_sec']:,}/sec ({config['code']})")


def example_filtering_data():
    """Example: Filter and analyze specific data"""
    print("\n" + "=" * 80)
    print("Example 7: Data Filtering and Analysis")
    print("=" * 80)
    
    system = QuarterLawVisualCounters()
    counters = system.calculate_quarterly_counters(8)
    
    # Filter: Find all quarters where tipping occurred
    tipped_counters = [c for c in counters if c.tipping_detected]
    
    # Group by stream
    by_stream = {}
    for c in tipped_counters:
        if c.stream_name not in by_stream:
            by_stream[c.stream_name] = []
        by_stream[c.stream_name].append(c)
    
    print(f"\nTipping Point Analysis:")
    for stream_name, stream_counters in by_stream.items():
        first_tipped = min(c.quarter for c in stream_counters)
        total_tipped = len(stream_counters)
        
        print(f"\n{stream_name} Stream:")
        print(f"  First Tipping: Q{first_tipped}")
        print(f"  Total Tipped Quarters: {total_tipped}")
        
        # Show progression
        if len(stream_counters) >= 3:
            print(f"  Growth Progression:")
            for c in stream_counters[:3]:
                print(f"    Q{c.quarter}: {c.compound_factor:.2f}x factor, "
                      f"{c.growth_percentage:.1f}% growth")


def example_custom_analysis():
    """Example: Custom analysis using the data"""
    print("\n" + "=" * 80)
    print("Example 8: Custom Analysis")
    print("=" * 80)
    
    system = QuarterLawVisualCounters()
    dashboard = system.generate_visual_counter_dashboard()
    
    # Calculate total system value at each quarter
    counters = dashboard['quarterly_counters']
    
    print(f"\nTotal System Value by Quarter:\n")
    
    for quarter in range(1, 5):  # First 4 quarters
        quarter_counters = [c for c in counters if c['quarter'] == quarter]
        total_compounded = sum(c['compounded_yield_usd'] for c in quarter_counters)
        total_cumulative = sum(c['cumulative_from_start'] for c in quarter_counters)
        
        print(f"Quarter {quarter}:")
        print(f"  Compounded Value: ${total_compounded:,.0f}")
        print(f"  Cumulative Value: ${total_cumulative:,.0f}")
        print()


def main():
    """Run all examples"""
    print("\n🌀 Quarter-Law Visual Counters Integration Examples")
    print("=" * 80)
    print("\nThese examples demonstrate how to use the Quarter-Law Visual Counters")
    print("system in your own applications and scripts.\n")
    
    # Run all examples
    example_basic_usage()
    example_tipping_detection()
    example_ledger_verification()
    example_cumulative_tracking()
    example_sovereign_time_arcs()
    example_json_export()
    example_filtering_data()
    example_custom_analysis()
    
    print("\n" + "=" * 80)
    print("✅ All examples completed successfully!")
    print("=" * 80)
    print("\nFor more information, see QUARTER_LAW_VISUAL_COUNTERS_README.md")
    print()


if __name__ == "__main__":
    main()
