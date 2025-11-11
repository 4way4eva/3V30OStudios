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
 * Mint EvolverseBleuSosa Script
 * 
 * Mints tokens from deployed EvolverseBleuSosa contract
 * 
 * Usage:
 *   npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network sepolia
 *   npx hardhat run scripts/mint_evolverse_bleu_sosa.ts --network mumbai
 * 
 * Environment Variables Required:
 *   - EVOLVERSE_BLEU_SOSA_ADDRESS: Deployed contract address
 *   - DEPLOYER_PRIVATE_KEY: Private key with owner permissions
 *   - ETHEREUM_RPC_URL, POLYGON_RPC_URL, etc. (depending on network)
 * 
 * Configuration:
 *   Edit MINT_CONFIG below to customize minting parameters
 * 
 * Example .env:
 *   EVOLVERSE_BLEU_SOSA_ADDRESS=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_ADDRESS
 *   DEPLOYER_PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY
 *   MINT_RECIPIENT_ADDRESS=0xPLACEHOLDER_REPLACE_WITH_RECIPIENT_ADDRESS
 * 
 * Features:
 *   - Single mint or batch mint
 *   - Automatic gas estimation
 *   - Transaction confirmation
 *   - Post-mint verification
 * 
 * Security Notes:
 *   - ALWAYS test on testnet first
 *   - Verify recipient addresses
 *   - Check gas prices before mainnet
 *   - Use hardware wallet for production
 */

import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

// Mint configuration - CUSTOMIZE THESE VALUES
const MINT_CONFIG = {
  // Recipient address for minted tokens
  recipient: process.env.MINT_RECIPIENT_ADDRESS || "0xPLACEHOLDER_REPLACE_WITH_RECIPIENT_ADDRESS",
  
  // Number of tokens to mint
  count: 1,
  
  // Use batch minting for count > 1
  useBatchMint: false,
  
  // Optional: Update base URI before minting
  updateBaseURI: false,
  newBaseURI: "ipfs://QmPLACEHOLDER_REPLACE_WITH_ACTUAL_CID/",
};

const CONTRACT_ABI = [
  "function mint(address to) external returns (uint256)",
  "function mintBatch(address to, uint256 count) external",
  "function setBaseURI(string memory baseURI) external",
  "function totalSupply() external view returns (uint256)",
  "function nextTokenId() external view returns (uint256)",
  "function maxSupply() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
];

async function getContractAddress(): Promise<string> {
  const address = process.env.EVOLVERSE_BLEU_SOSA_ADDRESS;
  
  if (!address || address === "0xPLACEHOLDER_REPLACE_WITH_ACTUAL_ADDRESS") {
    console.error("❌ Error: EVOLVERSE_BLEU_SOSA_ADDRESS not set in .env file");
    console.error("   Deploy contract first, then set:");
    console.error("   EVOLVERSE_BLEU_SOSA_ADDRESS=0x...");
    process.exit(1);
  }
  
  return address;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Mint EvolverseBleuSosa Tokens");
  console.log("=".repeat(60));
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`\n👤 Signer: ${signer.address}`);
  
  // Check balance
  const balance = await ethers.provider.getBalance(signer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.error("\n❌ Error: Signer has zero balance");
    process.exit(1);
  }
  
  // Get contract
  const contractAddress = await getContractAddress();
  console.log(`\n📄 Contract: ${contractAddress}`);
  
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  
  // Get contract state
  console.log(`\n📊 Contract State:`);
  const totalSupply = await contract.totalSupply();
  const nextTokenId = await contract.nextTokenId();
  const maxSupply = await contract.maxSupply();
  
  console.log(`   Total Supply: ${totalSupply}`);
  console.log(`   Next Token ID: ${nextTokenId}`);
  console.log(`   Max Supply: ${maxSupply === 0n ? "Unlimited" : maxSupply.toString()}`);
  
  // Validate recipient
  if (MINT_CONFIG.recipient === "0xPLACEHOLDER_REPLACE_WITH_RECIPIENT_ADDRESS") {
    console.error("\n❌ Error: Invalid recipient address");
    console.error("   Set MINT_RECIPIENT_ADDRESS in .env or update MINT_CONFIG");
    process.exit(1);
  }
  
  // Update base URI if requested
  if (MINT_CONFIG.updateBaseURI) {
    console.log(`\n🔄 Updating base URI...`);
    console.log(`   New URI: ${MINT_CONFIG.newBaseURI}`);
    
    const tx = await contract.setBaseURI(MINT_CONFIG.newBaseURI);
    console.log(`   Transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✓ Base URI updated`);
  }
  
  // Display mint configuration
  console.log(`\n🎨 Mint Configuration:`);
  console.log(`   Recipient: ${MINT_CONFIG.recipient}`);
  console.log(`   Count: ${MINT_CONFIG.count}`);
  console.log(`   Method: ${MINT_CONFIG.useBatchMint ? "Batch Mint" : "Single Mint"}`);
  
  // Mint tokens
  console.log(`\n🚀 Minting tokens...`);
  
  if (MINT_CONFIG.useBatchMint && MINT_CONFIG.count > 1) {
    // Batch mint
    const tx = await contract.mintBatch(MINT_CONFIG.recipient, MINT_CONFIG.count);
    console.log(`   Transaction: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);
    const receipt = await tx.wait();
    console.log(`   ✓ Batch mint complete (${MINT_CONFIG.count} tokens)`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
  } else {
    // Single mint (possibly multiple times)
    const mintedTokens: string[] = [];
    
    for (let i = 0; i < MINT_CONFIG.count; i++) {
      const tx = await contract.mint(MINT_CONFIG.recipient);
      console.log(`   Transaction ${i + 1}/${MINT_CONFIG.count}: ${tx.hash}`);
      const receipt = await tx.wait();
      
      // Extract token ID from event logs
      const tokenId = await contract.nextTokenId() - 1n;
      mintedTokens.push(tokenId.toString());
      
      console.log(`   ✓ Minted token #${tokenId}`);
    }
    
    console.log(`\n   Minted Token IDs: ${mintedTokens.join(", ")}`);
  }
  
  // Verify mints
  console.log(`\n🔍 Verifying mints...`);
  const newTotalSupply = await contract.totalSupply();
  console.log(`   New Total Supply: ${newTotalSupply}`);
  
  // Display first minted token URI as example
  const firstTokenId = nextTokenId;
  try {
    const tokenURI = await contract.tokenURI(firstTokenId);
    const owner = await contract.ownerOf(firstTokenId);
    
    console.log(`\n📝 Sample Token (ID: ${firstTokenId}):`);
    console.log(`   Owner: ${owner}`);
    console.log(`   URI: ${tokenURI}`);
  } catch (error) {
    console.log(`   (Token URI verification skipped)`);
  }
  
  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("✓ Minting complete!");
  console.log("=".repeat(60));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Tokens minted: ${MINT_CONFIG.count}`);
  console.log(`   Recipient: ${MINT_CONFIG.recipient}`);
  console.log(`   New total supply: ${newTotalSupply}`);
  
  console.log(`\n📝 Next Steps:`);
  console.log(`   1. Verify tokens on block explorer`);
  console.log(`   2. Check metadata on IPFS gateway`);
  console.log(`   3. Export ledger:`);
  console.log(`      npx hardhat run scripts/export_enft_ledger.ts --network ${network.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Minting failed:", error);
    process.exit(1);
  });
