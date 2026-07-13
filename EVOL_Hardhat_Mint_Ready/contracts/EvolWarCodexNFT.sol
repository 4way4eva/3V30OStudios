// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EvolWarCodexNFT
 * @dev Simple ERC-721 contract for minting EVOL War Codex ENFTs
 */
contract EvolWarCodexNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;

    event ENFTMinted(address indexed to, uint256 indexed tokenId, string uri);

    constructor() ERC721("EVOL War Codex", "EVOLCODEX") Ownable(msg.sender) {
        _tokenIdCounter = 1;
    }

    /**
     * @dev Set the base URI for token metadata
     * @param baseURI The IPFS base URI (e.g., "ipfs://QmX.../")
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Returns the base URI for computing tokenURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Safely mint a new ENFT to the specified address
     * @param to The address that will receive the minted NFT
     */
    function safeMint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        
        emit ENFTMinted(to, tokenId, tokenURI(tokenId));
        return tokenId;
    }

    /**
     * @dev Get the current token ID counter
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
