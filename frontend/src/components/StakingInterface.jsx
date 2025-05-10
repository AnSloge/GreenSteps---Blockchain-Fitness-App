import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { ethers } from 'ethers';
import { useTheme } from '@mui/material/styles';

const StakingInterface = ({ contract, account }) => {
  const theme = useTheme();
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakingInfo, setStakingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [balance, setBalance] = useState('0');
  const [approving, setApproving] = useState(false);
  const [contractReady, setContractReady] = useState(false);

  // Valider at contract-objektet har nødvendige funksjoner
  useEffect(() => {
    if (!contract) {
      setError("Contract is not initialized");
      return;
    }

    try {
      // Sjekk om kontrakten har de nødvendige funksjonene
      const requiredFunctions = ['stakeTokens', 'getStakingInfo', 'balanceOf', 'approve'];
      const missingFunctions = [];
      
      for (const funcName of requiredFunctions) {
        if (typeof contract[funcName] !== 'function') {
          missingFunctions.push(funcName);
        }
      }

      if (missingFunctions.length > 0) {
        setError(`Contract is missing required functions: ${missingFunctions.join(', ')}`);
        setContractReady(false);
      } else {
        console.log("Contract is properly initialized with all required functions");
        setContractReady(true);
        setError('');
      }
    } catch (err) {
      console.error("Error validating contract:", err);
      setError("Failed to validate contract interface");
      setContractReady(false);
    }
  }, [contract]);

  // Fetch staking info
  const fetchStakingInfo = async () => {
    try {
      if (!contract || !account || !contractReady) return;
      
      const info = await contract.getStakingInfo(account);
      
      // Få antall desimaler fra kontrakten hvis mulig
      let decimals;
      try {
        decimals = await contract.decimals();
        decimals = Number(decimals);
        console.log(`Token decimals for staking: ${decimals}`);
      } catch (err) {
        console.warn("Could not get decimals from contract, defaulting to 18:", err);
        decimals = 18; // Standard ERC20
      }

      // Konverter beløp med korrekt antall desimaler
      // VIKTIG! Sjekk om vi faktisk må konvertere - for denne kontrakten ser det ut som
      // at den rapporterer 18 decimals, men ikke faktisk bruker dem
      let amount, bonusEarned;
      
      if (info[0].toString().length < 10) {
        // Dette ser ut som en liten verdi, sannsynligvis ikke multiplisert med decimals
        // Bruk verdiene som de er
        amount = Number(info[0]);
        bonusEarned = Number(info[4]);
        console.log("Using raw amounts for staking (detected actual 0 decimals)");
      } else {
        // Normal ERC20 beløp med decimals
        const divisor = ethers.parseUnits("1", decimals);
        amount = Number(info[0]) / Number(divisor);
        bonusEarned = Number(info[4]) / Number(divisor);
      }
      
      setStakingInfo({
        amount: amount,
        startTime: new Date(Number(info[1]) * 1000),
        endTime: new Date(Number(info[2]) * 1000),
        isStaked: info[3],
        bonusEarned: bonusEarned
      });
      
      console.log("Staking info:", info);
      console.log("Formatted staking amount:", amount);
    } catch (err) {
      console.error('Error fetching staking info:', err);
    }
  };

  // Fetch token balance
  const fetchBalance = async () => {
    try {
      if (contract && account && contractReady) {
        const bal = await contract.balanceOf(account);
        
        // Få antall desimaler fra kontrakten hvis mulig
        let decimals;
        try {
          decimals = await contract.decimals();
          decimals = Number(decimals);
          console.log(`Token decimals: ${decimals}`);
        } catch (err) {
          console.warn("Could not get decimals from contract, defaulting to 18:", err);
          decimals = 18; // Standard ERC20
        }

        // Konverter med korrekt antall desimaler
        // VIKTIG! Sjekk om vi faktisk må konvertere - for denne kontrakten ser det ut som
        // at den rapporterer 18 decimals, men ikke faktisk bruker dem
        let formattedBalance;
        
        if (bal.toString().length < 10) {
          // Dette ser ut som en liten verdi, sannsynligvis ikke multiplisert med decimals
          // Bruk balansen som den er
          formattedBalance = Number(bal);
          console.log("Using raw balance (detected actual 0 decimals)");
        } else {
          // Normal ERC20 balance med decimals
          const divisor = ethers.parseUnits("1", decimals);
          formattedBalance = Number(bal) / Number(divisor);
        }
        
        console.log(`User balance (raw): ${bal.toString()}`);
        console.log(`User balance (formatted): ${formattedBalance} GRST`);
        
        setBalance(formattedBalance.toString());
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  // Update time remaining
  useEffect(() => {
    if (stakingInfo?.isStaked) {
      const timer = setInterval(() => {
        const now = new Date();
        const end = stakingInfo.endTime;
        const diff = end - now;

        if (diff <= 0) {
          setTimeRemaining('Staking period ended');
          clearInterval(timer);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeRemaining(`${days}d ${hours}h remaining`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [stakingInfo]);

  // Fetch initial staking info and balance
  useEffect(() => {
    if (contract && account && contractReady) {
      fetchStakingInfo();
      fetchBalance();
      
      // Log contract interface for debugging - med sjekk for å forhindre null/undefined error
      console.log("Contract:", contract);
      if (contract && contract.interface && contract.interface.functions) {
        console.log("Contract methods:", Object.keys(contract.interface.functions));
      } else {
        console.log("Contract interface is not properly initialized");
      }
    }
  }, [contract, account, contractReady]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      setError('');
      setSuccess('');

      // Hent antall desimaler fra kontrakten hvis mulig
      let decimals;
      try {
        decimals = await contract.decimals();
        decimals = Number(decimals);
        console.log(`Token decimals for approve: ${decimals}`);
      } catch (err) {
        console.warn("Could not get decimals from contract, defaulting to 18:", err);
        decimals = 18;
      }

      // Denne kontrakten bruker faktisk 0 desimaler selv om den rapporterer 18
      // Så vi bruker direktekonvertering uten desimaler
      const amount = ethers.parseUnits(stakeAmount, 0); // Bruk 0 desimaler
      console.log(`Approving ${stakeAmount} GRST tokens (${amount})...`);
      
      // Approve the contract to spend tokens
      const tx = await contract.approve(contract.target, amount);
      await tx.wait();
      
      console.log('Approval successful');
      setSuccess('Approved tokens for staking. You can now stake your tokens.');
      
      // Now you can stake
      await handleStake();
    } catch (err) {
      console.error('Error during approval:', err);
      setError(`Approval failed: ${err.message || err}`);
    } finally {
      setApproving(false);
    }
  };

  const handleStake = async () => {
    try {
      setLoading(true);
      setError('');
      if (!success.includes('Approved')) {
        setSuccess('');
      }

      // Denne kontrakten bruker faktisk 0 desimaler selv om den rapporterer 18
      // Så vi bruker direktekonvertering uten desimaler
      const amount = ethers.parseUnits(stakeAmount, 0); // Bruk 0 desimaler
      console.log(`Staking ${stakeAmount} GRST tokens (${amount})...`);
      
      // Try to stake
      const tx = await contract.stakeTokens(amount);
      await tx.wait();

      setSuccess('Successfully staked tokens!');
      setStakeAmount('');
      fetchStakingInfo();
      fetchBalance();
    } catch (err) {
      console.error('Error staking tokens:', err);
      // Check if it's an approval issue
      if (err.message && err.message.includes('insufficient allowance')) {
        setError('You need to approve tokens first before staking');
      } else if (err.message && err.message.includes('Amount below minimum stake')) {
        setError('Minimum stake is 100 GRST. Please enter a larger amount.');
      } else if (err.message && err.message.includes('Insufficient balance')) {
        setError('You do not have enough GRST tokens for this transaction.');
      } else {
        setError(err.message || 'Error staking tokens');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const tx = await contract.claimStakingRewards();
      await tx.wait();

      setSuccess('Successfully claimed staking rewards!');
      fetchStakingInfo();
      fetchBalance();
    } catch (err) {
      setError(err.message || 'Error claiming rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure? Early withdrawal will incur a 2% penalty.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const tx = await contract.cancelStaking();
      await tx.wait();

      setSuccess('Successfully cancelled staking (with penalty)');
      fetchStakingInfo();
      fetchBalance();
    } catch (err) {
      setError(err.message || 'Error cancelling staking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ 
      maxWidth: 600, 
      mx: 'auto', 
      mt: 4,
      borderRadius: 3,
      boxShadow: theme.shadows[4]
    }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          GRST Staking
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Current Staking Status */}
        {stakingInfo?.isStaked && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Stake
            </Typography>
            <Stack spacing={1}>
              <Typography>
                Amount: {parseFloat(stakingInfo.amount).toFixed(2)} GRST
              </Typography>
              <Typography>
                Time Remaining: {timeRemaining}
              </Typography>
              <Typography>
                Expected Bonus: {(parseFloat(stakingInfo.amount) * 0.05).toFixed(2)} GRST
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Staking Form */}
        {!stakingInfo?.isStaked && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Amount to Stake (GRST)"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              sx={{ mb: 2 }}
              helperText={`Minimum stake: 100 GRST (Your balance: ${parseFloat(balance).toFixed(2)} GRST)`}
            />
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleApprove}
                disabled={approving || loading || !stakeAmount || Number(stakeAmount) < 100 || Number(stakeAmount) > Number(balance)}
                sx={{ bgcolor: '#5856D6' }}
              >
                {approving ? <CircularProgress size={24} /> : 'Approve & Stake'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Staking Actions */}
        {stakingInfo?.isStaked && (
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleClaim}
              disabled={loading || new Date() < stakingInfo.endTime}
            >
              {loading ? <CircularProgress size={24} /> : 'Claim Rewards'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={loading || new Date() >= stakingInfo.endTime}
            >
              Cancel Staking (2% Penalty)
            </Button>
          </Stack>
        )}

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {/* Staking Info */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Staking Details:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 30-day staking period
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 5% bonus on completion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 2% penalty for early withdrawal
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StakingInterface; 