import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, Typography, Button } from '@mui/material';
import { AccountBalanceWallet, AccountBalanceWalletOutlined } from '@mui/icons-material';
import { ethers } from 'ethers';

// Import your contract ABI
const contractABI = [
  // Basic ERC20 functions
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function balanceOf(address account) public view returns (uint256)",
  
  // GreenStepsToken specific functions
  "function submitSteps(address user, uint256 steps, uint256 weekNumber) public",
  "function claimWeeklyRewards(uint256 weekNumber) public",
  "function getWeeklyStats(address user, uint256 weekNumber) public view returns (uint256 steps, uint256 carbonCredits, uint256 tokensEarned, bool claimed)",
  "function getUserStats(address user) public view returns (uint256 totalSteps, uint256 totalCarbonCredits, uint256 totalTokensEarned)",
  
  // Conversion rates
  "function stepsPerToken() public view returns (uint256)",
  "function stepsPerCarbonCredit() public view returns (uint256)",
  "function carbonCreditValue() public view returns (uint256)",
  
  // Events
  "event StepsSubmitted(address indexed user, uint256 steps, uint256 carbonCredits, uint256 tokens, uint256 weekNumber)",
  "event WeeklyRewardsClaimed(address indexed user, uint256 carbonCredits, uint256 tokens, uint256 weekNumber)"
];

const Web3Connection = ({ onConnect, contractAddress }) => {
  const [account, setAccount] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
    if (onConnect) {
      onConnect({ account: null, contract: null });
    }
    handleMenuClose();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      setAccount(account);

      const provider = new ethers.BrowserProvider(window.ethereum);

      if (contractAddress) {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        if (onConnect) {
          onConnect({ account, contract });
        }
      } else {
        throw new Error('Contract address is not set. Please check your environment variables.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Tooltip title={account ? "Connected Wallet" : "Connect Wallet"}>
        <Button
          variant={account ? "contained" : "outlined"}
          onClick={account ? handleMenuClick : connectWallet}
          disabled={isLoading}
          startIcon={account ? <AccountBalanceWallet /> : <AccountBalanceWalletOutlined />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: account ? 'primary.dark' : 'primary.light',
            }
          }}
        >
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={disconnectWallet} sx={{ color: 'error.main' }}>
          <Typography>Disconnect Wallet</Typography>
        </MenuItem>
      </Menu>

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default Web3Connection; 