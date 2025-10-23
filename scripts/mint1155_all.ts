import { ethers } from "hardhat";

async function main() {
  const CONTRACT = "0xYOUR_1155_ADDRESS";
  const RECIPIENT = "0xYOUR_WALLET";

  // Fill ids and amounts to “all”
  const ids = [0,1,2,3];         // edit
  const amounts = ids.map(() => 1); // or set per id

  const t1155 = await ethers.getContractAt("EV0L1155", CONTRACT);
  const tx = await t1155.mintAll(RECIPIENT, ids, amounts);
  console.log("tx:", tx.hash);
  await tx.wait();
  console.log("done");
}

main().catch(e => { console.error(e); process.exit(1); });
