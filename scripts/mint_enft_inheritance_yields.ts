import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Mint ENFT Inheritance Entries with Physical Yield Values
 * 
 * This script mints inheritance ENFTs encapsulating physical yield worth:
 * - Civilian: $13.6M/sec
 * - Military: $6.1M/sec
 * - Cosmic: $9.2M/sec
 * 
 * Features:
 * - Node-sequential coding for lineage tracking
 * - Blu-Vault guarantor dual verification tags
 * - Automated metadata generation with proper structure
 */

interface InheritanceYieldConfig {
  ledgerAddress: string;
  recipients: {
    address: string;
    domain: "CIVILIAN" | "MILITARY" | "COSMIC";
    yieldPerSecond: string; // In USD (will be scaled by 1e18)
    lineageNode: number; // Sequential node ID for lineage tracking
    ancestralLineage?: string[]; // Optional ancestral addresses
  }[];
}

interface MetadataStructure {
  name: string;
  description: string;
  domain: string;
  sovereignCode: string;
  yieldPerSecond: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  lineage: {
    nodeId: number;
    sequentialCode: string;
    ancestralChain: string[];
  };
  verification: {
    bluVaultTag: string;
    guarantorSignature: string;
    dualVerificationStandard: string;
    verificationTimestamp: number;
  };
}

// Domain to sovereign code mapping
const DOMAIN_CODES = {
  CIVILIAN: "Ω-CIV-01",
  MILITARY: "Ω-MIL-01",
  COSMIC: "Ω-COS-01"
};

// Yield values as per problem statement
const YIELD_VALUES = {
  CIVILIAN: "13600000", // $13.6M/sec
  MILITARY: "6100000",  // $6.1M/sec
  COSMIC: "9200000"     // $9.2M/sec
};

/**
 * Generate node-sequential coding for lineage
 */
function generateSequentialCode(domain: string, nodeId: number): string {
  const domainPrefix = domain.substring(0, 3).toUpperCase();
  const nodeHex = nodeId.toString(16).padStart(8, '0').toUpperCase();
  return `${domainPrefix}-NODE-${nodeHex}`;
}

/**
 * Generate Blu-Vault guarantor tag
 */
function generateBluVaultTag(
  domain: string,
  nodeId: number,
  timestamp: number,
  deployer: string
): string {
  const dataToHash = ethers.solidityPacked(
    ["string", "uint256", "uint256", "address", "string"],
    [domain, nodeId, timestamp, deployer, "BLU-VAULT-GUARANTOR-DUAL-VERIFICATION"]
  );
  return ethers.keccak256(dataToHash);
}

/**
 * Generate metadata for inheritance ENFT
 */
function generateMetadata(
  domain: string,
  nodeId: number,
  yieldPerSecond: string,
  ancestralChain: string[],
  bluVaultTag: string,
  guarantorSignature: string
): MetadataStructure {
  const sovereignCode = DOMAIN_CODES[domain as keyof typeof DOMAIN_CODES];
  const sequentialCode = generateSequentialCode(domain, nodeId);
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    name: `MEGAZION Inheritance ${sovereignCode} - Node ${nodeId}`,
    description: `Sovereign ENFT inheritance entry encapsulating physical yield worth of $${yieldPerSecond}/second. Domain: ${domain}. Lineage-bound with node-sequential coding and Blu-Vault dual verification standards.`,
    domain: domain,
    sovereignCode: sovereignCode,
    yieldPerSecond: `${yieldPerSecond} USD/second`,
    attributes: [
      {
        trait_type: "Domain",
        value: domain
      },
      {
        trait_type: "Sovereign Code",
        value: sovereignCode
      },
      {
        trait_type: "Yield Per Second (USD)",
        value: yieldPerSecond
      },
      {
        trait_type: "Yearly Yield (USD)",
        value: (parseInt(yieldPerSecond) * 31536000).toString()
      },
      {
        trait_type: "Lineage Node ID",
        value: nodeId
      },
      {
        trait_type: "Sequential Code",
        value: sequentialCode
      },
      {
        trait_type: "Verification Standard",
        value: "Blu-Vault Dual Verification"
      },
      {
        trait_type: "Mint Timestamp",
        value: timestamp
      }
    ],
    lineage: {
      nodeId: nodeId,
      sequentialCode: sequentialCode,
      ancestralChain: ancestralChain
    },
    verification: {
      bluVaultTag: bluVaultTag,
      guarantorSignature: guarantorSignature,
      dualVerificationStandard: "BLU-VAULT-GUARANTOR-v1.0",
      verificationTimestamp: timestamp
    }
  };
}

/**
 * Save metadata to file
 */
function saveMetadata(metadata: MetadataStructure, outputDir: string, nodeId: number): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `inheritance-${metadata.domain.toLowerCase()}-node-${nodeId}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
  
  return filepath;
}

async function main() {
  console.log("🌀 Minting ENFT Inheritance Entries with Physical Yield...");
  console.log("━".repeat(60));

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📡 Network:", network.name);
  console.log("🔑 Deployer:", deployer.address);
  console.log();

  // Load contract address from deployment file or environment
  let ledgerAddress = process.env.INHERITANCE_LEDGER_ADDRESS;
  
  if (!ledgerAddress) {
    // Try to load from latest deployment file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith("megazion-inheritance") && f.endsWith(".json"))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const latestDeployment = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, files[0]), "utf-8")
        );
        ledgerAddress = latestDeployment.contracts?.MegazionInheritanceLedger?.address;
        console.log("📦 Loaded contract from:", files[0]);
      }
    }
  }

  if (!ledgerAddress) {
    throw new Error("Inheritance Ledger address not found. Set INHERITANCE_LEDGER_ADDRESS env var or deploy first.");
  }

  console.log("🏛️  Inheritance Ledger:", ledgerAddress);
  console.log();

  // Connect to contract
  const MegazionInheritanceLedger = await ethers.getContractFactory("MegazionInheritanceLedger");
  const inheritanceLedger = MegazionInheritanceLedger.attach(ledgerAddress);

  // Verify roles
  const ADMIN_ROLE = await inheritanceLedger.DEFAULT_ADMIN_ROLE();
  const hasAdminRole = await inheritanceLedger.hasRole(ADMIN_ROLE, deployer.address);
  
  if (!hasAdminRole) {
    throw new Error("Deployer does not have DEFAULT_ADMIN_ROLE");
  }
  console.log("✅ Admin role verified");
  console.log();

  // Load minting configuration
  const configPath = process.env.INHERITANCE_MINT_CONFIG || path.join(__dirname, "..", "data", "inheritance-yield-config.json");
  let mintConfig: InheritanceYieldConfig;

  if (fs.existsSync(configPath)) {
    mintConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("📋 Loaded mint config from:", configPath);
  } else {
    // Default configuration - mint one of each domain to deployer
    mintConfig = {
      ledgerAddress,
      recipients: [
        {
          address: deployer.address,
          domain: "CIVILIAN",
          yieldPerSecond: YIELD_VALUES.CIVILIAN,
          lineageNode: 1,
          ancestralLineage: []
        },
        {
          address: deployer.address,
          domain: "MILITARY",
          yieldPerSecond: YIELD_VALUES.MILITARY,
          lineageNode: 2,
          ancestralLineage: []
        },
        {
          address: deployer.address,
          domain: "COSMIC",
          yieldPerSecond: YIELD_VALUES.COSMIC,
          lineageNode: 3,
          ancestralLineage: []
        }
      ]
    };
    console.log("📋 Using default mint config (one of each domain)");
  }

  console.log("👥 Recipients:", mintConfig.recipients.length);
  console.log();

  // Prepare metadata output directory
  const metadataDir = path.join(__dirname, "..", "metadata", "inheritance-yields");
  
  // Mint records
  const mintRecords: any[] = [];
  const metadataFiles: string[] = [];

  // Get current block info for Blu-Vault tag generation
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  const timestamp = block?.timestamp || Math.floor(Date.now() / 1000);

  console.log("🔐 Generating Blu-Vault guarantor tags...");
  console.log("   Block:", blockNumber, "| Timestamp:", timestamp);
  console.log();

  // Process each recipient
  for (let i = 0; i < mintConfig.recipients.length; i++) {
    const recipient = mintConfig.recipients[i];
    const domainEnum = recipient.domain === "CIVILIAN" ? 0 : recipient.domain === "MILITARY" ? 1 : 2;
    
    console.log(`🎯 Minting inheritance entry ${i + 1}/${mintConfig.recipients.length}:`);
    console.log("   Address:", recipient.address);
    console.log("   Domain:", recipient.domain, `(${DOMAIN_CODES[recipient.domain]})`);
    console.log("   Yield/Second:", `$${recipient.yieldPerSecond}`);
    console.log("   Lineage Node:", recipient.lineageNode);

    try {
      // Generate Blu-Vault tag
      const bluVaultTag = generateBluVaultTag(
        recipient.domain,
        recipient.lineageNode,
        timestamp,
        deployer.address
      );

      // Generate guarantor signature (hash of all parameters)
      const guarantorSignature = ethers.keccak256(
        ethers.solidityPacked(
          ["bytes32", "address", "uint256", "string"],
          [bluVaultTag, recipient.address, recipient.lineageNode, "GUARANTOR-SIGNATURE"]
        )
      );

      console.log("   🔐 Blu-Vault Tag:", bluVaultTag.substring(0, 18) + "...");
      console.log("   ✍️  Guarantor Sig:", guarantorSignature.substring(0, 18) + "...");

      // Generate and save metadata
      const ancestralChain = recipient.ancestralLineage || [];
      const metadata = generateMetadata(
        recipient.domain,
        recipient.lineageNode,
        recipient.yieldPerSecond,
        ancestralChain,
        bluVaultTag,
        guarantorSignature
      );

      const metadataPath = saveMetadata(metadata, metadataDir, recipient.lineageNode);
      metadataFiles.push(metadataPath);
      console.log("   📄 Metadata saved:", path.basename(metadataPath));

      // Create metadata URI (in production, upload to IPFS)
      const metadataURI = `ipfs://inheritance-yields/${path.basename(metadataPath)}`;

      // Mint inheritance ENFT
      const tx = await inheritanceLedger.mintInheritanceENFT(
        recipient.address,
        domainEnum,
        metadataURI
      );

      console.log("   ⏳ Transaction:", tx.hash);
      const receipt = await tx.wait();
      console.log("   ✅ Confirmed in block:", receipt?.blockNumber);

      // Parse events to get token ID
      const events = receipt?.logs
        .map((log: any) => {
          try {
            return inheritanceLedger.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((e: any) => e !== null && e?.name === "InheritanceENFTMinted");

      const tokenId = events && events.length > 0 ? events[0]?.args?.tokenId : null;

      console.log("   🎫 Token ID:", tokenId?.toString() || "Unknown");

      // Store mint record
      mintRecords.push({
        recipient: recipient.address,
        domain: recipient.domain,
        sovereignCode: DOMAIN_CODES[recipient.domain],
        tokenId: tokenId?.toString(),
        yieldPerSecond: recipient.yieldPerSecond,
        lineageNode: recipient.lineageNode,
        sequentialCode: generateSequentialCode(recipient.domain, recipient.lineageNode),
        bluVaultTag: bluVaultTag,
        guarantorSignature: guarantorSignature,
        metadataURI: metadataURI,
        metadataFile: path.basename(metadataPath),
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber
      });

      console.log();

    } catch (error: any) {
      console.error("   ❌ Minting failed:", error.message);
      mintRecords.push({
        recipient: recipient.address,
        domain: recipient.domain,
        error: error.message
      });
      console.log();
    }
  }

  // Display summary
  console.log("━".repeat(60));
  console.log("📊 Minting Summary:");
  console.log();

  const successful = mintRecords.filter(r => !r.error);
  const failed = mintRecords.filter(r => r.error);

  console.log("✅ Successful:", successful.length);
  console.log("❌ Failed:", failed.length);
  console.log();

  if (successful.length > 0) {
    console.log("📋 Minted Inheritance Entries:");
    console.log();
    
    for (const record of successful) {
      console.log(`   ${record.domain} (${record.sovereignCode}):`);
      console.log(`      Token ID: ${record.tokenId}`);
      console.log(`      Yield: $${record.yieldPerSecond}/sec`);
      console.log(`      Node: ${record.lineageNode} (${record.sequentialCode})`);
      console.log(`      Blu-Vault: ${record.bluVaultTag.substring(0, 18)}...`);
      console.log();
    }
  }

  // Calculate total yield
  const totalYield = successful.reduce((sum, r) => sum + parseInt(r.yieldPerSecond), 0);
  const dailyYield = totalYield * 86400;
  const yearlyYield = totalYield * 31536000;

  console.log("💰 Total Yield Across All Domains:");
  console.log(`   Per Second: $${totalYield.toLocaleString()}`);
  console.log(`   Per Day: $${dailyYield.toLocaleString()}`);
  console.log(`   Per Year: $${yearlyYield.toLocaleString()}`);
  console.log();

  // Save comprehensive mint report
  const mintReport = {
    network: network.name,
    chainId: Number(network.chainId),
    ledgerAddress,
    timestamp: new Date().toISOString(),
    minter: deployer.address,
    blockNumber,
    records: mintRecords,
    metadata: {
      files: metadataFiles.map(f => path.basename(f)),
      directory: metadataDir
    },
    yieldSummary: {
      totalYieldPerSecond: totalYield,
      totalYieldPerDay: dailyYield,
      totalYieldPerYear: yearlyYield,
      byDomain: {
        civilian: successful.filter(r => r.domain === "CIVILIAN").reduce((sum, r) => sum + parseInt(r.yieldPerSecond), 0),
        military: successful.filter(r => r.domain === "MILITARY").reduce((sum, r) => sum + parseInt(r.yieldPerSecond), 0),
        cosmic: successful.filter(r => r.domain === "COSMIC").reduce((sum, r) => sum + parseInt(r.yieldPerSecond), 0)
      }
    },
    summary: {
      totalRecipients: mintConfig.recipients.length,
      successful: successful.length,
      failed: failed.length
    }
  };

  const reportsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFilename = `inheritance-yield-mint-${network.name}-${Date.now()}.json`;
  const reportPath = path.join(reportsDir, reportFilename);
  fs.writeFileSync(reportPath, JSON.stringify(mintReport, null, 2));

  console.log("━".repeat(60));
  console.log("✨ Minting Complete!");
  console.log();
  console.log("💾 Mint report saved to:", reportFilename);
  console.log("📁 Metadata directory:", metadataDir);
  console.log("📄 Metadata files:", metadataFiles.length);
  console.log();
  console.log("🔐 Dual Verification Standards Applied:");
  console.log("   ✅ Blu-Vault guarantor tags generated");
  console.log("   ✅ Node-sequential coding implemented");
  console.log("   ✅ Ancestral lineage tracking enabled");
  console.log();

  return mintReport;
}

// Execute minting
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Minting failed:", error);
    process.exit(1);
  });
