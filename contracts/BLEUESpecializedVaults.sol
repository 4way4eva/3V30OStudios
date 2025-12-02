// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BLEUEBaseVault.sol";

/**
 * @title CouncilVault
 * @notice Vault for Jaguar City governance with multi-sig and spiral council features
 * @dev High-access tier vault with council decree NFT integration
 */
contract CouncilVault is BLEUEBaseVault {
    
    // Spiral Council mood states
    enum MoodState { Joy, Anger, Envy, Sorrow, Fear }
    
    // Council configuration
    struct CouncilConfig {
        uint256 requiredSignatures;
        uint256 councilSize;
        MoodState currentMood;
        uint256 moodChangeTimestamp;
    }
    
    CouncilConfig public councilConfig;
    mapping(address => bool) public councilMembers;
    mapping(bytes32 => mapping(address => bool)) public decreeApprovals;
    mapping(bytes32 => uint256) public decreeApprovalCount;
    
    // Events
    event CouncilMemberAdded(address indexed member);
    event CouncilMemberRemoved(address indexed member);
    event MoodChanged(MoodState oldMood, MoodState newMood);
    event DecreeApproved(bytes32 indexed decreeId, address indexed councilMember);
    event DecreeExecuted(bytes32 indexed decreeId);
    
    constructor(
        address _asset,
        uint256 _lockDuration,
        uint256 _requiredSignatures
    ) BLEUEBaseVault(_asset, "Council Vault", _lockDuration) {
        councilConfig = CouncilConfig({
            requiredSignatures: _requiredSignatures,
            councilSize: 0,
            currentMood: MoodState.Joy,
            moodChangeTimestamp: block.timestamp
        });
    }
    
    /**
     * @notice Add council member
     * @param member Address to add
     */
    function addCouncilMember(address member) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(!councilMembers[member], "Already a council member");
        councilMembers[member] = true;
        councilConfig.councilSize++;
        emit CouncilMemberAdded(member);
    }
    
    /**
     * @notice Remove council member
     * @param member Address to remove
     */
    function removeCouncilMember(address member) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(councilMembers[member], "Not a council member");
        councilMembers[member] = false;
        councilConfig.councilSize--;
        emit CouncilMemberRemoved(member);
    }
    
    /**
     * @notice Change spiral council mood
     * @param newMood New mood state
     */
    function changeMood(MoodState newMood) 
        external 
        onlyRole(VAULT_MANAGER_ROLE) 
    {
        MoodState oldMood = councilConfig.currentMood;
        councilConfig.currentMood = newMood;
        councilConfig.moodChangeTimestamp = block.timestamp;
        emit MoodChanged(oldMood, newMood);
    }
    
    /**
     * @notice Approve a council decree
     * @param decreeId Unique decree identifier
     */
    function approveDecree(bytes32 decreeId) external {
        require(councilMembers[msg.sender], "Not a council member");
        require(!decreeApprovals[decreeId][msg.sender], "Already approved");
        
        decreeApprovals[decreeId][msg.sender] = true;
        decreeApprovalCount[decreeId]++;
        
        emit DecreeApproved(decreeId, msg.sender);
    }
    
    /**
     * @notice Check if decree has sufficient approvals
     * @param decreeId Decree identifier
     * @return true if decree is approved
     */
    function isDecreeApproved(bytes32 decreeId) public view returns (bool) {
        return decreeApprovalCount[decreeId] >= councilConfig.requiredSignatures;
    }
}

/**
 * @title NatureVault
 * @notice Vault for Mega Parks with ecological steward features
 * @dev Implements quadratic voting and seasonal cycle rewards
 */
contract NatureVault is BLEUEBaseVault {
    
    // Steward configuration
    mapping(address => bool) public ecologicalStewards;
    mapping(address => uint256) public stewardContributions;
    
    // Grant management
    struct ArtGrant {
        bytes32 grantId;
        address recipient;
        uint256 amount;
        uint256 votes;
        bool executed;
    }
    
    mapping(bytes32 => ArtGrant) public artGrants;
    mapping(bytes32 => mapping(address => uint256)) public grantVotes;
    
    // Events
    event StewardAdded(address indexed steward);
    event StewardRemoved(address indexed steward);
    event GrantProposed(bytes32 indexed grantId, address recipient, uint256 amount);
    event GrantVoted(bytes32 indexed grantId, address voter, uint256 votes);
    event GrantExecuted(bytes32 indexed grantId, address recipient, uint256 amount);
    
    constructor(
        address _asset,
        uint256 _lockDuration
    ) BLEUEBaseVault(_asset, "Nature Vault", _lockDuration) {}
    
    /**
     * @notice Add ecological steward
     * @param steward Address to add
     */
    function addSteward(address steward) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        ecologicalStewards[steward] = true;
        emit StewardAdded(steward);
    }
    
    /**
     * @notice Propose art grant
     * @param grantId Unique grant identifier
     * @param recipient Grant recipient
     * @param amount Grant amount
     */
    function proposeGrant(bytes32 grantId, address recipient, uint256 amount)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(artGrants[grantId].grantId == bytes32(0), "Grant already exists");
        
        artGrants[grantId] = ArtGrant({
            grantId: grantId,
            recipient: recipient,
            amount: amount,
            votes: 0,
            executed: false
        });
        
        emit GrantProposed(grantId, recipient, amount);
    }
    
    /**
     * @notice Vote on grant with quadratic voting
     * @param grantId Grant identifier
     * @param voteWeight Vote weight (will be squared)
     */
    function voteOnGrant(bytes32 grantId, uint256 voteWeight) external {
        require(ecologicalStewards[msg.sender], "Not a steward");
        require(artGrants[grantId].grantId != bytes32(0), "Grant does not exist");
        require(!artGrants[grantId].executed, "Grant already executed");
        
        // Quadratic voting: cost = votes^2
        uint256 quadraticVotes = voteWeight * voteWeight;
        grantVotes[grantId][msg.sender] = quadraticVotes;
        artGrants[grantId].votes += quadraticVotes;
        
        emit GrantVoted(grantId, msg.sender, quadraticVotes);
    }
}

/**
 * @title EmbassyVault
 * @notice Vault for Alien Embassies with mission-based access
 */
contract EmbassyVault is BLEUEBaseVault {
    
    // Mission tracking
    struct Mission {
        bytes32 missionId;
        address diplomat;
        uint256 reward;
        bool completed;
        uint256 completionTime;
    }
    
    mapping(bytes32 => Mission) public missions;
    mapping(address => bytes32[]) public diplomatMissions;
    
    event MissionCreated(bytes32 indexed missionId, address diplomat, uint256 reward);
    event MissionCompleted(bytes32 indexed missionId, address diplomat);
    
    constructor(
        address _asset,
        uint256 _lockDuration
    ) BLEUEBaseVault(_asset, "Embassy Vault", _lockDuration) {}
    
    /**
     * @notice Create diplomatic mission
     * @param missionId Unique mission identifier
     * @param diplomat Diplomat address
     * @param reward Mission reward
     */
    function createMission(bytes32 missionId, address diplomat, uint256 reward)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(missions[missionId].missionId == bytes32(0), "Mission exists");
        
        missions[missionId] = Mission({
            missionId: missionId,
            diplomat: diplomat,
            reward: reward,
            completed: false,
            completionTime: 0
        });
        
        diplomatMissions[diplomat].push(missionId);
        emit MissionCreated(missionId, diplomat, reward);
    }
    
    /**
     * @notice Complete mission and release reward
     * @param missionId Mission identifier
     */
    function completeMission(bytes32 missionId)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        Mission storage mission = missions[missionId];
        require(!mission.completed, "Mission already completed");
        
        mission.completed = true;
        mission.completionTime = block.timestamp;
        
        setClaimable(mission.diplomat, mission.reward);
        emit MissionCompleted(missionId, mission.diplomat);
    }
}

/**
 * @title HealingPool
 * @notice Vault for Healing Temples with wellness tier access
 */
contract HealingPool is BLEUEBaseVault {
    
    // Wellness tracking
    mapping(address => uint256) public wellnessScore;
    mapping(address => bytes32) public ritualHashes;
    
    uint256 public constant MIN_WELLNESS_SCORE = 100;
    
    event WellnessScoreUpdated(address indexed user, uint256 score);
    event RitualRecorded(address indexed user, bytes32 ritualHash);
    
    constructor(
        address _asset,
        uint256 _lockDuration
    ) BLEUEBaseVault(_asset, "Healing Pool", _lockDuration) {}
    
    /**
     * @notice Update wellness score
     * @param user User address
     * @param score Wellness score
     */
    function updateWellnessScore(address user, uint256 score)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        wellnessScore[user] = score;
        emit WellnessScoreUpdated(user, score);
    }
    
    /**
     * @notice Record ritual with ZK hash
     * @param ritualHash Zero-knowledge ritual hash
     */
    function recordRitual(bytes32 ritualHash) external {
        ritualHashes[msg.sender] = ritualHash;
        emit RitualRecorded(msg.sender, ritualHash);
    }
    
    /**
     * @notice Override claim to check wellness score
     */
    function claim() external override nonReentrant whenNotPaused {
        require(wellnessScore[msg.sender] >= MIN_WELLNESS_SCORE, "Insufficient wellness score");
        super.claim();
    }
}
