// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BLEUEBaseVault
 * @notice Base vault contract for BLEUE Infrastructure nodes
 * @dev Implements ERC-4626-like tokenized vault pattern with pull payment security
 */
abstract contract BLEUEBaseVault is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Roles
    bytes32 public constant VAULT_MANAGER_ROLE = keccak256("VAULT_MANAGER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER_ROLE");
    
    // Vault state
    IERC20 public immutable asset;
    string public vaultName;
    uint256 public totalDeposits;
    uint256 public totalClaimed;
    
    // User deposits and claims
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public claimableAmount;
    mapping(address => uint256) public claimed;
    
    // Timelock configuration
    uint256 public lockDuration;
    mapping(address => uint256) public depositTimestamp;
    
    // Events
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event ClaimableSet(address indexed user, uint256 amount, uint256 timestamp);
    event Claimed(address indexed user, uint256 amount, uint256 timestamp);
    event LockDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event EmergencyWithdraw(address indexed guardian, uint256 amount);
    
    constructor(
        address _asset,
        string memory _vaultName,
        uint256 _lockDuration
    ) {
        require(_asset != address(0), "Invalid asset address");
        
        asset = IERC20(_asset);
        vaultName = _vaultName;
        lockDuration = _lockDuration;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VAULT_MANAGER_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
    }
    
    /**
     * @notice Deposit assets into the vault
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        deposits[msg.sender] += amount;
        depositTimestamp[msg.sender] = block.timestamp;
        totalDeposits += amount;
        
        emit Deposited(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Set claimable amount for a user (pull payment pattern)
     * @param user User address
     * @param amount Claimable amount
     */
    function setClaimable(address user, uint256 amount) 
        external 
        onlyRole(VAULT_MANAGER_ROLE) 
    {
        require(user != address(0), "Invalid user address");
        claimableAmount[user] = amount;
        emit ClaimableSet(user, amount, block.timestamp);
    }
    
    /**
     * @notice Claim available rewards (pull payment)
     */
    function claim() external nonReentrant whenNotPaused {
        uint256 amount = claimableAmount[msg.sender];
        require(amount > 0, "Nothing to claim");
        
        // Check timelock
        require(
            block.timestamp >= depositTimestamp[msg.sender] + lockDuration,
            "Funds still locked"
        );
        
        claimableAmount[msg.sender] = 0;
        claimed[msg.sender] += amount;
        totalClaimed += amount;
        
        asset.safeTransfer(msg.sender, amount);
        
        emit Claimed(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Batch set claimable amounts
     * @param users Array of user addresses
     * @param amounts Array of claimable amounts
     */
    function batchSetClaimable(address[] calldata users, uint256[] calldata amounts)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(users.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user address");
            claimableAmount[users[i]] = amounts[i];
            emit ClaimableSet(users[i], amounts[i], block.timestamp);
        }
    }
    
    /**
     * @notice Update lock duration
     * @param newDuration New lock duration in seconds
     */
    function updateLockDuration(uint256 newDuration) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        uint256 oldDuration = lockDuration;
        lockDuration = newDuration;
        emit LockDurationUpdated(oldDuration, newDuration);
    }
    
    /**
     * @notice Emergency withdraw by guardian
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     */
    function emergencyWithdraw(uint256 amount, address recipient)
        external
        onlyRole(GUARDIAN_ROLE)
        whenPaused
    {
        require(recipient != address(0), "Invalid recipient");
        asset.safeTransfer(recipient, amount);
        emit EmergencyWithdraw(recipient, amount);
    }
    
    /**
     * @notice Get vault balance
     * @return Current vault balance
     */
    function vaultBalance() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }
    
    /**
     * @notice Get user's deposit info
     * @param user User address
     * @return deposited amount, claimable amount, claimed amount, unlock time
     */
    function getUserInfo(address user) 
        external 
        view 
        returns (
            uint256 deposited,
            uint256 claimable,
            uint256 claimedAmount,
            uint256 unlockTime
        ) 
    {
        return (
            deposits[user],
            claimableAmount[user],
            claimed[user],
            depositTimestamp[user] + lockDuration
        );
    }
    
    /**
     * @notice Check if user can claim
     * @param user User address
     * @return true if user can claim
     */
    function canClaim(address user) public view returns (bool) {
        return claimableAmount[user] > 0 && 
               block.timestamp >= depositTimestamp[user] + lockDuration;
    }
    
    /**
     * @notice Pause vault operations
     */
    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause vault operations
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
