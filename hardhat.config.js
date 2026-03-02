require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Validate required environment variables for Axiom network
const requiredEnvVars = ["PRIVATE_KEY", "AXIOM_RPC_URL"];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `Warning: ${missingEnvVars.join(", ")} not set. Axiom network deployment will not be available.`
  );
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    axiom: {
      url: process.env.AXIOM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 23413
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
