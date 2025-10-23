// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract EV0L721 is ERC721URIStorage, Ownable {
    uint256 public maxSupply;
    uint256 public totalMinted;

    constructor(string memory name_, string memory symbol_, uint256 maxSupply_) ERC721(name_, symbol_) {
        maxSupply = maxSupply_;
    }

    function safeMint(address to, uint256 tokenId, string memory uri_) public onlyOwner {
        require(totalMinted < maxSupply, "sold out");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri_);
        unchecked { totalMinted++; }
    }

    function safeMintBatch(address to, uint256[] calldata tokenIds, string[] calldata uris) external onlyOwner {
        require(tokenIds.length == uris.length, "len mismatch");
        require(totalMinted + tokenIds.length <= maxSupply, "exceeds");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _safeMint(to, tokenIds[i]);
            _setTokenURI(tokenIds[i], uris[i]);
        }
        totalMinted += tokenIds.length;
    }
}
