import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Mint Triple-Stack Treasury ENFTs
 * 
 * This script mints ENFTs for all three yield streams:
 * - Civilian (Ω-CIV-01)
 * - Military (Ω-MIL-01)
 * - Cosmic (Ω-COS-01)
 */

interface MintConfig {
  treasuryAddress: string;
  recipients: {
    address: string;
    civilianAmount: number;
    militaryAmount: number;
    cosmicAmount: number;
  }[];
}

async function main() {
  console.log("🌀 Minting Triple-Stack Treasury ENFTs...");
  console.log("━".repeat(60));

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📡 Network:", network.name);
  console.log("🔑 Deployer:", deployer.address);
  console.log();

  // Load contract address from deployment file or environment
  let treasuryAddress = process.env.TREASURY_LEDGER_ADDRESS;
  
  if (!treasuryAddress) {
    // Try to load from latest deployment file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith("triple-stack-treasury") && f.endsWith(".json"))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const latestDeployment = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, files[0]), "utf-8")
        );
        treasuryAddress = latestDeployment.contracts.TripleStackTreasuryLedger.address;
        console.log("📦 Loaded contract from:", files[0]);
      }
    }
  }

  if (!treasuryAddress) {
    throw new Error("Treasury address not found. Set TREASURY_LEDGER_ADDRESS env var or deploy first.");
  }

  console.log("🏛️  Treasury Ledger:", treasuryAddress);
  console.log();

  // Connect to contract
  const TripleStackTreasuryLedger = await ethers.getContractFactory("TripleStackTreasuryLedger");
  const treasuryLedger = TripleStackTreasuryLedger.attach(treasuryAddress);

  // Verify roles
  const MINTER_ROLE = await treasuryLedger.MINTER_ROLE();
  const hasMinterRole = await treasuryLedger.hasRole(MINTER_ROLE, deployer.address);
  
  if (!hasMinterRole) {
    throw new Error("Deployer does not have MINTER_ROLE");
  }
  console.log("✅ Minter role verified");
  console.log();

  // Load minting configuration
  const configPath = process.env.MINT_CONFIG || path.join(__dirname, "..", "data", "treasury-mint-config.json");
  let mintConfig: MintConfig;

  if (fs.existsSync(configPath)) {
    mintConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("📋 Loaded mint config from:", configPath);
  } else {
    // Default configuration - mint to deployer
    mintConfig = {
      treasuryAddress,
      recipients: [
        {
          address: deployer.address,
          civilianAmount: 1,
          militaryAmount: 1,
          cosmicAmount: 1
        }
      ]
    };
    console.log("📋 Using default mint config");
  }

  console.log("👥 Recipients:", mintConfig.recipients.length);
  console.log();

  // Generate Blu-Vault authorization tag
  const authTag = ethers.keccak256(
    ethers.solidityPacked(
      ["address", "uint256", "string"],
      [deployer.address, Date.now(), "BLU-VAULT-π4-AUTHORIZATION"]
    )
  );

  console.log("🔐 Blu-Vault Auth Tag:", authTag);
  console.log();

  // Mint records
  const mintRecords: any[] = [];

  // Process each recipient
  for (let i = 0; i < mintConfig.recipients.length; i++) {
    const recipient = mintConfig.recipients[i];
    
    console.log(`🎯 Minting for recipient ${i + 1}/${mintConfig.recipients.length}:`);
    console.log("   Address:", recipient.address);
    console.log("   🏛️  Civilian (Ω-CIV-01):", recipient.civilianAmount);
    console.log("   ⚔️  Military (Ω-MIL-01):", recipient.militaryAmount);
    console.log("   🌌 Cosmic (Ω-COS-01):", recipient.cosmicAmount);

    try {
      // Mint all three streams in a single transaction
      const tx = await treasuryLedger.mintAllYieldStreams(
        recipient.address,
        recipient.civilianAmount,
        recipient.militaryAmount,
        recipient.cosmicAmount,
        authTag
      );

      console.log("   ⏳ Transaction:", tx.hash);
      const receipt = await tx.wait();
      console.log("   ✅ Confirmed in block:", receipt?.blockNumber);

      // Parse events
      const events = receipt?.logs
        .map((log: any) => {
          try {
            return treasuryLedger.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((e: any) => e !== null);

      mintRecords.push({
        recipient: recipient.address,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        civilianAmount: recipient.civilianAmount,
        militaryAmount: recipient.militaryAmount,
        cosmicAmount: recipient.cosmicAmount,
        authTag,
        events: events?.map((e: any) => e?.name),
      });

      // Check balances
      const civilianBalance = await treasuryLedger.balanceOf(recipient.address, 1);
      const militaryBalance = await treasuryLedger.balanceOf(recipient.address, 2);
      const cosmicBalance = await treasuryLedger.balanceOf(recipient.address, 3);

      console.log("   💎 Balances:");
      console.log("      Civilian:", civilianBalance.toString());
      console.log("      Military:", militaryBalance.toString());
      console.log("      Cosmic:", cosmicBalance.toString());

    } catch (error: any) {
      console.error("   ❌ Minting failed:", error.message);
      mintRecords.push({
        recipient: recipient.address,
        error: error.message,
      });
    }

    console.log();
  }

  // Display yield accumulation info
  console.log("━".repeat(60));
  console.log("📊 Current Yield Accumulation:");
  console.log();

  for (let tokenId = 1; tokenId <= 3; tokenId++) {
    const currentYield = await treasuryLedger.calculateCurrentYield(tokenId);
    const metadata = await treasuryLedger.getYieldMetadata(tokenId);
    
    const streamName = tokenId === 1 ? "Civilian" : tokenId === 2 ? "Military" : "Cosmic";
    const streamCode = metadata.sovereignCode;
    
    console.log(`${streamName} (${streamCode}):`);
    console.log("  Current Accumulated:", ethers.formatEther(currentYield), "USD");
    console.log("  Yield/Second:", ethers.formatEther(metadata.yieldPerSecond), "USD");
    console.log("  Status:", metadata.isActive ? "Active" : "Inactive");
    console.log("  Dual-Reality:", metadata.dualRealityConfirmed ? "✅ Confirmed" : "⏳ Pending");
    console.log();
  }

  // Save mint records
  const mintReport = {
    network: network.name,
    chainId: Number(network.chainId),
    treasuryAddress,
    timestamp: new Date().toISOString(),
    minter: deployer.address,
    authTag,
    records: mintRecords,
    summary: {
      totalRecipients: mintConfig.recipients.length,
      successful: mintRecords.filter(r => !r.error).length,
      failed: mintRecords.filter(r => r.error).length,
    }
  };

  const reportsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `triple-stack-mint-${network.name}-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(mintReport, null, 2));

  console.log("━".repeat(60));
  console.log("✨ Minting Complete!");
  console.log();
  console.log("💾 Mint report saved to:", filename);
  console.log("📊 Summary:");
  console.log("   Total Recipients:", mintReport.summary.totalRecipients);
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
