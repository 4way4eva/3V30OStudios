import { ethers, network } from "hardhat";

/**
 * Check deployer wallet balance on the target network
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("\n═══════════════════════════════════════");
  console.log("💰 Wallet Balance Check");
  console.log("═══════════════════════════════════════");
  console.log(`Network:  ${network.name}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(`Address:  ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);
  console.log("═══════════════════════════════════════\n");
  
  // Check if balance is sufficient for deployment (rough estimate)
  const minBalance = ethers.parseEther("0.1"); // 0.1 ETH minimum recommended
  
  if (balance < minBalance) {
    console.log("⚠️  WARNING: Balance may be insufficient for deployment");
    console.log(`   Recommended minimum: ${ethers.formatEther(minBalance)} ETH\n`);
  } else {
    console.log("✅ Balance appears sufficient for deployment\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
