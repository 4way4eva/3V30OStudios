#!/usr/bin/env python3
"""
Final Validation Script for Quarter-Law Visual Counters System

This script performs comprehensive validation of the entire system,
demonstrating all key features and verifying correct operation.
"""

import json
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'scripts'))

from quarter_law_visual_counters import QuarterLawVisualCounters


def validate_system():
    """Perform comprehensive system validation"""
    
    print("=" * 80)
    print("QUARTER-LAW VISUAL COUNTERS SYSTEM - FINAL VALIDATION")
    print("=" * 80)
    print()
    
    # Initialize system
    print("🔧 Initializing system...")
    system = QuarterLawVisualCounters()
    print("✅ System initialized")
    print()
    
    # Validate configuration
    print("📋 Validating Configuration:")
    print(f"  • π₄ Constant: {system.pi4}")
    print(f"  • Tipping Threshold: {system.tipping_threshold}x")
    print(f"  • Seconds per Quarter: {system.seconds_per_quarter:,}")
    print(f"  • Days per Quarter: {system.days_per_quarter}")
    print(f"  • Streams Configured: {len(system.stream_rates)}")
    print("✅ Configuration valid")
    print()
    
    # Validate quarterly counters
    print("📊 Validating Quarterly Counters:")
    counters = system.calculate_quarterly_counters(8)
    print(f"  • Total Counters Generated: {len(counters)}")
    print(f"  • Expected: {8 * 3} (8 quarters × 3 streams)")
    assert len(counters) == 24, "Counter count mismatch"
    
    # Check each quarter has all streams
    for q in range(1, 9):
        q_counters = [c for c in counters if c.quarter == q]
        assert len(q_counters) == 3, f"Quarter {q} missing streams"
        stream_names = {c.stream_name for c in q_counters}
        assert stream_names == {"Civilian", "Military", "Cosmic"}, f"Quarter {q} stream mismatch"
    
    print("✅ All quarterly counters valid")
    print()
    
    # Validate tipping detection
    print("🎯 Validating Tipping Point Detection:")
    tipping_points = system.detect_pi4_tipping_points(8)
    print(f"  • Tipping Points Analyzed: {len(tipping_points)}")
    
    # Q1 should be linear, Q2+ should be tipped
    assert tipping_points[0].phase == "linear", "Q1 should be linear phase"
    assert not tipping_points[0].all_streams_tipped, "Q1 should not be tipped"
    
    assert tipping_points[1].phase == "exponential", "Q2 should be exponential phase"
    assert tipping_points[1].all_streams_tipped, "Q2 should be tipped"
    
    assert tipping_points[2].phase == "hyperbolic", "Q3 should be hyperbolic phase"
    
    print(f"  • Q1: {tipping_points[0].phase} ⏳")
    print(f"  • Q2: {tipping_points[1].phase} ✅ (Factor: {tipping_points[1].tipping_factor:.2f}x)")
    print(f"  • Q3: {tipping_points[2].phase} ✅ (Factor: {tipping_points[2].tipping_factor:.2f}x)")
    print("✅ Tipping detection working correctly")
    print()
    
    # Validate ledger alignment
    print("🔐 Validating Ledger Alignment:")
    alignments = system.verify_physical_ledger_alignment(8)
    print(f"  • Total Verifications: {len(alignments)}")
    
    aligned_count = sum(1 for a in alignments if a.aligned)
    alignment_rate = (aligned_count / len(alignments)) * 100
    
    print(f"  • Aligned: {aligned_count}")
    print(f"  • Alignment Rate: {alignment_rate:.2f}%")
    
    # Check all are within tolerance
    for a in alignments:
        assert a.variance_percentage <= 0.01, f"Q{a.quarter} {a.stream_name} variance too high"
    
    print("✅ All alignments verified within tolerance")
    print()
    
    # Validate cumulative calculations
    print("📈 Validating Cumulative Calculations:")
    civilian_counters = [c for c in counters if c.stream_name == "Civilian"]
    civilian_counters.sort(key=lambda x: x.quarter)
    
    # Q1 cumulative should equal compounded (no prior quarters)
    assert abs(civilian_counters[0].cumulative_from_start - 
               civilian_counters[0].compounded_yield_usd) < 1.0, "Q1 cumulative mismatch"
    
    # Q2 cumulative should be sum of Q1 and Q2 compounded
    expected_q2_cumulative = (
        civilian_counters[0].compounded_yield_usd + 
        civilian_counters[1].compounded_yield_usd
    )
    rel_diff = abs(civilian_counters[1].cumulative_from_start - expected_q2_cumulative) / expected_q2_cumulative
    assert rel_diff < 0.001, "Q2 cumulative calculation error"
    
    print(f"  • Q1 Cumulative: ${civilian_counters[0].cumulative_from_start:,.0f}")
    print(f"  • Q2 Cumulative: ${civilian_counters[1].cumulative_from_start:,.0f}")
    print(f"  • Calculation verified")
    print("✅ Cumulative calculations accurate")
    print()
    
    # Validate sovereign time arcs
    print("🌀 Validating Sovereign Time Arcs:")
    dashboard = system.generate_visual_counter_dashboard()
    arcs = dashboard["sovereign_time_arcs"]
    
    print(f"  • Total Arcs: {len(arcs)}")
    
    # Check arc structure
    for arc_id, arc_data in arcs.items():
        assert arc_data["duration_days"] == 92, f"{arc_id} duration incorrect"
        assert arc_data["duration_seconds"] == 7_948_800, f"{arc_id} seconds incorrect"
    
    # Check Q1 arc
    arc_q01 = arcs["ARC-Q01"]
    assert arc_q01["start_day"] == 1, "ARC-Q01 start incorrect"
    assert arc_q01["end_day"] == 92, "ARC-Q01 end incorrect"
    assert arc_q01["sovereign_phase"] == "Foundation Phase", "ARC-Q01 phase incorrect"
    
    # Check Q2 arc
    arc_q02 = arcs["ARC-Q02"]
    assert arc_q02["start_day"] == 93, "ARC-Q02 start incorrect"
    assert arc_q02["sovereign_phase"] == "Exponential Ascension", "ARC-Q02 phase incorrect"
    
    print(f"  • {arc_q01['epoch_marker']}: {arc_q01['sovereign_phase']}")
    print(f"  • {arc_q02['epoch_marker']}: {arc_q02['sovereign_phase']}")
    print("✅ Sovereign time arcs correctly mapped")
    print()
    
    # Validate dashboard structure
    print("💾 Validating Dashboard Structure:")
    assert "metadata" in dashboard, "Missing metadata"
    assert "stream_configurations" in dashboard, "Missing stream configurations"
    assert "quarterly_counters" in dashboard, "Missing quarterly counters"
    assert "ledger_alignments" in dashboard, "Missing ledger alignments"
    assert "tipping_points" in dashboard, "Missing tipping points"
    assert "cumulative_analytics" in dashboard, "Missing cumulative analytics"
    assert "sovereign_time_arcs" in dashboard, "Missing sovereign time arcs"
    
    print(f"  • All required sections present")
    print(f"  • Version: {dashboard['metadata']['version']}")
    print(f"  • System: {dashboard['metadata']['system']}")
    print("✅ Dashboard structure complete")
    print()
    
    # Validate analytics
    print("📊 Validating Cumulative Analytics:")
    analytics = dashboard["cumulative_analytics"]
    
    for stream_name in ["Civilian", "Military", "Cosmic"]:
        assert stream_name in analytics, f"Missing analytics for {stream_name}"
        assert analytics[stream_name]["first_tipping_quarter"] == 2, \
            f"{stream_name} tipping quarter incorrect"
        assert analytics[stream_name]["quarters_analyzed"] == 8, \
            f"{stream_name} quarter count incorrect"
        
        print(f"  • {stream_name}: Q{analytics[stream_name]['first_tipping_quarter']} tipping, "
              f"${analytics[stream_name]['total_cumulative_8q']:,.0f} total")
    
    print("✅ Analytics validated")
    print()
    
    # Final summary
    print("=" * 80)
    print("✅ VALIDATION COMPLETE - ALL TESTS PASSED")
    print("=" * 80)
    print()
    print("Summary:")
    print(f"  ✅ System initialization successful")
    print(f"  ✅ 24/24 quarterly counters generated correctly")
    print(f"  ✅ Tipping detection working (Q2 @ {tipping_points[1].tipping_factor:.2f}x)")
    print(f"  ✅ Ledger alignment verified ({aligned_count}/{len(alignments)} = {alignment_rate:.0f}%)")
    print(f"  ✅ Cumulative calculations accurate")
    print(f"  ✅ Sovereign time arcs mapped (8 arcs)")
    print(f"  ✅ Dashboard structure complete")
    print(f"  ✅ Analytics validated (3 streams)")
    print()
    print("🎉 Quarter-Law Visual Counters System is OPERATIONAL!")
    print()
    
    return True


def main():
    """Main execution"""
    try:
        success = validate_system()
        return 0 if success else 1
    except AssertionError as e:
        print(f"\n❌ VALIDATION FAILED: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
