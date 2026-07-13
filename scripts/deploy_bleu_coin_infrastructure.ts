import { ethers, network } from "hardhat";
import { recordDeployment } from "./utils/manifest";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy BLEU Coin Infrastructure System
 * 
 * This script deploys:
 * 1. BLEUCoin token with three-tier access control
 * 2. BLEUVault treasury management system
 * 3. Sets up initial roles and permissions
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=".repeat(70));
  console.log("BLEU Coin™ Infrastructure System Deployment");
  console.log("=".repeat(70));
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log("=".repeat(70));

  // Deploy BLEUCoin
  console.log("\n📊 Deploying BLEUCoin token...");
  const BLEUCoin = await ethers.getContractFactory("BLEUCoin");
  const bleuCoin = await BLEUCoin.deploy();
  await bleuCoin.waitForDeployment();
  const bleuCoinAddress = await bleuCoin.getAddress();
  console.log(`✅ BLEUCoin deployed at: ${bleuCoinAddress}`);

  // Deploy BLEUVault
  console.log("\n🏦 Deploying BLEUVault treasury...");
  const BLEUVault = await ethers.getContractFactory("BLEUVault");
  const bleuVault = await BLEUVault.deploy(bleuCoinAddress);
  await bleuVault.waitForDeployment();
  const bleuVaultAddress = await bleuVault.getAddress();
  console.log(`✅ BLEUVault deployed at: ${bleuVaultAddress}`);

  // Grant minter role to deployer for initial setup
  console.log("\n🔐 Setting up access control roles...");
  const MINTER_ROLE = await bleuCoin.MINTER_ROLE();
  const TREASURER_ROLE = await bleuVault.TREASURER_ROLE();
  const AUDITOR_ROLE = await bleuVault.AUDITOR_ROLE();
  const RESTITUTION_ROLE = await bleuVault.RESTITUTION_ROLE();

  console.log("   - Granting MINTER_ROLE to deployer...");
  // Already granted in constructor
  
  console.log("   - Granting vault access roles...");
  // Already granted in constructor

  // Record deployment
  console.log("\n📝 Recording deployment manifest...");
  await recordDeployment(network.name, network.config.chainId as number | undefined, {
    BLEUCoin: bleuCoinAddress,
    BLEUVault: bleuVaultAddress,
  });

  // Create deployment summary
  const summary = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BLEUCoin: {
        address: bleuCoinAddress,
        description: "BLEU Coin™ - Sovereign wealth token with three-tier access",
        features: [
          "Soul-linked tracing",
          "Inflation resistance",
          "Cross-ledger visibility",
          "Three-tier streams (Civilian, Military, Cosmic)"
        ]
      },
      BLEUVault: {
        address: bleuVaultAddress,
        description: "BLEU Vault - Treasury management and reconciliation",
        features: [
          "Multi-stream vault system",
          "Immutable receipt generation",
          "Taxation reversal mechanisms",
          "Reconciliation snapshots"
        ]
      }
    },
    roles: {
      MINTER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE")),
      TREASURER_ROLE: ethers.keccak256(ethers.toUtf8Bytes("TREASURER_ROLE")),
      AUDITOR_ROLE: ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE")),
      RESTITUTION_ROLE: ethers.keccak256(ethers.toUtf8Bytes("RESTITUTION_ROLE"))
    }
  };

  // Save deployment summary
  const summaryPath = path.join(__dirname, "..", "deployments", `bleu-coin-${network.name}.json`);
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Deployment summary saved to: ${summaryPath}`);

  // Display next steps
  console.log("\n" + "=".repeat(70));
  console.log("✨ Deployment Complete!");
  console.log("=".repeat(70));
  console.log("\n📋 Next Steps:");
  console.log("1. Execute inaugural mass-mint using scripts/bleu-coin-mass-mint.ts");
  console.log("2. Create initial treasury snapshot");
  console.log("3. Configure additional minters and treasurers as needed");
  console.log("4. Verify contracts on block explorer if on mainnet/testnet");
  console.log("\n💡 Important Addresses:");
  console.log(`   BLEUCoin:  ${bleuCoinAddress}`);
  console.log(`   BLEUVault: ${bleuVaultAddress}`);
  console.log("\n" + "=".repeat(70));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
