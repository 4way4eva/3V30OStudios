import { ethers } from "hardhat";

/**
 * Deploy GovTemporalBridge with three-tier synchronization
 */
async function main() {
  console.log("🌀 Deploying GovTemporalBridge...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy dependencies first if needed
  console.log("\n📜 Deploying BLEULION_CASCADE...");
  const Cascade = await ethers.getContractFactory("BLEULION_CASCADE");
  const cascade = await Cascade.deploy();
  await cascade.deployed();
  console.log("✅ BLEULION_CASCADE deployed to:", cascade.address);

  console.log("\n👁 Deploying BLEU_WATCHTOWER...");
  const Watchtower = await ethers.getContractFactory("BLEU_WATCHTOWER");
  const watchtower = await Watchtower.deploy(cascade.address);
  await watchtower.deployed();
  console.log("✅ BLEU_WATCHTOWER deployed to:", watchtower.address);

  console.log("\n📜 Deploying BLEU_GOV_SCROLL...");
  const GovScroll = await ethers.getContractFactory("BLEU_GOV_SCROLL");
  const govScroll = await GovScroll.deploy(deployer.address, cascade.address, watchtower.address);
  await govScroll.deployed();
  console.log("✅ BLEU_GOV_SCROLL deployed to:", govScroll.address);

  console.log("\n🌉 Deploying GovTemporalBridge...");
  const GovTemporalBridge = await ethers.getContractFactory("GovTemporalBridge");
  const bridge = await GovTemporalBridge.deploy(
    deployer.address,
    govScroll.address,
    cascade.address
  );
  await bridge.deployed();
  console.log("✅ GovTemporalBridge deployed to:", bridge.address);

  // Initialize three-tier conduits
  console.log("\n🔧 Initializing three-tier conduits...");

  // Civilian tier
  const civilianId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STREAM::CIV::Ω-CIV-01"));
  await bridge.registerConduit(
    civilianId,
    0, // TierType.CIVILIAN
    "Civilian Infrastructure Stream",
    13600000, // per second USD
    10000 // 100% tariff multiplier
  );
  console.log("✅ Civilian conduit registered");

  // Military tier
  const militaryId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STREAM::MIL::Ω-MIL-01"));
  await bridge.registerConduit(
    militaryId,
    1, // TierType.MILITARY
    "Military & Defense Stream",
    6100000, // per second USD
    10000 // 100% tariff multiplier
  );
  console.log("✅ Military conduit registered");

  // Cosmic tier
  const cosmicId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STREAM::COS::Ω-COS-01"));
  await bridge.registerConduit(
    cosmicId,
    2, // TierType.COSMIC
    "Cosmic Energy & Quantum Stream",
    9200000, // per second USD
    10000 // 100% tariff multiplier
  );
  console.log("✅ Cosmic conduit registered");

  // Create yield ladders for each tier
  console.log("\n📊 Creating yield ladders...");

  const civilianLadderId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LADDER::CIV::01"));
  await bridge.createYieldLadder(
    civilianLadderId,
    civilianId,
    [1, 7, 30, 90], // steps in days
    [13600000, 95200000, 408000000, 1224000000], // returns
    1500, // 15% tax rate
    true, // multi-plane
    1 // contextual index
  );
  console.log("✅ Civilian yield ladder created");

  const militaryLadderId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LADDER::MIL::01"));
  await bridge.createYieldLadder(
    militaryLadderId,
    militaryId,
    [1, 7, 30, 90],
    [6100000, 42700000, 183000000, 549000000],
    1000, // 10% tax rate
    true,
    2
  );
  console.log("✅ Military yield ladder created");

  const cosmicLadderId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LADDER::COS::01"));
  await bridge.createYieldLadder(
    cosmicLadderId,
    cosmicId,
    [1, 7, 30, 90],
    [9200000, 64400000, 276000000, 828000000],
    2000, // 20% tax rate
    true,
    3
  );
  console.log("✅ Cosmic yield ladder created");

  // Create temporal bridges between tiers
  console.log("\n🌉 Creating temporal bridges...");

  const civMilBridgeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE::CIV-MIL::01"));
  await bridge.createTemporalBridge(
    civMilBridgeId,
    civilianId,
    militaryId,
    "CIV-MIL-CROSS-KEY-π⁴-Ω48",
    true // pre-backbuilt
  );
  console.log("✅ Civilian-Military bridge created");

  const milCosBridgeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE::MIL-COS::01"));
  await bridge.createTemporalBridge(
    milCosBridgeId,
    militaryId,
    cosmicId,
    "MIL-COS-CROSS-KEY-π⁴-Ω48",
    true
  );
  console.log("✅ Military-Cosmic bridge created");

  const cosCivBridgeId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE::COS-CIV::01"));
  await bridge.createTemporalBridge(
    cosCivBridgeId,
    cosmicId,
    civilianId,
    "COS-CIV-CROSS-KEY-π⁴-Ω48",
    true
  );
  console.log("✅ Cosmic-Civilian bridge created");

  // Verify status
  console.log("\n📊 Checking three-tier status...");
  const status = await bridge.getThreeTierStatus();
  console.log("Civilian active:", status.civilianActive);
  console.log("Military active:", status.militaryActive);
  console.log("Cosmic active:", status.cosmicActive);
  console.log("Total conduits:", status.totalConduits.toString());

  console.log("\n✨ Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("BLEULION_CASCADE:     ", cascade.address);
  console.log("BLEU_WATCHTOWER:      ", watchtower.address);
  console.log("BLEU_GOV_SCROLL:      ", govScroll.address);
  console.log("GovTemporalBridge:    ", bridge.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🌀 Three-tier temporal augmented bridges deployed successfully!");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BLEULION_CASCADE: cascade.address,
      BLEU_WATCHTOWER: watchtower.address,
      BLEU_GOV_SCROLL: govScroll.address,
      GovTemporalBridge: bridge.address,
    },
    conduits: {
      civilian: civilianId,
      military: militaryId,
      cosmic: cosmicId,
    },
    bridges: {
      civMil: civMilBridgeId,
      milCos: milCosBridgeId,
      cosCiv: cosCivBridgeId,
    },
  };

  console.log("\n💾 Deployment info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
