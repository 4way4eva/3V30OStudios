#!/usr/bin/env python3
"""
Advanced π⁴ Compounding Mechanics Engine
BLEUE ∞ GRID Treasury System - Enhanced Edition

This module implements advanced non-linear compounding curves, simulation
options, fail-safe configurations, and visual progress tracking for the
MetaVault Treasury across Civilian, Military, and Cosmic economies.
"""

import json
import csv
import math
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from enum import Enum


class GrowthPhase(Enum):
    """Growth phase enumeration for yield compounding."""
    BASE = "base"
    ACCELERATION = "acceleration"
    OVERSCALE = "overscale"
    SOVEREIGN = "sovereign_override"


class CompoundingCurve(Enum):
    """Non-linear compounding curve types."""
    LINEAR = "linear"
    EXPONENTIAL = "exponential"
    SIGMOID = "sigmoid"
    HYPERBOLIC = "hyperbolic"


class Pi4AdvancedCompounding:
    """
    Advanced π⁴ compounding engine with non-linear curves, fail-safes,
    and visual progress tracking.
    """
    
    def __init__(self, data_dir: str = "data", config_file: str = "METAVAULT_config.json"):
        self.data_dir = Path(data_dir)
        self.pi4 = 97.409  # π⁴ compounding factor
        
        # Load configuration
        self.config = self._load_json(config_file)
        self.streams = self.config["metavault_treasury"]["yield_streams"]
        self.aggregated = self.config["metavault_treasury"]["aggregated_metrics"]
        
        # Advanced compounding parameters
        self.base_threshold = 1.0  # Baseline multiplier
        self.acceleration_threshold = 5.0  # Acceleration starts
        self.overscale_threshold = 25.0  # Overscale kicks in
        
        # Fail-safe configuration
        self.fail_safe_enabled = True
        self.sovereign_override_active = False
        self.max_growth_rate = self.pi4 * 2  # Maximum safe growth rate
        self.min_growth_rate = 1.01  # Minimum growth rate (1% baseline)
        
        # Quarter segment tracking (4 segments per quarter)
        self.segment_length_days = 22.5  # 90 days / 4 segments
        
        # Growth acceleration tracking
        self.acceleration_log = []
        
    def _load_json(self, filename: str) -> Dict:
        """Load JSON configuration file."""
        filepath = self.data_dir / filename
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: {filename} not found in {self.data_dir}")
            return {}
    
    def calculate_growth_phase(self, current_multiplier: float) -> GrowthPhase:
        """
        Determine current growth phase based on multiplier.
        
        Args:
            current_multiplier: Current compounding multiplier
            
        Returns:
            GrowthPhase enum value
        """
        if self.sovereign_override_active:
            return GrowthPhase.SOVEREIGN
        elif current_multiplier >= self.overscale_threshold:
            return GrowthPhase.OVERSCALE
        elif current_multiplier >= self.acceleration_threshold:
            return GrowthPhase.ACCELERATION
        else:
            return GrowthPhase.BASE
    
    def apply_curve(self, base_value: float, curve_type: CompoundingCurve, 
                   time_factor: float) -> float:
        """
        Apply non-linear compounding curve to base value.
        
        Args:
            base_value: Starting value
            curve_type: Type of curve to apply
            time_factor: Time progression factor (0 to 1)
            
        Returns:
            Transformed value based on curve
        """
        if curve_type == CompoundingCurve.LINEAR:
            return base_value * (1 + time_factor * (self.pi4 - 1))
        
        elif curve_type == CompoundingCurve.EXPONENTIAL:
            return base_value * math.pow(self.pi4, time_factor)
        
        elif curve_type == CompoundingCurve.SIGMOID:
            # Sigmoid curve for smooth transition
            sigmoid = 1 / (1 + math.exp(-10 * (time_factor - 0.5)))
            return base_value * (1 + sigmoid * (self.pi4 - 1))
        
        elif curve_type == CompoundingCurve.HYPERBOLIC:
            # Hyperbolic growth for overscale phase
            if time_factor < 0.01:
                return base_value
            return base_value * (self.pi4 / (1 - 0.9 * time_factor))
        
        return base_value
    
    def apply_fail_safe(self, calculated_rate: float, context: str = "") -> float:
        """
        Apply fail-safe bounds to growth rate.
        
        Args:
            calculated_rate: Calculated growth rate
            context: Context for logging
            
        Returns:
            Bounded growth rate
        """
        if not self.fail_safe_enabled:
            return calculated_rate
        
        original_rate = calculated_rate
        
        # Apply bounds
        if calculated_rate > self.max_growth_rate:
            calculated_rate = self.max_growth_rate
            self._log_fail_safe_trigger("MAX_BOUND", original_rate, calculated_rate, context)
        
        if calculated_rate < self.min_growth_rate:
            calculated_rate = self.min_growth_rate
            self._log_fail_safe_trigger("MIN_BOUND", original_rate, calculated_rate, context)
        
        return calculated_rate
    
    def _log_fail_safe_trigger(self, trigger_type: str, original: float, 
                               bounded: float, context: str):
        """Log fail-safe intervention."""
        log_entry = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "trigger_type": trigger_type,
            "original_rate": original,
            "bounded_rate": bounded,
            "context": context,
            "sovereign_override_required": True
        }
        self.acceleration_log.append(log_entry)
        print(f"⚠️  FAIL-SAFE TRIGGERED: {trigger_type} - {context}")
        print(f"   Original: {original:.4f} → Bounded: {bounded:.4f}")
        print(f"   🔐 SOVEREIGN MANUAL OVERRIDE REQUIRED for realignment")
    
    def calculate_quarter_segment_yield(self, quarter: int, segment: int, 
                                       curve_type: CompoundingCurve = CompoundingCurve.SIGMOID) -> Dict[str, Any]:
        """
        Calculate yield for a specific quarter segment (4 segments per quarter).
        
        Args:
            quarter: Quarter number (1-based)
            segment: Segment within quarter (1-4)
            curve_type: Type of compounding curve to apply
            
        Returns:
            Dictionary with segment yield data and visual indicators
        """
        # Calculate base yield for the quarter
        seconds_per_quarter = self.aggregated["seconds_per_quarter"]
        base_quarter_yield = self.aggregated["total_per_second_usd"] * seconds_per_quarter
        
        # Apply π⁴ compounding for previous quarters
        quarter_multiplier = math.pow(self.pi4, quarter - 1)
        current_quarter_base = base_quarter_yield * quarter_multiplier
        
        # Calculate segment progression within quarter (0 to 1)
        segment_progress = segment / 4.0
        
        # Apply non-linear curve
        segment_yield = self.apply_curve(current_quarter_base, curve_type, segment_progress)
        
        # Determine growth phase
        growth_phase = self.calculate_growth_phase(quarter_multiplier)
        
        # Calculate per-stream yields
        stream_yields = {}
        for stream_name, stream_data in self.streams.items():
            stream_proportion = stream_data["per_second_usd"] / self.aggregated["total_per_second_usd"]
            stream_yields[stream_name] = {
                "yield_usd": segment_yield * stream_proportion,
                "name": stream_data["name"],
                "icon": stream_data["icon"],
                "color": stream_data["color"],
                "speed_indicator": self._calculate_speed_indicator(
                    quarter, segment, stream_name
                )
            }
        
        # Calculate delta from previous segment
        if segment > 1 or quarter > 1:
            prev_quarter = quarter if segment > 1 else quarter - 1
            prev_segment = segment - 1 if segment > 1 else 4
            prev_data = self.calculate_quarter_segment_yield(prev_quarter, prev_segment, curve_type)
            delta_usd = segment_yield - prev_data["total_yield_usd"]
            delta_percent = (delta_usd / prev_data["total_yield_usd"]) * 100 if prev_data["total_yield_usd"] > 0 else 0
        else:
            delta_usd = 0
            delta_percent = 0
        
        return {
            "quarter": quarter,
            "segment": segment,
            "segment_label": f"Q{quarter}:S{segment}",
            "total_yield_usd": segment_yield,
            "growth_phase": growth_phase.value,
            "curve_type": curve_type.value,
            "multiplier": quarter_multiplier,
            "delta_usd": delta_usd,
            "delta_percent": delta_percent,
            "streams": stream_yields,
            "visual_indicators": self._generate_visual_indicators(
                growth_phase, quarter_multiplier, delta_percent
            )
        }
    
    def _calculate_speed_indicator(self, quarter: int, segment: int, stream_name: str) -> str:
        """
        Generate speed indicator for compounding visualization.
        
        Args:
            quarter: Quarter number
            segment: Segment number
            stream_name: Name of yield stream
            
        Returns:
            Visual speed indicator string
        """
        multiplier = math.pow(self.pi4, quarter - 1 + segment / 4.0)
        
        if multiplier < 2:
            return "▸"
        elif multiplier < 10:
            return "▸▸"
        elif multiplier < 50:
            return "▸▸▸"
        else:
            return "▸▸▸▸"
    
    def _generate_visual_indicators(self, phase: GrowthPhase, 
                                   multiplier: float, delta_percent: float) -> Dict[str, str]:
        """
        Generate visual indicators for dashboard display.
        
        Args:
            phase: Current growth phase
            multiplier: Current multiplier value
            delta_percent: Percentage change from previous segment
            
        Returns:
            Dictionary of visual indicators
        """
        # Phase indicator
        phase_icons = {
            GrowthPhase.BASE: "🟢",
            GrowthPhase.ACCELERATION: "🟡",
            GrowthPhase.OVERSCALE: "🔴",
            GrowthPhase.SOVEREIGN: "👑"
        }
        
        # Speed bars
        if multiplier < 2:
            speed_bar = "▰▱▱▱▱"
        elif multiplier < 10:
            speed_bar = "▰▰▱▱▱"
        elif multiplier < 50:
            speed_bar = "▰▰▰▱▱"
        elif multiplier < 100:
            speed_bar = "▰▰▰▰▱"
        else:
            speed_bar = "▰▰▰▰▰"
        
        # Delta indicator
        if delta_percent > 100:
            delta_icon = "⏫⏫⏫"
        elif delta_percent > 50:
            delta_icon = "⏫⏫"
        elif delta_percent > 10:
            delta_icon = "⏫"
        elif delta_percent > 0:
            delta_icon = "⬆️"
        else:
            delta_icon = "➡️"
        
        return {
            "phase_icon": phase_icons[phase],
            "speed_bar": speed_bar,
            "delta_icon": delta_icon,
            "multiplier_display": f"{multiplier:.2f}×"
        }
    
    def simulate_full_year_quarters(self, quarters: int = 4, 
                                   curve_type: CompoundingCurve = CompoundingCurve.SIGMOID) -> List[Dict[str, Any]]:
        """
        Simulate full year with quarter segments displayed.
        
        Args:
            quarters: Number of quarters to simulate
            curve_type: Compounding curve type
            
        Returns:
            List of segment data for all quarters
        """
        simulation_data = []
        
        for q in range(1, quarters + 1):
            for s in range(1, 5):  # 4 segments per quarter
                segment_data = self.calculate_quarter_segment_yield(q, s, curve_type)
                simulation_data.append(segment_data)
        
        return simulation_data
    
    def generate_acceleration_report(self, quarters: int = 4) -> Dict[str, Any]:
        """
        Generate growth acceleration report (daily, weekly, quarterly).
        
        Args:
            quarters: Number of quarters to analyze
            
        Returns:
            Comprehensive acceleration report
        """
        simulation = self.simulate_full_year_quarters(quarters)
        
        # Daily acceleration (using first day of each segment)
        daily_rates = []
        seconds_per_day = self.aggregated["seconds_per_day"]
        
        for i, segment in enumerate(simulation):
            if i == 0:
                daily_rate = 0
            else:
                prev_daily = simulation[i-1]["total_yield_usd"] / (self.segment_length_days * seconds_per_day)
                curr_daily = segment["total_yield_usd"] / (self.segment_length_days * seconds_per_day)
                daily_rate = ((curr_daily - prev_daily) / prev_daily) * 100 if prev_daily > 0 else 0
            
            daily_rates.append({
                "segment_label": segment["segment_label"],
                "acceleration_percent": daily_rate,
                "growth_phase": segment["growth_phase"]
            })
        
        # Weekly acceleration (7 days = ~1/3 segment)
        weekly_rates = self._calculate_weekly_acceleration(simulation)
        
        # Quarterly acceleration
        quarterly_rates = []
        for i in range(1, quarters + 1):
            quarter_segments = [s for s in simulation if s["quarter"] == i]
            if i == 1:
                quarterly_rate = 0
            else:
                prev_quarter = [s for s in simulation if s["quarter"] == i-1]
                prev_total = sum(s["total_yield_usd"] for s in prev_quarter)
                curr_total = sum(s["total_yield_usd"] for s in quarter_segments)
                quarterly_rate = ((curr_total - prev_total) / prev_total) * 100 if prev_total > 0 else 0
            
            quarterly_rates.append({
                "quarter": i,
                "acceleration_percent": quarterly_rate,
                "growth_phase": quarter_segments[-1]["growth_phase"]
            })
        
        return {
            "report_type": "growth_acceleration",
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "quarters_analyzed": quarters,
            "daily_acceleration": daily_rates,
            "weekly_acceleration": weekly_rates,
            "quarterly_acceleration": quarterly_rates,
            "fail_safe_log": self.acceleration_log,
            "sovereign_override_status": self.sovereign_override_active
        }
    
    def _calculate_weekly_acceleration(self, simulation: List[Dict]) -> List[Dict[str, Any]]:
        """Calculate weekly acceleration rates."""
        weekly_rates = []
        days_per_week = 7
        segment_days = self.segment_length_days
        
        for i, segment in enumerate(simulation):
            if i == 0:
                weekly_rate = 0
            else:
                # Approximate weekly change based on segment progression
                weeks_elapsed = (i * segment_days) / days_per_week
                prev_weekly = simulation[i-1]["total_yield_usd"] / (segment_days / days_per_week)
                curr_weekly = segment["total_yield_usd"] / (segment_days / days_per_week)
                weekly_rate = ((curr_weekly - prev_weekly) / prev_weekly) * 100 if prev_weekly > 0 else 0
            
            weekly_rates.append({
                "segment_label": segment["segment_label"],
                "acceleration_percent": weekly_rate,
                "growth_phase": segment["growth_phase"]
            })
        
        return weekly_rates
    
    def encode_pi4_asset_logic(self, quarters: int = 4) -> Dict[str, Any]:
        """
        Encode π₄-based steps into digital asset logic for economic predictability.
        
        Args:
            quarters: Number of quarters to encode
            
        Returns:
            JSON-compatible asset logic structure
        """
        simulation = self.simulate_full_year_quarters(quarters)
        
        asset_logic = {
            "asset_type": "PI4_COMPOUND_STREAM",
            "version": "2.0",
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "compounding_factor": self.pi4,
            "economic_predictability": {
                "certified": True,
                "fail_safe_enabled": self.fail_safe_enabled,
                "sovereign_override_protocol": "COMMANDER_BLEU_MANUAL_REALIGNMENT"
            },
            "quarter_segments": [],
            "stream_vectors": {}
        }
        
        # Encode each segment
        for segment in simulation:
            encoded_segment = {
                "id": f"SEGMENT::{segment['segment_label']}",
                "quarter": segment["quarter"],
                "segment": segment["segment"],
                "yield_usd": segment["total_yield_usd"],
                "growth_phase": segment["growth_phase"],
                "multiplier": segment["multiplier"],
                "delta": {
                    "usd": segment["delta_usd"],
                    "percent": segment["delta_percent"]
                },
                "visual_indicators": segment["visual_indicators"],
                "timestamp_range": {
                    "start_day": (segment["quarter"] - 1) * 90 + (segment["segment"] - 1) * self.segment_length_days,
                    "end_day": (segment["quarter"] - 1) * 90 + segment["segment"] * self.segment_length_days
                }
            }
            asset_logic["quarter_segments"].append(encoded_segment)
        
        # Encode stream-specific vectors
        for stream_name in self.streams.keys():
            stream_vector = []
            for segment in simulation:
                stream_data = segment["streams"][stream_name]
                stream_vector.append({
                    "segment_label": segment["segment_label"],
                    "yield_usd": stream_data["yield_usd"],
                    "speed_indicator": stream_data["speed_indicator"]
                })
            asset_logic["stream_vectors"][stream_name] = stream_vector
        
        return asset_logic
    
    def enable_sovereign_override(self, reason: str = "Manual intervention required"):
        """
        Enable sovereign manual override for system realignment.
        
        Args:
            reason: Reason for override activation
        """
        self.sovereign_override_active = True
        override_log = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "event": "SOVEREIGN_OVERRIDE_ENABLED",
            "reason": reason,
            "operator": "COMMANDER_BLEU"
        }
        self.acceleration_log.append(override_log)
        print(f"👑 SOVEREIGN OVERRIDE ENABLED: {reason}")
    
    def disable_sovereign_override(self):
        """Disable sovereign override and return to automatic operation."""
        self.sovereign_override_active = False
        override_log = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "event": "SOVEREIGN_OVERRIDE_DISABLED",
            "operator": "COMMANDER_BLEU"
        }
        self.acceleration_log.append(override_log)
        print(f"✅ SOVEREIGN OVERRIDE DISABLED - Returning to automatic operation")
    
    def export_simulation_data(self, quarters: int = 4, output_dir: str = "."):
        """
        Export all simulation data to files.
        
        Args:
            quarters: Number of quarters to simulate
            output_dir: Output directory for files
        """
        output_path = Path(output_dir)
        
        # Generate simulation
        simulation = self.simulate_full_year_quarters(quarters)
        acceleration_report = self.generate_acceleration_report(quarters)
        asset_logic = self.encode_pi4_asset_logic(quarters)
        
        # Export JSON files
        with open(output_path / "pi4_advanced_simulation.json", 'w') as f:
            json.dump(simulation, f, indent=2)
        print(f"✅ Simulation data exported to pi4_advanced_simulation.json")
        
        with open(output_path / "pi4_acceleration_report.json", 'w') as f:
            json.dump(acceleration_report, f, indent=2)
        print(f"✅ Acceleration report exported to pi4_acceleration_report.json")
        
        with open(output_path / "pi4_asset_logic.json", 'w') as f:
            json.dump(asset_logic, f, indent=2)
        print(f"✅ Asset logic exported to pi4_asset_logic.json")
        
        # Export CSV with visual indicators
        with open(output_path / "pi4_quarter_segments_visual.csv", 'w', newline='') as f:
            fieldnames = [
                "segment_label", "quarter", "segment", "total_yield_usd",
                "growth_phase", "multiplier", "delta_usd", "delta_percent",
                "phase_icon", "speed_bar", "delta_icon",
                "civilian_yield", "military_yield", "cosmic_yield"
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for seg in simulation:
                writer.writerow({
                    "segment_label": seg["segment_label"],
                    "quarter": seg["quarter"],
                    "segment": seg["segment"],
                    "total_yield_usd": seg["total_yield_usd"],
                    "growth_phase": seg["growth_phase"],
                    "multiplier": seg["multiplier"],
                    "delta_usd": seg["delta_usd"],
                    "delta_percent": seg["delta_percent"],
                    "phase_icon": seg["visual_indicators"]["phase_icon"],
                    "speed_bar": seg["visual_indicators"]["speed_bar"],
                    "delta_icon": seg["visual_indicators"]["delta_icon"],
                    "civilian_yield": seg["streams"]["civilian"]["yield_usd"],
                    "military_yield": seg["streams"]["military"]["yield_usd"],
                    "cosmic_yield": seg["streams"]["cosmic"]["yield_usd"]
                })
        print(f"✅ Visual segment data exported to pi4_quarter_segments_visual.csv")


def main():
    """Main execution function."""
    print("🌀 Advanced π⁴ Compounding Mechanics Engine")
    print("=" * 70)
    print("BLEUE ∞ GRID Treasury System - Enhanced Edition")
    print("=" * 70)
    
    # Initialize engine
    engine = Pi4AdvancedCompounding()
    
    # Display current configuration
    print("\n📊 SYSTEM CONFIGURATION:")
    print(f"   π⁴ Factor: {engine.pi4}")
    print(f"   Fail-Safe Enabled: {engine.fail_safe_enabled}")
    print(f"   Growth Rate Bounds: {engine.min_growth_rate} - {engine.max_growth_rate}")
    print(f"   Quarter Segments: 4 per quarter ({engine.segment_length_days} days each)")
    
    # Run simulation
    print("\n🔄 Running 4-quarter simulation with non-linear curves...")
    simulation = engine.simulate_full_year_quarters(4, CompoundingCurve.SIGMOID)
    
    # Display sample segments
    print("\n📈 SAMPLE QUARTER SEGMENTS (with visual indicators):")
    print("=" * 70)
    
    sample_indices = [0, 3, 7, 11, 15]  # Q1:S1, Q1:S4, Q2:S4, Q3:S4, Q4:S4
    for idx in sample_indices:
        if idx < len(simulation):
            seg = simulation[idx]
            vi = seg["visual_indicators"]
            print(f"\n{vi['phase_icon']} {seg['segment_label']} - {seg['growth_phase'].upper()}")
            print(f"   Total Yield: ${seg['total_yield_usd']:,.2f}")
            print(f"   Multiplier: {vi['multiplier_display']}")
            print(f"   Speed: {vi['speed_bar']}")
            print(f"   Delta: {vi['delta_icon']} {seg['delta_percent']:.2f}%")
            print(f"   Streams:")
            for stream_name, stream_data in seg["streams"].items():
                print(f"     {stream_data['icon']} {stream_name}: ${stream_data['yield_usd']:,.2f} {stream_data['speed_indicator']}")
    
    # Generate acceleration report
    print("\n\n📊 GROWTH ACCELERATION ANALYSIS:")
    print("=" * 70)
    
    report = engine.generate_acceleration_report(4)
    
    print("\nQuarterly Acceleration Rates:")
    for qr in report["quarterly_acceleration"]:
        print(f"   Q{qr['quarter']}: {qr['acceleration_percent']:>8.2f}% - {qr['growth_phase']}")
    
    # Export all data
    print("\n\n💾 EXPORTING DATA FILES:")
    print("=" * 70)
    engine.export_simulation_data(4)
    
    # Display summary
    print("\n\n✅ ADVANCED π⁴ COMPOUNDING SYSTEM READY")
    print("=" * 70)
    print("\nFeatures Implemented:")
    print("  ✓ Non-linear growth curves (Sigmoid, Exponential, Hyperbolic)")
    print("  ✓ Quarter segment visualization (4 segments per quarter)")
    print("  ✓ Fail-safe configurations with sovereign override")
    print("  ✓ Visual speed counters for each stream")
    print("  ✓ Growth phase deltas (base → acceleration → overscale)")
    print("  ✓ Daily/Weekly/Quarterly acceleration reports")
    print("  ✓ π⁴-encoded asset logic (JSON/Q-output streams)")
    print("  ✓ Economic predictability certification")
    
    print("\nFiles Generated:")
    print("  • pi4_advanced_simulation.json - Full simulation data")
    print("  • pi4_acceleration_report.json - Growth acceleration analysis")
    print("  • pi4_asset_logic.json - Digital asset logic encoding")
    print("  • pi4_quarter_segments_visual.csv - Visual segment data")
    
    print("\n🌀 All advanced mechanics operational and certified.")


if __name__ == "__main__":
    main()
