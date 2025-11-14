// scripts/deploy_glyphic.js
const { ethers } = require("hardhat");

async function main() {
  // Get the ContractFactory for GlyphicBabaNFT
  const GlyphicBabaNFT = await ethers.getContractFactory("GlyphicBabaNFT");

  // Deploy the contract
  console.log("Deploying GlyphicBabaNFT...");
  const contract = await GlyphicBabaNFT.deploy();
  await contract.deployed();

  // Log the contract address
  console.log("GlyphicBabaNFT deployed to:", contract.address);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });