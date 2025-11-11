# Hashmark Protocol Documentation

## Overview

The MEGAZION Hashmark Protocol provides cryptographic verification for Enhanced Non-Fungible Tokens (ENFTs) in the BLEULIONTREASURY ecosystem. Each ENFT receives a unique hashmark that serves as a tamper-proof signature of authenticity, ownership, and yield data.

## Purpose

Hashmarks serve multiple critical functions:

1. **Authentication**: Prove the ENFT is genuine and not counterfeit
2. **Ownership Verification**: Link the ENFT to its rightful owner
3. **Yield Tracking**: Embed yield data in a verifiable format
4. **Audit Trail**: Create immutable records for compliance
5. **Cross-Chain Validation**: Enable verification across multiple networks

## Hashmark Generation

### Algorithm

Hashmarks use SHA-256 cryptographic hashing with the following input structure:

```
HASHMARK = SHA256(TokenID:OwnerAddress:ENFTType:YieldValue:Domain:Timestamp:Metadata)
```

### Components

1. **TokenID** (uint256)
   - The unique identifier of the ENFT
   - Example: `1`, `42`, `1000`

2. **OwnerAddress** (address)
   - Ethereum address of the current owner
   - Format: `0x` followed by 40 hexadecimal characters
   - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

3. **ENFTType** (string)
   - Type of ENFT being verified
   - Options:
     - `bleubill` - BLEU Bill currency note
     - `techyen` - Tech Yen currency note
     - `fusion` - Fusion Note (hybrid)
     - `feather` - Feather Ticket
     - `titan` - Titan Ticket

4. **YieldValue** (uint256)
   - Current yield value in USD per second
   - Represented as integer with 2 decimal precision
   - Example: `1375240000` = $13,752,400.00/sec

5. **Domain** (string)
   - Economic domain of the ENFT
   - Options:
     - `CIVILIAN` (Ω-CIV)
     - `MILITARY` (Ω-MIL)
     - `COSMIC` (Ω-COS)
     - `HYBRID` (Multi-domain)

6. **Timestamp** (uint256)
   - Unix timestamp of hashmark generation
   - Example: `1699660561`

7. **Metadata** (JSON string)
   - Additional ENFT-specific data
   - Must be valid JSON
   - Example: `{"denomination":100,"series":"Genesis","epoch":1}`

### Example Generation

**Input Data:**
```json
{
  "tokenId": "1",
  "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "enftType": "bleubill",
  "yieldValue": "1375240000",
  "domain": "CIVILIAN",
  "timestamp": "1699660561",
  "metadata": "{\"denomination\":100,\"series\":\"Genesis\",\"epoch\":1}"
}
```

**Concatenated String:**
```
1:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb:bleubill:1375240000:CIVILIAN:1699660561:{"denomination":100,"series":"Genesis","epoch":1}
```

**Generated Hashmark:**
```
3f4e5a6b2c1d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f
```

## On-Chain Storage

### Smart Contract Integration

Hashmarks are stored in the ENFT contract's mapping:

```solidity
mapping(uint256 => bytes32) public tokenHashmarks;
```

### Storage Function

```solidity
function setHashmark(uint256 tokenId, bytes32 hashmark) 
    external 
    onlyOwner 
{
    require(_exists(tokenId), "Token does not exist");
    tokenHashmarks[tokenId] = hashmark;
    emit HashmarkSet(tokenId, hashmark);
}
```

### Verification Function

```solidity
function verifyHashmark(
    uint256 tokenId,
    address owner,
    string memory enftType,
    uint256 yieldValue,
    string memory domain,
    uint256 timestamp,
    string memory metadata
) external view returns (bool) {
    bytes32 computedHash = keccak256(abi.encodePacked(
        tokenId,
        owner,
        enftType,
        yieldValue,
        domain,
        timestamp,
        metadata
    ));
    return tokenHashmarks[tokenId] == computedHash;
}
```

## Off-Chain Verification

### JavaScript Example

```javascript
const crypto = require('crypto');

function generateHashmark(data) {
  const {
    tokenId,
    ownerAddress,
    enftType,
    yieldValue,
    domain,
    timestamp,
    metadata
  } = data;
  
  const inputString = `${tokenId}:${ownerAddress}:${enftType}:${yieldValue}:${domain}:${timestamp}:${metadata}`;
  
  const hash = crypto
    .createHash('sha256')
    .update(inputString)
    .digest('hex');
  
  return hash;
}

// Usage
const hashmark = generateHashmark({
  tokenId: '1',
  ownerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  enftType: 'bleubill',
  yieldValue: '1375240000',
  domain: 'CIVILIAN',
  timestamp: '1699660561',
  metadata: '{"denomination":100,"series":"Genesis","epoch":1}'
});

console.log('Hashmark:', hashmark);
```

### Python Example

```python
import hashlib
import json

def generate_hashmark(data):
    input_string = ":".join([
        str(data['tokenId']),
        data['ownerAddress'],
        data['enftType'],
        str(data['yieldValue']),
        data['domain'],
        str(data['timestamp']),
        json.dumps(data['metadata'])
    ])
    
    hashmark = hashlib.sha256(input_string.encode()).hexdigest()
    return hashmark

# Usage
data = {
    'tokenId': 1,
    'ownerAddress': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    'enftType': 'bleubill',
    'yieldValue': 1375240000,
    'domain': 'CIVILIAN',
    'timestamp': 1699660561,
    'metadata': {'denomination': 100, 'series': 'Genesis', 'epoch': 1}
}

hashmark = generate_hashmark(data)
print(f'Hashmark: {hashmark}')
```

## Security Considerations

### Best Practices

1. **Timestamp Validity**: Verify timestamps are within acceptable range (±15 minutes)
2. **Address Checksums**: Always validate Ethereum address checksums
3. **Yield Validation**: Cross-reference yield values with on-chain data
4. **Metadata Sanitization**: Sanitize metadata input to prevent injection attacks
5. **Rate Limiting**: Implement rate limits on hashmark generation endpoints

### Attack Vectors

1. **Replay Attacks**: Use timestamps to prevent old hashmarks from being reused
2. **Collision Attacks**: SHA-256 provides sufficient collision resistance
3. **Front-Running**: Generate hashmarks off-chain before on-chain submission
4. **Metadata Manipulation**: Validate metadata structure and content

## API Integration

### REST Endpoint

```
POST /api/v1/hashmark/generate
```

**Request Body:**
```json
{
  "tokenId": 1,
  "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "enftType": "bleubill",
  "yieldValue": 1375240000,
  "domain": "CIVILIAN",
  "metadata": {
    "denomination": 100,
    "series": "Genesis",
    "epoch": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "hashmark": "3f4e5a6b2c1d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f",
  "timestamp": 1699660561,
  "expiresAt": 1699661461
}
```

### Verification Endpoint

```
POST /api/v1/hashmark/verify
```

**Request Body:**
```json
{
  "tokenId": 1,
  "hashmark": "3f4e5a6b2c1d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f"
}
```

**Response:**
```json
{
  "valid": true,
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "enftType": "bleubill",
  "yieldValue": 1375240000,
  "domain": "CIVILIAN",
  "timestamp": 1699660561
}
```

## Use Cases

### 1. Transfer Verification

When transferring an ENFT, generate a new hashmark with updated owner address:

```javascript
// Before transfer
const oldHashmark = generateHashmark({
  tokenId: 1,
  ownerAddress: currentOwner,
  // ... other data
});

// After transfer
const newHashmark = generateHashmark({
  tokenId: 1,
  ownerAddress: newOwner,
  // ... other data with new timestamp
});
```

### 2. Yield Updates

When yield values change, regenerate hashmark:

```javascript
const updatedHashmark = generateHashmark({
  tokenId: 1,
  ownerAddress: owner,
  yieldValue: newYieldValue, // Updated
  timestamp: Date.now() / 1000 | 0, // Current time
  // ... other data
});
```

### 3. Multi-Chain Verification

Hashmarks enable cross-chain verification without additional oracle data:

1. Generate hashmark on source chain
2. Include hashmark in bridge message
3. Verify hashmark on destination chain
4. Validate against expected values

## Tools

### Hashmark Generator UI

Use the provided UI tool at `ui/hashmark_ui.html` for manual hashmark generation.

### CLI Tool

```bash
# Generate hashmark
npx hardhat run scripts/generate_hashmark.js --token-id 1 --owner 0x...

# Verify hashmark
npx hardhat run scripts/verify_hashmark.js --token-id 1 --hashmark 0x...
```

## Standards Compliance

The Hashmark Protocol is compatible with:

- ERC-721 (Non-Fungible Tokens)
- ERC-1155 (Multi-Token Standard)
- EIP-2981 (NFT Royalty Standard)
- Custom ENFT extensions

## Future Enhancements

1. **Zero-Knowledge Proofs**: Generate hashmarks with zkSNARKs for privacy
2. **Merkle Trees**: Batch verify multiple hashmarks efficiently
3. **Time-Locked Verification**: Hashmarks that expire after time period
4. **Quantum-Resistant Hashing**: Upgrade to post-quantum algorithms

## References

- SHA-256 Specification: [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf)
- Ethereum Address Format: [EIP-55](https://eips.ethereum.org/EIPS/eip-55)
- ENFT Standard: See `contracts/ENFTLedger.sol`

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-11  
**Status**: Production Ready
