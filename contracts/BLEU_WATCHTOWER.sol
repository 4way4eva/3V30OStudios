// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./BLEULION_CASCADE.sol";

/**
 * @title BLEU_WATCHTOWER
 * @notice Provides non-extractive verification of vault Merkle roots and ceremonial audit trails.
 */
contract BLEU_WATCHTOWER is Ownable {
    struct AuditRecord {
        bytes32 vaultId;
        bytes32 merkleRoot;
        string reportUri;
        uint256 timestamp;
        address oracle;
    }

    BLEULION_CASCADE public immutable cascade;

    mapping(bytes32 => AuditRecord[]) private _auditLog;
    mapping(address => bool) public oracleRegistry;

    event OracleUpdated(address indexed oracle, bool active);
    event AuditLogged(bytes32 indexed vaultId, bytes32 merkleRoot, string reportUri, address oracle);

    constructor(BLEULION_CASCADE cascade_) {
        cascade = cascade_;
    }

    modifier onlyOracle() {
        require(oracleRegistry[msg.sender] || msg.sender == owner(), "WATCHTOWER: oracle required");
        _;
    }

    function setOracle(address oracle, bool active) external onlyOwner {
        require(oracle != address(0), "WATCHTOWER: zero address");
        oracleRegistry[oracle] = active;
        emit OracleUpdated(oracle, active);
    }

    function auditCount(bytes32 vaultId) external view returns (uint256) {
        return _auditLog[vaultId].length;
    }

    function latestAudit(bytes32 vaultId) external view returns (AuditRecord memory) {
        uint256 count = _auditLog[vaultId].length;
        require(count > 0, "WATCHTOWER: no audit");
        return _auditLog[vaultId][count - 1];
    }

    function recordVaultRoot(bytes32 vaultId, bytes32 merkleRoot, string calldata reportUri)
        external
        onlyOracle
    {
        cascade.updateVaultRoot(vaultId, merkleRoot);
        _auditLog[vaultId].push(
            AuditRecord({
                vaultId: vaultId,
                merkleRoot: merkleRoot,
                reportUri: reportUri,
                timestamp: block.timestamp,
                oracle: msg.sender
            })
        );
        emit AuditLogged(vaultId, merkleRoot, reportUri, msg.sender);
    }
}
