# GreenSteps - Detailed Setup and Testing Instructions

This document provides detailed instructions for setting up, running, and testing the GreenSteps blockchain fitness application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Frontend Setup](#frontend-setup)
- [Smart Contract Testing](#smart-contract-testing)
- [Using the Application](#using-the-application)
- [Sample Data](#sample-data)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 16.0 or higher
- **pnpm**: For package management (alternatives: npm or yarn)
- **MetaMask**: Browser extension for Ethereum wallet
- **Git**: For version control

## Frontend Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AnSloge/GreenSteps---Blockchain-Fitness-App
   cd GreenSteps---Blockchain-Fitness-App
   ```

2. **Navigate to frontend directory and install dependencies**:

   ```bash
   cd frontend
   pnpm install
   ```

3. **Start the development server**:

   ```bash
   pnpm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to http://localhost:5173

## Smart Contract Testing

1. **From the project root, run Hardhat tests**:

   ```bash
   # Make sure you're in the project root directory, not in frontend
   cd ..
   npx hardhat test
   ```

2. **Verify test results**:
   - All tests should pass without errors
   - You should see test results for different contract functions:
     - Deployment
     - Steps Submission
     - Rewards Claiming
     - Stats Tracking
     - Conversion Rates

## Using the Application

### Setting Up MetaMask

1. **Configure Axiom Chain in MetaMask**:

   - Network Name: Axiom Chain
   - RPC URL: https://rpc.axiom.network/
   - Chain ID: 23413
   - Currency Symbol: AXC
   - Block Explorer: https://explorer.axiom.network/

2. **Connect to the Application**:
   - Click the "Connect Wallet" button in the app
   - Select your MetaMask account
   - Ensure you're connected to Axiom Chain

### Uploading Step Data

1. **Get CSV file with step data**:

   You have two options:

   - **Option 1**: Download the CSV template directly from the website by clicking the "Download CSV Template" button
   - **Option 2**: Prepare your own CSV file with step data in the following format:
     ```
     date,steps,distance,calories
     2023-10-01,8500,6.5,450
     2023-10-02,9200,7.1,485
     ```

2. **Upload the file**:

   - Click on the "Upload CSV" button
   - Select your prepared CSV file
   - Review the data preview

3. **Submit the data**:

   - After reviewing the data, click the "Submit Steps" button to record your steps
   - This step is crucial - your data won't be processed until you click this button

4. **View Dashboard**:

   - Check your weekly summary
   - See calculated carbon credits and tokens

5. **Claim Rewards**:
   - Click "Claim" button next to a completed week
   - Confirm the transaction in MetaMask
   - Wait for blockchain confirmation

## Sample Data

You can use the sample data included in the project for testing:

```
frontend/public/example_health_data.csv
```

This file contains two months' worth of step data that you can use to test the application.

## Live Version

The application is deployed and accessible at:
https://frontend-ansloge-ansloges-projects.vercel.app

## Troubleshooting

### MetaMask Connection Issues

1. **Network Connection Problems**:

   - Verify you're connected to Axiom Chain
   - Check your internet connection
   - Try reloading the page

2. **Transaction Failures**:
   - Ensure you have enough AXC for gas fees
   - Check that transaction gas limit is sufficient
   - Try with a higher gas price if transactions are slow

### CSV Upload Issues

1. **File Format Problems**:

   - Make sure the CSV file has the correct headers
   - Check for any special characters or formatting issues
   - Verify the date format (YYYY-MM-DD)

2. **Data Not Appearing**:
   - Make sure you clicked the "Submit Steps" button after uploading the CSV
   - Refresh the dashboard
   - Check for any error messages
   - Verify the file was successfully uploaded
