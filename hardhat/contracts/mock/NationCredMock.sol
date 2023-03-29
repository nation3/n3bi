// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../nationcred/INationCred.sol";

contract NationCredMock is INationCred {
    uint16[] private passportIDs;

    function setActiveCitizens(uint16[] calldata passportIDs_) public {
        passportIDs = passportIDs_;
    }

    function isActive(uint16 passportID) public view returns (bool) {
        for (uint16 i = 0; i < passportIDs.length; i++) {
            if (passportIDs[i] == passportID) {
                return true;
            }
        }
        return false;
    }
}
