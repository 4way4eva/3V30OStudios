import { run, network, ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Verify all deployed contracts on block explorer
 * Reads deployment manifest and verifies each contract
 */

interface DeploymentManifest {
  network: string;
  chainId: number;
  deployedAt: string;
  deployer: string;
  contracts: {
    [key: string]: {
      address: string;
      deploymentTx: string;
      blockNumber: number;
    };
  };
}

async function main() {
  console.log("\n═══════════════════════════════════════");
  console.log("🔍 Contract Verification");
  console.log("═══════════════════════════════════════");
  console.log(`Network: ${network.name}\n`);

  // Load deployment manifest
  const manifestPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${network.name}_latest.json`
  );

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ No deployment manifest found at: ${manifestPath}`);
    console.error("   Run deployment first: npm run deploy:all --network <network>\n");
    process.exitCode = 1;
    return;
  }

  const manifest: DeploymentManifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf8")
  );

  console.log(`Loaded manifest from: ${manifest.deployedAt}\n`);

  // Verification configurations for each contract
  const verifications = [
    {
      name: "BLEULION_CASCADE",
      constructorArgs: [],
    },
    {
      name: "BLEU_WATCHTOWER",
      constructorArgs: [manifest.contracts.BLEULION_CASCADE.address],
    },
    {
      name: "BLEU_GOV_SCROLL",
      constructorArgs: [
        manifest.deployer,
        manifest.contracts.BLEULION_CASCADE.address,
        manifest.contracts.BLEU_WATCHTOWER.address,
      ],
    },
    {
      name: "BLEUToken",
      constructorArgs: [],
    },
    {
      name: "EV0L1155",
      constructorArgs: ["https://ipfs.io/ipfs/"],
    },
    {
      name: "EV0L721",
      constructorArgs: [
        "EVOLVERSE NFT",
        "EVOL",
        ethers.MaxUint256.toString(),
      ],
    },
    {
      name: "MEGAZIONHybrid1155",
      constructorArgs: ["https://ipfs.io/ipfs/"],
    },
    {
      name: "WalletID",
      constructorArgs: [],
    },
    {
      name: "BLEU_ENFT_MINT",
      constructorArgs: [
        manifest.contracts.BLEULION_CASCADE.address,
        manifest.contracts.EV0L1155.address,
      ],
    },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const verification of verifications) {
    const contractData = manifest.contracts[verification.name];
    if (!contractData) {
      console.log(`⏭️  Skipping ${verification.name} (not in manifest)\n`);
      continue;
    }

    console.log(`Verifying ${verification.name}...`);
    console.log(`   Address: ${contractData.address}`);

    try {
      await run("verify:verify", {
        address: contractData.address,
        constructorArguments: verification.constructorArgs,
      });
      console.log(`   ✅ Verified successfully!\n`);
      successCount++;
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log(`   ✅ Already verified\n`);
        successCount++;
      } else {
        console.log(`   ❌ Verification failed: ${error.message}\n`);
        failCount++;
      }
    }

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("═══════════════════════════════════════");
  console.log("📊 Verification Summary");
  console.log("═══════════════════════════════════════");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failCount}`);
  console.log("═══════════════════════════════════════\n");

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
