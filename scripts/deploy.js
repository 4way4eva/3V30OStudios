const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy zkPoRVerifier and BleuCrownMintUltraMax contracts
 * Multi-chain deployment: Avalanche (AVAX-C) and Cronos
 */
async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║  🌀 ULTRAMAX DEPLOYMENT PROTOCOL - EPOCH 0                    ║");
  console.log("║  Deploying Three-Yield Treasury Economy Infrastructure        ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
  
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  
  console.log("📍 Network:", networkName);
  console.log("👤 Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), getNetworkToken(networkName));
  console.log("");

  // Configuration
  const treasuryVault = process.env.TREASURY_VAULT;
  
  if (!treasuryVault) {
    console.error("\n❌ Error: TREASURY_VAULT not set in .env file");
    console.error("   For production deployments, please set TREASURY_VAULT=0x...");
    console.error("   Using deployer address as fallback for testing only.\n");
  }
  
  const treasuryAddress = treasuryVault || deployer.address;
  console.log("🏦 Treasury Vault:", treasuryAddress);
  if (!treasuryVault) {
    console.log("⚠️  WARNING: Using deployer address as treasury (testing only)");
  }
  console.log("");

  // Deploy zkPoRVerifier
  console.log("📦 [1/2] Deploying zkPoRVerifier...");
  const zkPoRVerifier = await hre.ethers.getContractFactory("zkPoRVerifier");
  const zkVerifier = await zkPoRVerifier.deploy();
  await zkVerifier.waitForDeployment();
  const zkVerifierAddress = await zkVerifier.getAddress();
  console.log("✅ zkPoRVerifier deployed to:", zkVerifierAddress);
  console.log("");

  // Deploy BleuCrownMintUltraMax
  console.log("📦 [2/2] Deploying BleuCrownMintUltraMax...");
  const BleuCrownMintUltraMax = await hre.ethers.getContractFactory("BleuCrownMintUltraMax");
  const mintController = await BleuCrownMintUltraMax.deploy(treasuryAddress, zkVerifierAddress);
  await mintController.waitForDeployment();
  const mintControllerAddress = await mintController.getAddress();
  console.log("✅ BleuCrownMintUltraMax deployed to:", mintControllerAddress);
  console.log("");

  // Save deployment info
  const deployment = {
    network: networkName,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    epoch: 0,
    contracts: {
      zkPoRVerifier: {
        address: zkVerifierAddress,
        txHash: zkVerifier.deploymentTransaction().hash,
        blockNumber: (await hre.ethers.provider.getTransactionReceipt(
          zkVerifier.deploymentTransaction().hash
        )).blockNumber
      },
      BleuCrownMintUltraMax: {
        address: mintControllerAddress,
        txHash: mintController.deploymentTransaction().hash,
        blockNumber: (await hre.ethers.provider.getTransactionReceipt(
          mintController.deploymentTransaction().hash
        )).blockNumber
      }
    },
    configuration: {
      treasuryVault: treasuryAddress,
      zkVerifierLinked: zkVerifierAddress
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment file
  const deploymentFile = path.join(
    deploymentsDir,
    `deployment-${networkName}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
  console.log("📝 Deployment info saved to:", deploymentFile);
  console.log("");

  // Display explorer links
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🌐 BLOCKCHAIN EXPLORER LINKS");
  console.log("═══════════════════════════════════════════════════════════════");
  
  const explorerBase = getExplorerUrl(networkName);
  
  console.log("\nzkPoRVerifier:");
  console.log(`  Contract: ${explorerBase}/address/${zkVerifierAddress}`);
  console.log(`  TX: ${explorerBase}/tx/${zkVerifier.deploymentTransaction().hash}`);
  
  console.log("\nBleuCrownMintUltraMax:");
  console.log(`  Contract: ${explorerBase}/address/${mintControllerAddress}`);
  console.log(`  TX: ${explorerBase}/tx/${mintController.deploymentTransaction().hash}`);
  console.log("");

  // Display next steps
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("📋 NEXT STEPS");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("\n1. Verify contracts on block explorer:");
  console.log(`   npx hardhat verify --network ${networkName} ${zkVerifierAddress}`);
  console.log(`   npx hardhat verify --network ${networkName} ${mintControllerAddress} "${treasuryVault}" "${zkVerifierAddress}"`);
  
  console.log("\n2. Configure environment variables:");
  console.log(`   ZKPOR_VERIFIER=${zkVerifierAddress}`);
  console.log(`   BLEU_MINT_CONTROLLER=${mintControllerAddress}`);
  if (!treasuryVault) {
    console.log(`   TREASURY_VAULT=<your_secure_treasury_address>`);
  }
  
  console.log("\n3. Run minting script:");
  console.log(`   npx hardhat run scripts/mint.js --network ${networkName}`);
  
  console.log("\n4. Run verification script:");
  console.log(`   python3 scripts/verify_onchain.py ${networkName}`);
  console.log("");

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ DEPLOYMENT COMPLETE - EPOCH 0 ULTRAMAX");
  console.log("═══════════════════════════════════════════════════════════════\n");

  return deployment;
}

function getExplorerUrl(network) {
  const explorers = {
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    polygon: "https://polygonscan.com",
    mumbai: "https://mumbai.polygonscan.com",
    avalanche: "https://snowtrace.io",
    fuji: "https://testnet.snowtrace.io",
    bsc: "https://bscscan.com",
    cronos: "https://cronoscan.com",
    localhost: "http://localhost:8545",
    hardhat: "http://localhost:8545"
  };
  return explorers[network] || "https://etherscan.io";
}

function getNetworkToken(network) {
  const tokens = {
    mainnet: "ETH",
    sepolia: "ETH",
    polygon: "MATIC",
    mumbai: "MATIC",
    avalanche: "AVAX",
    fuji: "AVAX",
    bsc: "BNB",
    cronos: "CRO",
    localhost: "ETH",
    hardhat: "ETH"
  };
  return tokens[network] || "ETH";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
