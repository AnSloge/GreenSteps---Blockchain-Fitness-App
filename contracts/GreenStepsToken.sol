// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GreenStepsToken is ERC20, Ownable, AccessControl, Pausable {
    // Define roles
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Max supply constant (1,642,500,000 GRST)
    uint256 public constant MAX_SUPPLY = 1642500000 * 10 ** 18;

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
        bool frozen; // Flag to indicate if the user is frozen due to cheating
    }

    // Mappings
    mapping(address => UserStats) public userStats;
    mapping(address => bool) public blacklistedUsers;

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
    event UserFrozen(address indexed user, string reason);
    event UserUnfrozen(address indexed user);
    event UserBalanceReset(address indexed user, uint256 confiscatedAmount);
    event UserBlacklisted(address indexed user, string reason);
    event UserWhitelisted(address indexed user);

    constructor() ERC20("GreenSteps", "GRST") Ownable(msg.sender) {
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
    }

    // Modifiers
    modifier notFrozen() {
        require(!userStats[msg.sender].frozen, "Account is frozen");
        _;
    }

    modifier notBlacklisted() {
        require(!blacklistedUsers[msg.sender], "Account is blacklisted");
        _;
    }

    // Override ERC20 transfer functions to check account status
    function transfer(
        address to,
        uint256 amount
    ) public override notFrozen notBlacklisted returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(!userStats[from].frozen, "Sender account is frozen");
        require(!blacklistedUsers[from], "Sender account is blacklisted");
        return super.transferFrom(from, to, amount);
    }

    // Function to submit steps for a specific week - now accessible by validators or owner
    function submitSteps(
        address user,
        uint256 steps,
        uint256 weekNumber
    ) public whenNotPaused {
        require(
            hasRole(VALIDATOR_ROLE, msg.sender) || owner() == msg.sender,
            "Caller is not a validator or owner"
        );
        require(!blacklistedUsers[user], "User is blacklisted");
        require(!userStats[user].frozen, "User account is frozen");
        require(steps > 0, "Steps must be greater than 0");

        // Add limit to prevent obviously fraudulent inputs
        require(steps <= 350000, "Step count exceeds weekly limit");

        UserStats storage stats = userStats[user];
        WeeklyStats storage weekly = stats.weeklyStats[weekNumber];

        require(!weekly.submitted, "Steps already submitted for this week");

        // Update weekly stats
        weekly.steps = steps;
        weekly.carbonCredits = (steps * 100) / stepsPerCarbonCredit; // Multiply by 100 for 2 decimal places
        weekly.tokensEarned =
            ((steps * 100) / stepsPerToken) + // Base tokens with 2 decimal places
            (((steps * 100) / stepsPerCarbonCredit) * carbonCreditValue); // Carbon credit bonus with 2 decimal places
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
    function claimWeeklyRewards(
        uint256 weekNumber
    ) public whenNotPaused notFrozen notBlacklisted {
        UserStats storage stats = userStats[msg.sender];
        WeeklyStats storage weekly = stats.weeklyStats[weekNumber];

        require(weekly.submitted, "No steps submitted for this week");
        require(!weekly.claimed, "Rewards already claimed for this week");

        // Check if minting would exceed max supply
        require(
            totalSupply() + weekly.tokensEarned <= MAX_SUPPLY,
            "Minting would exceed max supply"
        );

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
            uint256 totalTokensEarned,
            bool isFrozen,
            bool isBlacklisted
        )
    {
        UserStats storage stats = userStats[user];
        return (
            stats.totalSteps,
            stats.totalCarbonCredits,
            stats.totalTokensEarned,
            stats.frozen,
            blacklistedUsers[user]
        );
    }

    // Admin functions to update conversion rates
    function updateStepsPerToken(
        uint256 newStepsPerToken
    ) public onlyRole(ADMIN_ROLE) {
        require(newStepsPerToken > 0, "Steps per token must be greater than 0");
        stepsPerToken = newStepsPerToken;
        emit StepsPerTokenUpdated(newStepsPerToken);
    }

    function updateStepsPerCarbonCredit(
        uint256 newStepsPerCarbonCredit
    ) public onlyRole(ADMIN_ROLE) {
        require(
            newStepsPerCarbonCredit > 0,
            "Steps per carbon credit must be greater than 0"
        );
        stepsPerCarbonCredit = newStepsPerCarbonCredit;
        emit StepsPerCarbonCreditUpdated(newStepsPerCarbonCredit);
    }

    function updateCarbonCreditValue(
        uint256 newCarbonCreditValue
    ) public onlyRole(ADMIN_ROLE) {
        require(
            newCarbonCreditValue > 0,
            "Carbon credit value must be greater than 0"
        );
        carbonCreditValue = newCarbonCreditValue;
        emit CarbonCreditValueUpdated(newCarbonCreditValue);
    }

    // Access control functions

    // Add validator role to an address
    function addValidator(address validator) public onlyRole(ADMIN_ROLE) {
        grantRole(VALIDATOR_ROLE, validator);
    }

    // Remove validator role from an address
    function removeValidator(address validator) public onlyRole(ADMIN_ROLE) {
        revokeRole(VALIDATOR_ROLE, validator);
    }

    // Add admin role to an address
    function addAdmin(address admin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, admin);
    }

    // Remove admin role from an address
    function removeAdmin(address admin) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, admin);
    }

    // Contract pause/unpause functions
    function pauseContract() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpauseContract() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Anti-cheating functions

    // Freeze a user account
    function freezeUser(
        address user,
        string memory reason
    ) public onlyRole(ADMIN_ROLE) {
        userStats[user].frozen = true;
        emit UserFrozen(user, reason);
    }

    // Unfreeze a user account
    function unfreezeUser(address user) public onlyRole(ADMIN_ROLE) {
        userStats[user].frozen = false;
        emit UserUnfrozen(user);
    }

    // Reset a user's token balance to zero (for cheaters)
    function resetUserBalance(
        address user,
        string memory reason
    ) public onlyRole(ADMIN_ROLE) {
        uint256 currentBalance = balanceOf(user);
        if (currentBalance > 0) {
            _burn(user, currentBalance);
            emit UserBalanceReset(user, currentBalance);
        }
        emit UserFrozen(user, reason);
        userStats[user].frozen = true;
    }

    // Blacklist a user completely
    function blacklistUser(
        address user,
        string memory reason
    ) public onlyRole(ADMIN_ROLE) {
        blacklistedUsers[user] = true;
        emit UserBlacklisted(user, reason);
    }

    // Remove a user from blacklist
    function whitelistUser(address user) public onlyRole(ADMIN_ROLE) {
        blacklistedUsers[user] = false;
        emit UserWhitelisted(user);
    }

    // Function to handle bulk submissions (gas optimization)
    function bulkSubmitSteps(
        address[] calldata users,
        uint256[] calldata stepsArray,
        uint256 weekNumber
    ) public onlyRole(VALIDATOR_ROLE) whenNotPaused {
        require(users.length == stepsArray.length, "Arrays length mismatch");
        for (uint256 i = 0; i < users.length; i++) {
            // Skip frozen or blacklisted users
            if (!userStats[users[i]].frozen && !blacklistedUsers[users[i]]) {
                submitSteps(users[i], stepsArray[i], weekNumber);
            }
        }
    }
}
