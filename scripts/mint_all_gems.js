#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { config } = require('./utils/env');

config();

const CONTRACT_ABI = [
  'function mintCollection(address to, uint256[] calldata tokenIds, uint256[] calldata amounts) external',
  'function registerGems(uint256[] calldata tokenIds, string[] calldata names, string[] calldata sovereignCodes) external'
];

function loadMetadata(metadataPath) {
  const absolutePath = path.resolve(metadataPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Metadata file not found at ${absolutePath}`);
  }
  const payload = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  if (!Array.isArray(payload)) {
    throw new Error('Expected metadata JSON to contain an array of gem entries.');
  }
  return payload;
}

function extractGemPayload(metadata) {
  const tokenIds = [];
  const names = [];
  const sovereignCodes = [];
  const amounts = [];

  metadata.forEach((entry, index) => {
    const id = entry.properties?.token_id ?? index + 1;
    const name = entry.name || `Gem #${id}`;
    const sovereignCode = entry.properties?.sovereign_code || entry.properties?.sovereignCode || `GEM-${id}`;
    const supply = entry.properties?.initial_supply || entry.properties?.supply || 1;

    tokenIds.push(Number(id));
    names.push(name);
    sovereignCodes.push(sovereignCode);
    amounts.push(Number(supply));
  });

  return { tokenIds, names, sovereignCodes, amounts };
}

async function main() {
  const rpcUrl = process.env.MEGAZION_RPC_URL || process.env.RPC_URL;
  const privateKey = process.env.MEGAZION_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const contractAddress = process.env.MEGAZION_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS;
  const recipient = process.env.MEGAZION_RECIPIENT || process.env.TREASURY_RECEIVER;
  const metadataPath = process.env.MEGAZION_METADATA_PATH || path.join(__dirname, '..', 'megazion_gems_enft.json');

  const dryRun = /^true$/i.test(process.env.MEGAZION_DRY_RUN || process.env.DRY_RUN || '');

  let ethersLib = null;

  if (!dryRun) {
    ethersLib = await import('ethers')
      .then((mod) => mod.ethers || mod.default || mod)
      .catch(() => {
        throw new Error('Install the "ethers" package to perform live minting runs.');
      });
    if (!rpcUrl) throw new Error('Set MEGAZION_RPC_URL (or RPC_URL) to your target chain RPC endpoint.');
    if (!privateKey) throw new Error('Set MEGAZION_PRIVATE_KEY (or PRIVATE_KEY) to the operator wallet.');
    if (!contractAddress) throw new Error('Set MEGAZION_CONTRACT_ADDRESS (or CONTRACT_ADDRESS) to the deployed contract.');
    if (!recipient) throw new Error('Set MEGAZION_RECIPIENT (or TREASURY_RECEIVER) for the batch mint recipient.');
  }

  const metadata = loadMetadata(metadataPath);
  const { tokenIds, names, sovereignCodes, amounts } = extractGemPayload(metadata);

  if (dryRun) {
    console.log('MEGAZION mint dry run engaged. No transactions will be broadcast.');
    console.log('Summary:');
    console.table(
      tokenIds.map((id, index) => ({
        tokenId: id,
        name: names[index],
        sovereignCode: sovereignCodes[index],
        amount: amounts[index]
      }))
    );
    console.log(`Recipient (simulated): ${recipient || 'N/A'}`);
    console.log(`Contract (simulated): ${contractAddress || 'N/A'}`);
    return;
  }

  const provider = new ethersLib.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethersLib.Wallet(privateKey, provider);
  const contract = new ethersLib.Contract(contractAddress, CONTRACT_ABI, wallet);

  console.log(`Registering ${tokenIds.length} gems with the Codex contract...`);
  const registerTx = await contract.registerGems(tokenIds, names, sovereignCodes);
  console.log('→ register tx hash:', registerTx.hash);
  await registerTx.wait();
  console.log('✓ Registration confirmed.');

  console.log(`Minting ${tokenIds.length} ceremonial tokens to ${recipient}...`);
  const mintTx = await contract.mintCollection(recipient, tokenIds, amounts);
  console.log('→ mint tx hash:', mintTx.hash);
  const receipt = await mintTx.wait();
  console.log('✓ Mint confirmed in block', receipt.blockNumber);
}

main().catch((error) => {
  console.error('Mint batch failed:', error.message);
  process.exitCode = 1;
});
