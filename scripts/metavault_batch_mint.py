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
MetaVault Batch Mint Script
MEGAZION / BLEULIONTREASURY Feature Package

This script produces:
- outputs/MetaVault_Yield_Ledger.csv
- outputs/MetaVault_Ledger.json
- outputs/enft_ledger_epoch1.json

Implements π₄ (pi^4 = 97.409) exponential compounding model with
snapshots per tick and CSV export functionality.

Usage:
    python3 scripts/metavault_batch_mint.py
    python3 scripts/metavault_batch_mint.py --snapshots 48 --verbose
    python3 scripts/metavault_batch_mint.py --config scripts/config.json

Configuration:
    Reads from scripts/config.json DEFAULT_CONFIG section.
    
Example:
    # Generate 24 snapshots (default from config)
    python3 scripts/metavault_batch_mint.py
    
    # Generate custom number of snapshots
    python3 scripts/metavault_batch_mint.py --snapshots 48
    
    # Verbose output
    python3 scripts/metavault_batch_mint.py --verbose

See README_48fold.md and README_RUN_LOCAL.md for complete documentation.

Note:
    This script does NOT broadcast transactions. It generates local ledger 
    files for analysis and planning only.
"""

import json
import csv
import argparse
import math
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional


class MetaVaultBatchMint:
    """
    MetaVault batch minting engine with π₄ compounding mechanics.
    
    Generates comprehensive yield ledger across three economic domains:
    - Civilian (Ω-CIV): 47.6% of total yield
    - Military (Ω-MIL): 21.3% of total yield  
    - Cosmic (Ω-COS): 31.1% of total yield
    """
    
    def __init__(self, config_path: str = "scripts/config.json", verbose: bool = False):
        """Initialize with configuration."""
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self.verbose = verbose
        self.pi4 = 97.409  # π⁴ compounding factor
        
        # Extract configuration
        treasury_config = self.config["DEFAULT_CONFIG"]["metavault_treasury"]
        self.yield_streams = treasury_config["yield_streams"]
        self.aggregated = treasury_config["aggregated_metrics"]
        
        sim_config = self.config["DEFAULT_CONFIG"]["simulation"]
        self.tick_duration = sim_config["tick_duration_seconds"]
        self.ticks_per_snapshot = sim_config["ticks_per_snapshot"]
        self.total_snapshots = sim_config["total_snapshots"]
        
        # Ledger storage
        self.ledger_entries = []
        self.enft_records = []
        
        if self.verbose:
            print(f"Loaded config from: {self.config_path}")
            print(f"π₄ factor: {self.pi4}")
            print(f"Total snapshots: {self.total_snapshots}")
        
    def _load_config(self) -> Dict:
        """Load configuration from JSON file."""
        if not self.config_path.exists():
            print(f"Error: Config file not found at {self.config_path}")
            print("Please ensure scripts/config.json exists.")
            sys.exit(1)
            
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in config file: {e}")
            sys.exit(1)
    
    def calculate_compounded_yield(self, base_yield: float, tick: int) -> float:
        """
        Calculate compounded yield using π₄ exponential model.
        
        Formula: yield(t) = base_yield * (1 + pi4/100)^(t/3600)
        
        Args:
            base_yield: Base yield in USD per second
            tick: Current tick number
            
        Returns:
            Compounded yield value
        """
        hours = tick / 3600.0
        compound_factor = math.pow(1 + (self.pi4 / 100), hours)
        return base_yield * compound_factor
    
    def generate_snapshot(self, snapshot_id: int, start_tick: int) -> Dict[str, Any]:
        """
        Generate a single snapshot entry at specified tick.
        
        Args:
            snapshot_id: Unique snapshot identifier
            start_tick: Starting tick for this snapshot
            
        Returns:
            Dictionary containing snapshot data
        """
        timestamp = datetime.utcnow() + timedelta(seconds=start_tick * self.tick_duration)
        
        # Calculate compounded yields for each domain
        civilian_yield = self.calculate_compounded_yield(
            self.yield_streams["civilian"]["usd_per_second"],
            start_tick
        )
        military_yield = self.calculate_compounded_yield(
            self.yield_streams["military"]["usd_per_second"],
            start_tick
        )
        cosmic_yield = self.calculate_compounded_yield(
            self.yield_streams["cosmic"]["usd_per_second"],
            start_tick
        )
        
        total_yield = civilian_yield + military_yield + cosmic_yield
        
        snapshot = {
            "snapshot_id": snapshot_id,
            "tick": start_tick,
            "timestamp": timestamp.isoformat(),
            "yields": {
                "civilian": {
                    "domain": "Ω-CIV",
                    "usd_per_second": round(civilian_yield, 6),
                    "daily_usd": round(civilian_yield * 86400, 2)
                },
                "military": {
                    "domain": "Ω-MIL",
                    "usd_per_second": round(military_yield, 6),
                    "daily_usd": round(military_yield * 86400, 2)
                },
                "cosmic": {
                    "domain": "Ω-COS",
                    "usd_per_second": round(cosmic_yield, 6),
                    "daily_usd": round(cosmic_yield * 86400, 2)
                }
            },
            "total_yield_usd_per_second": round(total_yield, 6),
            "total_daily_usd": round(total_yield * 86400, 2),
            "pi4_factor": self.pi4,
            "compound_multiplier": round(math.pow(1 + (self.pi4 / 100), start_tick / 3600.0), 6)
        }
        
        if self.verbose:
            print(f"  Snapshot {snapshot_id}: tick={start_tick}, total_yield={snapshot['total_yield_usd_per_second']:.2f} USD/sec")
        
        return snapshot
    
    def generate_enft_record(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate ENFT ledger record from snapshot.
        
        Args:
            snapshot: Snapshot dictionary
            
        Returns:
            ENFT record dictionary
        """
        enft_config = self.config["DEFAULT_CONFIG"]["enft_ledger"]
        
        record = {
            "snapshot_id": snapshot["snapshot_id"],
            "tick": snapshot["tick"],
            "timestamp": snapshot["timestamp"],
            "metadata_uri": f"{enft_config['metadata_uri_base']}REPLACE_WITH_CID/{snapshot['snapshot_id']}.json",
            "contract_address": enft_config["contract_address_placeholder"],
            "yields": snapshot["yields"],
            "schema_version": enft_config["schema_version"]
        }
        
        return record
    
    def run_batch_mint(self, custom_snapshots: Optional[int] = None) -> None:
        """
        Run the batch minting process.
        
        Args:
            custom_snapshots: Override number of snapshots from config
        """
        num_snapshots = custom_snapshots if custom_snapshots else self.total_snapshots
        
        print(f"\n{'='*60}")
        print(f"MetaVault Batch Mint - π₄ Compounding Engine")
        print(f"{'='*60}")
        print(f"Snapshots: {num_snapshots}")
        print(f"Ticks per snapshot: {self.ticks_per_snapshot}")
        print(f"π₄ factor: {self.pi4}")
        print()
        
        for i in range(num_snapshots):
            snapshot_id = i + 1
            start_tick = i * self.ticks_per_snapshot
            
            snapshot = self.generate_snapshot(snapshot_id, start_tick)
            enft_record = self.generate_enft_record(snapshot)
            
            self.ledger_entries.append(snapshot)
            self.enft_records.append(enft_record)
        
        print(f"\n✓ Generated {len(self.ledger_entries)} ledger snapshots")
        print(f"✓ Generated {len(self.enft_records)} ENFT records")
    
    def export_csv(self, output_path: str = "outputs/MetaVault_Yield_Ledger.csv") -> None:
        """
        Export ledger data to CSV format.
        
        Args:
            output_path: Output CSV file path
        """
        csv_path = Path(output_path)
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        
        rows = []
        for entry in self.ledger_entries:
            for domain_key, domain_data in entry["yields"].items():
                row = {
                    "Snapshot_ID": entry["snapshot_id"],
                    "Tick": entry["tick"],
                    "Timestamp": entry["timestamp"],
                    "Domain": domain_data["domain"],
                    "USD_Per_Second": domain_data["usd_per_second"],
                    "Daily_USD": domain_data["daily_usd"],
                    "Compound_Multiplier": entry["compound_multiplier"]
                }
                rows.append(row)
        
        with open(csv_path, 'w', newline='') as f:
            if rows:
                writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                writer.writeheader()
                writer.writerows(rows)
        
        print(f"✓ Exported CSV ledger: {csv_path}")
    
    def export_json(self, output_path: str = "outputs/MetaVault_Ledger.json") -> None:
        """
        Export ledger data to JSON format.
        
        Args:
            output_path: Output JSON file path
        """
        json_path = Path(output_path)
        json_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_data = {
            "metadata": {
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "pi4_factor": self.pi4,
                "total_snapshots": len(self.ledger_entries),
                "compounding_model": "exponential_pi4",
                "domains": ["Ω-CIV", "Ω-MIL", "Ω-COS"]
            },
            "configuration": self.config["DEFAULT_CONFIG"]["metavault_treasury"],
            "ledger_entries": self.ledger_entries
        }
        
        with open(json_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"✓ Exported JSON ledger: {json_path}")
    
    def export_enft_ledger(self, output_path: str = "outputs/enft_ledger_epoch1.json") -> None:
        """
        Export ENFT ledger records to JSON format.
        
        Args:
            output_path: Output JSON file path
        """
        json_path = Path(output_path)
        json_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_data = {
            "metadata": {
                "schema_version": "EVOL.ENFT.v1",
                "epoch": 1,
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "total_records": len(self.enft_records),
                "note": "Replace metadata_uri placeholders with actual IPFS CIDs after pinning"
            },
            "enft_records": self.enft_records
        }
        
        with open(json_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"✓ Exported ENFT ledger: {json_path}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='MetaVault Batch Mint - Generate yield ledger with π₄ compounding',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--snapshots',
        type=int,
        default=None,
        help='Number of snapshots to generate (default: from config)'
    )
    parser.add_argument(
        '--config',
        type=str,
        default='scripts/config.json',
        help='Path to config.json (default: scripts/config.json)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose output'
    )
    
    args = parser.parse_args()
    
    # Initialize and run
    minter = MetaVaultBatchMint(config_path=args.config, verbose=args.verbose)
    minter.run_batch_mint(custom_snapshots=args.snapshots)
    
    # Export all formats
    minter.export_csv()
    minter.export_json()
    minter.export_enft_ledger()
    
    print("\n" + "=" * 60)
    print("MetaVault Batch Mint Complete!")
    print("=" * 60)
    print("\nGenerated files:")
    print("  - outputs/MetaVault_Yield_Ledger.csv")
    print("  - outputs/MetaVault_Ledger.json")
    print("  - outputs/enft_ledger_epoch1.json")
    print("\nNext steps:")
    print("  1. Review generated ledger data")
    print("  2. Visualize compounding: python3 scripts/plot_compounding.py")
    print("  3. See README_48fold.md for complete workflow")


if __name__ == "__main__":
    main()
