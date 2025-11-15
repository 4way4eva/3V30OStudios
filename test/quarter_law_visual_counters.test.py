#!/usr/bin/env python3
"""
Unit Tests for Quarter-Law Visual Counters System
Tests cumulative tracking, ledger alignment, and tipping point detection
"""

import unittest
import json
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'scripts'))

from quarter_law_visual_counters import (
    QuarterLawVisualCounters,
    QuarterlyCounter,
    LedgerAlignment,
    Pi4TippingPoint
)


class TestQuarterLawVisualCounters(unittest.TestCase):
    """Test suite for Quarter-Law Visual Counters System"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.system = QuarterLawVisualCounters(output_dir="data/snapshots")
    
    def test_initialization(self):
        """Test system initialization"""
        self.assertIsNotNone(self.system)
        self.assertEqual(self.system.pi4, 97.409091034)
        self.assertEqual(self.system.tipping_threshold, 10.0)
        self.assertEqual(self.system.seconds_per_quarter, 7_948_800)
    
    def test_stream_rates(self):
        """Test stream rate configuration"""
        self.assertEqual(self.system.stream_rates["civilian"]["per_sec"], 13_600_000)
        self.assertEqual(self.system.stream_rates["military"]["per_sec"], 6_100_000)
        self.assertEqual(self.system.stream_rates["cosmic"]["per_sec"], 9_200_000)
    
    def test_quarterly_counters_generation(self):
        """Test quarterly counter generation"""
        counters = self.system.calculate_quarterly_counters(4)
        
        # Should have 4 quarters × 3 streams = 12 counters
        self.assertEqual(len(counters), 12)
        
        # Check first quarter counters
        q1_counters = [c for c in counters if c.quarter == 1]
        self.assertEqual(len(q1_counters), 3)
        
        # Check all stream names present
        stream_names = {c.stream_name for c in q1_counters}
        self.assertEqual(stream_names, {"Civilian", "Military", "Cosmic"})
    
    def test_base_yield_calculation(self):
        """Test base yield calculation for Q1"""
        counters = self.system.calculate_quarterly_counters(1)
        
        # Get civilian counter
        civilian = next(c for c in counters if c.stream_name == "Civilian")
        
        # Base yield should be rate × seconds_per_quarter
        expected_base = 13_600_000 * 7_948_800
        self.assertEqual(civilian.base_yield_usd, expected_base)
    
    def test_compound_factor_progression(self):
        """Test π₄ compound factor progression"""
        counters = self.system.calculate_quarterly_counters(4)
        
        # Group by quarter
        q1 = next(c for c in counters if c.quarter == 1 and c.stream_name == "Civilian")
        q2 = next(c for c in counters if c.quarter == 2 and c.stream_name == "Civilian")
        q3 = next(c for c in counters if c.quarter == 3 and c.stream_name == "Civilian")
        q4 = next(c for c in counters if c.quarter == 4 and c.stream_name == "Civilian")
        
        # Check compound factors
        self.assertAlmostEqual(q1.compound_factor, 1.0, places=6)
        self.assertAlmostEqual(q2.compound_factor, 97.409091034, places=6)
        self.assertAlmostEqual(q3.compound_factor, 97.409091034 ** 2, places=2)
        self.assertAlmostEqual(q4.compound_factor, 97.409091034 ** 3, places=0)
    
    def test_tipping_detection(self):
        """Test tipping point detection"""
        counters = self.system.calculate_quarterly_counters(4)
        
        # Q1 should not be tipped (factor = 1.0)
        q1 = next(c for c in counters if c.quarter == 1 and c.stream_name == "Civilian")
        self.assertFalse(q1.tipping_detected)
        
        # Q2 should be tipped (factor = 97.4 > threshold of 10)
        q2 = next(c for c in counters if c.quarter == 2 and c.stream_name == "Civilian")
        self.assertTrue(q2.tipping_detected)
    
    def test_cumulative_calculation(self):
        """Test cumulative yield calculation"""
        counters = self.system.calculate_quarterly_counters(3)
        
        # Get civilian counters
        civilian_counters = [c for c in counters if c.stream_name == "Civilian"]
        civilian_counters.sort(key=lambda x: x.quarter)
        
        # Q1 cumulative should equal Q1 compounded
        self.assertAlmostEqual(
            civilian_counters[0].cumulative_from_start,
            civilian_counters[0].compounded_yield_usd,
            places=2
        )
        
        # Q2 cumulative should be Q1 + Q2
        expected_q2_cumulative = (
            civilian_counters[0].compounded_yield_usd + 
            civilian_counters[1].compounded_yield_usd
        )
        self.assertAlmostEqual(
            civilian_counters[1].cumulative_from_start,
            expected_q2_cumulative,
            places=2
        )
    
    def test_ledger_alignment_verification(self):
        """Test ledger alignment verification"""
        alignments = self.system.verify_physical_ledger_alignment(4)
        
        # Should have 4 quarters × 3 streams = 12 alignments
        self.assertEqual(len(alignments), 12)
        
        # All should be aligned (with simulated data)
        aligned_count = sum(1 for a in alignments if a.aligned)
        self.assertEqual(aligned_count, 12)
        
        # Check variance is within tolerance
        for alignment in alignments:
            self.assertLessEqual(alignment.variance_percentage, 0.01)
    
    def test_tipping_point_detection(self):
        """Test π₄ tipping point detection"""
        tipping_points = self.system.detect_pi4_tipping_points(4)
        
        # Should have 4 tipping point records
        self.assertEqual(len(tipping_points), 4)
        
        # Check phases
        self.assertEqual(tipping_points[0].phase, "linear")
        self.assertEqual(tipping_points[1].phase, "exponential")
        self.assertEqual(tipping_points[2].phase, "hyperbolic")
        self.assertEqual(tipping_points[3].phase, "hyperbolic")
        
        # Check Q1 not tipped, Q2+ tipped
        self.assertFalse(tipping_points[0].all_streams_tipped)
        self.assertTrue(tipping_points[1].all_streams_tipped)
    
    def test_sovereign_time_arcs(self):
        """Test sovereign time arc generation"""
        dashboard = self.system.generate_visual_counter_dashboard()
        arcs = dashboard["sovereign_time_arcs"]
        
        # Should have 8 arcs
        self.assertEqual(len(arcs), 8)
        
        # Check ARC-Q01
        arc_q01 = arcs["ARC-Q01"]
        self.assertEqual(arc_q01["quarter"], 1)
        self.assertEqual(arc_q01["start_day"], 1)
        self.assertEqual(arc_q01["end_day"], 92)
        self.assertEqual(arc_q01["duration_days"], 92)
        self.assertEqual(arc_q01["sovereign_phase"], "Foundation Phase")
        
        # Check ARC-Q02
        arc_q02 = arcs["ARC-Q02"]
        self.assertEqual(arc_q02["quarter"], 2)
        self.assertEqual(arc_q02["start_day"], 93)
        self.assertEqual(arc_q02["end_day"], 184)
        self.assertEqual(arc_q02["sovereign_phase"], "Exponential Ascension")
    
    def test_cumulative_analytics(self):
        """Test cumulative analytics calculation"""
        dashboard = self.system.generate_visual_counter_dashboard()
        analytics = dashboard["cumulative_analytics"]
        
        # Should have analytics for all 3 streams
        self.assertIn("Civilian", analytics)
        self.assertIn("Military", analytics)
        self.assertIn("Cosmic", analytics)
        
        # Check civilian analytics
        civilian = analytics["Civilian"]
        self.assertEqual(civilian["first_tipping_quarter"], 2)
        self.assertEqual(civilian["quarters_analyzed"], 8)
        self.assertGreater(civilian["total_cumulative_8q"], 0)
    
    def test_dashboard_generation(self):
        """Test complete dashboard generation"""
        dashboard = self.system.generate_visual_counter_dashboard()
        
        # Check metadata
        self.assertIn("metadata", dashboard)
        self.assertEqual(dashboard["metadata"]["version"], "2.0.0")
        self.assertEqual(dashboard["metadata"]["pi4_constant"], 97.409091034)
        
        # Check all sections present
        self.assertIn("stream_configurations", dashboard)
        self.assertIn("quarterly_counters", dashboard)
        self.assertIn("ledger_alignments", dashboard)
        self.assertIn("tipping_points", dashboard)
        self.assertIn("cumulative_analytics", dashboard)
        self.assertIn("sovereign_time_arcs", dashboard)
    
    def test_ledger_hash_generation(self):
        """Test ledger hash generation"""
        hash1 = self.system._generate_ledger_hash(1, "civilian", 1000000.0)
        hash2 = self.system._generate_ledger_hash(1, "civilian", 1000000.0)
        hash3 = self.system._generate_ledger_hash(2, "civilian", 1000000.0)
        
        # Same inputs should produce same hash
        self.assertEqual(hash1, hash2)
        
        # Different inputs should produce different hash
        self.assertNotEqual(hash1, hash3)
        
        # Hash should be in correct format
        self.assertTrue(hash1.startswith("0x"))
        self.assertEqual(len(hash1), 18)  # "0x" + 16 hex chars
    
    def test_sovereign_signature_generation(self):
        """Test sovereign signature generation"""
        sig1 = self.system._generate_sovereign_signature(1, "civilian", 1000000.0)
        sig2 = self.system._generate_sovereign_signature(1, "civilian", 1000000.0)
        sig3 = self.system._generate_sovereign_signature(2, "civilian", 1000000.0)
        
        # Same inputs should produce same signature
        self.assertEqual(sig1, sig2)
        
        # Different inputs should produce different signature
        self.assertNotEqual(sig1, sig3)
        
        # Signature should be in correct format
        self.assertTrue(sig1.startswith("SOVEREIGN-"))


class TestDataIntegrity(unittest.TestCase):
    """Test data integrity and consistency"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.system = QuarterLawVisualCounters(output_dir="data/snapshots")
    
    def test_stream_percentages(self):
        """Test stream percentages sum to ~100%"""
        total_per_sec = sum(s["per_sec"] for s in self.system.stream_rates.values())
        
        civilian_pct = (self.system.stream_rates["civilian"]["per_sec"] / total_per_sec) * 100
        military_pct = (self.system.stream_rates["military"]["per_sec"] / total_per_sec) * 100
        cosmic_pct = (self.system.stream_rates["cosmic"]["per_sec"] / total_per_sec) * 100
        
        total_pct = civilian_pct + military_pct + cosmic_pct
        
        # Should sum to 100% (within rounding)
        self.assertAlmostEqual(total_pct, 100.0, places=1)
    
    def test_time_consistency(self):
        """Test time constant consistency"""
        # 92 days × 86,400 seconds/day
        expected_seconds = 92 * 86_400
        self.assertEqual(self.system.seconds_per_quarter, expected_seconds)
    
    def test_all_quarters_have_all_streams(self):
        """Test that each quarter has all three streams"""
        counters = self.system.calculate_quarterly_counters(8)
        
        for quarter in range(1, 9):
            q_counters = [c for c in counters if c.quarter == quarter]
            stream_names = {c.stream_name for c in q_counters}
            
            self.assertEqual(len(q_counters), 3, f"Quarter {quarter} should have 3 streams")
            self.assertEqual(stream_names, {"Civilian", "Military", "Cosmic"})


def run_tests():
    """Run all tests"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestQuarterLawVisualCounters))
    suite.addTests(loader.loadTestsFromTestCase(TestDataIntegrity))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return exit code
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(run_tests())
