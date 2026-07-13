const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n═══════════════════════════════════════");
  console.log("🎨 EVOL War Codex ENFT Minting");
  console.log("═══════════════════════════════════════");

  // Check required environment variables
  const CONTRACT = process.env.CONTRACT;
  const RECIPIENT = process.env.RECIPIENT;
  const CID = process.env.CID;

  if (!CONTRACT) {
    console.error("\n❌ Error: CONTRACT address not set in .env file");
    console.error("   Please set CONTRACT=0x...\n");
    process.exit(1);
  }

  if (!RECIPIENT) {
    console.error("\n❌ Error: RECIPIENT address not set in .env file");
    console.error("   Please set RECIPIENT=0x...\n");
    process.exit(1);
  }

  if (!CID) {
    console.error("\n❌ Error: CID not set in .env file");
    console.error("   Please set CID=Qm... (from IPFS upload)\n");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  console.log(`\n📍 Network: ${hre.network.name}`);
  console.log(`👤 Minter: ${signer.address}`);
  console.log(`📬 Recipient: ${RECIPIENT}`);
  console.log(`📎 Contract: ${CONTRACT}`);
  console.log(`🔗 IPFS CID: ${CID}`);

  // Connect to the deployed contract
  console.log("\n🔌 Connecting to contract...");
  const EvolWarCodexNFT = await hre.ethers.getContractFactory("EvolWarCodexNFT");
  const contract = EvolWarCodexNFT.attach(CONTRACT);

  // Set the base URI if not already set
  console.log("\n🔧 Setting base URI...");
  const baseURI = `ipfs://${CID}/`;
  try {
    const setURITx = await contract.setBaseURI(baseURI);
    await setURITx.wait();
    console.log(`✅ Base URI set to: ${baseURI}`);
  } catch (error) {
    if (error.message.includes("Ownable")) {
      console.error("❌ Error: You are not the contract owner");
      process.exit(1);
    }
    console.log("ℹ️  Base URI may already be set");
  }

  // Mint the ENFT
  console.log("\n🎨 Minting ENFT...");
  try {
    const mintTx = await contract.safeMint(RECIPIENT);
    const receipt = await mintTx.wait();
    
    // Get the token ID from the event
    const mintEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === "ENFTMinted"
    );
    
    let tokenId;
    if (mintEvent) {
      tokenId = mintEvent.args.tokenId.toString();
    } else {
      // Fallback: get current token ID
      tokenId = (await contract.getCurrentTokenId()) - 1n;
      tokenId = tokenId.toString();
    }

    console.log(`\n✅ ENFT Minted Successfully!`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   TX Hash: ${receipt.hash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`\n🌐 View on Explorer:`);
    
    const explorerBase = hre.network.name === "avalanche" 
      ? "https://snowtrace.io"
      : hre.network.name === "fuji"
      ? "https://testnet.snowtrace.io"
      : "https://explorer.avax.network";
    
    console.log(`   ${explorerBase}/tx/${receipt.hash}`);
    console.log(`   ${explorerBase}/token/${CONTRACT}?a=${tokenId}`);
    console.log(`\n📄 Metadata URI:`);
    console.log(`   ${baseURI}metadata.json`);
    console.log(`\n═══════════════════════════════════════`);
    console.log(`✅ Minting Complete!`);
    console.log(`═══════════════════════════════════════\n`);

  } catch (error) {
    console.error("\n❌ Minting failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
