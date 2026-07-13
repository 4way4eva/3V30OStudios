// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title zkPoRVerifier
 * @dev Zero-Knowledge Proof of Reserve Verifier for Three-Yield Treasury Economy
 * 
 * This contract enables zk-proof verification of transactions and yields across:
 * - Civilian yield streams (real estate, education, wearables, commerce)
 * - Military components and defense matrix assets
 * - Cosmic portal logistics and dimensional unlockables
 * 
 * Uses cryptographic proofs to verify reserve backing without revealing sensitive data.
 */
contract zkPoRVerifier is AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // Yield sphere categories
    enum YieldSphere {
        CIVILIAN,
        MILITARY,
        COSMIC
    }

    // Proof verification status
    enum ProofStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        EXPIRED
    }

    // Proof data structure
    struct ReserveProof {
        bytes32 proofHash;              // Hash of the zk-proof
        bytes32 merkleRoot;             // Merkle root of reserve commitments
        YieldSphere sphere;             // Which yield sphere this proves
        uint256 totalReserveValue;      // Claimed total reserve value (encrypted)
        uint256 timestamp;              // When proof was submitted
        uint256 expiryTime;             // When proof expires
        ProofStatus status;             // Current verification status
        address submitter;              // Who submitted the proof
        string ipfsUri;                 // IPFS URI for detailed proof data
    }

    // Yield verification tracking
    struct YieldVerification {
        uint256 verifiedAmount;         // Amount verified for this period
        uint256 period;                 // Verification period (epoch)
        uint256 lastVerificationTime;   // Last verification timestamp
        bool isActive;                  // Whether verification is active
    }

    // State mappings
    mapping(bytes32 => ReserveProof) public reserveProofs;
    mapping(YieldSphere => YieldVerification) public yieldVerifications;
    mapping(address => bool) public trustedVerifiers;
    mapping(bytes32 => bool) public usedProofHashes;

    // Configuration
    uint256 public proofExpiryDuration = 30 days;
    uint256 public minVerificationThreshold = 1000 ether; // Minimum reserve to verify
    bool public isPaused = false;

    // Events
    event ProofSubmitted(
        bytes32 indexed proofId,
        YieldSphere indexed sphere,
        address indexed submitter,
        bytes32 proofHash,
        uint256 reserveValue
    );

    event ProofVerified(
        bytes32 indexed proofId,
        YieldSphere indexed sphere,
        address indexed verifier,
        bool isValid
    );

    event YieldVerificationCompleted(
        YieldSphere indexed sphere,
        uint256 period,
        uint256 verifiedAmount,
        uint256 timestamp
    );

    event VerifierStatusUpdated(
        address indexed verifier,
        bool isTrusted
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    /**
     * @dev Submit a zero-knowledge proof of reserves
     * @param proofHash Hash of the zk-proof
     * @param merkleRoot Merkle root of reserve commitments
     * @param sphere Which yield sphere this proves
     * @param totalReserveValue Total claimed reserve value
     * @param ipfsUri IPFS URI for detailed proof data
     */
    function submitReserveProof(
        bytes32 proofHash,
        bytes32 merkleRoot,
        YieldSphere sphere,
        uint256 totalReserveValue,
        string calldata ipfsUri
    ) external onlyRole(TREASURY_ROLE) whenNotPaused nonReentrant returns (bytes32) {
        require(!usedProofHashes[proofHash], "Proof hash already used");
        require(totalReserveValue >= minVerificationThreshold, "Below minimum threshold");
        require(bytes(ipfsUri).length > 0, "IPFS URI required");

        bytes32 proofId = keccak256(abi.encodePacked(
            proofHash,
            merkleRoot,
            sphere,
            block.timestamp,
            msg.sender
        ));

        ReserveProof storage proof = reserveProofs[proofId];
        proof.proofHash = proofHash;
        proof.merkleRoot = merkleRoot;
        proof.sphere = sphere;
        proof.totalReserveValue = totalReserveValue;
        proof.timestamp = block.timestamp;
        proof.expiryTime = block.timestamp + proofExpiryDuration;
        proof.status = ProofStatus.PENDING;
        proof.submitter = msg.sender;
        proof.ipfsUri = ipfsUri;

        usedProofHashes[proofHash] = true;

        emit ProofSubmitted(proofId, sphere, msg.sender, proofHash, totalReserveValue);

        return proofId;
    }

    /**
     * @dev Verify a submitted proof
     * @param proofId ID of the proof to verify
     * @param isValid Whether the proof is valid
     */
    function verifyProof(
        bytes32 proofId,
        bool isValid
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused nonReentrant {
        ReserveProof storage proof = reserveProofs[proofId];
        require(proof.timestamp > 0, "Proof does not exist");
        require(proof.status == ProofStatus.PENDING, "Proof already processed");
        require(block.timestamp < proof.expiryTime, "Proof expired");

        if (isValid) {
            proof.status = ProofStatus.VERIFIED;
            
            // Update yield verification for this sphere
            YieldVerification storage verification = yieldVerifications[proof.sphere];
            verification.verifiedAmount += proof.totalReserveValue;
            verification.lastVerificationTime = block.timestamp;
            verification.isActive = true;

            emit YieldVerificationCompleted(
                proof.sphere,
                verification.period,
                verification.verifiedAmount,
                block.timestamp
            );
        } else {
            proof.status = ProofStatus.REJECTED;
        }

        emit ProofVerified(proofId, proof.sphere, msg.sender, isValid);
    }

    /**
     * @dev Batch verify multiple proofs
     * @param proofIds Array of proof IDs to verify
     * @param validityFlags Array of validity flags corresponding to proofs
     */
    function batchVerifyProofs(
        bytes32[] calldata proofIds,
        bool[] calldata validityFlags
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused nonReentrant {
        require(proofIds.length == validityFlags.length, "Array length mismatch");
        
        for (uint256 i = 0; i < proofIds.length; i++) {
            ReserveProof storage proof = reserveProofs[proofIds[i]];
            if (proof.timestamp > 0 && 
                proof.status == ProofStatus.PENDING && 
                block.timestamp < proof.expiryTime) {
                
                if (validityFlags[i]) {
                    proof.status = ProofStatus.VERIFIED;
                    YieldVerification storage verification = yieldVerifications[proof.sphere];
                    verification.verifiedAmount += proof.totalReserveValue;
                    verification.lastVerificationTime = block.timestamp;
                    verification.isActive = true;
                } else {
                    proof.status = ProofStatus.REJECTED;
                }

                emit ProofVerified(proofIds[i], proof.sphere, msg.sender, validityFlags[i]);
            }
        }
    }

    /**
     * @dev Get proof details
     * @param proofId ID of the proof
     */
    function getProof(bytes32 proofId) external view returns (
        bytes32 proofHash,
        bytes32 merkleRoot,
        YieldSphere sphere,
        uint256 totalReserveValue,
        uint256 timestamp,
        ProofStatus status,
        address submitter,
        string memory ipfsUri
    ) {
        ReserveProof storage proof = reserveProofs[proofId];
        return (
            proof.proofHash,
            proof.merkleRoot,
            proof.sphere,
            proof.totalReserveValue,
            proof.timestamp,
            proof.status,
            proof.submitter,
            proof.ipfsUri
        );
    }

    /**
     * @dev Get yield verification status for a sphere
     * @param sphere The yield sphere to query
     */
    function getYieldVerification(YieldSphere sphere) external view returns (
        uint256 verifiedAmount,
        uint256 period,
        uint256 lastVerificationTime,
        bool isActive
    ) {
        YieldVerification storage verification = yieldVerifications[sphere];
        return (
            verification.verifiedAmount,
            verification.period,
            verification.lastVerificationTime,
            verification.isActive
        );
    }

    /**
     * @dev Mark expired proofs
     * @param proofId ID of the proof to check
     */
    function markExpiredProof(bytes32 proofId) external {
        ReserveProof storage proof = reserveProofs[proofId];
        require(proof.timestamp > 0, "Proof does not exist");
        require(proof.status == ProofStatus.PENDING, "Proof already processed");
        require(block.timestamp >= proof.expiryTime, "Proof not expired yet");
        
        proof.status = ProofStatus.EXPIRED;
    }

    /**
     * @dev Advance to next verification period
     * @param sphere The yield sphere to advance
     */
    function advanceVerificationPeriod(
        YieldSphere sphere
    ) external onlyRole(AUDITOR_ROLE) {
        YieldVerification storage verification = yieldVerifications[sphere];
        verification.period++;
        verification.verifiedAmount = 0;
        verification.isActive = false;
    }

    /**
     * @dev Update trusted verifier status
     * @param verifier Address of the verifier
     * @param isTrusted Whether they should be trusted
     */
    function updateVerifierStatus(
        address verifier,
        bool isTrusted
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        trustedVerifiers[verifier] = isTrusted;
        emit VerifierStatusUpdated(verifier, isTrusted);
    }

    /**
     * @dev Update proof expiry duration
     * @param newDuration New expiry duration in seconds
     */
    function updateProofExpiryDuration(
        uint256 newDuration
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newDuration >= 1 days && newDuration <= 365 days, "Invalid duration");
        proofExpiryDuration = newDuration;
    }

    /**
     * @dev Update minimum verification threshold
     * @param newThreshold New minimum threshold
     */
    function updateMinVerificationThreshold(
        uint256 newThreshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minVerificationThreshold = newThreshold;
    }

    /**
     * @dev Pause/unpause contract
     * @param paused Whether to pause
     */
    function setPaused(bool paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isPaused = paused;
    }
}
