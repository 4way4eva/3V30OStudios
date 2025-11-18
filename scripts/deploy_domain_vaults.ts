// MIT License
// 
// Copyright (c) 2024-2025 3V30OStudios / MEGAZION Codex
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
 * Domain Vault Deployment Script
 * 
 * Deploys domain-specific vault contracts for the 14 primary domains:
 * Governance, Treasury, Health, Education, Energy, Transport, Defense,
 * Commerce, Culture, Cities, Data, Agriculture, Search, Payments
 * 
 * Usage:
 *   npx hardhat run scripts/deploy_domain_vaults.ts --network sepolia
 *   npx hardhat run scripts/deploy_domain_vaults.ts --network mumbai
 * 
 * Environment Variables Required:
 *   - DEPLOYER_PRIVATE_KEY: Private key for deployment (use hardware wallet/multisig for mainnet)
 *   - ETHEREUM_RPC_URL or network-specific RPC URL
 * 
 * Security Notes:
 *   - ALWAYS deploy to testnet first (Sepolia, Mumbai, Fuji)
 *   - Use hardware wallet or multisig for mainnet deployments
 *   - Verify contracts on block explorers after deployment
 *   - Store deployment addresses in deployment-config.json
 * 
 * See README_48FOLD_CODEX.md for complete documentation.
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// Domain configuration from data/domain_coin_vault_registry.csv
const DOMAINS = [
  { name: "Governance", efficiency: 1 },
  { name: "Treasury", efficiency: 2 },
  { name: "Health", efficiency: 3 },
  { name: "Education", efficiency: 4 },
  { name: "Energy", efficiency: 5 },
  { name: "Transport", efficiency: 6 },
  { name: "Defense", efficiency: 7 },
  { name: "Commerce", efficiency: 8 },
  { name: "Culture", efficiency: 9 },
  { name: "Cities", efficiency: 10 },
  { name: "Data", efficiency: 11 },
  { name: "Agriculture", efficiency: 12 },
  { name: "Search", efficiency: 13 },
  { name: "Payments", efficiency: 14 }
];

interface DeploymentResult {
  domain: string;
  vaultAddress: string;
  coinAddress: string;
  transactionHash: string;
  blockNumber: number;
  efficiency: number;
}

/**
 * Deploy a domain vault contract
 */
async function deployDomainVault(
  domainName: string,
  efficiency: number,
  deployer: any
): Promise<DeploymentResult> {
  console.log(`\nDeploying ${domainName}Vault...`);
  
  // NOTE: This is a placeholder deployment
  // Replace with actual vault contract deployment
  // For example: const Vault = await ethers.getContractFactory("DomainVault");
  
  // Placeholder - would deploy actual contract
  const mockAddress = `0x${"0".repeat(40 - domainName.length)}${domainName.substring(0, Math.min(domainName.length, 40))}`;
  
  console.log(`  ⚠️  PLACEHOLDER: ${domainName}Vault would be deployed here`);
  console.log(`  Mock address: ${mockAddress}`);
  console.log(`  Efficiency boost: +${efficiency}%`);
  
  return {
    domain: domainName,
    vaultAddress: mockAddress,
    coinAddress: `0x${domainName}Coin`,
    transactionHash: "0xPLACEHOLDER_TX_HASH",
    blockNumber: 0,
    efficiency: efficiency
  };
}

/**
 * Save deployment results to JSON
 */
function saveDeploymentResults(results: DeploymentResult[], network: string) {
  const outputPath = path.join(__dirname, "..", "deployments", `domain_vaults_${network}.json`);
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const deploymentData = {
    network: network,
    deployed_at: new Date().toISOString(),
    domains: results,
    total_domains: results.length,
    total_efficiency_boost: results.reduce((sum, r) => sum + r.efficiency, 0),
    note: "Replace placeholder addresses with actual deployment addresses"
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log(`\n✓ Deployment results saved to: ${outputPath}`);
}

/**
 * Main deployment function
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Domain Vault Deployment");
  console.log("=".repeat(60));
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`\n👤 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Security check
  if (network.chainId === 1n || network.chainId === 137n) {
    console.log("\n⚠️  WARNING: Deploying to MAINNET");
    console.log("   Ensure you are using a hardware wallet or multisig");
    console.log("   Press Ctrl+C to cancel, or wait 10 seconds to continue...");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  // Deploy all domain vaults
  const results: DeploymentResult[] = [];
  
  for (const domain of DOMAINS) {
    try {
      const result = await deployDomainVault(domain.name, domain.efficiency, deployer);
      results.push(result);
    } catch (error) {
      console.error(`\n❌ Error deploying ${domain.name}Vault:`, error);
    }
  }
  
  // Save results
  saveDeploymentResults(results, network.name);
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Deployment Summary");
  console.log("=".repeat(60));
  console.log(`Total domains deployed: ${results.length}/${DOMAINS.length}`);
  console.log(`Total efficiency boost: +${results.reduce((sum, r) => sum + r.efficiency, 0)}%`);
  console.log(`\nNext steps:`);
  console.log(`  1. Verify contracts on block explorer`);
  console.log(`  2. Update deployment-config.json with actual addresses`);
  console.log(`  3. Configure vault guards and access controls`);
  console.log(`  4. Initialize coin minting capabilities`);
  console.log(`\nSee README_48FOLD_CODEX.md for complete workflow`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
