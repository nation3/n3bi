// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PassportMock is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor()
        ERC721("Nation3 Genesis Passport", "PASS3")
        Ownable(msg.sender)
    {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
    }
}
