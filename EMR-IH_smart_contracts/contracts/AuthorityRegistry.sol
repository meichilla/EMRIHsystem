// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract AuthorityRegistry {

    mapping(address => bool) public authorities;

    event AuthorityAdded(address indexed authority);

    constructor() {
        addAuthority(msg.sender);
    }

    function addAuthority(address _authority) public {
        authorities[_authority] = true;
        emit AuthorityAdded(_authority);
    }

    function isAuthority(address _address) public view returns (bool) {
        return authorities[_address];
    }
}
