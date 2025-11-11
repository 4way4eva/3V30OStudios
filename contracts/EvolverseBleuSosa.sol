// SPDX-License-Identifier: MIT
// 
// Copyright (c) 2024 3V30OStudios / MEGAZION Codex
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
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EvolverseBleuSosa
 * @dev ERC721 NFT contract for MEGAZION Evolverse collection
 * 
 * Features:
 * - Owner-only minting
 * - Pausable for emergency stops
 * - Reentrancy protection
 * - Customizable base URI for metadata
 * - Token enumeration tracking
 * 
 * Usage:
 * 1. Deploy contract
 * 2. Set base URI with setBaseURI()
 * 3. Mint tokens with mint() or mintBatch()
 * 4. Transfer ownership for production use
 */
contract EvolverseBleuSosa is ERC721, Ownable, ReentrancyGuard, Pausable {
    
    // Token ID counter
    uint256 private _nextTokenId;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Maximum supply (0 = unlimited)
    uint256 public maxSupply;
    
    // Events
    event BaseURIUpdated(string newBaseURI);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event TokenMinted(address indexed to, uint256 indexed tokenId);
    event BatchMinted(address indexed to, uint256 startTokenId, uint256 count);
    
    /**
     * @dev Constructor
     * @param name Token name
     * @param symbol Token symbol
     * @param baseURI Base URI for token metadata
     * @param _maxSupply Maximum supply (0 for unlimited)
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 _maxSupply
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        maxSupply = _maxSupply;
        _nextTokenId = 1; // Start from token ID 1
    }
    
    /**
     * @dev Mint a single token to specified address
     * @param to Recipient address
     * @return tokenId The minted token ID
     */
    function mint(address to) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        require(to != address(0), "Cannot mint to zero address");
        
        if (maxSupply > 0) {
            require(_nextTokenId <= maxSupply, "Max supply reached");
        }
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        emit TokenMinted(to, tokenId);
        return tokenId;
    }
    
    /**
     * @dev Mint multiple tokens to specified address
     * @param to Recipient address
     * @param count Number of tokens to mint
     */
    function mintBatch(address to, uint256 count) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(count > 0, "Count must be greater than 0");
        require(count <= 100, "Cannot mint more than 100 at once");
        
        if (maxSupply > 0) {
            require(_nextTokenId + count - 1 <= maxSupply, "Exceeds max supply");
        }
        
        uint256 startTokenId = _nextTokenId;
        
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        }
        
        emit BatchMinted(to, startTokenId, count);
    }
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @dev Set maximum supply
     * @param _maxSupply New maximum supply (cannot be less than current supply)
     */
    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(_maxSupply == 0 || _maxSupply >= _nextTokenId - 1, "Max supply cannot be less than current supply");
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }
    
    /**
     * @dev Pause contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get total supply (number of minted tokens)
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Get next token ID to be minted
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Override base URI function
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get token URI
     * @param tokenId Token ID
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
