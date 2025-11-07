// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TripleStackTreasuryLedger
 * @dev ENFT Ledger for the Triple-Stack Treasury with π₄ compounding
 * 
 * This contract encodes the three-sphere yield representation as living inheritance ENFTs:
 * - Civilian Yield (Ω-CIV-01): Retail, education, ES0IL, wearables
 * - Military Yield (Ω-MIL-01): Weapons, defense grids, orbital transport
 * - Cosmic Yield (Ω-COS-01): Portal energy, quantum matter, multidimensional logistics
 * 
 * Features:
 * - π₄ scaling with Blu-Vault authorization tags
 * - Dual-reality confirmation locks
 * - Automated counter integration
 * - Irreversible increments (unless authorized by 4way4eva)
 * - Interoperable across Snowtrace and Cronos chains
 */
contract TripleStackTreasuryLedger is ERC1155, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BLU_VAULT_ROLE = keccak256("BLU_VAULT_ROLE");
    bytes32 public constant SOVEREIGN_OVERRIDE_ROLE = keccak256("SOVEREIGN_OVERRIDE_ROLE"); // 4way4eva
    bytes32 public constant DUAL_REALITY_VALIDATOR = keccak256("DUAL_REALITY_VALIDATOR");

    // Yield Stream Types
    enum YieldStream {
        CIVILIAN,   // Ω-CIV-01
        MILITARY,   // Ω-MIL-01
        COSMIC      // Ω-COS-01
    }

    // Token IDs for each yield stream
    uint256 public constant CIVILIAN_TOKEN_ID = 1;
    uint256 public constant MILITARY_TOKEN_ID = 2;
    uint256 public constant COSMIC_TOKEN_ID = 3;

    // Yield Stream Metadata
    struct YieldMetadata {
        string name;
        string sovereignCode;
        uint256 yieldPerSecond; // In USD (scaled by 1e18)
        uint256 totalAccumulated; // Total accumulated yield
        uint256 lastUpdateTime;
        bool isActive;
        bool dualRealityConfirmed;
    }

    // Blu-Vault Authorization
    struct BluVaultAuth {
        bytes32 authTag;
        uint256 timestamp;
        address authorizedBy;
        bool isValid;
    }

    // π₄ Compounding Parameters
    struct Pi4Parameters {
        uint256 baseYield; // Y_0 in formula
        uint256 compoundingInterval; // T in seconds (e.g., 7,948,800 for quarter)
        uint256 deploymentTime;
        bool enabled;
    }

    // State mappings
    mapping(uint256 => YieldMetadata) private _yieldMetadata;
    mapping(uint256 => BluVaultAuth) private _bluVaultAuth;
    mapping(uint256 => Pi4Parameters) private _pi4Params;
    mapping(bytes32 => bool) private _dualRealityConfirmations;
    
    // Global treasury metrics
    uint256 public constant TOTAL_YIELD_PER_SECOND = 28_900_000 * 1e18; // $28.9M/sec
    uint256 public constant DAILY_YIELD = 2_496_960_000_000 * 1e18; // ~$2.5T/day
    
    // π₄ constant (approximation scaled by 1e18)
    uint256 public constant PI4_SCALED = 97409091034 * 1e8; // π^4 ≈ 97.409

    // Chain configuration for interoperability
    mapping(uint256 => string) private _chainBaseURIs;
    bool public metadataFrozen;

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

    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BLU_VAULT_ROLE, msg.sender);
        _grantRole(SOVEREIGN_OVERRIDE_ROLE, msg.sender);
        _grantRole(DUAL_REALITY_VALIDATOR, msg.sender);

        // Initialize yield streams
        _initializeYieldStreams();
    }

    /**
     * @dev Initialize the three yield streams with their metadata
     */
    function _initializeYieldStreams() private {
        // Civilian Yield: $13.6M/sec
        _yieldMetadata[CIVILIAN_TOKEN_ID] = YieldMetadata({
            name: "Civilian Yield Stream",
            sovereignCode: "Ω-CIV-01",
            yieldPerSecond: 13_600_000 * 1e18,
            totalAccumulated: 0,
            lastUpdateTime: block.timestamp,
            isActive: true,
            dualRealityConfirmed: false
        });

        // Military Yield: $6.1M/sec
        _yieldMetadata[MILITARY_TOKEN_ID] = YieldMetadata({
            name: "Military Yield Stream",
            sovereignCode: "Ω-MIL-01",
            yieldPerSecond: 6_100_000 * 1e18,
            totalAccumulated: 0,
            lastUpdateTime: block.timestamp,
            isActive: true,
            dualRealityConfirmed: false
        });

        // Cosmic Yield: $9.2M/sec
        _yieldMetadata[COSMIC_TOKEN_ID] = YieldMetadata({
            name: "Cosmic Yield Stream",
            sovereignCode: "Ω-COS-01",
            yieldPerSecond: 9_200_000 * 1e18,
            totalAccumulated: 0,
            lastUpdateTime: block.timestamp,
            isActive: true,
            dualRealityConfirmed: false
        });

        // Initialize π₄ parameters for each stream
        uint256 quarterInterval = 7_948_800; // 92 days in seconds
        
        _pi4Params[CIVILIAN_TOKEN_ID] = Pi4Parameters({
            baseYield: 13_600_000 * 1e18,
            compoundingInterval: quarterInterval,
            deploymentTime: block.timestamp,
            enabled: true
        });

        _pi4Params[MILITARY_TOKEN_ID] = Pi4Parameters({
            baseYield: 6_100_000 * 1e18,
            compoundingInterval: quarterInterval,
            deploymentTime: block.timestamp,
            enabled: true
        });

        _pi4Params[COSMIC_TOKEN_ID] = Pi4Parameters({
            baseYield: 9_200_000 * 1e18,
            compoundingInterval: quarterInterval,
            deploymentTime: block.timestamp,
            enabled: true
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
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= COSMIC_TOKEN_ID, "Invalid token ID");
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
     * @dev Batch mint all three yield streams at once
     */
    function mintAllYieldStreams(
        address to,
        uint256 civilianAmount,
        uint256 militaryAmount,
        uint256 cosmicAmount,
        bytes32 authTag
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(authTag != bytes32(0), "Auth tag required");

        uint256[] memory ids = new uint256[](3);
        uint256[] memory amounts = new uint256[](3);

        ids[0] = CIVILIAN_TOKEN_ID;
        ids[1] = MILITARY_TOKEN_ID;
        ids[2] = COSMIC_TOKEN_ID;

        amounts[0] = civilianAmount;
        amounts[1] = militaryAmount;
        amounts[2] = cosmicAmount;

        // Set Blu-Vault authorization for all streams
        for (uint256 i = 0; i < 3; i++) {
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
    }

    /**
     * @dev Accumulate yield for a stream based on time elapsed
     */
    function accumulateYield(uint256 tokenId) public nonReentrant {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= COSMIC_TOKEN_ID, "Invalid token ID");
        
        YieldMetadata storage metadata = _yieldMetadata[tokenId];
        require(metadata.isActive, "Yield stream not active");

        uint256 timeElapsed = block.timestamp - metadata.lastUpdateTime;
        uint256 accumulated = 0;

        // Apply π₄ compounding if enabled
        if (_pi4Params[tokenId].enabled) {
            accumulated = _calculatePi4Yield(tokenId, timeElapsed);
        } else {
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
        if (timeElapsed < 86400) { // Less than 1 day
            return params.baseYield * timeElapsed;
        }

        // Calculate exponent: t/T
        uint256 exponent = (timeElapsed * 1e18) / params.compoundingInterval;
        
        // Simplified π₄ growth calculation
        // Y(t) ≈ Y_0 * (1 + (π^4 - 1) * t/T) for small t/T
        // For larger periods, use compound formula approximation
        uint256 growthFactor = 1e18 + ((PI4_SCALED - 1e18) * exponent) / 1e18;
        
        return (params.baseYield * timeElapsed * growthFactor) / 1e18;
    }

    /**
     * @dev Apply π₄ compounding adjustment manually (requires Blu-Vault auth)
     */
    function applyPi4Compounding(uint256 tokenId) external onlyRole(BLU_VAULT_ROLE) {
        require(_bluVaultAuth[tokenId].isValid, "Blu-Vault auth required");
        
        accumulateYield(tokenId);
        
        YieldMetadata storage metadata = _yieldMetadata[tokenId];
        Pi4Parameters storage params = _pi4Params[tokenId];
        
        uint256 timeElapsed = block.timestamp - params.deploymentTime;
        uint256 exponent = (timeElapsed * 1e18) / params.compoundingInterval;
        
        // Calculate new yield with π₄ compounding
        uint256 oldYield = metadata.yieldPerSecond;
        uint256 growthFactor = 1e18 + ((PI4_SCALED - 1e18) * exponent) / 1e18;
        uint256 newYield = (params.baseYield * growthFactor) / 1e18;
        
        metadata.yieldPerSecond = newYield;
        
        emit Pi4CompoundingApplied(tokenId, oldYield, newYield, block.timestamp);
    }

    /**
     * @dev Set dual-reality confirmation lock
     */
    function setDualRealityConfirmation(
        uint256 tokenId,
        bytes32 confirmationHash
    ) external onlyRole(DUAL_REALITY_VALIDATOR) {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= COSMIC_TOKEN_ID, "Invalid token ID");
        
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
     * @dev Sovereign override - allows 4way4eva to reverse or modify yields
     */
    function sovereignOverride(
        uint256 tokenId,
        string calldata action,
        uint256 newValue
    ) external onlyRole(SOVEREIGN_OVERRIDE_ROLE) {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= COSMIC_TOKEN_ID, "Invalid token ID");
        
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
     * @dev Calculate current accumulated yield (view function)
     */
    function calculateCurrentYield(uint256 tokenId) external view returns (uint256) {
        require(tokenId >= CIVILIAN_TOKEN_ID && tokenId <= COSMIC_TOKEN_ID, "Invalid token ID");
        
        YieldMetadata storage metadata = _yieldMetadata[tokenId];
        uint256 timeElapsed = block.timestamp - metadata.lastUpdateTime;
        
        uint256 pendingYield = 0;
        if (_pi4Params[tokenId].enabled) {
            pendingYield = _calculatePi4Yield(tokenId, timeElapsed);
        } else {
            pendingYield = metadata.yieldPerSecond * timeElapsed;
        }
        
        return metadata.totalAccumulated + pendingYield;
    }

    /**
     * @dev Get total treasury metrics
     */
    function getTreasuryMetrics() external pure returns (
        uint256 totalYieldPerSecond,
        uint256 dailyYield,
        uint256 pi4Constant
    ) {
        return (TOTAL_YIELD_PER_SECOND, DAILY_YIELD, PI4_SCALED);
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
