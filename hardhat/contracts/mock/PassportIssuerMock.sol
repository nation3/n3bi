//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.26;

import "../passport/IPassportIssuer.sol";
import "./PassportMock.sol";

contract PassportIssuerMock is IPassportIssuer {
    error PassportNotIssued();

    /// @notice The token that issues.
    PassportMock public passToken;

    /// @dev Map the passport status of an account: (0) Not issued, (1) Issued, (2) Revoked.
    mapping(address => uint8) internal _status;

    /// @dev Passport id issued by account.
    mapping(address => uint256) internal _passportId;

    constructor(address passTokenAddress) {
        passToken = PassportMock(passTokenAddress);
    }

    function passportStatus(
        address account
    ) external view virtual returns (uint8) {
        return _status[account];
    }

    /// @notice Returns passport id of a given account.
    /// @param account Holder account of a passport.
    /// @dev Revert if the account has no passport.
    function passportId(address account) public view virtual returns (uint256) {
        if (_status[account] == 0) revert PassportNotIssued();
        return _passportId[account];
    }

    function revokeUnderBalance() public view returns (uint256) {
        return 1.5 * 1e18;
    }

    function claim() external virtual {
        _issue(msg.sender);
    }

    /// @dev Mints a new passport token for the recipient.
    /// @param recipient Address to issue the passport to.
    function _issue(address recipient) internal virtual {
        // Mint a new passport to the recipient account
        uint256 tokenId = passToken.safeMint(recipient);

        _status[recipient] = 1;
        _passportId[recipient] = tokenId;
    }
}
