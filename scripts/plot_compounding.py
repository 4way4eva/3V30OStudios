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
    main()
