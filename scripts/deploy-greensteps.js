const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting GreenStepsToken deployment...");
    console.log("Network:", hre.network.name);

    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Check deployer balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      throw new Error("Deployer account has zero balance. Please fund the account before deploying.");
    }

    // Deploy the contract
    console.log("\nDeploying GreenStepsToken contract...");
    const GreenStepsToken = await hre.ethers.getContractFactory("GreenStepsToken");
    const token = await GreenStepsToken.deploy();

    await token.waitForDeployment();
    const contractAddress = await token.getAddress();

    console.log("\n✅ GreenStepsToken deployed successfully!");
    console.log("Contract address:", contractAddress);
    console.log("Transaction hash:", token.deploymentTransaction().hash);

    // Verify contract on block explorer if API key is available
    if (process.env.ETHERSCAN_API_KEY && hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\nWaiting for block confirmations before verification...");
      await token.deploymentTransaction().wait(5); // Wait for 5 confirmations

      console.log("Verifying contract on block explorer...");
      try {
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [],
        });
        console.log("✅ Contract verified successfully!");
      } catch (error) {
        if (error.message.includes("Already Verified")) {
          console.log("Contract is already verified!");
        } else {
          console.error("❌ Verification failed:", error.message);
          console.log("You can verify manually later using:");
          console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
        }
      }
    } else {
      if (!process.env.ETHERSCAN_API_KEY) {
        console.log("\nℹ️  Skipping verification: ETHERSCAN_API_KEY not set");
      } else {
        console.log("\nℹ️  Skipping verification: Local network deployment");
      }
    }

    // Display deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("Contract Name:    GreenStepsToken");
    console.log("Symbol:           GRST");
    console.log("Network:          ", hre.network.name);
    console.log("Contract Address: ", contractAddress);
    console.log("Deployer:         ", deployer.address);
    console.log("=".repeat(60));

    // Save deployment info to a file for reference
    const fs = require("fs");
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: contractAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      transactionHash: token.deploymentTransaction().hash,
    };

    const deploymentsDir = "./deployments";
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    const filename = `${deploymentsDir}/${hre.network.name}-deployment.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\nℹ️  Deployment info saved to: ${filename}`);

    return contractAddress;
  } catch (error) {
    console.error("\n❌ Deployment failed!");
    
    // Provide helpful error messages for common issues
    if (error.message.includes("insufficient funds")) {
      console.error("Error: Insufficient funds in deployer account.");
      console.error("Please ensure your account has enough ETH to cover gas fees.");
    } else if (error.message.includes("network")) {
      console.error("Error: Network connection issue.");
      console.error("Please check your RPC URL and network configuration.");
    } else if (error.message.includes("nonce")) {
      console.error("Error: Nonce issue detected.");
      console.error("Try resetting your account nonce or wait for pending transactions.");
    } else {
      console.error("Error:", error.message);
    }

    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
