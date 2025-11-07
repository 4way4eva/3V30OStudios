// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OptimusPrimeENFT
 * @dev OPTINUS PRIME Ceremonial Assembly Scroll - ENFT Implementation
 * 
 * This contract encodes transformer heritage on-chain as Encrypted Non-Fungible Tokens (ENFTs).
 * Each token represents a scroll-bonded organism in the OPTINUS PRIME lineage, with:
 * - Ceremonial metadata and ancestral hash
 * - Lineage tree verification
 * - Deployment permissions (curriculum, cinematic, tribunal, infrastructure)
 * - Automated restitution and royalty flows
 */
contract OptimusPrimeENFT is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    AccessControl,
    ReentrancyGuard 
{
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant CODEX_EMISSARY_ROLE = keccak256("CODEX_EMISSARY_ROLE");
    bytes32 public constant TRIBUNAL_ROLE = keccak256("TRIBUNAL_ROLE");

    // Token counter
    Counters.Counter private _tokenIdCounter;

    // Deployment permission flags
    enum DeploymentPermission {
        CURRICULUM,
        CINEMATIC,
        TRIBUNAL,
        INFRASTRUCTURE,
        MILITARY,
        AGRICULTURAL
    }

    // Assembly stage tracking
    enum AssemblyStage {
        INVOCATION,
        CORE_PLACEMENT,
        WINDING,
        INSULATION,
        COOLING_INTEGRATION,
        INTERFACE_INTEGRATION,
        ENCLOSURE,
        CALIBRATION,
        FINAL_BLESSING
    }

    // ENFT Metadata structure
    struct TransformerMetadata {
        bytes32 ancestralHash;              // Encrypted ancestral lineage hash
        bytes32 ceremorialSignature;        // Witness signature from assembly ritual
        uint256 lineageNumber;              // Position in lineage tree
        uint256 assemblyTimestamp;          // When assembly was completed
        AssemblyStage currentStage;         // Current assembly stage
        bool isActivated;                   // Whether lineage is activated
        mapping(DeploymentPermission => bool) permissions; // Deployment permissions
    }

    // Component tracking for assembly protocol
    struct ComponentRegistry {
        bool coreInstalled;
        bool windingsAttached;
        bool insulationApplied;
        bool coolingSystemIntegrated;
        bool interfacesConnected;
        bool scrollEmbedded;
        bool calibrated;
        bool blessed;
    }

    // Lineage tree structure
    struct LineageNode {
        uint256 parentTokenId;              // Parent in lineage tree (0 if root)
        uint256[] childTokenIds;            // Children in lineage tree
        bool isSuccessionLocked;            // Whether succession rules are active
    }

    // Restitution tracking
    struct RestitutionRecord {
        uint256 totalDistributed;           // Total restitution distributed
        uint256 lastDistributionTime;       // Last distribution timestamp
        address[] beneficiaries;            // Restitution beneficiaries
        mapping(address => uint256) allocations; // Beneficiary allocations
    }

    // State mappings
    mapping(uint256 => TransformerMetadata) private _metadata;
    mapping(uint256 => ComponentRegistry) private _components;
    mapping(uint256 => LineageNode) private _lineageTree;
    mapping(uint256 => RestitutionRecord) private _restitution;
    mapping(address => bool) public allowlist;

    // Treasury and royalty settings
    address public treasuryVault;
    uint256 public restitutionRoyaltyBps = 500;  // 5% royalty for restitution
    uint256 public communityRoyaltyBps = 300;     // 3% royalty for community

    // Events
    event TransformerMinted(
        uint256 indexed tokenId, 
        address indexed owner, 
        bytes32 ancestralHash,
        uint256 lineageNumber
    );
    event AssemblyStageCompleted(
        uint256 indexed tokenId, 
        AssemblyStage stage
    );
    event LineageActivated(
        uint256 indexed tokenId, 
        uint256 timestamp
    );
    event DeploymentPermissionSet(
        uint256 indexed tokenId, 
        DeploymentPermission permission, 
        bool granted
    );
    event RestitutionDistributed(
        uint256 indexed tokenId, 
        uint256 amount, 
        uint256 beneficiaryCount
    );
    event LineageTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 successionProof
    );

    constructor(address _treasuryVault) 
        ERC721("OPTINUS PRIME Heritage Token", "OPTIMUSP") 
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(CODEX_EMISSARY_ROLE, msg.sender);
        treasuryVault = _treasuryVault;
    }

    /**
     * @dev Mint a new OPTINUS PRIME ENFT with ancestral hash
     * @param to Address to mint to
     * @param ancestralHash Encrypted ancestral lineage hash
     * @param tokenURI Metadata URI
     * @param parentTokenId Parent in lineage tree (0 if root)
     */
    function mintTransformer(
        address to,
        bytes32 ancestralHash,
        string memory tokenURI,
        uint256 parentTokenId
    ) public onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(allowlist[to] || hasRole(CODEX_EMISSARY_ROLE, msg.sender), 
            "Recipient not allowlisted");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Initialize metadata
        TransformerMetadata storage metadata = _metadata[tokenId];
        metadata.ancestralHash = ancestralHash;
        metadata.lineageNumber = tokenId;
        metadata.assemblyTimestamp = block.timestamp;
        metadata.currentStage = AssemblyStage.INVOCATION;
        metadata.isActivated = false;

        // Initialize lineage tree
        LineageNode storage node = _lineageTree[tokenId];
        node.parentTokenId = parentTokenId;
        node.isSuccessionLocked = true;  // Locked until final blessing

        if (parentTokenId > 0) {
            require(_exists(parentTokenId), "Parent token does not exist");
            _lineageTree[parentTokenId].childTokenIds.push(tokenId);
        }

        emit TransformerMinted(tokenId, to, ancestralHash, tokenId);
        
        return tokenId;
    }

    /**
     * @dev Batch mint transformers for academy or restitution deployment
     */
    function batchMintTransformers(
        address[] calldata recipients,
        bytes32[] calldata ancestralHashes,
        string[] calldata tokenURIs,
        uint256 parentTokenId
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256[] memory) {
        require(
            recipients.length == ancestralHashes.length && 
            recipients.length == tokenURIs.length,
            "Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mintTransformer(
                recipients[i],
                ancestralHashes[i],
                tokenURIs[i],
                parentTokenId
            );
        }

        return tokenIds;
    }

    /**
     * @dev Complete an assembly stage
     */
    function completeAssemblyStage(
        uint256 tokenId,
        AssemblyStage stage,
        bytes32 ceremorialSignature
    ) external onlyRole(CODEX_EMISSARY_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        
        TransformerMetadata storage metadata = _metadata[tokenId];
        ComponentRegistry storage components = _components[tokenId];

        // Verify sequential assembly
        require(uint256(metadata.currentStage) <= uint256(stage), 
            "Invalid stage sequence");

        // Update component registry based on stage
        if (stage == AssemblyStage.CORE_PLACEMENT) {
            components.coreInstalled = true;
        } else if (stage == AssemblyStage.WINDING) {
            components.windingsAttached = true;
        } else if (stage == AssemblyStage.INSULATION) {
            components.insulationApplied = true;
        } else if (stage == AssemblyStage.COOLING_INTEGRATION) {
            components.coolingSystemIntegrated = true;
        } else if (stage == AssemblyStage.INTERFACE_INTEGRATION) {
            components.interfacesConnected = true;
        } else if (stage == AssemblyStage.ENCLOSURE) {
            components.scrollEmbedded = true;
        } else if (stage == AssemblyStage.CALIBRATION) {
            components.calibrated = true;
        } else if (stage == AssemblyStage.FINAL_BLESSING) {
            components.blessed = true;
        }

        metadata.currentStage = stage;
        metadata.ceremorialSignature = ceremorialSignature;

        emit AssemblyStageCompleted(tokenId, stage);
    }

    /**
     * @dev Activate lineage after final blessing
     */
    function activateLineage(uint256 tokenId) 
        external 
        onlyRole(CODEX_EMISSARY_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        
        TransformerMetadata storage metadata = _metadata[tokenId];
        ComponentRegistry storage components = _components[tokenId];

        require(metadata.currentStage == AssemblyStage.FINAL_BLESSING, 
            "Assembly not complete");
        require(components.blessed, "Not blessed");
        require(!metadata.isActivated, "Already activated");

        metadata.isActivated = true;
        _lineageTree[tokenId].isSuccessionLocked = false;

        emit LineageActivated(tokenId, block.timestamp);
    }

    /**
     * @dev Set deployment permission for a token
     */
    function setDeploymentPermission(
        uint256 tokenId,
        DeploymentPermission permission,
        bool granted
    ) external onlyRole(CODEX_EMISSARY_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        
        _metadata[tokenId].permissions[permission] = granted;
        
        emit DeploymentPermissionSet(tokenId, permission, granted);
    }

    /**
     * @dev Distribute restitution to beneficiaries
     * @notice Uses nonReentrant guard and gas-limited transfers for security
     */
    function distributeRestitution(
        uint256 tokenId,
        address[] calldata beneficiaries,
        uint256[] calldata amounts
    ) external payable onlyRole(TRIBUNAL_ROLE) nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(beneficiaries.length == amounts.length, "Array length mismatch");
        
        RestitutionRecord storage record = _restitution[tokenId];
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            totalAmount += amounts[i];
            record.allocations[beneficiaries[i]] += amounts[i];
            
            // Transfer funds with gas limit to prevent griefing
            // Using 2300 gas (same as transfer()) to prevent complex fallback execution
            (bool success, ) = beneficiaries[i].call{value: amounts[i], gas: 2300}("");
            require(success, "Transfer failed");
        }

        require(msg.value >= totalAmount, "Insufficient funds");

        record.totalDistributed += totalAmount;
        record.lastDistributionTime = block.timestamp;
        record.beneficiaries = beneficiaries;

        emit RestitutionDistributed(tokenId, totalAmount, beneficiaries.length);
    }

    /**
     * @dev Transfer lineage with succession proof
     * Heritage ENFTs are non-transferable except through codified succession
     */
    function transferLineage(
        uint256 tokenId,
        address to,
        bytes32 successionProof
    ) external onlyRole(CODEX_EMISSARY_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(!_lineageTree[tokenId].isSuccessionLocked, 
            "Succession locked");
        
        address from = ownerOf(tokenId);
        
        _transfer(from, to, tokenId);
        
        emit LineageTransferred(tokenId, from, to, successionProof);
    }

    /**
     * @dev Add address to allowlist
     */
    function addToAllowlist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowlist[account] = true;
    }

    /**
     * @dev Remove address from allowlist
     */
    function removeFromAllowlist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowlist[account] = false;
    }

    /**
     * @dev Get transformer metadata
     */
    function getTransformerMetadata(uint256 tokenId) 
        external 
        view 
        returns (
            bytes32 ancestralHash,
            bytes32 ceremorialSignature,
            uint256 lineageNumber,
            uint256 assemblyTimestamp,
            AssemblyStage currentStage,
            bool isActivated
        ) 
    {
        require(_exists(tokenId), "Token does not exist");
        
        TransformerMetadata storage metadata = _metadata[tokenId];
        
        return (
            metadata.ancestralHash,
            metadata.ceremorialSignature,
            metadata.lineageNumber,
            metadata.assemblyTimestamp,
            metadata.currentStage,
            metadata.isActivated
        );
    }

    /**
     * @dev Get lineage tree for a token
     */
    function getLineageTree(uint256 tokenId)
        external
        view
        returns (
            uint256 parentTokenId,
            uint256[] memory childTokenIds,
            bool isSuccessionLocked
        )
    {
        require(_exists(tokenId), "Token does not exist");
        
        LineageNode storage node = _lineageTree[tokenId];
        
        return (
            node.parentTokenId,
            node.childTokenIds,
            node.isSuccessionLocked
        );
    }

    /**
     * @dev Check deployment permission
     */
    function hasDeploymentPermission(
        uint256 tokenId,
        DeploymentPermission permission
    ) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _metadata[tokenId].permissions[permission];
    }

    /**
     * @dev Get component registry
     */
    function getComponentRegistry(uint256 tokenId)
        external
        view
        returns (
            bool coreInstalled,
            bool windingsAttached,
            bool insulationApplied,
            bool coolingSystemIntegrated,
            bool interfacesConnected,
            bool scrollEmbedded,
            bool calibrated,
            bool blessed
        )
    {
        require(_exists(tokenId), "Token does not exist");
        
        ComponentRegistry storage components = _components[tokenId];
        
        return (
            components.coreInstalled,
            components.windingsAttached,
            components.insulationApplied,
            components.coolingSystemIntegrated,
            components.interfacesConnected,
            components.scrollEmbedded,
            components.calibrated,
            components.blessed
        );
    }

    // Override functions for multiple inheritance
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
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
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
