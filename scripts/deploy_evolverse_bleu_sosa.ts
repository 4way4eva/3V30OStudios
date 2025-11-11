// MIT License
//
// Copyright (c) 2025 3V30OStudios
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
 * EvolverseBleuSosa Deployment Script
 * MEGAZION / BLEULIONTREASURY Feature Package
 * 
 * Deploys the EvolverseBleuSosa ERC721 contract to specified network.
 * 
 * Usage:
 *   npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network localhost
 *   npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network sepolia
 *   npx hardhat run scripts/deploy_evolverse_bleu_sosa.ts --network polygon
 * 
 * Required Environment Variables:
 *   - DEPLOYER_PRIVATE_KEY (or PRIVATE_KEY)
 *   - Network-specific RPC URL (ETHEREUM_RPC_URL, POLYGON_RPC_URL, etc.)
 * 
 * Optional Environment Variables:
 *   - BASE_URI: IPFS base URI for metadata (default: ipfs://REPLACE_WITH_CID/)
 *   - MAX_SUPPLY: Maximum token supply (default: 0 for unlimited)
 * 
 * See README_48fold.md and README_RUN_LOCAL.md for complete documentation.
 */

import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("=".repeat(60));
  console.log("EvolverseBleuSosa Deployment");
  console.log("=".repeat(60));
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from address: ${deployer.address}`);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.warn("\n⚠️  WARNING: Deployer has zero balance!");
    console.warn("    Please fund the deployer address before deployment.");
    process.exit(1);
  }
  
  // Configuration
  const BASE_URI = process.env.BASE_URI || "ipfs://REPLACE_WITH_CID/";
  const MAX_SUPPLY = parseInt(process.env.MAX_SUPPLY || "0");
  
  console.log("\nDeployment Configuration:");
  console.log(`  Owner: ${deployer.address}`);
  console.log(`  Base URI: ${BASE_URI}`);
  console.log(`  Max Supply: ${MAX_SUPPLY === 0 ? "Unlimited" : MAX_SUPPLY}`);
  
  // Deploy contract
  console.log("\nDeploying EvolverseBleuSosa...");
  const EvolverseBleuSosa = await ethers.getContractFactory("EvolverseBleuSosa");
  const contract = await EvolverseBleuSosa.deploy(
    deployer.address,
    BASE_URI,
    MAX_SUPPLY
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log(`✓ EvolverseBleuSosa deployed to: ${contractAddress}`);
  
  // Verify deployment
  console.log("\nVerifying deployment...");
  const name = await contract.name();
  const symbol = await contract.symbol();
  const owner = await contract.owner();
  const maxSupply = await contract.maxSupply();
  
  console.log(`  Name: ${name}`);
  console.log(`  Symbol: ${symbol}`);
  console.log(`  Owner: ${owner}`);
  console.log(`  Max Supply: ${maxSupply === 0n ? "Unlimited" : maxSupply.toString()}`);
  
  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contract: "EvolverseBleuSosa",
    address: contractAddress,
    deployer: deployer.address,
    baseURI: BASE_URI,
    maxSupply: maxSupply.toString(),
    deployedAt: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction()?.hash
  };
  
  const deploymentsDir = "deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = `${deploymentsDir}/EvolverseBleuSosa_${network.name}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n✓ Deployment info saved to: ${deploymentFile}`);
  
  console.log("\n" + "=".repeat(60));
  console.log("Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\nNext steps:");
  console.log(`  1. Export CONTRACT_ADDRESS=${contractAddress}`);
  console.log("  2. Verify contract on block explorer (if on public network)");
  console.log("  3. Mint tokens: npx hardhat run scripts/mint_evolverse_bleu_sosa.ts");
  console.log("  4. See README_NOTE_PIN_MINT.md for metadata workflow");
  
  // Verification command (for public networks)
  if (network.chainId !== 31337n && network.chainId !== 1337n) {
    console.log("\nTo verify on block explorer:");
    console.log(`  npx hardhat verify --network ${network.name} ${contractAddress} "${deployer.address}" "${BASE_URI}" ${MAX_SUPPLY}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
