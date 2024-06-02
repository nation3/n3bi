//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.26;

interface IPassportIssuer {
    function revokeUnderBalance() external view returns (uint256);

    function passportStatus(address account) external view returns (uint8);
}
