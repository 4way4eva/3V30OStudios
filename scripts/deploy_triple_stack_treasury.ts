import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy TripleStackTreasuryLedger contract
 * 
 * This script deploys the ENFT ledger for the triple-stack treasury system
 * with Civilian, Military, and Cosmic yield streams.
 */
async function main() {
  console.log("🌀 Deploying Triple-Stack Treasury Ledger...");
  console.log("━".repeat(60));

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📡 Network:", network.name);
  console.log("🔑 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log();

  // Base URI for metadata (required from environment)
  const baseURI = process.env.TREASURY_BASE_URI;
  
  if (!baseURI) {
    throw new Error("TREASURY_BASE_URI environment variable is required for deployment");
  }

  console.log("📦 Deploying TripleStackTreasuryLedger...");
  const TripleStackTreasuryLedger = await ethers.getContractFactory("TripleStackTreasuryLedger");
  const treasuryLedger = await TripleStackTreasuryLedger.deploy(baseURI);
  
  await treasuryLedger.waitForDeployment();
  const ledgerAddress = await treasuryLedger.getAddress();

  console.log("✅ TripleStackTreasuryLedger deployed to:", ledgerAddress);
  console.log();

  // Verify roles
  console.log("🔐 Verifying roles...");
  const DEFAULT_ADMIN_ROLE = await treasuryLedger.DEFAULT_ADMIN_ROLE();
  const MINTER_ROLE = await treasuryLedger.MINTER_ROLE();
  const BLU_VAULT_ROLE = await treasuryLedger.BLU_VAULT_ROLE();
  const SOVEREIGN_OVERRIDE_ROLE = await treasuryLedger.SOVEREIGN_OVERRIDE_ROLE();

  const hasAdmin = await treasuryLedger.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasMinter = await treasuryLedger.hasRole(MINTER_ROLE, deployer.address);
  const hasBluVault = await treasuryLedger.hasRole(BLU_VAULT_ROLE, deployer.address);
  const hasSovereign = await treasuryLedger.hasRole(SOVEREIGN_OVERRIDE_ROLE, deployer.address);

  console.log("  ✓ DEFAULT_ADMIN_ROLE:", hasAdmin);
  console.log("  ✓ MINTER_ROLE:", hasMinter);
  console.log("  ✓ BLU_VAULT_ROLE:", hasBluVault);
  console.log("  ✓ SOVEREIGN_OVERRIDE_ROLE:", hasSovereign);
  console.log();

  // Get initial treasury metrics
  console.log("💎 Treasury Metrics:");
  const metrics = await treasuryLedger.getTreasuryMetrics();
  console.log("  • Total Yield/Second:", ethers.formatEther(metrics[0]), "USD");
  console.log("  • Daily Yield:", ethers.formatEther(metrics[1]), "USD");
  console.log("  • π₄ Constant (scaled):", metrics[2].toString());
  console.log();

  // Get yield stream metadata
  console.log("🌊 Yield Stream Initialization:");
  
  const CIVILIAN_TOKEN_ID = 1;
  const MILITARY_TOKEN_ID = 2;
  const COSMIC_TOKEN_ID = 3;

  const civilianMeta = await treasuryLedger.getYieldMetadata(CIVILIAN_TOKEN_ID);
  console.log("  🏛️  Civilian (Ω-CIV-01):");
  console.log("      Name:", civilianMeta.name);
  console.log("      Yield/Sec:", ethers.formatEther(civilianMeta.yieldPerSecond), "USD");
  console.log("      Active:", civilianMeta.isActive);

  const militaryMeta = await treasuryLedger.getYieldMetadata(MILITARY_TOKEN_ID);
  console.log("  ⚔️  Military (Ω-MIL-01):");
  console.log("      Name:", militaryMeta.name);
  console.log("      Yield/Sec:", ethers.formatEther(militaryMeta.yieldPerSecond), "USD");
  console.log("      Active:", militaryMeta.isActive);

  const cosmicMeta = await treasuryLedger.getYieldMetadata(COSMIC_TOKEN_ID);
  console.log("  🌌 Cosmic (Ω-COS-01):");
  console.log("      Name:", cosmicMeta.name);
  console.log("      Yield/Sec:", ethers.formatEther(cosmicMeta.yieldPerSecond), "USD");
  console.log("      Active:", cosmicMeta.isActive);
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TripleStackTreasuryLedger: {
        address: ledgerAddress,
        baseURI: baseURI,
      }
    },
    yieldStreams: {
      civilian: {
        tokenId: CIVILIAN_TOKEN_ID,
        code: "Ω-CIV-01",
        yieldPerSecond: ethers.formatEther(civilianMeta.yieldPerSecond),
      },
      military: {
        tokenId: MILITARY_TOKEN_ID,
        code: "Ω-MIL-01",
        yieldPerSecond: ethers.formatEther(militaryMeta.yieldPerSecond),
      },
      cosmic: {
        tokenId: COSMIC_TOKEN_ID,
        code: "Ω-COS-01",
        yieldPerSecond: ethers.formatEther(cosmicMeta.yieldPerSecond),
      }
    },
    metrics: {
      totalYieldPerSecond: ethers.formatEther(metrics[0]),
      dailyYield: ethers.formatEther(metrics[1]),
      pi4Constant: metrics[2].toString(),
    }
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `triple-stack-treasury-${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("💾 Deployment info saved to:", filename);
  console.log();
  console.log("━".repeat(60));
  console.log("✨ Triple-Stack Treasury Ledger Deployment Complete!");
  console.log();
  console.log("📋 Contract Address:", ledgerAddress);
  console.log("🔗 Verify command:");
  console.log(`   npx hardhat verify --network ${network.name} ${ledgerAddress} "${baseURI}"`);
  console.log();

  return {
    treasuryLedger: ledgerAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
