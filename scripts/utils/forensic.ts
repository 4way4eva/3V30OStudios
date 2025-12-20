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
 * Forensic Utilities
 * MEGAZION / BLEULIONTREASURY Security Toolkit
 * 
 * Shared utilities for NFT forensic analysis and evidence collection.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * Compute SHA256 hash of data
 */
export function computeHash(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Compute hash of a file
 */
export function computeFileHash(filepath: string): string {
  const data = fs.readFileSync(filepath);
  return computeHash(data);
}

/**
 * Resolve IPFS URI to HTTP gateway URL
 */
export function resolveIPFS(uri: string, gateway?: string): string {
  const ipfsGateway = gateway || process.env.IPFS_GATEWAY || "https://ipfs.io";
  
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return `${ipfsGateway}/ipfs/${cid}`;
  }
  
  if (uri.startsWith("/ipfs/")) {
    return `${ipfsGateway}${uri}`;
  }
  
  return uri;
}

/**
 * Resolve Arweave URI to HTTP gateway URL
 */
export function resolveArweave(uri: string, gateway?: string): string {
  const arweaveGateway = gateway || process.env.ARWEAVE_GATEWAY || "https://arweave.net";
  
  if (uri.startsWith("ar://")) {
    const txId = uri.replace("ar://", "");
    return `${arweaveGateway}/${txId}`;
  }
  
  return uri;
}

/**
 * Parse data URI and extract content
 */
export function parseDataURI(uri: string): { mimeType: string; data: Buffer } | null {
  if (!uri.startsWith("data:")) {
    return null;
  }
  
  const match = uri.match(/^data:([^;,]+)?(?:;(base64))?,(.*)$/);
  if (!match) {
    return null;
  }
  
  const mimeType = match[1] || "text/plain";
  const isBase64 = match[2] === "base64";
  const dataString = match[3];
  
  const data = isBase64 
    ? Buffer.from(dataString, "base64")
    : Buffer.from(decodeURIComponent(dataString), "utf8");
  
  return { mimeType, data };
}

/**
 * Fetch content from URI (supports http, https, ipfs, ar, data)
 */
export async function fetchURI(uri: string): Promise<Buffer> {
  // Handle data URIs
  if (uri.startsWith("data:")) {
    const parsed = parseDataURI(uri);
    if (!parsed) {
      throw new Error("Invalid data URI");
    }
    return parsed.data;
  }
  
  // Resolve IPFS and Arweave URIs
  const resolvedUri = uri.startsWith("ipfs://") ? resolveIPFS(uri) :
                      uri.startsWith("ar://") ? resolveArweave(uri) :
                      uri;
  
  // Fetch via HTTP
  const response = await fetch(resolvedUri);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Fetch JSON from URI
 */
export async function fetchJSON(uri: string): Promise<any> {
  const data = await fetchURI(uri);
  return JSON.parse(data.toString("utf8"));
}

/**
 * Test IPFS gateway availability
 */
export async function testIPFSGateway(gateway: string, testCID?: string): Promise<boolean> {
  const cid = testCID || "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"; // "Hello World" CID
  const url = `${gateway}/ipfs/${cid}`;
  
  try {
    const response = await fetch(url, { 
      method: "HEAD",
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Find working IPFS gateway from list
 */
export async function findWorkingIPFSGateway(
  gateways: string[] = [
    "https://ipfs.io",
    "https://cloudflare-ipfs.com",
    "https://gateway.pinata.cloud",
    "https://dweb.link"
  ]
): Promise<string | null> {
  for (const gateway of gateways) {
    console.log(`Testing gateway: ${gateway}`);
    if (await testIPFSGateway(gateway)) {
      console.log(`✓ Working gateway found: ${gateway}`);
      return gateway;
    }
  }
  
  console.warn("⚠️  No working IPFS gateway found");
  return null;
}

/**
 * Extract CID from IPFS URI
 */
export function extractIPFSCID(uri: string): string | null {
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "").split("/")[0];
  }
  
  const match = uri.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string, length: number = 4): string {
  if (!isValidAddress(address)) {
    return address;
  }
  return `${address.substring(0, 2 + length)}...${address.substring(42 - length)}`;
}

/**
 * Create evidence directory with timestamp
 */
export function createEvidenceDir(baseDir: string = "outputs"): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const evidenceDir = path.join(process.cwd(), baseDir, `evidence_${timestamp}`);
  
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }
  
  return evidenceDir;
}

/**
 * Save artifact with hash
 */
export function saveArtifact(
  data: string | Buffer,
  filename: string,
  outputDir: string
): { path: string; hash: string } {
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, data);
  
  const hash = computeHash(data);
  
  return { path: filepath, hash };
}

/**
 * Generate artifact manifest
 */
export interface Artifact {
  filename: string;
  path: string;
  hash: string;
  size: number;
  type: string;
  timestamp: string;
}

export function generateArtifactManifest(
  artifacts: Artifact[],
  outputDir: string
): string {
  const manifest = {
    version: "EVOL.EVIDENCE.v1",
    created_at: new Date().toISOString(),
    total_artifacts: artifacts.length,
    artifacts: artifacts.map(a => ({
      filename: a.filename,
      hash: a.hash,
      size: a.size,
      type: a.type,
      timestamp: a.timestamp
    }))
  };
  
  const manifestPath = path.join(outputDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  return manifestPath;
}

/**
 * Common marketplace contract addresses
 */
export const KNOWN_MARKETPLACES = {
  OPENSEA_SEAPORT: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
  OPENSEA_CONDUIT: "0x1E0049783F008A0085193E00003D00cd54003c71",
  LOOKSRARE_EXCHANGE: "0x59728544B08AB483533076417FbBB2fD0B17CE3a",
  X2Y2_EXCHANGE: "0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3",
  BLUR_EXCHANGE: "0x000000000000Ad05Ccc4F10045630fb830B95127",
  RARIBLE_EXCHANGE: "0x9757F2d2b135150BBeb65308D4a91804107cd8D6"
};

/**
 * Detect if address is a known marketplace
 */
export function detectMarketplace(address: string): string | null {
  const normalized = address.toLowerCase();
  
  for (const [name, addr] of Object.entries(KNOWN_MARKETPLACES)) {
    if (addr.toLowerCase() === normalized) {
      return name;
    }
  }
  
  return null;
}

/**
 * Get block explorer URL for address
 */
export function getExplorerURL(
  addressOrTx: string,
  network: string = "mainnet",
  type: "address" | "tx" = "address"
): string {
  const explorers: { [key: string]: string } = {
    mainnet: "https://etherscan.io",
    goerli: "https://goerli.etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    polygon: "https://polygonscan.com",
    mumbai: "https://mumbai.polygonscan.com",
    avalanche: "https://snowtrace.io",
    fuji: "https://testnet.snowtrace.io",
    bsc: "https://bscscan.com",
    "bsc-testnet": "https://testnet.bscscan.com",
    arbitrum: "https://arbiscan.io",
    optimism: "https://optimistic.etherscan.io"
  };
  
  const baseUrl = explorers[network] || explorers.mainnet;
  return `${baseUrl}/${type}/${addressOrTx}`;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp);
  return date.toISOString().replace("T", " ").slice(0, -5) + " UTC";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Validate IPFS CID format
 */
export function isValidIPFSCID(cid: string): boolean {
  // CIDv0: Qm... (base58, 46 chars)
  // CIDv1: b... (base32) or other multibase prefix
  return /^Qm[a-zA-Z0-9]{44}$/.test(cid) || /^b[a-z2-7]{58}/.test(cid) || /^[a-z][a-z0-9]{58}/.test(cid);
}

/**
 * Parse contract:tokenId format
 */
export function parseTokenIdentifier(identifier: string): { contract: string; tokenId: string } | null {
  const match = identifier.match(/^(0x[a-fA-F0-9]{40}):(\d+)$/);
  if (!match) {
    return null;
  }
  
  return {
    contract: match[1],
    tokenId: match[2]
  };
}

/**
 * Format token identifier
 */
export function formatTokenIdentifier(contract: string, tokenId: string | number): string {
  return `${contract}:${tokenId}`;
}
