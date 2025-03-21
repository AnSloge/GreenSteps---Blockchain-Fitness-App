import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
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
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const initializeConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        try {
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'  // This gets currently connected accounts without prompting
          });

          if (accounts.length > 0) {
            const account = accounts[0];
            setAccount(account);

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(contract);

            // Get token balance
            const balance = await contract.balanceOf(account);
            setBalance(ethers.formatEther(balance));

            if (onConnect) {
              onConnect({ account, contract });
            }
          }
        } catch (error) {
          console.error('Error checking initial connection:', error);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
        return () => {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
      }
    };

    initializeConnection();
  }, [contractAddress, onConnect]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setAccount(accounts[0]);
    }
  };

  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        const account = accounts[0];
        setAccount(account);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);

        // Get token balance
        const balance = await contract.balanceOf(account);
        setBalance(ethers.formatEther(balance));

        if (onConnect) {
          onConnect({ account, contract });
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error connecting wallet. Please make sure MetaMask is installed and unlocked.');
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setBalance(0);
    if (onConnect) {
      onConnect(null);
    }
  };

  const submitStepsToContract = async (stepsData) => {
    if (!contract || !account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      for (const data of stepsData) {
        const date = Math.floor(new Date(data.date).getTime() / 86400000); // Convert to days since epoch
        const tx = await contract.mintFromSteps(account, data.steps, date);
        await tx.wait();
      }
      alert('Steps submitted successfully!');
      
      // Update balance
      const newBalance = await contract.balanceOf(account);
      setBalance(ethers.formatEther(newBalance));
    } catch (error) {
      console.error('Error submitting steps:', error);
      alert('Error submitting steps. Please try again.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Wallet Connection
      </Typography>
      
      {!account ? (
        <Button
          variant="contained"
          onClick={connectWallet}
          sx={{ mb: 2 }}
        >
          Connect MetaMask
        </Button>
      ) : (
        <Box>
          <Typography variant="body1" gutterBottom>
            Connected Account: {account.slice(0, 6)}...{account.slice(-4)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Token Balance: {balance} GRST
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={disconnectWallet}
            sx={{ mt: 1 }}
          >
            Disconnect Wallet
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default Web3Connection; 