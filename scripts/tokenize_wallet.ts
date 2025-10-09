import { ethers } from "hardhat";

async function main() {
  const WALLET = "0xYOUR_WALLET";

  const bleu = await ethers.getContractAt("BLEUToken", "0xYOUR_BLEU20_ADDRESS");
  const wid  = await ethers.getContractAt("WalletID",  "0xYOUR_WALLETID_ADDRESS");

  const erc20Amount = ethers.parseUnits("1000000000", 18); // edit supply
  console.log("mint BLEU...");
  let tx = await bleu.mint(WALLET, erc20Amount); await tx.wait();

  const tokenId = 1; // stable ID per wallet
  const widURI = "ipfs://YOUR_WALLETID_METADATA"; // optional badge JSON
  console.log("issue WalletID...");
  tx = await wid.issue(WALLET, tokenId, widURI); await tx.wait();

  console.log("tokenized");
}

main().catch(e => { console.error(e); process.exit(1); });
