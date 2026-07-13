import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy BLEU Sovereign ENFT Minting System
 * 
 * This script deploys the BleuSovereignENFTMinter contract which implements:
 * - Living inheritance entries for three-sphere yield tokenization
 * - Irreversible asset minting tied to ledger worth
 * - π₄ compounding triggers at ENFT level
 * - Blu-Vault dual-sign security protocols
 * - Physical and interactive registry synchronization
 */

interface DeploymentConfig {
  baseURI: string;
  initialRoles?: {
    sovereignMinters?: string[];
    bluVaultSigners?: string[];
    dualSigners?: string[];
    emergencyControllers?: string[];
  };
}

async function main() {
  console.log("🌀 Deploying BLEU Sovereign ENFT Minting System...");
  console.log("━".repeat(60));

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📡 Network:", network.name);
  console.log("🔑 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log();

  // Load deployment configuration
  const configPath = process.env.DEPLOY_CONFIG || path.join(__dirname, "..", "data", "enft-deploy-config.json");
  let config: DeploymentConfig;

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("📋 Loaded config from:", configPath);
  } else {
    // Default configuration
    config = {
      baseURI: "ipfs://QmDefault/",
      initialRoles: {
        sovereignMinters: [deployer.address],
        bluVaultSigners: [deployer.address],
        dualSigners: [deployer.address],
        emergencyControllers: [deployer.address]
      }
    };
    console.log("📋 Using default configuration");
  }

  console.log();

  // Deploy BleuSovereignENFTMinter
  console.log("🚀 Deploying BleuSovereignENFTMinter...");
  const BleuSovereignENFTMinter = await ethers.getContractFactory("BleuSovereignENFTMinter");
  const minter = await BleuSovereignENFTMinter.deploy(config.baseURI);
  await minter.waitForDeployment();

  const minterAddress = await minter.getAddress();
  console.log("✅ BleuSovereignENFTMinter deployed to:", minterAddress);
  console.log();

  // Grant additional roles if specified
  if (config.initialRoles) {
    console.log("👥 Granting roles...");

    const SOVEREIGN_MINTER_ROLE = await minter.SOVEREIGN_MINTER_ROLE();
    const BLU_VAULT_ROLE = await minter.BLU_VAULT_ROLE();
    const DUAL_SIGN_ROLE = await minter.DUAL_SIGN_ROLE();
    const EMERGENCY_ROLE = await minter.EMERGENCY_ROLE();

    // Grant Sovereign Minter roles
    if (config.initialRoles.sovereignMinters) {
      for (const address of config.initialRoles.sovereignMinters) {
        if (address !== deployer.address) {
          const tx = await minter.grantRole(SOVEREIGN_MINTER_ROLE, address);
          await tx.wait();
          console.log("   ✅ SOVEREIGN_MINTER_ROLE granted to:", address);
        }
      }
    }

    // Grant Blu-Vault roles
    if (config.initialRoles.bluVaultSigners) {
      for (const address of config.initialRoles.bluVaultSigners) {
        if (address !== deployer.address) {
          const tx = await minter.grantRole(BLU_VAULT_ROLE, address);
          await tx.wait();
          console.log("   ✅ BLU_VAULT_ROLE granted to:", address);
        }
      }
    }

    // Grant Dual Sign roles
    if (config.initialRoles.dualSigners) {
      for (const address of config.initialRoles.dualSigners) {
        if (address !== deployer.address) {
          const tx = await minter.grantRole(DUAL_SIGN_ROLE, address);
          await tx.wait();
          console.log("   ✅ DUAL_SIGN_ROLE granted to:", address);
        }
      }
    }

    // Grant Emergency roles
    if (config.initialRoles.emergencyControllers) {
      for (const address of config.initialRoles.emergencyControllers) {
        if (address !== deployer.address) {
          const tx = await minter.grantRole(EMERGENCY_ROLE, address);
          await tx.wait();
          console.log("   ✅ EMERGENCY_ROLE granted to:", address);
        }
      }
    }

    console.log();
  }

  // Display contract information
  console.log("━".repeat(60));
  console.log("📊 Contract Information:");
  console.log();

  const systemMetrics = await minter.getSystemMetrics();
  console.log("💎 System Metrics:");
  console.log("   Total Civilian Minted:", systemMetrics[0].toString());
  console.log("   Total Military Minted:", systemMetrics[1].toString());
  console.log("   Total Cosmic Minted:", systemMetrics[2].toString());
  console.log("   Total Civilian Value:", ethers.formatEther(systemMetrics[3]), "USD");
  console.log("   Total Military Value:", ethers.formatEther(systemMetrics[4]), "USD");
  console.log("   Total Cosmic Value:", ethers.formatEther(systemMetrics[5]), "USD");
  console.log();

  console.log("🌐 Yield Rates:");
  console.log("   Civilian: $13.6M/sec");
  console.log("   Military: $6.1M/sec");
  console.log("   Cosmic: $9.2M/sec");
  console.log("   Total System: $28.9M/sec ($2.5T/day)");
  console.log();

  console.log("🔐 Security Features:");
  console.log("   ✅ Blu-Vault dual-sign authorization");
  console.log("   ✅ Irreversible asset locking");
  console.log("   ✅ π₄ compounding triggers");
  console.log("   ✅ Dual-reality confirmation");
  console.log("   ✅ Emergency controls");
  console.log();

  // Save deployment info
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BleuSovereignENFTMinter: {
        address: minterAddress,
        baseURI: config.baseURI,
        roles: {
          SOVEREIGN_MINTER_ROLE: await minter.SOVEREIGN_MINTER_ROLE(),
          BLU_VAULT_ROLE: await minter.BLU_VAULT_ROLE(),
          DUAL_SIGN_ROLE: await minter.DUAL_SIGN_ROLE(),
          EMERGENCY_ROLE: await minter.EMERGENCY_ROLE()
        }
      }
    },
    config,
    yieldRates: {
      civilian: "13600000",
      military: "6100000",
      cosmic: "9200000",
      total: "28900000"
    },
    pi4: {
      constant: "97.409091034",
      scaledValue: "97409091034000000000",
      compoundingInterval: 7948800
    }
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `bleu-sovereign-enft-${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));

  console.log("━".repeat(60));
  console.log("✨ Deployment Complete!");
  console.log();
  console.log("💾 Deployment info saved to:", filename);
  console.log();
  console.log("📝 Next Steps:");
  console.log("   1. Verify contract on block explorer");
  console.log("   2. Create inheritance entries for each economic sphere");
  console.log("   3. Apply Blu-Vault dual signatures");
  console.log("   4. Mint and lock ENFTs irreversibly");
  console.log("   5. Sync with physical and interactive registries");
  console.log();
  console.log("🔗 Contract Address:");
  console.log("   ", minterAddress);
  console.log();

  return deployment;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
