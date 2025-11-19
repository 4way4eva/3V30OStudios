// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RippleEffectLedger
 * @notice Sovereign signature system that tracks temporal waves, lineage resonance, 
 * and audit echoes for every shard activation across the MEGAZION Codex
 * @dev Implements the Ripple Effect - memory waves that reverberate across zones, 
 * treaties, currencies, and scrolls, providing tribunal-ready proof of activation
 */
contract RippleEffectLedger is AccessControl, ReentrancyGuard, Pausable {
    // Role definitions
    bytes32 public constant RIPPLE_ACTIVATOR_ROLE = keccak256("RIPPLE_ACTIVATOR_ROLE");
    bytes32 public constant WATCHTOWER_ROLE = keccak256("WATCHTOWER_ROLE");
    bytes32 public constant SORA_GUARDIAN_ROLE = keccak256("SORA_GUARDIAN_ROLE");

    // Zone definitions - Six sovereign zones with unique ripple signatures
    enum Zone {
        AQUATIC_VORTEX,      // Oceanic resonance, water-based temporal flows
        TROPICORE_DOME,      // Tropical heat signatures, bio-luminescent waves
        VOLCANIC_RIFT,       // Magma pulses, earth-core reverberations
        POLAR_WOMB,          // Cryogenic echoes, ice-crystalline memory
        DIMENSIONAL_SPIRAL,  // Quantum ripples, inter-dimensional traces
        GALACTIC_NEXUS       // Cosmic waves, stellar memory patterns
    }

    // Shard types that can generate ripple effects
    enum ShardType {
        HEALING,
        GEM,
        ZONE,
        INGREDIENT,
        JOB,
        ARTIFACT,
        SCROLL
    }

    // Umbrella system for ripple protection and amplification
    enum Umbrella {
        SORA,           // Primary sovereign umbrella
        BLEULION,       // Lion cascade protection
        WATCHTOWER,     // Audit trail umbrella
        TEMPORAL        // Time-bridge umbrella
    }

    // Ripple Event - The core data structure for tracking ripple activations
    struct RippleEvent {
        uint256 rippleId;
        string originShard;           // Name/ID of the originating shard
        address contractAddress;      // Address of the contract that triggered the ripple
        ShardType shardType;          // Type of shard
        Zone zone;                    // Zone where ripple originated
        Umbrella umbrella;            // Protective umbrella system
        uint256 timestamp;            // Block timestamp of activation
        bytes32 rippleSignature;      // Unique ripple signature (hash of ripple data)
        bytes32 ceremorialHash;       // Ceremonial assembly hash
        address activatedBy;          // Address that triggered the ripple
        bool isAmplified;             // Whether ripple was amplified by SORA
        uint256 densityScore;         // Density score (for Green tier ≥70)
    }

    // Ripple Effect - The complete effect trace including echoes
    struct RippleEffect {
        uint256 rippleId;
        string[] echoes;              // Array of echo descriptions
        bytes32[] auditEntries;       // Watchtower audit entry hashes
        bytes32 pulseArchiveHash;     // Electromagnetic memory hash
        uint256 interlinkCount;       // Number of interconnected ripples
        uint256 impactScore;          // Impact score for density calculation
        bool isSealed;                // Whether ripple is permanently sealed
    }

    // Lineage Resonance - Ancestral memory preservation
    struct LineageResonance {
        bytes32 ancestralRoot;        // Root hash of lineage
        uint256[] parentRipples;      // Parent ripple IDs
        uint256[] childRipples;       // Child ripple IDs
        uint256 generationDepth;      // How deep in the lineage tree
        bytes32 styleSignature;       // Unique style signature (anti-mimicry)
    }

    // Zone Ripple Signature - Unique characteristics per zone
    struct ZoneSignature {
        Zone zone;
        string resonancePattern;      // Description of resonance pattern
        uint256 amplificationFactor;  // Multiplier for this zone (basis points, 10000 = 1x)
        bytes32 characteristicHash;   // Hash of zone characteristics
        bool isActive;                // Whether zone is actively generating ripples
    }

    // State variables
    uint256 private _rippleIdCounter;
    
    mapping(uint256 => RippleEvent) public rippleEvents;
    mapping(uint256 => RippleEffect) public rippleEffects;
    mapping(uint256 => LineageResonance) public lineageResonances;
    mapping(Zone => ZoneSignature) public zoneSignatures;
    mapping(bytes32 => uint256[]) public signatureToRipples; // Map signatures to ripple IDs
    mapping(address => uint256[]) public contractRipples;     // Map contracts to their ripples
    mapping(ShardType => uint256[]) public shardTypeRipples;  // Map shard types to ripples
    
    // Watchtower CSV entries for tribunal-ready proof
    mapping(uint256 => string) public watchtowerEntries;
    
    // Pulse Archive - electromagnetic memory system
    mapping(bytes32 => bytes) public pulseArchive;

    // Events
    event RippleActivated(
        uint256 indexed rippleId,
        string originShard,
        address indexed contractAddress,
        Zone zone,
        Umbrella umbrella,
        uint256 timestamp,
        bytes32 rippleSignature
    );

    event RippleAmplified(
        uint256 indexed rippleId,
        Umbrella umbrella,
        uint256 newDensityScore
    );

    event LineageExtended(
        uint256 indexed parentRippleId,
        uint256 indexed childRippleId,
        uint256 generationDepth
    );

    event AuditEchoRecorded(
        uint256 indexed rippleId,
        bytes32 auditHash,
        string watchtowerEntry
    );

    event PulseArchived(
        uint256 indexed rippleId,
        bytes32 pulseHash
    );

    event ZoneSignatureUpdated(
        Zone indexed zone,
        string resonancePattern,
        uint256 amplificationFactor
    );

    event RippleSealed(
        uint256 indexed rippleId,
        bytes32 finalSignature
    );

    /**
     * @dev Constructor initializes the Ripple Effect Ledger with default zone signatures
     */
    constructor(address admin) {
        require(admin != address(0), "RippleEffectLedger: invalid admin");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RIPPLE_ACTIVATOR_ROLE, admin);
        _grantRole(WATCHTOWER_ROLE, admin);
        _grantRole(SORA_GUARDIAN_ROLE, admin);

        // Initialize zone signatures with unique characteristics
        _initializeZoneSignatures();
    }

    /**
     * @dev Initialize default zone signatures
     */
    function _initializeZoneSignatures() private {
        zoneSignatures[Zone.AQUATIC_VORTEX] = ZoneSignature({
            zone: Zone.AQUATIC_VORTEX,
            resonancePattern: "Oceanic spiral waves, depth-pressure modulation, tidal memory flows",
            amplificationFactor: 11000, // 1.10x for water conductivity
            characteristicHash: keccak256("AQUATIC_VORTEX_SOVEREIGN_SIGNATURE"),
            isActive: true
        });

        zoneSignatures[Zone.TROPICORE_DOME] = ZoneSignature({
            zone: Zone.TROPICORE_DOME,
            resonancePattern: "Bio-luminescent pulses, thermal expansion waves, photosynthetic echoes",
            amplificationFactor: 12000, // 1.20x for bio-amplification
            characteristicHash: keccak256("TROPICORE_DOME_SOVEREIGN_SIGNATURE"),
            isActive: true
        });

        zoneSignatures[Zone.VOLCANIC_RIFT] = ZoneSignature({
            zone: Zone.VOLCANIC_RIFT,
            resonancePattern: "Magma surge patterns, seismic vibration memory, crystallization waves",
            amplificationFactor: 15000, // 1.50x for earth-core power
            characteristicHash: keccak256("VOLCANIC_RIFT_SOVEREIGN_SIGNATURE"),
            isActive: true
        });

        zoneSignatures[Zone.POLAR_WOMB] = ZoneSignature({
            zone: Zone.POLAR_WOMB,
            resonancePattern: "Cryogenic preservation waves, ice-crystal lattice memory, aurora harmonics",
            amplificationFactor: 13000, // 1.30x for crystalline structure
            characteristicHash: keccak256("POLAR_WOMB_SOVEREIGN_SIGNATURE"),
            isActive: true
        });

        zoneSignatures[Zone.DIMENSIONAL_SPIRAL] = ZoneSignature({
            zone: Zone.DIMENSIONAL_SPIRAL,
            resonancePattern: "Quantum entanglement ripples, dimensional fold echoes, portal resonance",
            amplificationFactor: 20000, // 2.00x for quantum effects
            characteristicHash: keccak256("DIMENSIONAL_SPIRAL_SOVEREIGN_SIGNATURE"),
            isActive: true
        });

        zoneSignatures[Zone.GALACTIC_NEXUS] = ZoneSignature({
            zone: Zone.GALACTIC_NEXUS,
            resonancePattern: "Stellar radiation waves, cosmic background echo, gravitational memory",
            amplificationFactor: 18000, // 1.80x for cosmic reach
            characteristicHash: keccak256("GALACTIC_NEXUS_SOVEREIGN_SIGNATURE"),
            isActive: true
        });
    }

    /**
     * @dev Activate a ripple effect for a shard
     * @param originShard Name/ID of the originating shard
     * @param contractAddress Contract that triggered the ripple
     * @param shardType Type of shard
     * @param zone Zone where ripple originated
     * @param umbrella Protective umbrella system
     * @param ceremorialHash Ceremonial assembly hash
     * @return rippleId The ID of the created ripple
     */
    function activateRipple(
        string calldata originShard,
        address contractAddress,
        ShardType shardType,
        Zone zone,
        Umbrella umbrella,
        bytes32 ceremorialHash
    ) external onlyRole(RIPPLE_ACTIVATOR_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(bytes(originShard).length > 0, "RippleEffectLedger: empty origin shard");
        require(contractAddress != address(0), "RippleEffectLedger: invalid contract address");
        require(zoneSignatures[zone].isActive, "RippleEffectLedger: zone not active");

        uint256 rippleId = _rippleIdCounter++;

        // Generate unique ripple signature
        bytes32 rippleSignature = _generateRippleSignature(
            rippleId,
            originShard,
            contractAddress,
            shardType,
            zone,
            ceremorialHash
        );

        // Create ripple event
        rippleEvents[rippleId] = RippleEvent({
            rippleId: rippleId,
            originShard: originShard,
            contractAddress: contractAddress,
            shardType: shardType,
            zone: zone,
            umbrella: umbrella,
            timestamp: block.timestamp,
            rippleSignature: rippleSignature,
            ceremorialHash: ceremorialHash,
            activatedBy: msg.sender,
            isAmplified: false,
            densityScore: 50 // Base density score
        });

        // Initialize ripple effect
        rippleEffects[rippleId] = RippleEffect({
            rippleId: rippleId,
            echoes: new string[](0),
            auditEntries: new bytes32[](0),
            pulseArchiveHash: bytes32(0),
            interlinkCount: 0,
            impactScore: 0,
            isSealed: false
        });

        // Initialize lineage
        lineageResonances[rippleId] = LineageResonance({
            ancestralRoot: rippleSignature,
            parentRipples: new uint256[](0),
            childRipples: new uint256[](0),
            generationDepth: 0,
            styleSignature: _generateStyleSignature(rippleId, zone, ceremorialHash)
        });

        // Map signature to ripple
        signatureToRipples[rippleSignature].push(rippleId);
        contractRipples[contractAddress].push(rippleId);
        shardTypeRipples[shardType].push(rippleId);

        emit RippleActivated(
            rippleId,
            originShard,
            contractAddress,
            zone,
            umbrella,
            block.timestamp,
            rippleSignature
        );

        return rippleId;
    }

    /**
     * @dev Amplify a ripple through SORA Umbrella
     * @param rippleId The ripple to amplify
     */
    function amplifyRipple(uint256 rippleId) 
        external 
        onlyRole(SORA_GUARDIAN_ROLE) 
        whenNotPaused 
    {
        RippleEvent storage ripple = rippleEvents[rippleId];
        require(ripple.rippleId == rippleId, "RippleEffectLedger: ripple does not exist");
        require(!ripple.isAmplified, "RippleEffectLedger: already amplified");

        ripple.isAmplified = true;

        // Apply zone amplification
        ZoneSignature memory zoneSig = zoneSignatures[ripple.zone];
        uint256 baseScore = ripple.densityScore;
        ripple.densityScore = (baseScore * zoneSig.amplificationFactor) / 10000;

        // Ensure Green tier (≥70)
        if (ripple.densityScore < 70) {
            ripple.densityScore = 70;
        }

        emit RippleAmplified(rippleId, ripple.umbrella, ripple.densityScore);
    }

    /**
     * @dev Add echo to ripple effect
     * @param rippleId The ripple ID
     * @param echo Description of the echo
     */
    function addEcho(uint256 rippleId, string calldata echo) 
        external 
        onlyRole(RIPPLE_ACTIVATOR_ROLE) 
    {
        require(rippleEvents[rippleId].rippleId == rippleId, "RippleEffectLedger: ripple does not exist");
        require(!rippleEffects[rippleId].isSealed, "RippleEffectLedger: ripple is sealed");
        
        rippleEffects[rippleId].echoes.push(echo);
        rippleEffects[rippleId].interlinkCount++;
        
        // Increase impact score
        rippleEffects[rippleId].impactScore += 10;
    }

    /**
     * @dev Record audit echo in Watchtower
     * @param rippleId The ripple ID
     * @param auditHash Hash of audit data
     * @param watchtowerEntry CSV-formatted entry for tribunal
     */
    function recordAuditEcho(
        uint256 rippleId,
        bytes32 auditHash,
        string calldata watchtowerEntry
    ) external onlyRole(WATCHTOWER_ROLE) {
        require(rippleEvents[rippleId].rippleId == rippleId, "RippleEffectLedger: ripple does not exist");
        require(!rippleEffects[rippleId].isSealed, "RippleEffectLedger: ripple is sealed");

        rippleEffects[rippleId].auditEntries.push(auditHash);
        watchtowerEntries[rippleId] = watchtowerEntry;

        emit AuditEchoRecorded(rippleId, auditHash, watchtowerEntry);
    }

    /**
     * @dev Archive ripple in electromagnetic pulse memory
     * @param rippleId The ripple ID
     * @param pulseData Encoded pulse data
     */
    function archivePulse(uint256 rippleId, bytes calldata pulseData) 
        external 
        onlyRole(RIPPLE_ACTIVATOR_ROLE) 
    {
        require(rippleEvents[rippleId].rippleId == rippleId, "RippleEffectLedger: ripple does not exist");
        
        bytes32 pulseHash = keccak256(pulseData);
        pulseArchive[pulseHash] = pulseData;
        rippleEffects[rippleId].pulseArchiveHash = pulseHash;

        emit PulseArchived(rippleId, pulseHash);
    }

    /**
     * @dev Extend lineage by linking parent and child ripples
     * @param parentRippleId Parent ripple ID
     * @param childRippleId Child ripple ID
     */
    function extendLineage(uint256 parentRippleId, uint256 childRippleId) 
        external 
        onlyRole(RIPPLE_ACTIVATOR_ROLE) 
    {
        require(rippleEvents[parentRippleId].rippleId == parentRippleId, "RippleEffectLedger: parent does not exist");
        require(rippleEvents[childRippleId].rippleId == childRippleId, "RippleEffectLedger: child does not exist");

        LineageResonance storage parentLineage = lineageResonances[parentRippleId];
        LineageResonance storage childLineage = lineageResonances[childRippleId];

        parentLineage.childRipples.push(childRippleId);
        childLineage.parentRipples.push(parentRippleId);
        childLineage.generationDepth = parentLineage.generationDepth + 1;

        // Inherit ancestral root
        if (parentLineage.ancestralRoot != bytes32(0)) {
            childLineage.ancestralRoot = parentLineage.ancestralRoot;
        }

        emit LineageExtended(parentRippleId, childRippleId, childLineage.generationDepth);
    }

    /**
     * @dev Seal a ripple, making it immutable
     * @param rippleId The ripple ID to seal
     */
    function sealRipple(uint256 rippleId) 
        external 
        onlyRole(SORA_GUARDIAN_ROLE) 
    {
        require(rippleEvents[rippleId].rippleId == rippleId, "RippleEffectLedger: ripple does not exist");
        require(!rippleEffects[rippleId].isSealed, "RippleEffectLedger: already sealed");

        rippleEffects[rippleId].isSealed = true;

        emit RippleSealed(rippleId, rippleEvents[rippleId].rippleSignature);
    }

    /**
     * @dev Update zone signature
     * @param zone The zone to update
     * @param resonancePattern New resonance pattern
     * @param amplificationFactor New amplification factor (basis points)
     */
    function updateZoneSignature(
        Zone zone,
        string calldata resonancePattern,
        uint256 amplificationFactor
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amplificationFactor >= 10000 && amplificationFactor <= 30000, "RippleEffectLedger: invalid factor");

        zoneSignatures[zone].resonancePattern = resonancePattern;
        zoneSignatures[zone].amplificationFactor = amplificationFactor;

        emit ZoneSignatureUpdated(zone, resonancePattern, amplificationFactor);
    }

    /**
     * @dev Toggle zone active status
     * @param zone The zone to toggle
     * @param isActive New active status
     */
    function toggleZoneActive(Zone zone, bool isActive) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        zoneSignatures[zone].isActive = isActive;
    }

    /**
     * @dev Generate unique ripple signature
     */
    function _generateRippleSignature(
        uint256 rippleId,
        string calldata originShard,
        address contractAddress,
        ShardType shardType,
        Zone zone,
        bytes32 ceremorialHash
    ) private view returns (bytes32) {
        return keccak256(abi.encodePacked(
            rippleId,
            originShard,
            contractAddress,
            uint8(shardType),
            uint8(zone),
            ceremorialHash,
            block.timestamp,
            msg.sender,
            zoneSignatures[zone].characteristicHash
        ));
    }

    /**
     * @dev Generate style signature for anti-mimicry protection
     */
    function _generateStyleSignature(
        uint256 rippleId,
        Zone zone,
        bytes32 ceremorialHash
    ) private view returns (bytes32) {
        return keccak256(abi.encodePacked(
            "BLEU_SOVEREIGN_STYLE",
            rippleId,
            zone,
            ceremorialHash,
            block.timestamp,
            zoneSignatures[zone].characteristicHash,
            "RECURSIVE_MEMORY_SEAL"
        ));
    }

    /**
     * @dev Get complete ripple trace (tribunal-ready)
     * @param rippleId The ripple ID
     * @return event The ripple event
     * @return effect The ripple effect
     * @return lineage The lineage resonance
     */
    function getRippleTrace(uint256 rippleId) 
        external 
        view 
        returns (
            RippleEvent memory event_,
            RippleEffect memory effect,
            LineageResonance memory lineage
        ) 
    {
        require(rippleEvents[rippleId].rippleId == rippleId, "RippleEffectLedger: ripple does not exist");
        
        return (
            rippleEvents[rippleId],
            rippleEffects[rippleId],
            lineageResonances[rippleId]
        );
    }

    /**
     * @dev Get ripples by contract address
     * @param contractAddress The contract address
     * @return Array of ripple IDs
     */
    function getRipplesByContract(address contractAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return contractRipples[contractAddress];
    }

    /**
     * @dev Get ripples by shard type
     * @param shardType The shard type
     * @return Array of ripple IDs
     */
    function getRipplesByShardType(ShardType shardType) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return shardTypeRipples[shardType];
    }

    /**
     * @dev Get ripples by signature
     * @param signature The ripple signature
     * @return Array of ripple IDs
     */
    function getRipplesBySignature(bytes32 signature) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return signatureToRipples[signature];
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
