#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Codex API responded with ${response.status}: ${message}`);
  }

  return response.json();
}

function readJson(filePath, description) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    throw new Error(`Unable to load ${description} at ${filePath}: ${error.message}`);
  }
}

async function main() {
  if (typeof fetch !== 'function') {
    throw new Error('Node.js 18+ is required to provide the global fetch API.');
  }

  const registryPath = process.env.MEGAZION_REGISTRY_PATH || path.join(__dirname, '..', 'data', 'cid_registry.json');
  const overlayPath = process.env.MEGAZION_OVERLAY_PATH || path.join(__dirname, '..', 'data', 'sovereign_overlay.json');
  const endpoint = process.env.MEGAZION_CODEX_ENDPOINT;
  const apiKey = process.env.MEGAZION_CODEX_KEY;

  if (!endpoint) {
    throw new Error('Set MEGAZION_CODEX_ENDPOINT to the Codex registry endpoint.');
  }
  if (!apiKey) {
    throw new Error('Set MEGAZION_CODEX_KEY to authenticate with the Codex registry.');
  }

  const registry = readJson(registryPath, 'CID registry');
  const overlay = readJson(overlayPath, 'sovereign overlay');

  const payload = {
    registryVersion: registry.version,
    updatedAt: registry.updatedAt,
    scrollCid: registry.scrollCid,
    ledgerCid: registry.ledgerCid,
    timeTraceCid: registry.timeTraceCid,
    compoundingCid: registry.compoundingCid,
    gems: registry.gems,
    overlay
  };

  const response = await postJson(endpoint, payload, {
    Authorization: `Bearer ${apiKey}`
  });

  console.log('✓ Codex registry synchronized');
  console.log('→ Imported gems:', response.imported || Object.keys(registry.gems).length);
  if (response.warnings?.length) {
    console.warn('Warnings from Codex:', response.warnings);
  }
}

main().catch((error) => {
  console.error('Codex linker failed:', error.message);
  process.exitCode = 1;
});
