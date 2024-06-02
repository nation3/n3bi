// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PassportMock is ERC721 {
    uint256 private _tokenIdCounter;

    constructor() ERC721("Nation3 Genesis Passport", "PASS3") {}

    function safeMint(address to) public returns (uint256 tokenId) {
        tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
    }
}
