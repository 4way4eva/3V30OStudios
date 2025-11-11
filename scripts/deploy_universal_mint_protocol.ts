import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

/**
 * Deploy Universal Mint Protocol infrastructure
 * - UniversalMintProtocol contract
 * - GovMetaScopeVault contract
 * - Initial configuration and activation
 */
async function main() {
  console.log("🌀 BLEU Codex Universal Mint Protocol Deployment");
  console.log("================================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Deploy UniversalMintProtocol
  console.log("📜 Deploying UniversalMintProtocol...");
  const UniversalMintProtocol = await ethers.getContractFactory("UniversalMintProtocol");
  const mintProtocol = await UniversalMintProtocol.deploy();
  await mintProtocol.deployed();
  console.log("✅ UniversalMintProtocol deployed to:", mintProtocol.address);

  // Deploy GovMetaScopeVault
  console.log("\n📜 Deploying GovMetaScopeVault...");
  const GovMetaScopeVault = await ethers.getContractFactory("GovMetaScopeVault");
  const govVault = await GovMetaScopeVault.deploy();
  await govVault.deployed();
  console.log("✅ GovMetaScopeVault deployed to:", govVault.address);

  // Generate Master Index Scroll ID
  const masterScrollId = ethers.utils.id("BCMIS-Ω∞-001");
  const ceremonialSeal = ethers.utils.id("BLEU_CODEX_SUPREME_COMMAND_SEAL_∞");

  console.log("\n🔐 Master Index Scroll Configuration");
  console.log("Scroll ID:", masterScrollId);
  console.log("Ceremonial Seal:", ceremonialSeal);

  // Register vaults for each domain
  console.log("\n🏦 Registering Domain Vaults...");
  
  const civilianVaultId = ethers.utils.id("CIVILIAN_VAULT");
  const militaryVaultId = ethers.utils.id("MILITARY_VAULT");
  const cosmicVaultId = ethers.utils.id("COSMIC_VAULT");

  const vaultIds = [civilianVaultId, militaryVaultId, cosmicVaultId];
  const vaultNames = ["Civilian", "Military", "Cosmic"];

  for (let i = 0; i < vaultIds.length; i++) {
    let attempts = 0;
    const maxAttempts = 3;
    let registered = false;
    while (!registered && attempts < maxAttempts) {
      try {
        console.log(`\nRegistering ${vaultNames[i]} Vault (Attempt ${attempts + 1})...`);
        const tx = await govVault.registerVault(vaultIds[i]);
        await tx.wait();
        console.log(`✅ ${vaultNames[i]} Vault registered with ID:`, vaultIds[i]);
        registered = true;
      } catch (error) {
        attempts++;
        console.error(`❌ Failed to register ${vaultNames[i]} Vault (Attempt ${attempts}):`, error);
        if (attempts >= maxAttempts) {
          console.error(`🚨 Giving up on registering ${vaultNames[i]} Vault after ${maxAttempts} attempts.`);
        } else {
          console.log(`🔄 Retrying ${vaultNames[i]} Vault registration...`);
        }
      }
    }
  }

  // Configure vaults in UniversalMintProtocol
  console.log("\n⚙️ Configuring Vaults in Universal Mint Protocol...");

  // Civilian: 45% local, 35% treasury, 20% cross-domain
  console.log("\nConfiguring Civilian Domain...");
  let tx = await mintProtocol.configureVault(
    0, // Domain.Civilian
    govVault.address,
    4500, // 45% local retention
    3500, // 35% treasury
    2000, // 20% cross-domain
    ethers.utils.parseEther("1000000000") // 1B threshold
  );
  await tx.wait();
  console.log("✅ Civilian vault configured");

  // Military: 60% operational, 25% treasury, 15% cross-domain
  console.log("\nConfiguring Military Domain...");
  tx = await mintProtocol.configureVault(
    1, // Domain.Military
    govVault.address,
    6000, // 60% operational reserve
    2500, // 25% treasury
    1500, // 15% cross-domain
    ethers.utils.parseEther("500000000") // 500M threshold
  );
  await tx.wait();
  console.log("✅ Military vault configured");

  // Cosmic: 40% research, 40% treasury, 20% cross-domain
  console.log("\nConfiguring Cosmic Domain...");
  tx = await mintProtocol.configureVault(
    2, // Domain.Cosmic
    govVault.address,
    4000, // 40% research reserve
    4000, // 40% treasury
    2000, // 20% cross-domain
    ethers.utils.parseEther("750000000") // 750M threshold
  );
  await tx.wait();
  console.log("✅ Cosmic vault configured");

  // Add threshold triggers to vaults
  console.log("\n🎯 Adding Vault Triggers...");
  
  const triggerThresholds = [
    ethers.utils.parseEther("1000000000"), // 1B for Civilian
    ethers.utils.parseEther("10000000000"), // 10B for Civilian
    ethers.utils.parseEther("100000000000"), // 100B for Civilian
  ];

  for (let i = 0; i < vaultIds.length; i++) {
    console.log(`\nAdding triggers to ${vaultNames[i]} Vault...`);
    for (let j = 0; j < triggerThresholds.length; j++) {
      const tx = await govVault.addTriggerCondition(
        vaultIds[i],
        0, // TriggerType.Threshold
        triggerThresholds[j],
        86400, // 24 hour timelock
        ethers.utils.id(`TRIGGER_${vaultNames[i]}_${j}`)
      );
      await tx.wait();
      console.log(`  ✅ Trigger ${j + 1} added: ${ethers.utils.formatEther(triggerThresholds[j])} tokens`);
    }
  }

  // Activate the protocol
  console.log("\n🚀 Activating Universal Mint Protocol...");
  tx = await mintProtocol.activateProtocol(masterScrollId, ceremonialSeal);
  await tx.wait();
  console.log("✅ Protocol activated!");

  // Verify activation
  const status = await mintProtocol.getProtocolStatus();
  console.log("\n📊 Protocol Status:");
  console.log("  Activated:", status.activated);
  console.log("  Civilian Domain:", status.civilianActive ? "✅ Active" : "❌ Inactive");
  console.log("  Military Domain:", status.militaryActive ? "✅ Active" : "❌ Inactive");
  console.log("  Cosmic Domain:", status.cosmicActive ? "✅ Active" : "❌ Inactive");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      UniversalMintProtocol: {
        address: mintProtocol.address,
        masterScrollId,
        ceremonialSeal,
      },
      GovMetaScopeVault: {
        address: govVault.address,
        vaults: {
          civilian: civilianVaultId,
          military: militaryVaultId,
          cosmic: cosmicVaultId,
        },
      },
    },
    configuration: {
      civilian: {
        ratePerSecond: 13_600_000,
        dailyYield: "1,175,040,000,000",
        localRetention: "45%",
        treasuryAllocation: "35%",
        crossDomainFlow: "20%",
      },
      military: {
        ratePerSecond: 6_100_000,
        dailyYield: "527,040,000,000",
        localRetention: "60%",
        treasuryAllocation: "25%",
        crossDomainFlow: "15%",
      },
      cosmic: {
        ratePerSecond: 9_200_000,
        dailyYield: "794,880,000,000",
        localRetention: "40%",
        treasuryAllocation: "40%",
        crossDomainFlow: "20%",
      },
    },
  };

  const outputPath = join(__dirname, "..", "deployments", "universal-mint-protocol.json");
  writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", outputPath);

  console.log("\n🎉 Universal Mint Protocol Deployment Complete!");
  console.log("================================================");
  console.log("\n📋 Summary:");
  console.log("  UniversalMintProtocol:", mintProtocol.address);
  console.log("  GovMetaScopeVault:", govVault.address);
  console.log("  Master Scroll ID:", masterScrollId);
  console.log("\n✨ The BLEU Codex Universal Mint Protocols are now active!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
