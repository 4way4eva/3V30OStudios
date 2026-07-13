// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MetaCurriculum
 * @dev ENFT proof system for ZIONAIRE certifications and curriculum compliance tracking
 * 
 * Features:
 * - Curriculum module tracking with ENFT proofs
 * - ZIONAIRE certification system
 * - Compliance verification for educational achievements
 * - Integration with BLEUE Academy infrastructure
 * - Multi-level certification paths (Preschool → Doctoral)
 */
contract MetaCurriculum is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant EDUCATOR_ROLE = keccak256("EDUCATOR_ROLE");
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant CURRICULUM_ADMIN_ROLE = keccak256("CURRICULUM_ADMIN_ROLE");

    // Education levels
    enum EducationLevel {
        PRESCHOOL,
        ELEMENTARY,
        MIDDLE_SCHOOL,
        HIGH_SCHOOL,
        UNDERGRADUATE,
        GRADUATE,
        DOCTORAL,
        PROFESSIONAL
    }

    // Certification status
    enum CertificationStatus {
        IN_PROGRESS,
        COMPLETED,
        VERIFIED,
        REVOKED
    }

    // Module completion status
    enum ModuleStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        VERIFIED
    }

    // Curriculum module structure
    struct CurriculumModule {
        uint256 moduleId;
        string moduleName;
        string description;
        EducationLevel level;
        uint256 creditHours;
        bytes32 contentHash; // IPFS hash of curriculum content
        bool isActive;
        uint256 createdAt;
        address createdBy;
    }

    // Student module completion record
    struct ModuleCompletion {
        uint256 moduleId;
        address student;
        ModuleStatus status;
        uint256 startedAt;
        uint256 completedAt;
        uint256 verifiedAt;
        address verifiedBy;
        bytes32 proofHash; // ENFT proof hash
        uint256 score; // 0-100
    }

    // ZIONAIRE certification structure
    struct ZIONAIRECertification {
        uint256 certId;
        address holder;
        EducationLevel level;
        CertificationStatus status;
        uint256 issuedAt;
        uint256 expiresAt;
        bytes32 certHash; // Hash of certification data
        bytes32 enftsHash; // Hash of all ENFTs backing this cert
        uint256[] completedModules; // Module IDs
        string metadataURI; // IPFS URI for certificate
    }

    // Compliance tracking structure
    struct ComplianceRecord {
        address student;
        EducationLevel level;
        uint256 totalModules;
        uint256 completedModules;
        uint256 totalCredits;
        uint256 earnedCredits;
        uint256 lastUpdated;
        bool meetsRequirements;
    }

    // State variables
    uint256 private _moduleIdCounter;
    uint256 private _certIdCounter;

    mapping(uint256 => CurriculumModule) public modules;
    mapping(address => mapping(uint256 => ModuleCompletion)) public studentModules;
    mapping(uint256 => ZIONAIRECertification) public certifications;
    mapping(address => uint256[]) public studentCertifications;
    mapping(address => mapping(EducationLevel => ComplianceRecord)) public complianceRecords;
    
    // Module prerequisites
    mapping(uint256 => uint256[]) public modulePrerequisites;
    
    // Level requirements (credit hours needed)
    mapping(EducationLevel => uint256) public levelRequirements;
    
    // Track students enrolled in modules
    mapping(uint256 => address[]) public moduleEnrollments;

    // Events
    event ModuleCreated(
        uint256 indexed moduleId,
        string moduleName,
        EducationLevel level,
        uint256 creditHours
    );

    event ModuleEnrolled(
        uint256 indexed moduleId,
        address indexed student,
        uint256 timestamp
    );

    event ModuleCompleted(
        uint256 indexed moduleId,
        address indexed student,
        uint256 score,
        bytes32 proofHash
    );

    event ModuleVerified(
        uint256 indexed moduleId,
        address indexed student,
        address indexed verifier,
        uint256 timestamp
    );

    event CertificationIssued(
        uint256 indexed certId,
        address indexed holder,
        EducationLevel level,
        bytes32 enftsHash
    );

    event CertificationRevoked(
        uint256 indexed certId,
        address indexed revokedBy,
        uint256 timestamp
    );

    event ComplianceUpdated(
        address indexed student,
        EducationLevel level,
        bool meetsRequirements
    );

    /**
     * @dev Constructor sets up the curriculum system
     * @param admin The address that will be granted admin role
     */
    constructor(address admin) {
        require(admin != address(0), "MetaCurriculum: invalid admin");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CURRICULUM_ADMIN_ROLE, admin);
        _grantRole(EDUCATOR_ROLE, admin);
        _grantRole(CERTIFIER_ROLE, admin);
        
        // Initialize level requirements (credit hours)
        levelRequirements[EducationLevel.PRESCHOOL] = 0;
        levelRequirements[EducationLevel.ELEMENTARY] = 24;
        levelRequirements[EducationLevel.MIDDLE_SCHOOL] = 36;
        levelRequirements[EducationLevel.HIGH_SCHOOL] = 48;
        levelRequirements[EducationLevel.UNDERGRADUATE] = 120;
        levelRequirements[EducationLevel.GRADUATE] = 36;
        levelRequirements[EducationLevel.DOCTORAL] = 72;
        levelRequirements[EducationLevel.PROFESSIONAL] = 60;
    }

    /**
     * @dev Create a new curriculum module
     * @param moduleName Name of the module
     * @param description Description of the module
     * @param level Education level
     * @param creditHours Number of credit hours
     * @param contentHash IPFS hash of content
     * @param prerequisites Array of prerequisite module IDs
     * @return moduleId The ID of the created module
     */
    function createModule(
        string calldata moduleName,
        string calldata description,
        EducationLevel level,
        uint256 creditHours,
        bytes32 contentHash,
        uint256[] calldata prerequisites
    ) external onlyRole(CURRICULUM_ADMIN_ROLE) returns (uint256) {
        require(bytes(moduleName).length > 0, "MetaCurriculum: empty name");
        require(creditHours > 0, "MetaCurriculum: invalid credit hours");
        
        uint256 moduleId = _moduleIdCounter++;
        
        modules[moduleId] = CurriculumModule({
            moduleId: moduleId,
            moduleName: moduleName,
            description: description,
            level: level,
            creditHours: creditHours,
            contentHash: contentHash,
            isActive: true,
            createdAt: block.timestamp,
            createdBy: msg.sender
        });

        // Set prerequisites
        if (prerequisites.length > 0) {
            modulePrerequisites[moduleId] = prerequisites;
        }

        emit ModuleCreated(moduleId, moduleName, level, creditHours);
        
        return moduleId;
    }

    /**
     * @dev Enroll a student in a module
     * @param moduleId The module ID
     * @param student Student address
     */
    function enrollStudent(
        uint256 moduleId,
        address student
    ) external onlyRole(EDUCATOR_ROLE) {
        require(student != address(0), "MetaCurriculum: invalid student");
        CurriculumModule storage module = modules[moduleId];
        require(module.isActive, "MetaCurriculum: module not active");
        require(
            studentModules[student][moduleId].status == ModuleStatus.NOT_STARTED,
            "MetaCurriculum: already enrolled"
        );

        // Check prerequisites
        uint256[] memory prerequisites = modulePrerequisites[moduleId];
        for (uint256 i = 0; i < prerequisites.length; i++) {
            require(
                studentModules[student][prerequisites[i]].status == ModuleStatus.VERIFIED,
                "MetaCurriculum: prerequisites not met"
            );
        }

        studentModules[student][moduleId] = ModuleCompletion({
            moduleId: moduleId,
            student: student,
            status: ModuleStatus.IN_PROGRESS,
            startedAt: block.timestamp,
            completedAt: 0,
            verifiedAt: 0,
            verifiedBy: address(0),
            proofHash: bytes32(0),
            score: 0
        });

        moduleEnrollments[moduleId].push(student);

        emit ModuleEnrolled(moduleId, student, block.timestamp);
    }

    /**
     * @dev Mark a module as completed for a student
     * @param moduleId The module ID
     * @param student Student address
     * @param score Score (0-100)
     * @param proofHash ENFT proof hash
     */
    function completeModule(
        uint256 moduleId,
        address student,
        uint256 score,
        bytes32 proofHash
    ) external onlyRole(EDUCATOR_ROLE) {
        require(score <= 100, "MetaCurriculum: invalid score");
        ModuleCompletion storage completion = studentModules[student][moduleId];
        require(
            completion.status == ModuleStatus.IN_PROGRESS,
            "MetaCurriculum: module not in progress"
        );

        completion.status = ModuleStatus.COMPLETED;
        completion.completedAt = block.timestamp;
        completion.score = score;
        completion.proofHash = proofHash;

        emit ModuleCompleted(moduleId, student, score, proofHash);
        
        // Update compliance
        _updateCompliance(student, modules[moduleId].level);
    }

    /**
     * @dev Verify a completed module
     * @param moduleId The module ID
     * @param student Student address
     */
    function verifyModule(
        uint256 moduleId,
        address student
    ) external onlyRole(CERTIFIER_ROLE) {
        ModuleCompletion storage completion = studentModules[student][moduleId];
        require(
            completion.status == ModuleStatus.COMPLETED,
            "MetaCurriculum: module not completed"
        );

        completion.status = ModuleStatus.VERIFIED;
        completion.verifiedAt = block.timestamp;
        completion.verifiedBy = msg.sender;

        emit ModuleVerified(moduleId, student, msg.sender, block.timestamp);
        
        // Update compliance
        _updateCompliance(student, modules[moduleId].level);
    }

    /**
     * @dev Issue a ZIONAIRE certification
     * @param holder Certification holder address
     * @param level Education level
     * @param moduleIds Array of completed module IDs
     * @param metadataURI IPFS URI for certificate
     * @param expiryDuration Duration until expiry (0 for no expiry)
     * @return certId The ID of the issued certification
     */
    function issueCertification(
        address holder,
        EducationLevel level,
        uint256[] calldata moduleIds,
        string calldata metadataURI,
        uint256 expiryDuration
    ) external onlyRole(CERTIFIER_ROLE) returns (uint256) {
        require(holder != address(0), "MetaCurriculum: invalid holder");
        require(moduleIds.length > 0, "MetaCurriculum: no modules");

        // Verify all modules are completed and verified
        bytes32 enftsHash = keccak256(abi.encodePacked(holder, level, block.timestamp));
        for (uint256 i = 0; i < moduleIds.length; i++) {
            ModuleCompletion storage completion = studentModules[holder][moduleIds[i]];
            require(
                completion.status == ModuleStatus.VERIFIED,
                "MetaCurriculum: module not verified"
            );
            enftsHash = keccak256(abi.encodePacked(enftsHash, completion.proofHash));
        }

        // Check compliance requirements
        ComplianceRecord storage compliance = complianceRecords[holder][level];
        require(compliance.meetsRequirements, "MetaCurriculum: requirements not met");

        uint256 certId = _certIdCounter++;
        uint256 expiresAt = expiryDuration > 0 ? block.timestamp + expiryDuration : 0;
        
        certifications[certId] = ZIONAIRECertification({
            certId: certId,
            holder: holder,
            level: level,
            status: CertificationStatus.VERIFIED,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            certHash: keccak256(abi.encodePacked(certId, holder, level, block.timestamp)),
            enftsHash: enftsHash,
            completedModules: moduleIds,
            metadataURI: metadataURI
        });

        studentCertifications[holder].push(certId);

        emit CertificationIssued(certId, holder, level, enftsHash);
        
        return certId;
    }

    /**
     * @dev Revoke a certification
     * @param certId The certification ID
     */
    function revokeCertification(uint256 certId) external onlyRole(CERTIFIER_ROLE) {
        ZIONAIRECertification storage cert = certifications[certId];
        require(cert.issuedAt > 0, "MetaCurriculum: cert does not exist");
        require(cert.status != CertificationStatus.REVOKED, "MetaCurriculum: already revoked");

        cert.status = CertificationStatus.REVOKED;

        emit CertificationRevoked(certId, msg.sender, block.timestamp);
    }

    /**
     * @dev Internal function to update compliance records
     * @param student Student address
     * @param level Education level
     */
    function _updateCompliance(address student, EducationLevel level) internal {
        ComplianceRecord storage compliance = complianceRecords[student][level];
        
        uint256 earnedCredits = 0;
        uint256 completedCount = 0;
        
        // Calculate earned credits for this level
        for (uint256 i = 0; i < _moduleIdCounter; i++) {
            if (modules[i].level == level) {
                ModuleCompletion storage completion = studentModules[student][i];
                if (completion.status == ModuleStatus.VERIFIED) {
                    earnedCredits += modules[i].creditHours;
                    completedCount++;
                }
            }
        }

        compliance.student = student;
        compliance.level = level;
        compliance.completedModules = completedCount;
        compliance.earnedCredits = earnedCredits;
        compliance.lastUpdated = block.timestamp;
        compliance.meetsRequirements = earnedCredits >= levelRequirements[level];

        emit ComplianceUpdated(student, level, compliance.meetsRequirements);
    }

    /**
     * @dev Update level requirements
     * @param level Education level
     * @param creditHours Required credit hours
     */
    function updateLevelRequirements(
        EducationLevel level,
        uint256 creditHours
    ) external onlyRole(CURRICULUM_ADMIN_ROLE) {
        levelRequirements[level] = creditHours;
    }

    /**
     * @dev Get student's certifications
     * @param student Student address
     * @return Array of certification IDs
     */
    function getStudentCertifications(address student) external view returns (uint256[] memory) {
        return studentCertifications[student];
    }

    /**
     * @dev Get module prerequisites
     * @param moduleId The module ID
     * @return Array of prerequisite module IDs
     */
    function getModulePrerequisites(uint256 moduleId) external view returns (uint256[] memory) {
        return modulePrerequisites[moduleId];
    }

    /**
     * @dev Get students enrolled in a module
     * @param moduleId The module ID
     * @return Array of student addresses
     */
    function getModuleEnrollments(uint256 moduleId) external view returns (address[] memory) {
        return moduleEnrollments[moduleId];
    }

    /**
     * @dev Get certification completed modules
     * @param certId The certification ID
     * @return Array of completed module IDs
     */
    function getCertificationModules(uint256 certId) external view returns (uint256[] memory) {
        return certifications[certId].completedModules;
    }
}
