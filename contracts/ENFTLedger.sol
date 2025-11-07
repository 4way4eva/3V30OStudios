// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ENFTLedger
 * @dev Hybrid ENFT system supporting both ERC-721 and ERC-1155 patterns
 * 
 * Features:
 * - ERC-721 for unique ceremonial artifacts
 * - ERC-1155 bridge for batch operations
 * - Audit-compliance flows with chain-agnostic triggers
 * - Civilian, Military, and Cosmic domain categorization
 * - Multi-chain deployment support with compliance tracking
 */
contract ENFTLedger is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    AccessControl,
    ReentrancyGuard 
{
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant CHAIN_BRIDGE_ROLE = keccak256("CHAIN_BRIDGE_ROLE");

    // ENFT Domain categories
    enum ENFTDomain {
        CIVILIAN,
        MILITARY,
        COSMIC
    }

    // Compliance status
    enum ComplianceStatus {
        PENDING,
        APPROVED,
        REJECTED,
        UNDER_REVIEW
    }

    // Chain support status
    enum ChainStatus {
        SUPPORTED,
        DEPRECATED,
        MIGRATING
    }

    // ENFT Metadata structure
    struct ENFTMetadata {
        uint256 tokenId;
        ENFTDomain domain;
        bytes32 ceremorialHash; // Hash of ceremonial assembly
        bytes32 auditHash; // Hash of audit compliance data
        ComplianceStatus complianceStatus;
        uint256 mintedAt;
        uint256 lastAudited;
        string metadataURI; // IPFS or other URI
        address auditedBy;
        bool isBridgeable; // Can be bridged to other chains
    }

    // Chain-agnostic trigger structure
    struct ChainTrigger {
        uint256 triggerId;
        uint256 chainId; // Target chain ID
        ChainStatus status;
        bytes triggerData; // Encoded trigger parameters
        uint256 createdAt;
        uint256 executedAt;
        bool isExecuted;
    }

    // Audit log entry
    struct AuditLogEntry {
        uint256 tokenId;
        address auditor;
        ComplianceStatus status;
        bytes32 auditHash;
        uint256 timestamp;
        string notes;
    }

    // State variables
    uint256 private _tokenIdCounter;
    uint256 private _triggerIdCounter;
    uint256 public maxBatchMintSize = 100; // Configurable batch mint limit

    mapping(uint256 => ENFTMetadata) public enftMetadata;
    mapping(uint256 => ChainTrigger) public chainTriggers;
    mapping(uint256 => AuditLogEntry[]) public auditLogs;
    
    // Domain to token IDs mapping
    mapping(ENFTDomain => uint256[]) public domainTokens;
    
    // Chain support mapping
    mapping(uint256 => ChainStatus) public chainSupport;
    
    // Batch minting tracking for ERC-1155-like functionality
    mapping(address => mapping(ENFTDomain => uint256)) public batchMintCounts;

    // Events
    event ENFTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        ENFTDomain domain,
        string metadataURI
    );

    event ENFTBatchMinted(
        address indexed recipient,
        ENFTDomain domain,
        uint256 count,
        uint256[] tokenIds
    );

    event ComplianceStatusUpdated(
        uint256 indexed tokenId,
        ComplianceStatus oldStatus,
        ComplianceStatus newStatus,
        address indexed auditor
    );

    event AuditLogAdded(
        uint256 indexed tokenId,
        address indexed auditor,
        ComplianceStatus status,
        bytes32 auditHash
    );

    event ChainTriggerCreated(
        uint256 indexed triggerId,
        uint256 indexed chainId,
        uint256 indexed tokenId
    );

    event ChainTriggerExecuted(
        uint256 indexed triggerId,
        uint256 timestamp
    );

    event ChainSupportUpdated(
        uint256 indexed chainId,
        ChainStatus status
    );

    /**
     * @dev Constructor sets up the ENFT ledger
     * @param admin The address that will be granted admin role
     */
    constructor(address admin) ERC721("EVOLVERSE ENFT", "ENFT") {
        require(admin != address(0), "ENFTLedger: invalid admin");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(AUDITOR_ROLE, admin);
        
        // Initialize chain support for major networks
        chainSupport[1] = ChainStatus.SUPPORTED; // Ethereum Mainnet
        chainSupport[137] = ChainStatus.SUPPORTED; // Polygon
        chainSupport[43114] = ChainStatus.SUPPORTED; // Avalanche
        chainSupport[56] = ChainStatus.SUPPORTED; // BSC
    }

    /**
     * @dev Mint a single ENFT
     * @param to Recipient address
     * @param domain ENFT domain
     * @param metadataURI Metadata URI
     * @param ceremorialHash Hash of ceremonial assembly
     * @param isBridgeable Whether token can be bridged
     * @return tokenId The ID of the minted token
     */
    function mintENFT(
        address to,
        ENFTDomain domain,
        string calldata metadataURI,
        bytes32 ceremorialHash,
        bool isBridgeable
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(to != address(0), "ENFTLedger: mint to zero address");
        require(bytes(metadataURI).length > 0, "ENFTLedger: empty metadata URI");
        
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        enftMetadata[tokenId] = ENFTMetadata({
            tokenId: tokenId,
            domain: domain,
            ceremorialHash: ceremorialHash,
            auditHash: bytes32(0),
            complianceStatus: ComplianceStatus.PENDING,
            mintedAt: block.timestamp,
            lastAudited: 0,
            metadataURI: metadataURI,
            auditedBy: address(0),
            isBridgeable: isBridgeable
        });

        domainTokens[domain].push(tokenId);

        emit ENFTMinted(tokenId, to, domain, metadataURI);
        
        return tokenId;
    }

    /**
     * @dev Batch mint ENFTs (ERC-1155-like functionality)
     * @param to Recipient address
     * @param domain ENFT domain
     * @param count Number of tokens to mint
     * @param baseMetadataURI Base URI for metadata (will append token ID)
     * @param ceremorialHash Hash of ceremonial assembly
     * @param isBridgeable Whether tokens can be bridged
     * @return tokenIds Array of minted token IDs
     */
    function batchMintENFT(
        address to,
        ENFTDomain domain,
        uint256 count,
        string calldata baseMetadataURI,
        bytes32 ceremorialHash,
        bool isBridgeable
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256[] memory) {
        require(to != address(0), "ENFTLedger: mint to zero address");
        require(count > 0 && count <= maxBatchMintSize, "ENFTLedger: invalid count");
        require(bytes(baseMetadataURI).length > 0, "ENFTLedger: empty metadata URI");
        
        uint256[] memory tokenIds = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _tokenIdCounter++;
            tokenIds[i] = tokenId;
            
            string memory fullURI = string(abi.encodePacked(baseMetadataURI, "/", _toString(tokenId)));
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, fullURI);
            
            enftMetadata[tokenId] = ENFTMetadata({
                tokenId: tokenId,
                domain: domain,
                ceremorialHash: ceremorialHash,
                auditHash: bytes32(0),
                complianceStatus: ComplianceStatus.PENDING,
                mintedAt: block.timestamp,
                lastAudited: 0,
                metadataURI: fullURI,
                auditedBy: address(0),
                isBridgeable: isBridgeable
            });

            domainTokens[domain].push(tokenId);
        }

        batchMintCounts[to][domain] += count;

        emit ENFTBatchMinted(to, domain, count, tokenIds);
        
        return tokenIds;
    }

    /**
     * @dev Update compliance status for an ENFT
     * @param tokenId The token ID
     * @param newStatus New compliance status
     * @param auditHash Hash of audit data
     * @param notes Audit notes
     */
    function updateComplianceStatus(
        uint256 tokenId,
        ComplianceStatus newStatus,
        bytes32 auditHash,
        string calldata notes
    ) external onlyRole(AUDITOR_ROLE) {
        require(_ownerOf(tokenId) != address(0), "ENFTLedger: token does not exist");
        
        ENFTMetadata storage metadata = enftMetadata[tokenId];
        ComplianceStatus oldStatus = metadata.complianceStatus;
        
        metadata.complianceStatus = newStatus;
        metadata.auditHash = auditHash;
        metadata.lastAudited = block.timestamp;
        metadata.auditedBy = msg.sender;

        // Add to audit log
        auditLogs[tokenId].push(AuditLogEntry({
            tokenId: tokenId,
            auditor: msg.sender,
            status: newStatus,
            auditHash: auditHash,
            timestamp: block.timestamp,
            notes: notes
        }));

        emit ComplianceStatusUpdated(tokenId, oldStatus, newStatus, msg.sender);
        emit AuditLogAdded(tokenId, msg.sender, newStatus, auditHash);
    }

    /**
     * @dev Create a chain-agnostic trigger for cross-chain operations
     * @param tokenId The token ID
     * @param targetChainId Target chain ID
     * @param triggerData Encoded trigger parameters
     * @return triggerId The ID of the created trigger
     */
    function createChainTrigger(
        uint256 tokenId,
        uint256 targetChainId,
        bytes calldata triggerData
    ) external onlyRole(CHAIN_BRIDGE_ROLE) returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "ENFTLedger: token does not exist");
        require(enftMetadata[tokenId].isBridgeable, "ENFTLedger: token not bridgeable");
        require(chainSupport[targetChainId] == ChainStatus.SUPPORTED, "ENFTLedger: chain not supported");
        
        uint256 triggerId = _triggerIdCounter++;
        
        chainTriggers[triggerId] = ChainTrigger({
            triggerId: triggerId,
            chainId: targetChainId,
            status: chainSupport[targetChainId],
            triggerData: triggerData,
            createdAt: block.timestamp,
            executedAt: 0,
            isExecuted: false
        });

        emit ChainTriggerCreated(triggerId, targetChainId, tokenId);
        
        return triggerId;
    }

    /**
     * @dev Execute a chain trigger
     * @param triggerId The trigger ID
     */
    function executeChainTrigger(uint256 triggerId) external onlyRole(CHAIN_BRIDGE_ROLE) {
        ChainTrigger storage trigger = chainTriggers[triggerId];
        require(!trigger.isExecuted, "ENFTLedger: trigger already executed");
        require(trigger.status == ChainStatus.SUPPORTED, "ENFTLedger: chain not supported");
        
        trigger.isExecuted = true;
        trigger.executedAt = block.timestamp;

        emit ChainTriggerExecuted(triggerId, block.timestamp);
    }

    /**
     * @dev Update chain support status
     * @param chainId The chain ID
     * @param status New chain status
     */
    function updateChainSupport(
        uint256 chainId,
        ChainStatus status
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        chainSupport[chainId] = status;
        emit ChainSupportUpdated(chainId, status);
    }

    /**
     * @dev Update maximum batch mint size
     * @param newMaxSize New maximum batch size
     */
    function updateMaxBatchMintSize(uint256 newMaxSize) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxSize > 0 && newMaxSize <= 1000, "ENFTLedger: invalid max size");
        maxBatchMintSize = newMaxSize;
    }
        emit ChainSupportUpdated(chainId, status);
    }

    /**
     * @dev Get tokens by domain
     * @param domain The ENFT domain
     * @return Array of token IDs
     */
    function getTokensByDomain(ENFTDomain domain) external view returns (uint256[] memory) {
        return domainTokens[domain];
    }

    /**
     * @dev Get audit log for a token
     * @param tokenId The token ID
     * @return Array of audit log entries
     */
    function getAuditLog(uint256 tokenId) external view returns (AuditLogEntry[] memory) {
        return auditLogs[tokenId];
    }

    /**
     * @dev Get batch mint count for an address and domain
     * @param account The address
     * @param domain The ENFT domain
     * @return Count of batch minted tokens
     */
    function getBatchMintCount(address account, ENFTDomain domain) external view returns (uint256) {
        return batchMintCounts[account][domain];
    }

    // Required overrides for multiple inheritance
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Convert uint256 to string
     * @param value The value to convert
     * @return String representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
