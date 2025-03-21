// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GreenSteps
 * @dev A smart contract for rewarding physical activity with carbon credit tokens
 */
contract GreenSteps is ERC20, Ownable, Pausable {
    // Struct to store activity data
    struct ActivityRecord {
        uint256 timestamp;
        uint256 steps;
        uint256 distance; // in meters
        uint256 calories;
        uint256 tokensEarned;
    }

    // Mapping from user address to their activity records
    mapping(address => ActivityRecord[]) public userActivities;

    // Token reward rates
    uint256 public stepsPerToken = 1000; // 1000 steps = 1 token
    uint256 public distancePerToken = 1000; // 1000 meters = 1 token
    uint256 public caloriesPerToken = 100; // 100 calories = 1 token

    // Daily limits
    uint256 public dailyTokenLimit = 100 * (10 ** decimals()); // 100 tokens per day
    mapping(address => uint256) public lastActivityTimestamp;
    mapping(address => uint256) public dailyTokensEarned;

    event ActivityLogged(
        address indexed user,
        uint256 steps,
        uint256 distance,
        uint256 calories,
        uint256 tokensEarned
    );

    constructor()
        ERC20("GreenSteps Carbon Credits", "GSTEP")
        Ownable(msg.sender)
    {
        // Initial supply could be minted to contract owner if needed
    }

    /**
     * @dev Log activity and mint reward tokens
     * @param _steps Number of steps taken
     * @param _distance Distance covered in meters
     * @param _calories Calories burned
     */
    function logActivity(
        uint256 _steps,
        uint256 _distance,
        uint256 _calories
    ) external whenNotPaused {
        require(
            _steps > 0 || _distance > 0 || _calories > 0,
            "Invalid activity data"
        );

        // Reset daily tokens if it's a new day
        if (block.timestamp >= lastActivityTimestamp[msg.sender] + 1 days) {
            dailyTokensEarned[msg.sender] = 0;
        }

        // Calculate tokens earned
        uint256 tokensFromSteps = (_steps * (10 ** decimals())) / stepsPerToken;
        uint256 tokensFromDistance = (_distance * (10 ** decimals())) /
            distancePerToken;
        uint256 tokensFromCalories = (_calories * (10 ** decimals())) /
            caloriesPerToken;

        // Take the highest reward from the three metrics
        uint256 tokensEarned = max(
            tokensFromSteps,
            max(tokensFromDistance, tokensFromCalories)
        );

        // Apply daily limit
        uint256 remainingDailyLimit = dailyTokenLimit -
            dailyTokensEarned[msg.sender];
        tokensEarned = min(tokensEarned, remainingDailyLimit);

        // Store activity record
        ActivityRecord memory newRecord = ActivityRecord({
            timestamp: block.timestamp,
            steps: _steps,
            distance: _distance,
            calories: _calories,
            tokensEarned: tokensEarned
        });

        userActivities[msg.sender].push(newRecord);

        // Update daily tracking
        dailyTokensEarned[msg.sender] += tokensEarned;
        lastActivityTimestamp[msg.sender] = block.timestamp;

        // Mint tokens to user
        _mint(msg.sender, tokensEarned);

        emit ActivityLogged(
            msg.sender,
            _steps,
            _distance,
            _calories,
            tokensEarned
        );
    }

    /**
     * @dev Get user's activity history
     * @param _user Address of the user
     * @return Array of ActivityRecord structs
     */
    function getUserActivities(
        address _user
    ) external view returns (ActivityRecord[] memory) {
        return userActivities[_user];
    }

    /**
     * @dev Update reward rates (only owner)
     */
    function updateRewardRates(
        uint256 _stepsPerToken,
        uint256 _distancePerToken,
        uint256 _caloriesPerToken
    ) external onlyOwner {
        require(
            _stepsPerToken > 0 &&
                _distancePerToken > 0 &&
                _caloriesPerToken > 0,
            "Invalid rates"
        );
        stepsPerToken = _stepsPerToken;
        distancePerToken = _distancePerToken;
        caloriesPerToken = _caloriesPerToken;
    }

    /**
     * @dev Update daily token limit (only owner)
     */
    function updateDailyTokenLimit(uint256 _newLimit) external onlyOwner {
        require(_newLimit > 0, "Invalid limit");
        dailyTokenLimit = _newLimit;
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Helper functions
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a <= b ? a : b;
    }
}
