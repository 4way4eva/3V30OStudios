// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./BLEULION_CASCADE.sol";
import "./BLEU_WATCHTOWER.sol";

/**
 * @title BLEU_GOV_SCROLL
 * @notice Governance registry that coordinates personas, scroll endorsements, and watchtower policy.
 */
contract BLEU_GOV_SCROLL is AccessControl {
    bytes32 public constant SCRIBE_ROLE = keccak256("SCRIBE_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    struct Persona {
        string name;
        string personaType;
        address account;
        uint256 votingPower;
        bool active;
    }

    BLEULION_CASCADE public cascade;
    BLEU_WATCHTOWER public watchtower;

    mapping(bytes32 => Persona) private _personas;
    bytes32[] private _personaIds;

    event PersonaRegistered(bytes32 indexed personaId, string name, string personaType, address account);
    event PersonaStatusUpdated(bytes32 indexed personaId, bool active, uint256 votingPower);
    event WatchtowerAligned(address indexed watchtower);
    event ScrollEndorsed(uint256 indexed scrollId, bytes32 indexed personaId, string memo);

    constructor(address admin, BLEULION_CASCADE cascade_, BLEU_WATCHTOWER watchtower_) {
        require(admin != address(0), "BLEU_GOV: admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SCRIBE_ROLE, admin);
        _grantRole(ORACLE_ROLE, admin);
        cascade = cascade_;
        watchtower = watchtower_;
    }

    function personaCount() external view returns (uint256) {
        return _personaIds.length;
    }

    function personaAt(uint256 index) external view returns (bytes32 personaId, Persona memory persona) {
        require(index < _personaIds.length, "BLEU_GOV: index out of bounds");
        bytes32 id = _personaIds[index];
        return (id, _personas[id]);
    }

    function getPersona(bytes32 personaId) external view returns (Persona memory) {
        Persona memory persona = _personas[personaId];
        require(bytes(persona.name).length > 0, "BLEU_GOV: persona missing");
        return persona;
    }

    function setCascade(BLEULION_CASCADE cascade_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        cascade = cascade_;
    }

    function setWatchtower(BLEU_WATCHTOWER watchtower_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        watchtower = watchtower_;
        emit WatchtowerAligned(address(watchtower_));
    }

    function registerPersona(
        bytes32 personaId,
        string calldata name,
        string calldata personaType,
        address account,
        uint256 votingPower
    ) external onlyRole(SCRIBE_ROLE) {
        require(personaId != bytes32(0), "BLEU_GOV: invalid id");
        require(bytes(name).length > 0, "BLEU_GOV: name required");
        require(_personas[personaId].account == address(0), "BLEU_GOV: persona exists");
        _personas[personaId] = Persona({
            name: name,
            personaType: personaType,
            account: account,
            votingPower: votingPower,
            active: true
        });
        _personaIds.push(personaId);
        emit PersonaRegistered(personaId, name, personaType, account);
    }

    function updatePersonaStatus(bytes32 personaId, bool active, uint256 votingPower)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        Persona storage persona = _personas[personaId];
        require(bytes(persona.name).length > 0, "BLEU_GOV: persona missing");
        persona.active = active;
        persona.votingPower = votingPower;
        emit PersonaStatusUpdated(personaId, active, votingPower);
    }

    function endorseScroll(uint256 scrollId, bytes32 personaId, string calldata memo)
        external
        onlyRole(SCRIBE_ROLE)
    {
        Persona memory persona = _personas[personaId];
        require(persona.active, "BLEU_GOV: persona inactive");
        require(persona.account != address(0), "BLEU_GOV: persona missing");
        emit ScrollEndorsed(scrollId, personaId, memo);
    }

    function appointScribe(address account, bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "BLEU_GOV: account required");
        if (enabled) {
            _grantRole(SCRIBE_ROLE, account);
        } else {
            _revokeRole(SCRIBE_ROLE, account);
        }
    }

    function appointOracle(address account, bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "BLEU_GOV: account required");
        if (enabled) {
            _grantRole(ORACLE_ROLE, account);
        } else {
            _revokeRole(ORACLE_ROLE, account);
        }
    }

    function authorizeVaultRoot(
        bytes32 vaultId,
        bytes32 newRoot,
        string calldata auditUri
    ) external onlyRole(ORACLE_ROLE) {
        require(address(watchtower) != address(0), "BLEU_GOV: watchtower unset");
        watchtower.recordVaultRoot(vaultId, newRoot, auditUri);
    }
}
