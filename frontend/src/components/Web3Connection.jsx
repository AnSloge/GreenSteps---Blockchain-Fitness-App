import React, { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, Typography } from '@mui/material';
import { AccountBalanceWallet, AccountBalanceWalletOutlined } from '@mui/icons-material';
import { ethers } from 'ethers';

// Import your contract ABI
const contractABI = [
  "function mintFromSteps(address user, uint256 steps, uint256 date) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function symbol() public view returns (string)",
  "event StepsSubmitted(address indexed user, uint256 steps, uint256 tokens, uint256 date)"
];

const Web3Connection = ({ onConnect, contractAddress }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const initializeConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);

          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          if (onConnect) {
            onConnect({ account, contract });
          }
        }
      } catch (error) {
        console.error('Error checking initial connection:', error);
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
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

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const account = accounts[0];
      setAccount(account);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      if (onConnect) {
        onConnect({ account, contract });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    handleMenuClose();
    if (onConnect) {
      onConnect(null);
    }
  };

  return (
    <Box>
      {!account ? (
        <Tooltip title="Connect Wallet">
          <IconButton
            onClick={connectWallet}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #007AFF 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #2fb350 0%, #0056b3 100%)',
              },
              width: 40,
              height: 40,
            }}
          >
            <AccountBalanceWalletOutlined />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title={`${account.slice(0, 6)}...${account.slice(-4)}`}>
            <IconButton
              onClick={handleMenuClick}
              sx={{
                background: 'linear-gradient(135deg, #34C759 0%, #007AFF 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2fb350 0%, #0056b3 100%)',
                },
                width: 40,
                height: 40,
              }}
            >
              <AccountBalanceWallet />
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
            <MenuItem onClick={handleMenuClose}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </Typography>
            </MenuItem>
            <MenuItem onClick={disconnectWallet} sx={{ color: 'error.main' }}>
              Disconnect
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
};

export default Web3Connection; 