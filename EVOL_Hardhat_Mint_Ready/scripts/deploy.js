const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("\n═══════════════════════════════════════");
  console.log("🚀 EVOL War Codex NFT Deployment");
  console.log("═══════════════════════════════════════");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`\n📍 Network: ${hre.network.name}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} AVAX`);

  // Deploy the contract
  console.log("\n📦 Deploying EvolWarCodexNFT...");
  const EvolWarCodexNFT = await hre.ethers.getContractFactory("EvolWarCodexNFT");
  const contract = await EvolWarCodexNFT.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`\n✅ Contract deployed to: ${contractAddress}`);
  console.log(`\n⚠️  IMPORTANT: Copy this address to your .env file:`);
  console.log(`   CONTRACT=${contractAddress}\n`);

  // Save deployment info
  const deployment = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log("📝 Deployment info saved to deployment.json\n");

  console.log("═══════════════════════════════════════");
  console.log("✅ Deployment Complete!");
  console.log("═══════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
