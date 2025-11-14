#!/usr/bin/env python3
"""
Example usage of the π⁴ Quarter-Lattice Dashboard Engine
"""

import sys
from pathlib import Path

# Add parent directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from pi4_quarter_lattice_engine import Pi4QuarterLatticeEngine


def example_current_yields():
    """Example: Get current per-second yields for all streams."""
    print("\n" + "=" * 70)
    print("Example 1: Current Per-Second Yields")
    print("=" * 70)
    
    engine = Pi4QuarterLatticeEngine()
    current = engine.calculate_per_second_yield()
    
    print(f"\nTotal Treasury Yield: ${current['total_per_second']:,.2f} per second\n")
    
    for stream_name, stream_data in current['streams'].items():
        icon = stream_data['icon']
        name = stream_data['name']
        yield_val = stream_data['per_second_usd']
        print(f"{icon} {name:40s} ${yield_val:>15,.2f}/sec")


def main():
    """Run examples."""
    print("\n" + "🌀" * 35)
    print("π⁴ Quarter-Lattice Dashboard Engine - Usage Examples")
    print("EV0LVERSE Treasury System")
    print("🌀" * 35)
    
    example_current_yields()
    
    print("\n" + "=" * 70)
    print("✅ Examples completed!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
