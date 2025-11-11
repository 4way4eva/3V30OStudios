// MIT License
// 
// Copyright (c) 2024 3V30OStudios / MEGAZION Codex
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * Deploy EvolverseBleuSosa Script
 * 
 * Deploys the EvolverseBleuSosa ERC721 NFT contract to specified network
 * 
 * Usage:
 *   npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network sepolia
 *   npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network mumbai
 *   npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network localhost
 * 
 * Environment Variables Required:
 *   - DEPLOYER_PRIVATE_KEY: Private key for deployment wallet
 *   - ETHEREUM_RPC_URL, POLYGON_RPC_URL, etc. (depending on network)
 * 
 * Configuration:
 *   Edit the CONTRACT_CONFIG below to customize deployment parameters
 * 
 * Example .env:
 *   DEPLOYER_PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY
 *   ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
 * 
 * Security Notes:
 *   - ALWAYS test on testnet first (Sepolia, Mumbai, Fuji)
 *   - Use hardware wallet or multisig for production deployments
 *   - Never commit private keys to repository
 *   - Verify contract on block explorer after deployment
 * 
 * Post-Deployment:
 *   1. Save the deployed contract address
 *   2. Verify contract on block explorer
 *   3. Set base URI with setBaseURI()
 *   4. Transfer ownership if needed
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Contract configuration - CUSTOMIZE THESE VALUES
const CONTRACT_CONFIG = {
  name: "EvolverseBleuSosa",
  symbol: "EVBS",
  baseURI: "ipfs://QmPLACEHOLDER_REPLACE_WITH_ACTUAL_CID/",
  maxSupply: 10000, // Set to 0 for unlimited
};

async function main() {
  console.log("=".repeat(60));
  console.log("Deploy EvolverseBleuSosa Contract");
  console.log("=".repeat(60));
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`\n👤 Deployer: ${deployer.address}`);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.error("\n❌ Error: Deployer has zero balance");
    console.error("   Fund the deployer wallet before deployment");
    process.exit(1);
  }
  
  // Display configuration
  console.log(`\n📋 Contract Configuration:`);
  console.log(`   Name: ${CONTRACT_CONFIG.name}`);
  console.log(`   Symbol: ${CONTRACT_CONFIG.symbol}`);
  console.log(`   Base URI: ${CONTRACT_CONFIG.baseURI}`);
  console.log(`   Max Supply: ${CONTRACT_CONFIG.maxSupply === 0 ? "Unlimited" : CONTRACT_CONFIG.maxSupply}`);
  
  // Deploy contract
  console.log(`\n🚀 Deploying contract...`);
  
  const EvolverseBleuSosa = await ethers.getContractFactory("EvolverseBleuSosa");
  const contract = await EvolverseBleuSosa.deploy(
    CONTRACT_CONFIG.name,
    CONTRACT_CONFIG.symbol,
    CONTRACT_CONFIG.baseURI,
    CONTRACT_CONFIG.maxSupply
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✓ Contract deployed to: ${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    config: CONTRACT_CONFIG,
    transactionHash: contract.deploymentTransaction()?.hash,
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `EvolverseBleuSosa_${network.name}_${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n💾 Deployment info saved: ${filename}`);
  
  // Display next steps
  console.log("\n" + "=".repeat(60));
  console.log("✓ Deployment complete!");
  console.log("=".repeat(60));
  
  console.log(`\n📝 Next Steps:`);
  console.log(`   1. Verify contract on block explorer`);
  console.log(`   2. Update base URI if needed:`);
  console.log(`      npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network ${network.name}`);
  console.log(`   3. Mint tokens:`);
  console.log(`      npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network ${network.name}`);
  console.log(`   4. Save this contract address in .env:`);
  console.log(`      EVOLVERSE_BLEU_SOSA_ADDRESS=${contractAddress}`);
  
  console.log(`\n⚠️  SECURITY REMINDER:`);
  console.log(`   - This is a testnet deployment - verify before mainnet`);
  console.log(`   - Use hardware wallet/multisig for production`);
  console.log(`   - Transfer ownership after setup if needed`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
