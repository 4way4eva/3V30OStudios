// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DynamicMapNFT is ERC721 {
    uint256 private _nextTokenId = 1;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("CodexWarMap", "CWM") {}

    // Update the metadata URI for a map NFT (e.g., when the Codex expands)
    function updateMapURI(uint256 tokenId, string memory newURI) public {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenURIs[tokenId] = newURI;
    }

    // Override tokenURI to return dynamic metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    // Mint a new map NFT
    function mintMap(string memory initialURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = initialURI;
        return tokenId;
    }
}