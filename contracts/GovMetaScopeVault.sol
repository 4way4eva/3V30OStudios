// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title GovMetaScopeVault
 * @notice Implements economic transdata pairing vault triggers with responsive gravity distribution
 * @dev Manages vault operations, trigger mechanisms, and inter-vault flow orchestration
 */
contract GovMetaScopeVault is AccessControl, ReentrancyGuard, Pausable {
    
    bytes32 public constant VAULT_ADMIN_ROLE = keccak256("VAULT_ADMIN_ROLE");
    bytes32 public constant TRIGGER_OPERATOR_ROLE = keccak256("TRIGGER_OPERATOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    enum TriggerType { Threshold, Ceremonial, Emergency, CrossDomain }
    enum VaultState { Dormant, Active, Triggered, Distributing, Sealed }
    
    struct VaultMetrics {
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 currentBalance;
        uint256 lastTriggerTimestamp;
        uint256 triggerCount;
        VaultState state;
    }
    
    struct TriggerCondition {
        TriggerType triggerType;
        uint256 threshold;
        uint256 timelock;
        bool active;
        bytes32 ceremonialHash;
    }
    
    struct DistributionPlan {
        address[] recipients;
        uint256[] amounts;
        uint256[] gravityWeights;  // Distribution weights based on gravity logic
        bytes32 transDataHash;      // Economic transdata pairing hash
        uint256 executionTimestamp;
        bool executed;
    }
    
    // Vault metrics per vault ID
    mapping(bytes32 => VaultMetrics) public vaultMetrics;
    
    // Trigger conditions per vault
    mapping(bytes32 => TriggerCondition[]) public vaultTriggers;
    
    // Distribution plans
    mapping(bytes32 => DistributionPlan) public distributionPlans;
    
    // Vault balance tracking
    mapping(bytes32 => uint256) public vaultBalances;
    
    // Cross-vault flow tracking
    mapping(bytes32 => mapping(bytes32 => uint256)) public crossVaultFlows;
    
    // Registered vaults
    bytes32[] public registeredVaults;
    mapping(bytes32 => bool) public isVaultRegistered;
    
    // Events
    event VaultRegistered(bytes32 indexed vaultId, uint256 timestamp);
    event VaultDeposit(bytes32 indexed vaultId, uint256 amount, address indexed depositor);
    event TriggerConditionAdded(bytes32 indexed vaultId, TriggerType triggerType, uint256 threshold);
    event TriggerActivated(bytes32 indexed vaultId, TriggerType triggerType, uint256 amount);
    event GravityDistributionExecuted(bytes32 indexed vaultId, bytes32 indexed planId, uint256 totalAmount);
    event CrossVaultFlow(bytes32 indexed sourceVault, bytes32 indexed targetVault, uint256 amount);
    event VaultStateChanged(bytes32 indexed vaultId, VaultState newState);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Register a new vault in the GovMetaScope system
     * @param vaultId Unique identifier for the vault
     */
    function registerVault(bytes32 vaultId) external onlyRole(VAULT_ADMIN_ROLE) {
        require(vaultId != bytes32(0), "Invalid vault ID");
        require(!isVaultRegistered[vaultId], "Vault already registered");
        
        vaultMetrics[vaultId] = VaultMetrics({
            totalDeposits: 0,
            totalWithdrawals: 0,
            currentBalance: 0,
            lastTriggerTimestamp: block.timestamp,
            triggerCount: 0,
            state: VaultState.Active
        });
        
        registeredVaults.push(vaultId);
        isVaultRegistered[vaultId] = true;
        
        emit VaultRegistered(vaultId, block.timestamp);
    }
    
    /**
     * @notice Add a trigger condition to a vault
     * @param vaultId The vault to add trigger to
     * @param triggerType Type of trigger
     * @param threshold Threshold value for trigger activation
     * @param timelock Minimum time between trigger activations
     * @param ceremonialHash Optional ceremonial validation hash
     */
    function addTriggerCondition(
        bytes32 vaultId,
        TriggerType triggerType,
        uint256 threshold,
        uint256 timelock,
        bytes32 ceremonialHash
    ) external onlyRole(VAULT_ADMIN_ROLE) {
        require(isVaultRegistered[vaultId], "Vault not registered");
        
        vaultTriggers[vaultId].push(TriggerCondition({
            triggerType: triggerType,
            threshold: threshold,
            timelock: timelock,
            active: true,
            ceremonialHash: ceremonialHash
        }));
        
        emit TriggerConditionAdded(vaultId, triggerType, threshold);
    }
    
    /**
     * @notice Deposit funds into a vault
     * @param vaultId The vault to deposit into
     * @param amount Amount to deposit
     */
    function deposit(bytes32 vaultId, uint256 amount) external nonReentrant whenNotPaused {
        require(isVaultRegistered[vaultId], "Vault not registered");
        require(amount > 0, "Amount must be greater than zero");
        
        VaultMetrics storage metrics = vaultMetrics[vaultId];
        require(metrics.state == VaultState.Active, "Vault not in active state");
        
        metrics.totalDeposits += amount;
        metrics.currentBalance += amount;
        vaultBalances[vaultId] += amount;
        
        emit VaultDeposit(vaultId, amount, msg.sender);
        
        // Check if any triggers should activate
        _checkAndActivateTriggers(vaultId);
    }
    
    /**
     * @notice Internal function to check and activate vault triggers
     * @param vaultId The vault to check
     */
    function _checkAndActivateTriggers(bytes32 vaultId) internal {
        VaultMetrics storage metrics = vaultMetrics[vaultId];
        TriggerCondition[] storage triggers = vaultTriggers[vaultId];
        
        for (uint256 i = 0; i < triggers.length; i++) {
            TriggerCondition storage trigger = triggers[i];
            
            if (!trigger.active) continue;
            
            // Check timelock
            if (block.timestamp < metrics.lastTriggerTimestamp + trigger.timelock) continue;
            
            // Check threshold triggers
            if (trigger.triggerType == TriggerType.Threshold) {
                if (metrics.currentBalance >= trigger.threshold) {
                    _activateTrigger(vaultId, i);
                }
            }
        }
    }
    
    /**
     * @notice Activate a specific trigger
     * @param vaultId The vault containing the trigger
     * @param triggerIndex Index of the trigger to activate
     */
    function _activateTrigger(bytes32 vaultId, uint256 triggerIndex) internal {
        VaultMetrics storage metrics = vaultMetrics[vaultId];
        TriggerCondition storage trigger = vaultTriggers[vaultId][triggerIndex];
        
        metrics.state = VaultState.Triggered;
        metrics.lastTriggerTimestamp = block.timestamp;
        metrics.triggerCount++;
        
        emit TriggerActivated(vaultId, trigger.triggerType, metrics.currentBalance);
        emit VaultStateChanged(vaultId, VaultState.Triggered);
    }
    
    /**
     * @notice Create a gravity distribution plan for a triggered vault
     * @param vaultId The source vault
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to distribute
     * @param gravityWeights Array of gravity weights for responsive distribution
     * @param transDataHash Economic transdata pairing hash
     * @return planId The created distribution plan ID
     */
    function createDistributionPlan(
        bytes32 vaultId,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256[] calldata gravityWeights,
        bytes32 transDataHash
    ) external onlyRole(TRIGGER_OPERATOR_ROLE) returns (bytes32 planId) {
        require(isVaultRegistered[vaultId], "Vault not registered");
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length == gravityWeights.length, "Gravity weights length mismatch");
        require(vaultMetrics[vaultId].state == VaultState.Triggered, "Vault not in triggered state");
        
        // Calculate total distribution
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalAmount <= vaultBalances[vaultId], "Insufficient vault balance");
        
        planId = keccak256(abi.encodePacked(
            vaultId,
            transDataHash,
            block.timestamp,
            block.number
        ));
        
        distributionPlans[planId] = DistributionPlan({
            recipients: recipients,
            amounts: amounts,
            gravityWeights: gravityWeights,
            transDataHash: transDataHash,
            executionTimestamp: 0,
            executed: false
        });
        
        vaultMetrics[vaultId].state = VaultState.Distributing;
        emit VaultStateChanged(vaultId, VaultState.Distributing);
        
        return planId;
    }
    
    /**
     * @notice Execute a gravity distribution plan
     * @param vaultId The source vault
     * @param planId The distribution plan to execute
     */
    function executeDistribution(
        bytes32 vaultId,
        bytes32 planId
    ) external nonReentrant onlyRole(TRIGGER_OPERATOR_ROLE) {
        require(isVaultRegistered[vaultId], "Vault not registered");
        
        DistributionPlan storage plan = distributionPlans[planId];
        require(!plan.executed, "Distribution already executed");
        require(vaultMetrics[vaultId].state == VaultState.Distributing, "Invalid vault state");
        
        // Calculate total with gravity adjustments
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < plan.amounts.length; i++) {
            uint256 adjustedAmount = _applyGravityWeight(plan.amounts[i], plan.gravityWeights[i]);
            totalDistributed += adjustedAmount;
        }
        
        require(totalDistributed <= vaultBalances[vaultId], "Insufficient balance");
        
        // Update vault metrics
        VaultMetrics storage metrics = vaultMetrics[vaultId];
        metrics.currentBalance -= totalDistributed;
        metrics.totalWithdrawals += totalDistributed;
        vaultBalances[vaultId] -= totalDistributed;
        
        // Mark as executed
        plan.executed = true;
        plan.executionTimestamp = block.timestamp;
        
        // Return vault to active state
        metrics.state = VaultState.Active;
        
        emit GravityDistributionExecuted(vaultId, planId, totalDistributed);
        emit VaultStateChanged(vaultId, VaultState.Active);
    }
    
    /**
     * @notice Apply gravity weight to calculate adjusted distribution amount
     * @param baseAmount The base amount to distribute
     * @param gravityWeight The gravity weight factor (basis points, 10000 = 1.0x)
     * @return adjustedAmount The amount after gravity adjustment
     */
    function _applyGravityWeight(uint256 baseAmount, uint256 gravityWeight) internal pure returns (uint256) {
        return (baseAmount * gravityWeight) / 10000;
    }
    
    /**
     * @notice Execute cross-vault flow (economic transdata pairing)
     * @param sourceVaultId Source vault
     * @param targetVaultId Target vault
     * @param amount Amount to flow
     * @param transDataHash Economic transdata hash for pairing validation
     */
    function executeCrossVaultFlow(
        bytes32 sourceVaultId,
        bytes32 targetVaultId,
        uint256 amount,
        bytes32 transDataHash
    ) external nonReentrant onlyRole(ORACLE_ROLE) {
        require(isVaultRegistered[sourceVaultId], "Source vault not registered");
        require(isVaultRegistered[targetVaultId], "Target vault not registered");
        require(amount > 0, "Amount must be greater than zero");
        require(vaultBalances[sourceVaultId] >= amount, "Insufficient source balance");
        require(transDataHash != bytes32(0), "Invalid transdata hash");
        
        // Execute flow
        vaultBalances[sourceVaultId] -= amount;
        vaultBalances[targetVaultId] += amount;
        
        // Update metrics
        vaultMetrics[sourceVaultId].currentBalance -= amount;
        vaultMetrics[sourceVaultId].totalWithdrawals += amount;
        
        vaultMetrics[targetVaultId].currentBalance += amount;
        vaultMetrics[targetVaultId].totalDeposits += amount;
        
        // Track cross-vault flow
        crossVaultFlows[sourceVaultId][targetVaultId] += amount;
        
        emit CrossVaultFlow(sourceVaultId, targetVaultId, amount);
        
        // Check if target vault triggers should activate
        _checkAndActivateTriggers(targetVaultId);
    }
    
    /**
     * @notice Get vault current state and metrics
     * @param vaultId The vault to query
     * @return metrics The vault metrics
     */
    function getVaultMetrics(bytes32 vaultId) external view returns (VaultMetrics memory) {
        require(isVaultRegistered[vaultId], "Vault not registered");
        return vaultMetrics[vaultId];
    }
    
    /**
     * @notice Get all registered vaults
     * @return Array of registered vault IDs
     */
    function getAllVaults() external view returns (bytes32[] memory) {
        return registeredVaults;
    }
    
    /**
     * @notice Get trigger count for a vault
     * @param vaultId The vault to query
     * @return count Number of triggers configured
     */
    function getTriggerCount(bytes32 vaultId) external view returns (uint256) {
        return vaultTriggers[vaultId].length;
    }
    
    /**
     * @notice Emergency seal vault (admin only)
     * @param vaultId Vault to seal
     */
    function sealVault(bytes32 vaultId) external onlyRole(VAULT_ADMIN_ROLE) {
        require(isVaultRegistered[vaultId], "Vault not registered");
        vaultMetrics[vaultId].state = VaultState.Sealed;
        emit VaultStateChanged(vaultId, VaultState.Sealed);
    }
    
    /**
     * @notice Unseal vault (admin only)
     * @param vaultId Vault to unseal
     */
    function unsealVault(bytes32 vaultId) external onlyRole(VAULT_ADMIN_ROLE) {
        require(isVaultRegistered[vaultId], "Vault not registered");
        require(vaultMetrics[vaultId].state == VaultState.Sealed, "Vault not sealed");
        vaultMetrics[vaultId].state = VaultState.Active;
        emit VaultStateChanged(vaultId, VaultState.Active);
    }
}
