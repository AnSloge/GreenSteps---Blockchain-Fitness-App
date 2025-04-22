import React, { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, Typography } from '@mui/material';
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
  const [provider, setProvider] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const initializeConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);

          if (contractAddress) {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            if (onConnect) {
              onConnect({ account, contract });
            }
          } else {
            setError('Contract address is not set. Please check your environment variables.');
          }
        }

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        return () => {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
      } catch (error) {
        console.error('Error checking initial connection:', error);
        setError('Failed to initialize connection: ' + error.message);
      }
    } else {
      setError('MetaMask is not installed');
    }
  }, [contractAddress, onConnect]);

  useEffect(() => {
    initializeConnection();
  }, [initializeConnection]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const disconnectWallet = async () => {
    try {
      // Remove all event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }

      // Reset all states
      setAccount(null);
      setProvider(null);
      setError(null);
      
      // Notify parent component
      if (onConnect) {
        onConnect({ account: null, contract: null });
      }

      // Close the menu
      handleMenuClose();

      // Force MetaMask to disconnect
      if (window.ethereum && window.ethereum.disconnect) {
        await window.ethereum.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet: ' + error.message);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      setAccount(account);

      // Set up provider and contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      if (contractAddress) {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        if (onConnect) {
          onConnect({ account, contract });
        }
      } else {
        throw new Error('Contract address is not set. Please check your environment variables.');
      }

      // Set up event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
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
        <IconButton
          onClick={account ? handleMenuClick : connectWallet}
          disabled={isLoading}
          sx={{
            color: account ? 'primary.main' : 'text.secondary',
            '&:hover': {
              color: account ? 'primary.dark' : 'text.primary',
            },
          }}
        >
          {account ? <AccountBalanceWallet /> : <AccountBalanceWalletOutlined />}
        </IconButton>
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
        <MenuItem disabled>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
          </Typography>
        </MenuItem>
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