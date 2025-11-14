// MIT License
// 
// Copyright (c) 2024 3V30OStudios / MEGAZION Codex
// 
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
 * ENFT Ledger Export Script
 * MEGAZION / BLEULIONTREASURY Feature Package
 * 
 * Queries Transfer events from deployed ENFT contracts and exports:
 * - enft_ledger_epoch1.json (structured JSON)
 * - ENFT_Ledger.csv (tabular format)
 * 
 * Usage:
 *   npx hardhat run scripts/export_enft_ledger.ts --network sepolia
 *   npx hardhat run scripts/export_enft_ledger.ts --network polygon
 * 
 * Required Environment Variables:
 *   - ETHEREUM_RPC_URL or network-specific RPC URL
 *   - CONTRACT_ADDRESS (or set in script)
 *   - PRIVATE_KEY (read-only operations, but required for provider setup)
 * 
 * See README_48fold.md and README_RUN_LOCAL.md for complete documentation.
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

// Configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const OUTPUT_JSON = "enft_ledger_epoch1.json";
const OUTPUT_CSV = "ENFT_Ledger.csv";
const START_BLOCK = parseInt(process.env.START_BLOCK || "0");

// ERC721 Transfer event signature
const TRANSFER_EVENT_SIGNATURE = "Transfer(address,address,uint256)";

interface ENFTTransfer {
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
  
  // Create filter for Transfer events
  const transferFilter = {
    address: CONTRACT_ADDRESS,
    topics: [
      ethers.utils.id(TRANSFER_EVENT_SIGNATURE)
    ],
    fromBlock: START_BLOCK,
    toBlock: currentBlock
  };
  
  console.log("Fetching events...");
  const logs = await provider.getLogs(transferFilter);
  console.log(`Found ${logs.length} Transfer events`);
  
  // Parse events
  const transfers: ENFTTransfer[] = [];
  
  for (const log of logs) {
    const decoded = ethers.utils.defaultAbiCoder.decode(
      ["address", "address", "uint256"],
      log.data
    );
    
    const block = await provider.getBlock(log.blockNumber);
    
    transfers.push({
      tokenId: decoded[2].toString(),
      from: ethers.utils.getAddress("0x" + log.topics[1].slice(26)),
      to: ethers.utils.getAddress("0x" + log.topics[2].slice(26)),
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      timestamp: block.timestamp,
      logIndex: log.logIndex
    });
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
  
  fs.writeFileSync(outputPath, csvContent);
  console.log(`✓ Exported CSV: ${outputPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log("=" .repeat(60));
  console.log("ENFT Ledger Export");
  console.log("=" .repeat(60));
  
  try {
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
    console.log("  3. See README_NOTE_PIN_MINT.md for pinning workflow");
    
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
