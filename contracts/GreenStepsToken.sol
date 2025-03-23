// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract GreenStepsToken is ERC20, Ownable {
    // Conversion rate: steps to tokens (can be adjusted)
    uint256 public stepsPerToken = 1000;

    // Mapping to track daily step submissions
    mapping(address => mapping(uint256 => bool)) public dailySubmissions;

    constructor() ERC20("GreenSteps", "GRST") Ownable(msg.sender) {}

    // Function to mint tokens based on steps
    function mintFromSteps(
        address user,
        uint256 steps,
        uint256 date
    ) public onlyOwner {
        require(
            !dailySubmissions[user][date],
            "Steps already submitted for this date"
        );
        require(steps > 0, "Steps must be greater than 0");

        // Calculate tokens with precision
        uint256 tokensToMint = (steps * (10 ** decimals())) / stepsPerToken;
        _mint(user, tokensToMint);

        dailySubmissions[user][date] = true;

        emit StepsSubmitted(user, steps, tokensToMint, date);
    }

    // Function to update steps per token ratio
    function updateStepsPerToken(uint256 newStepsPerToken) public onlyOwner {
        require(newStepsPerToken > 0, "Steps per token must be greater than 0");
        stepsPerToken = newStepsPerToken;
        emit StepsPerTokenUpdated(newStepsPerToken);
    }

    // Events
    event StepsSubmitted(
        address indexed user,
        uint256 steps,
        uint256 tokens,
        uint256 date
    );
    event StepsPerTokenUpdated(uint256 newStepsPerToken);
}
