import React, { useState, useMemo } from 'react';
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
  InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Info as InfoIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';

const HealthDashboard = ({ healthData, contract }) => {
  const theme = useTheme();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

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
              carbonCredits: Math.floor(dailySteps / 5000),
              potentialTokens: Math.floor(dailySteps / 1000)
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
        acc[weekNumber].carbonCredits = Math.floor(acc[weekNumber].totalSteps / 5000);
        acc[weekNumber].potentialTokens = Math.floor(acc[weekNumber].totalSteps / 1000) + (acc[weekNumber].carbonCredits * 100);
        acc[weekNumber].carbonSaved = (acc[weekNumber].carbonCredits * 0.5).toFixed(2);
        acc[weekNumber].treesEquivalent = Math.floor(acc[weekNumber].carbonCredits / 10);
      }

      // Update with actual data if available
      const dayIndex = date.getDay() - 1;
      const adjustedIndex = dayIndex < 0 ? 6 : dayIndex;
      
      if (entry.steps > 0) {
        acc[weekNumber].days[adjustedIndex] = {
          ...acc[weekNumber].days[adjustedIndex],
          steps: entry.steps,
          carbonCredits: Math.floor(entry.steps / 5000),
          potentialTokens: Math.floor(entry.steps / 1000),
          date: date,
          id: date.toISOString()
        };

        // Recalculate week totals when actual data is added
        acc[weekNumber].totalSteps = acc[weekNumber].days.reduce((sum, day) => sum + day.steps, 0);
        acc[weekNumber].carbonCredits = Math.floor(acc[weekNumber].totalSteps / 5000);
        acc[weekNumber].potentialTokens = Math.floor(acc[weekNumber].totalSteps / 1000) + (acc[weekNumber].carbonCredits * 100);
        acc[weekNumber].carbonSaved = (acc[weekNumber].carbonCredits * 0.5).toFixed(2);
        acc[weekNumber].treesEquivalent = Math.floor(acc[weekNumber].carbonCredits / 10);
      }

      return acc;
    }, {});
  }, [healthData]);

  // Set initial selected week
  useState(() => {
    if (Object.keys(weeklyData).length > 0) {
      setSelectedWeek(Math.max(...Object.keys(weeklyData)));
    }
  }, [weeklyData]);

  const handleClaimRewards = async (weekNum) => {
    if (!contract) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      const tx = await contract.claimWeeklyRewards(weekNum);
      await tx.wait();
      weeklyData[weekNum].claimed = true;
      setClaimDialogOpen(false);
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Failed to claim rewards. Please try again.');
    }
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Day',
      width: 180,
      valueFormatter: (params) => getDayName(params.value)
    },
    { 
      field: 'steps', 
      headerName: 'Steps', 
      width: 150,
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
      width: 150,
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
      width: 150,
      valueFormatter: (params) => params.value.toLocaleString(),
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: 'secondary.main' }}>
          {params.value.toLocaleString()} GRST
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
      totalCarbonCredits: acc.totalCarbonCredits + week.carbonCredits,
      totalTokens: acc.totalTokens + week.potentialTokens,
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
              background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(0, 122, 255, 0.1) 100%)'
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
              background: 'linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(0, 122, 255, 0.1) 100%)'
            }}
          >
            <Typography variant="h6" gutterBottom>Carbon Credits Earned</Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 600
              }}
            >
              {totalStats.totalCarbonCredits.toLocaleString()}
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
              background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 149, 0, 0.1) 100%)'
            }}
          >
            <Typography variant="h6" gutterBottom>Total Tokens Available</Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'secondary.main',
                fontWeight: 600
              }}
            >
              {totalStats.totalTokens.toLocaleString()}
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
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {currentWeekData && !currentWeekData.claimed && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<TrophyIcon />}
                    onClick={() => {
                      setSelectedWeek(currentWeekData.weekNumber);
                      setClaimDialogOpen(true);
                    }}
                  >
                    Claim Week {currentWeekData.weekNumber}
                  </Button>
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
                '& .MuiDataGrid-cell': {
                  fontSize: '0.9rem',
                  py: 2
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'rgba(0, 122, 255, 0.1)',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 122, 255, 0.05)'
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