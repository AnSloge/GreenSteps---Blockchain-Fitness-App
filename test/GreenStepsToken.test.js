const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenStepsToken", function () {
  let GreenStepsToken;
  let token;
  let owner;
  let user1;
  let user2;
  let ADMIN_ROLE;
  let VALIDATOR_ROLE;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    GreenStepsToken = await ethers.getContractFactory("GreenStepsToken");
    token = await GreenStepsToken.deploy();
    await token.waitForDeployment();
    
    // Get role hashes
    ADMIN_ROLE = await token.ADMIN_ROLE();
    VALIDATOR_ROLE = await token.VALIDATOR_ROLE();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("GreenSteps");
      expect(await token.symbol()).to.equal("GRST");
    });

    it("Should have correct initial conversion rates", async function () {
      expect(await token.stepsPerToken()).to.equal(1000);
      expect(await token.stepsPerCarbonCredit()).to.equal(10000);
      expect(await token.carbonCreditValue()).to.equal(100);
    });
  });

  describe("Steps Submission", function () {
    const steps = 10000;
    const weekNumber = Math.floor(Date.now() / (86400000 * 7)); // Current week

    it("Should record steps and calculate rewards correctly", async function () {
      await token.submitSteps(user1.address, steps, weekNumber);
      const stats = await token.getWeeklyStats(user1.address, weekNumber);
      
      expect(stats[0]).to.equal(steps); // steps
      expect(stats[1]).to.equal((steps * 100) / 10000); // carbonCredits with 2 decimal places
      
      // tokensEarned calculation with 2 decimal places
      const expectedTokensEarned = ((steps * 100) / 1000) + (((steps * 100) / 10000) * 100);
      expect(stats[2]).to.equal(expectedTokensEarned);
      
      expect(stats[3]).to.equal(false); // claimed
    });

    it("Should emit StepsSubmitted event", async function () {
      const expectedCarbonCredits = (steps * 100) / 10000; // with 2 decimal places
      const expectedTokens = ((steps * 100) / 1000) + (expectedCarbonCredits * 100);
      
      await expect(token.submitSteps(user1.address, steps, weekNumber))
        .to.emit(token, "StepsSubmitted")
        .withArgs(user1.address, steps, expectedCarbonCredits, expectedTokens, weekNumber);
    });

    it("Should not allow submitting steps twice for same week", async function () {
      await token.submitSteps(user1.address, steps, weekNumber);
      await expect(
        token.submitSteps(user1.address, steps, weekNumber)
      ).to.be.revertedWith("Steps already submitted for this week");
    });

    it("Should not allow submitting zero steps", async function () {
      await expect(
        token.submitSteps(user1.address, 0, weekNumber)
      ).to.be.revertedWith("Steps must be greater than 0");
    });

    it("Should not allow non-owner to submit steps", async function () {
      await expect(
        token.connect(user1).submitSteps(user1.address, steps, weekNumber)
      ).to.be.revertedWith("Caller is not a validator or owner");
    });
  });

  describe("Rewards Claiming", function () {
    const steps = 10000;
    const weekNumber = Math.floor(Date.now() / (86400000 * 7));

    beforeEach(async function () {
      await token.submitSteps(user1.address, steps, weekNumber);
    });

    it("Should allow claiming rewards", async function () {
      await token.connect(user1).claimWeeklyRewards(weekNumber);
      const stats = await token.getWeeklyStats(user1.address, weekNumber);
      expect(stats[3]).to.equal(true); // claimed status
      
      const expectedCarbonCredits = (steps * 100) / 10000;
      const expectedTokens = ((steps * 100) / 1000) + (expectedCarbonCredits * 100);
      expect(await token.balanceOf(user1.address)).to.equal(expectedTokens);
    });

    it("Should emit WeeklyRewardsClaimed event", async function () {
      const expectedCarbonCredits = (steps * 100) / 10000;
      const expectedTokens = ((steps * 100) / 1000) + (expectedCarbonCredits * 100);
      
      await expect(token.connect(user1).claimWeeklyRewards(weekNumber))
        .to.emit(token, "WeeklyRewardsClaimed")
        .withArgs(user1.address, expectedCarbonCredits, expectedTokens, weekNumber);
    });

    it("Should not allow claiming rewards twice", async function () {
      await token.connect(user1).claimWeeklyRewards(weekNumber);
      await expect(
        token.connect(user1).claimWeeklyRewards(weekNumber)
      ).to.be.revertedWith("Rewards already claimed for this week");
    });

    it("Should not allow claiming rewards without steps", async function () {
      const newWeekNumber = weekNumber + 1;
      await expect(
        token.connect(user1).claimWeeklyRewards(newWeekNumber)
      ).to.be.revertedWith("No steps submitted for this week");
    });
  });

  describe("Stats Tracking", function () {
    const steps1 = 10000;
    const steps2 = 15000;
    const weekNumber1 = Math.floor(Date.now() / (86400000 * 7));
    const weekNumber2 = weekNumber1 + 1;

    beforeEach(async function () {
      await token.submitSteps(user1.address, steps1, weekNumber1);
      await token.submitSteps(user1.address, steps2, weekNumber2);
    });

    it("Should track total stats correctly", async function () {
      const stats = await token.getUserStats(user1.address);
      expect(stats[0]).to.equal(steps1 + steps2); // totalSteps
      
      // totalCarbonCredits with 2 decimal places
      const expectedCarbonCredits = ((steps1 * 100) / 10000) + ((steps2 * 100) / 10000);
      expect(stats[1]).to.equal(expectedCarbonCredits);
      
      // totalTokensEarned with 2 decimal places
      const carbonCredits1 = (steps1 * 100) / 10000;
      const carbonCredits2 = (steps2 * 100) / 10000;
      const expectedTokens = 
        ((steps1 * 100) / 1000) + ((steps2 * 100) / 1000) +
        (carbonCredits1 * 100) + (carbonCredits2 * 100);
      expect(stats[2]).to.equal(expectedTokens);
    });

    it("Should handle multiple users correctly", async function () {
      await token.submitSteps(user2.address, steps1, weekNumber1);
      
      const stats1 = await token.getUserStats(user1.address);
      const stats2 = await token.getUserStats(user2.address);
      
      expect(stats1[0]).to.equal(steps1 + steps2); // totalSteps
      expect(stats2[0]).to.equal(steps1); // totalSteps
    });
  });

  describe("Conversion Rates", function () {
    it("Should allow owner to update steps per token ratio", async function () {
      const newRatio = 2000;
      await token.updateStepsPerToken(newRatio);
      expect(await token.stepsPerToken()).to.equal(newRatio);
    });

    it("Should allow owner to update steps per carbon credit ratio", async function () {
      const newRatio = 15000;
      await token.updateStepsPerCarbonCredit(newRatio);
      expect(await token.stepsPerCarbonCredit()).to.equal(newRatio);
    });

    it("Should allow owner to update carbon credit value", async function () {
      const newValue = 200;
      await token.updateCarbonCreditValue(newValue);
      expect(await token.carbonCreditValue()).to.equal(newValue);
    });

    it("Should not allow non-admin to update ratios", async function () {
      await expect(
        token.connect(user1).updateStepsPerToken(2000)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
      
      await expect(
        token.connect(user1).updateStepsPerCarbonCredit(15000)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
      
      await expect(
        token.connect(user1).updateCarbonCreditValue(200)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("Should not allow setting ratios to zero", async function () {
      await expect(
        token.updateStepsPerToken(0)
      ).to.be.revertedWith("Steps per token must be greater than 0");
      
      await expect(
        token.updateStepsPerCarbonCredit(0)
      ).to.be.revertedWith("Steps per carbon credit must be greater than 0");
      
      await expect(
        token.updateCarbonCreditValue(0)
      ).to.be.revertedWith("Carbon credit value must be greater than 0");
    });
  });
}); 