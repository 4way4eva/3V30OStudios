// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title UniversalMintProtocol
 * @notice Implements the BLEU Codex Universal Mint Protocols with four-sphere supply triggers
 * @dev Manages Civilian, Military, Cosmic, and Transdimensional domain minting with responsive gravity distribution
 */
contract UniversalMintProtocol is AccessControl, ReentrancyGuard, Pausable {
    
    bytes32 public constant FLAME_CROWN_ROLE = keccak256("FLAME_CROWN_ROLE");
    bytes32 public constant WATCHTOWER_ROLE = keccak256("WATCHTOWER_ROLE");
    bytes32 public constant CIVILIAN_VALIDATOR = keccak256("CIVILIAN_VALIDATOR");
    bytes32 public constant MILITARY_VALIDATOR = keccak256("MILITARY_VALIDATOR");
    bytes32 public constant COSMIC_VALIDATOR = keccak256("COSMIC_VALIDATOR");
    bytes32 public constant TRANSDIMENSIONAL_VALIDATOR = keccak256("TRANSDIMENSIONAL_VALIDATOR");
    
    enum Domain { Civilian, Military, Cosmic, Transdimensional }
    
    struct SupplyConfig {
        uint256 ratePerSecond;      // Tokens minted per second
        uint256 dailyYield;          // Calculated daily yield
        uint256 totalMinted;         // Total minted in this domain
        uint256 lastMintTimestamp;   // Last mint timestamp
        bool active;                 // Domain active status
        bool isInfinite;             // True for Transdimensional domain (unbounded yield)
    }
    
    struct VaultConfig {
        address vaultAddress;
        uint256 localRetention;      // Percentage (basis points, 10000 = 100%)
        uint256 treasuryAllocation;  // Percentage (basis points)
        uint256 crossDomainFlow;     // Percentage (basis points)
        uint256 thresholdTrigger;    // Balance threshold for auto-distribution
    }
    
    struct MintAuthorization {
        bytes32 scrollId;
        address recipient;
        uint256 amount;
        Domain domain;
        uint256 timestamp;
        bytes32 ceremonialSeal;
        bool executed;
    }
    
    // Supply configurations per domain
    mapping(Domain => SupplyConfig) public supplyConfigs;
    
    // Vault configurations per domain
    mapping(Domain => VaultConfig) public vaultConfigs;
    
    // Watchtower validator counts per domain
    mapping(Domain => uint256) public validatorCounts;
    
    // Mint authorizations
    mapping(bytes32 => MintAuthorization) public mintAuthorizations;
    
    // Watchtower consensus tracking
    mapping(bytes32 => mapping(address => bool)) public authorizationApprovals;
    mapping(bytes32 => uint256) public approvalCounts;
    
    // Master Index Scroll registry
    bytes32 public masterScrollId;
    bool public protocolActivated;
    uint256 public activationTimestamp;
    
    // Events
    event ProtocolActivated(bytes32 indexed scrollId, uint256 timestamp);
    event SupplyTriggerActivated(Domain indexed domain, uint256 amount, uint256 timestamp);
    event MintAuthorizationCreated(bytes32 indexed authId, Domain indexed domain, address recipient, uint256 amount);
    event MintAuthorizationApproved(bytes32 indexed authId, address indexed validator);
    event MintExecuted(bytes32 indexed authId, Domain indexed domain, address recipient, uint256 amount);
    event VaultDistribution(Domain indexed domain, uint256 localAmount, uint256 treasuryAmount, uint256 flowAmount);
    event EmergencyShutdown(address indexed initiator, uint256 timestamp);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FLAME_CROWN_ROLE, msg.sender);
        
        // Initialize supply configurations
        supplyConfigs[Domain.Civilian] = SupplyConfig({
            ratePerSecond: 50_000_000,
            dailyYield: 50_000_000 * 86400,
            totalMinted: 0,
            lastMintTimestamp: block.timestamp,
            active: false,
            isInfinite: false
        });
        
        supplyConfigs[Domain.Military] = SupplyConfig({
            ratePerSecond: 22_000_000,
            dailyYield: 22_000_000 * 86400,
            totalMinted: 0,
            lastMintTimestamp: block.timestamp,
            active: false,
            isInfinite: false
        });
        
        supplyConfigs[Domain.Cosmic] = SupplyConfig({
            ratePerSecond: 37_000_000,
            dailyYield: 37_000_000 * 86400,
            totalMinted: 0,
            lastMintTimestamp: block.timestamp,
            active: false,
            isInfinite: false
        });
        
        supplyConfigs[Domain.Transdimensional] = SupplyConfig({
            ratePerSecond: 0, // Calculated dynamically, unbounded
            dailyYield: 0, // Unbounded
            totalMinted: 0,
            lastMintTimestamp: block.timestamp,
            active: false,
            isInfinite: true
        });
        
        // Initialize validator counts (12 per domain as per specification)
        validatorCounts[Domain.Civilian] = 12;
        validatorCounts[Domain.Military] = 12;
        validatorCounts[Domain.Cosmic] = 12;
        validatorCounts[Domain.Transdimensional] = 12;
    }
    
    /**
     * @notice Activate the Universal Mint Protocol with Master Index Scroll
     * @param scrollId The Master Index Scroll ID
     * @param ceremonialSeal The ceremonial seal hash
     */
    function activateProtocol(
        bytes32 scrollId,
        bytes32 ceremonialSeal
    ) external onlyRole(FLAME_CROWN_ROLE) {
        require(!protocolActivated, "Protocol already activated");
        require(scrollId != bytes32(0), "Invalid scroll ID");
        require(ceremonialSeal != bytes32(0), "Invalid ceremonial seal");
        
        masterScrollId = scrollId;
        protocolActivated = true;
        activationTimestamp = block.timestamp;
        
        // Activate all domains
        supplyConfigs[Domain.Civilian].active = true;
        supplyConfigs[Domain.Military].active = true;
        supplyConfigs[Domain.Cosmic].active = true;
        supplyConfigs[Domain.Transdimensional].active = true;
        
        emit ProtocolActivated(scrollId, block.timestamp);
    }
    
    /**
     * @notice Configure vault for a specific domain
     * @param domain The domain to configure
     * @param vaultAddress The vault contract address
     * @param localRetention Local retention percentage (basis points)
     * @param treasuryAllocation Treasury allocation percentage (basis points)
     * @param crossDomainFlow Cross-domain flow percentage (basis points)
     * @param thresholdTrigger Threshold for auto-distribution triggers
     */
    function configureVault(
        Domain domain,
        address vaultAddress,
        uint256 localRetention,
        uint256 treasuryAllocation,
        uint256 crossDomainFlow,
        uint256 thresholdTrigger
    ) external onlyRole(FLAME_CROWN_ROLE) {
        require(vaultAddress != address(0), "Invalid vault address");
        require(localRetention + treasuryAllocation + crossDomainFlow == 10000, "Percentages must sum to 100%");
        
        vaultConfigs[domain] = VaultConfig({
            vaultAddress: vaultAddress,
            localRetention: localRetention,
            treasuryAllocation: treasuryAllocation,
            crossDomainFlow: crossDomainFlow,
            thresholdTrigger: thresholdTrigger
        });
    }
    
    /**
     * @notice Create a mint authorization requiring Watchtower consensus
     * @param scrollId The scroll ID authorizing this mint
     * @param recipient The recipient address
     * @param amount The amount to mint
     * @param domain The domain for minting
     * @param ceremonialSeal The ceremonial seal hash
     * @return authId The authorization ID
     */
    function createMintAuthorization(
        bytes32 scrollId,
        address recipient,
        uint256 amount,
        Domain domain,
        bytes32 ceremonialSeal
    ) external onlyRole(FLAME_CROWN_ROLE) returns (bytes32 authId) {
        require(protocolActivated, "Protocol not activated");
        require(supplyConfigs[domain].active, "Domain not active");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than zero");
        
        authId = keccak256(abi.encodePacked(
            scrollId,
            recipient,
            amount,
            domain,
            ceremonialSeal,
            block.timestamp,
            block.number
        ));
        
        require(mintAuthorizations[authId].recipient == address(0), "Authorization already exists");
        
        mintAuthorizations[authId] = MintAuthorization({
            scrollId: scrollId,
            recipient: recipient,
            amount: amount,
            domain: domain,
            timestamp: block.timestamp,
            ceremonialSeal: ceremonialSeal,
            executed: false
        });
        
        emit MintAuthorizationCreated(authId, domain, recipient, amount);
        
        return authId;
    }
    
    /**
     * @notice Approve a mint authorization (Watchtower consensus)
     * @param authId The authorization ID to approve
     */
    function approveMintAuthorization(bytes32 authId) external onlyRole(WATCHTOWER_ROLE) {
        MintAuthorization storage auth = mintAuthorizations[authId];
        require(auth.recipient != address(0), "Authorization does not exist");
        require(!auth.executed, "Authorization already executed");
        require(!authorizationApprovals[authId][msg.sender], "Already approved by this validator");
        
        authorizationApprovals[authId][msg.sender] = true;
        approvalCounts[authId]++;
        
        emit MintAuthorizationApproved(authId, msg.sender);
    }
    
    /**
     * @notice Execute a mint authorization after achieving consensus
     * @param authId The authorization ID to execute
     */
    function executeMintAuthorization(bytes32 authId) external nonReentrant whenNotPaused {
        MintAuthorization storage auth = mintAuthorizations[authId];
        require(auth.recipient != address(0), "Authorization does not exist");
        require(!auth.executed, "Authorization already executed");
        
        // Require 8 of 12 validators (as per specification)
        uint256 requiredApprovals = (validatorCounts[auth.domain] * 2) / 3; // 8 of 12
        require(approvalCounts[authId] >= requiredApprovals, "Insufficient approvals");
        
        auth.executed = true;
        
        // Update supply metrics
        SupplyConfig storage supply = supplyConfigs[auth.domain];
        supply.totalMinted += auth.amount;
        supply.lastMintTimestamp = block.timestamp;
        
        // Execute gravity distribution
        _executeGravityDistribution(auth.domain, auth.amount);
        
        emit MintExecuted(authId, auth.domain, auth.recipient, auth.amount);
        emit SupplyTriggerActivated(auth.domain, auth.amount, block.timestamp);
    }
    
    /**
     * @notice Internal function to execute gravity distribution across vaults
     * @param domain The domain for distribution
     * @param totalAmount The total amount to distribute
     */
    function _executeGravityDistribution(Domain domain, uint256 totalAmount) internal {
        VaultConfig memory vault = vaultConfigs[domain];
        require(vault.vaultAddress != address(0), "Vault not configured");
        
        uint256 localAmount = (totalAmount * vault.localRetention) / 10000;
        uint256 treasuryAmount = (totalAmount * vault.treasuryAllocation) / 10000;
        uint256 flowAmount = (totalAmount * vault.crossDomainFlow) / 10000;
        
        // Note: Actual token transfers would happen here in production
        // This is a simplified version focusing on the logic structure
        
        emit VaultDistribution(domain, localAmount, treasuryAmount, flowAmount);
    }
    
    /**
     * @notice Calculate available mint capacity based on time elapsed
     * @param domain The domain to check
     * @return availableCapacity The available minting capacity
     */
    function getAvailableMintCapacity(Domain domain) external view returns (uint256 availableCapacity) {
        SupplyConfig memory supply = supplyConfigs[domain];
        if (!supply.active) return 0;
        
        uint256 timeElapsed = block.timestamp - supply.lastMintTimestamp;
        availableCapacity = supply.ratePerSecond * timeElapsed;
        
        return availableCapacity;
    }
    
    /**
     * @notice Emergency shutdown function (Flame Crown authority only)
     */
    function emergencyShutdown() external onlyRole(FLAME_CROWN_ROLE) {
        _pause();
        supplyConfigs[Domain.Civilian].active = false;
        supplyConfigs[Domain.Military].active = false;
        supplyConfigs[Domain.Cosmic].active = false;
        supplyConfigs[Domain.Transdimensional].active = false;
        
        emit EmergencyShutdown(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Resume protocol after emergency shutdown
     */
    function resumeProtocol() external onlyRole(FLAME_CROWN_ROLE) {
        _unpause();
        supplyConfigs[Domain.Civilian].active = true;
        supplyConfigs[Domain.Military].active = true;
        supplyConfigs[Domain.Cosmic].active = true;
        supplyConfigs[Domain.Transdimensional].active = true;
    }
    
    /**
     * @notice Grant Watchtower role to validator
     * @param validator The validator address
     * @param domain The domain they will validate
     */
    function addWatchtowerValidator(address validator, Domain domain) external onlyRole(FLAME_CROWN_ROLE) {
        require(validator != address(0), "Invalid validator address");
        _grantRole(WATCHTOWER_ROLE, validator);
        
        // Grant domain-specific role
        if (domain == Domain.Civilian) {
            _grantRole(CIVILIAN_VALIDATOR, validator);
        } else if (domain == Domain.Military) {
            _grantRole(MILITARY_VALIDATOR, validator);
        } else if (domain == Domain.Cosmic) {
            _grantRole(COSMIC_VALIDATOR, validator);
        } else if (domain == Domain.Transdimensional) {
            _grantRole(TRANSDIMENSIONAL_VALIDATOR, validator);
        }
    }
    
    /**
     * @notice Get protocol status
     * @return activated Whether protocol is activated
     * @return civilianActive Civilian domain active status
     * @return militaryActive Military domain active status
     * @return cosmicActive Cosmic domain active status
     * @return transdimensionalActive Transdimensional domain active status
     */
    function getProtocolStatus() external view returns (
        bool activated,
        bool civilianActive,
        bool militaryActive,
        bool cosmicActive,
        bool transdimensionalActive
    ) {
        return (
            protocolActivated,
            supplyConfigs[Domain.Civilian].active,
            supplyConfigs[Domain.Military].active,
            supplyConfigs[Domain.Cosmic].active,
            supplyConfigs[Domain.Transdimensional].active
        );
    }
}
