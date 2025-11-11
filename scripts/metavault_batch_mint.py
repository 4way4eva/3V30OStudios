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

Generates MetaVault yield ledger outputs using π₄ exponential compounding model.

Outputs:
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
MetaVault Batch Mint Script
MEGAZION / BLEULIONTREASURY Feature 
This script produces:
- MetaVault_Yield_Ledger.csv
- MetaVault_Ledger.json
- enft_ledger_epoch1.json

Usage:
    python scripts/metavault_batch_mint.py
    python scripts/metavault_batch_mint.py --epochs 10 --output-dir ./data

Configuration:
    Reads from scripts/config.json DEFAULT_CONFIG section.
    
Example:
    # Generate ledgers for 7 epochs
    python scripts/metavault_batch_mint.py --epochs 7
    
    # Custom output directory
    python scripts/metavault_batch_mint.py --output-dir ./exports
    
    # Verbose output
    python scripts/metavault_batch_mint.py --epochs 5 --verbose
Implements π₄ (pi^4 = 97.409) exponential compounding model with
snapshots per tick and CSV export functionality.

Usage:
    python3 scripts/metavault_batch_mint.py
    python3 scripts/metavault_batch_mint.py --ticks 10 --snapshots 5

See README_48fold.md and README_RUN_LOCAL.md for complete documentation.
"""

import json
import csv
import argparse
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path


def load_config(config_path='scripts/config.json'):
    """Load configuration from config.json"""
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
            return config.get('DEFAULT_CONFIG', {})
    except FileNotFoundError:
        print(f"Error: Config file not found at {config_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in config file: {e}")
        sys.exit(1)


def calculate_pi4_compound(base_amount, pi4_factor, periods):
    """
    Calculate π₄ exponential compounding.
    
    Formula: Final = Base × (π₄)^periods
    Where π₄ = 97.409
    """
    return base_amount * (pi4_factor ** periods)


def generate_domain_yield(domain_name, percentage, base_yield, pi4_factor, epoch):
    """Generate yield data for a specific domain (CIVILIAN, MILITARY, COSMIC)"""
    domain_yield = base_yield * percentage
    compounded_yield = calculate_pi4_compound(domain_yield, pi4_factor, epoch)
    
    return {
        'domain': domain_name,
        'base_yield_per_sec': domain_yield,
        'compounded_yield_per_sec': compounded_yield,
        'daily_yield': compounded_yield * 86400,
        'epoch': epoch
    }


def generate_metavault_ledger(config, epochs=5):
    """Generate complete MetaVault ledger data"""
    pi4_factor = config['pi4_factor']
    base_yield = config['base_yield_usd_per_sec']
    domains = config['domains']
    
    ledger_data = {
        'metadata': {
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'pi4_factor': pi4_factor,
            'base_yield_usd_per_sec': base_yield,
            'total_epochs': epochs,
            'compounding_model': config['compounding']['model']
        },
        'epochs': []
    }
    
    csv_rows = []
    
    for epoch in range(1, epochs + 1):
        epoch_data = {
            'epoch': epoch,
            'timestamp': (datetime.utcnow() + timedelta(days=epoch)).isoformat() + 'Z',
            'domains': {}
        }
        
        total_epoch_yield = 0
        
        for domain_name, domain_config in domains.items():
            yield_data = generate_domain_yield(
                domain_name,
                domain_config['percentage'],
                base_yield,
                pi4_factor,
                epoch
            )
            
            epoch_data['domains'][domain_name] = yield_data
            total_epoch_yield += yield_data['compounded_yield_per_sec']
            
            # Add to CSV
            csv_rows.append({
                'Epoch': epoch,
                'Domain': domain_name,
                'Base_Yield_USD_Per_Sec': f"{yield_data['base_yield_per_sec']:.2f}",
                'Compounded_Yield_USD_Per_Sec': f"{yield_data['compounded_yield_per_sec']:.2f}",
                'Daily_Yield_USD': f"{yield_data['daily_yield']:.2f}",
                'Description': domain_config['description']
            })
        
        epoch_data['total_yield_per_sec'] = total_epoch_yield
        epoch_data['total_daily_yield'] = total_epoch_yield * 86400
        ledger_data['epochs'].append(epoch_data)
    
    return ledger_data, csv_rows


def generate_enft_ledger(metavault_ledger, config):
    """Generate ENFT ledger from MetaVault data"""
    enft_ledger = {
        'version': '1.0',
        'epoch': 1,
        'metadata': {
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'base_ipfs_gateway': config['metadata']['base_ipfs_gateway'],
            'placeholder_cid': config['metadata']['placeholder_cid']
        },
        'enfts': []
    }
    
    # Generate ENFT entries for each domain in epoch 1
    if metavault_ledger['epochs']:
        epoch_1 = metavault_ledger['epochs'][0]
        token_id = 1
        
        for domain_name, domain_data in epoch_1['domains'].items():
            enft = {
                'token_id': token_id,
                'domain': domain_name,
                'yield_usd_per_sec': domain_data['compounded_yield_per_sec'],
                'metadata_uri': f"{config['metadata']['base_ipfs_gateway']}{config['metadata']['placeholder_cid']}",
                'attributes': {
                    'domain': domain_name,
                    'epoch': 1,
                    'yield_model': 'pi4_exponential'
                }
            }
            enft_ledger['enfts'].append(enft)
            token_id += 1
    
    return enft_ledger


def save_outputs(ledger_data, csv_rows, enft_ledger, output_dir='.'):
    """Save all output files"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Save MetaVault_Ledger.json
    json_path = output_path / 'MetaVault_Ledger.json'
    with open(json_path, 'w') as f:
        json.dump(ledger_data, f, indent=2)
    print(f"✓ Generated: {json_path}")
    
    # Save MetaVault_Yield_Ledger.csv
    csv_path = output_path / 'MetaVault_Yield_Ledger.csv'
    with open(csv_path, 'w', newline='') as f:
        if csv_rows:
            writer = csv.DictWriter(f, fieldnames=csv_rows[0].keys())
            writer.writeheader()
            writer.writerows(csv_rows)
    print(f"✓ Generated: {csv_path}")
    
    # Save enft_ledger_epoch1.json
    enft_path = output_path / 'enft_ledger_epoch1.json'
    with open(enft_path, 'w') as f:
        json.dump(enft_ledger, f, indent=2)
    print(f"✓ Generated: {enft_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Generate MetaVault yield ledgers with π₄ compounding',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--epochs',
        type=int,
        default=5,
        help='Number of epochs to generate (default: 5)'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='.',
        help='Output directory for generated files (default: current directory)'
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
    
    def __init__(self, config_path: str = "scripts/config.json"):
        """Initialize with configuration."""
        self.config_path = Path(config_path)
        self.config = self._load_config()
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
        
    def _load_config(self) -> Dict:
        """Load configuration from JSON file."""
        if not self.config_path.exists():
            print(f"Error: Config file not found at {self.config_path}")
            print("Please ensure scripts/config.json exists.")
            sys.exit(1)
            
        with open(self.config_path, 'r') as f:
            return json.load(f)
    
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
            "token_id": f"ENFT_{snapshot['snapshot_id']:06d}",
            "schema_version": enft_config["schema_version"],
            "snapshot_reference": snapshot["snapshot_id"],
            "tick": snapshot["tick"],
            "timestamp": snapshot["timestamp"],
            "yield_representation": {
                "civilian_usd_per_sec": snapshot["yields"]["civilian"]["usd_per_second"],
                "military_usd_per_sec": snapshot["yields"]["military"]["usd_per_second"],
                "cosmic_usd_per_sec": snapshot["yields"]["cosmic"]["usd_per_second"],
                "total_usd_per_sec": snapshot["total_yield_usd_per_second"]
            },
            "metadata_uri": f"{enft_config['metadata_uri_base']}enft_{snapshot['snapshot_id']:06d}.json",
            "contract_address": enft_config["contract_address_placeholder"],
            "minted": False,
            "attributes": {
                "domain_weights": {
                    "civilian_percent": 47.6,
                    "military_percent": 21.3,
                    "cosmic_percent": 31.1
                },
                "compounding_factor": "π₄ exponential",
                "epoch": 1
            }
        }
        
        return record
    
    def run_batch_mint(self, custom_snapshots: Optional[int] = None) -> None:
        """
        Run the complete batch minting process.
        
        Args:
            custom_snapshots: Optional custom number of snapshots to generate
        """
        num_snapshots = custom_snapshots or self.total_snapshots
        
        print(f"Starting MetaVault Batch Mint")
        print(f"Generating {num_snapshots} snapshots with π₄ compounding...")
        print(f"Tick duration: {self.tick_duration}s")
        print(f"Ticks per snapshot: {self.ticks_per_snapshot}")
        print("=" * 60)
        
        # Generate all snapshots
        for i in range(num_snapshots):
            tick = i * self.ticks_per_snapshot
            snapshot = self.generate_snapshot(i + 1, tick)
            self.ledger_entries.append(snapshot)
            
            # Generate corresponding ENFT record
            enft_record = self.generate_enft_record(snapshot)
            self.enft_records.append(enft_record)
            
            if (i + 1) % 5 == 0:
                print(f"Progress: {i + 1}/{num_snapshots} snapshots generated")
        
        print("=" * 60)
        print(f"Generated {len(self.ledger_entries)} ledger entries")
        print(f"Generated {len(self.enft_records)} ENFT records")
    
    def export_csv(self, output_path: str = "MetaVault_Yield_Ledger.csv") -> None:
        """
        Export ledger entries to CSV format.
        
        Args:
            output_path: Output CSV file path
        """
        csv_path = Path(output_path)
        
        with open(csv_path, 'w', newline='') as csvfile:
            fieldnames = [
                'snapshot_id', 'tick', 'timestamp',
                'civilian_usd_per_sec', 'military_usd_per_sec', 'cosmic_usd_per_sec',
                'total_usd_per_sec', 'total_daily_usd',
                'pi4_factor', 'compound_multiplier'
            ]
            
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for entry in self.ledger_entries:
                row = {
                    'snapshot_id': entry['snapshot_id'],
                    'tick': entry['tick'],
                    'timestamp': entry['timestamp'],
                    'civilian_usd_per_sec': entry['yields']['civilian']['usd_per_second'],
                    'military_usd_per_sec': entry['yields']['military']['usd_per_second'],
                    'cosmic_usd_per_sec': entry['yields']['cosmic']['usd_per_second'],
                    'total_usd_per_sec': entry['total_yield_usd_per_second'],
                    'total_daily_usd': entry['total_daily_usd'],
                    'pi4_factor': entry['pi4_factor'],
                    'compound_multiplier': entry['compound_multiplier']
                }
                writer.writerow(row)
        
        print(f"✓ Exported CSV: {csv_path}")
    
    def export_json(self, output_path: str = "MetaVault_Ledger.json") -> None:
        """
        Export complete ledger to JSON format.
        
        Args:
            output_path: Output JSON file path
        """
        json_path = Path(output_path)
        
        output_data = {
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
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
    
    def export_enft_ledger(self, output_path: str = "enft_ledger_epoch1.json") -> None:
        """
        Export ENFT ledger records to JSON format.
        
        Args:
            output_path: Output JSON file path
        """
        json_path = Path(output_path)
        
        output_data = {
            "metadata": {
                "schema_version": "EVOL.ENFT.v1",
                "epoch": 1,
                "generated_at": datetime.utcnow().isoformat(),
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
    import argparse
    
    parser = argparse.ArgumentParser(
        description='MetaVault Batch Mint - Generate yield ledger with π₄ compounding'
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
        help='Path to config.json file'
    )
    
    args = parser.parse_args()
    
    # Initialize and run
    minter = MetaVaultBatchMint(config_path=args.config)
    minter.run_batch_mint(custom_snapshots=args.snapshots)
    
    # Export all formats
    minter.export_csv()
    minter.export_json()
    minter.export_enft_ledger()
    
    print("\n" + "=" * 60)
    print("MetaVault Batch Mint Complete!")
    print("=" * 60)
    print("\nGenerated files:")
    print("  - MetaVault_Yield_Ledger.csv")
    print("  - MetaVault_Ledger.json")
    print("  - enft_ledger_epoch1.json")
    print("\nNext steps:")
    print("  1. Review generated ledger data")
    print("  2. Visualize compounding: python3 scripts/plot_compounding.py")
    print("  3. See README_48fold.md for complete workflow")


if __name__ == "__main__":
    main()
