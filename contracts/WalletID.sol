// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WalletID is ERC721URIStorage, Ownable {
    constructor() ERC721("WalletID", "WID") {}

    function issue(address to, uint256 tokenId, string memory uri_) external onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri_);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        // Disable transfers: only mint (from 0) and burn (to 0) allowed
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "non-transferable");
        return super._update(to, tokenId, auth);
    }
}
