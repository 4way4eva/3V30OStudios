import { ethers } from "hardhat";

async function main() {
  console.log("🌊 Deploying RippleEffectLedger...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);

  // Get the contract factory
  const RippleEffectLedger = await ethers.getContractFactory("RippleEffectLedger");

  // Deploy the contract
  const rippleEffectLedger = await RippleEffectLedger.deploy(deployer.address);

  await rippleEffectLedger.waitForDeployment();

  const address = await rippleEffectLedger.getAddress();
  console.log("✅ RippleEffectLedger deployed to:", address);

  // Log zone signatures
  console.log("\n🌐 Zone Signatures Initialized:");
  const zones = [
    { id: 0, name: "AQUATIC_VORTEX" },
    { id: 1, name: "TROPICORE_DOME" },
    { id: 2, name: "VOLCANIC_RIFT" },
    { id: 3, name: "POLAR_WOMB" },
    { id: 4, name: "DIMENSIONAL_SPIRAL" },
    { id: 5, name: "GALACTIC_NEXUS" }
  ];

  for (const zone of zones) {
    const signature = await rippleEffectLedger.zoneSignatures(zone.id);
    console.log(`\n${zone.name}:`);
    console.log(`  Resonance Pattern: ${signature.resonancePattern}`);
    console.log(`  Amplification Factor: ${signature.amplificationFactor / 100}%`);
    console.log(`  Active: ${signature.isActive}`);
  }

  console.log("\n📝 Deployment Summary:");
  console.log("Contract Address:", address);
  console.log("Admin:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
