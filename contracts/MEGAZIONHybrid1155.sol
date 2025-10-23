// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title MEGAZIONHybrid1155
/// @notice ERC-1155 contract tailored for the 48 gem Hybrid Ω48 collection with
/// multi-chain aware base URIs and ceremonial mint controls.
contract MEGAZIONHybrid1155 is ERC1155, Ownable {
    using Strings for uint256;

    struct GemMetadata {
        string name;
        string sovereignCode;
        bool attuned;
    }

    struct ChainConfig {
        string baseUri;
        bool active;
    }

    mapping(uint256 => GemMetadata) private _gems;
    mapping(uint256 => ChainConfig) private _chainConfigurations;
    mapping(uint256 => bool) public ceremonialMinted;

    bool public metadataFrozen;
    bool public chainConfigFrozen;

    event GemRegistered(uint256 indexed tokenId, string name, string sovereignCode);
    event CeremonialMint(address indexed operator, address indexed to, uint256 indexed tokenId, uint256 amount);
    event ChainConfigured(uint256 indexed chainId, string baseUri, bool active);

    constructor(string memory defaultBaseUri) ERC1155(defaultBaseUri) {
        if (bytes(defaultBaseUri).length > 0) {
            _chainConfigurations[block.chainid] = ChainConfig({baseUri: defaultBaseUri, active: true});
        }
    }

    modifier notFrozen(bool flag) {
        require(!flag, "MEGAZION: configuration frozen");
        _;
    }

    /// @notice Registers metadata for a given gem token id.
    function registerGem(
        uint256 tokenId,
        string calldata name,
        string calldata sovereignCode
    ) external onlyOwner notFrozen(metadataFrozen) {
        _gems[tokenId] = GemMetadata({name: name, sovereignCode: sovereignCode, attuned: true});
        emit GemRegistered(tokenId, name, sovereignCode);
    }

    /// @notice Bulk registers multiple gems in a single transaction.
    function registerGems(
        uint256[] calldata tokenIds,
        string[] calldata names,
        string[] calldata sovereignCodes
    ) external onlyOwner notFrozen(metadataFrozen) {
        require(tokenIds.length == names.length && tokenIds.length == sovereignCodes.length, "MEGAZION: length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _gems[tokenIds[i]] = GemMetadata({name: names[i], sovereignCode: sovereignCodes[i], attuned: true});
            emit GemRegistered(tokenIds[i], names[i], sovereignCodes[i]);
        }
    }

    /// @notice Locks metadata updates. Once frozen, gem registrations cannot change.
    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
    }

    /// @notice Configures the active base URI for a specific chain id.
    function configureChain(
        uint256 chainId,
        string calldata baseUri,
        bool active
    ) external onlyOwner notFrozen(chainConfigFrozen) {
        _chainConfigurations[chainId] = ChainConfig({baseUri: baseUri, active: active});
        emit ChainConfigured(chainId, baseUri, active);
    }

    /// @notice Freezes chain configuration updates across all networks.
    function freezeChainConfigurations() external onlyOwner {
        chainConfigFrozen = true;
    }

    /// @notice Performs the ceremonial mint of all gems to the recipient wallet.
    function mintCollection(
        address to,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(tokenIds.length == amounts.length, "MEGAZION: length mismatch");
        _mintBatch(to, tokenIds, amounts, "");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            ceremonialMinted[tokenIds[i]] = true;
            emit CeremonialMint(_msgSender(), to, tokenIds[i], amounts[i]);
        }
    }

    /// @notice Returns gem metadata for indexing clients.
    function gem(uint256 tokenId) external view returns (GemMetadata memory) {
        return _gems[tokenId];
    }

    /// @notice Returns chain configuration details for a given chain id.
    function chainConfig(uint256 chainId) external view returns (ChainConfig memory) {
        ChainConfig memory config = _chainConfigurations[chainId];
        if (bytes(config.baseUri).length == 0) {
            return ChainConfig({baseUri: super.uri(0), active: false});
        }
        return config;
    }

    /// @inheritdoc ERC1155
    function uri(uint256 tokenId) public view override returns (string memory) {
        ChainConfig memory config = _chainConfigurations[block.chainid];
        if (config.active && bytes(config.baseUri).length > 0) {
            return _formatUri(config.baseUri, tokenId);
        }
        string memory baseUri = super.uri(tokenId);
        if (bytes(baseUri).length == 0) {
            return baseUri;
        }
        return _formatUri(baseUri, tokenId);
    }

    function _formatUri(string memory baseUri, uint256 tokenId) internal pure returns (string memory) {
        bytes memory baseBytes = bytes(baseUri);
        bytes memory placeholder = bytes("{id}");
        for (uint256 i = 0; i + 3 < baseBytes.length; i++) {
            if (
                baseBytes[i] == placeholder[0] &&
                baseBytes[i + 1] == placeholder[1] &&
                baseBytes[i + 2] == placeholder[2] &&
                baseBytes[i + 3] == placeholder[3]
            ) {
                bytes memory prefix = new bytes(i);
                for (uint256 j = 0; j < i; j++) {
                    prefix[j] = baseBytes[j];
                }
                bytes memory suffix = new bytes(baseBytes.length - (i + 4));
                for (uint256 k = 0; k < suffix.length; k++) {
                    suffix[k] = baseBytes[i + 4 + k];
                }
                return string(abi.encodePacked(prefix, Strings.toHexString(tokenId, 32), suffix));
            }
        }
        return string(abi.encodePacked(baseUri, tokenId.toString(), ".json"));
    }
}
