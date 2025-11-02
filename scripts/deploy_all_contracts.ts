import { ethers, network } from "hardhat";
import { recordDeployment } from "./utils/manifest";
import * as fs from "fs";
import * as path from "path";

/**
 * Master deployment script for all 3V30OStudios / EVOLVERSE contracts
 * Deploys contracts in dependency order and records all addresses
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
  const [deployer] = await ethers.getSigners();
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🔵 EVOLVERSE / MEGAZION Contract Deployment Suite");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Network:        ${network.name}`);
  console.log(`Chain ID:       ${network.config.chainId}`);
  console.log(`Deployer:       ${deployer.address}`);
  console.log(`Balance:        ${ethers.formatEther(deployerBalance)} ETH`);
  console.log("═══════════════════════════════════════════════════════════\n");

  const manifest: DeploymentManifest = {
    network: network.name,
    chainId: network.config.chainId as number,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {},
  };

  try {
    // ==========================================
    // Phase 1: Deploy core infrastructure contracts
    // ==========================================
    console.log("📦 Phase 1: Core Infrastructure Contracts");
    console.log("─────────────────────────────────────────\n");

    // 1. Deploy BLEULION_CASCADE (root contract)
    console.log("1️⃣  Deploying BLEULION_CASCADE...");
    const CASCADE = await ethers.getContractFactory("BLEULION_CASCADE");
    const cascade = await CASCADE.deploy();
    await cascade.waitForDeployment();
    const cascadeAddress = await cascade.getAddress();
    const cascadeTx = cascade.deploymentTransaction();
    console.log(`   ✅ BLEULION_CASCADE deployed at: ${cascadeAddress}`);
    console.log(`      Tx: ${cascadeTx?.hash}\n`);
    
    manifest.contracts.BLEULION_CASCADE = {
      address: cascadeAddress,
      deploymentTx: cascadeTx?.hash || "",
      blockNumber: cascadeTx?.blockNumber || 0,
    };

    // 2. Deploy BLEU_WATCHTOWER (depends on CASCADE)
    console.log("2️⃣  Deploying BLEU_WATCHTOWER...");
    const WATCHTOWER = await ethers.getContractFactory("BLEU_WATCHTOWER");
    const watchtower = await WATCHTOWER.deploy(cascadeAddress);
    await watchtower.waitForDeployment();
    const watchtowerAddress = await watchtower.getAddress();
    const watchtowerTx = watchtower.deploymentTransaction();
    console.log(`   ✅ BLEU_WATCHTOWER deployed at: ${watchtowerAddress}`);
    console.log(`      Tx: ${watchtowerTx?.hash}\n`);
    
    manifest.contracts.BLEU_WATCHTOWER = {
      address: watchtowerAddress,
      deploymentTx: watchtowerTx?.hash || "",
      blockNumber: watchtowerTx?.blockNumber || 0,
    };

    // 3. Deploy BLEU_GOV_SCROLL (depends on CASCADE and WATCHTOWER)
    console.log("3️⃣  Deploying BLEU_GOV_SCROLL...");
    const GOV_SCROLL = await ethers.getContractFactory("BLEU_GOV_SCROLL");
    const govScroll = await GOV_SCROLL.deploy(deployer.address, cascadeAddress, watchtowerAddress);
    await govScroll.waitForDeployment();
    const govScrollAddress = await govScroll.getAddress();
    const govScrollTx = govScroll.deploymentTransaction();
    console.log(`   ✅ BLEU_GOV_SCROLL deployed at: ${govScrollAddress}`);
    console.log(`      Tx: ${govScrollTx?.hash}\n`);
    
    manifest.contracts.BLEU_GOV_SCROLL = {
      address: govScrollAddress,
      deploymentTx: govScrollTx?.hash || "",
      blockNumber: govScrollTx?.blockNumber || 0,
    };

    // ==========================================
    // Phase 2: Deploy token contracts
    // ==========================================
    console.log("\n📦 Phase 2: Token Contracts");
    console.log("─────────────────────────────────────────\n");

    // 4. Deploy BLEUToken
    console.log("4️⃣  Deploying BLEUToken...");
    const BLEU_TOKEN = await ethers.getContractFactory("BLEUToken");
    const bleuToken = await BLEU_TOKEN.deploy();
    await bleuToken.waitForDeployment();
    const bleuTokenAddress = await bleuToken.getAddress();
    const bleuTokenTx = bleuToken.deploymentTransaction();
    console.log(`   ✅ BLEUToken deployed at: ${bleuTokenAddress}`);
    console.log(`      Tx: ${bleuTokenTx?.hash}\n`);
    
    manifest.contracts.BLEUToken = {
      address: bleuTokenAddress,
      deploymentTx: bleuTokenTx?.hash || "",
      blockNumber: bleuTokenTx?.blockNumber || 0,
    };

    // 5. Deploy EV0L1155
    console.log("5️⃣  Deploying EV0L1155...");
    const EV0L1155 = await ethers.getContractFactory("EV0L1155");
    const evol1155 = await EV0L1155.deploy("https://ipfs.io/ipfs/");
    await evol1155.waitForDeployment();
    const evol1155Address = await evol1155.getAddress();
    const evol1155Tx = evol1155.deploymentTransaction();
    console.log(`   ✅ EV0L1155 deployed at: ${evol1155Address}`);
    console.log(`      Tx: ${evol1155Tx?.hash}\n`);
    
    manifest.contracts.EV0L1155 = {
      address: evol1155Address,
      deploymentTx: evol1155Tx?.hash || "",
      blockNumber: evol1155Tx?.blockNumber || 0,
    };

    // 6. Deploy EV0L721
    console.log("6️⃣  Deploying EV0L721...");
    const EV0L721 = await ethers.getContractFactory("EV0L721");
    const evol721 = await EV0L721.deploy("EVOLVERSE NFT", "EVOL", ethers.MaxUint256);
    await evol721.waitForDeployment();
    const evol721Address = await evol721.getAddress();
    const evol721Tx = evol721.deploymentTransaction();
    console.log(`   ✅ EV0L721 deployed at: ${evol721Address}`);
    console.log(`      Tx: ${evol721Tx?.hash}\n`);
    
    manifest.contracts.EV0L721 = {
      address: evol721Address,
      deploymentTx: evol721Tx?.hash || "",
      blockNumber: evol721Tx?.blockNumber || 0,
    };

    // 7. Deploy MEGAZIONHybrid1155
    console.log("7️⃣  Deploying MEGAZIONHybrid1155...");
    const MEGAZION = await ethers.getContractFactory("MEGAZIONHybrid1155");
    const megazion = await MEGAZION.deploy("https://ipfs.io/ipfs/");
    await megazion.waitForDeployment();
    const megazionAddress = await megazion.getAddress();
    const megazionTx = megazion.deploymentTransaction();
    console.log(`   ✅ MEGAZIONHybrid1155 deployed at: ${megazionAddress}`);
    console.log(`      Tx: ${megazionTx?.hash}\n`);
    
    manifest.contracts.MEGAZIONHybrid1155 = {
      address: megazionAddress,
      deploymentTx: megazionTx?.hash || "",
      blockNumber: megazionTx?.blockNumber || 0,
    };

    // ==========================================
    // Phase 3: Deploy utility contracts
    // ==========================================
    console.log("\n📦 Phase 3: Utility Contracts");
    console.log("─────────────────────────────────────────\n");

    // 8. Deploy WalletID
    console.log("8️⃣  Deploying WalletID...");
    const WALLET_ID = await ethers.getContractFactory("WalletID");
    const walletId = await WALLET_ID.deploy();
    await walletId.waitForDeployment();
    const walletIdAddress = await walletId.getAddress();
    const walletIdTx = walletId.deploymentTransaction();
    console.log(`   ✅ WalletID deployed at: ${walletIdAddress}`);
    console.log(`      Tx: ${walletIdTx?.hash}\n`);
    
    manifest.contracts.WalletID = {
      address: walletIdAddress,
      deploymentTx: walletIdTx?.hash || "",
      blockNumber: walletIdTx?.blockNumber || 0,
    };

    // 9. Deploy BLEU_ENFT_MINT (depends on CASCADE and EV0L1155)
    console.log("9️⃣  Deploying BLEU_ENFT_MINT...");
    const ENFT_MINT = await ethers.getContractFactory("BLEU_ENFT_MINT");
    const enftMint = await ENFT_MINT.deploy(cascadeAddress, evol1155Address);
    await enftMint.waitForDeployment();
    const enftMintAddress = await enftMint.getAddress();
    const enftMintTx = enftMint.deploymentTransaction();
    console.log(`   ✅ BLEU_ENFT_MINT deployed at: ${enftMintAddress}`);
    console.log(`      Tx: ${enftMintTx?.hash}\n`);
    
    manifest.contracts.BLEU_ENFT_MINT = {
      address: enftMintAddress,
      deploymentTx: enftMintTx?.hash || "",
      blockNumber: enftMintTx?.blockNumber || 0,
    };

    // ==========================================
    // Phase 4: Configure contracts
    // ==========================================
    console.log("\n⚙️  Phase 4: Contract Configuration");
    console.log("─────────────────────────────────────────\n");

    // Link CASCADE to WATCHTOWER
    console.log("🔗 Linking CASCADE to WATCHTOWER...");
    const setWatchtowerTx = await cascade.setWatchtower(watchtowerAddress);
    await setWatchtowerTx.wait();
    console.log(`   ✅ CASCADE.setWatchtower() completed\n`);

    // ==========================================
    // Save deployment manifest
    // ==========================================
    console.log("💾 Saving deployment manifest...");
    const deploymentDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const manifestPath = path.join(
      deploymentDir,
      `${network.name}_${Date.now()}.json`
    );
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`   ✅ Manifest saved to: ${manifestPath}\n`);

    // Also save to latest
    const latestPath = path.join(deploymentDir, `${network.name}_latest.json`);
    fs.writeFileSync(latestPath, JSON.stringify(manifest, null, 2));
    console.log(`   ✅ Latest manifest saved to: ${latestPath}\n`);

    // Record to existing manifest system
    await recordDeployment(network.name, network.config.chainId as number, {
      ...Object.fromEntries(
        Object.entries(manifest.contracts).map(([name, data]) => [name, data.address])
      ),
    });

    // ==========================================
    // Summary
    // ==========================================
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("✅ All Contracts Deployed Successfully!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("\n📋 Deployment Summary:\n");
    
    Object.entries(manifest.contracts).forEach(([name, data]) => {
      console.log(`   ${name.padEnd(25)} ${data.address}`);
    });

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎯 Next Steps:");
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Configure additional roles and permissions");
    console.log("   3. Register initial scrolls and vaults");
    console.log("   4. Begin ceremonial minting operations");
    console.log("═══════════════════════════════════════════════════════════\n");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
