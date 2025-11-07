// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CodexSovereignGovernance
 * @dev Implements the Codex Sovereign governance system for EVOLVERSE
 * 
 * Core Features:
 * - Triple-Stack Treasury governance (Civilian, Military, Cosmic)
 * - Metawing Hierarchies with tokenized command chains
 * - Tribunal recall/abandon structures
 * - Vault automation with 3x Oversync entries
 * - Atlantis rules multi-trigger system
 */
contract CodexSovereignGovernance is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant CODEX_SOVEREIGN_ROLE = keccak256("CODEX_SOVEREIGN_ROLE");
    bytes32 public constant TRIBUNAL_ROLE = keccak256("TRIBUNAL_ROLE");
    bytes32 public constant METAWING_COMMANDER_ROLE = keccak256("METAWING_COMMANDER_ROLE");
    bytes32 public constant VAULT_OVERSEER_ROLE = keccak256("VAULT_OVERSEER_ROLE");
    bytes32 public constant WATCHTOWER_ROLE = keccak256("WATCHTOWER_ROLE");

    // Treasury stream enums
    enum TreasuryStream {
        CIVILIAN,
        MILITARY,
        COSMIC
    }

    // Command chain status
    enum CommandStatus {
        ACTIVE,
        RECALLED,
        ABANDONED,
        SUSPENDED
    }

    // Vault sync status
    enum VaultSyncStatus {
        PENDING,
        FIRST_SYNC,
        SECOND_SYNC,
        THIRD_SYNC,
        COMPLETE
    }

    // Metawing Command Chain structure
    struct CommandChain {
        uint256 chainId;
        address commander;
        TreasuryStream stream;
        CommandStatus status;
        uint256 issuedAt;
        uint256 lastModified;
        bytes32 tribunalOrderHash; // Hash of tribunal order if recalled/abandoned
        string metadata; // IPFS or URI for command details
    }

    // Vault Automation Thread structure
    struct VaultThread {
        uint256 threadId;
        TreasuryStream stream;
        uint256 syncCount;
        VaultSyncStatus status;
        uint256 lastSyncTimestamp;
        uint256[] atlantisRuleTriggers; // Trigger IDs
        bool isActive;
    }

    // Atlantis Rule structure
    struct AtlantisRule {
        uint256 ruleId;
        string description;
        uint256 triggerThreshold; // π⁴ compounding threshold
        bool isActive;
        uint256 executionCount;
        uint256 lastExecuted;
    }

    // State variables
    uint256 private _commandChainCounter;
    uint256 private _vaultThreadCounter;
    uint256 private _atlantisRuleCounter;

    mapping(uint256 => CommandChain) public commandChains;
    mapping(uint256 => VaultThread) public vaultThreads;
    mapping(uint256 => AtlantisRule) public atlantisRules;
    
    // Mapping from commander address to their command chains
    mapping(address => uint256[]) public commanderChains;
    
    // Mapping from stream to active vault threads
    mapping(TreasuryStream => uint256[]) public streamThreads;

    // Triple-Stack Treasury yield tracking (in wei per second)
    mapping(TreasuryStream => uint256) public yieldPerSecond;

    // Events
    event CommandChainIssued(
        uint256 indexed chainId,
        address indexed commander,
        TreasuryStream stream,
        string metadata
    );

    event CommandChainRecalled(
        uint256 indexed chainId,
        bytes32 tribunalOrderHash,
        address recalledBy
    );

    event CommandChainAbandoned(
        uint256 indexed chainId,
        bytes32 tribunalOrderHash,
        address abandonedBy
    );

    event VaultThreadCreated(
        uint256 indexed threadId,
        TreasuryStream stream
    );

    event VaultSyncExecuted(
        uint256 indexed threadId,
        VaultSyncStatus newStatus,
        uint256 timestamp
    );

    event AtlantisRuleTriggered(
        uint256 indexed ruleId,
        uint256 indexed threadId,
        uint256 timestamp
    );

    event YieldRateUpdated(
        TreasuryStream stream,
        uint256 oldRate,
        uint256 newRate
    );

    /**
     * @dev Constructor sets up roles and initializes treasury yields
     * @param admin The address that will be granted admin role
     */
    constructor(address admin) {
        require(admin != address(0), "CodexGov: invalid admin");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CODEX_SOVEREIGN_ROLE, admin);
        _grantRole(TRIBUNAL_ROLE, admin);
        
        // Initialize Triple-Stack Treasury yields (per second in wei)
        // These are symbolic/ceremonial values representing the conceptual
        // treasury yields from the EVOLVERSE documentation:
        // Civilian: 13,600,000 USD/sec
        // Military: 6,100,000 USD/sec  
        // Cosmic: 9,200,000 USD/sec
        // IMPORTANT: These values are NOT actual ETH amounts but symbolic
        // representations. In production, use oracle-based USD conversion
        // or adjust to appropriate token amounts for your deployment.
        yieldPerSecond[TreasuryStream.CIVILIAN] = 13600000 ether;
        yieldPerSecond[TreasuryStream.MILITARY] = 6100000 ether;
        yieldPerSecond[TreasuryStream.COSMIC] = 9200000 ether;
    }

    /**
     * @dev Issue a new Metawing command chain
     * @param commander Address of the commander
     * @param stream Treasury stream this command belongs to
     * @param metadata IPFS/URI for command details
     * @return chainId The ID of the created command chain
     */
    function issueCommandChain(
        address commander,
        TreasuryStream stream,
        string calldata metadata
    ) external onlyRole(METAWING_COMMANDER_ROLE) returns (uint256) {
        require(commander != address(0), "CodexGov: invalid commander");
        
        uint256 chainId = _commandChainCounter++;
        
        commandChains[chainId] = CommandChain({
            chainId: chainId,
            commander: commander,
            stream: stream,
            status: CommandStatus.ACTIVE,
            issuedAt: block.timestamp,
            lastModified: block.timestamp,
            tribunalOrderHash: bytes32(0),
            metadata: metadata
        });

        commanderChains[commander].push(chainId);

        emit CommandChainIssued(chainId, commander, stream, metadata);
        
        return chainId;
    }

    /**
     * @dev Recall a command chain by tribunal order
     * @param chainId The ID of the command chain to recall
     * @param tribunalOrderHash Hash of the tribunal order authorizing recall
     */
    function recallCommandChain(
        uint256 chainId,
        bytes32 tribunalOrderHash
    ) external onlyRole(TRIBUNAL_ROLE) {
        CommandChain storage chain = commandChains[chainId];
        require(chain.issuedAt > 0, "CodexGov: chain does not exist");
        require(chain.status == CommandStatus.ACTIVE, "CodexGov: chain not active");
        require(tribunalOrderHash != bytes32(0), "CodexGov: invalid order hash");

        chain.status = CommandStatus.RECALLED;
        chain.tribunalOrderHash = tribunalOrderHash;
        chain.lastModified = block.timestamp;

        emit CommandChainRecalled(chainId, tribunalOrderHash, msg.sender);
    }

    /**
     * @dev Abandon a command chain by tribunal order
     * @param chainId The ID of the command chain to abandon
     * @param tribunalOrderHash Hash of the tribunal order authorizing abandonment
     */
    function abandonCommandChain(
        uint256 chainId,
        bytes32 tribunalOrderHash
    ) external onlyRole(TRIBUNAL_ROLE) {
        CommandChain storage chain = commandChains[chainId];
        require(chain.issuedAt > 0, "CodexGov: chain does not exist");
        require(
            chain.status == CommandStatus.ACTIVE || chain.status == CommandStatus.RECALLED,
            "CodexGov: invalid chain status"
        );
        require(tribunalOrderHash != bytes32(0), "CodexGov: invalid order hash");

        chain.status = CommandStatus.ABANDONED;
        chain.tribunalOrderHash = tribunalOrderHash;
        chain.lastModified = block.timestamp;

        emit CommandChainAbandoned(chainId, tribunalOrderHash, msg.sender);
    }

    /**
     * @dev Create a new vault automation thread
     * @param stream The treasury stream for this thread
     * @return threadId The ID of the created thread
     */
    function createVaultThread(
        TreasuryStream stream
    ) external onlyRole(VAULT_OVERSEER_ROLE) returns (uint256) {
        uint256 threadId = _vaultThreadCounter++;
        
        vaultThreads[threadId] = VaultThread({
            threadId: threadId,
            stream: stream,
            syncCount: 0,
            status: VaultSyncStatus.PENDING,
            lastSyncTimestamp: 0,
            atlantisRuleTriggers: new uint256[](0),
            isActive: true
        });

        streamThreads[stream].push(threadId);

        emit VaultThreadCreated(threadId, stream);
        
        return threadId;
    }

    /**
     * @dev Execute a vault sync (3x Oversync protocol)
     * @param threadId The ID of the vault thread
     */
    function executeVaultSync(uint256 threadId) external onlyRole(VAULT_OVERSEER_ROLE) {
        VaultThread storage thread = vaultThreads[threadId];
        require(thread.isActive, "CodexGov: thread not active");
        require(thread.status != VaultSyncStatus.COMPLETE, "CodexGov: already complete");

        thread.syncCount++;
        thread.lastSyncTimestamp = block.timestamp;

        // Update status based on sync count
        if (thread.syncCount == 1) {
            thread.status = VaultSyncStatus.FIRST_SYNC;
        } else if (thread.syncCount == 2) {
            thread.status = VaultSyncStatus.SECOND_SYNC;
        } else if (thread.syncCount >= 3) {
            thread.status = VaultSyncStatus.THIRD_SYNC;
            // Third sync triggers Atlantis rules evaluation
            _evaluateAtlantisRules(threadId);
            thread.status = VaultSyncStatus.COMPLETE;
        }

        emit VaultSyncExecuted(threadId, thread.status, block.timestamp);
    }

    /**
     * @dev Create a new Atlantis rule
     * @param description Description of the rule
     * @param triggerThreshold The threshold for triggering (π⁴ compounding value)
     * @return ruleId The ID of the created rule
     */
    function createAtlantisRule(
        string calldata description,
        uint256 triggerThreshold
    ) external onlyRole(VAULT_OVERSEER_ROLE) returns (uint256) {
        require(triggerThreshold > 0, "CodexGov: invalid threshold");
        
        uint256 ruleId = _atlantisRuleCounter++;
        
        atlantisRules[ruleId] = AtlantisRule({
            ruleId: ruleId,
            description: description,
            triggerThreshold: triggerThreshold,
            isActive: true,
            executionCount: 0,
            lastExecuted: 0
        });

        return ruleId;
    }

    /**
     * @dev Associate an Atlantis rule with a vault thread
     * @param threadId The vault thread ID
     * @param ruleId The Atlantis rule ID
     */
    function associateRuleWithThread(
        uint256 threadId,
        uint256 ruleId
    ) external onlyRole(VAULT_OVERSEER_ROLE) {
        VaultThread storage thread = vaultThreads[threadId];
        AtlantisRule storage rule = atlantisRules[ruleId];
        
        require(thread.isActive, "CodexGov: thread not active");
        require(rule.isActive, "CodexGov: rule not active");

        thread.atlantisRuleTriggers.push(ruleId);
    }

    /**
     * @dev Internal function to evaluate Atlantis rules for a thread
     * @param threadId The vault thread ID
     */
    function _evaluateAtlantisRules(uint256 threadId) internal {
        VaultThread storage thread = vaultThreads[threadId];
        
        for (uint256 i = 0; i < thread.atlantisRuleTriggers.length; i++) {
            uint256 ruleId = thread.atlantisRuleTriggers[i];
            AtlantisRule storage rule = atlantisRules[ruleId];
            
            if (rule.isActive) {
                // Rule is triggered on 3x sync
                rule.executionCount++;
                rule.lastExecuted = block.timestamp;
                
                emit AtlantisRuleTriggered(ruleId, threadId, block.timestamp);
            }
        }
    }

    /**
     * @dev Update treasury yield rate
     * @param stream The treasury stream
     * @param newRate New yield rate per second (in wei)
     */
    function updateYieldRate(
        TreasuryStream stream,
        uint256 newRate
    ) external onlyRole(CODEX_SOVEREIGN_ROLE) {
        uint256 oldRate = yieldPerSecond[stream];
        yieldPerSecond[stream] = newRate;
        
        emit YieldRateUpdated(stream, oldRate, newRate);
    }

    /**
     * @dev Get command chains for a commander
     * @param commander The commander address
     * @return Array of command chain IDs
     */
    function getCommanderChains(address commander) external view returns (uint256[] memory) {
        return commanderChains[commander];
    }

    /**
     * @dev Get vault threads for a stream
     * @param stream The treasury stream
     * @return Array of thread IDs
     */
    function getStreamThreads(TreasuryStream stream) external view returns (uint256[] memory) {
        return streamThreads[stream];
    }

    /**
     * @dev Get Atlantis rule triggers for a thread
     * @param threadId The vault thread ID
     * @return Array of rule IDs
     */
    function getThreadRules(uint256 threadId) external view returns (uint256[] memory) {
        return vaultThreads[threadId].atlantisRuleTriggers;
    }

    /**
     * @dev Calculate total treasury yield per day
     * @return Total yield across all streams per day (in wei)
     */
    function getTotalDailyYield() external view returns (uint256) {
        uint256 totalPerSecond = yieldPerSecond[TreasuryStream.CIVILIAN] +
                                  yieldPerSecond[TreasuryStream.MILITARY] +
                                  yieldPerSecond[TreasuryStream.COSMIC];
        return totalPerSecond * 86400; // 86400 seconds in a day
    }
}
