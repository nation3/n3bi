//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract N3BI {
    address public payoutToken;

    constructor() {
        console.log("Deploying N3BI");
    }
}
