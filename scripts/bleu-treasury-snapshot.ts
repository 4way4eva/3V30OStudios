import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Treasury Snapshot Generation Script
 * 
 * Creates reconciliation snapshots with merkle root verification
 * and external price index tracking
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=".repeat(70));
  console.log("BLEU Vault Treasury Snapshot");
  console.log("=".repeat(70));
  console.log(`Executor: ${deployer.address}`);
  console.log(`Network: ${network.name}`);
  console.log("=".repeat(70));

  // Load deployment addresses
  const deploymentPath = path.join(__dirname, "..", "deployments", `bleu-coin-${network.name}.json`);
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found: ${deploymentPath}. Please deploy contracts first.`);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  const bleuVaultAddress = deployment.contracts.BLEUVault.address;
  const bleuCoinAddress = deployment.contracts.BLEUCoin.address;
  
  console.log(`\n🏦 BLEUVault: ${bleuVaultAddress}`);
  console.log(`📊 BLEUCoin: ${bleuCoinAddress}`);

  // Get contract instances
  const bleuVault = await ethers.getContractAt("BLEUVault", bleuVaultAddress);
  const bleuCoin = await ethers.getContractAt("BLEUCoin", bleuCoinAddress);

  // Get current vault balances
  console.log(`\n📊 Current Vault Balances:`);
  const civilianBalance = await bleuVault.vaultBalances(0); // CIVILIAN
  const militaryBalance = await bleuVault.vaultBalances(1); // MILITARY
  const cosmicBalance = await bleuVault.vaultBalances(2);   // COSMIC
  const totalBalance = civilianBalance + militaryBalance + cosmicBalance;

  console.log(`   Civilian: ${ethers.formatEther(civilianBalance)} BLEU`);
  console.log(`   Military: ${ethers.formatEther(militaryBalance)} BLEU`);
  console.log(`   Cosmic:   ${ethers.formatEther(cosmicBalance)} BLEU`);
  console.log(`   Total:    ${ethers.formatEther(totalBalance)} BLEU`);

  // Get stream supplies from BLEUCoin
  console.log(`\n📈 Total Minted Per Stream:`);
  const civilianSupply = await bleuCoin.getStreamSupply(1);
  const militarySupply = await bleuCoin.getStreamSupply(2);
  const cosmicSupply = await bleuCoin.getStreamSupply(3);
  const totalSupply = await bleuCoin.totalSupply();

  console.log(`   Civilian: ${ethers.formatEther(civilianSupply)} BLEU`);
  console.log(`   Military: ${ethers.formatEther(militarySupply)} BLEU`);
  console.log(`   Cosmic:   ${ethers.formatEther(cosmicSupply)} BLEU`);
  console.log(`   Total:    ${ethers.formatEther(totalSupply)} BLEU`);

  // Generate merkle root from balances
  // In production, this should include all vault state data
  const balanceData = [
    ethers.solidityPackedKeccak256(["string", "uint256"], ["CIVILIAN", civilianBalance]),
    ethers.solidityPackedKeccak256(["string", "uint256"], ["MILITARY", militaryBalance]),
    ethers.solidityPackedKeccak256(["string", "uint256"], ["COSMIC", cosmicBalance]),
  ];
  
  // Simple merkle root calculation (in production use a proper merkle tree library)
  const merkleRoot = ethers.keccak256(
    ethers.concat(balanceData)
  );

  console.log(`\n🔐 Merkle Root: ${merkleRoot}`);

  // Price index (in production, fetch from oracle or external API)
  const priceIndex = `BLEU-USD-1.00-${new Date().toISOString()}`;
  console.log(`💱 Price Index: ${priceIndex}`);

  // Create snapshot
  console.log(`\n📸 Creating snapshot...`);
  const snapshotTx = await bleuVault.createSnapshot(merkleRoot, priceIndex);
  const receipt = await snapshotTx.wait();
  console.log(`✅ Snapshot created (tx: ${snapshotTx.hash})`);

  // Get snapshot ID from event
  const snapshotEvent = receipt?.logs.find((log: any) => {
    try {
      const parsed = bleuVault.interface.parseLog(log);
      return parsed?.name === "SnapshotCreated";
    } catch {
      return false;
    }
  });

  let snapshotId = 0;
  if (snapshotEvent) {
    const parsed = bleuVault.interface.parseLog(snapshotEvent);
    if (parsed && parsed.args) {
      snapshotId = Number(parsed.args[0]);
    }
  }

  console.log(`📋 Snapshot ID: ${snapshotId}`);

  // Retrieve and verify snapshot
  console.log(`\n🔍 Verifying snapshot...`);
  const snapshot = await bleuVault.getSnapshot(snapshotId);
  
  console.log(`   Timestamp: ${new Date(Number(snapshot.timestamp) * 1000).toISOString()}`);
  console.log(`   Civilian Balance: ${ethers.formatEther(snapshot.civilianBalance)} BLEU`);
  console.log(`   Military Balance: ${ethers.formatEther(snapshot.militaryBalance)} BLEU`);
  console.log(`   Cosmic Balance: ${ethers.formatEther(snapshot.cosmicBalance)} BLEU`);
  console.log(`   Total Balance: ${ethers.formatEther(snapshot.totalBalance)} BLEU`);
  console.log(`   Merkle Root: ${snapshot.merkleRoot}`);
  console.log(`   Price Index: ${snapshot.priceIndex}`);

  // Save snapshot to file
  const snapshotData = {
    snapshotId: snapshotId,
    network: network.name,
    chainId: network.config.chainId,
    vaultAddress: bleuVaultAddress,
    txHash: snapshotTx.hash,
    blockNumber: receipt?.blockNumber,
    timestamp: new Date(Number(snapshot.timestamp) * 1000).toISOString(),
    balances: {
      civilian: {
        vault: ethers.formatEther(snapshot.civilianBalance),
        totalMinted: ethers.formatEther(civilianSupply)
      },
      military: {
        vault: ethers.formatEther(snapshot.militaryBalance),
        totalMinted: ethers.formatEther(militarySupply)
      },
      cosmic: {
        vault: ethers.formatEther(snapshot.cosmicBalance),
        totalMinted: ethers.formatEther(cosmicSupply)
      },
      total: {
        vault: ethers.formatEther(snapshot.totalBalance),
        totalSupply: ethers.formatEther(totalSupply)
      }
    },
    merkleRoot: snapshot.merkleRoot,
    priceIndex: snapshot.priceIndex,
    reconciliation: {
      civilianDelta: ethers.formatEther(civilianSupply - snapshot.civilianBalance),
      militaryDelta: ethers.formatEther(militarySupply - snapshot.militaryBalance),
      cosmicDelta: ethers.formatEther(cosmicSupply - snapshot.cosmicBalance),
      totalDelta: ethers.formatEther(totalSupply - snapshot.totalBalance)
    }
  };

  const snapshotPath = path.join(
    __dirname,
    "..",
    "data",
    "snapshots",
    `treasury-snapshot-${snapshotId}-${Date.now()}.json`
  );
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2));
  
  console.log(`\n✅ Snapshot saved: ${snapshotPath}`);

  console.log(`\n${"=".repeat(70)}`);
  console.log("✨ Treasury Snapshot Complete!");
  console.log("=".repeat(70));
  console.log(`Snapshot ID: ${snapshotId}`);
  console.log(`Total Vault Balance: ${ethers.formatEther(totalBalance)} BLEU`);
  console.log(`Total Minted Supply: ${ethers.formatEther(totalSupply)} BLEU`);
  console.log(`Circulating (non-vault): ${ethers.formatEther(totalSupply - totalBalance)} BLEU`);
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
