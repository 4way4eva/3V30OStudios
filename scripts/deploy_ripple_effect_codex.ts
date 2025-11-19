import { ethers } from "hardhat";

/**
 * Deploy RippleEffectCodexLedger contract
 */

async function main() {
  console.log("🌊 Deploying RippleEffectCodexLedger...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get contract factory
  const RippleEffectCodexLedger = await ethers.getContractFactory("RippleEffectCodexLedger");

  // Deploy
  const contract = await RippleEffectCodexLedger.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  
  console.log("\n✅ RippleEffectCodexLedger deployed successfully!");
  console.log("   Contract address:", contractAddress);
  console.log("   Deployer:", deployer.address);
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("   Chain ID:", (await ethers.provider.getNetwork()).chainId);

  // Verify all zones are active
  console.log("\n📍 Verifying zone activation...");
  const zones = [
    "Aquatic Vortex",
    "TropiCore Dome", 
    "Volcanic Rift",
    "Polar Womb",
    "Dimensional Spiral",
    "Galactic Nexus"
  ];

  for (let i = 0; i < zones.length; i++) {
    const isActive = await contract.zoneActive(i);
    console.log(`   ${zones[i]}: ${isActive ? "✓ Active" : "✗ Inactive"}`);
  }

  // Check role assignments
  console.log("\n🔐 Role assignments:");
  const RIPPLE_GENERATOR_ROLE = await contract.RIPPLE_GENERATOR_ROLE();
  const TRIBUNAL_AUDITOR_ROLE = await contract.TRIBUNAL_AUDITOR_ROLE();
  const WATCHTOWER_ROLE = await contract.WATCHTOWER_ROLE();
  const SORA_COMPLIANCE_ROLE = await contract.SORA_COMPLIANCE_ROLE();

  const hasRippleGenerator = await contract.hasRole(RIPPLE_GENERATOR_ROLE, deployer.address);
  const hasTribunalAuditor = await contract.hasRole(TRIBUNAL_AUDITOR_ROLE, deployer.address);
  const hasWatchtower = await contract.hasRole(WATCHTOWER_ROLE, deployer.address);
  const hasSoraCompliance = await contract.hasRole(SORA_COMPLIANCE_ROLE, deployer.address);

  console.log(`   RIPPLE_GENERATOR_ROLE: ${hasRippleGenerator ? "✓" : "✗"}`);
  console.log(`   TRIBUNAL_AUDITOR_ROLE: ${hasTribunalAuditor ? "✓" : "✗"}`);
  console.log(`   WATCHTOWER_ROLE: ${hasWatchtower ? "✓" : "✗"}`);
  console.log(`   SORA_COMPLIANCE_ROLE: ${hasSoraCompliance ? "✓" : "✗"}`);

  console.log("\n📊 Contract stats:");
  const totalRipples = await contract.getTotalRipples();
  const totalLogs = await contract.getTotalLogs();
  console.log(`   Total Ripples: ${totalRipples}`);
  console.log(`   Total Logs: ${totalLogs}`);

  console.log("\n✨ Deployment complete!");
  console.log("\nNext steps:");
  console.log("   1. Run: npx hardhat run scripts/generate_ripple_signatures.ts");
  console.log("   2. Run: python3 scripts/generate_watchtower_ripple_csv.py");
  console.log("   3. Review generated files in data/ directory");

  // Save deployment info
  const fs = require("fs");
  const path = require("path");
  
  const deploymentData = {
    contractAddress,
    deployerAddress: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    zones: zones.map((name, index) => ({ index, name, active: true }))
  };

  const outputPath = path.join(__dirname, "../deployments/ripple_effect_codex_deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log(`\n📝 Deployment info saved to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
