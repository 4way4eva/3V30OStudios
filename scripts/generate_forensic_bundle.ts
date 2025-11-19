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
 * Forensic Evidence Bundle Generator
 * MEGAZION / BLEULIONTREASURY Legal & Tribunal Evidence Tool
 * 
 * Generates tribunal-ready evidence bundles for NFT metadata anomalies,
 * "whitewashed" tokens, and unauthorized metadata changes.
 * 
 * Creates:
 * - Pattern Ledger Entry (XX/YY/ZZ/TT/WW analysis)
 * - Watchtower CSV with timestamps and hashes
 * - Marketplace dispute templates (OpenSea, LooksRare, Magic Eden)
 * - Pulse Archive manifest for IPFS/Arweave pinning
 * - ENFT metadata seal for on-chain evidence preservation
 * 
 * Usage:
 *   # Generate evidence bundle from forensic report
 *   npx ts-node scripts/generate_forensic_bundle.ts \
 *     --forensic outputs/forensic_0x123_456_789.json \
 *     --wallet 0xWalletAddress \
 *     --marketplace opensea
 * 
 *   # Generate from multiple reports
 *   npx ts-node scripts/generate_forensic_bundle.ts \
 *     --forensic-dir outputs/ \
 *     --wallet 0xWalletAddress
 * 
 *   # Generate with custom IPFS pinning
 *   IPFS_API_URL="https://api.pinata.cloud" \
 *   IPFS_JWT="your_jwt_token" \
 *   npx ts-node scripts/generate_forensic_bundle.ts \
 *     --forensic outputs/forensic_report.json \
 *     --pin-ipfs
 * 
 * Output:
 *   - outputs/evidence_bundle_<timestamp>/
 *     - pattern_ledger.json (XX/YY/ZZ/TT/WW spiral analysis)
 *     - watchtower.csv (audit trail)
 *     - pulse_manifest.json (artifact manifest)
 *     - dispute_opensea.txt (marketplace complaint)
 *     - dispute_looksrare.txt
 *     - dispute_magiceden.txt
 *     - enft_seal.json (on-chain proof metadata)
 *     - README.md (bundle documentation)
 * 
 * Pattern Ledger Structure (XX/YY/ZZ/TT/WW):
 *   XX (cut): First visible anomaly - UI mismatch, metadata change
 *   YY (return): Fund/approval flows - approvals, transfers to aggregators
 *   ZZ (depth): Off-chain artifacts - dev commits, CI times, hosting changes
 *   TT (timing): Timestamp correlation - WalletConnect sessions, tx times
 *   WW (intent): Motive analysis - censorship, laundering, marketplace tactics
 * 
 * See problem_statement.md for complete forensic methodology.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

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

interface PatternLedgerEntry {
  token_identifier: string;
  analysis_timestamp: string;
  XX_cut: {
    description: string;
    anomaly_type: string;
    first_observed: string;
    evidence: string[];
  };
  YY_return: {
    description: string;
    fund_flows: any[];
    approvals: any[];
    marketplace_activity: string[];
  };
  ZZ_depth: {
    description: string;
    metadata_hosting: string;
    metadata_mutations: any[];
    commit_correlations: string[];
  };
  TT_timing: {
    description: string;
    critical_timestamps: any[];
    session_correlations: string[];
    tx_timing_analysis: string;
  };
  WW_intent: {
    description: string;
    suspected_motive: string;
    pattern_match: string;
    confidence_level: string;
  };
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  recommended_actions: string[];
}

interface WatchtowerEntry {
  timestamp: string;
  event_type: string;
  contract: string;
  token_id: string;
  actor: string;
  artifact_hash: string;
  artifact_uri: string;
  block_number?: number;
  tx_hash?: string;
  notes: string;
}

interface PulseManifest {
  bundle_version: string;
  created_at: string;
  wallet_address: string;
  affected_tokens: string[];
  artifacts: {
    path: string;
    hash: string;
    type: string;
    description: string;
  }[];
  ipfs_pins?: {
    artifact: string;
    cid: string;
  }[];
  arweave_txs?: {
    artifact: string;
    tx_id: string;
  }[];
}

/**
 * Generate Pattern Ledger entry (XX/YY/ZZ/TT/WW analysis)
 */
function generatePatternLedger(report: ForensicReport, walletAddress: string): PatternLedgerEntry {
  const tokenIdentifier = `${report.contract}:${report.tokenId}`;
  
  // XX - Cut: First visible anomaly
  const XX_cut = {
    description: "Initial anomaly detection - metadata mismatch observed in wallet UI",
    anomaly_type: report.warnings.length > 0 ? "METADATA_MISMATCH" : "INSPECTION",
    first_observed: report.timestamp,
    evidence: [
      `Contract: ${report.contract}`,
      `Token ID: ${report.tokenId}`,
      `Current Owner: ${report.ownership.owner}`,
      `Token URI: ${report.metadata.tokenURI}`,
      ...report.warnings.map(w => `Warning: ${w}`)
    ]
  };
  
  // YY - Return: Fund/approval flows
  const YY_return = {
    description: "Fund flows and approval patterns",
    fund_flows: report.transferHistory.events.map(e => ({
      block: e.blockNumber,
      from: e.from,
      to: e.to,
      tx: e.transactionHash
    })),
    approvals: report.approvalHistory.events.map(e => ({
      block: e.blockNumber,
      owner: e.owner,
      approved: e.approved,
      tx: e.transactionHash
    })),
    marketplace_activity: report.approvalHistory.events
      .filter((e: any) => e.approved !== "0x0000000000000000000000000000000000000000")
      .map((e: any) => `Approval to ${e.approved} at block ${e.blockNumber}`)
  };
  
  // ZZ - Depth: Off-chain artifacts
  const ZZ_depth = {
    description: "Off-chain metadata and hosting analysis",
    metadata_hosting: report.metadata.tokenURI.startsWith("ipfs://") ? "IPFS" :
                       report.metadata.tokenURI.startsWith("data:") ? "On-chain (data URI)" :
                       report.metadata.tokenURI.startsWith("http://") || report.metadata.tokenURI.startsWith("https://") ? "Centralized HTTP" :
                       "Unknown",
    metadata_mutations: report.mutability.hasSetBaseURI || report.mutability.hasSetTokenURI ? [
      {
        type: "MUTABLE_METADATA_DETECTED",
        details: "Contract has functions to modify metadata",
        functions: [
          report.mutability.hasSetBaseURI && "setBaseURI",
          report.mutability.hasSetTokenURI && "setTokenURI",
          report.mutability.hasSetContractURI && "setContractURI",
          report.mutability.hasUpdateMetadata && "updateMetadata"
        ].filter(Boolean),
        contract_owner: report.mutability.contractOwner || "Unknown"
      }
    ] : [],
    commit_correlations: [
      "Manual correlation required: check dev activity against transfer times"
    ]
  };
  
  // TT - Timing: Timestamp correlation
  const mintEvent = report.transferHistory.events.find((e: any) => e.from === "0x0000000000000000000000000000000000000000");
  const TT_timing = {
    description: "Temporal pattern analysis",
    critical_timestamps: [
      {
        event: "Token Mint",
        block: mintEvent?.blockNumber || "Unknown",
        tx: mintEvent?.transactionHash || "Unknown"
      },
      {
        event: "Latest Transfer",
        block: report.transferHistory.events.length > 0 ? 
               report.transferHistory.events[report.transferHistory.events.length - 1].blockNumber : 
               "None",
        tx: report.transferHistory.events.length > 0 ? 
            report.transferHistory.events[report.transferHistory.events.length - 1].transactionHash : 
            "None"
      },
      {
        event: "Forensic Analysis",
        timestamp: report.timestamp,
        block: report.ownership.blockNumber
      }
    ],
    session_correlations: [
      "Check WalletConnect session logs against transfer timestamps",
      "Correlate metadata fetch times with reported anomaly"
    ],
    tx_timing_analysis: `${report.transferHistory.totalTransfers} total transfers observed`
  };
  
  // WW - Intent: Motive analysis
  const hasApprovals = report.approvalHistory.events.length > 0;
  const hasMutableMetadata = report.mutability.hasSetBaseURI || report.mutability.hasSetTokenURI;
  const hasWarnings = report.warnings.length > 0;
  
  let suspectedMotive = "INVESTIGATION_REQUIRED";
  let patternMatch = "UNDETERMINED";
  let confidenceLevel = "LOW";
  
  if (hasMutableMetadata && hasWarnings) {
    suspectedMotive = "METADATA_MANIPULATION";
    patternMatch = "Owner has capability to change metadata, warnings detected";
    confidenceLevel = "HIGH";
  } else if (hasApprovals && report.transferHistory.totalTransfers > 5) {
    suspectedMotive = "MARKETPLACE_RELISTING";
    patternMatch = "Multiple transfers with marketplace approvals";
    confidenceLevel = "MEDIUM";
  } else if (hasWarnings && report.metadata.tokenURI.startsWith("http")) {
    suspectedMotive = "CENTRALIZED_METADATA_OVERRIDE";
    patternMatch = "Centralized hosting with metadata warnings";
    confidenceLevel = "MEDIUM";
  }
  
  const WW_intent = {
    description: "Motive and pattern assessment",
    suspected_motive: suspectedMotive,
    pattern_match: patternMatch,
    confidence_level: confidenceLevel
  };
  
  // Determine severity
  let severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (confidenceLevel === "HIGH" && hasWarnings) {
    severity = "CRITICAL";
  } else if (confidenceLevel === "HIGH" || (hasMutableMetadata && hasWarnings)) {
    severity = "HIGH";
  } else if (hasWarnings || hasMutableMetadata) {
    severity = "MEDIUM";
  }
  
  const recommendedActions = [
    "Capture and preserve all screenshots with timestamps",
    "Export transaction history from block explorer",
    "Download and hash metadata JSON and image files",
    "File provenance dispute with marketplace (if listed)",
    "Contact collection owner/creator (if different from current owner)",
    "Consider legal consultation if funds/assets at significant risk"
  ];
  
  if (hasMutableMetadata) {
    recommendedActions.push("Monitor contract for setBaseURI/setTokenURI calls");
    recommendedActions.push("Check Etherscan for recent contract interactions");
  }
  
  if (hasApprovals) {
    recommendedActions.push("Review all approval transactions for marketplace addresses");
  }
  
  return {
    token_identifier: tokenIdentifier,
    analysis_timestamp: report.timestamp,
    XX_cut,
    YY_return,
    ZZ_depth,
    TT_timing,
    WW_intent,
    severity,
    recommended_actions: recommendedActions
  };
}

/**
 * Generate Watchtower CSV entries
 */
function generateWatchtowerEntries(report: ForensicReport): WatchtowerEntry[] {
  const entries: WatchtowerEntry[] = [];
  
  // Add transfer events
  for (const transfer of report.transferHistory.events) {
    entries.push({
      timestamp: new Date().toISOString(), // Would ideally fetch block timestamp
      event_type: "TRANSFER",
      contract: report.contract,
      token_id: report.tokenId,
      actor: transfer.from,
      artifact_hash: transfer.transactionHash,
      artifact_uri: `https://etherscan.io/tx/${transfer.transactionHash}`,
      block_number: transfer.blockNumber,
      tx_hash: transfer.transactionHash,
      notes: `Transfer from ${transfer.from} to ${transfer.to}`
    });
  }
  
  // Add approval events
  for (const approval of report.approvalHistory.events) {
    entries.push({
      timestamp: new Date().toISOString(),
      event_type: "APPROVAL",
      contract: report.contract,
      token_id: report.tokenId,
      actor: approval.owner,
      artifact_hash: approval.transactionHash,
      artifact_uri: `https://etherscan.io/tx/${approval.transactionHash}`,
      block_number: approval.blockNumber,
      tx_hash: approval.transactionHash,
      notes: `Approval granted to ${approval.approved}`
    });
  }
  
  // Add metadata hash entry
  if (report.metadata.metadataHash) {
    entries.push({
      timestamp: report.timestamp,
      event_type: "METADATA_SNAPSHOT",
      contract: report.contract,
      token_id: report.tokenId,
      actor: "FORENSIC_TOOL",
      artifact_hash: report.metadata.metadataHash,
      artifact_uri: report.metadata.tokenURI,
      notes: `Metadata JSON hash at time of analysis`
    });
  }
  
  // Add image hash entry
  if (report.metadata.imageHash) {
    entries.push({
      timestamp: report.timestamp,
      event_type: "IMAGE_SNAPSHOT",
      contract: report.contract,
      token_id: report.tokenId,
      actor: "FORENSIC_TOOL",
      artifact_hash: report.metadata.imageHash,
      artifact_uri: report.metadata.imageUri || "",
      notes: `Image file hash at time of analysis`
    });
  }
  
  return entries;
}

/**
 * Generate marketplace dispute template
 */
function generateMarketplaceDispute(
  marketplace: string,
  report: ForensicReport,
  patternLedger: PatternLedgerEntry,
  walletAddress: string
): string {
  const tokenIdentifier = `${report.contract}:${report.tokenId}`;
  
  const marketplaceTemplates: { [key: string]: string } = {
    opensea: `Subject: NFT Metadata Provenance Dispute - Token ${tokenIdentifier}

Dear OpenSea Support Team,

I am writing to report a critical metadata anomaly affecting an NFT in my wallet and request an investigation into potential unauthorized metadata changes.

AFFECTED TOKEN:
- Contract Address: ${report.contract}
- Token ID: ${report.tokenId}
- Network: ${report.network.name} (Chain ID: ${report.network.chainId})
- Current Owner: ${report.ownership.owner}
- My Wallet: ${walletAddress}

ISSUE DESCRIPTION:
The NFT is displaying incorrect or "whitewashed" metadata in the OpenSea interface, showing different artwork/attributes than expected based on the original collection.

EVIDENCE:
- Token URI: ${report.metadata.tokenURI}
- Metadata Hash (SHA256): ${report.metadata.metadataHash || "N/A"}
- Image Hash (SHA256): ${report.metadata.imageHash || "N/A"}
- Forensic Analysis Timestamp: ${report.timestamp}
- Pattern Analysis Severity: ${patternLedger.severity}

METADATA MUTABILITY ANALYSIS:
${report.mutability.hasSetBaseURI || report.mutability.hasSetTokenURI ? 
`⚠️ CRITICAL: Contract has MUTABLE metadata functions:
${report.mutability.hasSetBaseURI ? "- setBaseURI() detected\n" : ""}${report.mutability.hasSetTokenURI ? "- setTokenURI() detected\n" : ""}${report.mutability.contractOwner ? `- Contract Owner: ${report.mutability.contractOwner}\n` : ""}
This means the metadata can be changed by the contract owner at any time.` :
`✓ No obvious metadata mutability functions detected in contract bytecode.`}

TRANSFER HISTORY:
- Total Transfers: ${report.transferHistory.totalTransfers}
- Mint Block: ${report.transferHistory.events.find((e: any) => e.from === "0x0000000000000000000000000000000000000000")?.blockNumber || "Unknown"}
- Last Transfer: ${report.transferHistory.events.length > 0 ? report.transferHistory.events[report.transferHistory.events.length - 1].transactionHash : "None"}

WARNINGS DETECTED:
${report.warnings.length > 0 ? report.warnings.map(w => `- ${w}`).join("\n") : "None"}

SUSPECTED CAUSE (Pattern Analysis):
${patternLedger.WW_intent.suspected_motive}
Pattern Match: ${patternLedger.WW_intent.pattern_match}
Confidence: ${patternLedger.WW_intent.confidence_level}

REQUESTED ACTIONS:
1. Freeze any active listings for this token pending investigation
2. Investigate metadata cache override or proxy activity
3. Compare your cached metadata against current on-chain tokenURI
4. Verify if metadata has been changed since original mint
5. Provide metadata change history if available in your systems
6. Confirm if this is a known issue with this collection

ATTACHED EVIDENCE:
- Forensic analysis report (JSON)
- Watchtower audit trail (CSV)
- Pattern Ledger analysis
- Screenshots with SHA256 hashes (provided separately)

I request a response within 7 business days and preservation of all relevant evidence.

Thank you for your attention to this matter.

Wallet Address: ${walletAddress}
Date: ${new Date().toISOString().split("T")[0]}
Case Reference: FORENSIC-${Date.now()}
`,

    looksrare: `Subject: NFT Metadata Integrity Issue - ${tokenIdentifier}

LooksRare Support,

I am reporting a metadata integrity issue with an NFT in my collection.

TOKEN DETAILS:
Contract: ${report.contract}
Token ID: ${report.tokenId}
Network: ${report.network.name}
Owner: ${report.ownership.owner}

ISSUE:
NFT displays incorrect metadata/artwork compared to on-chain data.

EVIDENCE:
- Metadata Hash: ${report.metadata.metadataHash || "N/A"}
- Image Hash: ${report.metadata.imageHash || "N/A"}
- Severity: ${patternLedger.severity}
- Mutable Metadata: ${report.mutability.hasSetBaseURI || report.mutability.hasSetTokenURI ? "YES - CRITICAL" : "NO"}

${report.warnings.length > 0 ? `WARNINGS:\n${report.warnings.map(w => `- ${w}`).join("\n")}\n` : ""}

REQUESTED:
1. Investigate metadata cache vs on-chain data
2. Freeze any active listings
3. Provide metadata change history

Wallet: ${walletAddress}
Date: ${new Date().toISOString().split("T")[0]}
`,

    magiceden: `Subject: NFT Metadata Provenance Issue - ${tokenIdentifier}

Magic Eden Team,

I need to report a metadata provenance issue with an NFT in my wallet.

AFFECTED NFT:
- Contract: ${report.contract}
- Token ID: ${report.tokenId}
- Chain: ${report.network.name}

PROBLEM:
The NFT is showing different metadata/artwork than expected.

FORENSIC EVIDENCE:
- Current Owner: ${report.ownership.owner}
- Token URI: ${report.metadata.tokenURI}
- Metadata Hash: ${report.metadata.metadataHash || "Pending"}
- Analysis Severity: ${patternLedger.severity}

CONTRACT ANALYSIS:
- Mutable Metadata: ${report.mutability.hasSetBaseURI || report.mutability.hasSetTokenURI ? "YES ⚠️" : "NO ✓"}
${report.mutability.contractOwner ? `- Contract Owner: ${report.mutability.contractOwner}` : ""}

REQUESTED ACTIONS:
1. Review cached metadata against blockchain data
2. Suspend any active listings pending investigation
3. Provide explanation for metadata discrepancy

My Wallet: ${walletAddress}
Submitted: ${new Date().toISOString()}
`
  };
  
  return marketplaceTemplates[marketplace.toLowerCase()] || marketplaceTemplates.opensea;
}

/**
 * Generate Pulse Archive manifest
 */
function generatePulseManifest(
  reports: ForensicReport[],
  walletAddress: string,
  bundleDir: string
): PulseManifest {
  const artifacts: PulseManifest["artifacts"] = [];
  
  // Add forensic reports
  for (const report of reports) {
    artifacts.push({
      path: `forensic_${report.contract.substring(0, 10)}_${report.tokenId}.json`,
      hash: crypto.createHash("sha256").update(JSON.stringify(report)).digest("hex"),
      type: "FORENSIC_REPORT",
      description: `Forensic analysis for ${report.contract}:${report.tokenId}`
    });
  }
  
  // Add pattern ledger
  artifacts.push({
    path: "pattern_ledger.json",
    hash: "COMPUTED_AT_GENERATION",
    type: "PATTERN_LEDGER",
    description: "XX/YY/ZZ/TT/WW spiral analysis"
  });
  
  // Add watchtower CSV
  artifacts.push({
    path: "watchtower.csv",
    hash: "COMPUTED_AT_GENERATION",
    type: "WATCHTOWER_AUDIT",
    description: "Chronological audit trail of all events"
  });
  
  return {
    bundle_version: "EVOL.FORENSIC.v1",
    created_at: new Date().toISOString(),
    wallet_address: walletAddress,
    affected_tokens: reports.map(r => `${r.contract}:${r.tokenId}`),
    artifacts
  };
}

/**
 * Generate bundle README
 */
function generateReadme(
  reports: ForensicReport[],
  walletAddress: string,
  marketplace: string
): string {
  return `# NFT Forensic Evidence Bundle

**Generated:** ${new Date().toISOString()}
**Wallet Address:** ${walletAddress}
**Affected Tokens:** ${reports.length}

## Bundle Contents

### 1. Pattern Ledger (pattern_ledger.json)
XX/YY/ZZ/TT/WW spiral analysis of the metadata anomaly:
- **XX (Cut):** First visible anomaly - metadata mismatch, UI discrepancy
- **YY (Return):** Fund flows - approvals, transfers, marketplace activity
- **ZZ (Depth):** Off-chain artifacts - metadata hosting, mutability analysis
- **TT (Timing):** Timestamp correlation - mint, transfers, analysis time
- **WW (Intent):** Motive assessment - suspected cause and confidence level

### 2. Watchtower Audit Trail (watchtower.csv)
Chronological CSV of all events:
- Transfer events with block numbers and transaction hashes
- Approval events and marketplace approvals
- Metadata snapshot hashes
- Image snapshot hashes

### 3. Marketplace Dispute (dispute_${marketplace}.txt)
Pre-filled complaint ready to send to ${marketplace} support.

### 4. Pulse Archive Manifest (pulse_manifest.json)
Artifact inventory with hashes for IPFS/Arweave pinning.

### 5. ENFT Seal (enft_seal.json)
Metadata for minting an on-chain evidence preservation NFT.

## Usage Instructions

1. **Review** all files in this bundle for accuracy
2. **Compute hashes** for any screenshots or additional artifacts you have
3. **Pin to IPFS** using the pulse manifest (optional but recommended)
4. **Submit dispute** using the marketplace template
5. **Preserve** this bundle securely (multiple backups recommended)
6. **Monitor** the affected tokens for any changes

## Affected Tokens

${reports.map(r => `- **${r.contract}:${r.tokenId}**
  - Owner: ${r.ownership.owner}
  - Severity: ${r.warnings.length > 0 ? "⚠️ WARNINGS DETECTED" : "✓ No warnings"}
  - Mutable: ${r.mutability.hasSetBaseURI || r.mutability.hasSetTokenURI ? "⚠️ YES" : "✓ NO"}
  - Transfers: ${r.transferHistory.totalTransfers}
`).join("\n")}

## Next Steps

${reports.some(r => r.mutability.hasSetBaseURI || r.mutability.hasSetTokenURI) ? 
`⚠️ **CRITICAL:** One or more contracts have mutable metadata. Monitor for changes.\n` : ""}
${reports.some(r => r.warnings.length > 0) ?
`⚠️ **WARNINGS:** Review warnings in pattern ledger for each affected token.\n` : ""}

1. File marketplace dispute using the template
2. Contact collection owner/creator if applicable
3. Monitor contract for setBaseURI/setTokenURI calls
4. Consider legal consultation if significant value at risk
5. Export additional evidence from block explorer

## Evidence Preservation Checklist

- [ ] All screenshots captured with timestamps
- [ ] Device info recorded for screenshot provenance
- [ ] Transaction CSV exported from Etherscan/block explorer
- [ ] Metadata JSON downloaded and hashed
- [ ] Image files downloaded and hashed
- [ ] This bundle backed up to multiple locations
- [ ] IPFS/Arweave pins created (optional)
- [ ] Marketplace dispute filed
- [ ] Legal counsel consulted (if applicable)

---

Generated by MEGAZION Forensic Tools
© 2024 3V30OStudios
`;
}

/**
 * Generate ENFT Seal metadata
 */
function generateENFTSeal(
  reports: ForensicReport[],
  walletAddress: string,
  bundleDir: string
): any {
  return {
    name: `Forensic Evidence Bundle - ${reports.length} Token${reports.length > 1 ? "s" : ""}`,
    description: `On-chain preservation of forensic evidence for NFT metadata anomaly investigation. Bundle contains Pattern Ledger (XX/YY/ZZ/TT/WW analysis), Watchtower audit trail, and marketplace dispute documentation.`,
    image: "ipfs://REPLACE_WITH_SEAL_IMAGE_CID",
    attributes: [
      {
        trait_type: "Evidence Type",
        value: "NFT Forensic Bundle"
      },
      {
        trait_type: "Affected Tokens",
        value: reports.length
      },
      {
        trait_type: "Wallet Address",
        value: walletAddress
      },
      {
        trait_type: "Bundle Version",
        value: "EVOL.FORENSIC.v1"
      },
      {
        trait_type: "Created",
        value: new Date().toISOString()
      },
      {
        trait_type: "Severity",
        value: reports.some(r => r.warnings.length > 0) ? "CRITICAL" : "INFORMATIONAL"
      }
    ],
    external_url: "https://github.com/4way4eva/3V30OStudios",
    forensic_data: {
      affected_tokens: reports.map(r => ({
        contract: r.contract,
        token_id: r.tokenId,
        metadata_hash: r.metadata.metadataHash,
        image_hash: r.metadata.imageHash
      })),
      bundle_hash: "COMPUTED_AT_IPFS_PIN",
      bundle_uri: "IPFS_CID_AFTER_PIN"
    }
  };
}

/**
 * Export Watchtower CSV
 */
function exportWatchtowerCSV(entries: WatchtowerEntry[], outputPath: string): void {
  const header = "Timestamp,Event Type,Contract,Token ID,Actor,Artifact Hash,Artifact URI,Block Number,TX Hash,Notes\n";
  const rows = entries.map(e => 
    `${e.timestamp},${e.event_type},${e.contract},${e.token_id},${e.actor},${e.artifact_hash},${e.artifact_uri},${e.block_number || ""},${e.tx_hash || ""},"${e.notes}"`
  ).join("\n");
  
  fs.writeFileSync(outputPath, header + rows);
}

/**
 * Main execution
 */
async function main() {
  console.log("NFT Forensic Evidence Bundle Generator");
  console.log("=".repeat(60));
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 ? args[index + 1] : undefined;
  };
  
  const forensicFile = getArg("forensic");
  const forensicDir = getArg("forensic-dir");
  const walletAddress = getArg("wallet");
  const marketplace = getArg("marketplace") || "opensea";
  const pinIPFS = args.includes("--pin-ipfs");
  
  if (!walletAddress) {
    console.error("\n❌ Error: --wallet parameter is required");
    console.log("\nUsage:");
    console.log("  npx ts-node scripts/generate_forensic_bundle.ts --forensic report.json --wallet 0xAddress");
    console.log("  npx ts-node scripts/generate_forensic_bundle.ts --forensic-dir outputs/ --wallet 0xAddress");
    process.exit(1);
  }
  
  // Load forensic reports
  const reports: ForensicReport[] = [];
  
  if (forensicFile) {
    console.log(`Loading forensic report: ${forensicFile}`);
    const data = fs.readFileSync(forensicFile, "utf8");
    reports.push(JSON.parse(data));
  } else if (forensicDir) {
    console.log(`Loading forensic reports from: ${forensicDir}`);
    const files = fs.readdirSync(forensicDir).filter(f => f.startsWith("forensic_") && f.endsWith(".json"));
    for (const file of files) {
      const data = fs.readFileSync(path.join(forensicDir, file), "utf8");
      reports.push(JSON.parse(data));
    }
  } else {
    console.error("\n❌ Error: Either --forensic or --forensic-dir must be provided");
    process.exit(1);
  }
  
  if (reports.length === 0) {
    console.error("\n❌ Error: No forensic reports found");
    process.exit(1);
  }
  
  console.log(`✓ Loaded ${reports.length} forensic report(s)`);
  
  // Create bundle directory
  const timestamp = Date.now();
  const bundleDir = path.join(process.cwd(), "outputs", `evidence_bundle_${timestamp}`);
  fs.mkdirSync(bundleDir, { recursive: true });
  console.log(`✓ Created bundle directory: ${bundleDir}`);
  
  // Generate Pattern Ledger entries
  console.log("\nGenerating Pattern Ledger...");
  const patternLedgers = reports.map(r => generatePatternLedger(r, walletAddress));
  const patternLedgerPath = path.join(bundleDir, "pattern_ledger.json");
  fs.writeFileSync(patternLedgerPath, JSON.stringify(patternLedgers, null, 2));
  console.log(`✓ Pattern Ledger: ${patternLedgerPath}`);
  
  // Generate Watchtower CSV
  console.log("Generating Watchtower audit trail...");
  const allWatchtowerEntries: WatchtowerEntry[] = [];
  for (const report of reports) {
    allWatchtowerEntries.push(...generateWatchtowerEntries(report));
  }
  const watchtowerPath = path.join(bundleDir, "watchtower.csv");
  exportWatchtowerCSV(allWatchtowerEntries, watchtowerPath);
  console.log(`✓ Watchtower CSV: ${watchtowerPath}`);
  
  // Generate marketplace disputes
  console.log("Generating marketplace dispute templates...");
  const marketplaces = ["opensea", "looksrare", "magiceden"];
  for (const mp of marketplaces) {
    const dispute = generateMarketplaceDispute(mp, reports[0], patternLedgers[0], walletAddress);
    const disputePath = path.join(bundleDir, `dispute_${mp}.txt`);
    fs.writeFileSync(disputePath, dispute);
    console.log(`✓ ${mp} dispute: ${disputePath}`);
  }
  
  // Generate Pulse manifest
  console.log("Generating Pulse Archive manifest...");
  const pulseManifest = generatePulseManifest(reports, walletAddress, bundleDir);
  const pulsePath = path.join(bundleDir, "pulse_manifest.json");
  fs.writeFileSync(pulsePath, JSON.stringify(pulseManifest, null, 2));
  console.log(`✓ Pulse manifest: ${pulsePath}`);
  
  // Generate ENFT Seal
  console.log("Generating ENFT Seal metadata...");
  const enftSeal = generateENFTSeal(reports, walletAddress, bundleDir);
  const sealPath = path.join(bundleDir, "enft_seal.json");
  fs.writeFileSync(sealPath, JSON.stringify(enftSeal, null, 2));
  console.log(`✓ ENFT Seal: ${sealPath}`);
  
  // Generate README
  console.log("Generating bundle README...");
  const readme = generateReadme(reports, walletAddress, marketplace);
  const readmePath = path.join(bundleDir, "README.md");
  fs.writeFileSync(readmePath, readme);
  console.log(`✓ README: ${readmePath}`);
  
  // Copy original forensic reports
  console.log("Copying forensic reports...");
  for (const report of reports) {
    const filename = `forensic_${report.contract.substring(0, 10)}_${report.tokenId}.json`;
    const reportPath = path.join(bundleDir, filename);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }
  console.log(`✓ Copied ${reports.length} forensic report(s)`);
  
  // IPFS pinning (if requested)
  if (pinIPFS) {
    console.log("\n⚠️  IPFS pinning requested but not implemented in this version");
    console.log("To pin manually:");
    console.log(`  1. Install IPFS CLI or use Pinata/NFT.Storage`);
    console.log(`  2. Pin the bundle directory: ${bundleDir}`);
    console.log(`  3. Update pulse_manifest.json with CIDs`);
  }
  
  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("EVIDENCE BUNDLE GENERATED");
  console.log("=".repeat(60));
  console.log(`Location: ${bundleDir}`);
  console.log(`Affected Tokens: ${reports.length}`);
  console.log(`Watchtower Entries: ${allWatchtowerEntries.length}`);
  console.log(`\nBundle Contents:`);
  console.log(`  - Pattern Ledger (XX/YY/ZZ/TT/WW analysis)`);
  console.log(`  - Watchtower CSV (audit trail)`);
  console.log(`  - Marketplace disputes (${marketplaces.join(", ")})`);
  console.log(`  - Pulse Archive manifest`);
  console.log(`  - ENFT Seal metadata`);
  console.log(`  - README with instructions`);
  console.log(`  - Original forensic reports`);
  
  console.log(`\nNext Steps:`);
  console.log(`  1. Review all files in the bundle for accuracy`);
  console.log(`  2. Add any screenshots or additional evidence to the bundle directory`);
  console.log(`  3. File marketplace dispute using dispute_${marketplace}.txt`);
  console.log(`  4. Backup the bundle to multiple secure locations`);
  console.log(`  5. Consider pinning to IPFS/Arweave for permanent preservation`);
  
  if (patternLedgers.some(p => p.severity === "CRITICAL" || p.severity === "HIGH")) {
    console.log(`\n⚠️  CRITICAL/HIGH SEVERITY FINDINGS DETECTED`);
    console.log(`Review pattern_ledger.json and consider legal consultation`);
  }
  
  console.log("\n" + "=".repeat(60));
}

// Execute
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
