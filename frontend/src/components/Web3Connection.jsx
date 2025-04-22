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
  const [error, setError] = useState(null);

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

          if (contractAddress) {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            if (onConnect) {
              onConnect({ account, contract });
            }
          }
        }
      } catch (error) {
        console.error('Error checking initial connection:', error);
        setError('Failed to initialize connection');
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
    setError(null);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const account = accounts[0];
      setAccount(account);

      if (contractAddress) {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        if (onConnect) {
          onConnect({ account, contract });
        }
      } else {
        setError('Contract address is not set');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
    if (onConnect) {
      onConnect({ account: null, contract: null });
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
        <MenuItem onClick={disconnectWallet}>
          <Typography>Disconnect</Typography>
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