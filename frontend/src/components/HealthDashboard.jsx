import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Stack,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Info as InfoIcon, EmojiEvents as TrophyIcon, Send as SendIcon } from '@mui/icons-material';

const HealthDashboard = ({ healthData, contract, onRewardsClaimed }) => {
  const theme = useTheme();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [claimedWeeks, setClaimedWeeks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Group data by week
  const weeklyData = useMemo(() => {
    return healthData.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const weekNumber = getWeekNumber(date);
      if (!acc[weekNumber]) {
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
        
        // Generate realistic step counts for each day
        const generateDailySteps = () => {
          // Random steps between 5000 and 12000
          const baseSteps = Math.floor(Math.random() * (12000 - 5000) + 5000);
          // Add some variation (±2000 steps)
          const variation = Math.floor(Math.random() * 4000 - 2000);
          return baseSteps + variation;
        };

        acc[weekNumber] = {
          weekNumber,
          startDate: weekStart,
          endDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
          days: Array.from({ length: 7 }, (_, i) => {
            const dayDate = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
            const dailySteps = generateDailySteps();
            return {
              id: dayDate.toISOString(),
              date: dayDate,
              steps: dailySteps,
              carbonCredits: (dailySteps * 100 / 10000).toFixed(2),
              potentialTokens: ((dailySteps * 100 / 1000) + ((dailySteps * 100 / 10000) * 100)).toFixed(2)
            };
          }),
          totalSteps: 0,
          carbonCredits: 0,
          potentialTokens: 0,
          carbonSaved: 0,
          treesEquivalent: 0,
          claimed: false
        };

        // Calculate week totals
        acc[weekNumber].totalSteps = acc[weekNumber].days.reduce((sum, day) => sum + day.steps, 0);
        acc[weekNumber].carbonCredits = (acc[weekNumber].totalSteps * 100 / 10000).toFixed(2);
        acc[weekNumber].potentialTokens = ((acc[weekNumber].totalSteps * 100 / 1000) + (parseFloat(acc[weekNumber].carbonCredits) * 100)).toFixed(2);
        acc[weekNumber].carbonSaved = (parseFloat(acc[weekNumber].carbonCredits) * 0.5).toFixed(2);
        acc[weekNumber].treesEquivalent = Math.floor(parseFloat(acc[weekNumber].carbonCredits) / 10);
      }

      // Update with actual data if available
      const dayIndex = date.getDay() - 1;
      const adjustedIndex = dayIndex < 0 ? 6 : dayIndex;
      
      if (entry.steps > 0) {
        acc[weekNumber].days[adjustedIndex] = {
          ...acc[weekNumber].days[adjustedIndex],
          steps: entry.steps,
          carbonCredits: (entry.steps * 100 / 10000).toFixed(2),
          potentialTokens: ((entry.steps * 100 / 1000) + ((entry.steps * 100 / 10000) * 100)).toFixed(2),
          date: date,
          id: date.toISOString()
        };

        // Recalculate week totals when actual data is added
        acc[weekNumber].totalSteps = acc[weekNumber].days.reduce((sum, day) => sum + day.steps, 0);
        acc[weekNumber].carbonCredits = (acc[weekNumber].totalSteps * 100 / 10000).toFixed(2);
        acc[weekNumber].potentialTokens = ((acc[weekNumber].totalSteps * 100 / 1000) + (parseFloat(acc[weekNumber].carbonCredits) * 100)).toFixed(2);
        acc[weekNumber].carbonSaved = (parseFloat(acc[weekNumber].carbonCredits) * 0.5).toFixed(2);
        acc[weekNumber].treesEquivalent = Math.floor(parseFloat(acc[weekNumber].carbonCredits) / 10);
            }

      return acc;
    }, {});
  }, [healthData]);

  // Update selected week when health data changes
  useEffect(() => {
    // Select the most recent week when weekly data is available
    if (Object.keys(weeklyData).length > 0) {
      setSelectedWeek(Math.max(...Object.keys(weeklyData)));
    }
  }, [weeklyData]);

  // Sjekk hvilke uker som er claimed for gjeldende konto når contract endres
  useEffect(() => {
    const checkClaimedWeeks = async () => {
      if (!contract || !window.ethereum) return;
      
      try {
        const weekNumbers = Object.keys(weeklyData);
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) return;
        
        const userAddress = accounts[0];
        const claimed = {};
        
        for (const weekNum of weekNumbers) {
          try {
            const stats = await contract.getWeeklyStats(userAddress, weekNum);
            if (stats && stats[3]) { // claimed status
              claimed[weekNum] = true;
            }
          } catch (error) {
            console.log(`Error checking claimed status for week ${weekNum}:`, error);
            // Fortsett til neste uke ved feil
          }
        }
        
        setClaimedWeeks(claimed);
      } catch (error) {
        console.error("Error checking claimed weeks:", error);
      }
    };
    
    checkClaimedWeeks();
  }, [contract, weeklyData]);

  // Funksjon for å sende stegdata til smart-kontrakten
  const handleSubmitSteps = async (weekNum) => {
    if (!contract || !window.ethereum) {
      setSnackbar({
        open: true,
        message: "Wallet not connected or contract not loaded",
        severity: "error"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const weekData = weeklyData[weekNum];
      if (!weekData) {
        setSnackbar({
          open: true,
          message: "No data found for selected week",
          severity: "error"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Sjekk om steg allerede er sendt for denne uken
      try {
        const weeklyStats = await contract.getWeeklyStats(window.ethereum.selectedAddress, weekNum);
        console.log("Weekly stats:", weeklyStats);

        if (weeklyStats && Number(weeklyStats[0]) > 0) {
          setSnackbar({
            open: true,
            message: "Steps already submitted for this week",
            severity: "warning"
          });
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.log("Error checking if steps are submitted:", error);
        // Fortsett hvis det er en feil - det betyr sannsynligvis at ingen steg er lagt inn ennå
      }
      
      // Hent active account
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        setSnackbar({
          open: true,
          message: "No connected account found",
          severity: "error"
        });
        setIsSubmitting(false);
        return;
      }
      
      const userAddress = accounts[0];
      
      // Send stegdata til kontrakten
      const tx = await contract.submitSteps(
        userAddress,
        Math.round(weekData.totalSteps),
        weekNum
      );
      
      setSnackbar({
        open: true,
        message: "Transaction sent! Waiting for confirmation...",
        severity: "info"
      });
      
      // Vent på at transaksjonen blir bekreftet
      const receipt = await tx.wait();
      
      setSnackbar({
        open: true,
        message: "Steps successfully submitted to the blockchain!",
        severity: "success"
      });
      
      setSubmitDialogOpen(false);
      console.log("Steps submitted:", receipt);
    } catch (error) {
      console.error("Error submitting steps:", error);
      
      let errorMessage = "Error submitting steps";
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = "Transaction was rejected in your wallet";
      } else if (error.message?.includes("Steps already submitted")) {
        errorMessage = "Steps have already been submitted for this week";
      } else if (error.message?.includes("caller is not the owner")) {
        errorMessage = "Only the contract owner can submit steps. Please contact the admin.";
      } else {
        errorMessage = `Error: ${error.message || "Unknown error"}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimRewards = async (weekNum) => {
    if (!contract) {
      alert("Please connect your wallet to claim rewards");
      return;
    }
    
    // Convert weekNum to a number to ensure proper formatting
    weekNum = Number(weekNum);
    setIsClaiming(true);
    
    try {
      // Check if steps have been submitted for this week
      try {
        const weeklyStats = await contract.getWeeklyStats(window.ethereum.selectedAddress, weekNum);
        console.log("Weekly data from contract:", weeklyStats);
        
        if (!weeklyStats || Number(weeklyStats[0]) === 0) {
          setSnackbar({
            open: true,
            message: "No steps have been submitted for this week in the smart contract",
            severity: "warning"
          });
          setIsClaiming(false);
          return;
        }

        if (weeklyStats[3]) {
          setSnackbar({
            open: true,
            message: "Rewards for this week have already been claimed",
            severity: "warning"
          });
          
          // Update UI to reflect claimed status
          setClaimedWeeks(prev => ({
            ...prev,
            [weekNum]: true
          }));
          
          setClaimDialogOpen(false);
          setIsClaiming(false);
          return;
        }
        
        // Claim rewards using the correct function from the contract
        console.log(`Claiming rewards for week ${weekNum}`);
        const tx = await contract.claimWeeklyRewards(weekNum);
        console.log("Transaction sent:", tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        
        // Update claimed weeks status
        setClaimedWeeks(prev => ({
          ...prev,
          [weekNum]: true
        }));
        
        // Close dialog after successful claim
        setClaimDialogOpen(false);
        
        // Get the amount of tokens earned for this week
        const tokenAmount = Number(weeklyStats[2]) / 100; // Tokens are stored with 2 decimal places

        // Notify parent component about claimed tokens
        if (onRewardsClaimed) {
          onRewardsClaimed(tokenAmount);
        }
        
        // Show success message with token amount
        setSnackbar({
          open: true,
          message: `Successfully claimed ${tokenAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GRST tokens for week ${weekNum}!`,
          severity: "success"
        });
      } catch (statsError) {
        console.error("Error checking weekly stats:", statsError);
        setSnackbar({
          open: true,
          message: `Error checking weekly stats: ${statsError.message}`,
          severity: "error"
        });
        setIsClaiming(false);
        return;
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      
      if (error.code === 'ACTION_REJECTED') {
        setSnackbar({
          open: true,
          message: "Transaction was rejected in your wallet. Please try again.",
          severity: "error"
        });
      } else if (error.message?.includes("already claimed")) {
        setSnackbar({
          open: true,
          message: "Rewards for this week have already been claimed.",
          severity: "warning"
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error claiming rewards: ${error.message}`,
          severity: "error"
        });
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Day',
      width: 320,
      valueFormatter: (params) => getDayName(params.value)
    },
    { 
      field: 'steps', 
      headerName: 'Steps', 
      width: 250,
      valueFormatter: (params) => params.value.toLocaleString(),
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: params.value > 0 ? 'success.main' : 'text.secondary' }}>
          {params.value.toLocaleString()}
        </Typography>
      )
    },
    { 
      field: 'carbonCredits', 
      headerName: 'Carbon Credits', 
      width: 250,
      valueFormatter: (params) => params.value.toLocaleString(),
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>
            {params.value.toLocaleString()}
          </Typography>
          <Tooltip title={`Saved ${(params.value * 0.5).toFixed(2)}kg CO2`}>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    },
    { 
      field: 'potentialTokens', 
      headerName: 'Daily Tokens', 
      width: 250,
      valueFormatter: (params) => Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: 'secondary.main' }}>
          {Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GRST
        </Typography>
      )
    }
  ];

  // Get current week's data
  const currentWeekData = selectedWeek ? weeklyData[selectedWeek] : null;
  const dailyRows = currentWeekData?.days || [];

  const getDayName = (date) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIndex = date.getDay() - 1;
    return `${days[dayIndex < 0 ? 6 : dayIndex]} ${date.toLocaleDateString()}`;
  };

  // Calculate totals
  const totalStats = useMemo(() => {
    return Object.values(weeklyData).reduce((acc, week) => ({
      totalSteps: acc.totalSteps + week.totalSteps,
      totalCarbonCredits: acc.totalCarbonCredits + parseFloat(week.carbonCredits),
      totalTokens: acc.totalTokens + parseFloat(week.potentialTokens),
      totalCarbonSaved: acc.totalCarbonSaved + parseFloat(week.carbonSaved),
      totalTrees: acc.totalTrees + week.treesEquivalent
    }), { totalSteps: 0, totalCarbonCredits: 0, totalTokens: 0, totalCarbonSaved: 0, totalTrees: 0 });
  }, [weeklyData]);

  // Configure chart
  const chartOptions = {
    chart: {
      type: 'area',
      style: {
        fontFamily: theme.typography.fontFamily
      },
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Daily Step Progress',
      style: {
        fontSize: '1.2rem',
        fontWeight: '500'
      }
    },
    xAxis: {
      categories: dailyRows.map(day => getDayName(day.date)),
      title: {
        text: null
      },
      labels: {
        style: {
          color: theme.palette.text.secondary
        }
      },
      reversed: false // No need to reverse since we're already ordering from Monday
    },
    yAxis: {
      title: {
        text: 'Steps',
        style: {
          color: theme.palette.text.secondary
        }
      },
      labels: {
        style: {
          color: theme.palette.text.secondary
        }
      },
      gridLineColor: 'rgba(0, 0, 0, 0.1)'
    },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 8,
      shadow: false,
      useHTML: true,
      headerFormat: '<div style="font-size: 0.9rem; font-weight: 600;">{point.key}</div>',
      pointFormat: '<div style="color: {series.color}; font-weight: 500;">{series.name}: {point.y:,.0f}</div>'
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, Highcharts.color('#34C759').setOpacity(0.3).get('rgba')],
            [1, Highcharts.color('#34C759').setOpacity(0).get('rgba')]
          ]
        },
        lineColor: '#34C759',
        marker: {
          fillColor: '#FFFFFF',
          lineWidth: 2,
          lineColor: '#34C759'
        },
        states: {
          hover: {
            lineWidth: 3
          }
        }
      }
    },
    series: [{
      name: 'Steps',
      data: dailyRows.map(day => day.steps),
      color: '#34C759'
    }],
    credits: {
      enabled: false
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(0, 122, 255, 0.1) 100%)',
              height: '100%'
            }}
          >
            <Typography variant="h6" gutterBottom>Total Steps</Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'success.main',
                fontWeight: 600
              }}
            >
              {totalStats.totalSteps.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(0, 122, 255, 0.1) 100%)',
              height: '100%'
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <Typography variant="h6" gutterBottom>Carbon Credits Earned</Typography>
              <Tooltip title={`Carbon Credits = Total Steps / 10000\n${totalStats.totalSteps.toLocaleString()} steps / 10000 = ${Number(totalStats.totalCarbonCredits).toFixed(2)} credits`}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 600
              }}
            >
              {Number(totalStats.totalCarbonCredits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Saved {totalStats.totalCarbonSaved.toFixed(2)}kg CO2
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 149, 0, 0.1) 100%)',
              height: '100%'
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <Typography variant="h6" gutterBottom>Total Potential Tokens</Typography>
              <Tooltip 
                title={
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {`Base Tokens = Total Steps / 1000\n${totalStats.totalSteps.toLocaleString()} steps / 1000 = ${(totalStats.totalSteps / 1000).toFixed(2)} tokens\n\nBonus Tokens = Carbon Credits × 100\n${Number(totalStats.totalCarbonCredits).toFixed(2)} credits × 100 = ${(totalStats.totalCarbonCredits * 100).toFixed(2)} tokens\n\nTotal = Base + Bonus = ${Number(totalStats.totalTokens).toFixed(2)} tokens`}
                  </div>
                }
              >
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'secondary.main',
                fontWeight: 600
              }}
            >
              {Number(totalStats.totalTokens).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ≈ {totalStats.totalTrees} trees worth of impact
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Daily Progress</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Select Week</InputLabel>
                  <Select
                    value={selectedWeek || ''}
                    label="Select Week"
                    onChange={(e) => setSelectedWeek(e.target.value)}
                  >
                    {Object.values(weeklyData)
                      .sort((a, b) => b.weekNumber - a.weekNumber)
                      .map((week) => (
                        <MenuItem key={week.weekNumber} value={week.weekNumber}>
                          Week {week.weekNumber} ({week.startDate.toLocaleDateString()} - {week.endDate.toLocaleDateString()})
                          {claimedWeeks[week.weekNumber] && 
                            <Typography component="span" sx={{ ml: 1, color: 'success.main', fontSize: '0.75rem' }}>
                              ✓ Claimed
                            </Typography>
                          }
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {currentWeekData && (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        setSelectedWeek(currentWeekData.weekNumber);
                        setSubmitDialogOpen(true);
                      }}
                      sx={{ mr: 1 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Steps'}
                    </Button>
                    {!claimedWeeks[currentWeekData?.weekNumber] && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<TrophyIcon />}
                        onClick={() => {
                          setSelectedWeek(currentWeekData.weekNumber);
                          setClaimDialogOpen(true);
                        }}
                        disabled={isClaiming}
                      >
                        {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Box>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                height: '400px',
                mb: 3
              }}
            >
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </Paper>
            <DataGrid
              rows={dailyRows}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 7 } },
              }}
              sx={{
                border: 'none',
                width: '100%',
                '& .MuiDataGrid-cell': {
                  fontSize: '0.9rem',
                  py: 2,
                  px: 3
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'rgba(0, 122, 255, 0.1)',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 3
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 122, 255, 0.05)'
                },
                '& .MuiDataGrid-row:nth-of-type(even)': {
                  backgroundColor: 'rgba(0, 122, 255, 0.02)'
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        open={claimDialogOpen} 
        onClose={() => setClaimDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle>Claim Weekly Rewards</DialogTitle>
        <DialogContent>
          {selectedWeek && weeklyData[selectedWeek] && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are about to claim rewards for Week {selectedWeek}:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • {weeklyData[selectedWeek].totalSteps.toLocaleString()} Total Steps
                </Typography>
                <Typography variant="body2">
                  • {weeklyData[selectedWeek].carbonCredits.toLocaleString()} Carbon Credits
                </Typography>
                <Typography variant="body2">
                  • {weeklyData[selectedWeek].potentialTokens.toLocaleString()} GRST Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Environmental Impact: {weeklyData[selectedWeek].carbonSaved}kg CO2 saved
                  (≈ {weeklyData[selectedWeek].treesEquivalent} trees)
                </Typography>
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleClaimRewards(selectedWeek)}
            variant="contained" 
            color="primary"
          >
            Claim Rewards
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for å sende stegdata til smart-kontrakten */}
      <Dialog 
        open={submitDialogOpen} 
        onClose={() => !isSubmitting && setSubmitDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle>Submit Weekly Steps to Blockchain</DialogTitle>
        <DialogContent>
          {selectedWeek && weeklyData[selectedWeek] && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are about to submit step data for Week {selectedWeek} to the blockchain:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • {weeklyData[selectedWeek].totalSteps.toLocaleString()} Total Steps
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This action can only be performed by the contract owner.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  After submitting steps to the blockchain, you will be able to claim your rewards.
                </Typography>
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={() => handleSubmitSteps(selectedWeek)}
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit to Blockchain'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for meldinger */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default HealthDashboard; 