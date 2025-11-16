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
 * ENFT Ledger Export Script
 * MEGAZION / BLEULIONTREASURY Feature Package
 * 
 * Queries Transfer events from deployed ENFT contracts and exports:
 * - outputs/enft_ledger_epoch1.json (structured JSON)
 * - outputs/ENFT_Ledger.csv (tabular format)
 * 
 * Usage:
 *   npx hardhat run scripts/export_enft_ledger.ts --network sepolia
 *   npx hardhat run scripts/export_enft_ledger.ts --network polygon
 * 
 * Required Environment Variables:
 *   - CONTRACT_ADDRESS: Address of the deployed ENFT contract
 *   - ETHEREUM_RPC_URL or network-specific RPC URL
 *   - PRIVATE_KEY (required for provider setup, but no transactions are sent)
 * 
 * Example .env:
 *   CONTRACT_ADDRESS=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_ADDRESS
 *   ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
 *   PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY
 * 
 * Notes:
 *   - This script only reads data from the blockchain (no transactions)
 *   - Testnet-first: Always test on Sepolia/Mumbai before mainnet
 *   - Use START_BLOCK environment variable to limit query scope
 * 
 * See README documentation for complete workflow.
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// Configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const OUTPUT_DIR = "outputs";
const OUTPUT_JSON = `${OUTPUT_DIR}/enft_ledger_epoch1.json`;
const OUTPUT_CSV = `${OUTPUT_DIR}/ENFT_Ledger.csv`;
const START_BLOCK = parseInt(process.env.START_BLOCK || "0");

// ERC721/ERC1155 ABI for Transfer events
const TRANSFER_EVENT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];

interface ENFTTransfer {
  tokenId: string;
  from: string;
  to: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  logIndex: number;
}

interface ENFTLedgerEntry {
  token_id: string;
  owner: string;
  minted_at_block: number;
  minted_at_timestamp: number;
  transaction_hash: string;
  transfers_count: number;
  current_owner: string;
  metadata_uri: string;
  schema_version: string;
}

/**
 * Query Transfer events from the contract
 */
async function queryTransferEvents(): Promise<ENFTTransfer[]> {
  console.log("Connecting to network...");
  const provider = ethers.provider;
  
  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.warn("⚠️  CONTRACT_ADDRESS is placeholder. Set via environment variable.");
    console.warn("    Example: export CONTRACT_ADDRESS=0x123...");
    return [];
  }

  console.log(`Querying Transfer events from: ${CONTRACT_ADDRESS}`);
  console.log(`Starting from block: ${START_BLOCK}`);
  
  // Get current block
  const currentBlock = await provider.getBlockNumber();
  console.log(`Current block: ${currentBlock}`);
  
  const contract = new ethers.Contract(CONTRACT_ADDRESS, TRANSFER_EVENT_ABI, provider);
  const transfers: ENFTTransfer[] = [];
  
  try {
    // Try ERC721 Transfer events
    const filter = contract.filters.Transfer();
    const events = await contract.queryFilter(filter, START_BLOCK, currentBlock);
    
    console.log(`Found ${events.length} Transfer events`);
    
    for (const event of events) {
      const block = await event.getBlock();
      
      transfers.push({
        tokenId: event.args?.tokenId?.toString() || "0",
        from: event.args?.from || ethers.ZeroAddress,
        to: event.args?.to || ethers.ZeroAddress,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp,
        logIndex: event.index
      });
    }
  } catch (error) {
    console.error("   Error querying Transfer events:", error);
  }
  
  // Try ERC1155 TransferSingle events if no ERC721 transfers found
  if (transfers.length === 0) {
    try {
      const filter1155 = contract.filters.TransferSingle();
      const events1155 = await contract.queryFilter(filter1155, START_BLOCK, currentBlock);
      
      console.log(`   Found ${events1155.length} TransferSingle events (ERC1155)`);
      
      for (const event of events1155) {
        const block = await event.getBlock();
        
        transfers.push({
          tokenId: event.args?.id?.toString() || "0",
          from: event.args?.from || ethers.ZeroAddress,
          to: event.args?.to || ethers.ZeroAddress,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: block.timestamp,
          logIndex: event.index
        });
      }
    } catch (error) {
      console.error("   Error querying TransferSingle events:", error);
    }
  }
  
  return transfers.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return a.blockNumber - b.blockNumber;
    }
    return a.logIndex - b.logIndex;
  });
}

/**
 * Build ledger entries from transfer events
 */
function buildLedger(transfers: ENFTTransfer[]): ENFTLedgerEntry[] {
  const ledger = new Map<string, ENFTLedgerEntry>();
  
  for (const transfer of transfers) {
    const tokenId = transfer.tokenId;
    
    if (!ledger.has(tokenId)) {
      // First transfer (mint)
      ledger.set(tokenId, {
        token_id: `ENFT_${tokenId.padStart(6, "0")}`,
        owner: transfer.to,
        minted_at_block: transfer.blockNumber,
        minted_at_timestamp: transfer.timestamp,
        transaction_hash: transfer.transactionHash,
        transfers_count: 1,
        current_owner: transfer.to,
        metadata_uri: `ipfs://REPLACE_WITH_CID/enft_${tokenId.padStart(6, "0")}.json`,
        schema_version: "EVOL.ENFT.v1"
      });
    } else {
      // Subsequent transfer
      const entry = ledger.get(tokenId)!;
      entry.transfers_count++;
      entry.current_owner = transfer.to;
    }
  }
  
  return Array.from(ledger.values()).sort((a, b) => 
    a.minted_at_block - b.minted_at_block
  );
}

/**
 * Export ledger to JSON format
 */
function exportJSON(ledger: ENFTLedgerEntry[], outputPath: string): void {
  const data = {
    metadata: {
      schema_version: "EVOL.ENFT.v1",
      epoch: 1,
      generated_at: new Date().toISOString(),
      total_records: ledger.length,
      contract_address: CONTRACT_ADDRESS,
      note: "Replace metadata_uri placeholders with actual IPFS CIDs after pinning"
    },
    enft_records: ledger.map(entry => ({
      ...entry,
      attributes: {
        domain_weights: {
          civilian_percent: 47.6,
          military_percent: 21.3,
          cosmic_percent: 31.1
        },
        compounding_factor: "π₄ exponential",
        epoch: 1
      }
    }))
  };
  
  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✓ Exported JSON: ${outputPath}`);
}

/**
 * Export ledger to CSV format
 */
function exportCSV(ledger: ENFTLedgerEntry[], outputPath: string): void {
  const headers = [
    "token_id",
    "current_owner",
    "minted_at_block",
    "minted_at_timestamp",
    "transaction_hash",
    "transfers_count",
    "metadata_uri",
    "schema_version"
  ];
  
  const rows = ledger.map(entry => [
    entry.token_id,
    entry.current_owner,
    entry.minted_at_block.toString(),
    entry.minted_at_timestamp.toString(),
    entry.transaction_hash,
    entry.transfers_count.toString(),
    entry.metadata_uri,
    entry.schema_version
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, csvContent);
  console.log(`✓ Exported CSV: ${outputPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log("=".repeat(60));
  console.log("ENFT Ledger Export");
  console.log("=".repeat(60));
  
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Query events
    const transfers = await queryTransferEvents();
    
    if (transfers.length === 0) {
      console.log("\n⚠️  No transfers found. This could mean:");
      console.log("  1. CONTRACT_ADDRESS is not set or invalid");
      console.log("  2. No tokens have been minted yet");
      console.log("  3. Wrong network or RPC URL");
      console.log("\nCreating empty ledger files as placeholders...");
    }
    
    // Build ledger
    const ledger = buildLedger(transfers);
    console.log(`\nProcessed ${ledger.length} unique tokens`);
    
    // Export files
    exportJSON(ledger, OUTPUT_JSON);
    exportCSV(ledger, OUTPUT_CSV);
    
    console.log("\n" + "=".repeat(60));
    console.log("ENFT Ledger Export Complete!");
    console.log("=".repeat(60));
    console.log("\nGenerated files:");
    console.log(`  - ${OUTPUT_JSON}`);
    console.log(`  - ${OUTPUT_CSV}`);
    console.log("\nNext steps:");
    console.log("  1. Review exported ledger data");
    console.log("  2. Update metadata_uri with actual IPFS CIDs");
    console.log("  3. See README documentation for pinning workflow");
    
    // Print summary statistics
    if (ledger.length > 0) {
      const totalTransfers = ledger.reduce((sum, entry) => sum + entry.transfers_count, 0);
      const uniqueOwners = new Set(ledger.map(e => e.current_owner)).size;
      
      console.log("\nStatistics:");
      console.log(`  Total Tokens: ${ledger.length}`);
      console.log(`  Total Transfers: ${totalTransfers}`);
      console.log(`  Unique Owners: ${uniqueOwners}`);
      console.log(`  Avg Transfers per Token: ${(totalTransfers / ledger.length).toFixed(2)}`);
    }
    
  } catch (error) {
    console.error("Error exporting ledger:", error);
    process.exit(1);
  }
}

// Execute
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
