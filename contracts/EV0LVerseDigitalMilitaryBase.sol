// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EV0LVerseDigitalMilitaryBase
 * @notice Digital military base architecture for EV0LVerse framework
 * @dev Manages humanoid soldiers (AI and VR entities) based on AOQPPPPI principles
 * 
 * Features:
 * - VR-compatible pseudo-troops with EvolDuty training integration
 * - Quad-layer protection grid (Cyber, Physical, Cosmic, Lore)
 * - Flame Crown Protocol sovereign authority binding
 * - E-SOIL corridor grid distribution system
 * - Watchtower CSV logging for tribunal-valid ENFT assets
 * 
 * AOQPPPPI Principles:
 * A - Authenticity: Each soldier verified through ceremonial seals
 * O - Optimization: Resource allocation via quad-layer grid
 * Q - Quality: Training standards enforced via EvolDuty
 * P - Protection: Multi-layer defense systems
 * P - Performance: Task efficiency metrics tracked
 * P - Persistence: Immutable deployment records
 * P - Precision: Surgical task delegation
 * I - Integration: Full narrative framework control
 */
contract EV0LVerseDigitalMilitaryBase is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    AccessControl,
    ReentrancyGuard,
    Pausable 
{
    // ============ Role Definitions ============
    bytes32 public constant FLAME_CROWN_ROLE = keccak256("FLAME_CROWN_ROLE");
    bytes32 public constant WATCHTOWER_ROLE = keccak256("WATCHTOWER_ROLE");
    bytes32 public constant BASE_COMMANDER_ROLE = keccak256("BASE_COMMANDER_ROLE");
    bytes32 public constant TRAINING_OFFICER_ROLE = keccak256("TRAINING_OFFICER_ROLE");
    bytes32 public constant DEPLOYMENT_OFFICER_ROLE = keccak256("DEPLOYMENT_OFFICER_ROLE");

    // ============ Enums ============
    
    /// @notice Soldier entity type
    enum SoldierType {
        AI_ENTITY,        // Fully autonomous AI soldier
        VR_HUMANOID,      // VR-controlled humanoid soldier
        HYBRID_AGENT      // Hybrid AI-VR soldier
    }

    /// @notice Soldier status
    enum SoldierStatus {
        RECRUIT,          // Initial state, requires training
        IN_TRAINING,      // Currently in EvolDuty training
        ACTIVE,           // Fully trained and deployable
        DEPLOYED,         // Currently on mission
        STANDBY,          // Ready but not deployed
        RETIRED,          // Decommissioned
        MEMORIAL          // Honored fallen status
    }

    /// @notice Quad-layer protection grid components
    enum DefenseLayer {
        CYBER,            // Encryption, data shielding
        PHYSICAL,         // Spatial resource allocation
        COSMIC,           // Orbital defense and targeting
        LORE              // Narrative framework control
    }

    /// @notice Mission types
    enum MissionType {
        BASE_FORTIFICATION,   // Strengthen base defenses
        RECONNAISSANCE,       // Intelligence gathering
        NARRATIVE_ADHERENCE,  // Maintain lore compliance
        PATROL,              // E-SOIL corridor patrol
        TACTICAL_STRIKE,     // Offensive operations
        RESOURCE_SECURITY    // Protect strategic assets
    }

    /// @notice E-SOIL corridor zones
    enum ESOILZone {
        SAFE_HAVEN,          // Protected civilian zones
        CONFLICT_REGION,     // Active combat areas
        CORRIDOR_TRANSIT,    // E-SOIL travel corridors
        STRATEGIC_OUTPOST,   // Military installations
        NEUTRAL_TERRITORY    // Unaligned zones
    }

    // ============ Structs ============

    /// @notice Humanoid soldier ENFT metadata
    struct HumanoidSoldier {
        uint256 tokenId;
        SoldierType soldierType;
        SoldierStatus status;
        bytes32 ceremonialSeal;      // Flame Crown authority binding
        uint256 createdAt;
        uint256 lastTrainingDate;
        uint256 deploymentCount;
        uint256 successfulMissions;
        uint256 trainingScore;       // EvolDuty performance (0-10000 basis points)
        bool isVRCompatible;
        address commandingOfficer;
        string metadataURI;
        bytes32[] deploymentHistory; // Hash references to deployments
    }

    /// @notice Defense grid configuration
    struct DefenseGrid {
        uint256 gridId;
        DefenseLayer layer;
        uint256 strength;            // Defense strength (0-10000 basis points)
        bool isActive;
        uint256 lastUpdated;
        address maintainer;
        bytes32[] auditLog;          // Watchtower audit entries
    }

    /// @notice Training simulation record
    struct TrainingSimulation {
        uint256 simulationId;
        uint256 tokenId;
        bytes32 evolDutySessionId;   // Reference to EvolDuty training session
        uint256 startTime;
        uint256 endTime;
        uint256 scoreAchieved;       // Performance score
        bool completed;
        string[] objectivesCompleted;
        bytes32 certificationHash;
    }

    /// @notice Deployment record
    struct Deployment {
        bytes32 deploymentId;
        uint256[] soldierTokenIds;
        MissionType missionType;
        ESOILZone targetZone;
        uint256 deployedAt;
        uint256 expectedReturn;
        uint256 actualReturn;
        bool isActive;
        bool successful;
        address commandedBy;
        bytes32 missionBrief;
        bytes32 afterActionReport;
        uint256 resourcesAllocated;
    }

    /// @notice Watchtower CSV log entry
    struct WatchtowerLogEntry {
        uint256 entryId;
        uint256 timestamp;
        bytes32 eventType;           // Hash of event type
        bytes32 entityReference;     // Reference to soldier/deployment/grid
        address actor;
        bytes32 dataHash;            // Hash of complete event data
        bool tribunalValid;          // Marked as tribunal-ready
    }

    // ============ State Variables ============
    
    uint256 private _tokenIdCounter;
    uint256 private _gridIdCounter;
    uint256 private _simulationIdCounter;
    uint256 private _deploymentCounter;
    uint256 private _logEntryCounter;

    // Mappings
    mapping(uint256 => HumanoidSoldier) public soldiers;
    mapping(uint256 => DefenseGrid) public defenseGrids;
    mapping(uint256 => TrainingSimulation) public trainingSimulations;
    mapping(bytes32 => Deployment) public deployments;
    mapping(uint256 => WatchtowerLogEntry) public watchtowerLogs;
    
    // Indexed lookups
    mapping(address => uint256[]) public officerToSoldiers;
    mapping(SoldierStatus => uint256[]) public statusToSoldiers;
    mapping(ESOILZone => uint256[]) public zoneToGrids;
    mapping(DefenseLayer => uint256[]) public layerToGrids;
    
    // Base configuration
    bytes32 public baseCeremonialSeal;
    bool public baseActivated;
    uint256 public baseActivationTime;
    uint256 public totalActiveDefenseStrength;

    // ============ Events ============
    
    event BaseActivated(bytes32 indexed ceremonialSeal, uint256 timestamp);
    event SoldierMinted(uint256 indexed tokenId, SoldierType soldierType, address officer);
    event SoldierStatusChanged(uint256 indexed tokenId, SoldierStatus oldStatus, SoldierStatus newStatus);
    event TrainingCompleted(uint256 indexed tokenId, uint256 simulationId, uint256 score);
    event DefenseGridCreated(uint256 indexed gridId, DefenseLayer layer, ESOILZone zone);
    event DefenseGridUpdated(uint256 indexed gridId, uint256 newStrength);
    event DeploymentCreated(bytes32 indexed deploymentId, MissionType missionType, uint256 soldierCount);
    event DeploymentCompleted(bytes32 indexed deploymentId, bool successful);
    event WatchtowerLogCreated(uint256 indexed entryId, bytes32 eventType, bytes32 entityReference);
    event FlameCrownAuthority(address indexed authority, bytes32 action, uint256 timestamp);

    // ============ Constructor ============

    constructor() ERC721("EV0LVerse Humanoid Soldier", "EVOL-SOLDIER") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FLAME_CROWN_ROLE, msg.sender);
        _grantRole(BASE_COMMANDER_ROLE, msg.sender);
    }

    // ============ Base Management ============

    /**
     * @notice Activate the military base with Flame Crown authority
     * @param ceremonialSeal The ceremonial seal binding sovereign command
     */
    function activateBase(bytes32 ceremonialSeal) external onlyRole(FLAME_CROWN_ROLE) {
        require(!baseActivated, "Base already activated");
        require(ceremonialSeal != bytes32(0), "Invalid ceremonial seal");
        
        baseCeremonialSeal = ceremonialSeal;
        baseActivated = true;
        baseActivationTime = block.timestamp;
        
        emit BaseActivated(ceremonialSeal, block.timestamp);
        emit FlameCrownAuthority(msg.sender, keccak256("ACTIVATE_BASE"), block.timestamp);
        
        _createWatchtowerLog(
            keccak256("BASE_ACTIVATION"),
            ceremonialSeal,
            msg.sender,
            keccak256(abi.encodePacked(ceremonialSeal, block.timestamp)),
            true
        );
    }

    // ============ Humanoid Soldier Management ============

    /**
     * @notice Mint a new humanoid soldier ENFT
     * @param soldierType Type of soldier (AI, VR, or Hybrid)
     * @param isVRCompatible Whether the soldier supports VR interface
     * @param commandingOfficer Officer in charge of this soldier
     * @param metadataURI IPFS URI for soldier metadata
     * @return tokenId The minted soldier token ID
     */
    function mintSoldier(
        SoldierType soldierType,
        bool isVRCompatible,
        address commandingOfficer,
        string memory metadataURI
    ) external onlyRole(BASE_COMMANDER_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(baseActivated, "Base not activated");
        require(commandingOfficer != address(0), "Invalid officer address");
        
        uint256 tokenId = _tokenIdCounter++;
        bytes32 ceremonialSeal = keccak256(abi.encodePacked(
            baseCeremonialSeal,
            soldierType,
            tokenId,
            block.timestamp
        ));
        
        soldiers[tokenId] = HumanoidSoldier({
            tokenId: tokenId,
            soldierType: soldierType,
            status: SoldierStatus.RECRUIT,
            ceremonialSeal: ceremonialSeal,
            createdAt: block.timestamp,
            lastTrainingDate: 0,
            deploymentCount: 0,
            successfulMissions: 0,
            trainingScore: 0,
            isVRCompatible: isVRCompatible,
            commandingOfficer: commandingOfficer,
            metadataURI: metadataURI,
            deploymentHistory: new bytes32[](0)
        });
        
        _safeMint(commandingOfficer, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        officerToSoldiers[commandingOfficer].push(tokenId);
        statusToSoldiers[SoldierStatus.RECRUIT].push(tokenId);
        
        emit SoldierMinted(tokenId, soldierType, commandingOfficer);
        
        _createWatchtowerLog(
            keccak256("SOLDIER_MINTED"),
            ceremonialSeal,
            msg.sender,
            keccak256(abi.encodePacked(tokenId, soldierType, commandingOfficer)),
            true
        );
        
        return tokenId;
    }

    /**
     * @notice Update soldier status
     * @param tokenId Soldier token ID
     * @param newStatus New status to assign
     */
    function updateSoldierStatus(
        uint256 tokenId,
        SoldierStatus newStatus
    ) external onlyRole(BASE_COMMANDER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Soldier does not exist");
        
        HumanoidSoldier storage soldier = soldiers[tokenId];
        SoldierStatus oldStatus = soldier.status;
        
        require(oldStatus != newStatus, "Status unchanged");
        
        soldier.status = newStatus;
        
        emit SoldierStatusChanged(tokenId, oldStatus, newStatus);
        
        _createWatchtowerLog(
            keccak256("STATUS_CHANGE"),
            soldier.ceremonialSeal,
            msg.sender,
            keccak256(abi.encodePacked(tokenId, oldStatus, newStatus)),
            true
        );
    }

    // ============ Training System (EvolDuty Integration) ============

    /**
     * @notice Record training simulation for a soldier
     * @param tokenId Soldier token ID
     * @param evolDutySessionId Reference to EvolDuty training session
     * @param scoreAchieved Performance score (0-10000 basis points)
     * @param objectivesCompleted Array of completed training objectives
     * @return simulationId The created simulation ID
     */
    function recordTrainingSimulation(
        uint256 tokenId,
        bytes32 evolDutySessionId,
        uint256 scoreAchieved,
        string[] memory objectivesCompleted
    ) external onlyRole(TRAINING_OFFICER_ROLE) returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Soldier does not exist");
        require(scoreAchieved <= 10000, "Invalid score");
        
        HumanoidSoldier storage soldier = soldiers[tokenId];
        require(
            soldier.status == SoldierStatus.RECRUIT || 
            soldier.status == SoldierStatus.IN_TRAINING ||
            soldier.status == SoldierStatus.ACTIVE ||
            soldier.status == SoldierStatus.STANDBY,
            "Soldier cannot train in current status"
        );
        
        uint256 simulationId = _simulationIdCounter++;
        bytes32 certificationHash = keccak256(abi.encodePacked(
            tokenId,
            evolDutySessionId,
            scoreAchieved,
            block.timestamp
        ));
        
        trainingSimulations[simulationId] = TrainingSimulation({
            simulationId: simulationId,
            tokenId: tokenId,
            evolDutySessionId: evolDutySessionId,
            startTime: block.timestamp,
            endTime: block.timestamp,
            scoreAchieved: scoreAchieved,
            completed: true,
            objectivesCompleted: objectivesCompleted,
            certificationHash: certificationHash
        });
        
        // Update soldier training metrics
        soldier.lastTrainingDate = block.timestamp;
        soldier.trainingScore = scoreAchieved;
        
        // If recruit and score is sufficient, promote to active
        if (soldier.status == SoldierStatus.RECRUIT && scoreAchieved >= 7000) {
            soldier.status = SoldierStatus.ACTIVE;
            emit SoldierStatusChanged(tokenId, SoldierStatus.RECRUIT, SoldierStatus.ACTIVE);
        }
        
        emit TrainingCompleted(tokenId, simulationId, scoreAchieved);
        
        _createWatchtowerLog(
            keccak256("TRAINING_COMPLETED"),
            soldier.ceremonialSeal,
            msg.sender,
            certificationHash,
            true
        );
        
        return simulationId;
    }

    // ============ Quad-Layer Defense Grid ============

    /**
     * @notice Create a defense grid component
     * @param layer Defense layer type (Cyber, Physical, Cosmic, Lore)
     * @param zone E-SOIL zone for this grid
     * @param initialStrength Initial defense strength (0-10000)
     * @return gridId The created grid ID
     */
    function createDefenseGrid(
        DefenseLayer layer,
        ESOILZone zone,
        uint256 initialStrength
    ) external onlyRole(BASE_COMMANDER_ROLE) returns (uint256) {
        require(baseActivated, "Base not activated");
        require(initialStrength <= 10000, "Invalid strength");
        
        uint256 gridId = _gridIdCounter++;
        
        defenseGrids[gridId] = DefenseGrid({
            gridId: gridId,
            layer: layer,
            strength: initialStrength,
            isActive: true,
            lastUpdated: block.timestamp,
            maintainer: msg.sender,
            auditLog: new bytes32[](0)
        });
        
        zoneToGrids[zone].push(gridId);
        layerToGrids[layer].push(gridId);
        totalActiveDefenseStrength += initialStrength;
        
        emit DefenseGridCreated(gridId, layer, zone);
        
        _createWatchtowerLog(
            keccak256("DEFENSE_GRID_CREATED"),
            keccak256(abi.encodePacked(gridId, layer, zone)),
            msg.sender,
            keccak256(abi.encodePacked(gridId, initialStrength, block.timestamp)),
            true
        );
        
        return gridId;
    }

    /**
     * @notice Update defense grid strength
     * @param gridId Grid ID to update
     * @param newStrength New defense strength
     */
    function updateDefenseGrid(
        uint256 gridId,
        uint256 newStrength
    ) external onlyRole(BASE_COMMANDER_ROLE) {
        require(newStrength <= 10000, "Invalid strength");
        
        DefenseGrid storage grid = defenseGrids[gridId];
        require(grid.isActive, "Grid not active");
        
        uint256 oldStrength = grid.strength;
        totalActiveDefenseStrength = totalActiveDefenseStrength - oldStrength + newStrength;
        
        grid.strength = newStrength;
        grid.lastUpdated = block.timestamp;
        
        emit DefenseGridUpdated(gridId, newStrength);
        
        _createWatchtowerLog(
            keccak256("DEFENSE_GRID_UPDATED"),
            keccak256(abi.encodePacked(gridId, grid.layer)),
            msg.sender,
            keccak256(abi.encodePacked(gridId, oldStrength, newStrength)),
            true
        );
    }

    // ============ Deployment Management ============

    /**
     * @notice Deploy soldiers on a mission
     * @param soldierTokenIds Array of soldier token IDs to deploy
     * @param missionType Type of mission
     * @param targetZone Target E-SOIL zone
     * @param missionBrief Hash of mission briefing document
     * @param expectedDuration Expected mission duration in seconds
     * @return deploymentId The created deployment ID
     */
    function deploySoldiers(
        uint256[] memory soldierTokenIds,
        MissionType missionType,
        ESOILZone targetZone,
        bytes32 missionBrief,
        uint256 expectedDuration
    ) external onlyRole(DEPLOYMENT_OFFICER_ROLE) nonReentrant returns (bytes32) {
        require(soldierTokenIds.length > 0, "No soldiers specified");
        require(expectedDuration > 0, "Invalid duration");
        
        bytes32 deploymentId = keccak256(abi.encodePacked(
            _deploymentCounter++,
            missionType,
            targetZone,
            block.timestamp
        ));
        
        // Verify all soldiers are deployable
        for (uint256 i = 0; i < soldierTokenIds.length; i++) {
            uint256 tokenId = soldierTokenIds[i];
            require(_ownerOf(tokenId) != address(0), "Soldier does not exist");
            
            HumanoidSoldier storage soldier = soldiers[tokenId];
            require(
                soldier.status == SoldierStatus.ACTIVE || 
                soldier.status == SoldierStatus.STANDBY,
                "Soldier not deployable"
            );
            
            // Update soldier status
            soldier.status = SoldierStatus.DEPLOYED;
            soldier.deploymentCount++;
            soldier.deploymentHistory.push(deploymentId);
        }
        
        deployments[deploymentId] = Deployment({
            deploymentId: deploymentId,
            soldierTokenIds: soldierTokenIds,
            missionType: missionType,
            targetZone: targetZone,
            deployedAt: block.timestamp,
            expectedReturn: block.timestamp + expectedDuration,
            actualReturn: 0,
            isActive: true,
            successful: false,
            commandedBy: msg.sender,
            missionBrief: missionBrief,
            afterActionReport: bytes32(0),
            resourcesAllocated: 0
        });
        
        emit DeploymentCreated(deploymentId, missionType, soldierTokenIds.length);
        
        _createWatchtowerLog(
            keccak256("DEPLOYMENT_CREATED"),
            deploymentId,
            msg.sender,
            keccak256(abi.encodePacked(deploymentId, soldierTokenIds.length, missionType)),
            true
        );
        
        return deploymentId;
    }

    /**
     * @notice Complete a deployment and return soldiers
     * @param deploymentId Deployment ID to complete
     * @param successful Whether the mission was successful
     * @param afterActionReport Hash of after-action report
     */
    function completeDeployment(
        bytes32 deploymentId,
        bool successful,
        bytes32 afterActionReport
    ) external onlyRole(DEPLOYMENT_OFFICER_ROLE) {
        Deployment storage deployment = deployments[deploymentId];
        require(deployment.isActive, "Deployment not active");
        
        deployment.isActive = false;
        deployment.successful = successful;
        deployment.actualReturn = block.timestamp;
        deployment.afterActionReport = afterActionReport;
        
        // Return soldiers to standby
        for (uint256 i = 0; i < deployment.soldierTokenIds.length; i++) {
            uint256 tokenId = deployment.soldierTokenIds[i];
            HumanoidSoldier storage soldier = soldiers[tokenId];
            soldier.status = SoldierStatus.STANDBY;
            
            if (successful) {
                soldier.successfulMissions++;
            }
        }
        
        emit DeploymentCompleted(deploymentId, successful);
        
        _createWatchtowerLog(
            keccak256("DEPLOYMENT_COMPLETED"),
            deploymentId,
            msg.sender,
            afterActionReport,
            true
        );
    }

    // ============ Watchtower CSV Logging ============

    /**
     * @notice Internal function to create tribunal-valid Watchtower log
     * @param eventType Hash of event type
     * @param entityReference Reference to entity (soldier/deployment/grid)
     * @param actor Address performing the action
     * @param dataHash Hash of complete event data
     * @param tribunalValid Whether entry is tribunal-ready
     */
    function _createWatchtowerLog(
        bytes32 eventType,
        bytes32 entityReference,
        address actor,
        bytes32 dataHash,
        bool tribunalValid
    ) internal {
        uint256 entryId = _logEntryCounter++;
        
        watchtowerLogs[entryId] = WatchtowerLogEntry({
            entryId: entryId,
            timestamp: block.timestamp,
            eventType: eventType,
            entityReference: entityReference,
            actor: actor,
            dataHash: dataHash,
            tribunalValid: tribunalValid
        });
        
        emit WatchtowerLogCreated(entryId, eventType, entityReference);
    }

    /**
     * @notice Export Watchtower logs as CSV data (off-chain processing)
     * @param startIndex Start index for log entries
     * @param count Number of entries to export
     * @return Log entry data for CSV generation
     */
    function exportWatchtowerLogs(
        uint256 startIndex,
        uint256 count
    ) external view returns (WatchtowerLogEntry[] memory) {
        require(startIndex + count <= _logEntryCounter, "Invalid range");
        
        WatchtowerLogEntry[] memory logs = new WatchtowerLogEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            logs[i] = watchtowerLogs[startIndex + i];
        }
        
        return logs;
    }

    // ============ Query Functions ============

    /**
     * @notice Get soldier details
     * @param tokenId Soldier token ID
     */
    function getSoldier(uint256 tokenId) external view returns (HumanoidSoldier memory) {
        require(_ownerOf(tokenId) != address(0), "Soldier does not exist");
        return soldiers[tokenId];
    }

    /**
     * @notice Get defense grid details
     * @param gridId Grid ID
     */
    function getDefenseGrid(uint256 gridId) external view returns (DefenseGrid memory) {
        return defenseGrids[gridId];
    }

    /**
     * @notice Get deployment details
     * @param deploymentId Deployment ID
     */
    function getDeployment(bytes32 deploymentId) external view returns (Deployment memory) {
        return deployments[deploymentId];
    }

    /**
     * @notice Get soldiers by status
     * @param status Soldier status filter
     */
    function getSoldiersByStatus(SoldierStatus status) external view returns (uint256[] memory) {
        return statusToSoldiers[status];
    }

    /**
     * @notice Get grids by zone
     * @param zone E-SOIL zone filter
     */
    function getGridsByZone(ESOILZone zone) external view returns (uint256[] memory) {
        return zoneToGrids[zone];
    }

    /**
     * @notice Get base status
     */
    function getBaseStatus() external view returns (
        bool activated,
        uint256 activationTime,
        uint256 totalSoldiers,
        uint256 totalGrids,
        uint256 defenseStrength
    ) {
        return (
            baseActivated,
            baseActivationTime,
            _tokenIdCounter,
            _gridIdCounter,
            totalActiveDefenseStrength
        );
    }

    // ============ Emergency Controls ============

    /**
     * @notice Emergency pause (Flame Crown authority)
     */
    function emergencyPause() external onlyRole(FLAME_CROWN_ROLE) {
        _pause();
        emit FlameCrownAuthority(msg.sender, keccak256("EMERGENCY_PAUSE"), block.timestamp);
    }

    /**
     * @notice Resume operations (Flame Crown authority)
     */
    function resumeOperations() external onlyRole(FLAME_CROWN_ROLE) {
        _unpause();
        emit FlameCrownAuthority(msg.sender, keccak256("RESUME_OPERATIONS"), block.timestamp);
    }

    // ============ Required Overrides ============

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
