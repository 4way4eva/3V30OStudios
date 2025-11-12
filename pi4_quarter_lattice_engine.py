#!/usr/bin/env python3
"""
π⁴ Quarter-Lattice Dashboard Engine
EV0LVERSE Treasury and Expansion System

This module generates integrated yield calculations for the MetaVault Treasury,
combining Civilian, Military, and Cosmic streams with π⁴ compounding,
BLEU sector flowmaps, and PPPPI layer economics.
"""

import json
import csv
import math
import datetime
from pathlib import Path
from typing import Dict, List, Any


class Pi4QuarterLatticeEngine:
    """
    Core calculation engine for the π⁴ Quarter-Lattice Treasury System.
    Integrates MetaVault streams, BLEU flowmaps, and PPPPI layers.
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.pi4 = 97.409  # π⁴ compounding factor
        
        # Load configuration files
        self.metavault_config = self._load_json("METAVAULT_config.json")
        self.bleu_flowmap = self._load_json("BLEU_FLOWMAP.json")
        self.ppppi_layers = self._load_json("PPPPI_layers.json")
        
        # Extract yield streams
        self.streams = self.metavault_config["metavault_treasury"]["yield_streams"]
        self.aggregated = self.metavault_config["metavault_treasury"]["aggregated_metrics"]
        
    def _load_json(self, filename: str) -> Dict:
        """Load JSON configuration file."""
        filepath = self.data_dir / filename
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: {filename} not found in {self.data_dir}")
            return {}
    
    def calculate_per_second_yield(self, timestamp_seconds: int = None) -> Dict[str, Any]:
        """
        Calculate instantaneous yield per second for all streams.
        
        Args:
            timestamp_seconds: Optional timestamp for historical calculation
            
        Returns:
            Dictionary with per-second yields for each stream
        """
        if timestamp_seconds is None:
            timestamp_seconds = 0  # Current moment
            
        result = {
            "timestamp": timestamp_seconds,
            "streams": {},
            "total_per_second": 0
        }
        
        for stream_name, stream_data in self.streams.items():
            per_second = stream_data["per_second_usd"]
            result["streams"][stream_name] = {
                "per_second_usd": per_second,
                "name": stream_data["name"],
                "icon": stream_data["icon"],
                "color": stream_data["color"]
            }
            result["total_per_second"] += per_second
            
        return result
    
    def calculate_daily_yield(self, day: int = 1) -> Dict[str, Any]:
        """
        Calculate accumulated yield for a specific day.
        
        Args:
            day: Day number (1-90 for quarter)
            
        Returns:
            Dictionary with daily yields for each stream
        """
        seconds_per_day = self.aggregated["seconds_per_day"]
        
        result = {
            "day": day,
            "streams": {},
            "total_daily": 0
        }
        
        for stream_name, stream_data in self.streams.items():
            daily_yield = stream_data["per_second_usd"] * seconds_per_day
            result["streams"][stream_name] = {
                "daily_usd": daily_yield,
                "name": stream_data["name"],
                "icon": stream_data["icon"],
                "color": stream_data["color"]
            }
            result["total_daily"] += daily_yield
            
        return result
    
    def calculate_quarter_yield_trace(self, days: int = 90) -> List[Dict[str, Any]]:
        """
        Generate day-by-day yield trace for an entire quarter.
        
        Args:
            days: Number of days in quarter (default 90)
            
        Returns:
            List of daily yield dictionaries
        """
        trace = []
        
        for day in range(1, days + 1):
            day_data = self.calculate_daily_yield(day)
            
            # Calculate cumulative yields
            cumulative = {
                "day": day,
                "streams": {}
            }
            
            for stream_name in self.streams.keys():
                cumulative["streams"][stream_name] = {
                    "cumulative_usd": day_data["streams"][stream_name]["daily_usd"] * day
                }
            
            cumulative["total_cumulative"] = day_data["total_daily"] * day
            
            trace.append(cumulative)
            
        return trace
    
    def calculate_pi4_compounding(self, quarters: int = 4) -> List[Dict[str, Any]]:
        """
        Calculate π⁴ compounding over multiple quarters.
        
        Args:
            quarters: Number of quarters to project
            
        Returns:
            List of quarterly compounded yields
        """
        seconds_per_quarter = self.aggregated["seconds_per_quarter"]
        initial_yield = self.aggregated["total_per_second_usd"] * seconds_per_quarter
        
        results = []
        current_yield = initial_yield
        
        for q in range(1, quarters + 1):
            quarter_data = {
                "quarter": q,
                "quarter_yield_usd": current_yield,
                "streams": {}
            }
            
            # Calculate proportional yields per stream
            for stream_name, stream_data in self.streams.items():
                stream_proportion = stream_data["per_second_usd"] / self.aggregated["total_per_second_usd"]
                quarter_data["streams"][stream_name] = {
                    "yield_usd": current_yield * stream_proportion,
                    "name": stream_data["name"]
                }
            
            results.append(quarter_data)
            
            # Apply π⁴ compounding for next quarter
            current_yield *= self.pi4
            
        return results
    
    def calculate_bleu_sector_allocation(self, total_amount: float) -> Dict[str, Any]:
        """
        Calculate BLEU sector allocations based on flowmap percentages.
        
        Args:
            total_amount: Total amount to allocate across sectors
            
        Returns:
            Dictionary with allocated amounts per sector
        """
        allocations = {}
        
        for sector_name, sector_data in self.bleu_flowmap.get("bleu_flowmap", {}).items():
            sector_allocations = {}
            
            for subsector_name, subsector_data in sector_data["sectors"].items():
                percent = subsector_data["percent"] / 100.0
                allocated = total_amount * percent
                
                sector_allocations[subsector_name] = {
                    "allocated_usd": allocated,
                    "percent": subsector_data["percent"],
                    "description": subsector_data["description"]
                }
            
            allocations[sector_name] = {
                "subsectors": sector_allocations,
                "total_allocated": sum(s["allocated_usd"] for s in sector_allocations.values()),
                "symbol": sector_data["symbol"],
                "vault_id": sector_data["vault_id"]
            }
            
        return allocations
    
    def generate_live_dashboard_data(self) -> Dict[str, Any]:
        """
        Generate complete dashboard data package for visualization.
        
        Returns:
            Comprehensive dictionary with all calculated data
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        
        dashboard_data = {
            "generated_at": now.isoformat(),
            "timestamp": int(now.timestamp()),
            
            # Real-time yields
            "current_yields": self.calculate_per_second_yield(),
            
            # Daily breakdown
            "today_yield": self.calculate_daily_yield(1),
            
            # Quarter trace (first and last 7 days for summary)
            "quarter_trace_summary": {
                "first_week": self.calculate_quarter_yield_trace(7),
                "quarter_end": self.calculate_quarter_yield_trace(90)[-7:]
            },
            
            # π⁴ Compounding projection
            "pi4_projection": self.calculate_pi4_compounding(4),
            
            # BLEU sector allocations (based on daily civilian yield)
            "bleu_sector_allocations": self.calculate_bleu_sector_allocation(
                self.streams["civilian"]["per_second_usd"] * self.aggregated["seconds_per_day"]
            ),
            
            # PPPPI layer info
            "ppppi_layers": self.ppppi_layers.get("ppppi_layers", {}),
            
            # Infrastructure metrics
            "infrastructure": self.metavault_config["metavault_treasury"]["infrastructure"],
            
            # Metadata
            "meta": {
                "pi4_value": self.pi4,
                "compounding_method": "π⁴ Quarter-Lattice",
                "treasury_status": "Active - Triple-Stack Flowing",
                "sovereign_override": "Commander Bleu"
            }
        }
        
        return dashboard_data
    
    def export_to_json(self, output_file: str = "pi4_dashboard_data.json"):
        """Export dashboard data to JSON file."""
        data = self.generate_live_dashboard_data()
        
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ Dashboard data exported to {output_file}")
        
    def export_quarter_trace_csv(self, output_file: str = "quarter_trace_full.csv"):
        """Export full quarter trace to CSV."""
        trace = self.calculate_quarter_yield_trace(90)
        
        with open(output_file, 'w', newline='') as f:
            fieldnames = ["day", "civilian_cumulative", "military_cumulative", 
                         "cosmic_cumulative", "total_cumulative"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for day_data in trace:
                row = {
                    "day": day_data["day"],
                    "civilian_cumulative": day_data["streams"]["civilian"]["cumulative_usd"],
                    "military_cumulative": day_data["streams"]["military"]["cumulative_usd"],
                    "cosmic_cumulative": day_data["streams"]["cosmic"]["cumulative_usd"],
                    "total_cumulative": day_data["total_cumulative"]
                }
                writer.writerow(row)
        
        print(f"✅ Quarter trace exported to {output_file}")
    
    def export_pi4_compounding_csv(self, output_file: str = "pi4_compounding_projection.csv"):
        """Export π⁴ compounding projection to CSV."""
        projection = self.calculate_pi4_compounding(4)
        
        with open(output_file, 'w', newline='') as f:
            fieldnames = ["quarter", "total_yield", "civilian_yield", 
                         "military_yield", "cosmic_yield"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for quarter_data in projection:
                row = {
                    "quarter": quarter_data["quarter"],
                    "total_yield": quarter_data["quarter_yield_usd"],
                    "civilian_yield": quarter_data["streams"]["civilian"]["yield_usd"],
                    "military_yield": quarter_data["streams"]["military"]["yield_usd"],
                    "cosmic_yield": quarter_data["streams"]["cosmic"]["yield_usd"]
                }
                writer.writerow(row)
        
        print(f"✅ π⁴ compounding projection exported to {output_file}")


def main():
    """Main execution function."""
    print("🌀 π⁴ Quarter-Lattice Engine - EV0LVERSE Treasury System")
    print("=" * 70)
    
    # Initialize engine
    engine = Pi4QuarterLatticeEngine()
    
    # Generate and export all data
    print("\n📊 Generating dashboard data...")
    engine.export_to_json("data/pi4_dashboard_data.json")
    
    print("\n📈 Generating quarter trace CSV...")
    engine.export_quarter_trace_csv("quarter_trace_full.csv")
    
    print("\n💹 Generating π⁴ compounding projection CSV...")
    engine.export_pi4_compounding_csv("pi4_compounding_projection.csv")
    
    # Display current yields
    print("\n" + "=" * 70)
    print("💰 CURRENT YIELD RATES (per second):")
    print("=" * 70)
    
    current = engine.calculate_per_second_yield()
    for stream_name, stream_data in current["streams"].items():
        icon = stream_data["icon"]
        name = stream_data["name"]
        yield_val = stream_data["per_second_usd"]
        print(f"{icon} {name:40s} ${yield_val:>15,.2f}/sec")
    
    print("-" * 70)
    print(f"{'TOTAL':45s} ${current['total_per_second']:>15,.2f}/sec")
    
    # Display daily totals
    print("\n" + "=" * 70)
    print("📅 DAILY YIELD TOTALS:")
    print("=" * 70)
    
    daily = engine.calculate_daily_yield(1)
    for stream_name, stream_data in daily["streams"].items():
        icon = stream_data["icon"]
        name = stream_data["name"]
        yield_val = stream_data["daily_usd"]
        print(f"{icon} {name:40s} ${yield_val:>15,.2f}/day")
    
    print("-" * 70)
    print(f"{'TOTAL':45s} ${daily['total_daily']:>15,.2f}/day")
    
    print("\n✅ All data generated successfully!")
    print("\nFiles created:")
    print("  • data/pi4_dashboard_data.json - Full dashboard data")
    print("  • quarter_trace_full.csv - 90-day quarter trace")
    print("  • pi4_compounding_projection.csv - π⁴ compounding over 4 quarters")


if __name__ == "__main__":
    main()
