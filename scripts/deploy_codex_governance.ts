import { ethers } from "hardhat";

/**
 * Deploy Codex Sovereign Governance Contract
 * 
 * This script deploys the governance system for the EVOLVERSE Codex infrastructure,
 * including triple-stack treasury management, metawing command chains, tribunal
 * structures, and vault automation with Atlantis rules.
 */
async function main() {
  console.log("🌀 Deploying Codex Sovereign Governance System...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy CodexSovereignGovernance
  console.log("📜 Deploying CodexSovereignGovernance...");
  const CodexSovereignGovernance = await ethers.getContractFactory("CodexSovereignGovernance");
  const governance = await CodexSovereignGovernance.deploy(deployer.address);
  await governance.waitForDeployment();
  
  const governanceAddress = await governance.getAddress();
  console.log("✅ CodexSovereignGovernance deployed to:", governanceAddress);

  // Grant additional roles
  console.log("\n👑 Setting up roles...");
  
  const METAWING_COMMANDER_ROLE = await governance.METAWING_COMMANDER_ROLE();
  const VAULT_OVERSEER_ROLE = await governance.VAULT_OVERSEER_ROLE();
  const WATCHTOWER_ROLE = await governance.WATCHTOWER_ROLE();
  
  console.log("- Granting METAWING_COMMANDER_ROLE to deployer...");
  await governance.grantRole(METAWING_COMMANDER_ROLE, deployer.address);
  
  console.log("- Granting VAULT_OVERSEER_ROLE to deployer...");
  await governance.grantRole(VAULT_OVERSEER_ROLE, deployer.address);
  
  console.log("- Granting WATCHTOWER_ROLE to deployer...");
  await governance.grantRole(WATCHTOWER_ROLE, deployer.address);

  // Display initial treasury yields
  console.log("\n💰 Triple-Stack Treasury Yields:");
  const civilianYield = await governance.yieldPerSecond(0); // CIVILIAN
  const militaryYield = await governance.yieldPerSecond(1); // MILITARY
  const cosmicYield = await governance.yieldPerSecond(2);   // COSMIC
  
  console.log("- Civilian Stream:", ethers.formatEther(civilianYield), "ETH/sec");
  console.log("- Military Stream:", ethers.formatEther(militaryYield), "ETH/sec");
  console.log("- Cosmic Stream:", ethers.formatEther(cosmicYield), "ETH/sec");
  
  const totalDaily = await governance.getTotalDailyYield();
  console.log("- Total Daily Yield:", ethers.formatEther(totalDaily), "ETH");

  // Create initial Atlantis rules
  console.log("\n🏛️ Creating initial Atlantis Rules...");
  
  const rule1 = await governance.createAtlantisRule(
    "π⁴ Compounding Base Threshold",
    ethers.parseEther("1000000") // 1M threshold
  );
  await rule1.wait();
  console.log("✅ Atlantis Rule 1 created");
  
  const rule2 = await governance.createAtlantisRule(
    "Quarter Law Sync Trigger",
    ethers.parseEther("229720320") // ~230T quarterly threshold
  );
  await rule2.wait();
  console.log("✅ Atlantis Rule 2 created");

  // Create vault threads for each stream
  console.log("\n⚙️ Creating Vault Automation Threads...");
  
  const civilianThread = await governance.createVaultThread(0); // CIVILIAN
  await civilianThread.wait();
  console.log("✅ Civilian vault thread created");
  
  const militaryThread = await governance.createVaultThread(1); // MILITARY
  await militaryThread.wait();
  console.log("✅ Military vault thread created");
  
  const cosmicThread = await governance.createVaultThread(2); // COSMIC
  await cosmicThread.wait();
  console.log("✅ Cosmic vault thread created");

  // Associate rules with threads
  console.log("\n🔗 Associating Atlantis Rules with Vault Threads...");
  await (await governance.associateRuleWithThread(0, 0)).wait();
  await (await governance.associateRuleWithThread(0, 1)).wait();
  console.log("✅ Rules associated with Civilian thread");
  
  await (await governance.associateRuleWithThread(1, 0)).wait();
  await (await governance.associateRuleWithThread(1, 1)).wait();
  console.log("✅ Rules associated with Military thread");
  
  await (await governance.associateRuleWithThread(2, 0)).wait();
  await (await governance.associateRuleWithThread(2, 1)).wait();
  console.log("✅ Rules associated with Cosmic thread");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("- CodexSovereignGovernance:", governanceAddress);
  console.log("\nNext Steps:");
  console.log("1. Issue command chains using issueCommandChain()");
  console.log("2. Execute vault syncs using executeVaultSync()");
  console.log("3. Monitor Atlantis rule triggers");
  console.log("4. Verify contract on block explorer:");
  console.log(`   npx hardhat verify --network <network> ${governanceAddress} ${deployer.address}`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
