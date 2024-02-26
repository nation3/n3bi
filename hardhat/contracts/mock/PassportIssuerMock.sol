//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.20;

import "../passport/IPassportIssuer.sol";

contract PassportIssuerMock is IPassportIssuer {
    function passportStatus(
        address account
    ) external view virtual returns (uint8) {
        return 1;
    }

    function revokeUnderBalance() public view returns (uint256) {
        return 1.5 * 1e18;
    }
}
