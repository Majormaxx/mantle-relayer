// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @notice Mock ERC20 token for testing purposes
 * @dev Simple ERC20 implementation with public mint function for easy testing
 */
contract MockERC20 is ERC20 {
    /**
     * @notice Constructor initializes the mock token
     * @dev Sets name to "Mock Token" and symbol to "MOCK"
     */
    constructor() ERC20("Mock Token", "MOCK") {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @notice Mint tokens to any address
     * @dev Public function for easy test token creation
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from caller's balance
     * @dev Useful for testing balance changes
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
