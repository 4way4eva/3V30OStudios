#!/usr/bin/env python3
"""
Watchtower CSV Generator for BLEU Galactic Mint Charter
Generates ceremonial mint tracking CSV for the Watchtower system.
"""

import json
import csv
import sys
from pathlib import Path
from datetime import datetime


def generate_watchtower_csv(token_data_path, output_path):
    """
    Generate Watchtower CSV from token data JSON.
    
    Args:
        token_data_path: Path to the bleu_galactic_mint_tokens.json file
        output_path: Path where the CSV should be written
    """
    # Load token data
    with open(token_data_path, 'r') as f:
        tokens = json.load(f)
    
    # CSV headers
    headers = [
        'timestamp',
        'vaultlet_id',
        'bill_code',
        'token_type',
        'rarity_index',
        'mint_window',
        'glyph_confirmations',
        'provenance_hash',
        'celestial_cycle',
        'cryo_status',
        'forge_material',
        'ceremonial_status',
        'ledger_anchor',
        'payment_handle',
        'notes'
    ]
    
    # Open CSV for writing
    with open(output_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        
        # Process each token
        for token in tokens:
            # Extract data
            row = {
                'timestamp': token['deploymentStack']['issuedDate'],
                'vaultlet_id': token['vaultletId'],
                'bill_code': token['billCode'],
                'token_type': token['tokenType'],
                'rarity_index': token['rarityIndex'],
                'mint_window': token['codexalConditions']['mintWindow'],
                'glyph_confirmations': ','.join(token['codexalConditions']['glyphConfirmations']),
                'provenance_hash': token['codexalConditions']['auditTrail']['provenanceHash'],
                'celestial_cycle': token['provenance']['celestialCycle'],
                'cryo_status': 'Pluto Cold Verified' if token['mintLogic']['plutoCold']['cryoMinted'] else 'Not Verified',
                'forge_material': '+'.join(token['mintLogic']['saturnBars']['forgedFrom']),
                'ceremonial_status': 'Non-Transferable' if token['ceremonialProperties']['nonTransferable'] else 'Transferable',
                'ledger_anchor': token['deploymentStack']['treasuryAnchor'],
                'payment_handle': token['deploymentStack']['paymentHandle'],
                'notes': token['deploymentStack']['notes']
            }
            
            writer.writerow(row)
    
    print(f"✅ Watchtower CSV generated: {output_path}")
    print(f"   Tokens processed: {len(tokens)}")


def main():
    """Main entry point for the script."""
    # Determine paths
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    token_data_path = repo_root / 'data' / 'bleu_galactic_mint_tokens.json'
    output_path = repo_root / 'data' / 'watchtower_galactic_mint.csv'
    
    # Check if token data exists
    if not token_data_path.exists():
        print(f"❌ Error: Token data not found at {token_data_path}")
        sys.exit(1)
    
    # Generate the CSV
    generate_watchtower_csv(token_data_path, output_path)


if __name__ == '__main__':
    main()
