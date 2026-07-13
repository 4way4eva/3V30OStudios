// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BLEUVault
 * @dev Treasury management system for BLEU Coin™ Infrastructure
 * 
 * Features:
 * - Three-tier vault system (Civilian, Military, Cosmic)
 * - Reconciliation snapshots
 * - EV0L wealth oversight
 * - Taxation reversal mechanisms
 * - Immutable receipt generation
 */
contract BLEUVault is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant RESTITUTION_ROLE = keccak256("RESTITUTION_ROLE");

    // Stream types
    enum StreamType { CIVILIAN, MILITARY, COSMIC }

    // Treasury snapshot structure
    struct TreasurySnapshot {
        uint256 timestamp;
        uint256 civilianBalance;
        uint256 militaryBalance;
        uint256 cosmicBalance;
        uint256 totalBalance;
        bytes32 merkleRoot; // For verifying snapshot integrity
        string priceIndex; // External price index reference
    }

    // Receipt structure
    struct Receipt {
        bytes32 receiptId;
        address issuer;
        address recipient;
        uint256 amount;
        StreamType streamType;
        uint256 timestamp;
        string celestialAlignment; // Judah-count alignment
        bytes32 sealHash; // ☆seal verification
        string liveBlueTimeLinkage; // Time linkage data
        bool isRestitution; // Marks taxation reversal receipts
    }

    // Restitution claim structure
    struct RestitutionClaim {
        address claimant;
        uint256 amount;
        string justification;
        uint256 timestamp;
        bool approved;
        bool processed;
    }

    // Storage
    IERC20 public bleuCoin;
    
    mapping(StreamType => uint256) public vaultBalances;
    mapping(bytes32 => Receipt) public receipts;
    mapping(bytes32 => RestitutionClaim) public restitutionClaims;
    
    TreasurySnapshot[] public snapshots;
    uint256 public snapshotCount;
    
    // Events
    event Deposit(address indexed from, uint256 amount, StreamType streamType);
    event Withdrawal(address indexed to, uint256 amount, StreamType streamType);
    event SnapshotCreated(uint256 indexed snapshotId, uint256 timestamp, uint256 totalBalance);
    event ReceiptIssued(bytes32 indexed receiptId, address indexed recipient, uint256 amount);
    event RestitutionClaimed(bytes32 indexed claimId, address indexed claimant, uint256 amount);
    event RestitutionProcessed(bytes32 indexed claimId, address indexed recipient, uint256 amount);

    constructor(address _bleuCoin) {
        require(_bleuCoin != address(0), "Invalid BLEU Coin address");
        bleuCoin = IERC20(_bleuCoin);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(RESTITUTION_ROLE, msg.sender);
    }

    /**
     * @dev Deposit BLEU coins into a specific vault stream
     */
    function deposit(uint256 amount, StreamType streamType) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(bleuCoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        vaultBalances[streamType] += amount;
        
        emit Deposit(msg.sender, amount, streamType);
    }

    /**
     * @dev Withdraw from vault (treasurer only)
     */
    function withdraw(
        address recipient,
        uint256 amount,
        StreamType streamType,
        string memory celestialAlignment,
        bytes32 sealHash,
        string memory liveBlueTimeLinkage
    ) 
        external 
        onlyRole(TREASURER_ROLE) 
        nonReentrant 
        whenNotPaused 
        returns (bytes32)
    {
        require(amount > 0, "Amount must be greater than 0");
        require(vaultBalances[streamType] >= amount, "Insufficient vault balance");
        require(recipient != address(0), "Invalid recipient");

        // Update balance
        vaultBalances[streamType] -= amount;

        // Generate receipt
        bytes32 receiptId = keccak256(
            abi.encodePacked(
                recipient,
                amount,
                streamType,
                block.timestamp,
                block.number
            )
        );

        receipts[receiptId] = Receipt({
            receiptId: receiptId,
            issuer: msg.sender,
            recipient: recipient,
            amount: amount,
            streamType: streamType,
            timestamp: block.timestamp,
            celestialAlignment: celestialAlignment,
            sealHash: sealHash,
            liveBlueTimeLinkage: liveBlueTimeLinkage,
            isRestitution: false
        });

        // Transfer tokens
        require(bleuCoin.transfer(recipient, amount), "Transfer failed");

        emit Withdrawal(recipient, amount, streamType);
        emit ReceiptIssued(receiptId, recipient, amount);

        return receiptId;
    }

    /**
     * @dev Create treasury reconciliation snapshot
     */
    function createSnapshot(bytes32 merkleRoot, string memory priceIndex) 
        external 
        onlyRole(AUDITOR_ROLE) 
        returns (uint256) 
    {
        uint256 civilianBal = vaultBalances[StreamType.CIVILIAN];
        uint256 militaryBal = vaultBalances[StreamType.MILITARY];
        uint256 cosmicBal = vaultBalances[StreamType.COSMIC];
        uint256 total = civilianBal + militaryBal + cosmicBal;

        TreasurySnapshot memory snapshot = TreasurySnapshot({
            timestamp: block.timestamp,
            civilianBalance: civilianBal,
            militaryBalance: militaryBal,
            cosmicBalance: cosmicBal,
            totalBalance: total,
            merkleRoot: merkleRoot,
            priceIndex: priceIndex
        });

        snapshots.push(snapshot);
        uint256 snapshotId = snapshotCount++;

        emit SnapshotCreated(snapshotId, block.timestamp, total);

        return snapshotId;
    }

    /**
     * @dev Submit restitution claim (taxation reversal)
     */
    function submitRestitutionClaim(
        uint256 amount,
        string memory justification
    ) 
        external 
        returns (bytes32) 
    {
        bytes32 claimId = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                block.timestamp
            )
        );

        restitutionClaims[claimId] = RestitutionClaim({
            claimant: msg.sender,
            amount: amount,
            justification: justification,
            timestamp: block.timestamp,
            approved: false,
            processed: false
        });

        emit RestitutionClaimed(claimId, msg.sender, amount);

        return claimId;
    }

    /**
     * @dev Approve and process restitution claim
     */
    function processRestitutionClaim(
        bytes32 claimId,
        string memory celestialAlignment,
        bytes32 sealHash,
        string memory liveBlueTimeLinkage
    ) 
        external 
        onlyRole(RESTITUTION_ROLE) 
        nonReentrant 
    {
        RestitutionClaim storage claim = restitutionClaims[claimId];
        require(claim.claimant != address(0), "Claim does not exist");
        require(!claim.processed, "Claim already processed");

        // Mark as approved and processed
        claim.approved = true;
        claim.processed = true;

        // Use civilian stream for restitution
        require(vaultBalances[StreamType.CIVILIAN] >= claim.amount, "Insufficient vault balance");
        vaultBalances[StreamType.CIVILIAN] -= claim.amount;

        // Generate restitution receipt
        bytes32 receiptId = keccak256(
            abi.encodePacked(
                "RESTITUTION",
                claim.claimant,
                claim.amount,
                block.timestamp
            )
        );

        receipts[receiptId] = Receipt({
            receiptId: receiptId,
            issuer: msg.sender,
            recipient: claim.claimant,
            amount: claim.amount,
            streamType: StreamType.CIVILIAN,
            timestamp: block.timestamp,
            celestialAlignment: celestialAlignment,
            sealHash: sealHash,
            liveBlueTimeLinkage: liveBlueTimeLinkage,
            isRestitution: true
        });

        // Transfer tokens
        require(bleuCoin.transfer(claim.claimant, claim.amount), "Transfer failed");

        emit RestitutionProcessed(claimId, claim.claimant, claim.amount);
        emit ReceiptIssued(receiptId, claim.claimant, claim.amount);
    }

    /**
     * @dev Get receipt details
     */
    function getReceipt(bytes32 receiptId) external view returns (Receipt memory) {
        return receipts[receiptId];
    }

    /**
     * @dev Get latest snapshot
     */
    function getLatestSnapshot() external view returns (TreasurySnapshot memory) {
        require(snapshots.length > 0, "No snapshots available");
        return snapshots[snapshots.length - 1];
    }

    /**
     * @dev Get snapshot by ID
     */
    function getSnapshot(uint256 snapshotId) external view returns (TreasurySnapshot memory) {
        require(snapshotId < snapshots.length, "Snapshot does not exist");
        return snapshots[snapshotId];
    }

    /**
     * @dev Get total vault balance across all streams
     */
    function getTotalBalance() external view returns (uint256) {
        return vaultBalances[StreamType.CIVILIAN] + 
               vaultBalances[StreamType.MILITARY] + 
               vaultBalances[StreamType.COSMIC];
    }

    /**
     * @dev Pause vault operations (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause vault operations
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
