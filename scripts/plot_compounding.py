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
MEGAZION / BLEULIONTREASURY Feature Package

Generates visualization of π₄ exponential compounding model from MetaVault ledger data.

Reads: outputs/MetaVault_Ledger.json
Writes: outputs/compounding_chart.png

Usage:
    python3 scripts/plot_compounding.py
    python3 scripts/plot_compounding.py --input outputs/MetaVault_Ledger.json
    python3 scripts/plot_compounding.py --output outputs/custom_chart.png
    python3 scripts/plot_compounding.py --dpi 300

Requirements:
    pip install matplotlib

Example:
    # Basic usage (uses defaults)
    python3 scripts/plot_compounding.py
    
    # Custom input/output
    python3 scripts/plot_compounding.py --input ./data/MetaVault_Ledger.json --output ./charts/yield.png
    
    # High resolution output
    python3 scripts/plot_compounding.py --dpi 300
    
    # Show plot interactively
    python3 scripts/plot_compounding.py --show

See README_48fold.md for complete workflow documentation.
"""

import json
import argparse
import sys
from pathlib import Path

try:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from datetime import datetime
except ImportError:
    print("Error: matplotlib is required for this script")
    print("Install with: pip install matplotlib")
    sys.exit(1)


def load_ledger_data(input_path: str) -> dict:
    """
    Load MetaVault ledger data from JSON file.
    
    Args:
        input_path: Path to MetaVault_Ledger.json
        
    Returns:
        Dictionary containing ledger data
    """
    json_path = Path(input_path)
    
    if not json_path.exists():
        print(f"Error: Input file not found: {input_path}")
        print("Please run metavault_batch_mint.py first to generate the ledger.")
        sys.exit(1)
    
    try:
        with open(json_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in input file: {e}")
        sys.exit(1)


def plot_compounding_chart(ledger_data: dict, output_path: str, dpi: int = 150, show: bool = False):
    """
    Generate compounding visualization chart.
    
    Args:
        ledger_data: Dictionary containing ledger data
        output_path: Path to save the PNG chart
        dpi: Resolution in dots per inch
        show: Whether to display the plot interactively
    """
    entries = ledger_data.get("ledger_entries", [])
    
    if not entries:
        print("Error: No ledger entries found in input data")
        sys.exit(1)
    
    # Extract data for plotting
    snapshots = []
    civilian_yields = []
    military_yields = []
    cosmic_yields = []
    total_yields = []
    compound_multipliers = []
    
    for entry in entries:
        snapshots.append(entry["snapshot_id"])
        civilian_yields.append(entry["yields"]["civilian"]["usd_per_second"])
        military_yields.append(entry["yields"]["military"]["usd_per_second"])
        cosmic_yields.append(entry["yields"]["cosmic"]["usd_per_second"])
        total_yields.append(entry["total_yield_usd_per_second"])
        compound_multipliers.append(entry["compound_multiplier"])
    
    # Create figure with subplots
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    fig.suptitle('MEGAZION MetaVault - π₄ Exponential Compounding Model', fontsize=16, fontweight='bold')
    
    # Plot 1: Yield per Domain
    ax1.plot(snapshots, civilian_yields, label='Ω-CIV (Civilian)', marker='o', linewidth=2, color='#2E86AB')
    ax1.plot(snapshots, military_yields, label='Ω-MIL (Military)', marker='s', linewidth=2, color='#A23B72')
    ax1.plot(snapshots, cosmic_yields, label='Ω-COS (Cosmic)', marker='^', linewidth=2, color='#F18F01')
    ax1.plot(snapshots, total_yields, label='Total Yield', marker='D', linewidth=3, color='#C73E1D', linestyle='--')
    
    ax1.set_xlabel('Snapshot ID', fontsize=12)
    ax1.set_ylabel('Yield (USD/second)', fontsize=12)
    ax1.set_title('Compounded Yield by Domain', fontsize=14, fontweight='bold')
    ax1.legend(loc='upper left', fontsize=10)
    ax1.grid(True, alpha=0.3)
    ax1.set_xlim(left=1)
    
    # Format y-axis with thousands separator
    ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{x:,.0f}'))
    
    # Plot 2: Compound Multiplier
    ax2.plot(snapshots, compound_multipliers, label='Compound Multiplier', marker='o', linewidth=2, color='#6A994E')
    ax2.set_xlabel('Snapshot ID', fontsize=12)
    ax2.set_ylabel('Multiplier', fontsize=12)
    ax2.set_title(f'π₄ Compound Multiplier (π₄ = {ledger_data["metadata"]["pi4_factor"]})', fontsize=14, fontweight='bold')
    ax2.legend(loc='upper left', fontsize=10)
    ax2.grid(True, alpha=0.3)
    ax2.set_xlim(left=1)
    
    # Add metadata text
    metadata = ledger_data.get("metadata", {})
    metadata_text = f"Generated: {metadata.get('generated_at', 'N/A')}\n"
    metadata_text += f"Total Snapshots: {metadata.get('total_snapshots', 'N/A')}\n"
    metadata_text += f"Model: {metadata.get('compounding_model', 'N/A')}"
    
    fig.text(0.99, 0.01, metadata_text, ha='right', va='bottom', fontsize=8, 
             family='monospace', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3))
    
    plt.tight_layout()
    
    # Save to file
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_file, dpi=dpi, bbox_inches='tight')
    print(f"✓ Chart saved: {output_file}")
    print(f"  Resolution: {dpi} DPI")
    print(f"  Snapshots plotted: {len(snapshots)}")
    
    # Show interactively if requested
    if show:
        plt.show()
    
    plt.close()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Plot π₄ Compounding Chart from MetaVault Ledger',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--input',
        type=str,
        default='outputs/MetaVault_Ledger.json',
        help='Input JSON file path (default: outputs/MetaVault_Ledger.json)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='outputs/compounding_chart.png',
        help='Output PNG file path (default: outputs/compounding_chart.png)'
    )
    parser.add_argument(
        '--dpi',
        type=int,
        default=150,
        help='Chart resolution in DPI (default: 150)'
    )
    parser.add_argument(
        '--show',
        action='store_true',
        help='Display the chart interactively after saving'
    )
    
    args = parser.parse_args()
    
    print(f"\n{'='*60}")
    print(f"MetaVault Compounding Chart Generator")
    print(f"{'='*60}")
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")
    print()
    
    # Load data and generate chart
    ledger_data = load_ledger_data(args.input)
    plot_compounding_chart(ledger_data, args.output, dpi=args.dpi, show=args.show)
    
    print("\n" + "=" * 60)
    print("Chart generation complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
