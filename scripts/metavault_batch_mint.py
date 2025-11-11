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
    
    print("=" * 60)
    print("MEGAZION MetaVault Batch Mint")
    print("=" * 60)
    print()
    
    # Load configuration
    if args.verbose:
        print(f"Loading configuration from: {args.config}")
    config = load_config(args.config)
    
    # Generate ledger data
    print(f"Generating ledger data for {args.epochs} epochs...")
    ledger_data, csv_rows = generate_metavault_ledger(config, args.epochs)
    
    # Generate ENFT ledger
    print("Generating ENFT ledger for epoch 1...")
    enft_ledger = generate_enft_ledger(ledger_data, config)
    
    # Save outputs
    print(f"\nSaving outputs to: {args.output_dir}")
    save_outputs(ledger_data, csv_rows, enft_ledger, args.output_dir)
    
    print("\n" + "=" * 60)
    print("✓ MetaVault batch mint complete!")
    print("=" * 60)
    
    if args.verbose:
        print(f"\nSummary:")
        print(f"  - Total epochs: {len(ledger_data['epochs'])}")
        print(f"  - Domains: {', '.join(config['domains'].keys())}")
        print(f"  - π₄ factor: {config['pi4_factor']}")
        print(f"  - Base yield: ${config['base_yield_usd_per_sec']:,.0f}/sec")


if __name__ == '__main__':
    main()
