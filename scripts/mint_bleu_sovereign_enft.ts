import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Mint BLEU Sovereign ENFTs
 * 
 * This script creates and mints living inheritance entries across all three economic spheres:
 * - Civilian (Ω-CIV): Real estate, education, commerce, infrastructure
 * - Military (Ω-MIL): Defense, tactical operations, armaments
 * - Cosmic (Ω-COS): Portal logistics, quantum tech, dimensional items
 * 
 * Process:
 * 1. Create inheritance entries with Blu-Vault authorization
 * 2. Apply dual signatures
 * 3. Mint ENFTs
 * 4. Lock entries irreversibly
 * 5. Apply π₄ compounding triggers
 * 6. Sync with dimensional registries
 */

interface MintEntry {
  recipient: string;
  sphere: "CIVILIAN" | "MILITARY" | "COSMIC";
  ledgerWorth: string; // in USD (will be scaled by 1e18)
  metadataURI: string;
  amount: number;
  primarySigner: string;
  secondarySigner: string;
  physicalAssetId?: string;
  interactiveRegistryId?: string;
  linkedDimensions?: number[];
}

interface MintConfig {
  contractAddress: string;
  entries: MintEntry[];
}

async function main() {
  console.log("🌀 Minting BLEU Sovereign ENFTs...");
  console.log("━".repeat(60));

  const [deployer, signer1, signer2] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📡 Network:", network.name);
  console.log("🔑 Deployer:", deployer.address);
  console.log("🔐 Signer 1:", signer1?.address || "Not available");
  console.log("🔐 Signer 2:", signer2?.address || "Not available");
  console.log();

  // Load contract address
  let contractAddress = process.env.ENFT_MINTER_ADDRESS;
  
  if (!contractAddress) {
    // Try to load from latest deployment file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith("bleu-sovereign-enft") && f.endsWith(".json"))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const latestDeployment = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, files[0]), "utf-8")
        );
        contractAddress = latestDeployment.contracts.BleuSovereignENFTMinter.address;
        console.log("📦 Loaded contract from:", files[0]);
      }
    }
  }

  if (!contractAddress) {
    throw new Error("Contract address not found. Set ENFT_MINTER_ADDRESS env var or deploy first.");
  }

  console.log("🏛️  Minter Contract:", contractAddress);
  console.log();

  // Connect to contract
  const BleuSovereignENFTMinter = await ethers.getContractFactory("BleuSovereignENFTMinter");
  const minter = BleuSovereignENFTMinter.attach(contractAddress);

  // Verify roles
  const SOVEREIGN_MINTER_ROLE = await minter.SOVEREIGN_MINTER_ROLE();
  const DUAL_SIGN_ROLE = await minter.DUAL_SIGN_ROLE();
  const BLU_VAULT_ROLE = await minter.BLU_VAULT_ROLE();
  
  const hasMinterRole = await minter.hasRole(SOVEREIGN_MINTER_ROLE, deployer.address);
  const hasDualSignRole = await minter.hasRole(DUAL_SIGN_ROLE, deployer.address);
  const hasBluVaultRole = await minter.hasRole(BLU_VAULT_ROLE, deployer.address);
  
  console.log("🔑 Role Verification:");
  console.log("   SOVEREIGN_MINTER:", hasMinterRole ? "✅" : "❌");
  console.log("   DUAL_SIGN:", hasDualSignRole ? "✅" : "❌");
  console.log("   BLU_VAULT:", hasBluVaultRole ? "✅" : "❌");
  console.log();

  if (!hasMinterRole) {
    throw new Error("Deployer does not have SOVEREIGN_MINTER_ROLE");
  }

  // Load minting configuration
  const configPath = process.env.MINT_CONFIG || path.join(__dirname, "..", "data", "enft-mint-config.json");
  let mintConfig: MintConfig;

  if (fs.existsSync(configPath)) {
    mintConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("📋 Loaded mint config from:", configPath);
  } else {
    // Default configuration - create one entry per sphere
    const defaultSigner1 = signer1?.address || deployer.address;
    const defaultSigner2 = signer2?.address || deployer.address;
    
    mintConfig = {
      contractAddress,
      entries: [
        {
          recipient: deployer.address,
          sphere: "CIVILIAN",
          ledgerWorth: "1000000", // $1M
          metadataURI: "ipfs://QmCivilian001/metadata.json",
          amount: 1,
          primarySigner: deployer.address,
          secondarySigner: defaultSigner1,
          physicalAssetId: "CIV-ASSET-001",
          interactiveRegistryId: "CIV-REG-001",
          linkedDimensions: [1, 137, 43114] // Ethereum, Polygon, Avalanche
        },
        {
          recipient: deployer.address,
          sphere: "MILITARY",
          ledgerWorth: "500000", // $500K
          metadataURI: "ipfs://QmMilitary001/metadata.json",
          amount: 1,
          primarySigner: deployer.address,
          secondarySigner: defaultSigner1,
          physicalAssetId: "MIL-ASSET-001",
          interactiveRegistryId: "MIL-REG-001",
          linkedDimensions: [1, 137]
        },
        {
          recipient: deployer.address,
          sphere: "COSMIC",
          ledgerWorth: "750000", // $750K
          metadataURI: "ipfs://QmCosmic001/metadata.json",
          amount: 1,
          primarySigner: deployer.address,
          secondarySigner: defaultSigner1,
          physicalAssetId: "COS-ASSET-001",
          interactiveRegistryId: "COS-REG-001",
          linkedDimensions: [1, 137, 43114, 56] // + BSC
        }
      ]
    };
    console.log("📋 Using default mint config");
  }

  console.log("📝 Entries to mint:", mintConfig.entries.length);
  console.log();

  // Process each entry
  const mintRecords: any[] = [];

  for (let i = 0; i < mintConfig.entries.length; i++) {
    const entry = mintConfig.entries[i];
    
    console.log(`━━━ Entry ${i + 1}/${mintConfig.entries.length} ━━━`);
    console.log("🎯 Sphere:", entry.sphere);
    console.log("   Recipient:", entry.recipient);
    console.log("   Ledger Worth: $" + entry.ledgerWorth);
    console.log("   Amount:", entry.amount);
    console.log();

    try {
      // Step 1: Create inheritance entry
      console.log("📝 Step 1: Creating inheritance entry...");
      
      const sphereEnum = entry.sphere === "CIVILIAN" ? 0 : entry.sphere === "MILITARY" ? 1 : 2;
      const ledgerWorthScaled = ethers.parseEther(entry.ledgerWorth);
      const yieldTag = ethers.keccak256(ethers.solidityPacked(
        ["string", "uint256", "address"],
        [entry.sphere, Date.now(), entry.recipient]
      ));

      const createTx = await minter.createInheritanceEntry(
        entry.recipient,
        sphereEnum,
        ledgerWorthScaled,
        yieldTag,
        entry.metadataURI,
        entry.primarySigner,
        entry.secondarySigner
      );

      console.log("   ⏳ Transaction:", createTx.hash);
      const createReceipt = await createTx.wait();
      console.log("   ✅ Entry created in block:", createReceipt?.blockNumber);

      // Get token ID from event
      const createEvent = createReceipt?.logs
        .map((log: any) => {
          try {
            return minter.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === "InheritanceEntryCreated");

      const tokenId = createEvent?.args?.tokenId;
      console.log("   🆔 Token ID:", tokenId.toString());
      console.log();

      // Step 2: Apply dual signatures
      console.log("🔐 Step 2: Applying dual signatures...");
      
      // Primary signer
      const primarySigner = await ethers.provider.getSigner(entry.primarySigner);
      const minterAsPrimary = minter.connect(primarySigner);
      const sig1Tx = await minterAsPrimary.applyBluVaultSignature(tokenId);
      await sig1Tx.wait();
      console.log("   ✅ Primary signature applied");

      // Secondary signer
      const secondarySigner = await ethers.provider.getSigner(entry.secondarySigner);
      const minterAsSecondary = minter.connect(secondarySigner);
      const sig2Tx = await minterAsSecondary.applyBluVaultSignature(tokenId);
      await sig2Tx.wait();
      console.log("   ✅ Secondary signature applied");
      console.log();

      // Step 3: Mint ENFT
      console.log("💎 Step 3: Minting ENFT...");
      const mintTx = await minter.mintInheritanceEntry(tokenId, entry.recipient, entry.amount);
      console.log("   ⏳ Transaction:", mintTx.hash);
      const mintReceipt = await mintTx.wait();
      console.log("   ✅ ENFT minted in block:", mintReceipt?.blockNumber);
      console.log();

      // Step 4: Lock irreversibly
      console.log("🔒 Step 4: Locking entry irreversibly...");
      const lockTx = await minter.lockInheritanceEntry(tokenId);
      await lockTx.wait();
      console.log("   ✅ Entry locked (irreversible)");
      console.log();

      // Step 5: Sync with registries (if data provided)
      if (entry.physicalAssetId || entry.interactiveRegistryId) {
        console.log("🌐 Step 5: Syncing with dimensional registries...");
        const syncTx = await minter.syncRegistry(
          tokenId,
          entry.physicalAssetId || "",
          entry.interactiveRegistryId || "",
          entry.linkedDimensions || []
        );
        await syncTx.wait();
        console.log("   ✅ Registry synced");
        console.log();
      }

      // Get final entry data
      const inheritanceEntry = await minter.getInheritanceEntry(tokenId);
      const balance = await minter.balanceOf(entry.recipient, tokenId);

      console.log("📊 Final Status:");
      console.log("   Token ID:", tokenId.toString());
      console.log("   Sphere:", ["Civilian", "Military", "Cosmic"][inheritanceEntry.sphere]);
      console.log("   Status:", ["PENDING", "AUTHORIZED", "LOCKED", "FAILED"][inheritanceEntry.status]);
      console.log("   Irreversible:", inheritanceEntry.isIrreversible ? "✅" : "❌");
      console.log("   Balance:", balance.toString());
      console.log("   Yield/Sec:", ethers.formatEther(inheritanceEntry.yieldPerSecond), "USD");
      console.log("   Accumulated:", ethers.formatEther(inheritanceEntry.totalAccumulatedYield), "USD");
      console.log();

      mintRecords.push({
        tokenId: tokenId.toString(),
        sphere: entry.sphere,
        recipient: entry.recipient,
        ledgerWorth: entry.ledgerWorth,
        amount: entry.amount,
        status: "SUCCESS",
        transactions: {
          create: createTx.hash,
          mint: mintTx.hash,
          lock: lockTx.hash
        }
      });

    } catch (error: any) {
      console.error("   ❌ Error:", error.message);
      mintRecords.push({
        sphere: entry.sphere,
        recipient: entry.recipient,
        status: "FAILED",
        error: error.message
      });
    }

    console.log();
  }

  // Display system metrics
  console.log("━".repeat(60));
  console.log("📊 System Metrics After Minting:");
  console.log();

  const metrics = await minter.getSystemMetrics();
  console.log("💎 Total Minted:");
  console.log("   Civilian:", metrics[0].toString());
  console.log("   Military:", metrics[1].toString());
  console.log("   Cosmic:", metrics[2].toString());
  console.log();
  console.log("💰 Total Locked Value:");
  console.log("   Civilian: $" + ethers.formatEther(metrics[3]));
  console.log("   Military: $" + ethers.formatEther(metrics[4]));
  console.log("   Cosmic: $" + ethers.formatEther(metrics[5]));
  console.log();

  // Save mint report
  const mintReport = {
    network: network.name,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    contractAddress,
    minter: deployer.address,
    records: mintRecords,
    systemMetrics: {
      civilianMinted: metrics[0].toString(),
      militaryMinted: metrics[1].toString(),
      cosmicMinted: metrics[2].toString(),
      civilianValue: ethers.formatEther(metrics[3]),
      militaryValue: ethers.formatEther(metrics[4]),
      cosmicValue: ethers.formatEther(metrics[5])
    },
    summary: {
      total: mintConfig.entries.length,
      successful: mintRecords.filter(r => r.status === "SUCCESS").length,
      failed: mintRecords.filter(r => r.status === "FAILED").length
    }
  };

  const reportsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `bleu-enft-mint-${network.name}-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(mintReport, null, 2));

  console.log("━".repeat(60));
  console.log("✨ Minting Complete!");
  console.log();
  console.log("💾 Mint report saved to:", filename);
  console.log("📊 Summary:");
  console.log("   Total Entries:", mintReport.summary.total);
  console.log("   Successful:", mintReport.summary.successful);
  console.log("   Failed:", mintReport.summary.failed);
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
