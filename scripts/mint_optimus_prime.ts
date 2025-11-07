import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Mint OPTINUS PRIME Heritage Tokens
 * 
 * This script handles the ceremonial minting of OPTINUS PRIME ENFTs
 * following the 9-step assembly protocol.
 */

// Assembly stages enum matching contract
enum AssemblyStage {
  INVOCATION = 0,
  CORE_PLACEMENT = 1,
  WINDING = 2,
  INSULATION = 3,
  COOLING_INTEGRATION = 4,
  INTERFACE_INTEGRATION = 5,
  ENCLOSURE = 6,
  CALIBRATION = 7,
  FINAL_BLESSING = 8,
}

// Deployment permissions enum matching contract
enum DeploymentPermission {
  CURRICULUM = 0,
  CINEMATIC = 1,
  TRIBUNAL = 2,
  INFRASTRUCTURE = 3,
  MILITARY = 4,
  AGRICULTURAL = 5,
}

interface MintConfig {
  recipient: string;
  ancestralHash: string;
  tokenURI: string;
  parentTokenId: number;
  deploymentPermissions: DeploymentPermission[];
}

async function main() {
  console.log("🌀 OPTINUS PRIME Ceremonial Minting Ritual Commencing...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Ritual Conductor:", deployer.address);

  // Load contract address from latest deployment
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFiles = fs
    .readdirSync(deploymentsDir)
    .filter((f) => f.startsWith("optimus-prime-enft-"))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    throw new Error("No deployment found. Please deploy contract first.");
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, deploymentFiles[0]), "utf-8")
  );

  const contractAddress = latestDeployment.contracts.OptimusPrimeENFT.address;
  console.log("OptimusPrimeENFT Address:", contractAddress);

  // Attach to contract
  const OptimusPrimeENFT = await ethers.getContractFactory("OptimusPrimeENFT");
  const contract = OptimusPrimeENFT.attach(contractAddress);

  // Example mint configurations
  // In production, these would come from a CSV or JSON file
  const mintConfigs: MintConfig[] = [
    {
      recipient: deployer.address,
      ancestralHash: ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("Genesis_Optimus_Prime_Lineage_Alpha")
      ),
      tokenURI: "ipfs://QmOptimus1/metadata.json",
      parentTokenId: 0, // Root token
      deploymentPermissions: [
        DeploymentPermission.CURRICULUM,
        DeploymentPermission.CINEMATIC,
        DeploymentPermission.TRIBUNAL,
      ],
    },
  ];

  console.log(`\n📜 Beginning ceremonial mint for ${mintConfigs.length} transformer(s)...\n`);

  for (let i = 0; i < mintConfigs.length; i++) {
    const config = mintConfigs[i];

    console.log(`\n${"=".repeat(60)}`);
    console.log(`Transformer ${i + 1} of ${mintConfigs.length}`);
    console.log("=".repeat(60));

    // Stage 1: Invocation and Minting
    console.log("\n🔷 Stage 1: Invocation and Blessing of Components");
    console.log("  Recipient:", config.recipient);
    console.log("  Ancestral Hash:", config.ancestralHash);

    const mintTx = await contract.mintTransformer(
      config.recipient,
      config.ancestralHash,
      config.tokenURI,
      config.parentTokenId
    );
    const mintReceipt = await mintTx.wait();

    // Extract token ID from event
    const transferEvent = mintReceipt.events?.find(
      (e: any) => e.event === "Transfer"
    );
    const tokenId = transferEvent?.args?.tokenId;

    console.log("  ✅ Token ID:", tokenId.toString());
    console.log("  Transaction:", mintTx.hash);

    // Complete assembly stages
    console.log("\n🔧 Completing Assembly Stages...");

    const stages = [
      { stage: AssemblyStage.CORE_PLACEMENT, name: "Core Placement and Scroll Axis Alignment" },
      { stage: AssemblyStage.WINDING, name: "Winding the Bands of Transmission" },
      { stage: AssemblyStage.INSULATION, name: "Insulation and Sanctification" },
      { stage: AssemblyStage.COOLING_INTEGRATION, name: "Integrating Oil, Cooling, and Sensors" },
      { stage: AssemblyStage.INTERFACE_INTEGRATION, name: "Interface and Conduit Integration" },
      { stage: AssemblyStage.ENCLOSURE, name: "Enclosure, Sealing, and Scroll Embedding" },
      { stage: AssemblyStage.CALIBRATION, name: "Calibration, Testing, Ritual Validation" },
      { stage: AssemblyStage.FINAL_BLESSING, name: "Final Blessing and Lineage Activation" },
    ];

    for (const { stage, name } of stages) {
      console.log(`\n  🔷 Stage ${stage + 1}: ${name}`);

      // Generate ceremonial signature for this stage
      const currentBlock = await ethers.provider.getBlock("latest");
      const ceremorialSignature = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint8", "uint256", "address"],
          [tokenId, stage, currentBlock.timestamp, deployer.address]
        )
      );

      const stageTx = await contract.completeAssemblyStage(
        tokenId,
        stage,
        ceremorialSignature
      );
      await stageTx.wait();

      console.log("    ✅ Stage complete");
    }

    // Activate lineage after final blessing
    console.log("\n🌟 Activating Lineage...");
    const activateTx = await contract.activateLineage(tokenId);
    await activateTx.wait();
    console.log("  ✅ Lineage activated");

    // Set deployment permissions
    console.log("\n🔐 Setting Deployment Permissions...");
    for (const permission of config.deploymentPermissions) {
      const permTx = await contract.setDeploymentPermission(
        tokenId,
        permission,
        true
      );
      await permTx.wait();

      const permissionNames = {
        [DeploymentPermission.CURRICULUM]: "Curriculum",
        [DeploymentPermission.CINEMATIC]: "Cinematic",
        [DeploymentPermission.TRIBUNAL]: "Tribunal",
        [DeploymentPermission.INFRASTRUCTURE]: "Infrastructure",
        [DeploymentPermission.MILITARY]: "Military",
        [DeploymentPermission.AGRICULTURAL]: "Agricultural",
      };

      console.log(`  ✅ ${permissionNames[permission]} permission granted`);
    }

    // Query final metadata
    console.log("\n📊 Final Transformer Metadata:");
    const metadata = await contract.getTransformerMetadata(tokenId);
    console.log("  Ancestral Hash:", metadata.ancestralHash);
    console.log("  Lineage Number:", metadata.lineageNumber.toString());
    console.log("  Assembly Timestamp:", new Date(metadata.assemblyTimestamp.toNumber() * 1000).toISOString());
    console.log("  Current Stage:", metadata.currentStage);
    console.log("  Is Activated:", metadata.isActivated);

    const components = await contract.getComponentRegistry(tokenId);
    console.log("\n🔧 Component Registry:");
    console.log("  Core Installed:", components.coreInstalled);
    console.log("  Windings Attached:", components.windingsAttached);
    console.log("  Insulation Applied:", components.insulationApplied);
    console.log("  Cooling System Integrated:", components.coolingSystemIntegrated);
    console.log("  Interfaces Connected:", components.interfacesConnected);
    console.log("  Scroll Embedded:", components.scrollEmbedded);
    console.log("  Calibrated:", components.calibrated);
    console.log("  Blessed:", components.blessed);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Ceremonial Minting Ritual Complete!");
  console.log("=".repeat(60));
  console.log("\n🌀 The OPTINUS PRIME lineage is now activated and ready for deployment.");
  console.log("    Transformer heritage tokens have been inscribed on-chain.");
  console.log("    Assembly protocols executed with ceremonial precision.");
  console.log("\n✨ Let the assembly—and the future—commence.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
