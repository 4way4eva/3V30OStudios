// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title BLEUCoin
 * @dev BLEU Coin™ Infrastructure System - Sovereign wealth token with three-tier access control
 * 
 * Three-Tier Streams:
 * - CIVILIAN_STREAM: Public civilian transactions and BLEU Bills
 * - MILITARY_STREAM: Enhanced Military Credits
 * - COSMIC_STREAM: Plasma-Funded and Portal-Based Cosmic Credits
 * 
 * Features:
 * - Soul-linked tracing for all transactions
 * - Inflation resistance through controlled minting
 * - Cross-ledger visibility
 * - Immutable audit trails
 */
contract BLEUCoin is ERC20, AccessControl, Pausable, ERC20Burnable {
    // Access Control Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant CIVILIAN_STREAM = keccak256("CIVILIAN_STREAM");
    bytes32 public constant MILITARY_STREAM = keccak256("MILITARY_STREAM");
    bytes32 public constant COSMIC_STREAM = keccak256("COSMIC_STREAM");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Soul-Link Tracking
    struct SoulLink {
        address account;
        uint256 timestamp;
        string celestialAlignment; // Judah-count alignment
        bytes32 sealHash; // ☆seal alignment
        uint8 streamType; // 1=Civilian, 2=Military, 3=Cosmic
    }

    // Mint Event with detailed tracking
    struct MintRecord {
        address recipient;
        uint256 amount;
        uint256 timestamp;
        uint8 streamType;
        string receiptId;
        bytes32 sealVerification;
    }

    // Storage
    mapping(address => SoulLink) private soulLinks;
    mapping(bytes32 => MintRecord) public mintRecords;
    mapping(uint8 => uint256) public streamTotalSupply; // Track supply per stream
    
    uint256 public maxSupply = 1_000_000_000_000 * 10**18; // 1 Trillion BLEU max
    uint256 private mintRecordCount;

    // Events
    event SoulLinked(address indexed account, uint256 timestamp, string celestialAlignment);
    event MintRecorded(bytes32 indexed recordId, address indexed recipient, uint256 amount, uint8 streamType);
    event StreamAuthorized(address indexed account, uint8 streamType);
    event InflationCheckPassed(uint256 newSupply, uint256 maxSupply);

    constructor() ERC20("BLEU Coin", "BLEU") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @dev Links an address to a soul signature with celestial alignment
     */
    function soulLink(
        address account,
        string memory celestialAlignment,
        bytes32 sealHash,
        uint8 streamType
    ) external onlyRole(MINTER_ROLE) {
        require(streamType >= 1 && streamType <= 3, "Invalid stream type");
        
        soulLinks[account] = SoulLink({
            account: account,
            timestamp: block.timestamp,
            celestialAlignment: celestialAlignment,
            sealHash: sealHash,
            streamType: streamType
        });

        // Grant appropriate stream role
        if (streamType == 1) {
            _grantRole(CIVILIAN_STREAM, account);
        } else if (streamType == 2) {
            _grantRole(MILITARY_STREAM, account);
        } else if (streamType == 3) {
            _grantRole(COSMIC_STREAM, account);
        }

        emit SoulLinked(account, block.timestamp, celestialAlignment);
        emit StreamAuthorized(account, streamType);
    }

    /**
     * @dev Mint with full audit trail and inflation resistance
     */
    function mintWithReceipt(
        address recipient,
        uint256 amount,
        uint8 streamType,
        string memory receiptId,
        bytes32 sealVerification
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (bytes32) {
        require(streamType >= 1 && streamType <= 3, "Invalid stream type");
        require(totalSupply() + amount <= maxSupply, "Max supply exceeded");

        // Verify soul link exists
        require(soulLinks[recipient].account != address(0), "Recipient not soul-linked");
        require(soulLinks[recipient].streamType == streamType, "Stream type mismatch");

        // Create mint record
        bytes32 recordId = keccak256(abi.encodePacked(recipient, amount, block.timestamp, mintRecordCount++));
        
        mintRecords[recordId] = MintRecord({
            recipient: recipient,
            amount: amount,
            timestamp: block.timestamp,
            streamType: streamType,
            receiptId: receiptId,
            sealVerification: sealVerification
        });

        // Update stream supply
        streamTotalSupply[streamType] += amount;

        // Mint tokens
        _mint(recipient, amount);

        emit MintRecorded(recordId, recipient, amount, streamType);
        emit InflationCheckPassed(totalSupply(), maxSupply);

        return recordId;
    }

    /**
     * @dev Get soul link information for an address
     */
    function getSoulLink(address account) external view returns (SoulLink memory) {
        return soulLinks[account];
    }

    /**
     * @dev Get mint record by ID
     */
    function getMintRecord(bytes32 recordId) external view returns (MintRecord memory) {
        return mintRecords[recordId];
    }

    /**
     * @dev Get total supply for a specific stream
     */
    function getStreamSupply(uint8 streamType) external view returns (uint256) {
        require(streamType >= 1 && streamType <= 3, "Invalid stream type");
        return streamTotalSupply[streamType];
    }

    /**
     * @dev Check if address has stream access
     */
    function hasStreamAccess(address account, uint8 streamType) external view returns (bool) {
        if (streamType == 1) return hasRole(CIVILIAN_STREAM, account);
        if (streamType == 2) return hasRole(MILITARY_STREAM, account);
        if (streamType == 3) return hasRole(COSMIC_STREAM, account);
        return false;
    }

    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Update max supply (only admin, for inflation control)
     */
    function updateMaxSupply(uint256 newMaxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxSupply >= totalSupply(), "New max supply below current supply");
        maxSupply = newMaxSupply;
    }

    // Override required by Solidity
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
