// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AtlantisRelicNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Struct to represent a relic's position on the 7-rail/48-spine grid
    struct GridCoordinates {
        uint8 rail;   // 0-6 (7 rails)
        uint8 spine;  // 0-47 (48 spines)
    }

    // Mapping from token ID to grid coordinates
    mapping(uint256 => GridCoordinates) private _relicCoordinates;

    constructor() ERC721("AtlantisRelic", "ATLR") {}

    // Mint a relic with grid coordinates
    function mintRelic(uint8 rail, uint8 spine) public returns (uint256) {
        require(rail < 7 && spine < 48, "Invalid grid coordinates");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _relicCoordinates[tokenId] = GridCoordinates(rail, spine);
        return tokenId;
    }

    // Get a relic's grid coordinates
    function getRelicCoordinates(uint256 tokenId) public view returns (GridCoordinates memory) {
        require(_exists(tokenId), "Token does not exist");
        return _relicCoordinates[tokenId];
    }
}