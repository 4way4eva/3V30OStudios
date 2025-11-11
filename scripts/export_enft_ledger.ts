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
 * Export ENFT Ledger Script
 * 
 * Exports Transfer events from deployed ENFT contracts to enft_ledger_epoch1.json and ENFT_Ledger.csv
 * 
 * Usage:
 *   npx hardhat run scripts/export_enft_ledger.ts --network sepolia
 *   npx hardhat run scripts/export_enft_ledger.ts --network mumbai
 * 
 * Environment Variables Required:
 *   - ENFT_CONTRACT_ADDRESS: Address of deployed ENFT contract
 *   - ETHEREUM_RPC_URL or POLYGON_RPC_URL (depending on network)
 *   - PRIVATE_KEY (for read-only operations)
 * 
 * Example .env:
 *   ENFT_CONTRACT_ADDRESS=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_ADDRESS
 *   ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
 *   PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY
 * 
 * Output Files:
 *   - enft_ledger_epoch1.json: JSON format with full event data
 *   - ENFT_Ledger.csv: CSV format for spreadsheet analysis
 * 
 * Notes:
 *   - This script only reads data from the blockchain (no transactions)
 *   - Testnet-first: Always test on Sepolia/Mumbai before mainnet
 *   - Use block range parameters to limit query scope for large contracts
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// Contract ABI for Transfer event (ERC721/ERC1155)
const TRANSFER_EVENT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];

interface TransferEvent {
  tokenId: string;
  from: string;
  to: string;
  blockNumber: number;
  transactionHash: string;
  timestamp?: number;
}

interface ENFTLedger {
  version: string;
  epoch: number;
  metadata: {
    contract_address: string;
    network: string;
    exported_at: string;
    total_transfers: number;
    block_range: {
      from: number;
      to: number;
    };
  };
  transfers: TransferEvent[];
}

async function getContractAddress(): Promise<string> {
  const address = process.env.ENFT_CONTRACT_ADDRESS;
  
  if (!address || address === "0xPLACEHOLDER_REPLACE_WITH_ACTUAL_ADDRESS") {
    console.error("❌ Error: ENFT_CONTRACT_ADDRESS not set in .env file");
    console.error("   Please set a valid contract address:");
    console.error("   ENFT_CONTRACT_ADDRESS=0x...");
    process.exit(1);
  }
  
  return address;
}

async function exportTransferEvents(
  contractAddress: string,
  fromBlock: number = 0,
  toBlock: number | string = "latest"
): Promise<TransferEvent[]> {
  console.log(`\n📡 Querying Transfer events...`);
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Block range: ${fromBlock} to ${toBlock}`);
  
  const provider = ethers.provider;
  const contract = new ethers.Contract(contractAddress, TRANSFER_EVENT_ABI, provider);
  
  const transfers: TransferEvent[] = [];
  
  try {
    // Try ERC721 Transfer events
    const filter = contract.filters.Transfer();
    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    
    console.log(`   Found ${events.length} Transfer events`);
    
    for (const event of events) {
      const block = await event.getBlock();
      
      transfers.push({
        tokenId: event.args?.tokenId?.toString() || "0",
        from: event.args?.from || ethers.ZeroAddress,
        to: event.args?.to || ethers.ZeroAddress,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp
      });
    }
  } catch (error) {
    console.error("   Error querying Transfer events:", error);
  }
  
  // Try ERC1155 TransferSingle events if no ERC721 transfers found
  if (transfers.length === 0) {
    try {
      const filter1155 = contract.filters.TransferSingle();
      const events1155 = await contract.queryFilter(filter1155, fromBlock, toBlock);
      
      console.log(`   Found ${events1155.length} TransferSingle events (ERC1155)`);
      
      for (const event of events1155) {
        const block = await event.getBlock();
        
        transfers.push({
          tokenId: event.args?.id?.toString() || "0",
          from: event.args?.from || ethers.ZeroAddress,
          to: event.args?.to || ethers.ZeroAddress,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: block.timestamp
        });
      }
    } catch (error) {
      console.error("   Error querying TransferSingle events:", error);
    }
  }
  
  return transfers;
}

async function saveJSON(ledger: ENFTLedger, outputPath: string) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(ledger, null, 2));
  console.log(`✓ Saved: ${outputPath}`);
}

async function saveCSV(transfers: TransferEvent[], outputPath: string) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const headers = "TokenID,From,To,BlockNumber,TransactionHash,Timestamp\n";
  const rows = transfers.map(t => 
    `${t.tokenId},${t.from},${t.to},${t.blockNumber},${t.transactionHash},${t.timestamp || ''}`
  ).join("\n");
  
  fs.writeFileSync(outputPath, headers + rows);
  console.log(`✓ Saved: ${outputPath}`);
}

async function main() {
  console.log("=".repeat(60));
  console.log("MEGAZION ENFT Ledger Export");
  console.log("=".repeat(60));
  
  const network = await ethers.provider.getNetwork();
  console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  const contractAddress = await getContractAddress();
  
  // Query transfer events
  const transfers = await exportTransferEvents(contractAddress);
  
  if (transfers.length === 0) {
    console.warn("\n⚠️  No transfer events found.");
    console.warn("   This could mean:");
    console.warn("   - The contract has no transfers yet");
    console.warn("   - The contract address is incorrect");
    console.warn("   - The contract is not an ERC721/ERC1155");
    return;
  }
  
  // Get block range
  const blockNumbers = transfers.map(t => t.blockNumber);
  const fromBlock = Math.min(...blockNumbers);
  const toBlock = Math.max(...blockNumbers);
  
  // Build ledger data
  const ledger: ENFTLedger = {
    version: "1.0",
    epoch: 1,
    metadata: {
      contract_address: contractAddress,
      network: network.name,
      exported_at: new Date().toISOString(),
      total_transfers: transfers.length,
      block_range: {
        from: fromBlock,
        to: toBlock
      }
    },
    transfers: transfers
  };
  
  // Save outputs
  console.log("\n💾 Saving outputs...");
  await saveJSON(ledger, "enft_ledger_epoch1.json");
  await saveCSV(transfers, "ENFT_Ledger.csv");
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✓ Export complete!");
  console.log("=".repeat(60));
  console.log(`\nSummary:`);
  console.log(`  - Total transfers: ${transfers.length}`);
  console.log(`  - Unique tokens: ${new Set(transfers.map(t => t.tokenId)).size}`);
  console.log(`  - Block range: ${fromBlock} to ${toBlock}`);
  console.log(`\nOutput files:`);
  console.log(`  - enft_ledger_epoch1.json`);
  console.log(`  - ENFT_Ledger.csv`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
