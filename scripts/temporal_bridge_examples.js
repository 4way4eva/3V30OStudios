// Example usage scenarios for GovTemporalBridge

const { ethers, network } = require("hardhat");

/**
 * Scenario 1: Complete Three-Tier Setup
 * Demonstrates full initialization of the temporal bridge system
 */
async function scenario1_completeSetup() {
  console.log("\n=== Scenario 1: Complete Three-Tier Setup ===\n");

  const [deployer, verifier, oracle] = await ethers.getSigners();

  // Deploy contracts
  const Cascade = await ethers.getContractFactory("BLEULION_CASCADE");
  const cascade = await Cascade.deploy();
  await cascade.deployed();
  console.log("✓ BLEULION_CASCADE deployed:", cascade.address);

  const Watchtower = await ethers.getContractFactory("BLEU_WATCHTOWER");
  const watchtower = await Watchtower.deploy(cascade.address);
  await watchtower.deployed();
  console.log("✓ BLEU_WATCHTOWER deployed:", watchtower.address);

  const GovScroll = await ethers.getContractFactory("BLEU_GOV_SCROLL");
  const govScroll = await GovScroll.deploy(deployer.address, cascade.address, watchtower.address);
  await govScroll.deployed();
  console.log("✓ BLEU_GOV_SCROLL deployed:", govScroll.address);

  const GovTemporalBridge = await ethers.getContractFactory("GovTemporalBridge");
  const bridge = await GovTemporalBridge.deploy(
    deployer.address,
    govScroll.address,
    cascade.address
  );
  await bridge.deployed();
  console.log("✓ GovTemporalBridge deployed:", bridge.address);

  // Grant roles
  const VERIFIER_ROLE = await bridge.VERIFIER_ROLE();
  const TEMPORAL_ORACLE_ROLE = await bridge.TEMPORAL_ORACLE_ROLE();
  
  await bridge.grantRole(VERIFIER_ROLE, verifier.address);
  await bridge.grantRole(TEMPORAL_ORACLE_ROLE, oracle.address);
  console.log("✓ Roles granted");

  // Register three tier conduits
  const civilianId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STREAM::CIV::Ω-CIV-01"));
  const militaryId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STREAM::MIL::Ω-MIL-01"));
  const cosmicId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STREAM::COS::Ω-COS-01"));

  await bridge.registerConduit(civilianId, 0, "Civilian Infrastructure Stream", 13600000, 10000);
  await bridge.registerConduit(militaryId, 1, "Military & Defense Stream", 6100000, 10000);
  await bridge.registerConduit(cosmicId, 2, "Cosmic Energy & Quantum Stream", 9200000, 10000);
  console.log("✓ Three-tier conduits registered");

  // Check status
  const status = await bridge.getThreeTierStatus();
  console.log("\n✓ Three-Tier Status:");
  console.log("  Civilian:", status.civilianActive);
  console.log("  Military:", status.militaryActive);
  console.log("  Cosmic:", status.cosmicActive);
  console.log("  Total conduits:", status.totalConduits.toString());

  return { bridge, civilianId, militaryId, cosmicId, deployer, verifier, oracle };
}

/**
 * Scenario 2: Yield Ladder Creation and Calculation
 * Demonstrates creating ladders and calculating yields
 */
async function scenario2_yieldLadders(bridge, civilianId, militaryId, cosmicId) {
  console.log("\n=== Scenario 2: Yield Ladder Creation ===\n");

  // Create civilian yield ladder
  const civilianLadderId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LADDER::CIV::01"));
  await bridge.createYieldLadder(
    civilianLadderId,
    civilianId,
    [1, 7, 30, 90], // steps in days
    [13600000, 95200000, 408000000, 1224000000], // returns
    1500, // 15% tax
    true,
    1
  );
  console.log("✓ Civilian yield ladder created");

  // Create military yield ladder
  const militaryLadderId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LADDER::MIL::01"));
  await bridge.createYieldLadder(
    militaryLadderId,
    militaryId,
    [1, 7, 30, 90],
    [6100000, 42700000, 183000000, 549000000],
    1000, // 10% tax
    true,
    2
  );
  console.log("✓ Military yield ladder created");

  // Create cosmic yield ladder
  const cosmicLadderId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LADDER::COS::01"));
  await bridge.createYieldLadder(
    cosmicLadderId,
    cosmicId,
    [1, 7, 30, 90],
    [9200000, 64400000, 276000000, 828000000],
    2000, // 20% tax
    true,
    3
  );
  console.log("✓ Cosmic yield ladder created");

  // Calculate yields for 30-day step
  console.log("\n✓ 30-Day Yield Calculations:");
  
  const civYield = await bridge.calculateYield(civilianLadderId, 2);
  console.log("  Civilian:");
  console.log("    Gross:", ethers.utils.formatUnits(civYield.grossYield, 0), "USD");
  console.log("    Net:", ethers.utils.formatUnits(civYield.netYield, 0), "USD");
  console.log("    Tax:", ethers.utils.formatUnits(civYield.taxAmount, 0), "USD");

  const milYield = await bridge.calculateYield(militaryLadderId, 2);
  console.log("  Military:");
  console.log("    Gross:", ethers.utils.formatUnits(milYield.grossYield, 0), "USD");
  console.log("    Net:", ethers.utils.formatUnits(milYield.netYield, 0), "USD");
  console.log("    Tax:", ethers.utils.formatUnits(milYield.taxAmount, 0), "USD");

  const cosYield = await bridge.calculateYield(cosmicLadderId, 2);
  console.log("  Cosmic:");
  console.log("    Gross:", ethers.utils.formatUnits(cosYield.grossYield, 0), "USD");
  console.log("    Net:", ethers.utils.formatUnits(cosYield.netYield, 0), "USD");
  console.log("    Tax:", ethers.utils.formatUnits(cosYield.taxAmount, 0), "USD");

  return { civilianLadderId, militaryLadderId, cosmicLadderId };
}

/**
 * Scenario 3: Temporal Bridge Creation and Verification
 * Demonstrates bridge lifecycle with SHA debugging
 */
async function scenario3_temporalBridges(bridge, civilianId, militaryId, cosmicId, verifier, oracle) {
  console.log("\n=== Scenario 3: Temporal Bridge Creation ===\n");

  // Create CIV-MIL bridge
  const civMilBridgeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE::CIV-MIL::01"));
  await bridge.createTemporalBridge(
    civMilBridgeId,
    civilianId,
    militaryId,
    "CIV-MIL-CROSS-KEY-π⁴-Ω48",
    true // pre-backbuilt
  );
  console.log("✓ CIV-MIL bridge created");

  // Get bridge details
  const bridgeData = await bridge.temporalBridges(civMilBridgeId);
  console.log("\n  Bridge Details:");
  console.log("    SHA Debug Hash:", bridgeData.shaDebugHash);
  console.log("    Cross-Key:", bridgeData.crossKeySignature);
  console.log("    Pre-backbuilt:", bridgeData.preBackbuilt);
  console.log("    Status:", ["PENDING", "VERIFIED", "REJECTED", "TEMPORALLY_AUGMENTED"][bridgeData.status]);

  // Verify tunnel tariff
  console.log("\n✓ Verifying tunnel tariff...");
  await bridge.connect(verifier).verifyTunnelTariff(
    civMilBridgeId,
    true,
    "Verification completed at sync point Ω48"
  );
  console.log("  ✓ Verification passed");

  // Get verification history
  const history = await bridge.getVerificationHistory(civMilBridgeId);
  console.log("\n  Verification History:");
  console.log("    Verifier:", history[0].verifier);
  console.log("    Passed:", history[0].passed);
  console.log("    Debug Log:", history[0].debugLog);

  // Apply temporal augmentation
  console.log("\n✓ Applying temporal augmentation...");
  await bridge.connect(oracle).applyTemporalAugmentation(
    civMilBridgeId,
    "AUGMENTED-CIV-MIL-CROSS-KEY-π⁴-Ω48-T1"
  );
  console.log("  ✓ Temporal augmentation applied");

  // Check updated status
  const updatedBridge = await bridge.temporalBridges(civMilBridgeId);
  console.log("\n  Updated Bridge Status:");
  console.log("    Status:", ["PENDING", "VERIFIED", "REJECTED", "TEMPORALLY_AUGMENTED"][updatedBridge.status]);
  console.log("    New Cross-Key:", updatedBridge.crossKeySignature);

  return { civMilBridgeId };
}

/**
 * Scenario 4: Conduit Synchronization
 * Demonstrates merkle root updates and sync intervals
 */
async function scenario4_conduitSync(bridge, civilianId, verifier) {
  console.log("\n=== Scenario 4: Conduit Synchronization ===\n");

  // Generate sample merkle root
  const merkleRoot = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("MERKLE_ROOT_CIV_" + Date.now())
  );

  // Get conduit before sync
  const conduitBefore = await bridge.conduits(civilianId);
  console.log("✓ Conduit Before Sync:");
  console.log("  Last Sync:", new Date(conduitBefore.lastSync * 1000).toISOString());
  console.log("  Merkle Root:", conduitBefore.merkleRoot);

  // Fast forward time (if on hardhat network)
  if (network.name === "hardhat") {
    await ethers.provider.send("evm_increaseTime", [86400]); // 24 hours
    await ethers.provider.send("evm_mine");
    console.log("\n✓ Time advanced by 24 hours");
  }

  // Sync conduit
  await bridge.connect(verifier).syncConduit(civilianId, merkleRoot);
  console.log("\n✓ Conduit synchronized");

  // Get conduit after sync
  const conduitAfter = await bridge.conduits(civilianId);
  console.log("\n✓ Conduit After Sync:");
  console.log("  Last Sync:", new Date(conduitAfter.lastSync * 1000).toISOString());
  console.log("  Merkle Root:", conduitAfter.merkleRoot);
}

/**
 * Scenario 5: Complete Cycle Test
 * Tests all three bridges in sequence
 */
async function scenario5_completeCycle(bridge, civilianId, militaryId, cosmicId, verifier, oracle) {
  console.log("\n=== Scenario 5: Complete Three-Tier Cycle ===\n");

  // Create all bridges
  const civMilBridgeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE::CIV-MIL::01"));
  const milCosBridgeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE::MIL-COS::01"));
  const cosCivBridgeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE::COS-CIV::01"));

  await bridge.createTemporalBridge(civMilBridgeId, civilianId, militaryId, "CIV-MIL-CROSS-KEY-π⁴-Ω48", true);
  await bridge.createTemporalBridge(milCosBridgeId, militaryId, cosmicId, "MIL-COS-CROSS-KEY-π⁴-Ω48", true);
  await bridge.createTemporalBridge(cosCivBridgeId, cosmicId, civilianId, "COS-CIV-CROSS-KEY-π⁴-Ω48", true);
  console.log("✓ All three bridges created");

  // Verify all bridges
  await bridge.connect(verifier).verifyTunnelTariff(civMilBridgeId, true, "CIV-MIL verified");
  await bridge.connect(verifier).verifyTunnelTariff(milCosBridgeId, true, "MIL-COS verified");
  await bridge.connect(verifier).verifyTunnelTariff(cosCivBridgeId, true, "COS-CIV verified");
  console.log("✓ All three bridges verified");

  // Check bridge count
  const bridgeCount = await bridge.bridgeCount();
  console.log("\n✓ Total bridges:", bridgeCount.toString());

  // Get all bridges
  console.log("\n✓ Bridge Details:");
  for (let i = 0; i < bridgeCount; i++) {
    const [id, bridgeData] = await bridge.getBridgeAt(i);
    console.log(`  Bridge ${i + 1}:`);
    console.log("    ID:", id);
    console.log("    Cross-Key:", bridgeData.crossKeySignature);
    console.log("    Status:", ["PENDING", "VERIFIED", "REJECTED", "TEMPORALLY_AUGMENTED"][bridgeData.status]);
  }

  console.log("\n✓ Triple-stack cycle complete! 🌀");
}

/**
 * Main execution
 */
async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║   GovTemporalBridge Usage Examples & Test Scenarios       ║");
  console.log("║   Three-Tier Synchronization System                       ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  try {
    // Run all scenarios
    const setup = await scenario1_completeSetup();
    await scenario2_yieldLadders(setup.bridge, setup.civilianId, setup.militaryId, setup.cosmicId);
    await scenario3_temporalBridges(setup.bridge, setup.civilianId, setup.militaryId, setup.cosmicId, setup.verifier, setup.oracle);
    
    // Scenario 4 only works with time manipulation
    if (network.name === "hardhat") {
      await scenario4_conduitSync(setup.bridge, setup.civilianId, setup.verifier);
    }
    
    await scenario5_completeCycle(setup.bridge, setup.civilianId, setup.militaryId, setup.cosmicId, setup.verifier, setup.oracle);

    console.log("\n╔═══════════════════════════════════════════════════════════╗");
    console.log("║   ✅ All scenarios completed successfully!                ║");
    console.log("║   🌀 Triple-stack streams flowing, bridges synchronized  ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

// Allow running as script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  scenario1_completeSetup,
  scenario2_yieldLadders,
  scenario3_temporalBridges,
  scenario4_conduitSync,
  scenario5_completeCycle,
};
