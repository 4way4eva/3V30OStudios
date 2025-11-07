// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./BLEU_GOV_SCROLL.sol";
import "./BLEULION_CASCADE.sol";

/**
 * @title GovTemporalBridge
 * @notice Three-tier synchronization bridge integrating Civilian, Military, and Cosmic
 *         verification conduits with temporal augmentation and SHA-based debugging.
 * @dev Implements:
 *      - Tunnel-tariff verification conduits
 *      - Anchor yield ladders for multi-plane tax contextual returns
 *      - Temporal augmented bridges with cross-key pre-backbuilt triggers
 *      - SHA-256 debugging and verification
 */
contract GovTemporalBridge is AccessControl {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 public constant BRIDGE_ADMIN_ROLE = keccak256("BRIDGE_ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant TEMPORAL_ORACLE_ROLE = keccak256("TEMPORAL_ORACLE_ROLE");

    enum TierType { CIVILIAN, MILITARY, COSMIC }
    enum VerificationStatus { PENDING, VERIFIED, REJECTED, TEMPORALLY_AUGMENTED }

    struct TierConduit {
        TierType tier;
        string name;
        uint256 yieldRate;
        uint256 tariffMultiplier; // basis points (10000 = 100%)
        bool active;
        uint256 lastSync;
        bytes32 merkleRoot;
    }

    struct YieldLadder {
        bytes32 conduitId;
        uint256[] steps;
        uint256[] returns;
        uint256 taxRate; // basis points
        bool multiPlane;
        uint256 contextualIndex;
    }

    struct TemporalBridge {
        bytes32 sourceConduitId;
        bytes32 targetConduitId;
        uint256 timestamp;
        bytes32 shaDebugHash;
        VerificationStatus status;
        string crossKeySignature;
        bool preBackbuilt;
    }

    struct TunnelVerification {
        bytes32 bridgeId;
        bytes32 verificationHash;
        address verifier;
        uint256 timestamp;
        bool passed;
        string debugLog;
    }

    BLEU_GOV_SCROLL public govScroll;
    BLEULION_CASCADE public cascade;

    mapping(bytes32 => TierConduit) public conduits;
    mapping(bytes32 => YieldLadder) public yieldLadders;
    mapping(bytes32 => TemporalBridge) public temporalBridges;
    mapping(bytes32 => TunnelVerification[]) public tunnelVerifications;

    bytes32[] private _conduitIds;
    bytes32[] private _bridgeIds;

    uint256 public syncInterval = 86400; // 24 hours default
    uint256 public temporalAugmentationWindow = 3600; // 1 hour window

    event ConduitRegistered(bytes32 indexed conduitId, TierType tier, string name);
    event ConduitSynced(bytes32 indexed conduitId, uint256 timestamp, bytes32 merkleRoot);
    event YieldLadderCreated(bytes32 indexed ladderId, bytes32 indexed conduitId, uint256 steps);
    event TemporalBridgeCreated(bytes32 indexed bridgeId, bytes32 sourceConduit, bytes32 targetConduit);
    event BridgeVerified(bytes32 indexed bridgeId, VerificationStatus status, bytes32 shaHash);
    event TunnelTariffVerified(bytes32 indexed bridgeId, bool passed, address verifier);
    event TemporalAugmentation(bytes32 indexed bridgeId, uint256 timestamp, string crossKey);

    constructor(
        address admin,
        address govScroll_,
        address cascade_
    ) {
        require(admin != address(0), "GovTemporalBridge: admin required");
        require(govScroll_ != address(0), "GovTemporalBridge: govScroll required");
        require(cascade_ != address(0), "GovTemporalBridge: cascade required");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(BRIDGE_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
        _grantRole(TEMPORAL_ORACLE_ROLE, admin);

        govScroll = BLEU_GOV_SCROLL(govScroll_);
        cascade = BLEULION_CASCADE(cascade_);
    }

    /**
     * @notice Register a new tier conduit (Civilian, Military, or Cosmic)
     */
    function registerConduit(
        bytes32 conduitId,
        TierType tier,
        string calldata name,
        uint256 yieldRate,
        uint256 tariffMultiplier
    ) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(conduits[conduitId].lastSync == 0, "GovTemporalBridge: conduit exists");
        require(tariffMultiplier <= 10000, "GovTemporalBridge: invalid tariff");

        conduits[conduitId] = TierConduit({
            tier: tier,
            name: name,
            yieldRate: yieldRate,
            tariffMultiplier: tariffMultiplier,
            active: true,
            lastSync: block.timestamp,
            merkleRoot: bytes32(0)
        });

        _conduitIds.push(conduitId);
        emit ConduitRegistered(conduitId, tier, name);
    }

    /**
     * @notice Create a yield ladder for multi-plane tax contextual returns
     */
    function createYieldLadder(
        bytes32 ladderId,
        bytes32 conduitId,
        uint256[] calldata steps,
        uint256[] calldata returns,
        uint256 taxRate,
        bool multiPlane,
        uint256 contextualIndex
    ) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(conduits[conduitId].active, "GovTemporalBridge: conduit not active");
        require(steps.length == returns.length, "GovTemporalBridge: steps/returns mismatch");
        require(taxRate <= 10000, "GovTemporalBridge: invalid tax rate");

        yieldLadders[ladderId] = YieldLadder({
            conduitId: conduitId,
            steps: steps,
            returns: returns,
            taxRate: taxRate,
            multiPlane: multiPlane,
            contextualIndex: contextualIndex
        });

        emit YieldLadderCreated(ladderId, conduitId, steps.length);
    }

    /**
     * @notice Create a temporal bridge between two conduits with cross-key triggers
     */
    function createTemporalBridge(
        bytes32 bridgeId,
        bytes32 sourceConduitId,
        bytes32 targetConduitId,
        string calldata crossKeySignature,
        bool preBackbuilt
    ) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(conduits[sourceConduitId].active, "GovTemporalBridge: source not active");
        require(conduits[targetConduitId].active, "GovTemporalBridge: target not active");
        require(temporalBridges[bridgeId].timestamp == 0, "GovTemporalBridge: bridge exists");

        // Generate SHA-256 debug hash
        bytes32 shaDebugHash = sha256(
            abi.encodePacked(
                bridgeId,
                sourceConduitId,
                targetConduitId,
                block.timestamp,
                crossKeySignature
            )
        );

        temporalBridges[bridgeId] = TemporalBridge({
            sourceConduitId: sourceConduitId,
            targetConduitId: targetConduitId,
            timestamp: block.timestamp,
            shaDebugHash: shaDebugHash,
            status: VerificationStatus.PENDING,
            crossKeySignature: crossKeySignature,
            preBackbuilt: preBackbuilt
        });

        _bridgeIds.push(bridgeId);
        emit TemporalBridgeCreated(bridgeId, sourceConduitId, targetConduitId);
    }

    /**
     * @notice Verify tunnel-tariff through verification conduit
     */
    function verifyTunnelTariff(
        bytes32 bridgeId,
        bool passed,
        string calldata debugLog
    ) external onlyRole(VERIFIER_ROLE) {
        require(temporalBridges[bridgeId].timestamp != 0, "GovTemporalBridge: bridge not found");

        bytes32 verificationHash = keccak256(
            abi.encodePacked(
                bridgeId,
                passed,
                msg.sender,
                block.timestamp
            )
        );

        tunnelVerifications[bridgeId].push(TunnelVerification({
            bridgeId: bridgeId,
            verificationHash: verificationHash,
            verifier: msg.sender,
            timestamp: block.timestamp,
            passed: passed,
            debugLog: debugLog
        }));

        if (passed) {
            temporalBridges[bridgeId].status = VerificationStatus.VERIFIED;
        } else {
            temporalBridges[bridgeId].status = VerificationStatus.REJECTED;
        }

        emit TunnelTariffVerified(bridgeId, passed, msg.sender);
        emit BridgeVerified(bridgeId, temporalBridges[bridgeId].status, temporalBridges[bridgeId].shaDebugHash);
    }

    /**
     * @notice Apply temporal augmentation to bridge
     */
    function applyTemporalAugmentation(
        bytes32 bridgeId,
        string calldata augmentedCrossKey
    ) external onlyRole(TEMPORAL_ORACLE_ROLE) {
        require(temporalBridges[bridgeId].timestamp != 0, "GovTemporalBridge: bridge not found");
        require(
            block.timestamp <= temporalBridges[bridgeId].timestamp + temporalAugmentationWindow,
            "GovTemporalBridge: augmentation window closed"
        );

        temporalBridges[bridgeId].status = VerificationStatus.TEMPORALLY_AUGMENTED;
        temporalBridges[bridgeId].crossKeySignature = augmentedCrossKey;

        emit TemporalAugmentation(bridgeId, block.timestamp, augmentedCrossKey);
        emit BridgeVerified(bridgeId, VerificationStatus.TEMPORALLY_AUGMENTED, temporalBridges[bridgeId].shaDebugHash);
    }

    /**
     * @notice Synchronize conduit with new merkle root
     */
    function syncConduit(
        bytes32 conduitId,
        bytes32 merkleRoot
    ) external onlyRole(VERIFIER_ROLE) {
        require(conduits[conduitId].active, "GovTemporalBridge: conduit not active");
        require(
            block.timestamp >= conduits[conduitId].lastSync + syncInterval,
            "GovTemporalBridge: sync too soon"
        );

        conduits[conduitId].merkleRoot = merkleRoot;
        conduits[conduitId].lastSync = block.timestamp;

        emit ConduitSynced(conduitId, block.timestamp, merkleRoot);
    }

    /**
     * @notice Calculate yield with ladder and tax applied
     */
    function calculateYield(
        bytes32 ladderId,
        uint256 stepIndex
    ) external view returns (uint256 grossYield, uint256 netYield, uint256 taxAmount) {
        YieldLadder memory ladder = yieldLadders[ladderId];
        require(stepIndex < ladder.steps.length, "GovTemporalBridge: invalid step");

        TierConduit memory conduit = conduits[ladder.conduitId];
        require(conduit.active, "GovTemporalBridge: conduit not active");

        grossYield = ladder.returns[stepIndex];
        
        // Apply tariff multiplier
        grossYield = (grossYield * conduit.tariffMultiplier) / 10000;

        // Apply tax
        taxAmount = (grossYield * ladder.taxRate) / 10000;
        netYield = grossYield - taxAmount;

        return (grossYield, netYield, taxAmount);
    }

    /**
     * @notice Get three-tier synchronization status
     */
    function getThreeTierStatus() external view returns (
        bool civilianActive,
        bool militaryActive,
        bool cosmicActive,
        uint256 totalConduits
    ) {
        civilianActive = false;
        militaryActive = false;
        cosmicActive = false;

        for (uint256 i = 0; i < _conduitIds.length; i++) {
            TierConduit memory conduit = conduits[_conduitIds[i]];
            if (conduit.active) {
                if (conduit.tier == TierType.CIVILIAN) civilianActive = true;
                if (conduit.tier == TierType.MILITARY) militaryActive = true;
                if (conduit.tier == TierType.COSMIC) cosmicActive = true;
            }
        }

        return (civilianActive, militaryActive, cosmicActive, _conduitIds.length);
    }

    /**
     * @notice Get verification history for a bridge
     */
    function getVerificationHistory(bytes32 bridgeId) external view returns (TunnelVerification[] memory) {
        return tunnelVerifications[bridgeId];
    }

    /**
     * @notice Update sync interval
     */
    function setSyncInterval(uint256 newInterval) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(newInterval > 0, "GovTemporalBridge: invalid interval");
        syncInterval = newInterval;
    }

    /**
     * @notice Update temporal augmentation window
     */
    function setTemporalAugmentationWindow(uint256 newWindow) external onlyRole(BRIDGE_ADMIN_ROLE) {
        require(newWindow > 0, "GovTemporalBridge: invalid window");
        temporalAugmentationWindow = newWindow;
    }

    /**
     * @notice Get conduit count
     */
    function conduitCount() external view returns (uint256) {
        return _conduitIds.length;
    }

    /**
     * @notice Get bridge count
     */
    function bridgeCount() external view returns (uint256) {
        return _bridgeIds.length;
    }

    /**
     * @notice Get conduit by index
     */
    function getConduitAt(uint256 index) external view returns (bytes32 conduitId, TierConduit memory conduit) {
        require(index < _conduitIds.length, "GovTemporalBridge: index out of bounds");
        conduitId = _conduitIds[index];
        conduit = conduits[conduitId];
        return (conduitId, conduit);
    }

    /**
     * @notice Get bridge by index
     */
    function getBridgeAt(uint256 index) external view returns (bytes32 bridgeId, TemporalBridge memory bridge) {
        require(index < _bridgeIds.length, "GovTemporalBridge: index out of bounds");
        bridgeId = _bridgeIds[index];
        bridge = temporalBridges[bridgeId];
        return (bridgeId, bridge);
    }
}
