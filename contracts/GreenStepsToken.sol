// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract GreenStepsToken is ERC20, Ownable {
    // Conversion rates
    uint256 public stepsPerToken = 1000; // Steps needed for 1 GRST token
    uint256 public stepsPerCarbonCredit = 10000; // Steps needed for 1 carbon credit
    uint256 public carbonCreditValue = 100; // Each carbon credit is worth 100 GRST tokens

    // Weekly tracking
    struct WeeklyStats {
        uint256 steps;
        uint256 carbonCredits;
        uint256 tokensEarned;
        bool claimed;
        bool submitted;
    }

    // User stats
    struct UserStats {
        uint256 totalSteps;
        uint256 totalCarbonCredits;
        uint256 totalTokensEarned;
        mapping(uint256 => WeeklyStats) weeklyStats; // weekNumber => WeeklyStats
    }

    // Mappings
    mapping(address => UserStats) public userStats;

    // Events
    event StepsSubmitted(
        address indexed user,
        uint256 steps,
        uint256 carbonCredits,
        uint256 tokens,
        uint256 weekNumber
    );
    event WeeklyRewardsClaimed(
        address indexed user,
        uint256 carbonCredits,
        uint256 tokens,
        uint256 weekNumber
    );
    event StepsPerTokenUpdated(uint256 newStepsPerToken);
    event StepsPerCarbonCreditUpdated(uint256 newStepsPerCarbonCredit);
    event CarbonCreditValueUpdated(uint256 newCarbonCreditValue);

    constructor() ERC20("GreenSteps", "GRST") Ownable(msg.sender) {}

    // Function to submit steps for a specific week
    function submitSteps(
        address user,
        uint256 steps,
        uint256 weekNumber
    ) public onlyOwner {
        UserStats storage stats = userStats[user];
        WeeklyStats storage weekly = stats.weeklyStats[weekNumber];

        require(!weekly.submitted, "Steps already submitted for this week");
        require(steps > 0, "Steps must be greater than 0");

        // Update weekly stats
        weekly.steps = steps;
        weekly.carbonCredits = (steps * 100) / stepsPerCarbonCredit; // Multiply by 100 to handle 2 decimal places
        weekly.tokensEarned =
            ((steps * 100) / stepsPerToken) + // Multiply by 100 to handle 2 decimal places
            (weekly.carbonCredits * carbonCreditValue);
        weekly.claimed = false;
        weekly.submitted = true;

        // Update total stats
        stats.totalSteps += steps;
        stats.totalCarbonCredits += weekly.carbonCredits;
        stats.totalTokensEarned += weekly.tokensEarned;

        emit StepsSubmitted(
            user,
            steps,
            weekly.carbonCredits,
            weekly.tokensEarned,
            weekNumber
        );
    }

    // Function to claim weekly rewards
    function claimWeeklyRewards(uint256 weekNumber) public {
        UserStats storage stats = userStats[msg.sender];
        WeeklyStats storage weekly = stats.weeklyStats[weekNumber];

        require(weekly.submitted, "No steps submitted for this week");
        require(!weekly.claimed, "Rewards already claimed for this week");

        // Mint tokens - tokens are stored with 2 decimal places (multiplied by 100)
        _mint(msg.sender, weekly.tokensEarned);
        weekly.claimed = true;

        emit WeeklyRewardsClaimed(
            msg.sender,
            weekly.carbonCredits,
            weekly.tokensEarned,
            weekNumber
        );
    }

    // Function to get user's weekly stats
    function getWeeklyStats(
        address user,
        uint256 weekNumber
    )
        public
        view
        returns (
            uint256 steps,
            uint256 carbonCredits,
            uint256 tokensEarned,
            bool claimed
        )
    {
        WeeklyStats storage weekly = userStats[user].weeklyStats[weekNumber];
        return (
            weekly.steps,
            weekly.carbonCredits,
            weekly.tokensEarned,
            weekly.claimed
        );
    }

    // Function to get user's total stats
    function getUserStats(
        address user
    )
        public
        view
        returns (
            uint256 totalSteps,
            uint256 totalCarbonCredits,
            uint256 totalTokensEarned
        )
    {
        UserStats storage stats = userStats[user];
        return (
            stats.totalSteps,
            stats.totalCarbonCredits,
            stats.totalTokensEarned
        );
    }

    // Admin functions to update conversion rates
    function updateStepsPerToken(uint256 newStepsPerToken) public onlyOwner {
        require(newStepsPerToken > 0, "Steps per token must be greater than 0");
        stepsPerToken = newStepsPerToken;
        emit StepsPerTokenUpdated(newStepsPerToken);
    }

    function updateStepsPerCarbonCredit(
        uint256 newStepsPerCarbonCredit
    ) public onlyOwner {
        require(
            newStepsPerCarbonCredit > 0,
            "Steps per carbon credit must be greater than 0"
        );
        stepsPerCarbonCredit = newStepsPerCarbonCredit;
        emit StepsPerCarbonCreditUpdated(newStepsPerCarbonCredit);
    }

    function updateCarbonCreditValue(
        uint256 newCarbonCreditValue
    ) public onlyOwner {
        require(
            newCarbonCreditValue > 0,
            "Carbon credit value must be greater than 0"
        );
        carbonCreditValue = newCarbonCreditValue;
        emit CarbonCreditValueUpdated(newCarbonCreditValue);
    }
}
