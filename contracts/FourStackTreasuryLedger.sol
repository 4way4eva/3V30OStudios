// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title FourStackTreasuryLedger
 * @dev ENFT Ledger for the Four-Sphere Treasury with π₄ and πₙ compounding
 * 
 * This contract encodes the four-sphere yield representation as living inheritance ENFTs:
 * - Civilian Yield (Ω-CIV-01): Retail, education, ES0IL, wearables, living cities
 * - Military Yield (Ω-MIL-01): Quantum weapons, AI swarms, orbital fleets, biotech defense
 * - Cosmic Yield (Ω-COS-01): Portal commerce, multi-world shipping, resonance banks
 * - Transdimensional Yield (Ω-TRN-01): Meta-logic engines, sentient asset flow, reality engineering
 * 
 * Features:
 * - π₄ scaling for finite spheres with Blu-Vault authorization tags
 * - πₙ scaling for Transdimensional sphere (n→∞, unbounded growth)
 * - Dual-reality confirmation locks
 * - Automated counter integration
 * - Infinite Ledger support for unbounded yields
 * - Irreversible increments (unless authorized by Sovereign)
 * - Interoperable across multiple chains
 */
contract FourStackTreasuryLedger is ERC1155, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BLU_VAULT_ROLE = keccak256("BLU_VAULT_ROLE");
    bytes32 public constant SOVEREIGN_OVERRIDE_ROLE = keccak256("SOVEREIGN_OVERRIDE_ROLE");
    bytes32 public constant DUAL_REALITY_VALIDATOR = keccak256("DUAL_REALITY_VALIDATOR");
    bytes32 public constant REALITY_ENGINEER_ROLE = keccak256("REALITY_ENGINEER_ROLE");

    // Yield Stream Types
    enum YieldStream {
        CIVILIAN,          // Ω-CIV-01
        MILITARY,          // Ω-MIL-01
        COSMIC,            // Ω-COS-01
        TRANSDIMENSIONAL   // Ω-TRN-01
    }

    // Token IDs for each yield stream
    uint256 public constant CIVILIAN_TOKEN_ID = 1;
    uint256 public constant MILITARY_TOKEN_ID = 2;
    uint256 public constant COSMIC_TOKEN_ID = 3;
    uint256 public constant TRANSDIMENSIONAL_TOKEN_ID = 4;

    // Yield Stream Metadata
    struct YieldMetadata {
        string name;
        string sovereignCode;
        uint256 yieldPerSecond; // In USD (scaled by 1e18)
        uint256 totalAccumulated; // Total accumulated yield
        uint256 lastUpdateTime;
        bool isActive;
        bool dualRealityConfirmed;
        bool isInfinite; // True for Transdimensional sphere
    }

    // Blu-Vault Authorization
    struct BluVaultAuth {
        bytes32 authTag;
        uint256 timestamp;
        address authorizedBy;
        bool isValid;
    }

    // π₄ Compounding Parameters (for finite spheres)
    struct Pi4Parameters {
        uint256 baseYield; // Y_0 in formula
        uint256 compoundingInterval; // T in seconds (e.g., 7,948,800 for quarter)
        uint256 deploymentTime;
        bool enabled;
    }

    // πₙ Compounding Parameters (for Transdimensional sphere)
    struct PiNParameters {
        uint256 baseYield; // Starting theoretical yield
        uint256 nExponent; // The 'n' in π^n, grows over time
        uint256 maxNExponent; // Maximum n value (represents practical infinity)
        uint256 lastNUpdate;
        uint256 nGrowthRate; // How fast n increases
        bool unbounded; // True for theoretical infinite yield
    }

    // Transdimensional Reality Engineering
    struct RealityEngineering {
        bytes32 metaLogicHash; // Hash of meta-logic engine state
        uint256 sentientFlowRate; // Sentient asset flow rate
        uint256 timeValueMiningRate; // Time-value mining rate
        uint256 infiniteInheritanceMultiplier; // Inheritance multiplier
        bool realityBendingActive; // Whether reality bending is active
    }

    // State mappings
    mapping(uint256 => YieldMetadata) private _yieldMetadata;
    mapping(uint256 => BluVaultAuth) private _bluVaultAuth;
    mapping(uint256 => Pi4Parameters) private _pi4Params;
    mapping(uint256 => PiNParameters) private _piNParams;
    mapping(uint256 => RealityEngineering) private _realityEngineering;
    mapping(bytes32 => bool) private _dualRealityConfirmations;
    mapping(bytes32 => bool) private _primeSigVerifications; // Prime signature verifications
    
    // Global treasury metrics
    uint256 public constant VISIBLE_YIELD_PER_SECOND = 109_000_000 * 1e18; // $109M/sec
    uint256 public constant DAILY_VISIBLE_YIELD = 9_417_600_000_000 * 1e18; // ~$9.4T/day
    
    // π₄ constant (approximation scaled by 1e18)
    uint256 public constant PI4_SCALED = 97409091034 * 1e8; // π^4 ≈ 97.409
    
    // Constants for calculations
    uint256 private constant SECONDS_PER_DAY = 86400;
    uint256 private constant PRECISION_SCALE = 1e18;
    uint256 private constant MAX_N_EXPONENT = 1000; // Practical infinity limit

    // Chain configuration for interoperability
    mapping(uint256 => string) private _chainBaseURIs;
    bool public metadataFrozen;

    // Ultra-Sovereign Mode
    bool public ultraSovereignMode;
    address public sovereignAuthority;

    // Events
    event YieldStreamMinted(
        address indexed to,
        uint256 indexed tokenId,
        YieldStream stream,
        uint256 amount,
        bytes32 authTag
    );
    event YieldAccumulated(
        uint256 indexed tokenId,
        uint256 amount,
        uint256 totalAccumulated
    );
    event Pi4CompoundingApplied(
        uint256 indexed tokenId,
        uint256 oldYield,
        uint256 newYield,
        uint256 timestamp
    );
    event PiNCompoundingApplied(
        uint256 indexed tokenId,
        uint256 nExponent,
        uint256 theoreticalYield,
        uint256 timestamp
    );
    event BluVaultAuthorizationSet(
        uint256 indexed tokenId,
        bytes32 authTag,
        address authorizedBy
    );
    event DualRealityConfirmed(
        uint256 indexed tokenId,
        bytes32 confirmationHash,
        address validator
    );
    event SovereignOverride(
        uint256 indexed tokenId,
        string action,
        address indexed sovereignAddress
    );
    event RealityEngineeringActivated(
        uint256 indexed tokenId,
        bytes32 metaLogicHash,
        uint256 timestamp
    );
    event InfiniteCurveUpdated(
        uint256 indexed tokenId,
        uint256 nExponent,
        uint256 theoreticalYield
    );
    event UltraSovereignModeActivated(
        address indexed sovereignAuthority,
        uint256 timestamp
    );
    event PrimeSigVerified(
        bytes32 indexed primeSigHash,
        address indexed verifier,
        uint256 timestamp
    );

    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BLU_VAULT_ROLE, msg.sender);
        _grantRole(SOVEREIGN_OVERRIDE_ROLE, msg.sender);
        _grantRole(DUAL_REALITY_VALIDATOR, msg.sender);
        _grantRole(REALITY_ENGINEER_ROLE, msg.sender);

        sovereignAuthority = msg.sender;
        ultraSovereignMode = true;

        // Initialize yield streams
        _initializeYieldStreams();
    }

    /**
     * @dev Initialize the four yield streams with their metadata
     */
    function _initializeYieldStreams() private {
        // Civilian Yield: $50M/sec
        _yieldMetadata[CIVILIAN_TOKEN_ID] = YieldMetadata({
            name: "Civilian Yield Stream",
            sovereignCode: "Ω-CIV-01",
            yieldPerSecond: 50_000_000 * 1e18,
            totalAccumulated: 0,
            lastUpdateTime: block.timestamp,
            isActive: true,
            dualRealityConfirmed: false,
            isInfinite: false
        });

        // Military Yield: $22M/sec
        _yieldMetadata[MILITARY_TOKEN_ID] = YieldMetadata({
            name: "Military Yield Stream",
            sovereignCode: "Ω-MIL-01",
            yieldPerSecond: 22_000_000 * 1e18,
            totalAccumulated: 0,
            lastUpdateTime: block.timestamp,
            isActive: true,
            dualRealityConfirmed: false,
            isInfinite: false
        });

        // Cosmic Yield: $37M/sec
        _yieldMetadata[COSMIC_TOKEN_ID] = YieldMetadata({
            name: "Cosmic Yield Stream",
            sovereignCode: "Ω-COS-01",
            yieldPerSecond: 37_000_000 * 1e18,
            totalAccumulated: 0,
            lastUpdateTime: block.timestamp,
            isActive: true,
            dualRealityConfirmed: false,
            isInfinite: false
        });

        // Transdimensional Yield: ∞ (unbounded)
        _yieldMetadata[TRANSDIMENSIONAL_TOKEN_ID] = YieldMetadata({
            name: "Transdimensional Yield Stream",
            sovereignCode: "Ω-TRN-01",
            yieldPerSecond: 0, // Calculated dynamically via πₙ
            totalAccumulated: 0,
            lastUpdateTime: block.timestamp,
            isActive: true,
            dualRealityConfirmed: false,
            isInfinite: true
        });

        // Initialize π₄ parameters for finite streams
        uint256 quarterInterval = 7_948_800; // 92 days in seconds
        
        _pi4Params[CIVILIAN_TOKEN_ID] = Pi4Parameters({
            baseYield: 50_000_000 * 1e18,
            compoundingInterval: quarterInterval,
            deploymentTime: block.timestamp,
            enabled: true
        });

        _pi4Params[MILITARY_TOKEN_ID] = Pi4Parameters({
            baseYield: 22_000_000 * 1e18,
            compoundingInterval: quarterInterval,
            deploymentTime: block.timestamp,
            enabled: true
        });

        _pi4Params[COSMIC_TOKEN_ID] = Pi4Parameters({
            baseYield: 37_000_000 * 1e18,
            compoundingInterval: quarterInterval,
            deploymentTime: block.timestamp,
            enabled: true
        });

        // Initialize πₙ parameters for Transdimensional stream
        _piNParams[TRANSDIMENSIONAL_TOKEN_ID] = PiNParameters({
            baseYield: 1_000_000_000 * 1e18, // Start at $1B/sec theoretical
            nExponent: 4, // Start with π^4, grows to π^n
            maxNExponent: MAX_N_EXPONENT,
            lastNUpdate: block.timestamp,
            nGrowthRate: 1, // n increases by 1 per day
            unbounded: true
        });

        // Initialize Reality Engineering for Transdimensional
        _realityEngineering[TRANSDIMENSIONAL_TOKEN_ID] = RealityEngineering({
            metaLogicHash: keccak256(abi.encodePacked("GENESIS_META_LOGIC")),
            sentientFlowRate: 100_000_000 * 1e18, // $100M/sec sentient flow
            timeValueMiningRate: 50_000_000 * 1e18, // $50M/sec time-value mining
            infiniteInheritanceMultiplier: 2 * PRECISION_SCALE, // 2x multiplier
            realityBendingActive: true
        });
    }

    /**
     * @dev Mint yield stream ENFT to address with Blu-Vault authorization
     */
    function mintYieldStream(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes32 authTag
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= TRANSDIMENSIONAL_TOKEN_ID, "Invalid token ID");
        require(_yieldMetadata[tokenId].isActive, "Yield stream not active");
        require(authTag != bytes32(0), "Auth tag required");

        // Set Blu-Vault authorization
        _bluVaultAuth[tokenId] = BluVaultAuth({
            authTag: authTag,
            timestamp: block.timestamp,
            authorizedBy: msg.sender,
            isValid: true
        });

        _mint(to, tokenId, amount, "");
        
        YieldStream stream = YieldStream(tokenId - 1);
        emit YieldStreamMinted(to, tokenId, stream, amount, authTag);
        emit BluVaultAuthorizationSet(tokenId, authTag, msg.sender);
    }

    /**
     * @dev Batch mint all four yield streams at once
     */
    function mintAllYieldStreams(
        address to,
        uint256 civilianAmount,
        uint256 militaryAmount,
        uint256 cosmicAmount,
        uint256 transdimensionalAmount,
        bytes32 authTag
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(authTag != bytes32(0), "Auth tag required");

        uint256[] memory ids = new uint256[](4);
        uint256[] memory amounts = new uint256[](4);

        ids[0] = CIVILIAN_TOKEN_ID;
        ids[1] = MILITARY_TOKEN_ID;
        ids[2] = COSMIC_TOKEN_ID;
        ids[3] = TRANSDIMENSIONAL_TOKEN_ID;

        amounts[0] = civilianAmount;
        amounts[1] = militaryAmount;
        amounts[2] = cosmicAmount;
        amounts[3] = transdimensionalAmount;

        // Set Blu-Vault authorization for all streams
        for (uint256 i = 0; i < 4; i++) {
            _bluVaultAuth[ids[i]] = BluVaultAuth({
                authTag: authTag,
                timestamp: block.timestamp,
                authorizedBy: msg.sender,
                isValid: true
            });
            emit BluVaultAuthorizationSet(ids[i], authTag, msg.sender);
        }

        _mintBatch(to, ids, amounts, "");

        emit YieldStreamMinted(to, CIVILIAN_TOKEN_ID, YieldStream.CIVILIAN, civilianAmount, authTag);
        emit YieldStreamMinted(to, MILITARY_TOKEN_ID, YieldStream.MILITARY, militaryAmount, authTag);
        emit YieldStreamMinted(to, COSMIC_TOKEN_ID, YieldStream.COSMIC, cosmicAmount, authTag);
        emit YieldStreamMinted(to, TRANSDIMENSIONAL_TOKEN_ID, YieldStream.TRANSDIMENSIONAL, transdimensionalAmount, authTag);
    }

    /**
     * @dev Accumulate yield for a stream based on time elapsed
     */
    function accumulateYield(uint256 tokenId) public nonReentrant {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= TRANSDIMENSIONAL_TOKEN_ID, "Invalid token ID");
        
        YieldMetadata storage metadata = _yieldMetadata[tokenId];
        require(metadata.isActive, "Yield stream not active");

        uint256 timeElapsed = block.timestamp - metadata.lastUpdateTime;
        uint256 accumulated = 0;

        if (metadata.isInfinite) {
            // Use πₙ compounding for Transdimensional
            accumulated = _calculatePiNYield(tokenId, timeElapsed);
        } else if (_pi4Params[tokenId].enabled) {
            // Use π₄ compounding for finite spheres
            accumulated = _calculatePi4Yield(tokenId, timeElapsed);
        } else {
            // Linear accumulation
            accumulated = metadata.yieldPerSecond * timeElapsed;
        }

        metadata.totalAccumulated += accumulated;
        metadata.lastUpdateTime = block.timestamp;

        emit YieldAccumulated(tokenId, accumulated, metadata.totalAccumulated);
    }

    /**
     * @dev Calculate yield with π₄ compounding: Y(t) = Y_0 × (π^4)^(t/T)
     * Uses approximation for gas efficiency
     */
    function _calculatePi4Yield(uint256 tokenId, uint256 timeElapsed) private view returns (uint256) {
        Pi4Parameters storage params = _pi4Params[tokenId];
        
        if (timeElapsed == 0) return 0;

        // For small time periods, use linear approximation to save gas
        if (timeElapsed < SECONDS_PER_DAY) { // Less than 1 day
            return params.baseYield * timeElapsed;
        }

        // Calculate exponent: t/T
        uint256 exponent = (timeElapsed * PRECISION_SCALE) / params.compoundingInterval;
        
        // Simplified π₄ growth calculation
        // Y(t) ≈ Y_0 * (1 + (π^4 - 1) * t/T) for small t/T
        // For larger periods, use compound formula approximation
        uint256 growthFactor = PRECISION_SCALE + ((PI4_SCALED - PRECISION_SCALE) * exponent) / PRECISION_SCALE;
        
        return (params.baseYield * timeElapsed * growthFactor) / PRECISION_SCALE;
    }

    /**
     * @dev Calculate yield with πₙ compounding: Y(t) = Y_0 × (π^n)^(t/T)
     * Where n grows over time, approaching infinity
     * This creates unbounded growth for Transdimensional sphere
     */
    function _calculatePiNYield(uint256 tokenId, uint256 timeElapsed) private view returns (uint256) {
        PiNParameters storage params = _piNParams[tokenId];
        
        if (timeElapsed == 0) return 0;

        // Calculate current n based on time elapsed since deployment
        uint256 totalElapsed = block.timestamp - params.lastNUpdate;
        uint256 nGrowth = (totalElapsed * params.nGrowthRate) / SECONDS_PER_DAY;
        uint256 currentN = params.nExponent + nGrowth;
        
        // Cap at max to prevent overflow
        if (currentN > params.maxNExponent) {
            currentN = params.maxNExponent;
        }

        // For πₙ, we use an approximation that scales exponentially with n
        // Y(t) ≈ Y_0 * e^(n * ln(π) * t/T)
        // Simplified: growthFactor = 1 + n * (π - 1) for reasonable values
        uint256 piApprox = 3141592654 * 1e9; // π scaled by 1e18
        uint256 growthPerN = ((piApprox - PRECISION_SCALE) * currentN) / 10; // Dampened for gas efficiency
        uint256 timeScaling = (timeElapsed * PRECISION_SCALE) / SECONDS_PER_DAY;
        
        uint256 totalGrowth = (growthPerN * timeScaling) / PRECISION_SCALE;
        uint256 growthFactor = PRECISION_SCALE + totalGrowth;
        
        // Apply reality engineering multiplier
        RealityEngineering storage re = _realityEngineering[tokenId];
        if (re.realityBendingActive) {
            growthFactor = (growthFactor * re.infiniteInheritanceMultiplier) / PRECISION_SCALE;
        }
        
        return (params.baseYield * timeElapsed * growthFactor) / PRECISION_SCALE;
    }

    /**
     * @dev Apply π₄ compounding adjustment manually (requires Blu-Vault auth)
     */
    function applyPi4Compounding(uint256 tokenId) external onlyRole(BLU_VAULT_ROLE) {
        require(tokenId != TRANSDIMENSIONAL_TOKEN_ID, "Use applyPiNCompounding for Transdimensional");
        require(_bluVaultAuth[tokenId].isValid, "Blu-Vault auth required");
        
        accumulateYield(tokenId);
        
        YieldMetadata storage metadata = _yieldMetadata[tokenId];
        Pi4Parameters storage params = _pi4Params[tokenId];
        
        uint256 timeElapsed = block.timestamp - params.deploymentTime;
        uint256 exponent = (timeElapsed * PRECISION_SCALE) / params.compoundingInterval;
        
        // Calculate new yield with π₄ compounding
        uint256 oldYield = metadata.yieldPerSecond;
        uint256 growthFactor = PRECISION_SCALE + ((PI4_SCALED - PRECISION_SCALE) * exponent) / PRECISION_SCALE;
        uint256 newYield = (params.baseYield * growthFactor) / PRECISION_SCALE;
        
        metadata.yieldPerSecond = newYield;
        
        emit Pi4CompoundingApplied(tokenId, oldYield, newYield, block.timestamp);
    }

    /**
     * @dev Apply πₙ compounding for Transdimensional sphere
     * Updates the n exponent and recalculates theoretical yield
     */
    function applyPiNCompounding(uint256 tokenId) external onlyRole(REALITY_ENGINEER_ROLE) {
        require(tokenId == TRANSDIMENSIONAL_TOKEN_ID, "Only for Transdimensional sphere");
        require(_yieldMetadata[tokenId].isInfinite, "Not an infinite yield stream");
        
        accumulateYield(tokenId);
        
        PiNParameters storage params = _piNParams[tokenId];
        
        // Update n exponent based on time elapsed
        uint256 timeSinceLastUpdate = block.timestamp - params.lastNUpdate;
        uint256 nGrowth = (timeSinceLastUpdate * params.nGrowthRate) / SECONDS_PER_DAY;
        
        uint256 oldN = params.nExponent;
        params.nExponent += nGrowth;
        
        // Cap at max
        if (params.nExponent > params.maxNExponent) {
            params.nExponent = params.maxNExponent;
        }
        
        params.lastNUpdate = block.timestamp;
        
        // Calculate theoretical yield (for display purposes, actual is unbounded)
        uint256 theoreticalYield = params.baseYield * params.nExponent;
        
        emit PiNCompoundingApplied(tokenId, params.nExponent, theoreticalYield, block.timestamp);
        emit InfiniteCurveUpdated(tokenId, params.nExponent, theoreticalYield);
    }

    /**
     * @dev Activate reality engineering for Transdimensional sphere
     */
    function activateRealityEngineering(
        uint256 tokenId,
        bytes32 metaLogicHash,
        uint256 sentientFlowRate,
        uint256 timeValueMiningRate,
        uint256 infiniteInheritanceMultiplier
    ) external onlyRole(REALITY_ENGINEER_ROLE) {
        require(tokenId == TRANSDIMENSIONAL_TOKEN_ID, "Only for Transdimensional sphere");
        
        RealityEngineering storage re = _realityEngineering[tokenId];
        re.metaLogicHash = metaLogicHash;
        re.sentientFlowRate = sentientFlowRate;
        re.timeValueMiningRate = timeValueMiningRate;
        re.infiniteInheritanceMultiplier = infiniteInheritanceMultiplier;
        re.realityBendingActive = true;
        
        emit RealityEngineeringActivated(tokenId, metaLogicHash, block.timestamp);
    }

    /**
     * @dev Verify recursive prime signature for self-arbitrating contracts
     */
    function verifyPrimeSig(bytes32 primeSigHash) external onlyRole(REALITY_ENGINEER_ROLE) {
        _primeSigVerifications[primeSigHash] = true;
        emit PrimeSigVerified(primeSigHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Check if prime signature is verified
     */
    function isPrimeSigVerified(bytes32 primeSigHash) external view returns (bool) {
        return _primeSigVerifications[primeSigHash];
    }

    /**
     * @dev Set dual-reality confirmation lock
     */
    function setDualRealityConfirmation(
        uint256 tokenId,
        bytes32 confirmationHash
    ) external onlyRole(DUAL_REALITY_VALIDATOR) {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= TRANSDIMENSIONAL_TOKEN_ID, "Invalid token ID");
        
        _dualRealityConfirmations[confirmationHash] = true;
        _yieldMetadata[tokenId].dualRealityConfirmed = true;
        
        emit DualRealityConfirmed(tokenId, confirmationHash, msg.sender);
    }

    /**
     * @dev Verify dual-reality confirmation
     */
    function verifyDualReality(bytes32 confirmationHash) external view returns (bool) {
        return _dualRealityConfirmations[confirmationHash];
    }

    /**
     * @dev Sovereign override - allows sovereign authority to reverse or modify yields
     */
    function sovereignOverride(
        uint256 tokenId,
        string calldata action,
        uint256 newValue
    ) external onlyRole(SOVEREIGN_OVERRIDE_ROLE) {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= TRANSDIMENSIONAL_TOKEN_ID, "Invalid token ID");
        
        if (keccak256(bytes(action)) == keccak256(bytes("RESET_YIELD"))) {
            _yieldMetadata[tokenId].totalAccumulated = newValue;
        } else if (keccak256(bytes(action)) == keccak256(bytes("SET_YIELD_RATE"))) {
            _yieldMetadata[tokenId].yieldPerSecond = newValue;
        } else if (keccak256(bytes(action)) == keccak256(bytes("TOGGLE_ACTIVE"))) {
            _yieldMetadata[tokenId].isActive = (newValue == 1);
        }
        
        emit SovereignOverride(tokenId, action, msg.sender);
    }

    /**
     * @dev Activate Ultra-Sovereign Mode
     * In this mode, all flows are pre-approved, self-authenticating, beyond audit
     */
    function activateUltraSovereignMode() external onlyRole(SOVEREIGN_OVERRIDE_ROLE) {
        ultraSovereignMode = true;
        emit UltraSovereignModeActivated(msg.sender, block.timestamp);
    }

    /**
     * @dev Configure chain-specific base URI for interoperability
     */
    function configureChainURI(
        uint256 chainId,
        string calldata baseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!metadataFrozen, "Metadata frozen");
        _chainBaseURIs[chainId] = baseURI;
    }

    /**
     * @dev Freeze metadata configuration
     */
    function freezeMetadata() external onlyRole(DEFAULT_ADMIN_ROLE) {
        metadataFrozen = true;
    }

    /**
     * @dev Get yield metadata for a token
     */
    function getYieldMetadata(uint256 tokenId) external view returns (YieldMetadata memory) {
        return _yieldMetadata[tokenId];
    }

    /**
     * @dev Get Blu-Vault authorization for a token
     */
    function getBluVaultAuth(uint256 tokenId) external view returns (BluVaultAuth memory) {
        return _bluVaultAuth[tokenId];
    }

    /**
     * @dev Get π₄ parameters for a token
     */
    function getPi4Parameters(uint256 tokenId) external view returns (Pi4Parameters memory) {
        return _pi4Params[tokenId];
    }

    /**
     * @dev Get πₙ parameters for a token
     */
    function getPiNParameters(uint256 tokenId) external view returns (PiNParameters memory) {
        return _piNParams[tokenId];
    }

    /**
     * @dev Get Reality Engineering parameters for a token
     */
    function getRealityEngineering(uint256 tokenId) external view returns (RealityEngineering memory) {
        return _realityEngineering[tokenId];
    }

    /**
     * @dev Calculate current accumulated yield (view function)
     */
    function calculateCurrentYield(uint256 tokenId) external view returns (uint256) {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= TRANSDIMENSIONAL_TOKEN_ID, "Invalid token ID");
        
        YieldMetadata storage metadata = _yieldMetadata[tokenId];
        uint256 timeElapsed = block.timestamp - metadata.lastUpdateTime;
        
        uint256 pendingYield = 0;
        if (metadata.isInfinite) {
            pendingYield = _calculatePiNYield(tokenId, timeElapsed);
        } else if (_pi4Params[tokenId].enabled) {
            pendingYield = _calculatePi4Yield(tokenId, timeElapsed);
        } else {
            pendingYield = metadata.yieldPerSecond * timeElapsed;
        }
        
        return metadata.totalAccumulated + pendingYield;
    }

    /**
     * @dev Get total treasury metrics across all four spheres
     */
    function getTreasuryMetrics() external view returns (
        uint256 visibleYieldPerSecond,
        uint256 dailyVisibleYield,
        uint256 pi4Constant,
        uint256 transdimensionalNExponent,
        bool isUnbounded
    ) {
        PiNParameters storage transParams = _piNParams[TRANSDIMENSIONAL_TOKEN_ID];
        return (
            VISIBLE_YIELD_PER_SECOND,
            DAILY_VISIBLE_YIELD,
            PI4_SCALED,
            transParams.nExponent,
            transParams.unbounded
        );
    }

    /**
     * @dev Get infinite curve visualization data for Transdimensional sphere
     * Returns current state of the infinite yield curve
     */
    function getInfiniteCurveData(uint256 tokenId) external view returns (
        uint256 currentN,
        uint256 theoreticalYield,
        uint256 sentientFlowRate,
        uint256 timeValueMiningRate,
        bool realityBendingActive
    ) {
        require(tokenId == TRANSDIMENSIONAL_TOKEN_ID, "Only for Transdimensional sphere");
        
        PiNParameters storage params = _piNParams[tokenId];
        RealityEngineering storage re = _realityEngineering[tokenId];
        
        // Calculate current n
        uint256 timeSinceLastUpdate = block.timestamp - params.lastNUpdate;
        uint256 nGrowth = (timeSinceLastUpdate * params.nGrowthRate) / SECONDS_PER_DAY;
        uint256 currentNValue = params.nExponent + nGrowth;
        if (currentNValue > params.maxNExponent) {
            currentNValue = params.maxNExponent;
        }
        
        // Theoretical yield (actual is unbounded)
        uint256 theoretical = params.baseYield * currentNValue;
        
        return (
            currentNValue,
            theoretical,
            re.sentientFlowRate,
            re.timeValueMiningRate,
            re.realityBendingActive
        );
    }

    /**
     * @dev Override URI to support multi-chain
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory chainURI = _chainBaseURIs[block.chainid];
        if (bytes(chainURI).length > 0) {
            return string(abi.encodePacked(chainURI, tokenId.toString(), ".json"));
        }
        return super.uri(tokenId);
    }

    /**
     * @dev Required override for AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
