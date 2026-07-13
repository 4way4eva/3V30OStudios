// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BLEUEInfrastructureRegistry
 * @notice Central registry for BLEUE Infrastructure Map Scroll nodes
 * @dev Manages node types, BleuCoin variants, vault routes, and governance circuits
 * 
 * Node Types:
 * - Jaguar Cities: Defense, Governance, Art
 * - Mega Parks: Art, Healing, Education
 * - Blue Banks: Trade, Audit
 * - Alien Embassies: Trade, Education, Diplomacy
 * - Healing Temples: Healing, Education
 * - Ritual Kitchens: Trade, Art
 * - Codex Compilers: Education, Art
 * - Spiral Nodes: Education, Defense, Healing
 * - 144 Divisions: Governance, Defense
 */
contract BLEUEInfrastructureRegistry is AccessControl, ReentrancyGuard, Pausable {
    
    // Role definitions
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant SCROLL_KEEPER_ROLE = keccak256("SCROLL_KEEPER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    // Node type enumeration
    enum NodeType {
        JaguarCity,      // 0: Defense, Governance, Art
        MegaPark,        // 1: Art, Healing, Education
        BlueBank,        // 2: Trade, Audit
        AlienEmbassy,    // 3: Trade, Education, Diplomacy
        HealingTemple,   // 4: Healing, Education
        RitualKitchen,   // 5: Trade, Art
        CodexCompiler,   // 6: Education, Art
        SpiralNode,      // 7: Education, Defense, Healing
        Division144      // 8: Governance, Defense
    }
    
    // Access tier enumeration
    enum AccessTier {
        Open,              // 0: Open access
        Quadratic,         // 1: Quadratic voting access
        Steward,           // 2: Steward access
        RitualLeader,      // 3: Ceremony/ritual leader
        Scholar,           // 4: Scholar tier
        Master,            // 5: Master tier
        WellnessTier,      // 6: Wellness gated
        High,              // 7: High tier (governance)
        Mission,           // 8: Mission-based
        DivisionStake      // 9: Division stake holder
    }
    
    // Yield cycle enumeration
    enum YieldCycle {
        Continuous,        // 0: Continuous yield
        EventDriven,       // 1: Event/festival driven
        Seasonal,          // 2: Lunar/seasonal
        MoonCycle,         // 3: Moon cycle
        FeastEvent,        // 4: Feast events
        ScrollCompletion,  // 5: Scroll/completion trigger
        MoodCycle,         // 6: Mood/emotion cycles
        CosmicAlign        // 7: Cosmic calendar events
    }
    
    // BleuCoin Registry Entry
    struct BleuCoinRegistryEntry {
        string coinName;                    // Name of BleuCoin variant
        address tokenAddress;               // Token contract address
        string vaultRoute;                  // Vault pattern identifier
        address vaultAddress;               // Vault contract address
        YieldCycle yieldCycle;              // Yield accrual pattern
        AccessTier accessTier;              // Access requirements
        string scrollSeal;                  // Scroll-seal identifier (NFT tokenID or IPFS hash)
        string reinvestmentLogic;           // Reinvestment pattern reference
        string scholarshipReference;        // Narrative/lore anchor
        bytes32 auditTrail;                 // Audit log hash
        bool isActive;                      // Active status
        uint256 registeredAt;               // Registration timestamp
    }
    
    // Node Registry Entry
    struct NodeRegistryEntry {
        NodeType nodeType;                  // Type of infrastructure node
        string nodeName;                    // Node name
        string location;                    // Geographic or virtual location
        string[] coreFunctions;             // Core functions (e.g., ["Defense", "Governance"])
        string governanceCircuit;           // Governance pattern
        address governanceAddress;          // Governance contract address
        uint256 bleuCoinId;                 // Reference to BleuCoin entry
        bytes32 ceremonialSeal;             // Ceremonial authentication
        bool dualRealityConfirmed;          // Dual-reality validation
        uint256 registeredAt;               // Registration timestamp
    }
    
    // Storage
    mapping(uint256 => BleuCoinRegistryEntry) public bleuCoinRegistry;
    mapping(uint256 => NodeRegistryEntry) public nodeRegistry;
    mapping(NodeType => uint256[]) public nodesByType;
    mapping(address => uint256[]) public nodesByGovernance;
    
    uint256 public bleuCoinCount;
    uint256 public nodeCount;
    
    // Audit trail events
    mapping(bytes32 => AuditLogEntry) public auditLogs;
    uint256 public auditLogCount;
    
    struct AuditLogEntry {
        bytes32 eventHash;
        string eventType;
        address actor;
        uint256 timestamp;
        bytes32 docHash;  // IPFS hash or document reference
    }
    
    // Events
    event BleuCoinRegistered(
        uint256 indexed coinId,
        string coinName,
        address tokenAddress,
        NodeType associatedNodeType
    );
    
    event NodeRegistered(
        uint256 indexed nodeId,
        NodeType indexed nodeType,
        string nodeName,
        uint256 bleuCoinId
    );
    
    event VaultRouteUpdated(
        uint256 indexed coinId,
        address oldVault,
        address newVault
    );
    
    event GovernanceCircuitUpdated(
        uint256 indexed nodeId,
        address oldGovernance,
        address newGovernance
    );
    
    event DualRealityConfirmed(
        uint256 indexed nodeId,
        address validator,
        uint256 timestamp
    );
    
    event AuditEvent(
        bytes32 indexed eventHash,
        string eventType,
        address indexed actor,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(SCROLL_KEEPER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }
    
    /**
     * @notice Register a new BleuCoin variant
     * @param coinName Name of the coin variant
     * @param tokenAddress Address of the token contract
     * @param vaultRoute Vault pattern identifier
     * @param vaultAddress Address of the vault contract
     * @param yieldCycle Yield cycle pattern
     * @param accessTier Access tier requirement
     * @param scrollSeal Scroll-seal identifier
     * @param reinvestmentLogic Reinvestment logic reference
     * @param scholarshipReference Lore/scholarship reference
     */
    function registerBleuCoin(
        string memory coinName,
        address tokenAddress,
        string memory vaultRoute,
        address vaultAddress,
        YieldCycle yieldCycle,
        AccessTier accessTier,
        string memory scrollSeal,
        string memory reinvestmentLogic,
        string memory scholarshipReference
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256) {
        require(tokenAddress != address(0), "Invalid token address");
        
        uint256 coinId = bleuCoinCount++;
        
        BleuCoinRegistryEntry storage entry = bleuCoinRegistry[coinId];
        entry.coinName = coinName;
        entry.tokenAddress = tokenAddress;
        entry.vaultRoute = vaultRoute;
        entry.vaultAddress = vaultAddress;
        entry.yieldCycle = yieldCycle;
        entry.accessTier = accessTier;
        entry.scrollSeal = scrollSeal;
        entry.reinvestmentLogic = reinvestmentLogic;
        entry.scholarshipReference = scholarshipReference;
        entry.auditTrail = keccak256(abi.encodePacked(coinName, block.timestamp, msg.sender));
        entry.isActive = true;
        entry.registeredAt = block.timestamp;
        
        _logAuditEvent("BleuCoinRegistered", msg.sender, entry.auditTrail);
        
        emit BleuCoinRegistered(coinId, coinName, tokenAddress, NodeType.BlueBank);
        
        return coinId;
    }
    
    /**
     * @notice Register a new infrastructure node
     * @param nodeType Type of infrastructure node
     * @param nodeName Name of the node
     * @param location Geographic or virtual location
     * @param coreFunctions Array of core functions
     * @param governanceCircuit Governance pattern identifier
     * @param governanceAddress Address of governance contract
     * @param bleuCoinId Associated BleuCoin ID
     * @param ceremonialSeal Ceremonial authentication seal
     */
    function registerNode(
        NodeType nodeType,
        string memory nodeName,
        string memory location,
        string[] memory coreFunctions,
        string memory governanceCircuit,
        address governanceAddress,
        uint256 bleuCoinId,
        bytes32 ceremonialSeal
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256) {
        require(bleuCoinId < bleuCoinCount, "Invalid BleuCoin ID");
        
        uint256 nodeId = nodeCount++;
        
        NodeRegistryEntry storage entry = nodeRegistry[nodeId];
        entry.nodeType = nodeType;
        entry.nodeName = nodeName;
        entry.location = location;
        entry.coreFunctions = coreFunctions;
        entry.governanceCircuit = governanceCircuit;
        entry.governanceAddress = governanceAddress;
        entry.bleuCoinId = bleuCoinId;
        entry.ceremonialSeal = ceremonialSeal;
        entry.dualRealityConfirmed = false;
        entry.registeredAt = block.timestamp;
        
        nodesByType[nodeType].push(nodeId);
        if (governanceAddress != address(0)) {
            nodesByGovernance[governanceAddress].push(nodeId);
        }
        
        bytes32 auditHash = keccak256(abi.encodePacked(nodeName, nodeType, block.timestamp));
        _logAuditEvent("NodeRegistered", msg.sender, auditHash);
        
        emit NodeRegistered(nodeId, nodeType, nodeName, bleuCoinId);
        
        return nodeId;
    }
    
    /**
     * @notice Confirm dual-reality validation for a node
     * @param nodeId ID of the node to confirm
     */
    function confirmDualReality(uint256 nodeId) 
        external 
        onlyRole(SCROLL_KEEPER_ROLE) 
    {
        require(nodeId < nodeCount, "Invalid node ID");
        
        NodeRegistryEntry storage entry = nodeRegistry[nodeId];
        entry.dualRealityConfirmed = true;
        
        bytes32 auditHash = keccak256(abi.encodePacked("DualRealityConfirmed", nodeId, block.timestamp));
        _logAuditEvent("DualRealityConfirmed", msg.sender, auditHash);
        
        emit DualRealityConfirmed(nodeId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Update vault route for a BleuCoin
     * @param coinId ID of the BleuCoin
     * @param newVaultAddress New vault address
     */
    function updateVaultRoute(uint256 coinId, address newVaultAddress)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        require(coinId < bleuCoinCount, "Invalid coin ID");
        require(newVaultAddress != address(0), "Invalid vault address");
        
        BleuCoinRegistryEntry storage entry = bleuCoinRegistry[coinId];
        address oldVault = entry.vaultAddress;
        entry.vaultAddress = newVaultAddress;
        
        bytes32 auditHash = keccak256(abi.encodePacked("VaultRouteUpdated", coinId, block.timestamp));
        _logAuditEvent("VaultRouteUpdated", msg.sender, auditHash);
        
        emit VaultRouteUpdated(coinId, oldVault, newVaultAddress);
    }
    
    /**
     * @notice Update governance circuit for a node
     * @param nodeId ID of the node
     * @param newGovernanceAddress New governance contract address
     */
    function updateGovernanceCircuit(uint256 nodeId, address newGovernanceAddress)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        require(nodeId < nodeCount, "Invalid node ID");
        require(newGovernanceAddress != address(0), "Invalid governance address");
        
        NodeRegistryEntry storage entry = nodeRegistry[nodeId];
        address oldGovernance = entry.governanceAddress;
        entry.governanceAddress = newGovernanceAddress;
        
        bytes32 auditHash = keccak256(abi.encodePacked("GovernanceCircuitUpdated", nodeId, block.timestamp));
        _logAuditEvent("GovernanceCircuitUpdated", msg.sender, auditHash);
        
        emit GovernanceCircuitUpdated(nodeId, oldGovernance, newGovernanceAddress);
    }
    
    /**
     * @notice Get all nodes of a specific type
     * @param nodeType Type of nodes to retrieve
     * @return Array of node IDs
     */
    function getNodesByType(NodeType nodeType) external view returns (uint256[] memory) {
        return nodesByType[nodeType];
    }
    
    /**
     * @notice Get all nodes associated with a governance contract
     * @param governanceAddress Address of the governance contract
     * @return Array of node IDs
     */
    function getNodesByGovernance(address governanceAddress) external view returns (uint256[] memory) {
        return nodesByGovernance[governanceAddress];
    }
    
    /**
     * @notice Get BleuCoin entry details
     * @param coinId ID of the BleuCoin
     * @return BleuCoin registry entry
     */
    function getBleuCoinEntry(uint256 coinId) external view returns (BleuCoinRegistryEntry memory) {
        require(coinId < bleuCoinCount, "Invalid coin ID");
        return bleuCoinRegistry[coinId];
    }
    
    /**
     * @notice Get node entry details
     * @param nodeId ID of the node
     * @return Node registry entry
     */
    function getNodeEntry(uint256 nodeId) external view returns (NodeRegistryEntry memory) {
        require(nodeId < nodeCount, "Invalid node ID");
        return nodeRegistry[nodeId];
    }
    
    /**
     * @notice Get core functions for a node
     * @param nodeId ID of the node
     * @return Array of core function strings
     */
    function getNodeCoreFunctions(uint256 nodeId) external view returns (string[] memory) {
        require(nodeId < nodeCount, "Invalid node ID");
        return nodeRegistry[nodeId].coreFunctions;
    }
    
    /**
     * @notice Internal function to log audit events
     * @param eventType Type of event
     * @param actor Address performing the action
     * @param docHash Document hash or reference
     */
    function _logAuditEvent(
        string memory eventType,
        address actor,
        bytes32 docHash
    ) internal {
        bytes32 eventHash = keccak256(abi.encodePacked(eventType, actor, block.timestamp));
        
        auditLogs[eventHash] = AuditLogEntry({
            eventHash: eventHash,
            eventType: eventType,
            actor: actor,
            timestamp: block.timestamp,
            docHash: docHash
        });
        
        auditLogCount++;
        
        emit AuditEvent(eventHash, eventType, actor, block.timestamp);
    }
    
    /**
     * @notice Emergency pause functionality
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause functionality
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
