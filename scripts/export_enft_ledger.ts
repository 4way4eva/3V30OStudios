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
 * MEGAZION / BLEULIONTREASURY Feature Package
 * 
 * Exports Transfer events from deployed ENFT contracts to structured ledger files.
 * 
 * Outputs:
 *   - outputs/enft_ledger_<network>_<timestamp>.json
 *   - outputs/ENFT_Ledger_<network>_<timestamp>.csv
 * 
 * Usage:
 *   npx hardhat run scripts/export_enft_ledger.ts --network sepolia
 *   npx hardhat run scripts/export_enft_ledger.ts --network mumbai
 *   npx hardhat run scripts/export_enft_ledger.ts --network localhost
 * 
 * Environment Variables Required:
 *   - ENFT_CONTRACT_ADDRESS: Address of deployed ENFT contract (or use default placeholder)
 *   - <NETWORK>_RPC_URL: RPC endpoint for the target network
 *   - PRIVATE_KEY: Private key (only used for provider initialization, no transactions sent)
 * 
 * Example .env:
 *   ENFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
 *   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
 *   PRIVATE_KEY=0xPLACEHOLDER_REPLACE_WITH_ACTUAL_KEY
 * 
 * Notes:
 *   - This script only reads data from the blockchain (no transactions)
 *   - Uses placeholder addresses if contract not deployed
 *   - Filters Transfer events from block 0 to latest
 *   - Safe to run multiple times (idempotent)
 * 
 * See README_48fold.md and README_RUN_LOCAL.md for complete documentation.
 */

import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// Standard ERC721/ERC1155 Transfer event ABI
const TRANSFER_EVENT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];

interface TransferEvent {
  blockNumber: number;
  transactionHash: string;
  from: string;
  to: string;
  tokenId: string;
  value?: string;
  eventType: "Transfer" | "TransferSingle" | "TransferBatch";
  timestamp?: number;
}

interface ENFTLedgerEntry {
  token_id: string;
  current_owner: string;
  transfer_history: TransferEvent[];
  metadata_uri?: string;
  mint_block: number;
  mint_transaction: string;
}

/**
 * Export ENFT ledger data from blockchain events
 */
async function exportENFTLedger() {
  console.log("\n" + "=".repeat(60));
  console.log("ENFT Ledger Export Tool");
  console.log("=".repeat(60));

  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get contract address from environment or use placeholder
  const contractAddress = process.env.ENFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  console.log(`Contract Address: ${contractAddress}`);

  // Check if placeholder address
  if (contractAddress === "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠️  Using placeholder address - no actual blockchain data will be fetched");
    console.log("Set ENFT_CONTRACT_ADDRESS environment variable to fetch real data");
    await generatePlaceholderLedger(network.name);
    return;
  }

  // Create contract interface for event parsing
  const contractInterface = new ethers.Interface(TRANSFER_EVENT_ABI);

  console.log("\nFetching Transfer events from blockchain...");
  
  try {
    // Get current block number
    const latestBlock = await ethers.provider.getBlockNumber();
    console.log(`Latest block: ${latestBlock}`);

    // Fetch Transfer events (adjust fromBlock as needed for faster queries)
    const fromBlock = 0; // Start from genesis - adjust for production
    const toBlock = "latest";

    console.log(`Querying events from block ${fromBlock} to ${toBlock}...`);

    // Query logs for Transfer events
    const logs = await ethers.provider.getLogs({
      address: contractAddress,
      topics: [
        [
          ethers.id("Transfer(address,address,uint256)"),
          ethers.id("TransferSingle(address,address,address,uint256,uint256)"),
          ethers.id("TransferBatch(address,address,address,uint256[],uint256[])")
        ]
      ],
      fromBlock,
      toBlock
    });

    console.log(`Found ${logs.length} transfer events`);

    // Parse events
    const transferEvents: TransferEvent[] = [];
    
    for (const log of logs) {
      try {
        const parsedLog = contractInterface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });

        if (!parsedLog) continue;

        let event: TransferEvent;

        if (parsedLog.name === "Transfer") {
          event = {
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            from: parsedLog.args.from,
            to: parsedLog.args.to,
            tokenId: parsedLog.args.tokenId.toString(),
            eventType: "Transfer"
          };
        } else if (parsedLog.name === "TransferSingle") {
          event = {
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            from: parsedLog.args.from,
            to: parsedLog.args.to,
            tokenId: parsedLog.args.id.toString(),
            value: parsedLog.args.value.toString(),
            eventType: "TransferSingle"
          };
        } else if (parsedLog.name === "TransferBatch") {
          // For batch transfers, create multiple events
          const ids = parsedLog.args.ids;
          const values = parsedLog.args.values;
          
          for (let i = 0; i < ids.length; i++) {
            transferEvents.push({
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              from: parsedLog.args.from,
              to: parsedLog.args.to,
              tokenId: ids[i].toString(),
              value: values[i].toString(),
              eventType: "TransferBatch"
            });
          }
          continue;
        } else {
          continue;
        }

        transferEvents.push(event);
      } catch (err) {
        console.warn(`Failed to parse log: ${err}`);
      }
    }

    console.log(`Parsed ${transferEvents.length} transfer events`);

    // Build ledger entries
    const ledgerMap = new Map<string, ENFTLedgerEntry>();

    for (const event of transferEvents) {
      if (!ledgerMap.has(event.tokenId)) {
        // First transfer (mint)
        ledgerMap.set(event.tokenId, {
          token_id: event.tokenId,
          current_owner: event.to,
          transfer_history: [event],
          metadata_uri: `ipfs://REPLACE_WITH_CID/${event.tokenId}.json`,
          mint_block: event.blockNumber,
          mint_transaction: event.transactionHash
        });
      } else {
        // Subsequent transfer
        const entry = ledgerMap.get(event.tokenId)!;
        entry.current_owner = event.to;
        entry.transfer_history.push(event);
      }
    }

    const ledgerEntries = Array.from(ledgerMap.values());
    console.log(`Built ledger with ${ledgerEntries.length} unique tokens`);

    // Export to files
    await exportToJSON(ledgerEntries, network.name);
    await exportToCSV(transferEvents, network.name);

    console.log("\n" + "=".repeat(60));
    console.log("Export complete!");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Error fetching events:");
    console.error(error);
    process.exit(1);
  }
}

/**
 * Generate placeholder ledger when no contract deployed
 */
async function generatePlaceholderLedger(networkName: string) {
  console.log("\nGenerating placeholder ledger data...");

  const placeholderEntries: ENFTLedgerEntry[] = [
    {
      token_id: "1",
      current_owner: "0x0000000000000000000000000000000000000001",
      transfer_history: [{
        blockNumber: 1,
        transactionHash: "0x" + "0".repeat(64),
        from: ethers.ZeroAddress,
        to: "0x0000000000000000000000000000000000000001",
        tokenId: "1",
        eventType: "Transfer"
      }],
      metadata_uri: "ipfs://REPLACE_WITH_CID/1.json",
      mint_block: 1,
      mint_transaction: "0x" + "0".repeat(64)
    },
    {
      token_id: "2",
      current_owner: "0x0000000000000000000000000000000000000002",
      transfer_history: [{
        blockNumber: 2,
        transactionHash: "0x" + "1".repeat(64),
        from: ethers.ZeroAddress,
        to: "0x0000000000000000000000000000000000000002",
        tokenId: "2",
        eventType: "Transfer"
      }],
      metadata_uri: "ipfs://REPLACE_WITH_CID/2.json",
      mint_block: 2,
      mint_transaction: "0x" + "1".repeat(64)
    }
  ];

  await exportToJSON(placeholderEntries, networkName);
  
  const placeholderTransfers = placeholderEntries.flatMap(e => e.transfer_history);
  await exportToCSV(placeholderTransfers, networkName);

  console.log("\n✓ Placeholder ledger generated");
}

/**
 * Export ledger to JSON format
 */
async function exportToJSON(entries: ENFTLedgerEntry[], networkName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const outputDir = path.join(process.cwd(), "outputs");
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `enft_ledger_${networkName}_${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  const output = {
    metadata: {
      exported_at: new Date().toISOString(),
      network: networkName,
      total_tokens: entries.length,
      schema_version: "EVOL.ENFT.v1",
      note: "Replace IPFS CID placeholders with actual content identifiers"
    },
    ledger: entries
  };

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
  console.log(`✓ JSON exported: ${filepath}`);
}

/**
 * Export transfer events to CSV format
 */
async function exportToCSV(events: TransferEvent[], networkName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const outputDir = path.join(process.cwd(), "outputs");
  
  const filename = `ENFT_Ledger_${networkName}_${timestamp}.csv`;
  const filepath = path.join(outputDir, filename);

  // CSV header
  const header = "Block,Transaction Hash,From,To,Token ID,Value,Event Type\n";
  
  // CSV rows
  const rows = events.map(e => 
    `${e.blockNumber},${e.transactionHash},${e.from},${e.to},${e.tokenId},${e.value || ""},${e.eventType}`
  ).join("\n");

  fs.writeFileSync(filepath, header + rows);
  console.log(`✓ CSV exported: ${filepath}`);
}

// Execute the export
exportENFTLedger()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
