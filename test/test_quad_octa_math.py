#!/usr/bin/env python3
"""Tests for Ω48 reciprocal math deployment module."""

import math
import unittest

from src.quad_octa_math import (
    OMEGA_TICKS,
    QUARTER_TICKS,
    chain333,
    evaluate_event,
    is_quarter_tick,
    project_cycle,
    reciprocal_state,
    reciprocal_sum,
    reciprocal_sync,
    reciprocal_tick,
    snap_tick,
    spiral_radius,
)


class TestQuadOctaMath(unittest.TestCase):
    def test_snap_tick_845(self):
        # 8:45 => 45 minutes => 36 on Ω48
        self.assertEqual(snap_tick(45), 36)

    def test_project_cycle_angle(self):
        projection = project_cycle(15)
        self.assertEqual(projection.tick, 12)
        self.assertAlmostEqual(projection.angle_radians, math.pi / 2, places=9)

    def test_reciprocal_sum(self):
        self.assertAlmostEqual(reciprocal_sum(2/3), 13/6, places=9)
        self.assertAlmostEqual(reciprocal_sum(3.5), 53/14, places=9)

    def test_reciprocal_tick_from_spec_example(self):
        # x = 107/30 ≈ 3.566666..., expected lattice snap = 40
        self.assertEqual(reciprocal_tick(107/30), 40)

    def test_reciprocal_state(self):
        state = reciprocal_state(4)
        self.assertEqual(state.x, 4)
        self.assertAlmostEqual(state.reciprocal, 0.25, places=9)
        self.assertAlmostEqual(state.reciprocal_sum, 4.25, places=9)

    def test_spiral_radius(self):
        rho = spiral_radius(x=2, median_r=2.0, alpha=0.5)
        # R(2)=2.5 => 1 + 0.5*(0.5)=1.25
        self.assertAlmostEqual(rho, 1.25, places=9)

    def test_quarter_and_sync(self):
        self.assertTrue(is_quarter_tick(12))
        self.assertTrue(is_quarter_tick(48))
        self.assertFalse(is_quarter_tick(11))
        self.assertTrue(reciprocal_sync(0, 47, tolerance=1))

    def test_evaluate_event(self):
        event = evaluate_event(tick=36, x=107/30, tolerance=4)
        self.assertEqual(event.tick, 36)
        self.assertEqual(event.reciprocal_tick, 40)
        self.assertTrue(event.quarter_hit)
        self.assertTrue(event.reciprocal_sync)

    def test_chain333(self):
        self.assertTrue(chain333([12, 24, 36]))
        self.assertFalse(chain333([12, 22, 36]))


if __name__ == "__main__":
    unittest.main()
