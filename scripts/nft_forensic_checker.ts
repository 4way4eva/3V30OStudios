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
 * NFT Forensic Checker
 * MEGAZION / BLEULIONTREASURY Security & Evidence Collection Tool
 * 
 * Read-only forensic analysis tool for investigating "whitewashed" NFTs,
 * metadata mismatches, and unauthorized metadata changes.
 * 
 * This tool performs non-destructive on-chain verification:
 * - Verifies token ownership
 * - Fetches and validates tokenURI and metadata
 * - Computes SHA256 hashes for evidence preservation
 * - Checks for metadata mutability (setBaseURI, setTokenURI, etc.)
 * - Exports transfer events and approval history
 * 
 * Usage:
 *   # Inspect a single token
 *   PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
 *   npx ts-node scripts/nft_forensic_checker.ts \
 *     --contract 0xContractAddress \
 *     --tokenId 1234
 * 
 *   # Inspect all tokens in a wallet
 *   PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
 *   npx ts-node scripts/nft_forensic_checker.ts \
 *     --wallet 0xWalletAddress \
 *     --contract 0xContractAddress
 * 
 *   # Batch check multiple tokens
 *   PROVIDER_URL="https://mainnet.infura.io/v3/YOUR_KEY" \
 *   npx ts-node scripts/nft_forensic_checker.ts \
 *     --contract 0xContractAddress \
 *     --tokenIds "1,2,3,4,5"
 * 
 * Environment Variables:
 *   PROVIDER_URL: RPC endpoint (required, e.g., Infura, Alchemy)
 *   ETHERSCAN_API_KEY: Optional, for enhanced transfer history
 *   IPFS_GATEWAY: Optional, default is https://ipfs.io
 * 
 * Output:
 *   - outputs/forensic_<contract>_<tokenId>_<timestamp>.json
 *   - outputs/forensic_evidence_<timestamp>.csv
 *   - SHA256 hashes printed to console
 * 
 * Security:
 *   - NO private keys required (read-only operations)
 *   - NO transactions sent to blockchain
 *   - Safe to run in any environment
 * 
 * See problem_statement.md for complete forensic checklist.
 */

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Standard ERC721 ABI for read-only operations
const ERC721_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

// Common metadata mutability functions (to detect if metadata can be changed)
const MUTABILITY_CHECK_ABI = [
  "function setBaseURI(string)",
  "function setTokenURI(uint256,string)",
  "function setContractURI(string)",
  "function updateMetadata(uint256,string)",
  "function owner() view returns (address)",
  "function baseURI() view returns (string)"
];

interface ForensicReport {
  timestamp: string;
  contract: string;
  tokenId: string;
  network: {
    name: string;
    chainId: number;
  };
  ownership: {
    owner: string;
    approved?: string;
    blockNumber: number;
  };
  metadata: {
    tokenURI: string;
    resolvedMetadata?: any;
    metadataHash?: string;
    imageUri?: string;
    imageHash?: string;
  };
  mutability: {
    hasSetBaseURI: boolean;
    hasSetTokenURI: boolean;
    hasSetContractURI: boolean;
    hasUpdateMetadata: boolean;
    contractOwner?: string;
    baseURI?: string;
  };
  transferHistory: {
    totalTransfers: number;
    events: any[];
  };
  approvalHistory: {
    events: any[];
  };
  warnings: string[];
}

/**
 * Compute SHA256 hash of data
 */
function computeHash(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Resolve IPFS URI to gateway URL
 */
function resolveIPFS(uri: string, gateway?: string): string {
  const ipfsGateway = gateway || process.env.IPFS_GATEWAY || "https://ipfs.io";
  
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return `${ipfsGateway}/ipfs/${cid}`;
  }
  
  return uri;
}

/**
 * Fetch metadata from URI
 */
async function fetchMetadata(uri: string): Promise<any> {
  // Handle data URIs
  if (uri.startsWith("data:application/json;base64,")) {
    const base64Data = uri.split(",")[1];
    const jsonString = Buffer.from(base64Data, "base64").toString("utf8");
    return JSON.parse(jsonString);
  }
  
  // Handle IPFS URIs
  const resolvedUri = resolveIPFS(uri);
  
  try {
    const response = await fetch(resolvedUri);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch metadata from ${resolvedUri}:`, error);
    return null;
  }
}

/**
 * Fetch image and compute hash
 */
async function fetchAndHashImage(uri: string): Promise<{ hash: string; size: number } | null> {
  const resolvedUri = resolveIPFS(uri);
  
  try {
    const response = await fetch(resolvedUri);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const hash = computeHash(buffer);
    
    return {
      hash,
      size: buffer.length
    };
  } catch (error) {
    console.warn(`Failed to fetch image from ${resolvedUri}:`, error);
    return null;
  }
}

/**
 * Check if contract has metadata mutability functions
 */
async function checkMutability(
  provider: ethers.Provider,
  contractAddress: string
): Promise<ForensicReport["mutability"]> {
  const result: ForensicReport["mutability"] = {
    hasSetBaseURI: false,
    hasSetTokenURI: false,
    hasSetContractURI: false,
    hasUpdateMetadata: false
  };
  
  // Get contract code to check if functions exist
  const code = await provider.getCode(contractAddress);
  
  // Simple heuristic: check for function selectors in bytecode
  // setBaseURI(string) => 0x55f804b3
  // setTokenURI(uint256,string) => 0x162094c4
  // setContractURI(string) => 0x938e3d7b
  // owner() => 0x8da5cb5b
  
  result.hasSetBaseURI = code.includes("55f804b3");
  result.hasSetTokenURI = code.includes("162094c4");
  result.hasSetContractURI = code.includes("938e3d7b");
  result.hasUpdateMetadata = code.includes("updateMetadata") || code.includes("setMetadata");
  
  // Try to get contract owner
  try {
    const contract = new ethers.Contract(contractAddress, ["function owner() view returns (address)"], provider);
    result.contractOwner = await contract.owner();
  } catch {
    // Owner function doesn't exist or failed
  }
  
  // Try to get base URI
  try {
    const contract = new ethers.Contract(contractAddress, ["function baseURI() view returns (string)"], provider);
    result.baseURI = await contract.baseURI();
  } catch {
    // baseURI function doesn't exist or failed
  }
  
  return result;
}

/**
 * Get transfer events for a token
 */
async function getTransferEvents(
  provider: ethers.Provider,
  contractAddress: string,
  tokenId: string
): Promise<any[]> {
  const contractInterface = new ethers.Interface(ERC721_ABI);
  
  try {
    // Query Transfer events for this specific token
    const logs = await provider.getLogs({
      address: contractAddress,
      topics: [
        ethers.id("Transfer(address,address,uint256)"),
        null, // from (any)
        null, // to (any)
        ethers.zeroPadValue(ethers.toBeHex(tokenId), 32) // tokenId
      ],
      fromBlock: 0,
      toBlock: "latest"
    });
    
    const events = [];
    for (const log of logs) {
      try {
        const parsed = contractInterface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        
        if (parsed) {
          events.push({
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            from: parsed.args.from,
            to: parsed.args.to,
            tokenId: parsed.args.tokenId.toString()
          });
        }
      } catch (err) {
        console.warn("Failed to parse transfer log:", err);
      }
    }
    
    return events;
  } catch (error) {
    console.warn("Failed to fetch transfer events:", error);
    return [];
  }
}

/**
 * Get approval events for a token
 */
async function getApprovalEvents(
  provider: ethers.Provider,
  contractAddress: string,
  tokenId: string
): Promise<any[]> {
  const contractInterface = new ethers.Interface(ERC721_ABI);
  
  try {
    const logs = await provider.getLogs({
      address: contractAddress,
      topics: [
        ethers.id("Approval(address,address,uint256)"),
        null, // owner (any)
        null, // approved (any)
        ethers.zeroPadValue(ethers.toBeHex(tokenId), 32) // tokenId
      ],
      fromBlock: 0,
      toBlock: "latest"
    });
    
    const events = [];
    for (const log of logs) {
      try {
        const parsed = contractInterface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        
        if (parsed) {
          events.push({
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            owner: parsed.args.owner,
            approved: parsed.args.approved,
            tokenId: parsed.args.tokenId.toString()
          });
        }
      } catch (err) {
        console.warn("Failed to parse approval log:", err);
      }
    }
    
    return events;
  } catch (error) {
    console.warn("Failed to fetch approval events:", error);
    return [];
  }
}

/**
 * Perform forensic analysis on a single token
 */
async function inspectToken(
  provider: ethers.Provider,
  contractAddress: string,
  tokenId: string
): Promise<ForensicReport> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Inspecting Token: ${contractAddress}:${tokenId}`);
  console.log("=".repeat(60));
  
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();
  
  const report: ForensicReport = {
    timestamp: new Date().toISOString(),
    contract: contractAddress,
    tokenId: tokenId,
    network: {
      name: network.name,
      chainId: Number(network.chainId)
    },
    ownership: {
      owner: "",
      blockNumber
    },
    metadata: {
      tokenURI: ""
    },
    mutability: {
      hasSetBaseURI: false,
      hasSetTokenURI: false,
      hasSetContractURI: false,
      hasUpdateMetadata: false
    },
    transferHistory: {
      totalTransfers: 0,
      events: []
    },
    approvalHistory: {
      events: []
    },
    warnings: []
  };
  
  // Get ownership
  try {
    console.log("Checking ownership...");
    report.ownership.owner = await contract.ownerOf(tokenId);
    console.log(`✓ Owner: ${report.ownership.owner}`);
    
    // Get approved address if any
    try {
      const approved = await contract.getApproved(tokenId);
      if (approved !== ethers.ZeroAddress) {
        report.ownership.approved = approved;
        console.log(`⚠️  Approved operator: ${approved}`);
        report.warnings.push(`Token has approved operator: ${approved}`);
      }
    } catch {
      // getApproved might not be available
    }
  } catch (error: any) {
    console.error(`✗ Failed to get owner: ${error.message}`);
    report.warnings.push(`Failed to verify ownership: ${error.message}`);
  }
  
  // Get tokenURI
  try {
    console.log("Fetching tokenURI...");
    report.metadata.tokenURI = await contract.tokenURI(tokenId);
    console.log(`✓ TokenURI: ${report.metadata.tokenURI.substring(0, 100)}...`);
    
    // Fetch and hash metadata
    console.log("Fetching metadata JSON...");
    const metadata = await fetchMetadata(report.metadata.tokenURI);
    if (metadata) {
      report.metadata.resolvedMetadata = metadata;
      const metadataStr = JSON.stringify(metadata);
      report.metadata.metadataHash = computeHash(metadataStr);
      console.log(`✓ Metadata hash: ${report.metadata.metadataHash}`);
      
      // If metadata has an image, fetch and hash it
      if (metadata.image) {
        report.metadata.imageUri = metadata.image;
        console.log(`Fetching image from ${metadata.image.substring(0, 50)}...`);
        const imageInfo = await fetchAndHashImage(metadata.image);
        if (imageInfo) {
          report.metadata.imageHash = imageInfo.hash;
          console.log(`✓ Image hash: ${imageInfo.hash} (${imageInfo.size} bytes)`);
        }
      }
    }
  } catch (error: any) {
    console.error(`✗ Failed to get tokenURI: ${error.message}`);
    report.warnings.push(`Failed to fetch tokenURI: ${error.message}`);
  }
  
  // Check mutability
  console.log("Checking metadata mutability...");
  report.mutability = await checkMutability(provider, contractAddress);
  
  if (report.mutability.hasSetBaseURI || report.mutability.hasSetTokenURI) {
    console.log("⚠️  Contract has MUTABLE metadata functions:");
    if (report.mutability.hasSetBaseURI) console.log("   - setBaseURI");
    if (report.mutability.hasSetTokenURI) console.log("   - setTokenURI");
    if (report.mutability.hasSetContractURI) console.log("   - setContractURI");
    if (report.mutability.hasUpdateMetadata) console.log("   - updateMetadata");
    if (report.mutability.contractOwner) {
      console.log(`   - Contract owner: ${report.mutability.contractOwner}`);
    }
    report.warnings.push("Contract metadata is MUTABLE - can be changed by owner");
  } else {
    console.log("✓ No obvious metadata mutability functions detected");
  }
  
  // Get transfer history
  console.log("Fetching transfer history...");
  report.transferHistory.events = await getTransferEvents(provider, contractAddress, tokenId);
  report.transferHistory.totalTransfers = report.transferHistory.events.length;
  console.log(`✓ Found ${report.transferHistory.totalTransfers} transfer events`);
  
  // Get approval history
  console.log("Fetching approval history...");
  report.approvalHistory.events = await getApprovalEvents(provider, contractAddress, tokenId);
  console.log(`✓ Found ${report.approvalHistory.events.length} approval events`);
  
  // Analyze transfer pattern
  if (report.transferHistory.totalTransfers > 0) {
    const lastTransfer = report.transferHistory.events[report.transferHistory.events.length - 1];
    if (lastTransfer.to !== report.ownership.owner) {
      report.warnings.push(
        `Last transfer destination (${lastTransfer.to}) differs from current owner (${report.ownership.owner})`
      );
    }
  }
  
  return report;
}

/**
 * Export forensic report to JSON
 */
function exportReport(report: ForensicReport, outputDir: string): string {
  const filename = `forensic_${report.contract.substring(0, 10)}_${report.tokenId}_${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\n✓ Forensic report saved: ${filepath}`);
  
  return filepath;
}

/**
 * Export summary to CSV
 */
function exportCSV(reports: ForensicReport[], outputDir: string): string {
  const filename = `forensic_evidence_${Date.now()}.csv`;
  const filepath = path.join(outputDir, filename);
  
  const header = "Contract,TokenID,Owner,TokenURI,MetadataHash,ImageHash,Mutable,Transfers,Warnings\n";
  const rows = reports.map(r => {
    const mutable = r.mutability.hasSetBaseURI || r.mutability.hasSetTokenURI ? "YES" : "NO";
    const warnings = r.warnings.length;
    return `${r.contract},${r.tokenId},${r.ownership.owner},${r.metadata.tokenURI},${r.metadata.metadataHash || "N/A"},${r.metadata.imageHash || "N/A"},${mutable},${r.transferHistory.totalTransfers},${warnings}`;
  }).join("\n");
  
  fs.writeFileSync(filepath, header + rows);
  console.log(`✓ CSV summary saved: ${filepath}`);
  
  return filepath;
}

/**
 * Main execution
 */
async function main() {
  console.log("NFT Forensic Checker - MEGAZION Security Tool");
  console.log("=".repeat(60));
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 ? args[index + 1] : undefined;
  };
  
  const contractAddress = getArg("contract");
  const tokenId = getArg("tokenId");
  const tokenIds = getArg("tokenIds");
  const walletAddress = getArg("wallet");
  
  if (!contractAddress) {
    console.error("\n❌ Error: --contract parameter is required");
    console.log("\nUsage:");
    console.log("  npx ts-node scripts/nft_forensic_checker.ts --contract 0xAddress --tokenId 123");
    console.log("  npx ts-node scripts/nft_forensic_checker.ts --contract 0xAddress --tokenIds '1,2,3'");
    console.log("  npx ts-node scripts/nft_forensic_checker.ts --contract 0xAddress --wallet 0xWallet");
    process.exit(1);
  }
  
  // Get provider
  const providerUrl = process.env.PROVIDER_URL;
  if (!providerUrl) {
    console.error("\n❌ Error: PROVIDER_URL environment variable is required");
    console.log("Set PROVIDER_URL to your RPC endpoint (e.g., Infura, Alchemy)");
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(providerUrl);
  console.log("✓ Connected to provider");
  
  // Create output directory
  const outputDir = path.join(process.cwd(), "outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const reports: ForensicReport[] = [];
  
  // Process single token
  if (tokenId) {
    const report = await inspectToken(provider, contractAddress, tokenId);
    reports.push(report);
    exportReport(report, outputDir);
  }
  // Process multiple tokens
  else if (tokenIds) {
    const ids = tokenIds.split(",").map(id => id.trim());
    for (const id of ids) {
      const report = await inspectToken(provider, contractAddress, id);
      reports.push(report);
      exportReport(report, outputDir);
    }
  }
  // Process wallet tokens (requires balanceOf and tokenOfOwnerByIndex)
  else if (walletAddress) {
    console.log(`\nScanning wallet: ${walletAddress}`);
    console.log("Note: This requires the contract to support enumeration (ERC721Enumerable)");
    
    try {
      const contract = new ethers.Contract(
        contractAddress,
        [
          "function balanceOf(address owner) view returns (uint256)",
          "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
        ],
        provider
      );
      
      const balance = await contract.balanceOf(walletAddress);
      console.log(`Wallet has ${balance} tokens in this contract`);
      
      for (let i = 0; i < balance; i++) {
        const id = await contract.tokenOfOwnerByIndex(walletAddress, i);
        const report = await inspectToken(provider, contractAddress, id.toString());
        reports.push(report);
        exportReport(report, outputDir);
      }
    } catch (error: any) {
      console.error(`\n❌ Failed to enumerate wallet tokens: ${error.message}`);
      console.log("Contract may not support ERC721Enumerable interface");
      process.exit(1);
    }
  } else {
    console.error("\n❌ Error: Either --tokenId, --tokenIds, or --wallet must be provided");
    process.exit(1);
  }
  
  // Export CSV summary
  if (reports.length > 0) {
    exportCSV(reports, outputDir);
    
    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("FORENSIC SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total tokens inspected: ${reports.length}`);
    console.log(`Tokens with warnings: ${reports.filter(r => r.warnings.length > 0).length}`);
    console.log(`Tokens with mutable metadata: ${reports.filter(r => r.mutability.hasSetBaseURI || r.mutability.hasSetTokenURI).length}`);
    
    // Print critical warnings
    const criticalWarnings = reports.filter(r => r.warnings.length > 0);
    if (criticalWarnings.length > 0) {
      console.log("\n⚠️  CRITICAL FINDINGS:");
      criticalWarnings.forEach(r => {
        console.log(`\nToken ${r.contract}:${r.tokenId}`);
        r.warnings.forEach(w => console.log(`  - ${w}`));
      });
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("Forensic analysis complete!");
    console.log("=".repeat(60));
  }
}

// Execute
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
