// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BLEULION_CASCADE
 * @notice Root sovereign ledger contract that coordinates vault registries, scroll activation,
 *         and watchtower integrations for the BLEULIONTREASURY deployment bundle.
 */
contract BLEULION_CASCADE is Ownable {
    struct Vault {
        string name;
        address asset;
        bytes32 merkleRoot;
        bool exists;
    }

    struct Scroll {
        string title;
        string uri;
        bool active;
    }

    mapping(bytes32 => Vault) private _vaults;
    mapping(uint256 => Scroll) private _scrolls;
    bytes32[] private _vaultIds;

    uint256 private _scrollCount;
    address public watchtower;
    address public vaultRegistrar;
    address public scrollRegistrar;

    event VaultRegistered(bytes32 indexed vaultId, string name, address asset, bytes32 merkleRoot);
    event VaultRootUpdated(bytes32 indexed vaultId, bytes32 previousRoot, bytes32 newRoot);
    event ScrollRegistered(uint256 indexed scrollId, string title, string uri);
    event ScrollToggled(uint256 indexed scrollId, bool active);
    event WatchtowerSet(address indexed watchtower);
    event VaultRegistrarUpdated(address indexed registrar);
    event ScrollRegistrarUpdated(address indexed registrar);

    modifier onlyVaultRegistrar() {
        require(
            msg.sender == owner() || msg.sender == vaultRegistrar,
            "BLEULION: vault registrar required"
        );
        _;
    }

    modifier onlyScrollRegistrar() {
        require(
            msg.sender == owner() || msg.sender == scrollRegistrar,
            "BLEULION: scroll registrar required"
        );
        _;
    }

    function vaultCount() external view returns (uint256) {
        return _vaultIds.length;
    }

    function scrollCount() external view returns (uint256) {
        return _scrollCount;
    }

    function vaultAt(uint256 index) external view returns (bytes32 vaultId, Vault memory data) {
        require(index < _vaultIds.length, "BLEULION: index out of range");
        bytes32 id = _vaultIds[index];
        return (id, _vaults[id]);
    }

    function getVault(bytes32 vaultId) external view returns (Vault memory) {
        require(_vaults[vaultId].exists, "BLEULION: unknown vault");
        return _vaults[vaultId];
    }

    function getScroll(uint256 scrollId) external view returns (Scroll memory) {
        require(scrollId > 0 && scrollId <= _scrollCount, "BLEULION: unknown scroll");
        return _scrolls[scrollId];
    }

    function setWatchtower(address watchtower_) external onlyOwner {
        require(watchtower_ != address(0), "BLEULION: zero address");
        watchtower = watchtower_;
        emit WatchtowerSet(watchtower_);
    }

    function setVaultRegistrar(address registrar) external onlyOwner {
        vaultRegistrar = registrar;
        emit VaultRegistrarUpdated(registrar);
    }

    function setScrollRegistrar(address registrar) external onlyOwner {
        scrollRegistrar = registrar;
        emit ScrollRegistrarUpdated(registrar);
    }

    function registerVault(
        bytes32 vaultId,
        string calldata name,
        address asset,
        bytes32 merkleRoot
    ) external onlyVaultRegistrar {
        require(vaultId != bytes32(0), "BLEULION: invalid vault id");
        require(!_vaults[vaultId].exists, "BLEULION: vault exists");
        _vaults[vaultId] = Vault({name: name, asset: asset, merkleRoot: merkleRoot, exists: true});
        _vaultIds.push(vaultId);
        emit VaultRegistered(vaultId, name, asset, merkleRoot);
    }

    function updateVaultRoot(bytes32 vaultId, bytes32 newRoot) external onlyVaultRegistrar {
        require(_vaults[vaultId].exists, "BLEULION: unknown vault");
        bytes32 previous = _vaults[vaultId].merkleRoot;
        _vaults[vaultId].merkleRoot = newRoot;
        emit VaultRootUpdated(vaultId, previous, newRoot);
    }

    function registerScroll(string calldata title, string calldata uri)
        external
        onlyScrollRegistrar
        returns (uint256)
    {
        require(bytes(title).length > 0, "BLEULION: title required");
        require(bytes(uri).length > 0, "BLEULION: uri required");
        uint256 newId = ++_scrollCount;
        _scrolls[newId] = Scroll({title: title, uri: uri, active: true});
        emit ScrollRegistered(newId, title, uri);
        return newId;
    }

    function setScrollActive(uint256 scrollId, bool active) external onlyScrollRegistrar {
        require(scrollId > 0 && scrollId <= _scrollCount, "BLEULION: unknown scroll");
        _scrolls[scrollId].active = active;
        emit ScrollToggled(scrollId, active);
    }
}
