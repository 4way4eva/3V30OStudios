// SPDX-License-Identifier: MIT
// Copyright (c) 2025 3V30OStudios
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EvolverseBleuSosa
 * @dev ERC721 NFT contract for MEGAZION / BLEULIONTREASURY Evolverse collection
 * 
 * Features:
 * - Owner-only minting
 * - Pausable for emergency stops
 * - ReentrancyGuard for security
 * - Custom base URI for metadata
 * - Token counter for sequential minting
 * 
 * Part of the 48-Fold Codex feature package.
 */
contract EvolverseBleuSosa is ERC721, Ownable, Pausable, ReentrancyGuard {
    
    // Token ID counter
    uint256 private _nextTokenId;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Optional: Maximum supply
    uint256 public maxSupply;
    
    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    
    /**
     * @dev Constructor
     * @param initialOwner Address of the contract owner
     * @param baseURI Initial base URI for token metadata (IPFS gateway)
     * @param _maxSupply Maximum supply (0 for unlimited)
     */
    constructor(
        address initialOwner,
        string memory baseURI,
        uint256 _maxSupply
    ) ERC721("Evolverse Bleu Sosa", "EVBS") Ownable(initialOwner) {
        _baseTokenURI = baseURI;
        maxSupply = _maxSupply;
        _nextTokenId = 1; // Start token IDs at 1
    }
    
    /**
     * @dev Mint a new token to specified address (owner only)
     * @param to Address to receive the minted token
     * @return tokenId The ID of the minted token
     */
    function mint(address to) external onlyOwner whenNotPaused nonReentrant returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        
        // Check max supply if set
        if (maxSupply > 0) {
            require(_nextTokenId <= maxSupply, "Max supply reached");
        }
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        
        emit TokenMinted(to, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple tokens (owner only)
     * @param to Address to receive the minted tokens
     * @param amount Number of tokens to mint
     * @return tokenIds Array of minted token IDs
     */
    function batchMint(address to, uint256 amount) 
        external 
        onlyOwner 
        whenNotPaused 
        nonReentrant 
        returns (uint256[] memory) 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0 && amount <= 100, "Invalid amount (1-100)");
        
        // Check max supply if set
        if (maxSupply > 0) {
            require(_nextTokenId + amount - 1 <= maxSupply, "Would exceed max supply");
        }
        
        uint256[] memory tokenIds = new uint256[](amount);
        
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;
            
            _safeMint(to, tokenId);
            tokenIds[i] = tokenId;
            
            emit TokenMinted(to, tokenId);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Update base URI for token metadata (owner only)
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @dev Update max supply (owner only, can only decrease or set to 0 for unlimited)
     * @param newMaxSupply New maximum supply
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(
            newMaxSupply == 0 || newMaxSupply >= _nextTokenId - 1,
            "New max supply must be >= current supply"
        );
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }
    
    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get current token supply
     * @return Current number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Get next token ID to be minted
     * @return Next token ID
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Base URI for computing {tokenURI}
     * @return Base URI string
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev See {IERC721Metadata-tokenURI}
     * @param tokenId Token ID
     * @return Full token URI
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        _requireOwned(tokenId);
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
            : "";
    }
    
    /**
     * @dev Convert uint256 to string
     * @param value Value to convert
     * @return String representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
