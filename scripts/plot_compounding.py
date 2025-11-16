#!/usr/bin/env python3
# MIT License
# 
# Copyright (c) 2024 3V30OStudios / MEGAZION Codex
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

"""
MetaVault Compounding Visualization
MEGAZION / BLEULIONTREASURY Feature Package

Reads MetaVault_Ledger.json and generates compounding visualization PNG.

Usage:
    python3 scripts/plot_compounding.py
    python3 scripts/plot_compounding.py --input outputs/MetaVault_Ledger.json
    python3 scripts/plot_compounding.py --output custom_plot.png --dpi 300

Requires: matplotlib
Install: pip3 install matplotlib

See README documentation for complete workflow.
"""

import json
import sys
import argparse
from pathlib import Path
from typing import Dict, List
from datetime import datetime

try:
    import matplotlib.pyplot as plt
except ImportError:
    print("Error: matplotlib is required for plotting")
    print("Install with: pip3 install matplotlib")
    sys.exit(1)


class CompoundingPlotter:
    """
    Visualization engine for MetaVault π₄ compounding dynamics.
    
    Generates multi-panel plots showing:
    - Total yield over time
    - Domain-specific yields (Civilian, Military, Cosmic)
    - Compounding multiplier progression
    """
    
    def __init__(self, ledger_path: str = "outputs/MetaVault_Ledger.json"):
        """Initialize with ledger data."""
        self.ledger_path = Path(ledger_path)
        self.data = self._load_ledger()
        
        # Extract metadata
        self.metadata = self.data.get("metadata", {})
        self.ledger_entries = self.data.get("ledger_entries", [])
        self.pi4 = self.metadata.get("pi4_factor", 97.409)
        
    def _load_ledger(self) -> Dict:
        """Load ledger JSON file."""
        if not self.ledger_path.exists():
            print(f"Error: Ledger file not found at {self.ledger_path}")
            print("Please run: python3 scripts/metavault_batch_mint.py")
            sys.exit(1)
        
        with open(self.ledger_path, 'r') as f:
            return json.load(f)
    
    def extract_time_series(self) -> Dict[str, List]:
        """
        Extract time series data from ledger entries.
        
        Returns:
            Dictionary containing lists of timestamps and yield values
        """
        timestamps = []
        total_yields = []
        civilian_yields = []
        military_yields = []
        cosmic_yields = []
        multipliers = []
        
        for entry in self.ledger_entries:
            # Parse timestamp
            ts = datetime.fromisoformat(entry["timestamp"].replace('Z', '+00:00'))
            timestamps.append(ts)
            
            # Extract yields
            total_yields.append(entry["total_yield_usd_per_second"])
            civilian_yields.append(entry["yields"]["civilian"]["usd_per_second"])
            military_yields.append(entry["yields"]["military"]["usd_per_second"])
            cosmic_yields.append(entry["yields"]["cosmic"]["usd_per_second"])
            multipliers.append(entry["compound_multiplier"])
        
        return {
            "timestamps": timestamps,
            "total_yields": total_yields,
            "civilian_yields": civilian_yields,
            "military_yields": military_yields,
            "cosmic_yields": cosmic_yields,
            "multipliers": multipliers
        }
    
    def create_visualization(self, output_path: str = "outputs/metavault_compounding.png", dpi: int = 150) -> None:
        """
        Create comprehensive compounding visualization.
        
        Args:
            output_path: Output PNG file path
            dpi: Image resolution (dots per inch)
        """
        print(f"Creating visualization from {len(self.ledger_entries)} ledger entries...")
        
        # Extract time series
        series = self.extract_time_series()
        
        # Create figure with subplots
        fig, axes = plt.subplots(3, 1, figsize=(14, 12))
        fig.suptitle(f'MetaVault π₄ Compounding Dynamics (π⁴ = {self.pi4})', 
                     fontsize=16, fontweight='bold')
        
        # Plot 1: Total Yield Over Time
        ax1 = axes[0]
        ax1.plot(series["timestamps"], series["total_yields"], 
                color='#1f77b4', linewidth=2, label='Total Yield')
        ax1.set_xlabel('Time', fontsize=11)
        ax1.set_ylabel('USD per Second', fontsize=11)
        ax1.set_title('Total System Yield (All Domains)', fontsize=13, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.legend(loc='upper left')
        ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # Format y-axis with scientific notation
        ax1.ticklabel_format(style='scientific', axis='y', scilimits=(0, 0))
        
        # Plot 2: Domain-Specific Yields
        ax2 = axes[1]
        ax2.plot(series["timestamps"], series["civilian_yields"], 
                color='#2ca02c', linewidth=2, label='Ω-CIV (Civilian)', alpha=0.8)
        ax2.plot(series["timestamps"], series["military_yields"], 
                color='#d62728', linewidth=2, label='Ω-MIL (Military)', alpha=0.8)
        ax2.plot(series["timestamps"], series["cosmic_yields"], 
                color='#9467bd', linewidth=2, label='Ω-COS (Cosmic)', alpha=0.8)
        ax2.set_xlabel('Time', fontsize=11)
        ax2.set_ylabel('USD per Second', fontsize=11)
        ax2.set_title('Domain-Specific Yields', fontsize=13, fontweight='bold')
        ax2.grid(True, alpha=0.3)
        ax2.legend(loc='upper left')
        ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
        ax2.ticklabel_format(style='scientific', axis='y', scilimits=(0, 0))
        
        # Plot 3: Compounding Multiplier
        ax3 = axes[2]
        ax3.plot(series["timestamps"], series["multipliers"], 
                color='#ff7f0e', linewidth=2, label='Compound Multiplier')
        ax3.set_xlabel('Time', fontsize=11)
        ax3.set_ylabel('Multiplier', fontsize=11)
        ax3.set_title('π₄ Compounding Multiplier Progression', fontsize=13, fontweight='bold')
        ax3.grid(True, alpha=0.3)
        ax3.legend(loc='upper left')
        ax3.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
        plt.setp(ax3.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # Add annotation with key metrics
        final_multiplier = series["multipliers"][-1]
        final_total = series["total_yields"][-1]
        initial_total = series["total_yields"][0]
        growth_factor = final_total / initial_total
        
        textstr = f'Final Multiplier: {final_multiplier:.3f}x\n'
        textstr += f'Growth Factor: {growth_factor:.3f}x\n'
        textstr += f'Snapshots: {len(self.ledger_entries)}'
        
        props = dict(boxstyle='round', facecolor='wheat', alpha=0.5)
        ax3.text(0.02, 0.98, textstr, transform=ax3.transAxes, fontsize=10,
                verticalalignment='top', bbox=props)
        
        # Adjust layout and save
        plt.tight_layout()
        
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_file, dpi=dpi, bbox_inches='tight')
        print(f"✓ Saved visualization: {output_file}")
        
        # Display stats
        print("\n" + "=" * 60)
        print("Visualization Statistics:")
        print("=" * 60)
        print(f"Initial Total Yield: ${initial_total:,.2f}/sec")
        print(f"Final Total Yield: ${final_total:,.2f}/sec")
        print(f"Growth Factor: {growth_factor:.3f}x")
        print(f"Final Multiplier: {final_multiplier:.3f}x")
        print(f"π⁴ Factor: {self.pi4}")
        
        # Domain breakdown at final snapshot
        print("\nFinal Domain Distribution:")
        print(f"  Ω-CIV (Civilian): ${series['civilian_yields'][-1]:,.2f}/sec")
        print(f"  Ω-MIL (Military): ${series['military_yields'][-1]:,.2f}/sec")
        print(f"  Ω-COS (Cosmic): ${series['cosmic_yields'][-1]:,.2f}/sec")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='MetaVault Compounding Plotter - Visualize π₄ yield dynamics',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--input',
        type=str,
        default='outputs/MetaVault_Ledger.json',
        help='Input MetaVault_Ledger.json file (default: outputs/MetaVault_Ledger.json)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='outputs/metavault_compounding.png',
        help='Output PNG file path (default: outputs/metavault_compounding.png)'
    )
    parser.add_argument(
        '--dpi',
        type=int,
        default=150,
        help='DPI for output image (default: 150)'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("MEGAZION Compounding Plotter")
    print("=" * 60)
    print()
    
    # Create plotter and generate visualization
    plotter = CompoundingPlotter(ledger_path=args.input)
    plotter.create_visualization(output_path=args.output, dpi=args.dpi)
    
    print("\n" + "=" * 60)
    print("Visualization Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Open the generated PNG to view compounding dynamics")
    print("  2. Adjust snapshot count if needed: python3 scripts/metavault_batch_mint.py --snapshots N")
    print("  3. See README documentation for complete workflow")


if __name__ == "__main__":
    main()

