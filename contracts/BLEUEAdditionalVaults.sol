// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BLEUEBaseVault.sol";

/**
 * @title LarderVault
 * @notice Vault for Ritual Kitchens with feast cycle mechanics
 */
contract LarderVault is BLEUEBaseVault {
    
    // Feast event tracking
    struct FeastEvent {
        bytes32 feastId;
        string feastName;
        uint256 timestamp;
        uint256 totalReward;
        uint256 attendeeCount;
        bool executed;
    }
    
    mapping(bytes32 => FeastEvent) public feasts;
    mapping(bytes32 => mapping(address => bool)) public feastAttendance;
    mapping(bytes32 => address[]) public feastAttendees;
    
    // Recipe NFT management
    mapping(bytes32 => string) public recipeHashes;
    
    event FeastCreated(bytes32 indexed feastId, string feastName, uint256 reward);
    event AttendanceRecorded(bytes32 indexed feastId, address attendee);
    event FeastRewardsDistributed(bytes32 indexed feastId, uint256 totalReward);
    event RecipeRegistered(bytes32 indexed recipeId, string recipeHash);
    
    constructor(
        address _asset,
        uint256 _lockDuration
    ) BLEUEBaseVault(_asset, "Larder Vault", _lockDuration) {}
    
    /**
     * @notice Create feast event
     * @param feastId Unique feast identifier
     * @param feastName Name of the feast
     * @param totalReward Total reward pool
     */
    function createFeast(bytes32 feastId, string memory feastName, uint256 totalReward)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(feasts[feastId].feastId == bytes32(0), "Feast already exists");
        
        feasts[feastId] = FeastEvent({
            feastId: feastId,
            feastName: feastName,
            timestamp: block.timestamp,
            totalReward: totalReward,
            attendeeCount: 0,
            executed: false
        });
        
        emit FeastCreated(feastId, feastName, totalReward);
    }
    
    /**
     * @notice Record feast attendance
     * @param feastId Feast identifier
     * @param attendee Attendee address
     */
    function recordAttendance(bytes32 feastId, address attendee)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(feasts[feastId].feastId != bytes32(0), "Feast does not exist");
        require(!feastAttendance[feastId][attendee], "Already attended");
        
        feastAttendance[feastId][attendee] = true;
        feastAttendees[feastId].push(attendee);
        feasts[feastId].attendeeCount++;
        
        emit AttendanceRecorded(feastId, attendee);
    }
    
    /**
     * @notice Distribute feast rewards
     * @param feastId Feast identifier
     */
    function distributeFeastRewards(bytes32 feastId)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        FeastEvent storage feast = feasts[feastId];
        require(!feast.executed, "Feast rewards already distributed");
        require(feast.attendeeCount > 0, "No attendees");
        
        uint256 rewardPerAttendee = feast.totalReward / feast.attendeeCount;
        address[] memory attendees = feastAttendees[feastId];
        
        for (uint256 i = 0; i < attendees.length; i++) {
            claimableAmount[attendees[i]] += rewardPerAttendee;
        }
        
        feast.executed = true;
        emit FeastRewardsDistributed(feastId, feast.totalReward);
    }
    
    /**
     * @notice Register recipe with NFT hash
     * @param recipeId Recipe identifier
     * @param recipeHash IPFS or NFT hash
     */
    function registerRecipe(bytes32 recipeId, string memory recipeHash)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        recipeHashes[recipeId] = recipeHash;
        emit RecipeRegistered(recipeId, recipeHash);
    }
}

/**
 * @title ScriptoriumVault
 * @notice Vault for Codex Compilers with scholar progression
 */
contract ScriptoriumVault is BLEUEBaseVault {
    
    // Scholar tiers
    enum ScholarTier { Novice, Apprentice, Scholar, Master, GrandMaster }
    
    struct ScholarProfile {
        ScholarTier tier;
        uint256 scrollsCompiled;
        uint256 totalRewards;
        uint256 registrationTime;
    }
    
    mapping(address => ScholarProfile) public scholars;
    
    // Scroll compilation tracking
    struct ScrollCompilation {
        bytes32 scrollId;
        address compiler;
        uint256 completionTime;
        uint256 reward;
        bool verified;
    }
    
    mapping(bytes32 => ScrollCompilation) public scrolls;
    
    event ScholarRegistered(address indexed scholar, ScholarTier tier);
    event ScholarTierUpdated(address indexed scholar, ScholarTier oldTier, ScholarTier newTier);
    event ScrollCompiled(bytes32 indexed scrollId, address compiler, uint256 reward);
    event ScrollVerified(bytes32 indexed scrollId);
    
    constructor(
        address _asset,
        uint256 _lockDuration
    ) BLEUEBaseVault(_asset, "Scriptorium Vault", _lockDuration) {}
    
    /**
     * @notice Register scholar
     * @param scholar Scholar address
     */
    function registerScholar(address scholar)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(scholars[scholar].registrationTime == 0, "Scholar already registered");
        
        scholars[scholar] = ScholarProfile({
            tier: ScholarTier.Novice,
            scrollsCompiled: 0,
            totalRewards: 0,
            registrationTime: block.timestamp
        });
        
        emit ScholarRegistered(scholar, ScholarTier.Novice);
    }
    
    /**
     * @notice Update scholar tier
     * @param scholar Scholar address
     * @param newTier New tier
     */
    function updateScholarTier(address scholar, ScholarTier newTier)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        ScholarProfile storage profile = scholars[scholar];
        ScholarTier oldTier = profile.tier;
        profile.tier = newTier;
        
        emit ScholarTierUpdated(scholar, oldTier, newTier);
    }
    
    /**
     * @notice Record scroll compilation
     * @param scrollId Scroll identifier
     * @param compiler Scholar address
     * @param reward Compilation reward
     */
    function recordScrollCompilation(bytes32 scrollId, address compiler, uint256 reward)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(scholars[compiler].registrationTime > 0, "Not a registered scholar");
        require(scrolls[scrollId].scrollId == bytes32(0), "Scroll already compiled");
        
        scrolls[scrollId] = ScrollCompilation({
            scrollId: scrollId,
            compiler: compiler,
            completionTime: block.timestamp,
            reward: reward,
            verified: false
        });
        
        scholars[compiler].scrollsCompiled++;
        
        emit ScrollCompiled(scrollId, compiler, reward);
    }
    
    /**
     * @notice Verify scroll and release reward
     * @param scrollId Scroll identifier
     */
    function verifyScroll(bytes32 scrollId)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        ScrollCompilation storage scroll = scrolls[scrollId];
        require(!scroll.verified, "Scroll already verified");
        
        scroll.verified = true;
        
        ScholarProfile storage profile = scholars[scroll.compiler];
        profile.totalRewards += scroll.reward;
        
        claimableAmount[scroll.compiler] += scroll.reward;
        
        emit ScrollVerified(scrollId);
    }
}

/**
 * @title CycleVault
 * @notice Vault for Spiral Nodes with mood cycle mechanics
 */
contract CycleVault is BLEUEBaseVault {
    
    // Mood cycle states
    enum MoodCycle { Joy, Anger, Envy, Sorrow, Fear, Neutral }
    
    struct CycleConfig {
        MoodCycle currentMood;
        uint256 cycleStartTime;
        uint256 cycleDuration;
        uint256 cycleNumber;
    }
    
    CycleConfig public cycleConfig;
    
    // Spiral progression tracking
    mapping(address => uint256) public spiralProgression;
    mapping(address => MoodCycle) public userActiveMood;
    
    event MoodCycleChanged(MoodCycle oldMood, MoodCycle newMood, uint256 cycleNumber);
    event SpiralProgressionUpdated(address indexed user, uint256 progression);
    event UserMoodSet(address indexed user, MoodCycle mood);
    
    constructor(
        address _asset,
        uint256 _lockDuration,
        uint256 _cycleDuration
    ) BLEUEBaseVault(_asset, "Cycle Vault", _lockDuration) {
        cycleConfig = CycleConfig({
            currentMood: MoodCycle.Neutral,
            cycleStartTime: block.timestamp,
            cycleDuration: _cycleDuration,
            cycleNumber: 0
        });
    }
    
    /**
     * @notice Advance mood cycle
     * @param newMood New mood state
     */
    function advanceCycle(MoodCycle newMood)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        MoodCycle oldMood = cycleConfig.currentMood;
        cycleConfig.currentMood = newMood;
        cycleConfig.cycleStartTime = block.timestamp;
        cycleConfig.cycleNumber++;
        
        emit MoodCycleChanged(oldMood, newMood, cycleConfig.cycleNumber);
    }
    
    /**
     * @notice Update spiral progression
     * @param user User address
     * @param progression Progression level
     */
    function updateSpiralProgression(address user, uint256 progression)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        spiralProgression[user] = progression;
        emit SpiralProgressionUpdated(user, progression);
    }
    
    /**
     * @notice Set user's active mood
     * @param mood Mood cycle
     */
    function setUserMood(MoodCycle mood) external {
        userActiveMood[msg.sender] = mood;
        emit UserMoodSet(msg.sender, mood);
    }
}

/**
 * @title FractalVault
 * @notice Vault for 144 Divisions with constellation-aligned governance
 */
contract FractalVault is BLEUEBaseVault {
    
    // Division configuration
    struct Division {
        uint256 divisionId;
        string constellationName;
        address divisionHead;
        uint256 memberCount;
        uint256 totalStake;
        bool active;
    }
    
    mapping(uint256 => Division) public divisions;
    mapping(address => uint256) public memberDivision;
    mapping(uint256 => mapping(address => uint256)) public divisionStakes;
    
    uint256 public constant MAX_DIVISIONS = 144;
    uint256 public activeDivisions;
    
    event DivisionCreated(uint256 indexed divisionId, string constellation, address divisionHead);
    event DivisionMemberAdded(uint256 indexed divisionId, address member, uint256 stake);
    event DivisionResourceAllocated(uint256 indexed divisionId, uint256 amount);
    
    constructor(
        address _asset,
        uint256 _lockDuration
    ) BLEUEBaseVault(_asset, "Fractal Vault", _lockDuration) {}
    
    /**
     * @notice Create division
     * @param divisionId Division identifier (1-144)
     * @param constellationName Name of constellation
     * @param divisionHead Division head address
     */
    function createDivision(
        uint256 divisionId,
        string memory constellationName,
        address divisionHead
    )
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(divisionId > 0 && divisionId <= MAX_DIVISIONS, "Invalid division ID");
        require(!divisions[divisionId].active, "Division already exists");
        require(activeDivisions < MAX_DIVISIONS, "Max divisions reached");
        
        divisions[divisionId] = Division({
            divisionId: divisionId,
            constellationName: constellationName,
            divisionHead: divisionHead,
            memberCount: 0,
            totalStake: 0,
            active: true
        });
        
        activeDivisions++;
        emit DivisionCreated(divisionId, constellationName, divisionHead);
    }
    
    /**
     * @notice Add member to division with stake
     * @param divisionId Division identifier
     * @param member Member address
     * @param stake Stake amount
     */
    function addDivisionMember(uint256 divisionId, address member, uint256 stake)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        require(divisions[divisionId].active, "Division not active");
        require(memberDivision[member] == 0, "Member already in a division");
        
        memberDivision[member] = divisionId;
        divisionStakes[divisionId][member] = stake;
        divisions[divisionId].memberCount++;
        divisions[divisionId].totalStake += stake;
        
        emit DivisionMemberAdded(divisionId, member, stake);
    }
    
    /**
     * @notice Allocate resources to division
     * @param divisionId Division identifier
     * @param amount Total amount to allocate
     */
    function allocateResources(uint256 divisionId, uint256 amount)
        external
        onlyRole(VAULT_MANAGER_ROLE)
    {
        Division storage division = divisions[divisionId];
        require(division.active, "Division not active");
        
        // Allocate to division head
        claimableAmount[division.divisionHead] += amount;
        
        emit DivisionResourceAllocated(divisionId, amount);
    }
}
