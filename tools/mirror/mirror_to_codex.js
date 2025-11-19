#!/usr/bin/env node

/**
 * BLEULIONTREASURY™ Mirror Agent
 * 
 * Listens for ERC Transfer events on the primary vault and mirrors
 * ceremonial records to the CODEX_ENDPOINT for permanent archival.
 * 
 * Provenance: 2025-11-19T17:57:01Z
 * Author: Bleu (4way4eva)
 * Protocol: Treasury Mirror Protocol v1.0
 */

const ethers = require('ethers');
const fetch = require('node-fetch');
require('dotenv').config();

// Environment variables
const ETH_PROVIDER = process.env.ETH_PROVIDER || 'http://localhost:8545';
const CODEX_ENDPOINT = process.env.CODEX_ENDPOINT || 'https://codex.evolvverse.io/api/v1/records';
const MIRROR_SIGNER_PRIVATE_KEY = process.env.MIRROR_SIGNER_PRIVATE_KEY;
const PRIMARY_VAULT = process.env.PRIMARY_VAULT || '0x36CA5f34E5E873e7c3dF37432081d20b4Af320Be';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '15000'); // 15 seconds default

// ERC-20 Transfer event signature
const TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)';
const TRANSFER_TOPIC = ethers.utils.id(TRANSFER_EVENT_SIGNATURE);

// ERC-721 Transfer event signature (same as ERC-20)
// ERC-1155 TransferSingle event signature
const TRANSFER_SINGLE_SIGNATURE = 'TransferSingle(address,address,address,uint256,uint256)';
const TRANSFER_SINGLE_TOPIC = ethers.utils.id(TRANSFER_SINGLE_SIGNATURE);

// Validate required environment variables
if (!MIRROR_SIGNER_PRIVATE_KEY) {
  console.error('ERROR: MIRROR_SIGNER_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

// Initialize provider and signer
const provider = new ethers.providers.JsonRpcProvider(ETH_PROVIDER);
const signer = new ethers.Wallet(MIRROR_SIGNER_PRIVATE_KEY, provider);

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   BLEULIONTREASURY™ Mirror Agent v1.0                        ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`Signer Address: ${signer.address}`);
console.log(`Primary Vault: ${PRIMARY_VAULT}`);
console.log(`Provider: ${ETH_PROVIDER}`);
console.log(`Codex Endpoint: ${CODEX_ENDPOINT}`);
console.log(`Poll Interval: ${POLL_INTERVAL}ms`);
console.log('');

/**
 * Create a ceremonial record from a transfer event
 */
function createCeremonialRecord(log, receipt, block) {
  const record = {
    event_type: 'VAULT_TRANSFER',
    transaction_hash: log.transactionHash,
    block_number: log.blockNumber,
    block_timestamp: block.timestamp,
    vault_address: PRIMARY_VAULT,
    log_index: log.logIndex,
    topics: log.topics,
    data: log.data,
    receipt: {
      from: receipt.from,
      to: receipt.to,
      gas_used: receipt.gasUsed.toString(),
      status: receipt.status
    },
    provenance: {
      timestamp: new Date().toISOString(),
      mirror_agent: signer.address,
      protocol_version: '1.0.0'
    }
  };

  // Decode transfer event
  try {
    if (log.topics[0] === TRANSFER_TOPIC) {
      // ERC-20 or ERC-721 Transfer
      const from = '0x' + log.topics[1].slice(26);
      const to = '0x' + log.topics[2].slice(26);
      
      record.decoded = {
        event: 'Transfer',
        from: ethers.utils.getAddress(from),
        to: ethers.utils.getAddress(to)
      };

      // Try to decode amount/tokenId from data or topics
      if (log.topics.length === 4) {
        // ERC-721: tokenId in topics[3]
        record.decoded.tokenId = ethers.BigNumber.from(log.topics[3]).toString();
      } else if (log.data !== '0x') {
        // ERC-20: amount in data
        record.decoded.amount = ethers.BigNumber.from(log.data).toString();
      }
    } else if (log.topics[0] === TRANSFER_SINGLE_TOPIC) {
      // ERC-1155 TransferSingle
      const operator = '0x' + log.topics[1].slice(26);
      const from = '0x' + log.topics[2].slice(26);
      const to = '0x' + log.topics[3].slice(26);

      // Decode id and amount from data
      const abiCoder = new ethers.utils.AbiCoder();
      const decoded = abiCoder.decode(['uint256', 'uint256'], log.data);

      record.decoded = {
        event: 'TransferSingle',
        operator: ethers.utils.getAddress(operator),
        from: ethers.utils.getAddress(from),
        to: ethers.utils.getAddress(to),
        id: decoded[0].toString(),
        amount: decoded[1].toString()
      };
    }
  } catch (error) {
    console.error('Error decoding event:', error.message);
  }

  return record;
}

/**
 * Sign a ceremonial record
 */
async function signRecord(record) {
  // Create message hash from record
  const message = JSON.stringify(record, null, 0);
  const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
  
  // Sign the hash
  const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
  
  return {
    ...record,
    signature: {
      message_hash: messageHash,
      signature: signature,
      signer: signer.address
    }
  };
}

/**
 * Post ceremonial record to CODEX endpoint
 */
async function postToCodex(signedRecord) {
  try {
    const response = await fetch(CODEX_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mirror-Agent': 'BLEULIONTREASURY-v1.0',
        'X-Mirror-Signer': signer.address
      },
      body: JSON.stringify(signedRecord)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error posting to CODEX:', error.message);
    throw error;
  }
}

/**
 * Process a transfer event
 */
async function processTransferEvent(log) {
  try {
    console.log(`\n⧈ Processing Transfer Event`);
    console.log(`  Block: ${log.blockNumber}`);
    console.log(`  TX: ${log.transactionHash}`);

    // Get transaction receipt and block
    const [receipt, block] = await Promise.all([
      provider.getTransactionReceipt(log.transactionHash),
      provider.getBlock(log.blockNumber)
    ]);

    // Create ceremonial record
    const record = createCeremonialRecord(log, receipt, block);
    
    // Sign the record
    const signedRecord = await signRecord(record);
    
    console.log(`  From: ${record.decoded?.from || 'N/A'}`);
    console.log(`  To: ${record.decoded?.to || 'N/A'}`);
    if (record.decoded?.amount) {
      console.log(`  Amount: ${record.decoded.amount}`);
    }
    if (record.decoded?.tokenId) {
      console.log(`  Token ID: ${record.decoded.tokenId}`);
    }

    // Post to CODEX
    console.log(`  Mirroring to CODEX...`);
    const result = await postToCodex(signedRecord);
    console.log(`  ✓ Mirrored successfully`);
    if (result.record_id) {
      console.log(`  Record ID: ${result.record_id}`);
    }

    return true;
  } catch (error) {
    console.error(`  ✗ Error processing event:`, error.message);
    return false;
  }
}

/**
 * Main monitoring loop
 */
async function monitorVault() {
  console.log('⟐ Starting vault monitoring...\n');

  let lastBlock = await provider.getBlockNumber();
  console.log(`Starting from block: ${lastBlock}\n`);

  while (true) {
    try {
      const currentBlock = await provider.getBlockNumber();

      if (currentBlock > lastBlock) {
        console.log(`⌬ Scanning blocks ${lastBlock + 1} to ${currentBlock}...`);

        // Query logs for Transfer events to/from primary vault
        const logs = await provider.getLogs({
          fromBlock: lastBlock + 1,
          toBlock: currentBlock,
          topics: [
            [TRANSFER_TOPIC, TRANSFER_SINGLE_TOPIC], // Either Transfer or TransferSingle
            null,
            null
          ]
        });

        // Filter logs involving the primary vault
        const vaultLogs = logs.filter(log => {
          // Check if vault is involved (to or from)
          const from = log.topics[1] ? '0x' + log.topics[1].slice(26) : null;
          const to = log.topics[2] ? '0x' + log.topics[2].slice(26) : null;
          
          return (
            (from && from.toLowerCase() === PRIMARY_VAULT.toLowerCase()) ||
            (to && to.toLowerCase() === PRIMARY_VAULT.toLowerCase())
          );
        });

        if (vaultLogs.length > 0) {
          console.log(`Found ${vaultLogs.length} vault-related transfer(s)`);

          // Process each event
          for (const log of vaultLogs) {
            await processTransferEvent(log);
          }
        }

        lastBlock = currentBlock;
      }

      // Wait for next poll interval
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

    } catch (error) {
      console.error('Error in monitoring loop:', error.message);
      console.log('Retrying in 30 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}

/**
 * Graceful shutdown handler
 */
process.on('SIGINT', () => {
  console.log('\n\n◈ Shutting down mirror agent gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n◈ Shutting down mirror agent gracefully...');
  process.exit(0);
});

// Start monitoring
monitorVault().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
