// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./BLEULION_CASCADE.sol";

interface IEvo1155 {
    function mintAll(address to, uint256[] calldata ids, uint256[] calldata amounts) external;
}

/**
 * @title BLEU_ENFT_MINT
 * @notice Handles ceremonial ENFT minting with recursion hash attestations.
 */
contract BLEU_ENFT_MINT is Ownable {
    struct MintRecord {
        address recipient;
        uint256 tokenId;
        uint256 amount;
        bytes32 recursionHash;
        string title;
        string uri;
        uint256 timestamp;
    }

    BLEULION_CASCADE public cascade;
    IEvo1155 public treasury1155;

    mapping(uint256 => bytes32) public recursionHashes;
    mapping(uint256 => string) public tokenUris;
    MintRecord[] private _mintHistory;

    event CeremonialMint(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 amount,
        bytes32 recursionHash,
        string title,
        string uri
    );

    constructor(BLEULION_CASCADE cascade_, IEvo1155 treasury1155_) {
        cascade = cascade_;
        treasury1155 = treasury1155_;
    }

    function mintCeremonial(
        address recipient,
        uint256 tokenId,
        uint256 amount,
        bytes32 recursionHash,
        string calldata title,
        string calldata uri
    ) external onlyOwner {
        require(recipient != address(0), "BLEU_ENFT: recipient required");
        require(amount > 0, "BLEU_ENFT: amount required");
        require(bytes(uri).length > 0, "BLEU_ENFT: uri required");

        BLEULION_CASCADE.Scroll memory scroll = cascade.getScroll(tokenId);
        require(scroll.active, "BLEU_ENFT: scroll inactive");
        require(
            keccak256(bytes(scroll.title)) == keccak256(bytes(title)),
            "BLEU_ENFT: title mismatch"
        );
        require(keccak256(bytes(scroll.uri)) == keccak256(bytes(uri)), "BLEU_ENFT: uri mismatch");

        recursionHashes[tokenId] = recursionHash;
        tokenUris[tokenId] = uri;

        uint256[] memory ids = new uint256[](1);
        ids[0] = tokenId;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        treasury1155.mintAll(recipient, ids, amounts);

        MintRecord memory record = MintRecord({
            recipient: recipient,
            tokenId: tokenId,
            amount: amount,
            recursionHash: recursionHash,
            title: title,
            uri: uri,
            timestamp: block.timestamp
        });
        _mintHistory.push(record);

        emit CeremonialMint(recipient, tokenId, amount, recursionHash, title, uri);
    }

    function setCascade(BLEULION_CASCADE cascade_) external onlyOwner {
        cascade = cascade_;
    }

    function setTreasury(IEvo1155 treasury1155_) external onlyOwner {
        treasury1155 = treasury1155_;
    }

    function mintHistoryLength() external view returns (uint256) {
        return _mintHistory.length;
    }

    function mintRecord(uint256 index) external view returns (MintRecord memory) {
        require(index < _mintHistory.length, "BLEU_ENFT: index out of range");
        return _mintHistory[index];
    }
}
