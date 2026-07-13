import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy OPTINUS PRIME ENFT Contract
 * 
 * This script deploys the OptimusPrimeENFT contract for the
 * Ceremonial Assembly Scroll infrastructure.
 */
async function main() {
  console.log("🔷 OPTINUS PRIME ENFT Deployment Commencing...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get treasury vault address from environment or use deployer as default
  const treasuryVault = process.env.TREASURY_VAULT_ADDRESS || deployer.address;
  console.log("Treasury Vault Address:", treasuryVault);

  // Deploy OptimusPrimeENFT
  console.log("\n📜 Deploying OptimusPrimeENFT contract...");
  const OptimusPrimeENFT = await ethers.getContractFactory("OptimusPrimeENFT");
  const optimusPrimeENFT = await OptimusPrimeENFT.deploy(treasuryVault);

  await optimusPrimeENFT.deployed();
  console.log("✅ OptimusPrimeENFT deployed to:", optimusPrimeENFT.address);

  // Grant initial roles if additional addresses provided
  if (process.env.CODEX_EMISSARY_ADDRESS) {
    console.log("\n🔐 Granting CODEX_EMISSARY_ROLE...");
    const CODEX_EMISSARY_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("CODEX_EMISSARY_ROLE")
    );
    const tx1 = await optimusPrimeENFT.grantRole(
      CODEX_EMISSARY_ROLE,
      process.env.CODEX_EMISSARY_ADDRESS
    );
    await tx1.wait();
    console.log("✅ CODEX_EMISSARY_ROLE granted to:", process.env.CODEX_EMISSARY_ADDRESS);
  }

  if (process.env.TRIBUNAL_ADDRESS) {
    console.log("\n⚖️ Granting TRIBUNAL_ROLE...");
    const TRIBUNAL_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("TRIBUNAL_ROLE")
    );
    const tx2 = await optimusPrimeENFT.grantRole(
      TRIBUNAL_ROLE,
      process.env.TRIBUNAL_ADDRESS
    );
    await tx2.wait();
    console.log("✅ TRIBUNAL_ROLE granted to:", process.env.TRIBUNAL_ADDRESS);
  }

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    treasuryVault: treasuryVault,
    contracts: {
      OptimusPrimeENFT: {
        address: optimusPrimeENFT.address,
        deploymentBlock: optimusPrimeENFT.deployTransaction.blockNumber,
        transactionHash: optimusPrimeENFT.deployTransaction.hash,
      },
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `optimus-prime-enft-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:", deploymentFile);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 OPTINUS PRIME ENFT Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  OptimusPrimeENFT:", optimusPrimeENFT.address);
  console.log("\nNext Steps:");
  console.log("  1. Verify contract on block explorer");
  console.log("  2. Add addresses to allowlist");
  console.log("  3. Begin ceremonial assembly minting");
  console.log("  4. Configure deployment permissions");
  console.log("\n🌀 The assembly protocol awaits activation...\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
