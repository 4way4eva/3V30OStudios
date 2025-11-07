import { ethers } from "hardhat";

/**
 * Deploy ENFT Ledger Contract
 * 
 * This script deploys the hybrid ERC-721/1155 ENFT ledger with audit compliance
 * flows and chain-agnostic triggers for the EVOLVERSE infrastructure.
 */
async function main() {
  console.log("🌀 Deploying ENFT Ledger System...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy ENFTLedger
  console.log("📜 Deploying ENFTLedger...");
  const ENFTLedger = await ethers.getContractFactory("ENFTLedger");
  const ledger = await ENFTLedger.deploy(deployer.address);
  await ledger.waitForDeployment();
  
  const ledgerAddress = await ledger.getAddress();
  console.log("✅ ENFTLedger deployed to:", ledgerAddress);

  // Grant additional roles
  console.log("\n👑 Setting up roles...");
  
  const MINTER_ROLE = await ledger.MINTER_ROLE();
  const AUDITOR_ROLE = await ledger.AUDITOR_ROLE();
  const CHAIN_BRIDGE_ROLE = await ledger.CHAIN_BRIDGE_ROLE();
  
  console.log("- Granting MINTER_ROLE to deployer...");
  await ledger.grantRole(MINTER_ROLE, deployer.address);
  
  console.log("- Granting AUDITOR_ROLE to deployer...");
  await ledger.grantRole(AUDITOR_ROLE, deployer.address);
  
  console.log("- Granting CHAIN_BRIDGE_ROLE to deployer...");
  await ledger.grantRole(CHAIN_BRIDGE_ROLE, deployer.address);

  // Display chain support
  console.log("\n🌐 Supported Chains:");
  const chains = [
    { id: 1, name: "Ethereum Mainnet" },
    { id: 137, name: "Polygon" },
    { id: 43114, name: "Avalanche C-Chain" },
    { id: 56, name: "BNB Smart Chain" }
  ];
  
  for (const chain of chains) {
    const status = await ledger.chainSupport(chain.id);
    console.log(`- Chain ${chain.id} (${chain.name}): ${status === 0 ? "✅ SUPPORTED" : "❌ NOT SUPPORTED"}`);
  }

  // Mint example ENFTs
  console.log("\n🎨 Minting example ENFTs...");
  
  // Mint a Civilian ENFT
  console.log("- Minting Civilian ENFT...");
  const civilianTx = await ledger.mintENFT(
    deployer.address,
    0, // CIVILIAN domain
    "ipfs://QmCivilianMetadata",
    ethers.keccak256(ethers.toUtf8Bytes("Civilian Ceremonial Assembly")),
    true // bridgeable
  );
  const civilianReceipt = await civilianTx.wait();
  console.log("✅ Civilian ENFT minted");

  // Mint a Military ENFT
  console.log("- Minting Military ENFT...");
  const militaryTx = await ledger.mintENFT(
    deployer.address,
    1, // MILITARY domain
    "ipfs://QmMilitaryMetadata",
    ethers.keccak256(ethers.toUtf8Bytes("Military Ceremonial Assembly")),
    true // bridgeable
  );
  const militaryReceipt = await militaryTx.wait();
  console.log("✅ Military ENFT minted");

  // Mint a Cosmic ENFT
  console.log("- Minting Cosmic ENFT...");
  const cosmicTx = await ledger.mintENFT(
    deployer.address,
    2, // COSMIC domain
    "ipfs://QmCosmicMetadata",
    ethers.keccak256(ethers.toUtf8Bytes("Cosmic Ceremonial Assembly")),
    false // not bridgeable
  );
  const cosmicReceipt = await cosmicTx.wait();
  console.log("✅ Cosmic ENFT minted");

  // Batch mint example
  console.log("\n- Batch minting Civilian ENFTs...");
  const batchTx = await ledger.batchMintENFT(
    deployer.address,
    0, // CIVILIAN domain
    5, // count
    "ipfs://QmBatchMetadata",
    ethers.keccak256(ethers.toUtf8Bytes("Batch Ceremonial Assembly")),
    true // bridgeable
  );
  const batchReceipt = await batchTx.wait();
  console.log("✅ 5 Civilian ENFTs batch minted");

  // Check total supply
  const totalSupply = await ledger.totalSupply();
  console.log(`\n📊 Total ENFTs minted: ${totalSupply}`);

  // Get domain tokens
  const civilianTokens = await ledger.getTokensByDomain(0);
  const militaryTokens = await ledger.getTokensByDomain(1);
  const cosmicTokens = await ledger.getTokensByDomain(2);
  
  console.log("\n📈 ENFTs by Domain:");
  console.log(`- Civilian: ${civilianTokens.length} tokens`);
  console.log(`- Military: ${militaryTokens.length} tokens`);
  console.log(`- Cosmic: ${cosmicTokens.length} tokens`);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("- ENFTLedger:", ledgerAddress);
  console.log("\nContract Info:");
  console.log("- Name:", await ledger.name());
  console.log("- Symbol:", await ledger.symbol());
  console.log("- Total Supply:", totalSupply.toString());
  console.log("\nNext Steps:");
  console.log("1. Mint ENFTs using mintENFT() or batchMintENFT()");
  console.log("2. Update compliance status using updateComplianceStatus()");
  console.log("3. Create chain triggers for bridging using createChainTrigger()");
  console.log("4. Verify contract on block explorer:");
  console.log(`   npx hardhat verify --network <network> ${ledgerAddress} ${deployer.address}`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
