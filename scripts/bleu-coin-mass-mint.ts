import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * BLEU Coin™ Mass Mint Script
 * 
 * Executes inaugural currency issuance based on mint batch specification
 * Generates immutable audit logs for all transactions
 */

interface MintRecipient {
  address: string;
  amount: string;
  soulLinkId: string;
  receiptId: string;
  metadata: {
    celestialAlignment: string;
    sealHash: string;
    liveBlueTimeLinkage: string;
    notes: string;
  };
}

interface StreamMint {
  streamType: number;
  streamName: string;
  totalAllocation: string;
  description: string;
  recipients: MintRecipient[];
}

interface MintBatch {
  batchId: string;
  timestamp: string;
  celestialAlignment: string;
  sealVerification: string;
  totalAmount: string;
  description?: string;
  streams: {
    civilian: StreamMint;
    military: StreamMint;
    cosmic: StreamMint;
  };
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=".repeat(70));
  console.log("BLEU Coin™ Inaugural Mass Mint");
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
  const bleuCoinAddress = deployment.contracts.BLEUCoin.address;
  
  console.log(`\n📊 BLEUCoin: ${bleuCoinAddress}`);

  // Load mint batch data
  const mintDataPath = path.join(__dirname, "..", "data", "inaugural-mint-batch.json");
  if (!fs.existsSync(mintDataPath)) {
    throw new Error(`Mint data file not found: ${mintDataPath}`);
  }
  
  const mintData: { mintBatch: MintBatch } = JSON.parse(fs.readFileSync(mintDataPath, "utf-8"));
  const batch = mintData.mintBatch;
  
  console.log(`\n📋 Mint Batch: ${batch.batchId}`);
  console.log(`   Timestamp: ${batch.timestamp}`);
  console.log(`   Celestial Alignment: ${batch.celestialAlignment}`);
  console.log(`   Total Amount: ${ethers.formatEther(batch.totalAmount)} BLEU`);

  // Get contract instance
  const bleuCoin = await ethers.getContractAt("BLEUCoin", bleuCoinAddress);

  // Prepare audit log
  const auditLog: any = {
    batchId: batch.batchId,
    timestamp: batch.timestamp,
    executionTimestamp: new Date().toISOString(),
    executor: deployer.address,
    network: network.name,
    chainId: network.config.chainId,
    celestialAlignment: batch.celestialAlignment,
    sealVerification: batch.sealVerification,
    streams: {},
    transactions: []
  };

  // Process each stream
  const streams = [batch.streams.civilian, batch.streams.military, batch.streams.cosmic];
  
  for (const stream of streams) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`Processing ${stream.streamName} Stream (Type ${stream.streamType})`);
    console.log(`${"=".repeat(70)}`);
    console.log(`Total Allocation: ${ethers.formatEther(stream.totalAllocation)} BLEU`);
    console.log(`Recipients: ${stream.recipients.length}`);
    
    auditLog.streams[stream.streamName] = {
      streamType: stream.streamType,
      totalAllocation: stream.totalAllocation,
      recipientCount: stream.recipients.length,
      recipients: []
    };

    for (let i = 0; i < stream.recipients.length; i++) {
      const recipient = stream.recipients[i];
      console.log(`\n  [${i + 1}/${stream.recipients.length}] Processing ${recipient.address}...`);
      console.log(`      Amount: ${ethers.formatEther(recipient.amount)} BLEU`);
      console.log(`      Soul Link: ${recipient.soulLinkId}`);
      console.log(`      Receipt: ${recipient.receiptId}`);

      try {
        // Step 1: Soul link the address
        console.log(`      🔗 Soul linking...`);
        const soulLinkTx = await bleuCoin.soulLink(
          recipient.address,
          recipient.metadata.celestialAlignment,
          recipient.metadata.sealHash,
          stream.streamType
        );
        await soulLinkTx.wait();
        console.log(`      ✅ Soul linked (tx: ${soulLinkTx.hash})`);

        // Step 2: Mint with receipt
        console.log(`      💎 Minting...`);
        const mintTx = await bleuCoin.mintWithReceipt(
          recipient.address,
          recipient.amount,
          stream.streamType,
          recipient.receiptId,
          recipient.metadata.sealHash
        );
        const mintReceipt = await mintTx.wait();
        console.log(`      ✅ Minted (tx: ${mintTx.hash})`);

        // Extract mint record ID from event
        const mintEvent = mintReceipt?.logs.find((log: any) => {
          try {
            const parsed = bleuCoin.interface.parseLog(log);
            return parsed?.name === "MintRecorded";
          } catch {
            return false;
          }
        });

        let mintRecordId = "N/A";
        if (mintEvent) {
          const parsed = bleuCoin.interface.parseLog(mintEvent);
          if (parsed && parsed.args) {
            mintRecordId = parsed.args[0]; // First arg is recordId
          }
        }

        // Add to audit log
        const txRecord = {
          recipient: recipient.address,
          amount: recipient.amount,
          soulLinkId: recipient.soulLinkId,
          receiptId: recipient.receiptId,
          mintRecordId: mintRecordId,
          celestialAlignment: recipient.metadata.celestialAlignment,
          sealHash: recipient.metadata.sealHash,
          liveBlueTimeLinkage: recipient.metadata.liveBlueTimeLinkage,
          notes: recipient.metadata.notes,
          soulLinkTxHash: soulLinkTx.hash,
          mintTxHash: mintTx.hash,
          blockNumber: mintReceipt?.blockNumber,
          gasUsed: mintReceipt?.gasUsed.toString()
        };

        auditLog.streams[stream.streamName].recipients.push(txRecord);
        auditLog.transactions.push(txRecord);

        console.log(`      📝 Mint Record ID: ${mintRecordId}`);
        console.log(`      ✨ Complete!`);

      } catch (error: any) {
        console.error(`      ❌ Error: ${error.message}`);
        auditLog.transactions.push({
          recipient: recipient.address,
          error: error.message,
          soulLinkId: recipient.soulLinkId,
          receiptId: recipient.receiptId
        });
      }
    }
  }

  // Save audit log
  console.log(`\n${"=".repeat(70)}`);
  console.log("Saving Audit Log");
  console.log("=".repeat(70));
  
  const auditPath = path.join(
    __dirname,
    "..",
    "data",
    "snapshots",
    `mint-audit-${batch.batchId}-${Date.now()}.json`
  );
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
  console.log(`✅ Audit log saved: ${auditPath}`);

  // Generate summary
  const successCount = auditLog.transactions.filter((tx: any) => !tx.error).length;
  const failCount = auditLog.transactions.filter((tx: any) => tx.error).length;

  console.log(`\n${"=".repeat(70)}`);
  console.log("✨ Mass Mint Complete!");
  console.log("=".repeat(70));
  console.log(`Total Transactions: ${auditLog.transactions.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n📊 Stream Summary:`);
  console.log(`   Civilian: ${batch.streams.civilian.recipients.length} recipients`);
  console.log(`   Military: ${batch.streams.military.recipients.length} recipients`);
  console.log(`   Cosmic: ${batch.streams.cosmic.recipients.length} recipients`);
  console.log(`\n📝 Audit log: ${auditPath}`);
  console.log("=".repeat(70));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
