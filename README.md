# GreenSteps - Blockchain Fitness App

<div align="center">
  <img src="frontend/public/logo.png" alt="GreenSteps Logo" width="200" height="auto" />
  <h3>Track Your Steps, Earn Green Rewards</h3>
</div>

## 🌐 Live Demo

Try out GreenSteps now at: https://frontend-ansloge-ansloges-projects.vercel.app

### Requirements to Use the App:

- A Web3 wallet (like MetaMask) installed in your browser
- Some AXC tokens for gas fees on Axiom Chain
- A device or app that can export step data in CSV format

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology](#technology)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contracts](#smart-contracts)
- [Environmental Impact](#environmental-impact)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

GreenSteps is a groundbreaking blockchain-based application that unites fitness, sustainability, and financial rewards. By tracking your daily steps, you can earn carbon credits and tokens linked to your positive environmental impact. The application leverages the Ethereum blockchain to ensure transparent and verifiable tracking of environmental contributions.

The project's main goals are to use blockchain technology to:

1. **Motivate** users to be physically active through tokenized rewards
2. **Quantify** the environmental impact of daily activity
3. **Raise awareness** about the connection between individual actions and global environmental challenges
4. **Reward** sustainable lifestyles in a transparent and decentralized manner

## ✨ Features

### For Users

- **Step Tracking**: Upload step data from your preferred fitness app or device
- **Carbon Calculation**: Automatic conversion of steps to carbon savings
- **Reward System**: Earn tokens based on your environmental contributions
- **Weekly Progress**: Visualization of weekly steps, carbon savings, and potential tokens
- **Wallet Integration**: Seamless connection to Ethereum wallet to manage tokens

### Technical Features

- **Blockchain-based Verification**: Ensure rewards are distributed fairly
- **Smart Contract**: Automated reward system following predefined rules
- **Data Integrity**: Security checks to validate user data
- **Responsive Design**: Works on all devices from mobile to desktop

## 🔧 Technology

### Frontend

- **React**: JavaScript library for user interfaces
- **Material-UI**: Component library for elegant and responsive design
- **ethers.js**: Library for interacting with the Ethereum blockchain
- **Highcharts**: Advanced visualization of activity and environmental data
- **MUI X Data Grid**: Powerful table component for data display

### Blockchain

- **Solidity**: Programming language for Ethereum smart contracts
- **Hardhat**: Development environment for compiling, testing, and deploying smart contracts
- **Ethereum**: Blockchain network for decentralized reward system
- **MetaMask**: Wallet integration for user authentication and transactions

### Backend / Data

- **CSV Parsing**: Support for importing step data from common fitness apps
- **Local Calculations**: Efficient computation of carbon savings and tokens

## 🏗️ Architecture

GreenSteps follows a decentralized architecture where user data is processed locally in the browser, and only reward claims are sent to the blockchain.

### Component Diagram

```
+----------------+      +------------------+      +---------------------+
| User Device    | ---> | GreenSteps UI   | ---> | Ethereum Blockchain |
| (Fitness Data) |      | (React + Web3)  |      | (Smart Contracts)   |
+----------------+      +------------------+      +---------------------+
                           ^         |
                           |         v
                        +--------------------+
                        | Local Data Processing |
                        | (Calculation & Analysis) |
                        +--------------------+
```

### Data Flow

1. User uploads CSV file with step data to the application
2. Frontend processes the data and calculates carbon savings and potential tokens
3. Data is grouped into weekly summaries and displayed in the dashboard
4. User can claim rewards for completed weeks via smart contract
5. Transaction is sent to the Ethereum blockchain for verification and token transfer
6. Wallet balance is updated when the transaction is confirmed

## 📦 Installation

### Prerequisites

- Node.js v16+
- pnpm (or npm/yarn)
- MetaMask or other Web3 wallet with Axiom Chain configured
- Some AXC tokens for gas fees
- Git

### Network Configuration for MetaMask

To connect to Axiom Chain, add these network details to your MetaMask:

- Network Name: Axiom Chain
- RPC URL: https://rpc.axiom.network/
- Chain ID: 23413
- Currency Symbol: AXC
- Block Explorer: https://explorer.axiom.network/

### Clone and Install

```bash
# Clone the repo
git clone https://github.com/your-username/GreenSteps---Blockchain-Fitness-App.git
cd GreenSteps---Blockchain-Fitness-App

# Install frontend dependencies
cd frontend
pnpm install

# Create .env file
cp .env.example .env
# Edit .env with your settings
```

### Configure Environment Variables

Create a `.env` file in the `frontend` folder with the following variables:

```
VITE_CONTRACT_ADDRESS=0xYour_Contract_Address
VITE_CHAIN_ID=23413  # Chain ID for Axiom Chain
VITE_RPC_URL=https://rpc.axiom.network/
```

### Compile and Deploy Smart Contracts (optional if you want to redeploy)

```bash
cd ..  # Go back to project root
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network axiom
```

## 🚀 Usage

### Start Development Server

```bash
cd frontend
pnpm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
cd frontend
pnpm run build
```

The production files will be in the `dist` folder ready for distribution.

### Application Flow

1. **Connect Wallet**: Click the "Connect Wallet" button to connect to MetaMask
2. **Upload Data**: Upload a CSV file with step data (format: date, steps, distance, calories)
3. **View Dashboard**: See your steps, carbon savings, and potential tokens
4. **Claim Rewards**: Click "Claim" to claim tokens for a completed week
5. **Manage Tokens**: Use your Ethereum wallet to view and manage your tokens

### Sample Data

The project includes sample data in `highcarts_dashboard_example/example_health_data.csv` that can be used for testing.

## 🔐 Smart Contracts

GreenSteps uses a main contract `GreenStepsToken.sol` that handles both tokenization and the reward system.

### Main Functions

- `submitSteps(address user, uint256 steps, uint256 weekNumber)`: Records step data for a user
- `claimWeeklyRewards(uint256 weekNumber)`: Allows the user to claim tokens for a completed week
- `getWeeklyStats(address user, uint256 weekNumber)`: Retrieves statistics for a specific week
- `getUserStats(address user)`: Retrieves total statistics for a user

### Conversion Rates

- **Carbon Credits**: 5000 steps = 1 carbon credit
- **Tokens**: 1000 steps = 1 token + 100 tokens per carbon credit

### Security Assessment

The contract includes several security controls:

- Only authorized addresses can record step data
- Users can only claim rewards once per week
- Minimum step threshold to prevent abuse
- Owner-controlled parameter adjustment system

## 🌱 Environmental Impact

GreenSteps quantifies the environmental impact of the user's physical activity by converting steps to carbon savings.

### Calculation Methodology

- **CO2 Savings**: 1 carbon credit = approx. 0.5 kg CO2
- **Tree Equivalent**: 20 carbon credits = 1 tree worth of carbon sequestration

These calculations are based on scientific research on reduced carbon emissions from transportation alternatives and personal consumption.

## 🧪 Testing

### Smart Contract Testing

```bash
npx hardhat test
```

### Frontend Testing

```bash
cd frontend
pnpm run test
```

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

<div align="center">
  <p>Built with 💚 by [Andreas Wold Sløgedal]</p>
  <p>Feel free to share the project if you find it useful!</p>
</div>
