import React, { useState, useEffect } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, Typography, Button, Snackbar, Alert } from '@mui/material';
import { AccountBalanceWallet, AccountBalanceWalletOutlined } from '@mui/icons-material';
import { ethers } from 'ethers';

// Import contractABI from the utils file
import { contractABI } from '../utils/contractABI';

// Network configuration
const networks = {
  1: {
    name: 'Ethereum Mainnet',
    currencySymbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  5: {
    name: 'Goerli Testnet',
    currencySymbol: 'GoerliETH',
    blockExplorer: 'https://goerli.etherscan.io'
  },
  11155111: {
    name: 'Sepolia Testnet',
    currencySymbol: 'SepoliaETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  137: {
    name: 'Polygon Mainnet',
    currencySymbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  },
  80001: {
    name: 'Mumbai Testnet',
    currencySymbol: 'MATIC',
    blockExplorer: 'https://mumbai.polygonscan.com'
  }
};

// Get network settings from environment variables
const targetChainId = parseInt(import.meta.env.VITE_CHAIN_ID || '1'); // Default to mainnet if not specified
const targetNetwork = networks[targetChainId] || { 
  name: `Chain ID ${targetChainId}`, 
  currencySymbol: 'ETH', 
  blockExplorer: '' 
};

// Optional fallback RPC URL (used if MetaMask is not available)
const rpcUrl = import.meta.env.VITE_RPC_URL;

const Web3Connection = ({ onConnect, contractAddress }) => {
  const [account, setAccount] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  // Listen for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          connectWithAccount(accounts[0]);
        }
      };

      // Handle chain changes
      const handleChainChanged = (chainIdHex) => {
        const newChainId = parseInt(chainIdHex, 16);
        setCurrentChainId(newChainId);
        
        if (newChainId !== targetChainId) {
          showAlert(`Please switch to ${targetNetwork.name} to use this app`, 'warning');
        } else if (account) {
          // Reconnect if we're on the right network now
          connectWithAccount(account);
        }
      };

      // Get current chain
      window.ethereum.request({ method: 'eth_chainId' })
        .then(chainIdHex => {
          const chainId = parseInt(chainIdHex, 16);
          setCurrentChainId(chainId);
        })
        .catch(console.error);

      // Set up event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Clean up listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account, contractAddress]);

  // Show alerts
  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: targetNetwork.name,
                nativeCurrency: {
                  name: targetNetwork.currencySymbol,
                  symbol: targetNetwork.currencySymbol,
                  decimals: 18,
                },
                rpcUrls: [rpcUrl],
                blockExplorerUrls: [targetNetwork.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          showAlert(`Failed to add network: ${addError.message}`, 'error');
        }
      } else {
        showAlert(`Failed to switch network: ${switchError.message}`, 'error');
      }
    }
  };

  // Connect with specific account
  const connectWithAccount = async (accountAddress) => {
    if (!contractAddress) {
      showAlert('Contract address is not set. Please check your environment variables.', 'error');
      return;
    }

    try {
      // Check if we're on the right network
      if (currentChainId !== targetChainId) {
        showAlert(`Please switch to ${targetNetwork.name} to use this app`, 'warning');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      if (onConnect) {
        onConnect({ account: accountAddress, contract });
      }
    } catch (error) {
      console.error('Error setting up contract:', error);
      setError(`Failed to set up contract: ${error.message}`);
    }
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
      showAlert('MetaMask is not installed. Please install MetaMask to connect your wallet.', 'warning');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Check network
      if (currentChainId !== targetChainId) {
        await switchNetwork();
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      setAccount(account);
      await connectWithAccount(account);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
      showAlert(`Failed to connect wallet: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Menu items
  const menuItems = [
    { 
      label: 'Switch Network', 
      onClick: switchNetwork, 
      disabled: currentChainId === targetChainId,
      show: currentChainId !== targetChainId
    },
    { 
      label: 'Disconnect Wallet', 
      onClick: disconnectWallet, 
      color: 'error.main' 
    }
  ];

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
        {menuItems
          .filter(item => item.show !== false)
          .map((item, index) => (
            <MenuItem 
              key={index} 
              onClick={item.onClick} 
              disabled={item.disabled}
              sx={{ color: item.color }}
            >
              <Typography>{item.label}</Typography>
            </MenuItem>
          ))
        }
      </Menu>

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}

      <Snackbar 
        open={alertOpen} 
        autoHideDuration={4000} 
        onClose={handleAlertClose}
        anchorOrigin={{ 
          vertical: 'top', 
          horizontal: 'center' 
        }}
        sx={{
          mt: 7 // Flytt nedover for å unngå kollisjoner med header
        }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          sx={{ 
            width: '100%',
            boxShadow: 3
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Web3Connection; 