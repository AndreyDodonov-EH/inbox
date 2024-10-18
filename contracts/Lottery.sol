// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Inbox {
    address public manager;
    address[] public entries;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        entries.push(msg.sender);
    }

    function  pickWiner() public restricted {
        uint index = barelyRandom() % entries.length;
        payable(entries[index]).transfer(address(this).balance);
        entries = new address[](0);
    }

    function barelyRandom() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, entries)));
    }

    modifier restricted() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }
} 