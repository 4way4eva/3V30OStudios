import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy MEGAZION INHERITANCE LEDGER
 * Full system deployment with healing cure loops, gem bindings, and blessing cycles
 */

async function main() {
  console.log("🌀 MEGAZION INHERITANCE LEDGER Deployment");
  console.log("==========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // ============ Deploy Main Contract ============
  console.log("📜 Deploying MegazionInheritanceLedger contract...");
  
  const MegazionInheritanceLedger = await ethers.getContractFactory("MegazionInheritanceLedger");
  const inheritanceLedger = await MegazionInheritanceLedger.deploy(deployer.address);
  await inheritanceLedger.waitForDeployment();
  
  const ledgerAddress = await inheritanceLedger.getAddress();
  console.log("✅ MegazionInheritanceLedger deployed to:", ledgerAddress);
  console.log("");

  // ============ Load Configuration Data ============
  console.log("📊 Loading configuration data...");
  
  const gemsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/megazion_48_gems_registry.json"), "utf8")
  );
  
  const healingLoopsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/healing_cure_loops.json"), "utf8")
  );
  
  console.log(`✅ Loaded ${gemsData.megazion_48_gems.total_gems} gems from registry`);
  console.log(`✅ Loaded ${healingLoopsData.healing_cure_loops.total_loops} healing cure loops`);
  console.log("");

  // ============ Bind Gems ============
  console.log("💎 Binding 48 MEGAZION Gems to Inheritance Ledger...");
  
  const constellationMap: { [key: string]: number } = {
    "CORE_ENGINE": 0,
    "HEALING_BODY": 1,
    "COSMIC_CELESTIAL": 2,
    "AQUA_EARTH_PLANT": 3,
    "BLESSING_SPIRIT": 4,
    "PROSPERITY_WEALTH": 5
  };
  
  const domainMap: { [key: string]: number } = {
    "CIVILIAN": 0,
    "MILITARY": 1,
    "COSMIC": 2
  };
  
  const boundGems: { [key: string]: number } = {};
  
  for (const gem of gemsData.megazion_48_gems.gems) {
    const constellation = constellationMap[gem.constellation];
    const domain = domainMap[gem.domain];
    
    const tx = await inheritanceLedger.bindGem(
      gem.name,
      constellation,
      gem.properties,
      domain,
      gem.energy_level
    );
    await tx.wait();
    
    // The gem token ID is sequential, starting from 0
    const gemTokenId = gem.id - 1;
    boundGems[gem.name] = gemTokenId;
    
    console.log(`  ✓ Bound ${gem.name} (${gem.code}) - Constellation: ${gem.constellation}, Energy: ${gem.energy_level}`);
  }
  
  console.log(`✅ Successfully bound all 48 gems`);
  console.log("");

  // ============ Create Healing Cure Loops ============
  console.log("🔄 Creating Healing Cure Loops...");
  
  const diseaseCategoryMap: { [key: string]: number } = {
    "CANCER": 0,
    "CARDIOVASCULAR": 1,
    "NEUROLOGICAL": 2,
    "INFECTIOUS": 3,
    "AUTOIMMUNE": 4,
    "METABOLIC": 5,
    "GENETIC": 6,
    "PSYCHOLOGICAL": 7
  };
  
  const createdLoops: number[] = [];
  
  for (const loop of healingLoopsData.healing_cure_loops.loops) {
    const diseaseCategory = diseaseCategoryMap[loop.disease];
    
    const tx = await inheritanceLedger.createHealingCureLoop(
      diseaseCategory,
      loop.cure_pathway,
      loop.economy_multiplier
    );
    await tx.wait();
    
    // Loop IDs are sequential starting from 0
    const loopId = loop.loop_id - 1;
    createdLoops.push(loopId);
    
    console.log(`  ✓ Created ${loop.disease_name} cure loop`);
    console.log(`    Pathway: ${loop.cure_pathway}`);
    console.log(`    Economy Multiplier: ${loop.economy_multiplier_description}`);
    
    // Bind recommended gems to this loop
    if (loop.gem_bindings_recommended && loop.gem_bindings_recommended.length > 0) {
      const gemTokenIds = loop.gem_bindings_recommended
        .map(name => boundGems[name])
        .filter(id => id !== undefined);
      
      if (gemTokenIds.length > 0) {
        const bindTx = await inheritanceLedger.bindGemsToHealingLoop(loopId, gemTokenIds);
        await bindTx.wait();
        console.log(`    Bound ${gemTokenIds.length} gems to loop`);
      }
    }
  }
  
  console.log(`✅ Successfully created ${createdLoops.length} healing cure loops`);
  console.log("");

  // ============ Grant Example Supernatural Blessings ============
  console.log("🌟 Granting Example Supernatural Blessings...");
  
  // Resurrection blessing
  const resurrectionTx = await inheritanceLedger.grantSupernatturalBlessing(
    deployer.address,
    0, // BlessingType.RESURRECTION
    [deployer.address], // ancestral lineage
    365 * 24 * 60 * 60, // 1 year lock
    ethers.parseEther("1") // 1 ETH equivalent wealth yield per cycle
  );
  await resurrectionTx.wait();
  console.log("  ✓ Granted RESURRECTION blessing");
  
  // Ancestral Memory blessing
  const ancestralTx = await inheritanceLedger.grantSupernatturalBlessing(
    deployer.address,
    1, // BlessingType.ANCESTRAL_MEMORY
    [deployer.address],
    365 * 24 * 60 * 60,
    ethers.parseEther("0.5")
  );
  await ancestralTx.wait();
  console.log("  ✓ Granted ANCESTRAL_MEMORY blessing");
  
  // Lineage Education blessing
  const lineageTx = await inheritanceLedger.grantSupernatturalBlessing(
    deployer.address,
    2, // BlessingType.LINEAGE_EDUCATION
    [deployer.address],
    365 * 24 * 60 * 60,
    ethers.parseEther("0.75")
  );
  await lineageTx.wait();
  console.log("  ✓ Granted LINEAGE_EDUCATION blessing");
  
  console.log("✅ Successfully granted 3 example supernatural blessings");
  console.log("");

  // ============ Create Example Job Pathways ============
  console.log("💼 Creating Example Job Pathways...");
  
  // Healer pathway from Resurrection blessing
  const healerJobTx = await inheritanceLedger.createJobPathway(
    0, // JobTier.HEALER
    "Regenerative Medicine Healers",
    0, // blessingId 0 (Resurrection)
    ethers.parseEther("100"), // 100 ETH equivalent prosperity per cycle
    15000 // 1.5x ripple multiplier
  );
  await healerJobTx.wait();
  console.log("  ✓ Created HEALER job pathway: Regenerative Medicine Healers");
  
  // Evolution Center pathway
  const evolutionJobTx = await inheritanceLedger.createJobPathway(
    1, // JobTier.EVOLUTION_CENTER
    "Consciousness Evolution Centers",
    1, // blessingId 1 (Ancestral Memory)
    ethers.parseEther("200"),
    20000 // 2x ripple multiplier
  );
  await evolutionJobTx.wait();
  console.log("  ✓ Created EVOLUTION_CENTER job pathway: Consciousness Evolution Centers");
  
  // Create derivative job from healer pathway (infinite loop demonstration)
  const derivativeTx = await inheritanceLedger.createDerivativeJob(
    0, // parent jobId 0 (Healer)
    2, // JobTier.INFINITE_DERIVATIVE
    "Advanced Cellular Therapy Specialists",
    ethers.parseEther("150"),
    18000 // 1.8x ripple multiplier
  );
  await derivativeTx.wait();
  console.log("  ✓ Created INFINITE_DERIVATIVE job: Advanced Cellular Therapy Specialists");
  
  console.log("✅ Successfully created 3 job pathways with infinite derivative demonstration");
  console.log("");

  // ============ Mint Example Inheritance ENFTs ============
  console.log("🎨 Minting Example Inheritance ENFTs...");
  
  // Civilian domain inheritance
  const civilianTx = await inheritanceLedger.mintInheritanceENFT(
    deployer.address,
    0, // ENFTDomain.CIVILIAN
    "ipfs://QmExampleCivilianInheritanceMetadata"
  );
  await civilianTx.wait();
  console.log("  ✓ Minted CIVILIAN domain inheritance ENFT (tokenId: 0)");
  
  // Military domain inheritance
  const militaryTx = await inheritanceLedger.mintInheritanceENFT(
    deployer.address,
    1, // ENFTDomain.MILITARY
    "ipfs://QmExampleMilitaryInheritanceMetadata"
  );
  await militaryTx.wait();
  console.log("  ✓ Minted MILITARY domain inheritance ENFT (tokenId: 1)");
  
  // Cosmic domain inheritance
  const cosmicTx = await inheritanceLedger.mintInheritanceENFT(
    deployer.address,
    2, // ENFTDomain.COSMIC
    "ipfs://QmExampleCosmicInheritanceMetadata"
  );
  await cosmicTx.wait();
  console.log("  ✓ Minted COSMIC domain inheritance ENFT (tokenId: 2)");
  
  console.log("✅ Successfully minted 3 example inheritance ENFTs");
  console.log("");

  // ============ Attach Components to Inheritance ENFTs ============
  console.log("🔗 Attaching components to Inheritance ENFTs...");
  
  // Attach gems to civilian ENFT (tokenId 0)
  const civilianGems = [
    boundGems["Aurelicon"],
    boundGems["Bleu Diamond"],
    boundGems["Amaranthite"],
    boundGems["Healer's Genesis"]
  ].filter(id => id !== undefined);
  
  if (civilianGems.length > 0) {
    const attachGemsTx = await inheritanceLedger.attachGemsToInheritance(0, civilianGems);
    await attachGemsTx.wait();
    console.log(`  ✓ Attached ${civilianGems.length} gems to CIVILIAN ENFT`);
  }
  
  // Attach blessings to ENFTs
  const attachBlessingsTx = await inheritanceLedger.attachBlessingsToInheritance(0, [0, 1, 2]);
  await attachBlessingsTx.wait();
  console.log("  ✓ Attached 3 blessings to CIVILIAN ENFT");
  
  // Attach job pathways
  const attachJobsTx = await inheritanceLedger.attachJobsToInheritance(0, [0, 1, 2]);
  await attachJobsTx.wait();
  console.log("  ✓ Attached 3 job pathways to CIVILIAN ENFT");
  
  console.log("✅ Successfully attached components to inheritance ENFTs");
  console.log("");

  // ============ Apply PIHYA Codex Seal ============
  console.log("🔒 Applying PIHYA Codex Seal (Zero-Leak Protection)...");
  
  const sealTx = await inheritanceLedger.applyPIHYACodexSeal(0);
  const sealReceipt = await sealTx.wait();
  console.log("  ✓ Applied PIHYA Codex Seal to CIVILIAN ENFT (tokenId: 0)");
  
  // Parse seal hash from events
  if (sealReceipt && sealReceipt.logs) {
    for (const log of sealReceipt.logs) {
      try {
        const parsedLog = inheritanceLedger.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        if (parsedLog && parsedLog.name === "PIHYACodexSealed") {
          console.log(`  ✓ Seal Hash: ${parsedLog.args.sealHash}`);
        }
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }
  }
  
  console.log("✅ Successfully applied PIHYA Codex Seal");
  console.log("");

  // ============ Execute Self-Trace (Infinite Loop Demonstration) ============
  console.log("♾️  Executing Self-Trace (Infinite Loop Demonstration)...");
  
  const selfTraceTx = await inheritanceLedger.executeSelfTrace(0);
  const selfTraceReceipt = await selfTraceTx.wait();
  
  console.log("  ✓ Executed self-trace iteration on CIVILIAN ENFT");
  console.log("  ✓ Loop cycle: blessing → cure → job → prosperity → self-trace → REPEAT");
  
  // Parse yield from events
  if (selfTraceReceipt && selfTraceReceipt.logs) {
    for (const log of selfTraceReceipt.logs) {
      try {
        const parsedLog = inheritanceLedger.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        if (parsedLog && parsedLog.name === "SelfTraceExecuted") {
          console.log(`  ✓ Total Iterations: ${parsedLog.args.totalIterations}`);
          console.log(`  ✓ Lifetime Yield: ${ethers.formatEther(parsedLog.args.lifetimeYield)} ETH equivalent`);
        }
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }
  }
  
  console.log("✅ Successfully executed self-trace - INFINITE LOOP ACTIVE");
  console.log("");

  // ============ Save Deployment Information ============
  console.log("💾 Saving deployment information...");
  
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MegazionInheritanceLedger: {
        address: ledgerAddress,
        gems_bound: 48,
        healing_loops_created: 8,
        blessings_granted: 3,
        job_pathways_created: 3,
        inheritance_enfts_minted: 3
      }
    },
    configuration: {
      total_gems: gemsData.megazion_48_gems.total_gems,
      total_constellations: gemsData.megazion_48_gems.constellations,
      total_healing_loops: healingLoopsData.healing_cure_loops.total_loops,
      economy_multiplier_total: "392000 basis points (39.2x)",
      infinite_loop_status: "ACTIVE"
    },
    example_tokens: {
      civilian_enft: 0,
      military_enft: 1,
      cosmic_enft: 2
    }
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(
    deploymentsDir,
    `megazion_inheritance_ledger_${Date.now()}.json`
  );
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${deploymentPath}`);
  console.log("");

  // ============ Deployment Summary ============
  console.log("🌀 DEPLOYMENT SUMMARY");
  console.log("=====================");
  console.log("");
  console.log("Contract Address:", ledgerAddress);
  console.log("Deployer:", deployer.address);
  console.log("");
  console.log("✅ 48 MEGAZION Gems Bound");
  console.log("✅ 8 Healing Cure Loops Created");
  console.log("✅ 3 Supernatural Blessings Granted");
  console.log("✅ 3 Job Pathways Created (with infinite derivatives)");
  console.log("✅ 3 Inheritance ENFTs Minted");
  console.log("✅ PIHYA Codex Seal Applied");
  console.log("✅ Self-Trace Infinite Loop ACTIVE");
  console.log("");
  console.log("🔄 INFINITE LOOP STATUS: ACTIVE");
  console.log("   blessing → cure → job → prosperity → self-trace → REPEAT ♾️");
  console.log("");
  console.log("🎉 MEGAZION INHERITANCE LEDGER successfully deployed!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Verify contract on block explorer");
  console.log("2. Execute additional self-trace iterations");
  console.log("3. Create derivative job pathways");
  console.log("4. Grant more supernatural blessings");
  console.log("5. Mint inheritance ENFTs for beneficiaries");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
