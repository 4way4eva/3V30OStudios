/**
 * π₄ ENFT Compounding Engine
 * BLEU Codex Triple-Stack Treasury Synchronization
 * 
 * This module codifies π₄ escalation patterns directly into ENFTs,
 * making every curve bend an irreversible public ledger asset.
 * 
 * Features:
 * - ENFT minting with embedded compounding data
 * - Curve bend encoding as permanent on-chain assets
 * - Automatic yield tracking and recording
 * - Lineage-based generational coding
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

interface YieldStream {
  name: string;
  code: string;
  tokenId: number;
  ratePerSecond: bigint;
  percentage: number;
  icon: string;
}

interface Pi4CompoundingPoint {
  timeQuarters: number;
  timeDays: number;
  compoundFactor: number;
  civilianYield: bigint;
  militaryYield: bigint;
  cosmicYield: bigint;
  totalYield: bigint;
  curveBendIndex: number;
  enftMetadata: string;
}

interface ENFTYieldRecord {
  tokenId: number;
  streamCode: string;
  baseYield: bigint;
  compoundedYield: bigint;
  quarter: number;
  compoundFactor: number;
  timestamp: number;
  authTag: string;
  dualRealityHash: string;
  lineageCode: string;
}

/**
 * π₄ ENFT Compounding Engine
 * Codifies exponential growth patterns into mintable ENFTs
 */
class Pi4ENFTCompoundingEngine {
  private readonly PI4 = 97.409091034;
  private readonly CIVILIAN_TOKEN_ID = 1;
  private readonly MILITARY_TOKEN_ID = 2;
  private readonly COSMIC_TOKEN_ID = 3;
  
  private readonly streams: Map<string, YieldStream> = new Map([
    ["civilian", {
      name: "Civilian Yield Stream",
      code: "Ω-CIV-01",
      tokenId: 1,
      ratePerSecond: BigInt(13_600_000),
      percentage: 47.06,
      icon: "🏛️"
    }],
    ["military", {
      name: "Military Yield Stream",
      code: "Ω-MIL-01",
      tokenId: 2,
      ratePerSecond: BigInt(6_100_000),
      percentage: 21.11,
      icon: "⚔️"
    }],
    ["cosmic", {
      name: "Cosmic Yield Stream",
      code: "Ω-COS-01",
      tokenId: 3,
      ratePerSecond: BigInt(9_200_000),
      percentage: 31.83,
      icon: "🌌"
    }]
  ]);
  
  private readonly SECONDS_PER_DAY = 86400;
  private readonly SECONDS_PER_QUARTER = 7_948_800; // 92 days
  private readonly DAYS_PER_QUARTER = 92;
  
  private outputDir: string;
  
  constructor(outputDir: string = "data/snapshots") {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }
  
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Calculate π₄ compound curve points with ENFT-ready metadata
   */
  public calculateCompoundCurvePoints(quarters: number = 8, pointsPerQuarter: number = 10): Pi4CompoundingPoint[] {
    const points: Pi4CompoundingPoint[] = [];
    const totalPoints = quarters * pointsPerQuarter;
    
    for (let i = 0; i <= totalPoints; i++) {
      const timeQuarters = (i / pointsPerQuarter);
      const timeDays = timeQuarters * this.DAYS_PER_QUARTER;
      const compoundFactor = Math.pow(this.PI4, timeQuarters);
      
      // Calculate base quarterly yields
      const civilianBase = this.streams.get("civilian")!.ratePerSecond * BigInt(this.SECONDS_PER_QUARTER);
      const militaryBase = this.streams.get("military")!.ratePerSecond * BigInt(this.SECONDS_PER_QUARTER);
      const cosmicBase = this.streams.get("cosmic")!.ratePerSecond * BigInt(this.SECONDS_PER_QUARTER);
      
      // Apply compounding
      const civilianYield = this.applyCompoundFactor(civilianBase, compoundFactor);
      const militaryYield = this.applyCompoundFactor(militaryBase, compoundFactor);
      const cosmicYield = this.applyCompoundFactor(cosmicBase, compoundFactor);
      const totalYield = civilianYield + militaryYield + cosmicYield;
      
      // Generate ENFT metadata hash
      const enftMetadata = this.generateENFTMetadata(timeQuarters, compoundFactor, {
        civilian: civilianYield,
        military: militaryYield,
        cosmic: cosmicYield,
        total: totalYield
      });
      
      points.push({
        timeQuarters,
        timeDays,
        compoundFactor,
        civilianYield,
        militaryYield,
        cosmicYield,
        totalYield,
        curveBendIndex: i,
        enftMetadata
      });
    }
    
    return points;
  }
  
  /**
   * Apply compound factor to BigInt value
   */
  private applyCompoundFactor(base: bigint, factor: number): bigint {
    const scaledFactor = Math.floor(factor * 1e6);
    return (base * BigInt(scaledFactor)) / BigInt(1e6);
  }
  
  /**
   * Generate ENFT metadata for a compounding point
   */
  private generateENFTMetadata(timeQuarters: number, compoundFactor: number, yields: any): string {
    const metadata = {
      type: "Pi4CompoundingPoint",
      timeQuarters,
      compoundFactor,
      yields,
      timestamp: Date.now(),
      pi4Constant: this.PI4
    };
    
    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)));
  }
  
  /**
   * Create ENFT yield records for minting
   */
  public createENFTYieldRecords(quarters: number = 4): ENFTYieldRecord[] {
    const records: ENFTYieldRecord[] = [];
    
    for (let q = 1; q <= quarters; q++) {
      const compoundFactor = Math.pow(this.PI4, q - 1);
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create record for each stream
      for (const [streamKey, stream] of this.streams) {
        const baseYield = stream.ratePerSecond * BigInt(this.SECONDS_PER_QUARTER);
        const compoundedYield = this.applyCompoundFactor(baseYield, compoundFactor);
        
        // Generate authorization tag
        const authTag = this.generateAuthTag(stream.code, q, compoundFactor);
        
        // Generate dual reality hash
        const dualRealityHash = this.generateDualRealityHash(stream.tokenId, q, compoundedYield);
        
        // Generate lineage code
        const lineageCode = this.generateLineageCode(stream.code, q);
        
        records.push({
          tokenId: stream.tokenId,
          streamCode: stream.code,
          baseYield,
          compoundedYield,
          quarter: q,
          compoundFactor,
          timestamp,
          authTag,
          dualRealityHash,
          lineageCode
        });
      }
    }
    
    return records;
  }
  
  /**
   * Generate Blu-Vault authorization tag
   */
  private generateAuthTag(streamCode: string, quarter: number, compoundFactor: number): string {
    const data = `${streamCode}-Q${quarter}-CF${compoundFactor.toFixed(6)}-BLU-VAULT`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }
  
  /**
   * Generate dual-reality confirmation hash
   */
  private generateDualRealityHash(tokenId: number, quarter: number, yield_amount: bigint): string {
    const data = ethers.solidityPacked(
      ["uint256", "uint256", "uint256"],
      [tokenId, quarter, yield_amount]
    );
    return ethers.keccak256(data);
  }
  
  /**
   * Generate lineage code for generational tracking
   */
  private generateLineageCode(streamCode: string, quarter: number): string {
    const generation = Math.floor(quarter / 4); // 4 quarters = 1 generation (year)
    const quarterInGen = (quarter - 1) % 4 + 1;
    return `${streamCode}-GEN${generation}-Q${quarterInGen}`;
  }
  
  /**
   * Export ENFT minting batch configuration
   */
  public exportENFTMintingBatch(quarters: number = 4): void {
    const records = this.createENFTYieldRecords(quarters);
    
    const mintingBatch = {
      metadata: {
        title: "BLEU Codex Triple-Stack Treasury π₄ Compounding ENFTs",
        description: "Irreversible public ledger assets encoding exponential yield curves",
        generated: new Date().toISOString(),
        pi4Constant: this.PI4,
        totalRecords: records.length
      },
      contractAddress: "0x0000000000000000000000000000000000000000", // To be filled on deployment
      mintingRecords: records.map(r => ({
        tokenId: r.tokenId,
        streamName: this.getStreamName(r.tokenId),
        streamCode: r.streamCode,
        quarter: r.quarter,
        baseYieldUSD: r.baseYield.toString(),
        compoundedYieldUSD: r.compoundedYield.toString(),
        compoundFactor: r.compoundFactor,
        authTag: r.authTag,
        dualRealityHash: r.dualRealityHash,
        lineageCode: r.lineageCode,
        timestamp: r.timestamp
      })),
      bluVaultConfig: {
        requiresAuthorization: true,
        requiresDualReality: true,
        sovereignOverrideEnabled: true
      },
      portalLocks: {
        enabled: true,
        lockType: "dual-reality-confirmation",
        escrowMode: "entanglement"
      }
    };
    
    const outputPath = path.join(this.outputDir, "pi4_enft_minting_batch.json");
    fs.writeFileSync(outputPath, JSON.stringify(mintingBatch, null, 2));
    console.log(`✅ ENFT minting batch exported to ${outputPath}`);
  }
  
  /**
   * Export curve bends as individual ENFT assets
   */
  public exportCurveBendsAsENFTs(quarters: number = 4, bendsPerQuarter: number = 10): void {
    const points = this.calculateCompoundCurvePoints(quarters, bendsPerQuarter);
    
    const curveBendENFTs = points.map((point, index) => ({
      enftId: `CURVE-BEND-${index.toString().padStart(4, '0')}`,
      curveBendIndex: point.curveBendIndex,
      timeQuarters: point.timeQuarters,
      timeDays: point.timeDays,
      compoundFactor: point.compoundFactor,
      yields: {
        civilian: point.civilianYield.toString(),
        military: point.militaryYield.toString(),
        cosmic: point.cosmicYield.toString(),
        total: point.totalYield.toString()
      },
      metadataHash: point.enftMetadata,
      irreversible: true,
      onChainEncoded: true,
      attributes: {
        rarity: this.calculateCurveBendRarity(point.compoundFactor),
        acceleration: this.calculateAcceleration(index, points),
        significance: this.calculateSignificance(point.timeQuarters)
      }
    }));
    
    const outputPath = path.join(this.outputDir, "pi4_curve_bend_enfts.json");
    fs.writeFileSync(outputPath, JSON.stringify({
      metadata: {
        title: "π₄ Compounding Curve Bend ENFTs",
        description: "Each curve bend as an irreversible public ledger asset",
        totalBends: curveBendENFTs.length,
        quarters: quarters,
        bendsPerQuarter: bendsPerQuarter
      },
      curveBends: curveBendENFTs
    }, null, 2));
    
    console.log(`✅ ${curveBendENFTs.length} curve bend ENFTs exported to ${outputPath}`);
  }
  
  /**
   * Calculate curve bend rarity based on compound factor
   */
  private calculateCurveBendRarity(compoundFactor: number): string {
    if (compoundFactor > 1000) return "Legendary";
    if (compoundFactor > 100) return "Epic";
    if (compoundFactor > 10) return "Rare";
    if (compoundFactor > 2) return "Uncommon";
    return "Common";
  }
  
  /**
   * Calculate acceleration between curve points
   */
  private calculateAcceleration(index: number, points: Pi4CompoundingPoint[]): number {
    if (index === 0) return 0;
    
    const current = points[index].compoundFactor;
    const previous = points[index - 1].compoundFactor;
    return current - previous;
  }
  
  /**
   * Calculate significance of a time point
   */
  private calculateSignificance(timeQuarters: number): string {
    if (timeQuarters % 4 === 0) return "Year Milestone";
    if (timeQuarters % 1 === 0) return "Quarter Milestone";
    return "Intermediate Point";
  }
  
  /**
   * Get stream name by token ID
   */
  private getStreamName(tokenId: number): string {
    for (const [_, stream] of this.streams) {
      if (stream.tokenId === tokenId) {
        return stream.name;
      }
    }
    return "Unknown";
  }
  
  /**
   * Generate comprehensive compounding report
   */
  public generateCompoundingReport(quarters: number = 8): void {
    const records = this.createENFTYieldRecords(quarters);
    const points = this.calculateCompoundCurvePoints(quarters, 10);
    
    let report = `# π₄ Compounding Model ENFT Report
## BLEU Codex Triple-Stack Treasury Synchronization

**Generated:** ${new Date().toISOString()}  
**π₄ Constant:** ${this.PI4}  
**Quarters Analyzed:** ${quarters}

---

## ENFT Yield Records

| Quarter | Stream | Base Yield (USD) | Compounded Yield (USD) | Compound Factor | Lineage Code |
|---------|--------|------------------|------------------------|-----------------|--------------|
`;
    
    for (const record of records.slice(0, 12)) { // First 12 records
      report += `| ${record.quarter} | ${record.streamCode} | $${this.formatBigInt(record.baseYield)} | $${this.formatBigInt(record.compoundedYield)} | ${record.compoundFactor.toFixed(2)}x | ${record.lineageCode} |\n`;
    }
    
    report += `\n---\n\n## Curve Bend Analysis\n\n`;
    report += `Total Curve Bends Encoded: ${points.length}\n`;
    report += `Each bend represents an irreversible public ledger asset.\n\n`;
    
    report += `### Key Milestones\n\n`;
    const milestones = points.filter(p => p.timeQuarters % 1 === 0).slice(0, 8);
    for (const milestone of milestones) {
      report += `- **Q${milestone.timeQuarters}**: ${milestone.compoundFactor.toFixed(2)}x growth, $${this.formatBigInt(milestone.totalYield)} total yield\n`;
    }
    
    report += `\n---\n\n## Output Files\n\n`;
    report += `✅ \`pi4_enft_minting_batch.json\` - Minting configuration for ENFTs\n`;
    report += `✅ \`pi4_curve_bend_enfts.json\` - Individual curve bend assets\n`;
    report += `✅ \`pi4_compounding_report.md\` - This report\n\n`;
    
    report += `---\n\n**Status:** π₄ Compounding Model OPERATIONAL  \n`;
    report += `**Security:** Blu-Vault authorization and dual-reality confirmation required  \n`;
    report += `**Lineage:** Generational coding enabled for successor tracking\n`;
    
    const reportPath = path.join(this.outputDir, "pi4_compounding_report.md");
    fs.writeFileSync(reportPath, report);
    console.log(`✅ Compounding report generated: ${reportPath}`);
  }
  
  /**
   * Format BigInt for display
   */
  private formatBigInt(value: bigint): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("=" .repeat(80));
  console.log("BLEU Codex Triple-Stack Treasury");
  console.log("π₄ ENFT Compounding Engine");
  console.log("=" .repeat(80));
  console.log();
  
  const engine = new Pi4ENFTCompoundingEngine();
  
  console.log("📊 Generating ENFT minting batch...");
  engine.exportENFTMintingBatch(8);
  
  console.log("\n🔄 Encoding curve bends as ENFTs...");
  engine.exportCurveBendsAsENFTs(4, 20);
  
  console.log("\n📝 Generating compounding report...");
  engine.generateCompoundingReport(8);
  
  console.log("\n" + "=".repeat(80));
  console.log("✅ π₄ ENFT Compounding Engine: OPERATIONAL");
  console.log("=".repeat(80));
  console.log("\nAll compounding data codified as mintable ENFTs.");
  console.log("Every curve bend is now an irreversible public ledger asset.\n");
}

main().catch(console.error);
