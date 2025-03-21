import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';

const AndroidHealthConnect = ({ onDataReceived }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      // Check if Health Connect is available
      if ('health' in window) {
        setIsAvailable(true);
      }
    } catch (error) {
      console.error('Error checking Health Connect availability:', error);
    }
  };

  const connectToHealthConnect = async () => {
    try {
      setIsLoading(true);
      
      // Request permissions for steps data
      const permissions = await window.health.requestPermission([
        {
          accessType: 'read',
          dataType: 'StepCount'
        }
      ]);

      if (permissions.granted) {
        setIsConnected(true);
        await fetchHealthData();
      }
    } catch (error) {
      console.error('Error connecting to Health Connect:', error);
      alert('Error connecting to Health Connect. Please make sure it is installed and enabled.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

      // Read steps data for the last 7 days
      const stepsData = await window.health.readRecords('StepCount', {
        timeRangeFilter: {
          startTime: sevenDaysAgo.toISOString(),
          endTime: today.toISOString()
        }
      });

      // Process and format the data
      const processedData = stepsData.map(record => ({
        date: record.startTime.split('T')[0],
        steps: record.count
      }));

      if (onDataReceived) {
        onDataReceived(processedData);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      alert('Error fetching health data. Please try again.');
    }
  };

  if (!isAvailable) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="error">
          Android Health Connect is not available on this device.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please make sure you are using an Android device with Health Connect installed.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Android Health Connect
      </Typography>

      {!isConnected ? (
        <Button
          variant="contained"
          onClick={connectToHealthConnect}
          disabled={isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Connecting...
            </>
          ) : (
            'Connect to Health Connect'
          )}
        </Button>
      ) : (
        <Box>
          <Typography variant="body1" color="success.main" gutterBottom>
            Connected to Health Connect
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchHealthData}
            disabled={isLoading}
            sx={{ mt: 1 }}
          >
            Refresh Health Data
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AndroidHealthConnect; 