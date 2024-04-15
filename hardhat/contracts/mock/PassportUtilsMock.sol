//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.25;

import "@nation3/nationcred-contracts/utils/IPassportUtils.sol";
import "../passport/IPassportIssuer.sol";
import "../governance/IVotingEscrow.sol";

contract PassportUtilsMock is IPassportUtils {
    string public constant VERSION = "0.6.8";
    IPassportIssuer public passportIssuer;
    IVotingEscrow public votingEscrow;

    constructor(address passportIssuerAddress, address votingEscrowAddress) {
        passportIssuer = IPassportIssuer(passportIssuerAddress);
        votingEscrow = IVotingEscrow(votingEscrowAddress);
    }

    /**
     * @inheritdoc IPassportUtils
     */
    function isOwner(address account) public view returns (bool) {
        uint8 passportStatus = passportIssuer.passportStatus(account);
        return passportStatus == 1;
    }

    /**
     * @inheritdoc IPassportUtils
     */
    function getOwnerAddress(uint16 passportID) public view returns (address) {
        // TO DO
    }

    /**
     * @inheritdoc IPassportUtils
     */
    function isExpired(address citizen) public view returns (bool) {
        uint256 revokeUnderBalance = passportIssuer.revokeUnderBalance();
        uint256 votingEscrowBalance = votingEscrow.balanceOf(citizen);
        return votingEscrowBalance < revokeUnderBalance;
    }

    /**
     * @inheritdoc IPassportUtils
     */
    function getExpirationTimestamp(
        address citizen
    ) public view returns (uint256) {
        IVotingEscrow.LockedBalance memory lockedBalance = votingEscrow.locked(
            citizen
        );
        uint256 lockAmount = uint256(int256(lockedBalance.amount));
        uint256 lockEnd = lockedBalance.end;
        uint256 revokeUnderBalance = passportIssuer.revokeUnderBalance();
        return
            calculateThresholdTimestamp(
                lockAmount,
                lockEnd,
                revokeUnderBalance
            );
    }

    /**
     * @inheritdoc IPassportUtils
     */
    function calculateThresholdTimestamp(
        uint256 lockAmount,
        uint256 lockEnd,
        uint256 votingEscrowThreshold
    ) public pure returns (uint256) {
        if (lockAmount < votingEscrowThreshold) {
            return 0;
        }

        uint256 maxLockPeriod = 4 * 365 days;

        uint256 thresholdPercentageOfLocked = (100 ether *
            votingEscrowThreshold) / lockAmount;

        uint256 secondsFromThresholdToUnlock = (maxLockPeriod *
            thresholdPercentageOfLocked) / 100 ether;

        return lockEnd - secondsFromThresholdToUnlock;
    }
}
