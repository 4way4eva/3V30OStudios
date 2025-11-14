const hre = require('hardhat');
const fs = require('fs');

async function main() {
  const network = process.env.HARDHAT_NETWORK || hre.network.name || 'sepolia';
  const dataPath = process.env.RECIPIENTS_FILE || 'recipients.json';
  if (!fs.existsSync(dataPath)) {
    console.error('Recipients file not found:', dataPath);
    process.exit(1);
  }
  const recipients = JSON.parse(fs.readFileSync(dataPath));

  const deployedFile = `deployed_${network}.json`;
  if (!fs.existsSync(deployedFile)) {
    console.error('Deployed contract file not found for network:', network);
    process.exit(1);
  }
  const { address } = JSON.parse(fs.readFileSync(deployedFile));

  const enft = await hre.ethers.getContractAt('ENFT', address);

  // Build batch mint params: for each recipient mint tokenId = index+1 amount = 1
  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const ids = [i + 1];
    const amounts = [r.amount || 1];
    console.log(`Minting token ${ids[0]} x${amounts[0]} to ${r.address} on ${network}`);
    const tx = await enft.adminMintBatch(r.address, ids, amounts, '0x');
    await tx.wait();
    console.log('Mint tx:', tx.hash);
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1; });