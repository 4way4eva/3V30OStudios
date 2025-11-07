// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BleuCrownMintUltraMax
 * @dev Ultra-powerful minting controller for Three-Yield Treasury Economy
 * 
 * Manages minting of Artifact NFTs across all three sovereign yield streams:
 * - CIVILIAN: Real estate, education, wearables, commerce assets
 * - MILITARY: Defense matrix components, tactical units, armaments
 * - COSMIC: Portal logistics, dimensional items, interstellar unlockables
 * 
 * Supports multi-chain deployment (Avalanche/AVAX-C, Cronos) with unified state.
 */
contract BleuCrownMintUltraMax is AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant EMISSARY_ROLE = keccak256("EMISSARY_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Yield stream categories
    enum YieldStream {
        CIVILIAN,
        MILITARY,
        COSMIC
    }

    // Civilian subcategories
    enum CivilianCategory {
        REAL_ESTATE,
        EDUCATION,
        WEARABLES,
        COMMERCE,
        INFRASTRUCTURE,
        ENTERTAINMENT
    }

    // Military subcategories
    enum MilitaryCategory {
        DEFENSE_MATRIX,
        TACTICAL_UNITS,
        ARMAMENTS,
        RECONNAISSANCE,
        LOGISTICS,
        COMMAND_CONTROL
    }

    // Cosmic subcategories
    enum CosmicCategory {
        PORTAL_LOGISTICS,
        DIMENSIONAL_ITEMS,
        INTERSTELLAR_TRANSPORT,
        QUANTUM_TECH,
        COSMIC_ARTIFACTS,
        TIMELINE_KEYS
    }

    // Artifact metadata structure
    struct ArtifactMetadata {
        bytes32 artifactHash;           // Unique artifact hash
        YieldStream stream;             // Which yield stream
        uint256 subcategory;            // Subcategory within stream
        uint256 yieldPerSecond;         // Yield generation rate
        uint256 mintTimestamp;          // When artifact was minted
        uint256 totalYieldGenerated;    // Total yield generated
        uint256 lastYieldUpdate;        // Last yield calculation time
        string ipfsUri;                 // IPFS metadata URI
        bool isActive;                  // Whether artifact is active
        bytes32 provenance;             // Provenance hash
    }

    // Mint authorization structure
    struct MintAuthorization {
        address authorizer;             // Who authorized the mint
        uint256 maxQuantity;            // Maximum quantity authorized
        uint256 usedQuantity;           // Quantity already minted
        uint256 expiryTime;             // Authorization expiry
        bool isActive;                  // Whether authorization is active
    }

    // State mappings
    mapping(uint256 => ArtifactMetadata) public artifacts;
    mapping(address => mapping(YieldStream => uint256[])) public ownerArtifacts;
    mapping(bytes32 => bool) public usedArtifactHashes;
    mapping(address => MintAuthorization) public mintAuthorizations;
    mapping(YieldStream => uint256) public streamTotalYield;
    mapping(YieldStream => uint256) public streamMintCount;

    // External NFT contract references
    address public nftContract721;      // ERC721 NFT contract
    address public nftContract1155;     // ERC1155 NFT contract
    address public zkVerifier;          // zkPoRVerifier contract
    address public treasuryVault;       // Treasury vault address

    // Configuration
    uint256 private _artifactIdCounter;
    uint256 public mintFee = 0.01 ether;
    bool public isPaused = false;

    // Events
    event ArtifactMinted(
        uint256 indexed artifactId,
        address indexed owner,
        YieldStream indexed stream,
        uint256 subcategory,
        bytes32 artifactHash,
        uint256 yieldPerSecond
    );

    event YieldClaimed(
        uint256 indexed artifactId,
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );

    event ArtifactTransferred(
        uint256 indexed artifactId,
        address indexed from,
        address indexed to
    );

    event MintAuthorizationGranted(
        address indexed recipient,
        uint256 maxQuantity,
        uint256 expiryTime
    );

    event StreamYieldUpdated(
        YieldStream indexed stream,
        uint256 totalYield,
        uint256 timestamp
    );

    constructor(
        address _treasuryVault,
        address _zkVerifier
    ) {
        require(_treasuryVault != address(0), "Invalid treasury vault");
        require(_zkVerifier != address(0), "Invalid zkVerifier");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);
        
        treasuryVault = _treasuryVault;
        zkVerifier = _zkVerifier;
        _artifactIdCounter = 1;
    }

    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    /**
     * @dev Mint a single artifact NFT
     * @param to Recipient address
     * @param stream Yield stream category
     * @param subcategory Subcategory within stream
     * @param yieldPerSecond Yield generation rate
     * @param ipfsUri IPFS metadata URI
     * @param provenance Provenance hash
     */
    function mintArtifact(
        address to,
        YieldStream stream,
        uint256 subcategory,
        uint256 yieldPerSecond,
        string calldata ipfsUri,
        bytes32 provenance
    ) external payable onlyRole(MINTER_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(bytes(ipfsUri).length > 0, "IPFS URI required");
        
        // Validate subcategory ranges
        if (stream == YieldStream.CIVILIAN) {
            require(subcategory < 6, "Invalid civilian subcategory");
        } else if (stream == YieldStream.MILITARY) {
            require(subcategory < 6, "Invalid military subcategory");
        } else if (stream == YieldStream.COSMIC) {
            require(subcategory < 6, "Invalid cosmic subcategory");
        }

        uint256 artifactId = _artifactIdCounter++;
        bytes32 artifactHash = keccak256(abi.encodePacked(
            artifactId,
            to,
            stream,
            subcategory,
            block.timestamp,
            provenance
        ));

        require(!usedArtifactHashes[artifactHash], "Artifact hash collision");

        // Create artifact metadata
        ArtifactMetadata storage artifact = artifacts[artifactId];
        artifact.artifactHash = artifactHash;
        artifact.stream = stream;
        artifact.subcategory = subcategory;
        artifact.yieldPerSecond = yieldPerSecond;
        artifact.mintTimestamp = block.timestamp;
        artifact.totalYieldGenerated = 0;
        artifact.lastYieldUpdate = block.timestamp;
        artifact.ipfsUri = ipfsUri;
        artifact.isActive = true;
        artifact.provenance = provenance;

        usedArtifactHashes[artifactHash] = true;
        ownerArtifacts[to][stream].push(artifactId);
        streamMintCount[stream]++;

        // Transfer mint fee to treasury
        if (msg.value > 0) {
            (bool success, ) = treasuryVault.call{value: msg.value}("");
            require(success, "Treasury transfer failed");
        }

        emit ArtifactMinted(
            artifactId,
            to,
            stream,
            subcategory,
            artifactHash,
            yieldPerSecond
        );

        return artifactId;
    }

    /**
     * @dev Batch mint artifacts
     * @param recipients Array of recipient addresses
     * @param streams Array of yield streams
     * @param subcategories Array of subcategories
     * @param yieldRates Array of yield rates
     * @param ipfsUris Array of IPFS URIs
     * @param provenances Array of provenance hashes
     */
    function batchMintArtifacts(
        address[] calldata recipients,
        YieldStream[] calldata streams,
        uint256[] calldata subcategories,
        uint256[] calldata yieldRates,
        string[] calldata ipfsUris,
        bytes32[] calldata provenances
    ) external payable onlyRole(MINTER_ROLE) whenNotPaused nonReentrant returns (uint256[] memory) {
        require(
            recipients.length == streams.length &&
            recipients.length == subcategories.length &&
            recipients.length == yieldRates.length &&
            recipients.length == ipfsUris.length &&
            recipients.length == provenances.length,
            "Array length mismatch"
        );

        uint256 totalFee = mintFee * recipients.length;
        require(msg.value >= totalFee, "Insufficient mint fee");

        uint256[] memory artifactIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 artifactId = _artifactIdCounter++;
            bytes32 artifactHash = keccak256(abi.encodePacked(
                artifactId,
                recipients[i],
                streams[i],
                subcategories[i],
                block.timestamp,
                provenances[i]
            ));

            ArtifactMetadata storage artifact = artifacts[artifactId];
            artifact.artifactHash = artifactHash;
            artifact.stream = streams[i];
            artifact.subcategory = subcategories[i];
            artifact.yieldPerSecond = yieldRates[i];
            artifact.mintTimestamp = block.timestamp;
            artifact.totalYieldGenerated = 0;
            artifact.lastYieldUpdate = block.timestamp;
            artifact.ipfsUri = ipfsUris[i];
            artifact.isActive = true;
            artifact.provenance = provenances[i];

            usedArtifactHashes[artifactHash] = true;
            ownerArtifacts[recipients[i]][streams[i]].push(artifactId);
            streamMintCount[streams[i]]++;

            artifactIds[i] = artifactId;

            emit ArtifactMinted(
                artifactId,
                recipients[i],
                streams[i],
                subcategories[i],
                artifactHash,
                yieldRates[i]
            );
        }

        // Transfer mint fees to treasury
        if (msg.value > 0) {
            (bool success, ) = treasuryVault.call{value: msg.value}("");
            require(success, "Treasury transfer failed");
        }

        return artifactIds;
    }

    /**
     * @dev Calculate and update yield for an artifact
     * @param artifactId ID of the artifact
     */
    function updateArtifactYield(uint256 artifactId) public {
        ArtifactMetadata storage artifact = artifacts[artifactId];
        require(artifact.mintTimestamp > 0, "Artifact does not exist");
        require(artifact.isActive, "Artifact is not active");

        uint256 timeElapsed = block.timestamp - artifact.lastYieldUpdate;
        uint256 newYield = timeElapsed * artifact.yieldPerSecond;

        artifact.totalYieldGenerated += newYield;
        artifact.lastYieldUpdate = block.timestamp;

        streamTotalYield[artifact.stream] += newYield;

        emit StreamYieldUpdated(
            artifact.stream,
            streamTotalYield[artifact.stream],
            block.timestamp
        );
    }

    /**
     * @dev Claim yield from an artifact
     * @param artifactId ID of the artifact
     */
    function claimArtifactYield(uint256 artifactId) external nonReentrant {
        updateArtifactYield(artifactId);
        
        ArtifactMetadata storage artifact = artifacts[artifactId];
        uint256 claimableYield = artifact.totalYieldGenerated;
        
        require(claimableYield > 0, "No yield to claim");
        
        artifact.totalYieldGenerated = 0;

        emit YieldClaimed(artifactId, msg.sender, claimableYield, block.timestamp);
    }

    /**
     * @dev Get artifact details
     * @param artifactId ID of the artifact
     */
    function getArtifact(uint256 artifactId) external view returns (
        bytes32 artifactHash,
        YieldStream stream,
        uint256 subcategory,
        uint256 yieldPerSecond,
        uint256 totalYieldGenerated,
        string memory ipfsUri,
        bool isActive
    ) {
        ArtifactMetadata storage artifact = artifacts[artifactId];
        
        // Calculate current yield
        uint256 timeElapsed = block.timestamp - artifact.lastYieldUpdate;
        uint256 currentYield = artifact.totalYieldGenerated + (timeElapsed * artifact.yieldPerSecond);
        
        return (
            artifact.artifactHash,
            artifact.stream,
            artifact.subcategory,
            artifact.yieldPerSecond,
            currentYield,
            artifact.ipfsUri,
            artifact.isActive
        );
    }

    /**
     * @dev Get artifacts owned by an address for a specific stream
     * @param owner Owner address
     * @param stream Yield stream
     */
    function getOwnerArtifacts(
        address owner,
        YieldStream stream
    ) external view returns (uint256[] memory) {
        return ownerArtifacts[owner][stream];
    }

    /**
     * @dev Get stream statistics
     * @param stream Yield stream
     */
    function getStreamStats(YieldStream stream) external view returns (
        uint256 totalYield,
        uint256 mintCount
    ) {
        return (streamTotalYield[stream], streamMintCount[stream]);
    }

    /**
     * @dev Grant mint authorization to an address
     * @param recipient Address to authorize
     * @param maxQuantity Maximum quantity they can mint
     * @param durationSeconds How long authorization lasts
     */
    function grantMintAuthorization(
        address recipient,
        uint256 maxQuantity,
        uint256 durationSeconds
    ) external onlyRole(TREASURY_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        require(maxQuantity > 0, "Invalid quantity");

        uint256 expiryTime = block.timestamp + durationSeconds;

        MintAuthorization storage auth = mintAuthorizations[recipient];
        auth.authorizer = msg.sender;
        auth.maxQuantity = maxQuantity;
        auth.usedQuantity = 0;
        auth.expiryTime = expiryTime;
        auth.isActive = true;

        emit MintAuthorizationGranted(recipient, maxQuantity, expiryTime);
    }

    /**
     * @dev Deactivate an artifact
     * @param artifactId ID of the artifact
     */
    function deactivateArtifact(
        uint256 artifactId
    ) external onlyRole(AUDITOR_ROLE) {
        ArtifactMetadata storage artifact = artifacts[artifactId];
        require(artifact.mintTimestamp > 0, "Artifact does not exist");
        
        updateArtifactYield(artifactId);
        artifact.isActive = false;
    }

    /**
     * @dev Set external NFT contract addresses
     * @param _nftContract721 ERC721 contract address
     * @param _nftContract1155 ERC1155 contract address
     */
    function setNFTContracts(
        address _nftContract721,
        address _nftContract1155
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        nftContract721 = _nftContract721;
        nftContract1155 = _nftContract1155;
    }

    /**
     * @dev Update mint fee
     * @param newFee New mint fee amount
     */
    function updateMintFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintFee = newFee;
    }

    /**
     * @dev Update treasury vault address
     * @param newTreasury New treasury address
     */
    function updateTreasuryVault(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Invalid treasury");
        treasuryVault = newTreasury;
    }

    /**
     * @dev Pause/unpause contract
     * @param paused Whether to pause
     */
    function setPaused(bool paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isPaused = paused;
    }

    /**
     * @dev Get current artifact counter
     */
    function getCurrentArtifactId() external view returns (uint256) {
        return _artifactIdCounter;
    }
}
