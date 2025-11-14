const hre = require('hardhat');
const fs = require('fs');

async function main() {
  const baseURI = process.env.BASE_URI || "ipfs://REPLACE_WITH_BASE_URI/{id}.json";

  const ENFT = await hre.ethers.getContractFactory('ENFT');
  const enft = await ENFT.deploy(baseURI);
  await enft.deployed();

  console.log('ENFT deployed to:', enft.address);

  // write deployed address per network
  const out = { network: hre.network.name, address: enft.address };
  fs.writeFileSync(`deployed_${hre.network.name}.json`, JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});