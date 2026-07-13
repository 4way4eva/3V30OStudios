#!/usr/bin/env python3
"""
Live Quarter-Law Trace System
BLEU Codex Triple-Stack Treasury Synchronization

This module provides comprehensive time visualization across second, day, and quarter
granularity for Civilian, Military, and Cosmic yield streams with integrated π₄ compounding.

Features:
- Second-by-second yield tracking
- Daily accumulation visualization
- Quarterly compound projection
- π₄ exponential growth acceleration
- Real-time dashboard data generation
"""

import json
import csv
import math
import datetime
from pathlib import Path
from typing import Dict, List, Any, Tuple


class LiveQuarterLawTrace:
    """
    Comprehensive time visualization and tracking for triple-stack treasury yields.
    """
    
    def __init__(self, output_dir: str = "data/snapshots"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Yield rates per second (USD)
        self.civilian_per_sec = 13_600_000
        self.military_per_sec = 6_100_000
        self.cosmic_per_sec = 9_200_000
        self.total_per_sec = 28_900_000
        
        # Time constants
        self.seconds_per_day = 86_400
        self.seconds_per_quarter = 7_948_800  # 92 days
        self.days_per_quarter = 92
        
        # π₄ compounding factor
        self.pi4 = 97.409091034  # π^4 approximation
        
        # Stream metadata
        self.streams = {
            "civilian": {
                "name": "Civilian Yield Stream",
                "code": "Ω-CIV-01",
                "rate": self.civilian_per_sec,
                "percentage": 47.06,
                "color": "#4169E1",
                "icon": "🏛️"
            },
            "military": {
                "name": "Military Yield Stream", 
                "code": "Ω-MIL-01",
                "rate": self.military_per_sec,
                "percentage": 21.11,
                "color": "#DC143C",
                "icon": "⚔️"
            },
            "cosmic": {
                "name": "Cosmic Yield Stream",
                "code": "Ω-COS-01",
                "rate": self.cosmic_per_sec,
                "percentage": 31.83,
                "color": "#9370DB",
                "icon": "🌌"
            }
        }
        
    def calculate_second_trace(self, duration_seconds: int = 3600) -> List[Dict[str, Any]]:
        """
        Calculate yield accumulation for each second.
        
        Args:
            duration_seconds: Number of seconds to trace (default 1 hour)
            
        Returns:
            List of dictionaries with per-second yield data
        """
        trace = []
        
        for second in range(duration_seconds + 1):
            entry = {
                "second": second,
                "timestamp": datetime.datetime.now().timestamp() + second,
                "civilian": self.civilian_per_sec * second,
                "military": self.military_per_sec * second,
                "cosmic": self.cosmic_per_sec * second,
                "total": self.total_per_sec * second,
                "civilian_delta": self.civilian_per_sec,
                "military_delta": self.military_per_sec,
                "cosmic_delta": self.cosmic_per_sec,
                "total_delta": self.total_per_sec
            }
            trace.append(entry)
            
        return trace
    
    def calculate_daily_trace(self, days: int = 92) -> List[Dict[str, Any]]:
        """
        Calculate yield accumulation for each day in a quarter.
        
        Args:
            days: Number of days to trace (default 92 for full quarter)
            
        Returns:
            List of dictionaries with per-day yield data
        """
        trace = []
        
        for day in range(1, days + 1):
            seconds_elapsed = day * self.seconds_per_day
            
            entry = {
                "day": day,
                "civilian": self.civilian_per_sec * seconds_elapsed,
                "military": self.military_per_sec * seconds_elapsed,
                "cosmic": self.cosmic_per_sec * seconds_elapsed,
                "total": self.total_per_sec * seconds_elapsed,
                "civilian_daily": self.civilian_per_sec * self.seconds_per_day,
                "military_daily": self.military_per_sec * self.seconds_per_day,
                "cosmic_daily": self.cosmic_per_sec * self.seconds_per_day,
                "total_daily": self.total_per_sec * self.seconds_per_day
            }
            trace.append(entry)
            
        return trace
    
    def calculate_quarter_trace_with_pi4(self, quarters: int = 4) -> List[Dict[str, Any]]:
        """
        Calculate yield with π₄ compounding across multiple quarters.
        
        Args:
            quarters: Number of quarters to project
            
        Returns:
            List of dictionaries with quarterly yield data including π₄ compounding
        """
        trace = []
        
        # Base quarterly yield (linear, no compounding)
        base_civilian_quarter = self.civilian_per_sec * self.seconds_per_quarter
        base_military_quarter = self.military_per_sec * self.seconds_per_quarter
        base_cosmic_quarter = self.cosmic_per_sec * self.seconds_per_quarter
        base_total_quarter = self.total_per_sec * self.seconds_per_quarter
        
        for quarter in range(1, quarters + 1):
            # Apply π₄ compounding: Y(q) = Y_0 * (π^4)^(q-1)
            compound_factor = self.pi4 ** (quarter - 1)
            
            entry = {
                "quarter": quarter,
                "compound_factor": compound_factor,
                "civilian_base": base_civilian_quarter,
                "military_base": base_military_quarter,
                "cosmic_base": base_cosmic_quarter,
                "total_base": base_total_quarter,
                "civilian_compounded": base_civilian_quarter * compound_factor,
                "military_compounded": base_military_quarter * compound_factor,
                "cosmic_compounded": base_cosmic_quarter * compound_factor,
                "total_compounded": base_total_quarter * compound_factor,
                "growth_percentage": (compound_factor - 1) * 100
            }
            trace.append(entry)
            
        return trace
    
    def calculate_pi4_acceleration(self, time_points: int = 100, 
                                   max_quarters: float = 4.0) -> List[Dict[str, Any]]:
        """
        Calculate π₄ compounding curve at fine granularity to show acceleration.
        
        Args:
            time_points: Number of points to calculate along the curve
            max_quarters: Maximum time in quarters
            
        Returns:
            List of curve points showing exponential acceleration
        """
        acceleration_curve = []
        
        base_yield = self.total_per_sec * self.seconds_per_quarter
        
        for i in range(time_points + 1):
            t = (i / time_points) * max_quarters
            
            # Calculate Y(t) = Y_0 * (π^4)^t
            compound_factor = self.pi4 ** t
            compounded_yield = base_yield * compound_factor
            
            # Calculate instantaneous growth rate
            # d/dt[(π^4)^t] = (π^4)^t * ln(π^4)
            ln_pi4 = math.log(self.pi4)
            instantaneous_rate = compounded_yield * ln_pi4
            
            entry = {
                "time_quarters": t,
                "time_days": t * self.days_per_quarter,
                "compound_factor": compound_factor,
                "total_yield": compounded_yield,
                "civilian_yield": compounded_yield * (self.civilian_per_sec / self.total_per_sec),
                "military_yield": compounded_yield * (self.military_per_sec / self.total_per_sec),
                "cosmic_yield": compounded_yield * (self.cosmic_per_sec / self.total_per_sec),
                "instantaneous_growth_rate": instantaneous_rate,
                "curve_slope": ln_pi4 * compound_factor
            }
            acceleration_curve.append(entry)
            
        return acceleration_curve
    
    def generate_live_dashboard_data(self) -> Dict[str, Any]:
        """
        Generate comprehensive dashboard data for real-time visualization.
        
        Returns:
            Dictionary with all dashboard metrics
        """
        dashboard = {
            "metadata": {
                "generated_at": datetime.datetime.now().isoformat(),
                "system": "BLEU Codex Triple-Stack Treasury",
                "version": "1.0.0",
                "pi4_constant": self.pi4
            },
            "streams": self.streams,
            "current_rates": {
                "civilian_per_second": self.civilian_per_sec,
                "military_per_second": self.military_per_sec,
                "cosmic_per_second": self.cosmic_per_sec,
                "total_per_second": self.total_per_sec,
                "total_per_day": self.total_per_sec * self.seconds_per_day,
                "total_per_quarter": self.total_per_sec * self.seconds_per_quarter
            },
            "traces": {
                "second_trace": self.calculate_second_trace(60),  # 1 minute
                "daily_trace": self.calculate_daily_trace(92),  # Full quarter
                "quarter_trace": self.calculate_quarter_trace_with_pi4(8),  # 2 years
                "acceleration_curve": self.calculate_pi4_acceleration(100, 4.0)
            },
            "projections": self._calculate_projections(),
            "compound_analytics": self._calculate_compound_analytics()
        }
        
        return dashboard
    
    def _calculate_projections(self) -> Dict[str, Any]:
        """Calculate various time-based projections."""
        return {
            "one_hour": {
                "seconds": 3600,
                "civilian": self.civilian_per_sec * 3600,
                "military": self.military_per_sec * 3600,
                "cosmic": self.cosmic_per_sec * 3600,
                "total": self.total_per_sec * 3600
            },
            "one_day": {
                "seconds": self.seconds_per_day,
                "civilian": self.civilian_per_sec * self.seconds_per_day,
                "military": self.military_per_sec * self.seconds_per_day,
                "cosmic": self.cosmic_per_sec * self.seconds_per_day,
                "total": self.total_per_sec * self.seconds_per_day
            },
            "one_week": {
                "seconds": self.seconds_per_day * 7,
                "civilian": self.civilian_per_sec * self.seconds_per_day * 7,
                "military": self.military_per_sec * self.seconds_per_day * 7,
                "cosmic": self.cosmic_per_sec * self.seconds_per_day * 7,
                "total": self.total_per_sec * self.seconds_per_day * 7
            },
            "one_quarter": {
                "seconds": self.seconds_per_quarter,
                "civilian": self.civilian_per_sec * self.seconds_per_quarter,
                "military": self.military_per_sec * self.seconds_per_quarter,
                "cosmic": self.cosmic_per_sec * self.seconds_per_quarter,
                "total": self.total_per_sec * self.seconds_per_quarter
            }
        }
    
    def _calculate_compound_analytics(self) -> Dict[str, Any]:
        """Calculate compounding analytics."""
        quarter_1 = self.total_per_sec * self.seconds_per_quarter
        quarter_2 = quarter_1 * self.pi4
        quarter_4 = quarter_1 * (self.pi4 ** 3)
        quarter_8 = quarter_1 * (self.pi4 ** 7)
        
        return {
            "quarter_1_yield": quarter_1,
            "quarter_2_yield": quarter_2,
            "quarter_4_yield": quarter_4,
            "quarter_8_yield": quarter_8,
            "growth_q1_to_q2": ((quarter_2 - quarter_1) / quarter_1) * 100,
            "growth_q1_to_q4": ((quarter_4 - quarter_1) / quarter_1) * 100,
            "growth_q1_to_q8": ((quarter_8 - quarter_1) / quarter_1) * 100,
            "doubling_time_quarters": math.log(2) / math.log(self.pi4)
        }
    
    def export_csv_traces(self):
        """Export all traces to CSV files."""
        # Second trace (first 60 seconds)
        second_trace = self.calculate_second_trace(60)
        self._write_csv("live_second_trace.csv", second_trace)
        
        # Daily trace (92 days)
        daily_trace = self.calculate_daily_trace(92)
        self._write_csv("live_daily_trace.csv", daily_trace)
        
        # Quarter trace (8 quarters)
        quarter_trace = self.calculate_quarter_trace_with_pi4(8)
        self._write_csv("live_quarter_trace_pi4.csv", quarter_trace)
        
        # Acceleration curve
        acceleration = self.calculate_pi4_acceleration(100, 4.0)
        self._write_csv("live_pi4_acceleration_curve.csv", acceleration)
        
        print(f"✅ CSV traces exported to {self.output_dir}/")
    
    def _write_csv(self, filename: str, data: List[Dict[str, Any]]):
        """Write data to CSV file."""
        if not data:
            return
            
        filepath = self.output_dir / filename
        keys = data[0].keys()
        
        with open(filepath, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data)
    
    def export_dashboard_json(self):
        """Export dashboard data as JSON."""
        dashboard = self.generate_live_dashboard_data()
        filepath = self.output_dir / "live_quarter_law_dashboard.json"
        
        with open(filepath, 'w') as f:
            json.dump(dashboard, f, indent=2)
        
        print(f"✅ Dashboard JSON exported to {filepath}")
        
        return dashboard
    
    def generate_markdown_report(self) -> str:
        """Generate a markdown report of the live trace system."""
        dashboard = self.generate_live_dashboard_data()
        
        report = f"""# Live Quarter-Law Trace Report
## BLEU Codex Triple-Stack Treasury Synchronization

**Generated:** {dashboard['metadata']['generated_at']}  
**System:** {dashboard['metadata']['system']}  
**π₄ Constant:** {self.pi4:.9f}

---

## Current Yield Rates

| Stream | Code | Rate/Second (USD) | Rate/Day (USD) | Percentage |
|--------|------|-------------------|----------------|------------|
| 🏛️ Civilian | Ω-CIV-01 | ${self.civilian_per_sec:,} | ${self.civilian_per_sec * self.seconds_per_day:,} | 47.06% |
| ⚔️ Military | Ω-MIL-01 | ${self.military_per_sec:,} | ${self.military_per_sec * self.seconds_per_day:,} | 21.11% |
| 🌌 Cosmic | Ω-COS-01 | ${self.cosmic_per_sec:,} | ${self.cosmic_per_sec * self.seconds_per_day:,} | 31.83% |
| **TOTAL** | **Ω-TOTAL** | **${self.total_per_sec:,}** | **${self.total_per_sec * self.seconds_per_day:,}** | **100%** |

---

## Projections

### Short Term
- **1 Hour:** ${dashboard['projections']['one_hour']['total']:,.2f} USD
- **1 Day:** ${dashboard['projections']['one_day']['total']:,.2f} USD
- **1 Week:** ${dashboard['projections']['one_week']['total']:,.2f} USD

### Quarterly (Linear)
- **1 Quarter (92 days):** ${dashboard['projections']['one_quarter']['total']:,.2f} USD

---

## π₄ Compounding Trajectory

| Quarter | Compound Factor | Total Yield (USD) | Growth % |
|---------|-----------------|-------------------|----------|
"""
        
        for q_data in dashboard['traces']['quarter_trace'][:4]:
            report += f"| {q_data['quarter']} | {q_data['compound_factor']:.2f}x | ${q_data['total_compounded']:,.0f} | {q_data['growth_percentage']:.1f}% |\n"
        
        report += f"""
---

## Compound Analytics

- **Doubling Time:** {dashboard['compound_analytics']['doubling_time_quarters']:.3f} quarters
- **Q1 to Q2 Growth:** {dashboard['compound_analytics']['growth_q1_to_q2']:.1f}%
- **Q1 to Q4 Growth:** {dashboard['compound_analytics']['growth_q1_to_q4']:.1f}%
- **Q1 to Q8 Growth:** {dashboard['compound_analytics']['growth_q1_to_q8']:.1f}%

---

## Output Files Generated

✅ `live_second_trace.csv` - Second-by-second yield for first minute  
✅ `live_daily_trace.csv` - Daily accumulation for full quarter  
✅ `live_quarter_trace_pi4.csv` - Quarterly projection with π₄ compounding  
✅ `live_pi4_acceleration_curve.csv` - Detailed acceleration curve  
✅ `live_quarter_law_dashboard.json` - Complete dashboard data

---

**Status:** Live Quarter-Law Trace System OPERATIONAL  
**Security:** Blu-Vault authorization required for modifications  
**Audit:** All tick pre-authorized and ledger-recorded
"""
        
        return report


def main():
    """Main execution function."""
    print("=" * 80)
    print("BLEU Codex Triple-Stack Treasury")
    print("Live Quarter-Law Trace System")
    print("=" * 80)
    print()
    
    # Initialize trace system
    tracer = LiveQuarterLawTrace()
    
    # Generate all outputs
    print("📊 Generating live traces...")
    tracer.export_csv_traces()
    
    print("\n📈 Generating dashboard data...")
    dashboard = tracer.export_dashboard_json()
    
    print("\n📝 Generating markdown report...")
    report = tracer.generate_markdown_report()
    report_path = Path("data/snapshots/LIVE_QUARTER_LAW_TRACE_REPORT.md")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, 'w') as f:
        f.write(report)
    print(f"✅ Report saved to {report_path}")
    
    print("\n" + "=" * 80)
    print("✅ Live Quarter-Law Trace System: OPERATIONAL")
    print("=" * 80)
    print(f"\nTotal yield per second: ${tracer.total_per_sec:,} USD")
    print(f"Total yield per day: ${tracer.total_per_sec * tracer.seconds_per_day:,} USD")
    print(f"π₄ compound factor: {tracer.pi4:.9f}")
    print()


if __name__ == "__main__":
    main()
