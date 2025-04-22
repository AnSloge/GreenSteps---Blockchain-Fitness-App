const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenSteps", function () {
  let greenSteps;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const GreenSteps = await ethers.getContractFactory("GreenSteps");
    greenSteps = await GreenSteps.deploy();
    await greenSteps.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await greenSteps.owner()).to.equal(owner.address);
    });

    it("Should have correct token name and symbol", async function () {
      expect(await greenSteps.name()).to.equal("GreenSteps Carbon Credits");
      expect(await greenSteps.symbol()).to.equal("GSTEP");
    });
  });

  describe("Activity Logging", function () {
    it("Should log activity and mint tokens", async function () {
      const steps = 2000;
      const distance = 1500;
      const calories = 150;

      await greenSteps.connect(user).logActivity(steps, distance, calories);
      
      const activities = await greenSteps.getUserActivities(user.address);
      expect(activities.length).to.equal(1);
      expect(activities[0].steps).to.equal(steps);
      expect(activities[0].distance).to.equal(distance);
      expect(activities[0].calories).to.equal(calories);
      
      // Check token balance (should be 2 tokens for 2000 steps)
      const balance = await greenSteps.balanceOf(user.address);
      expect(balance).to.be.above(0);
    });

    it("Should respect daily token limit", async function () {
      const dailyLimit = await greenSteps.dailyTokenLimit();
      const steps = 1000000; // Large number of steps
      
      await greenSteps.connect(user).logActivity(steps, 0, 0);
      const balance = await greenSteps.balanceOf(user.address);
      
      expect(balance).to.equal(dailyLimit);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update reward rates", async function () {
      const newStepsPerToken = 2000;
      const newDistancePerToken = 2000;
      const newCaloriesPerToken = 200;

      await greenSteps.updateRewardRates(
        newStepsPerToken,
        newDistancePerToken,
        newCaloriesPerToken
      );

      expect(await greenSteps.stepsPerToken()).to.equal(newStepsPerToken);
      expect(await greenSteps.distancePerToken()).to.equal(newDistancePerToken);
      expect(await greenSteps.caloriesPerToken()).to.equal(newCaloriesPerToken);
    });

    it("Should allow owner to update daily token limit", async function () {
      const newLimit = ethers.parseEther("200");
      await greenSteps.updateDailyTokenLimit(newLimit);
      expect(await greenSteps.dailyTokenLimit()).to.equal(newLimit);
    });
  });
}); 