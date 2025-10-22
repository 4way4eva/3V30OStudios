#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { config } = require('./utils/env');

config();

async function resolveEthers() {
  if (resolveEthers.cache !== undefined) {
    return resolveEthers.cache;
  }

  resolveEthers.cache = await import('ethers')
    .then((mod) => mod.ethers || mod.default || mod)
    .catch(() => null);

  return resolveEthers.cache;
}

const VIEW_ABI = [
  'function gem(uint256 tokenId) view returns (tuple(string name,string sovereignCode,bool attuned))',
  'function ceremonialMinted(uint256 tokenId) view returns (bool)'
];

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

function parseIpfsCid(uri) {
  if (typeof uri !== 'string') return null;
  if (!uri.startsWith('ipfs://')) return null;
  const stripped = uri.replace('ipfs://', '');
  const [cid, ...rest] = stripped.split('/');
  return { cid, path: rest.join('/') };
}

async function loadOnChainState(tokenIds, providerConfig, ethersLib) {
  if (!providerConfig.contractAddress || !providerConfig.rpcUrl || !ethersLib) {
    if (!ethersLib && (providerConfig.contractAddress || providerConfig.rpcUrl)) {
      console.warn('⚠️  ethers library not available; skipping on-chain inspection.');
    }
    return {};
  }

  const provider = new ethersLib.providers.JsonRpcProvider(providerConfig.rpcUrl);
  const contract = new ethersLib.Contract(providerConfig.contractAddress, VIEW_ABI, provider);
  const state = {};

  for (const tokenId of tokenIds) {
    try {
      const [metadata, minted] = await Promise.all([
        contract.gem(tokenId),
        contract.ceremonialMinted(tokenId)
      ]);
      state[tokenId] = {
        onChainName: metadata.name,
        onChainSovereign: metadata.sovereignCode,
        attuned: metadata.attuned,
        minted
      };
    } catch (error) {
      console.warn(`⚠️  Unable to read state for token ${tokenId}: ${error.message}`);
    }
  }

  return state;
}

async function main() {
  const metadataPath = process.env.MEGAZION_METADATA_PATH || path.join(__dirname, '..', 'megazion_gems_enft.json');
  const registryPath = process.env.MEGAZION_REGISTRY_PATH || path.join(__dirname, '..', 'data', 'cid_registry.json');

  const metadata = readJson(metadataPath, []);
  if (!Array.isArray(metadata) || metadata.length === 0) {
    throw new Error('No gem metadata found. Did you generate megazion_gems_enft.json?');
  }

  const tokenIds = metadata.map((_, index) => index + 1);
  const ethersLib = await resolveEthers();

  const onChainState = await loadOnChainState(tokenIds, {
    rpcUrl: process.env.MEGAZION_RPC_URL || process.env.RPC_URL,
    contractAddress: process.env.MEGAZION_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS
  }, ethersLib);

  const existing = readJson(registryPath, {});
  const nextRegistry = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    scrollCid: existing.scrollCid || 'bafy-scroll-placeholder',
    ledgerCid: existing.ledgerCid || 'bafy-ledger-placeholder',
    timeTraceCid: existing.timeTraceCid || 'bafy-timetrace-placeholder',
    compoundingCid: existing.compoundingCid || 'bafy-compounding-placeholder',
    gems: {}
  };

  metadata.forEach((entry, index) => {
    const tokenId = index + 1;
    const sovereignCode = entry.properties?.sovereign_code || `GEM-${tokenId}`;
    const assetCidInfo = parseIpfsCid(entry.image);
    const onChain = onChainState[tokenId] || {};
    const previous = existing.gems?.[sovereignCode] || {};

    nextRegistry.gems[sovereignCode] = {
      tokenId,
      name: entry.name,
      description: entry.description,
      metadataPointer: entry.properties?.registry_pointer || null,
      metadataCid: previous.metadataCid || assetCidInfo?.cid || null,
      assetCid: assetCidInfo?.cid || null,
      assetPath: assetCidInfo?.path || null,
      onChainName: onChain.onChainName || null,
      onChainSovereign: onChain.onChainSovereign || null,
      attuned: onChain.attuned ?? null,
      minted: onChain.minted ?? null
    };
  });

  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, JSON.stringify(nextRegistry, null, 2));

  console.log(`✓ Registry synced to ${registryPath}`);
}

main().catch((error) => {
  console.error('Registry sync failed:', error.message);
  process.exitCode = 1;
});
