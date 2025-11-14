#!/usr/bin/env python3
"""
Ritual Scroll Generator for BLEU Galactic Mint Charter
Generates ceremonial mint ritual scrolls in markdown format.
These can be converted to PDF using pandoc or similar tools.
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def generate_ritual_scroll_markdown(token_data_path, output_dir):
    """
    Generate Ritual Scroll markdown files from token data JSON.
    
    Args:
        token_data_path: Path to the bleu_galactic_mint_tokens.json file
        output_dir: Directory where markdown files should be written
    """
    # Load token data
    with open(token_data_path, 'r') as f:
        tokens = json.load(f)
    
    # Create output directory if needed
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process each token
    for token in tokens:
        # Generate filename
        filename = f"ritual_scroll_{token['billCode'].lower()}.md"
        output_path = output_dir / filename
        
        # Generate the ritual scroll content
        content = generate_scroll_content(token)
        
        # Write to file
        with open(output_path, 'w') as f:
            f.write(content)
        
        print(f"✅ Ritual Scroll generated: {output_path}")
    
    print(f"\n📜 Total scrolls generated: {len(tokens)}")
    print(f"   Output directory: {output_dir}")


def generate_scroll_content(token):
    """Generate the markdown content for a ritual scroll."""
    
    content = f"""# 🪐 BLEU GALACTIC MINT CHARTER
## CEREMONIAL RITUAL SCROLL

---

### **Token: {token['nftMetadata']['name']}**

**Bill Code:** `{token['billCode']}`  
**Vaultlet ID:** `{token['vaultletId']}`  
**Token Type:** `{token['tokenType']}`  
**Rarity Index:** `{token['rarityIndex']}`

---

## I. 🏛 MINT CEREMONY DECLARATION

**Mint Condition:**  
{token['mintCondition']}

**Sector Yield:**  
{', '.join(token['sectorYield'])}

**Ceremonial Properties:**
- 🔒 Non-Transferable: {token['ceremonialProperties']['nonTransferable']}
- ⚓ Ledger-Anchored: {token['ceremonialProperties']['ledgerAnchored']}
- 📜 Living Scroll: {token['ceremonialProperties']['livingScroll']}

---

## II. 💎 MINT LOGIC

### Saturn Bars
**Forged From:** {', '.join(token['mintLogic']['saturnBars']['forgedFrom'])}  
**Orbital Rings:** {'✓ Yes' if token['mintLogic']['saturnBars']['orbitalRings'] else '✗ No'}

### Pluto Cold
**Cryo-Minted:** {'✓ Yes' if token['mintLogic']['plutoCold']['cryoMinted'] else '✗ No'}  
**Quantum Remine:** {'✓ Yes' if token['mintLogic']['plutoCold']['quantumRemine'] else '✗ No'}

### Miners
**Equipment:** {', '.join(token['mintLogic']['miners']['equipment'])}  
**Operating Environment:** {token['mintLogic']['miners']['operatingEnvironment']}

### Refinement Protocol
**Memory Bank:** {token['mintLogic']['refinementProtocol']['memoryBank']}  
**Tracking:** {', '.join(token['mintLogic']['refinementProtocol']['tracking'])}

---

## III. 🧬 CODEXAL CONDITIONS

**Mint Window:** `{token['codexalConditions']['mintWindow']}` (φ-Boost)

**Glyph Confirmations Required:**
"""
    
    for glyph in token['codexalConditions']['glyphConfirmations']:
        content += f"\n- ✦ {glyph}"
    
    content += f"""

**Audit Trail:**
- 📊 Watchtower CSV: `{token['codexalConditions']['auditTrail']['watchtowerCsv']}`
- 📜 Ritual PDF: `{token['codexalConditions']['auditTrail']['ritualPdf']}`
- 🔐 Provenance Hash: `{token['codexalConditions']['auditTrail']['provenanceHash']}`
- 📡 Holographic Broadcast: `{token['codexalConditions']['auditTrail']['holographicBroadcast']}`

---

## IV. 🛠 DEPLOYMENT STACK

**Schema:** `{token['deploymentStack']['schema']}`  
**Treasury Anchor:** `{token['deploymentStack']['treasuryAnchor']}`  
**Payment Handle:** `{token['deploymentStack']['paymentHandle']}`  
**Issued Date:** `{token['deploymentStack']['issuedDate']}`

**Notes:**  
_{token['deploymentStack']['notes']}_

---

## V. 🌌 PROVENANCE

**GitHub Commit:** `{token['provenance']['githubCommit']}`  
**Arweave TX:** `{token['provenance']['arweaveTx']}`  
**Celestial Cycle:** `{token['provenance']['celestialCycle']}`

---

## VI. 🎨 NFT METADATA

**Name:** {token['nftMetadata']['name']}

**Description:**  
{token['nftMetadata']['description']}

**Image URI:** `{token['nftMetadata']['image']}`

**Attributes:**
"""
    
    for attr in token['nftMetadata']['attributes']:
        content += f"\n- **{attr['trait_type']}:** {attr['value']}"
    
    content += f"""

---

## VII. ⚡ CEREMONIAL ACTIVATION

This token is hereby activated under the **BLEU Galactic Mint Charter**.

**Sealed by:** Saturn, Pluto, Jewel, Rare  
**Witnessed by:** EVOLSTUDIOS Holographic Broadcast  
**Anchored in:** BLEULIONTREASURY™

**Status:** ✅ CEREMONIALLY MINTED

---

*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}*  
*BLEU Galactic Mint Charter - RARELY 1if1 Protocol*
"""
    
    return content


def main():
    """Main entry point for the script."""
    # Determine paths
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    token_data_path = repo_root / 'data' / 'bleu_galactic_mint_tokens.json'
    output_dir = repo_root / 'data' / 'ritual_scrolls'
    
    # Check if token data exists
    if not token_data_path.exists():
        print(f"❌ Error: Token data not found at {token_data_path}")
        sys.exit(1)
    
    # Generate the ritual scrolls
    generate_ritual_scroll_markdown(token_data_path, output_dir)


if __name__ == '__main__':
    main()
