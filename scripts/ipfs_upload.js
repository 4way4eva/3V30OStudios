#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { create } = require('ipfs-http-client');
require('dotenv').config();

function loadRegistry(registryPath) {
  try {
    return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        gems: {}
      };
    }
    throw error;
  }
}

async function uploadFile(client, filePath) {
  const content = fs.createReadStream(filePath);
  const result = await client.add({ path: path.basename(filePath), content }, { pin: true });
  return result.cid.toString();
}

function writeLog(logPath, records) {
  const headers = 'timestamp,label,file,cid\n';
  const lines = records.map((record) => `${record.timestamp},${record.label},${record.file},${record.cid}`);
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, headers + lines.join('\n') + '\n');
    return;
  }
  fs.appendFileSync(logPath, lines.join('\n') + '\n');
}

async function main() {
  const apiUrl = process.env.MEGAZION_IPFS_API || 'http://127.0.0.1:5001/api/v0';
  const client = create({ url: apiUrl });

  const rootDir = path.join(__dirname, '..');
  const registryPath = process.env.MEGAZION_REGISTRY_PATH || path.join(rootDir, 'data', 'cid_registry.json');
  const logPath = process.env.MEGAZION_IPFS_LOG || path.join(rootDir, 'data', 'ipfs_upload_log.csv');

  const uploads = [
    { label: 'scroll', file: path.join(rootDir, 'MEGAZION_All_Gems_Scroll.md') },
    { label: 'treasury-ledger', file: path.join(rootDir, 'MEGAZION_TripleStack_Treasury_Ledger.md') },
    { label: 'time-trace', file: path.join(rootDir, 'megazion_time_trace.csv') },
    { label: 'compounding-model', file: path.join(rootDir, 'megazion_compounding_model.csv') },
    { label: 'enft-batch', file: path.join(rootDir, 'megazion_gems_enft.json') }
  ];

  const registry = loadRegistry(registryPath);
  const logRecords = [];

  for (const item of uploads) {
    if (!fs.existsSync(item.file)) {
      console.warn(`⚠️  Skipping missing file ${item.file}`);
      continue;
    }
    console.log(`Uploading ${item.label} → ${item.file}`);
    const cid = await uploadFile(client, item.file);
    console.log(`✓ ${item.label} uploaded with CID ${cid}`);

    if (item.label === 'scroll') registry.scrollCid = cid;
    if (item.label === 'treasury-ledger') registry.ledgerCid = cid;
    if (item.label === 'time-trace') registry.timeTraceCid = cid;
    if (item.label === 'compounding-model') registry.compoundingCid = cid;
    if (item.label === 'enft-batch') registry.batchCid = cid;

    logRecords.push({
      timestamp: new Date().toISOString(),
      label: item.label,
      file: path.relative(rootDir, item.file),
      cid
    });
  }

  registry.updatedAt = new Date().toISOString();

  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  writeLog(logPath, logRecords);

  console.log('✓ IPFS upload pack complete');
}

main().catch((error) => {
  console.error('IPFS upload failed:', error.message);
  process.exitCode = 1;
});
