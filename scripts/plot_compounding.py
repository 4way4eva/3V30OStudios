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
Plot Compounding Script

Generates visualization of π₄ exponential compounding model from MetaVault ledger data.

Usage:
    python scripts/plot_compounding.py
    python scripts/plot_compounding.py --input MetaVault_Ledger.json --output compounding_chart.png

Requirements:
    pip install matplotlib

Example:
    # Basic usage
    python scripts/plot_compounding.py
    
    # Custom input/output
    python scripts/plot_compounding.py --input ./data/MetaVault_Ledger.json --output ./charts/yield.png
    
    # High resolution output
    python scripts/plot_compounding.py --dpi 300
"""

import json
import argparse
import sys
from pathlib import Path

try:
    import matplotlib.pyplot as plt
    import matplotlib.ticker as ticker
except ImportError:
    print("Error: matplotlib is required. Install with: pip install matplotlib")
    sys.exit(1)


def load_ledger_data(input_path):
    """Load MetaVault ledger JSON data"""
    try:
        with open(input_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}")
        print("Run 'python scripts/metavault_batch_mint.py' first to generate the ledger.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in input file: {e}")
        sys.exit(1)


def plot_domain_yields(ledger_data, output_path='compounding_chart.png', dpi=150):
    """Generate and save compounding chart"""
    
    epochs = ledger_data.get('epochs', [])
    if not epochs:
        print("Error: No epoch data found in ledger")
        sys.exit(1)
    
    # Extract data for plotting
    epoch_numbers = []
    domain_yields = {}
    total_yields = []
    
    for epoch_data in epochs:
        epoch_numbers.append(epoch_data['epoch'])
        total_yields.append(epoch_data['total_yield_per_sec'])
        
        for domain_name, domain_data in epoch_data['domains'].items():
            if domain_name not in domain_yields:
                domain_yields[domain_name] = []
            domain_yields[domain_name].append(domain_data['compounded_yield_per_sec'])
    
    # Create figure with subplots
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    fig.suptitle('MEGAZION π₄ Exponential Compounding Model', fontsize=16, fontweight='bold')
    
    # Plot 1: Individual domain yields
    colors = {'CIVILIAN': '#3498db', 'MILITARY': '#e74c3c', 'COSMIC': '#9b59b6'}
    
    for domain_name, yields in domain_yields.items():
        color = colors.get(domain_name, '#34495e')
        ax1.plot(epoch_numbers, yields, marker='o', linewidth=2, 
                label=domain_name, color=color)
    
    ax1.set_xlabel('Epoch', fontsize=12)
    ax1.set_ylabel('Yield (USD/sec)', fontsize=12)
    ax1.set_title('Domain-Specific Yield Growth', fontsize=14, pad=10)
    ax1.legend(loc='upper left', fontsize=10)
    ax1.grid(True, alpha=0.3)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    
    # Plot 2: Total system yield
    ax2.plot(epoch_numbers, total_yields, marker='s', linewidth=3, 
            color='#27ae60', label='Total System Yield')
    ax2.fill_between(epoch_numbers, total_yields, alpha=0.3, color='#27ae60')
    
    ax2.set_xlabel('Epoch', fontsize=12)
    ax2.set_ylabel('Total Yield (USD/sec)', fontsize=12)
    ax2.set_title('Total System Yield Growth', fontsize=14, pad=10)
    ax2.legend(loc='upper left', fontsize=10)
    ax2.grid(True, alpha=0.3)
    ax2.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    
    # Add metadata annotation
    metadata = ledger_data.get('metadata', {})
    pi4_factor = metadata.get('pi4_factor', 'N/A')
    base_yield = metadata.get('base_yield_usd_per_sec', 'N/A')
    
    info_text = f"π₄ Factor: {pi4_factor}\nBase Yield: ${base_yield:,}/sec"
    fig.text(0.99, 0.01, info_text, ha='right', va='bottom', 
            fontsize=9, bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.tight_layout()
    
    # Save figure
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=dpi, bbox_inches='tight')
    print(f"✓ Chart saved: {output_path}")
    
    # Show summary statistics
    print("\nSummary Statistics:")
    print(f"  - Total epochs plotted: {len(epoch_numbers)}")
    print(f"  - Final total yield: ${total_yields[-1]:,.2f}/sec")
    print(f"  - Final daily yield: ${total_yields[-1] * 86400:,.2f}/day")
    
    for domain_name, yields in domain_yields.items():
        print(f"  - {domain_name} final yield: ${yields[-1]:,.2f}/sec")


def main():
    parser = argparse.ArgumentParser(
        description='Generate compounding visualization from MetaVault ledger',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
"""
MIT License

Copyright (c) 2025 3V30OStudios

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

"""
MetaVault Compounding Visualization
MEGAZION / BLEULIONTREASURY Feature Package

Reads MetaVault_Ledger.json and generates compounding visualization PNG.

Usage:
    python3 scripts/plot_compounding.py
    python3 scripts/plot_compounding.py --input custom_ledger.json --output custom_plot.png

Requires: matplotlib
Install: pip3 install matplotlib

See README_48fold.md and README_RUN_LOCAL.md for complete documentation.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any

try:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from datetime import datetime
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
    
    def __init__(self, ledger_path: str = "MetaVault_Ledger.json"):
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
    
    def create_visualization(self, output_path: str = "metavault_compounding.png") -> None:
        """
        Create comprehensive compounding visualization.
        
        Args:
            output_path: Output PNG file path
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
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        print(f"✓ Saved visualization: {output_path}")
        
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
        final_entry = self.ledger_entries[-1]
        print("\nFinal Domain Distribution:")
        print(f"  Ω-CIV (Civilian): ${series['civilian_yields'][-1]:,.2f}/sec")
        print(f"  Ω-MIL (Military): ${series['military_yields'][-1]:,.2f}/sec")
        print(f"  Ω-COS (Cosmic): ${series['cosmic_yields'][-1]:,.2f}/sec")


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='MetaVault Compounding Plotter - Visualize π₄ yield dynamics'
    )
    parser.add_argument(
        '--input',
        type=str,
        default='MetaVault_Ledger.json',
        help='Input MetaVault_Ledger.json file (default: MetaVault_Ledger.json)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='compounding_chart.png',
        help='Output PNG file (default: compounding_chart.png)'
    )
    parser.add_argument(
        '--dpi',
        type=int,
        default=150,
        help='DPI for output image (default: 150)'
        default='metavault_compounding.png',
        help='Output PNG file path'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("MEGAZION Compounding Plotter")
    print("=" * 60)
    print()
    
    print(f"Loading ledger data from: {args.input}")
    ledger_data = load_ledger_data(args.input)
    
    print("Generating compounding chart...")
    plot_domain_yields(ledger_data, args.output, args.dpi)
    
    print("\n" + "=" * 60)
    print("✓ Plotting complete!")
    print("=" * 60)


if __name__ == '__main__':
    # Create plotter and generate visualization
    plotter = CompoundingPlotter(ledger_path=args.input)
    plotter.create_visualization(output_path=args.output)
    
    print("\n" + "=" * 60)
    print("Visualization Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Open the generated PNG to view compounding dynamics")
    print("  2. Adjust snapshot count if needed: python3 scripts/metavault_batch_mint.py --snapshots N")
    print("  3. See README_48fold.md for complete workflow")


if __name__ == "__main__":
    main()
