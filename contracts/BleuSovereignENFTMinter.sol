// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BleuSovereignENFTMinter
 * @notice BLEU Sovereign Ledger ENFT Minting System Codex
 * @dev Implements living inheritance entries for three-sphere yield tokenization:
 *      - Civilian ($13.6M/s) - Real estate, education, commerce, infrastructure
 *      - Military ($6.1M/s) - Defense, tactical operations, armaments
 *      - Cosmic ($9.2M/s) - Portal logistics, quantum tech, dimensional items
 * 
 * Features:
 * - Irreversible asset minting tied to ledger worth
 * - Metadata linking each ENFT to economic sphere
 * - Scalability into physical and interactive registries
 * - π₄ compounding triggers at ENFT level for future-yield acceleration
 * - Blu-Vault dual sign security protocols
 * - Fail-safe measures and emergency controls
 */
contract BleuSovereignENFTMinter is ERC1155, AccessControl, ReentrancyGuard, Pausable {
    using Strings for uint256;

    // =============================================================
    //                           ROLES
    // =============================================================
    
    bytes32 public constant SOVEREIGN_MINTER_ROLE = keccak256("SOVEREIGN_MINTER_ROLE");
    bytes32 public constant BLU_VAULT_ROLE = keccak256("BLU_VAULT_ROLE");
    bytes32 public constant DUAL_SIGN_ROLE = keccak256("DUAL_SIGN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // =============================================================
    //                        ENUMERATIONS
    // =============================================================
    
    /// @notice Economic sphere classification
    enum EconomicSphere {
        CIVILIAN,  // Ω-CIV: Real estate, education, commerce, infrastructure
        MILITARY,  // Ω-MIL: Defense, tactical operations, armaments
        COSMIC     // Ω-COS: Portal logistics, quantum tech, dimensional items
    }

    /// @notice Asset minting status (irreversible once LOCKED)
    enum MintingStatus {
        PENDING,        // Awaiting dual-signature authorization
        AUTHORIZED,     // Blu-Vault authorized, ready to mint
        LOCKED,         // Irreversibly minted and locked to ledger
        FAILED          // Failed authorization (can be retried)
    }

    // =============================================================
    //                          STRUCTS
    // =============================================================
    
    /// @notice Living inheritance entry - represents tokenized yield stream
    struct InheritanceEntry {
        uint256 tokenId;
        EconomicSphere sphere;
        uint256 yieldPerSecond;          // Yield rate in USD (scaled 1e18)
        uint256 ledgerWorth;             // Total worth tied to this ENFT
        uint256 pi4CompoundingRate;      // π₄ compounding factor (scaled 1e18)
        uint256 lastCompoundingTime;     // Last time π₄ was applied
        uint256 totalAccumulatedYield;   // Total yield accumulated
        uint256 mintedAt;                // Timestamp of minting
        bytes32 yieldTag;                // Unique yield identification tag
        bytes32 dualRealityHash;         // Hash for dual-reality confirmation
        string metadataURI;              // IPFS URI for metadata
        MintingStatus status;
        bool isIrreversible;             // Once true, cannot be modified
    }

    /// @notice Blu-Vault dual-signature authorization
    struct BluVaultAuthorization {
        bytes32 authId;
        address primarySigner;
        address secondarySigner;
        bool primarySigned;
        bool secondarySigned;
        uint256 timestamp;
        bytes32 authHash;
        bool isValid;
    }

    /// @notice Physical & interactive registry entry for dimensional economies
    struct RegistryEntry {
        uint256 tokenId;
        string physicalAssetId;          // Link to physical asset registry
        string interactiveRegistryId;    // Link to interactive/meta registry
        uint256[] linkedDimensions;      // Chain IDs or dimension identifiers
        bool synced;
        uint256 lastSyncTime;
    }

    // =============================================================
    //                          CONSTANTS
    // =============================================================
    
    /// @notice Yield rates per second (in USD, scaled by 1e18)
    uint256 public constant CIVILIAN_YIELD_RATE = 13_600_000 * 1e18;
    uint256 public constant MILITARY_YIELD_RATE = 6_100_000 * 1e18;
    uint256 public constant COSMIC_YIELD_RATE = 9_200_000 * 1e18;
    
    /// @notice Total system yield: $28.9M/sec ($2.5T/day)
    uint256 public constant TOTAL_SYSTEM_YIELD = 28_900_000 * 1e18;
    
    /// @notice π₄ constant (approximation scaled by 1e18)
    /// π^4 ≈ 97.409091034... exponential compounding factor
    uint256 public constant PI4_SCALED = 97409091034 * 1e8;
    
    /// @notice Compounding interval (92 days = 1 quarter)
    uint256 public constant COMPOUNDING_INTERVAL = 7_948_800; // seconds
    
    /// @notice Precision scale for calculations
    uint256 private constant PRECISION_SCALE = 1e18;

    // =============================================================
    //                          STORAGE
    // =============================================================
    
    /// @notice Token ID counter
    uint256 private _tokenIdCounter;
    
    /// @notice Mapping from token ID to inheritance entry
    mapping(uint256 => InheritanceEntry) public inheritanceEntries;
    
    /// @notice Mapping from token ID to Blu-Vault authorization
    mapping(uint256 => BluVaultAuthorization) public bluVaultAuthorizations;
    
    /// @notice Mapping from token ID to registry entry
    mapping(uint256 => RegistryEntry) public registryEntries;
    
    /// @notice Mapping from yield tag to token ID
    mapping(bytes32 => uint256) public yieldTagToTokenId;
    
    /// @notice Mapping from dual-reality hash to verification status
    mapping(bytes32 => bool) public dualRealityVerified;
    
    /// @notice Sphere-specific token arrays for enumeration
    mapping(EconomicSphere => uint256[]) public sphereTokens;
    
    /// @notice Total minted per sphere
    mapping(EconomicSphere => uint256) public sphereMintedCount;
    
    /// @notice Total locked value per sphere
    mapping(EconomicSphere => uint256) public sphereLockedValue;
    
    /// @notice Emergency shutdown flag
    bool public emergencyShutdown;

    // =============================================================
    //                          EVENTS
    // =============================================================
    
    event InheritanceEntryCreated(
        uint256 indexed tokenId,
        EconomicSphere indexed sphere,
        address indexed recipient,
        uint256 ledgerWorth,
        bytes32 yieldTag
    );
    
    event BluVaultAuthorizationCreated(
        uint256 indexed tokenId,
        bytes32 indexed authId,
        address primarySigner,
        address secondarySigner
    );
    
    event BluVaultSignatureApplied(
        uint256 indexed tokenId,
        bytes32 indexed authId,
        address signer,
        bool isPrimary
    );
    
    event InheritanceEntryMinted(
        uint256 indexed tokenId,
        EconomicSphere indexed sphere,
        address indexed recipient,
        uint256 amount,
        bytes32 yieldTag
    );
    
    event InheritanceEntryLocked(
        uint256 indexed tokenId,
        EconomicSphere indexed sphere,
        uint256 ledgerWorth,
        uint256 timestamp
    );
    
    event Pi4CompoundingApplied(
        uint256 indexed tokenId,
        uint256 oldYield,
        uint256 newYield,
        uint256 timestamp
    );
    
    event DualRealityConfirmed(
        uint256 indexed tokenId,
        bytes32 dualRealityHash,
        address validator
    );
    
    event RegistrySynced(
        uint256 indexed tokenId,
        string physicalAssetId,
        string interactiveRegistryId,
        uint256 timestamp
    );
    
    event EmergencyShutdownActivated(address indexed initiator, uint256 timestamp);
    event EmergencyShutdownDeactivated(address indexed initiator, uint256 timestamp);

    // =============================================================
    //                        CONSTRUCTOR
    // =============================================================
    
    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SOVEREIGN_MINTER_ROLE, msg.sender);
        _grantRole(BLU_VAULT_ROLE, msg.sender);
        _grantRole(DUAL_SIGN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
    }

    // =============================================================
    //                     MINTING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Create a new inheritance entry (requires Blu-Vault dual authorization)
     * @dev Step 1: Create entry in PENDING status
     * @param recipient Address to receive the ENFT
     * @param sphere Economic sphere classification
     * @param ledgerWorth Total worth tied to this ENFT (scaled 1e18)
     * @param yieldTag Unique yield identification tag
     * @param metadataURI IPFS URI for metadata
     * @param primarySigner First signer for Blu-Vault authorization
     * @param secondarySigner Second signer for Blu-Vault authorization
     * @return tokenId The created token ID
     */
    function createInheritanceEntry(
        address recipient,
        EconomicSphere sphere,
        uint256 ledgerWorth,
        bytes32 yieldTag,
        string calldata metadataURI,
        address primarySigner,
        address secondarySigner
    ) external onlyRole(SOVEREIGN_MINTER_ROLE) whenNotPaused returns (uint256) {
        require(!emergencyShutdown, "Emergency shutdown active");
        require(recipient != address(0), "Invalid recipient");
        require(ledgerWorth > 0, "Ledger worth must be positive");
        require(yieldTag != bytes32(0), "Invalid yield tag");
        require(yieldTagToTokenId[yieldTag] == 0, "Yield tag already used");
        require(primarySigner != address(0) && secondarySigner != address(0), "Invalid signers");
        require(primarySigner != secondarySigner, "Signers must be different");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Determine yield rate based on sphere
        uint256 yieldPerSecond = _getYieldRateForSphere(sphere);
        
        // Create inheritance entry
        inheritanceEntries[tokenId] = InheritanceEntry({
            tokenId: tokenId,
            sphere: sphere,
            yieldPerSecond: yieldPerSecond,
            ledgerWorth: ledgerWorth,
            pi4CompoundingRate: PI4_SCALED,
            lastCompoundingTime: block.timestamp,
            totalAccumulatedYield: 0,
            mintedAt: 0, // Not minted yet
            yieldTag: yieldTag,
            dualRealityHash: bytes32(0),
            metadataURI: metadataURI,
            status: MintingStatus.PENDING,
            isIrreversible: false
        });
        
        // Create Blu-Vault authorization
        bytes32 authId = keccak256(abi.encodePacked(
            tokenId,
            yieldTag,
            block.timestamp,
            block.number
        ));
        
        bytes32 authHash = keccak256(abi.encodePacked(
            authId,
            primarySigner,
            secondarySigner,
            tokenId,
            ledgerWorth
        ));
        
        bluVaultAuthorizations[tokenId] = BluVaultAuthorization({
            authId: authId,
            primarySigner: primarySigner,
            secondarySigner: secondarySigner,
            primarySigned: false,
            secondarySigned: false,
            timestamp: block.timestamp,
            authHash: authHash,
            isValid: true
        });
        
        // Register yield tag
        yieldTagToTokenId[yieldTag] = tokenId;
        
        // Add to sphere tracking
        sphereTokens[sphere].push(tokenId);
        
        emit InheritanceEntryCreated(tokenId, sphere, recipient, ledgerWorth, yieldTag);
        emit BluVaultAuthorizationCreated(tokenId, authId, primarySigner, secondarySigner);
        
        return tokenId;
    }
    
    /**
     * @notice Apply Blu-Vault signature (dual-sign security)
     * @dev Step 2: Apply signatures from authorized signers
     * @param tokenId Token ID to authorize
     */
    function applyBluVaultSignature(uint256 tokenId) external onlyRole(DUAL_SIGN_ROLE) {
        BluVaultAuthorization storage auth = bluVaultAuthorizations[tokenId];
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        
        require(entry.tokenId == tokenId, "Entry does not exist");
        require(entry.status == MintingStatus.PENDING, "Not in pending status");
        require(auth.isValid, "Authorization not valid");
        
        bool applied = false;
        
        if (msg.sender == auth.primarySigner && !auth.primarySigned) {
            auth.primarySigned = true;
            applied = true;
            emit BluVaultSignatureApplied(tokenId, auth.authId, msg.sender, true);
        } else if (msg.sender == auth.secondarySigner && !auth.secondarySigned) {
            auth.secondarySigned = true;
            applied = true;
            emit BluVaultSignatureApplied(tokenId, auth.authId, msg.sender, false);
        } else {
            revert("Not authorized signer or already signed");
        }
        
        // Check if both signatures applied
        if (auth.primarySigned && auth.secondarySigned) {
            entry.status = MintingStatus.AUTHORIZED;
        }
    }
    
    /**
     * @notice Mint inheritance entry (irreversible once executed)
     * @dev Step 3: Execute minting after dual authorization
     * @param tokenId Token ID to mint
     * @param recipient Address to receive tokens
     * @param amount Amount of tokens to mint
     */
    function mintInheritanceEntry(
        uint256 tokenId,
        address recipient,
        uint256 amount
    ) external onlyRole(SOVEREIGN_MINTER_ROLE) nonReentrant whenNotPaused {
        require(!emergencyShutdown, "Emergency shutdown active");
        
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        BluVaultAuthorization storage auth = bluVaultAuthorizations[tokenId];
        
        require(entry.tokenId == tokenId, "Entry does not exist");
        require(entry.status == MintingStatus.AUTHORIZED, "Not authorized");
        require(auth.primarySigned && auth.secondarySigned, "Missing dual signatures");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        
        // Mint the ENFT
        _mint(recipient, tokenId, amount, "");
        
        // Update entry status
        entry.status = MintingStatus.LOCKED;
        entry.mintedAt = block.timestamp;
        entry.lastCompoundingTime = block.timestamp;
        
        // Update sphere metrics
        sphereMintedCount[entry.sphere] += amount;
        sphereLockedValue[entry.sphere] += entry.ledgerWorth;
        
        emit InheritanceEntryMinted(tokenId, entry.sphere, recipient, amount, entry.yieldTag);
    }
    
    /**
     * @notice Lock inheritance entry irreversibly to ledger
     * @dev Step 4: Make entry irreversible (fail-safe measure)
     * @param tokenId Token ID to lock
     */
    function lockInheritanceEntry(uint256 tokenId) external onlyRole(BLU_VAULT_ROLE) {
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        
        require(entry.tokenId == tokenId, "Entry does not exist");
        require(entry.status == MintingStatus.LOCKED, "Entry not minted");
        require(!entry.isIrreversible, "Already irreversible");
        
        entry.isIrreversible = true;
        
        emit InheritanceEntryLocked(tokenId, entry.sphere, entry.ledgerWorth, block.timestamp);
    }

    // =============================================================
    //                  π₄ COMPOUNDING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Apply π₄ compounding trigger for future-yield acceleration
     * @dev Demonstrates exponential yield growth: Y(t) = Y_0 × (π^4)^(t/T)
     * @param tokenId Token ID to apply compounding
     */
    function applyPi4Compounding(uint256 tokenId) external onlyRole(BLU_VAULT_ROLE) {
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        
        require(entry.tokenId == tokenId, "Entry does not exist");
        require(entry.status == MintingStatus.LOCKED, "Entry not minted");
        
        uint256 timeElapsed = block.timestamp - entry.lastCompoundingTime;
        require(timeElapsed > 0, "No time elapsed");
        
        // Calculate π₄ compounding
        uint256 oldYield = entry.yieldPerSecond;
        uint256 newYield = _calculatePi4Yield(entry, timeElapsed);
        
        // Update entry
        entry.yieldPerSecond = newYield;
        entry.lastCompoundingTime = block.timestamp;
        
        // Accumulate yield
        uint256 accumulated = newYield * timeElapsed;
        entry.totalAccumulatedYield += accumulated;
        
        emit Pi4CompoundingApplied(tokenId, oldYield, newYield, block.timestamp);
    }
    
    /**
     * @notice Calculate π₄ compounded yield
     * @dev Uses exponential approximation for gas efficiency
     * @param entry Inheritance entry
     * @param timeElapsed Time since last compounding
     * @return newYield Compounded yield per second
     */
    function _calculatePi4Yield(
        InheritanceEntry storage entry,
        uint256 timeElapsed
    ) private view returns (uint256) {
        // For small time periods, use linear approximation
        if (timeElapsed < 86400) { // Less than 1 day
            return entry.yieldPerSecond;
        }
        
        // Calculate exponent: t/T
        uint256 exponent = (timeElapsed * PRECISION_SCALE) / COMPOUNDING_INTERVAL;
        
        // Y(t) ≈ Y_0 * (1 + (π^4 - 1) * t/T) for approximation
        uint256 growthFactor = PRECISION_SCALE + ((PI4_SCALED - PRECISION_SCALE) * exponent) / PRECISION_SCALE;
        
        return (entry.yieldPerSecond * growthFactor) / PRECISION_SCALE;
    }

    // =============================================================
    //              DUAL-REALITY & REGISTRY FUNCTIONS
    // =============================================================
    
    /**
     * @notice Set dual-reality confirmation for dimensional sync
     * @param tokenId Token ID
     * @param dualRealityHash Hash for dual-reality verification
     */
    function setDualRealityConfirmation(
        uint256 tokenId,
        bytes32 dualRealityHash
    ) external onlyRole(BLU_VAULT_ROLE) {
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        
        require(entry.tokenId == tokenId, "Entry does not exist");
        require(dualRealityHash != bytes32(0), "Invalid hash");
        
        entry.dualRealityHash = dualRealityHash;
        dualRealityVerified[dualRealityHash] = true;
        
        emit DualRealityConfirmed(tokenId, dualRealityHash, msg.sender);
    }
    
    /**
     * @notice Sync with physical and interactive registries
     * @param tokenId Token ID
     * @param physicalAssetId Physical asset registry ID
     * @param interactiveRegistryId Interactive/meta registry ID
     * @param linkedDimensions Array of dimension/chain identifiers
     */
    function syncRegistry(
        uint256 tokenId,
        string calldata physicalAssetId,
        string calldata interactiveRegistryId,
        uint256[] calldata linkedDimensions
    ) external onlyRole(BLU_VAULT_ROLE) {
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        
        require(entry.tokenId == tokenId, "Entry does not exist");
        require(entry.status == MintingStatus.LOCKED, "Entry not minted");
        
        registryEntries[tokenId] = RegistryEntry({
            tokenId: tokenId,
            physicalAssetId: physicalAssetId,
            interactiveRegistryId: interactiveRegistryId,
            linkedDimensions: linkedDimensions,
            synced: true,
            lastSyncTime: block.timestamp
        });
        
        emit RegistrySynced(tokenId, physicalAssetId, interactiveRegistryId, block.timestamp);
    }

    // =============================================================
    //                    EMERGENCY CONTROLS
    // =============================================================
    
    /**
     * @notice Activate emergency shutdown (fail-safe measure)
     */
    function activateEmergencyShutdown() external onlyRole(EMERGENCY_ROLE) {
        emergencyShutdown = true;
        _pause();
        emit EmergencyShutdownActivated(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Deactivate emergency shutdown
     */
    function deactivateEmergencyShutdown() external onlyRole(EMERGENCY_ROLE) {
        emergencyShutdown = false;
        _unpause();
        emit EmergencyShutdownDeactivated(msg.sender, block.timestamp);
    }

    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get inheritance entry details
     */
    function getInheritanceEntry(uint256 tokenId) external view returns (InheritanceEntry memory) {
        return inheritanceEntries[tokenId];
    }
    
    /**
     * @notice Get Blu-Vault authorization status
     */
    function getBluVaultAuthorization(uint256 tokenId) external view returns (BluVaultAuthorization memory) {
        return bluVaultAuthorizations[tokenId];
    }
    
    /**
     * @notice Get registry entry
     */
    function getRegistryEntry(uint256 tokenId) external view returns (RegistryEntry memory) {
        return registryEntries[tokenId];
    }
    
    /**
     * @notice Get tokens by economic sphere
     */
    function getTokensBySphere(EconomicSphere sphere) external view returns (uint256[] memory) {
        return sphereTokens[sphere];
    }
    
    /**
     * @notice Get token ID by yield tag
     */
    function getTokenIdByYieldTag(bytes32 yieldTag) external view returns (uint256) {
        return yieldTagToTokenId[yieldTag];
    }
    
    /**
     * @notice Calculate current accumulated yield for a token
     */
    function calculateCurrentYield(uint256 tokenId) external view returns (uint256) {
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        
        if (entry.status != MintingStatus.LOCKED) return 0;
        
        uint256 timeElapsed = block.timestamp - entry.lastCompoundingTime;
        uint256 pendingYield = entry.yieldPerSecond * timeElapsed;
        
        return entry.totalAccumulatedYield + pendingYield;
    }
    
    /**
     * @notice Get system metrics
     */
    function getSystemMetrics() external view returns (
        uint256 totalCivilianMinted,
        uint256 totalMilitaryMinted,
        uint256 totalCosmicMinted,
        uint256 totalCivilianValue,
        uint256 totalMilitaryValue,
        uint256 totalCosmicValue
    ) {
        return (
            sphereMintedCount[EconomicSphere.CIVILIAN],
            sphereMintedCount[EconomicSphere.MILITARY],
            sphereMintedCount[EconomicSphere.COSMIC],
            sphereLockedValue[EconomicSphere.CIVILIAN],
            sphereLockedValue[EconomicSphere.MILITARY],
            sphereLockedValue[EconomicSphere.COSMIC]
        );
    }

    // =============================================================
    //                    INTERNAL FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get yield rate for economic sphere
     */
    function _getYieldRateForSphere(EconomicSphere sphere) internal pure returns (uint256) {
        if (sphere == EconomicSphere.CIVILIAN) {
            return CIVILIAN_YIELD_RATE;
        } else if (sphere == EconomicSphere.MILITARY) {
            return MILITARY_YIELD_RATE;
        } else {
            return COSMIC_YIELD_RATE;
        }
    }
    
    /**
     * @notice Override URI to support metadata linking
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        InheritanceEntry storage entry = inheritanceEntries[tokenId];
        if (bytes(entry.metadataURI).length > 0) {
            return entry.metadataURI;
        }
        return super.uri(tokenId);
    }
    
    /**
     * @notice Required override for AccessControl
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
