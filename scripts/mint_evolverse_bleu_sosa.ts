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
 * EvolverseBleuSosa Minting Script
 * MEGAZION / BLEULIONTREASURY Feature Package
 * 
 * Mints tokens from the deployed EvolverseBleuSosa contract.
 * Owner-only operation.
 * 
 * Usage:
 *   # Mint single token
 *   npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network sepolia
 *   
 *   # Batch mint (set MINT_AMOUNT environment variable)
 *   export MINT_AMOUNT=10
 *   npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network sepolia
 * 
 * Required Environment Variables:
 *   - CONTRACT_ADDRESS: Deployed contract address
 *   - DEPLOYER_PRIVATE_KEY (or PRIVATE_KEY): Must be contract owner
 *   - Network-specific RPC URL
 * 
 * Optional Environment Variables:
 *   - RECIPIENT_ADDRESS: Address to receive tokens (default: deployer)
 *   - MINT_AMOUNT: Number of tokens to mint (default: 1, max: 100)
 * 
 * See README_48fold.md and README_NOTE_PIN_MINT.md for complete documentation.
 */

import { ethers } from "hardhat";

async function main() {
  console.log("=".repeat(60));
  console.log("EvolverseBleuSosa Minting");
  console.log("=".repeat(60));
  
  // Configuration
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("\n❌ Error: CONTRACT_ADDRESS not set or invalid");
    console.error("   Set with: export CONTRACT_ADDRESS=0x123...");
    console.error("   Or check deployments/ directory for deployed addresses");
    process.exit(1);
  }
  
  const [deployer] = await ethers.getSigners();
  const RECIPIENT = process.env.RECIPIENT_ADDRESS || deployer.address;
  const MINT_AMOUNT = parseInt(process.env.MINT_AMOUNT || "1");
  
  if (MINT_AMOUNT < 1 || MINT_AMOUNT > 100) {
    console.error("\n❌ Error: MINT_AMOUNT must be between 1 and 100");
    process.exit(1);
  }
  
  console.log(`\nMinter: ${deployer.address}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Recipient: ${RECIPIENT}`);
  console.log(`Amount: ${MINT_AMOUNT}`);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.error("\n❌ Error: Minter has zero balance!");
    process.exit(1);
  }
  
  // Get contract
  const contract = await ethers.getContractAt("EvolverseBleuSosa", CONTRACT_ADDRESS);
  
  // Verify owner
  const owner = await contract.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("\n❌ Error: Deployer is not the contract owner!");
    console.error(`   Contract owner: ${owner}`);
    console.error(`   Your address: ${deployer.address}`);
    process.exit(1);
  }
  
  // Get current supply
  const currentSupply = await contract.totalSupply();
  const maxSupply = await contract.maxSupply();
  
  console.log(`\nCurrent Supply: ${currentSupply}`);
  console.log(`Max Supply: ${maxSupply === 0n ? "Unlimited" : maxSupply.toString()}`);
  
  // Check max supply
  if (maxSupply > 0n) {
    const nextTokenId = await contract.nextTokenId();
    if (nextTokenId + BigInt(MINT_AMOUNT) - 1n > maxSupply) {
      console.error(`\n❌ Error: Would exceed max supply!`);
      console.error(`   Available: ${maxSupply - currentSupply} tokens`);
      process.exit(1);
    }
  }
  
  // Mint tokens
  console.log(`\nMinting ${MINT_AMOUNT} token(s)...`);
  
  let tx;
  let mintedTokenIds: bigint[] = [];
  
  if (MINT_AMOUNT === 1) {
    // Single mint
    tx = await contract.mint(RECIPIENT);
    const receipt = await tx.wait();
    
    // Extract token ID from event
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "TokenMinted";
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      if (parsed) {
        mintedTokenIds = [parsed.args.tokenId];
      }
    }
    
  } else {
    // Batch mint
    tx = await contract.batchMint(RECIPIENT, MINT_AMOUNT);
    const receipt = await tx.wait();
    
    // Extract all token IDs from events
    receipt?.logs.forEach((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === "TokenMinted") {
          mintedTokenIds.push(parsed.args.tokenId);
        }
      } catch {
        // Skip logs that aren't from this contract
      }
    });
  }
  
  console.log(`✓ Mint transaction: ${tx.hash}`);
  console.log(`✓ Minted ${mintedTokenIds.length} token(s)`);
  
  if (mintedTokenIds.length > 0) {
    console.log(`\nMinted Token IDs:`);
    mintedTokenIds.forEach((tokenId, index) => {
      console.log(`  ${index + 1}. Token ID: ${tokenId.toString()}`);
    });
  }
  
  // Get updated supply
  const newSupply = await contract.totalSupply();
  console.log(`\nNew Total Supply: ${newSupply}`);
  
  console.log("\n" + "=".repeat(60));
  console.log("Minting Complete!");
  console.log("=".repeat(60));
  console.log("\nNext steps:");
  console.log("  1. Verify tokens on block explorer");
  console.log("  2. Prepare and pin metadata to IPFS");
  console.log("  3. Update base URI if needed: contract.setBaseURI(...)");
  console.log("  4. Export ledger: npx hardhat run scripts/export_enft_ledger.ts");
  console.log("\nSee README_NOTE_PIN_MINT.md for metadata workflow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
