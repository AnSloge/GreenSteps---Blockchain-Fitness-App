const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenStepsToken", function () {
  let GreenStepsToken;
  let token;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    GreenStepsToken = await ethers.getContractFactory("GreenStepsToken");
    token = await GreenStepsToken.deploy();
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("GreenSteps");
      expect(await token.symbol()).to.equal("GRST");
    });

    it("Should have correct initial steps per token ratio", async function () {
      expect(await token.stepsPerToken()).to.equal(1000);
    });
  });

  describe("Steps Submission", function () {
    const steps = 10000;
    const date = Math.floor(Date.now() / 86400000); // Current day

    it("Should mint correct amount of tokens for steps", async function () {
      await token.mintFromSteps(user1.address, steps, date);
      const expectedTokens = ethers.parseEther((steps / 1000).toString());
      expect(await token.balanceOf(user1.address)).to.equal(expectedTokens);
    });

    it("Should emit StepsSubmitted event", async function () {
      const expectedTokens = ethers.parseEther((steps / 1000).toString());
      await expect(token.mintFromSteps(user1.address, steps, date))
        .to.emit(token, "StepsSubmitted")
        .withArgs(user1.address, steps, expectedTokens, date);
    });

    it("Should not allow submitting steps twice for same date", async function () {
      await token.mintFromSteps(user1.address, steps, date);
      await expect(
        token.mintFromSteps(user1.address, steps, date)
      ).to.be.revertedWith("Steps already submitted for this date");
    });

    it("Should not allow submitting zero steps", async function () {
      await expect(
        token.mintFromSteps(user1.address, 0, date)
      ).to.be.revertedWith("Steps must be greater than 0");
    });
  });

  describe("Steps Per Token Ratio", function () {
    it("Should allow owner to update steps per token ratio", async function () {
      const newRatio = 2000;
      await token.updateStepsPerToken(newRatio);
      expect(await token.stepsPerToken()).to.equal(newRatio);
    });

    it("Should emit StepsPerTokenUpdated event", async function () {
      const newRatio = 2000;
      await expect(token.updateStepsPerToken(newRatio))
        .to.emit(token, "StepsPerTokenUpdated")
        .withArgs(newRatio);
    });

    it("Should not allow non-owner to update ratio", async function () {
      await expect(
        token.connect(user1).updateStepsPerToken(2000)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should not allow setting ratio to zero", async function () {
      await expect(
        token.updateStepsPerToken(0)
      ).to.be.revertedWith("Steps per token must be greater than 0");
    });
  });

  describe("Token Distribution", function () {
    it("Should correctly distribute tokens for different step counts", async function () {
      const testCases = [
        { steps: 1000, expectedTokens: "1.0" },
        { steps: 5000, expectedTokens: "5.0" },
        { steps: 1500, expectedTokens: "1.5" },
      ];

      let expectedCumulativeBalance = ethers.parseEther("0");
      const baseDate = Math.floor(Date.now() / 86400000);

      for (let i = 0; i < testCases.length; i++) {
        const { steps, expectedTokens } = testCases[i];
        const date = baseDate + i;
        await token.mintFromSteps(user1.address, steps, date);
        
        expectedCumulativeBalance = expectedCumulativeBalance + ethers.parseEther(expectedTokens);
        const actualBalance = await token.balanceOf(user1.address);
        
        expect(actualBalance).to.equal(expectedCumulativeBalance);
      }
    });

    it("Should handle multiple users correctly", async function () {
      const date = Math.floor(Date.now() / 86400000);
      
      await token.mintFromSteps(user1.address, 1000, date);
      await token.mintFromSteps(user2.address, 2000, date);

      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("1.0"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("2.0"));
    });
  });
}); 