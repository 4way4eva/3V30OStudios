#!/bin/bash

# Setup script for EVOLVERSE / MEGAZION contract deployment

set -e

echo "═══════════════════════════════════════════════════════════"
echo "🔵 EVOLVERSE / MEGAZION Deployment Setup"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to v18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "🔑 IMPORTANT: Edit .env file and add your:"
    echo "   - Private key (without 0x prefix)"
    echo "   - RPC URLs for target networks"
    echo "   - Block explorer API keys for verification"
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile
echo ""

# Create config directory if it doesn't exist
mkdir -p config

echo "═══════════════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Configure your .env file with:"
echo "   - PRIVATE_KEY (deployer wallet private key)"
echo "   - Network RPC URLs"
echo "   - Block explorer API keys"
echo ""
echo "2. Fund your deployer wallet on target network(s)"
echo ""
echo "3. Check balance before deploying:"
echo "   npx hardhat run scripts/check-balance.ts --network <network>"
echo ""
echo "4. Deploy contracts:"
echo "   npx hardhat run scripts/deploy_all_contracts.ts --network <network>"
echo ""
echo "5. Verify contracts:"
echo "   npx hardhat run scripts/verify-all.ts --network <network>"
echo ""
echo "Available networks:"
echo "  Mainnets: polygon, avalanche, bsc, cronos, mainnet"
echo "  Testnets: sepolia, mumbai, fuji"
echo ""
echo "═══════════════════════════════════════════════════════════"
