#!/bin/bash
# NFT Forensic Tools - Quick Start Example
# MEGAZION / BLEULIONTREASURY Security Toolkit
#
# This script demonstrates how to use the forensic tools to investigate
# a potentially "whitewashed" or manipulated NFT.
#
# Prerequisites:
# 1. Free RPC endpoint from Infura (https://infura.io) or Alchemy (https://www.alchemy.com)
# 2. Node.js and npm installed
# 3. Dependencies installed: npm install --legacy-peer-deps

set -e  # Exit on error

echo "=================================================="
echo "NFT Forensic Tools - Quick Start Example"
echo "MEGAZION / BLEULIONTREASURY Security Toolkit"
echo "=================================================="
echo ""

# Check if PROVIDER_URL is set
if [ -z "$PROVIDER_URL" ]; then
    echo "❌ Error: PROVIDER_URL environment variable is not set"
    echo ""
    echo "Get a free RPC endpoint from:"
    echo "  - Infura: https://infura.io"
    echo "  - Alchemy: https://www.alchemy.com"
    echo "  - Public endpoints: https://chainlist.org"
    echo ""
    echo "Then set it:"
    echo "  export PROVIDER_URL='https://mainnet.infura.io/v3/YOUR_API_KEY'"
    echo ""
    exit 1
fi

echo "✓ PROVIDER_URL is set"
echo ""

# Example 1: Check a single token (Bored Ape Yacht Club #1)
echo "Example 1: Inspecting a single NFT"
echo "-----------------------------------"
echo "Contract: Bored Ape Yacht Club (0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D)"
echo "Token ID: 1"
echo ""

read -p "Run this example? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx ts-node scripts/nft_forensic_checker.ts \
        --contract 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D \
        --tokenId 1
    
    echo ""
    echo "✓ Forensic report saved to outputs/ directory"
    echo ""
fi

# Example 2: Check multiple tokens
echo ""
echo "Example 2: Batch inspection of multiple tokens"
echo "-----------------------------------------------"
echo "Contract: Your contract address"
echo "Token IDs: 1, 2, 3, 4, 5"
echo ""
echo "To run this example, edit this script and replace CONTRACT_ADDRESS"
echo "Then uncomment and run the following:"
echo ""
echo "# CONTRACT_ADDRESS='0xYourContractAddress'"
echo "# npx ts-node scripts/nft_forensic_checker.ts \\"
echo "#     --contract \$CONTRACT_ADDRESS \\"
echo "#     --tokenIds '1,2,3,4,5'"
echo ""

# Example 3: Generate evidence bundle
echo ""
echo "Example 3: Generate Evidence Bundle"
echo "------------------------------------"
echo "After running forensic checks, generate a tribunal-ready evidence bundle:"
echo ""
echo "To generate a bundle for the token checked above:"
echo ""

if [ -d "outputs" ]; then
    LATEST_REPORT=$(ls -t outputs/forensic_*.json 2>/dev/null | head -1)
    if [ ! -z "$LATEST_REPORT" ]; then
        echo "Found forensic report: $LATEST_REPORT"
        echo ""
        read -p "Generate evidence bundle for this report? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter your wallet address (0x...): " WALLET_ADDRESS
            if [ ! -z "$WALLET_ADDRESS" ]; then
                npx ts-node scripts/generate_forensic_bundle.ts \
                    --forensic "$LATEST_REPORT" \
                    --wallet "$WALLET_ADDRESS" \
                    --marketplace opensea
                
                echo ""
                echo "✓ Evidence bundle created in outputs/evidence_bundle_*/"
                echo ""
                echo "Next steps:"
                echo "1. Review the bundle README for instructions"
                echo "2. Add any screenshots to the bundle directory"
                echo "3. Use dispute_opensea.txt to file a marketplace complaint"
                echo "4. Backup the bundle securely"
                echo ""
            fi
        fi
    else
        echo "No forensic reports found in outputs/ directory"
        echo "Run Example 1 first to generate a report"
        echo ""
    fi
else
    echo "No outputs/ directory found"
    echo "Run Example 1 first to generate forensic reports"
    echo ""
fi

echo ""
echo "=================================================="
echo "For more information, see NFT_FORENSIC_TOOLS_README.md"
echo "=================================================="
echo ""
echo "Common use cases:"
echo ""
echo "1. Investigate whitewashed/wrong metadata:"
echo "   npm run forensic:check -- --contract 0x... --tokenId 123"
echo ""
echo "2. Scan all tokens in your wallet:"
echo "   npm run forensic:check -- --contract 0x... --wallet 0xYourWallet"
echo ""
echo "3. Generate evidence bundle:"
echo "   npm run forensic:bundle -- --forensic outputs/report.json --wallet 0x..."
echo ""
echo "4. Multi-chain (Polygon, Arbitrum, etc):"
echo "   PROVIDER_URL='https://polygon-mainnet.g.alchemy.com/v2/KEY' \\"
echo "   npm run forensic:check -- --contract 0x... --tokenId 123"
echo ""
