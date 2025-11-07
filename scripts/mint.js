const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Mint Artifact NFTs for Three-Yield Treasury Economy
 * Reads from epoch_0_ultramax_artifacts.civ and mints across all three streams
 */
async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║  🎨 ULTRAMAX MINTING PROTOCOL - EPOCH 0                       ║");
  console.log("║  Minting Artifacts for Three-Yield Treasury Economy           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  const [minter] = await hre.ethers.getSigners();
  const networkName = hre.network.name;

  console.log("📍 Network:", networkName);
  console.log("👤 Minter:", minter.address);
  console.log("");

  // Check required environment variables
  const MINT_CONTROLLER = process.env.BLEU_MINT_CONTROLLER;
  const RECIPIENT = process.env.RECIPIENT || minter.address;

  if (!MINT_CONTROLLER) {
    console.error("❌ Error: BLEU_MINT_CONTROLLER not set in .env file");
    console.error("   Please deploy contracts first or set BLEU_MINT_CONTROLLER=0x...");
    process.exit(1);
  }

  console.log("📎 Mint Controller:", MINT_CONTROLLER);
  console.log("📬 Recipient:", RECIPIENT);
  console.log("");

  // Load epoch artifacts data
  console.log("📖 Loading epoch_0_ultramax_artifacts.civ...");
  const artifactsPath = path.join(__dirname, "../data/epoch_0_ultramax_artifacts.civ");
  
  if (!fs.existsSync(artifactsPath)) {
    console.error("❌ Error: epoch_0_ultramax_artifacts.civ not found");
    console.error("   Expected at:", artifactsPath);
    process.exit(1);
  }

  const epochData = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
  console.log("✅ Loaded epoch", epochData.epoch, "data");
  console.log("");

  // Connect to mint controller
  console.log("🔌 Connecting to BleuCrownMintUltraMax...");
  const BleuCrownMintUltraMax = await hre.ethers.getContractFactory("BleuCrownMintUltraMax");
  const mintController = BleuCrownMintUltraMax.attach(MINT_CONTROLLER);
  console.log("✅ Connected to mint controller");
  console.log("");

  // Check mint fee
  const mintFee = await mintController.mintFee();
  console.log("💰 Mint Fee per artifact:", hre.ethers.formatEther(mintFee), "tokens");
  console.log("");

  // Mint artifacts for each stream
  const streams = ["civilian", "military", "cosmic"];
  const streamIds = { civilian: 0, military: 1, cosmic: 2 };
  const mintedArtifacts = [];

  for (const streamName of streams) {
    const streamData = epochData.sovereign_streams[streamName];
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`🌀 Minting ${streamName.toUpperCase()} Stream Artifacts`);
    console.log("═══════════════════════════════════════════════════════════════\n");

    for (const category of streamData.categories) {
      console.log(`📦 Category: ${category.name}`);
      
      for (const artifact of category.artifacts) {
        try {
          console.log(`  🎨 Minting: ${artifact.name}...`);
          
          // Prepare metadata
          const metadata = {
            name: artifact.name,
            stream: streamName,
            category: category.name,
            yield_rate: artifact.yield_rate,
            ipfs_cid: artifact.ipfs_cid,
            attributes: artifact.attributes,
            epoch: epochData.epoch
          };

          // Create IPFS URI (in production, this would be uploaded to IPFS)
          const ipfsUri = `ipfs://${artifact.ipfs_cid}/metadata.json`;
          
          // Generate provenance hash
          const provenance = hre.ethers.keccak256(
            hre.ethers.toUtf8Bytes(
              JSON.stringify({
                artifact: artifact.name,
                stream: streamName,
                epoch: epochData.epoch,
                timestamp: new Date().toISOString()
              })
            )
          );

          // Mint the artifact
          const tx = await mintController.mintArtifact(
            RECIPIENT,
            streamIds[streamName],
            category.id,
            artifact.yield_rate,
            ipfsUri,
            provenance,
            { value: mintFee }
          );

          const receipt = await tx.wait();
          
          // Extract artifact ID from events
          const mintEvent = receipt.logs.find(
            log => log.fragment && log.fragment.name === "ArtifactMinted"
          );

          let artifactId;
          if (mintEvent) {
            artifactId = mintEvent.args.artifactId.toString();
          } else {
            // Fallback: get current counter
            const currentId = await mintController.getCurrentArtifactId();
            artifactId = (currentId - 1n).toString();
          }

          console.log(`  ✅ Minted! Artifact ID: ${artifactId}`);
          console.log(`     TX: ${receipt.hash}`);
          console.log(`     Block: ${receipt.blockNumber}`);
          console.log(`     Yield Rate: ${artifact.yield_rate} USD/sec`);
          console.log("");

          mintedArtifacts.push({
            artifactId,
            name: artifact.name,
            stream: streamName,
            category: category.name,
            yieldRate: artifact.yield_rate,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            ipfsUri
          });

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`  ❌ Failed to mint ${artifact.name}:`);
          console.error(`     ${error.message}`);
          console.log("");
        }
      }
    }
  }

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("📊 MINTING SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`Total Artifacts Minted: ${mintedArtifacts.length}`);
  console.log("");

  const streamCounts = {
    civilian: mintedArtifacts.filter(a => a.stream === "civilian").length,
    military: mintedArtifacts.filter(a => a.stream === "military").length,
    cosmic: mintedArtifacts.filter(a => a.stream === "cosmic").length
  };

  console.log("By Stream:");
  console.log(`  CIVILIAN: ${streamCounts.civilian} artifacts`);
  console.log(`  MILITARY: ${streamCounts.military} artifacts`);
  console.log(`  COSMIC: ${streamCounts.cosmic} artifacts`);
  console.log("");

  const totalYield = mintedArtifacts.reduce((sum, a) => sum + a.yieldRate, 0);
  console.log(`Total Yield Rate: ${totalYield.toLocaleString()} USD/sec`);
  console.log(`Total Yield Rate: ${(totalYield * 86400).toLocaleString()} USD/day`);
  console.log("");

  // Save minting results
  const mintingResults = {
    network: networkName,
    timestamp: new Date().toISOString(),
    epoch: epochData.epoch,
    minter: minter.address,
    recipient: RECIPIENT,
    mintController: MINT_CONTROLLER,
    totalMinted: mintedArtifacts.length,
    streamCounts,
    totalYieldPerSecond: totalYield,
    totalYieldPerDay: totalYield * 86400,
    artifacts: mintedArtifacts
  };

  const resultsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const resultsFile = path.join(
    resultsDir,
    `minting-results-${networkName}-${Date.now()}.json`
  );
  fs.writeFileSync(resultsFile, JSON.stringify(mintingResults, null, 2));
  console.log("📝 Minting results saved to:", resultsFile);
  console.log("");

  // Display explorer links
  const explorerBase = getExplorerUrl(networkName);
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🌐 VIEW ON EXPLORER");
  console.log("═══════════════════════════════════════════════════════════════\n");
  console.log(`Mint Controller: ${explorerBase}/address/${MINT_CONTROLLER}`);
  console.log(`Recipient: ${explorerBase}/address/${RECIPIENT}`);
  console.log("");

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ MINTING COMPLETE - EPOCH 0 ULTRAMAX");
  console.log("═══════════════════════════════════════════════════════════════\n");

  return mintingResults;
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Minting failed:");
    console.error(error);
    process.exit(1);
  });
