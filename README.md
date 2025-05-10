# GreenSteps - Blockchain Fitness App

<div align="center">
  <img src="frontend/public/logo.png" alt="GreenSteps Logo" width="200" height="auto" />
  <h3>Track Your Steps, Earn Green Rewards</h3>
</div>

## 🌐 Live Demo

Try out GreenSteps now at: https://green-steps-blockchain-fitness-app.vercel.app

### Requirements to Use the App:

- A Web3 wallet (like MetaMask) installed in your browser
- Some AXC tokens for gas fees on Axiom Chain
- A device or app that can export step data in CSV format

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology](#technology)
- [Installation](#installation)
- [Testing](#testing)
- [Smart Contracts](#smart-contracts)
- [Environmental Impact](#environmental-impact)
- [License](#license)

## 🌟 Overview

GreenSteps is a blockchain-based application that unites fitness, sustainability, and financial rewards. By tracking your daily steps, you can earn carbon credits and tokens linked to your positive environmental impact. The application leverages blockchain to ensure transparent and verifiable tracking of environmental contributions.

## ✨ Features

- **Step Tracking**: Upload step data from your fitness app or device
- **Carbon Calculation**: Automatic conversion of steps to carbon savings
- **Reward System**: Earn tokens based on your environmental contributions
- **Weekly Progress**: Visualization of weekly steps, carbon savings, and potential tokens
- **Wallet Integration**: Seamless connection to Ethereum wallet to manage tokens

## 🔧 Technology

### Frontend

- React, Material-UI, ethers.js, Highcharts

### Blockchain

- Solidity, Hardhat, Ethereum, MetaMask

## 📦 Installation

### Prerequisites

- Node.js v16+
- pnpm (or npm/yarn)
- MetaMask or other Web3 wallet with Axiom Chain configured
- Git

### Network Configuration for MetaMask

- Network Name: Axiom Chain
- RPC URL: https://rpc.axiom.network/
- Chain ID: 23413
- Currency Symbol: AXC
- Block Explorer: https://explorer.axiom.network/

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/GreenSteps---Blockchain-Fitness-App.git
cd GreenSteps---Blockchain-Fitness-App

# Install frontend dependencies
cd frontend
pnpm install
pnpm run dev

# Open http://localhost:5173 in your browser
```

For detailed setup and testing instructions, please refer to [INSTRUCTIONS.md](INSTRUCTIONS.md)

## 🧪 Testing

```bash
# Test smart contracts
npx hardhat test

# Run frontend
cd frontend
pnpm run dev
```

## 🔐 Smart Contracts

GreenSteps uses a main contract `GreenStepsToken.sol` that handles both tokenization and the reward system.

### Conversion Rates

- **Carbon Credits**: 10,000 steps = 1 carbon credit
- **Tokens**: 1000 steps = 1 token + 100 tokens per carbon credit

## 🌱 Environmental Impact

- **CO2 Savings**: 1 carbon credit = approx. 0.5 kg CO2
- **Tree Equivalent**: 20 carbon credits = 1 tree worth of carbon sequestration

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with 💚 by [Andreas Wold Sløgedal]</p>
  <p>Feel free to share the project if you find it useful!</p>
</div>
