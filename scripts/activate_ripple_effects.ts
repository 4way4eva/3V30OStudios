import { ethers } from "hardhat";

async function main() {
  console.log("🌊 Activating Ripple Effects...");

  const [activator] = await ethers.getSigners();
  console.log("Activating from account:", activator.address);

  // Get the deployed contract address (you'll need to update this after deployment)
  const rippleEffectLedgerAddress = process.env.RIPPLE_EFFECT_LEDGER_ADDRESS || "";
  
  if (!rippleEffectLedgerAddress) {
    console.error("❌ Please set RIPPLE_EFFECT_LEDGER_ADDRESS environment variable");
    process.exit(1);
  }

  const RippleEffectLedger = await ethers.getContractFactory("RippleEffectLedger");
  const rippleEffectLedger = RippleEffectLedger.attach(rippleEffectLedgerAddress);

  console.log("Connected to RippleEffectLedger at:", rippleEffectLedgerAddress);

  // Example: Activate ripple for Dimensional Spiral Port
  console.log("\n🌀 Activating Ripple for Dimensional Spiral Port...");

  const tx = await rippleEffectLedger.activateRipple(
    "Dimensional Spiral Port",
    "0x43dC17dF7919D25c06a01D52aAad94718C6bf87c", // Example contract address
    5, // ShardType.ARTIFACT
    4, // Zone.DIMENSIONAL_SPIRAL
    0, // Umbrella.SORA
    ethers.keccak256(ethers.toUtf8Bytes("DIMENSIONAL_SPIRAL_PORT_CEREMONIAL_HASH"))
  );

  const receipt = await tx.wait();
  console.log("✅ Ripple activated! Transaction hash:", receipt.hash);

  // Get the ripple ID from the event
  const rippleActivatedEvent = receipt.logs.find(
    (log: any) => log.topics[0] === ethers.id("RippleActivated(uint256,string,address,uint8,uint8,uint256,bytes32)")
  );

  if (rippleActivatedEvent) {
    const rippleId = BigInt(rippleActivatedEvent.topics[1]);
    console.log("Ripple ID:", rippleId.toString());

    // Add echoes to the ripple
    console.log("\n📡 Adding echoes to the ripple...");
    
    await rippleEffectLedger.addEcho(rippleId, "Echo across Healing shards");
    console.log("✅ Added echo: Echo across Healing shards");
    
    await rippleEffectLedger.addEcho(rippleId, "Amplification in Gem Scrolls");
    console.log("✅ Added echo: Amplification in Gem Scrolls");
    
    await rippleEffectLedger.addEcho(rippleId, "Memory seal in Pulse Archive");
    console.log("✅ Added echo: Memory seal in Pulse Archive");

    // Amplify the ripple through SORA
    console.log("\n⚡ Amplifying ripple through SORA Umbrella...");
    await rippleEffectLedger.amplifyRipple(rippleId);
    console.log("✅ Ripple amplified!");

    // Record audit echo
    console.log("\n📋 Recording audit echo in Watchtower...");
    const auditHash = ethers.keccak256(
      ethers.toUtf8Bytes("Audit entry for Dimensional Spiral Port - " + new Date().toISOString())
    );
    const watchtowerEntry = `${new Date().toISOString()},DIMENSIONAL_SPIRAL_PORT,${rippleId},ACTIVATED,SORA,GREEN_TIER`;
    
    await rippleEffectLedger.recordAuditEcho(rippleId, auditHash, watchtowerEntry);
    console.log("✅ Audit echo recorded!");

    // Archive pulse
    console.log("\n💾 Archiving electromagnetic pulse...");
    const pulseData = ethers.toUtf8Bytes(JSON.stringify({
      rippleId: rippleId.toString(),
      timestamp: new Date().toISOString(),
      zone: "DIMENSIONAL_SPIRAL",
      electromagnetic_signature: "QUANTUM_ENTANGLEMENT_PATTERN_01",
      frequency: "432Hz",
      amplitude: "HIGH"
    }));
    
    await rippleEffectLedger.archivePulse(rippleId, pulseData);
    console.log("✅ Pulse archived!");

    // Get complete ripple trace
    console.log("\n🔍 Retrieving complete ripple trace...");
    const [event_, effect, lineage] = await rippleEffectLedger.getRippleTrace(rippleId);

    console.log("\n📊 Complete Ripple Trace:");
    console.log(JSON.stringify({
      event: "Ripple Activation",
      rippleId: rippleId.toString(),
      origin_shard: event_.originShard,
      contract_address: event_.contractAddress,
      zone: getZoneName(Number(event_.zone)),
      umbrella: getUmbrellaName(Number(event_.umbrella)),
      timestamp: new Date(Number(event_.timestamp) * 1000).toISOString(),
      ripple_signature: event_.rippleSignature,
      is_amplified: event_.isAmplified,
      density_score: event_.densityScore.toString(),
      effect: {
        echoes: effect.echoes,
        audit_entries: effect.auditEntries.length,
        pulse_archive_hash: effect.pulseArchiveHash,
        interlink_count: effect.interlinkCount.toString(),
        impact_score: effect.impactScore.toString(),
        is_sealed: effect.isSealed
      },
      lineage: {
        ancestral_root: lineage.ancestralRoot,
        generation_depth: lineage.generationDepth.toString(),
        style_signature: lineage.styleSignature,
        parent_ripples: lineage.parentRipples.length,
        child_ripples: lineage.childRipples.length
      }
    }, null, 2));
  }

  console.log("\n✅ Ripple activation complete!");
}

function getZoneName(zoneId: number): string {
  const zones = [
    "AQUATIC_VORTEX",
    "TROPICORE_DOME",
    "VOLCANIC_RIFT",
    "POLAR_WOMB",
    "DIMENSIONAL_SPIRAL",
    "GALACTIC_NEXUS"
  ];
  return zones[zoneId] || "UNKNOWN";
}

function getUmbrellaName(umbrellaId: number): string {
  const umbrellas = ["SORA", "BLEULION", "WATCHTOWER", "TEMPORAL"];
  return umbrellas[umbrellaId] || "UNKNOWN";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
