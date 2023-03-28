// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Nation3GenesisPassport is ERC721 {
    constructor() ERC721("Nation3 Genesis Passport", "PASS3") {}
}
