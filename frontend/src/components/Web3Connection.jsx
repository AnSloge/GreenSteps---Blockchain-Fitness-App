import React, { useState, useEffect } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, Typography, Button, Snackbar, Alert, Badge, Chip } from '@mui/material';
import { AccountBalanceWallet, AccountBalanceWalletOutlined, LocalAtm } from '@mui/icons-material';
import { ethers } from 'ethers';

// Import contractABI from the utils file
import { contractABI } from '../utils/contractABI';

const Web3Connection = ({ onConnect, contractAddress }) => {
  const [account, setAccount] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChainId, setCurrentChainId] = useState(null); // eslint-disable-line no-unused-vars
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [contract, setContractInstance] = useState(null);

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
        try {
          const newChainId = parseInt(chainIdHex, 16);
          console.log(`Chain changed to ${newChainId}`);
          setCurrentChainId(newChainId);
          
          // No warnings about network changes
          if (account) {
            // Reconnect with current account on the new network
            connectWithAccount(account);
          }
        } catch (error) {
          console.error("Error handling chain change:", error);
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

  // Fetch token balance periodically
  useEffect(() => {
    if (!account || !contract) return;

    const fetchTokenBalance = async () => {
      try {
        const balance = await contract.balanceOf(account);
        // Token balance is stored with 2 decimal places (multiplied by 100 in the contract)
        setTokenBalance(Number(balance) / 100);
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
      }
    };

    // Fetch initial balance
    fetchTokenBalance();

    // Set up interval to update balance every 30 seconds
    const intervalId = setInterval(fetchTokenBalance, 30000);

    return () => clearInterval(intervalId);
  }, [account, contract]);

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

  // Connect with specific account
  const connectWithAccount = async (accountAddress) => {
    if (!contractAddress) {
      console.error("Contract address is not configured");
      showAlert('Contract address is not set. Please check your environment variables.', 'error');
      return;
    }

    try {
      // No network checking
      console.log(`Connecting with account ${accountAddress}`);
      console.log(`Using contract address: ${contractAddress}`);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Got BrowserProvider");
      
      const signer = await provider.getSigner();
      console.log(`Got signer for address: ${await signer.getAddress()}`);
      
      try {
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("Created contract instance");
        
        // Store contract instance for token balance checks
        setContractInstance(contractInstance);
        console.log("Stored contract instance");

        // Check if contract is valid by trying to call a view function
        try {
          const name = await contractInstance.name();
          console.log(`Connected to contract: ${name}`);
        } catch (nameError) {
          console.warn("Could not get contract name, but proceeding anyway:", nameError);
        }

        if (onConnect) {
          console.log("Calling onConnect callback with account and contract");
          onConnect({ account: accountAddress, contract: contractInstance });
        }

        // Fetch initial token balance
        if (accountAddress) {
          try {
            console.log("Fetching initial token balance");
            const balance = await contractInstance.balanceOf(accountAddress);
            const formattedBalance = Number(balance) / 100;
            console.log(`Initial token balance: ${formattedBalance} GRST`);
            setTokenBalance(formattedBalance);
          } catch (err) {
            console.error('Failed to get initial token balance:', err);
          }
        }
      } catch (contractError) {
        console.error("Error creating contract instance:", contractError);
        setError(`Failed to connect to contract: ${contractError.message}`);
        showAlert(`Failed to connect to contract: ${contractError.message}`, 'error');
      }
    } catch (error) {
      console.error('Error setting up wallet connection:', error);
      setError(`Failed to set up connection: ${error.message}`);
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
      // No network checking or switching
      console.log("Requesting accounts from wallet");
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      console.log(`Connected to account: ${account}`);
      setAccount(account);
      
      // Try to connect with this account
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
      label: 'Disconnect Wallet', 
      onClick: disconnectWallet, 
      color: 'error.main' 
    }
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {account && (
        <Tooltip title="Your GRST Token Balance">
          <Chip
            icon={<LocalAtm />}
            label={`${tokenBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GRST`}
            color="secondary"
            sx={{
              borderRadius: 2,
              height: 40,
              py: 0.5,
              px: 1,
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: 'inherit',
              },
              transition: 'all 0.2s',
              animation: tokenBalance > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(88, 86, 214, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 6px rgba(88, 86, 214, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(88, 86, 214, 0)',
                },
              },
            }}
          />
        </Tooltip>
      )}
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