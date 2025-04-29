import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Stack } from '@mui/material';
import CsvDownloadButton from './CsvDownloadButton';

const HealthDataUpload = ({ onDataUpload, walletConnected }) => {
  const [error, setError] = useState(null);

  // Clear error when wallet status changes
  useEffect(() => {
    setError(null);
  }, [walletConnected]);

  const handleFileUpload = (event) => {
    if (!walletConnected) {
      setError('Please connect your wallet before uploading data');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
    try {
        const csvData = e.target.result;
        const lines = csvData.split('\n');

        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            date: values[0],
            steps: parseInt(values[1]) || 0
          };
        }).filter(item => item.date && !isNaN(item.steps));

        onDataUpload(data);
      } catch {
        setError('Error processing file. Please make sure it is a valid CSV file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        gap: 2,
        p: 3,
        border: '2px dashed',
        borderColor: 'primary.main',
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h6" component="div" gutterBottom>
        Upload Your Health Data
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
        {walletConnected 
          ? 'Select a CSV file to upload your health data'
          : 'Please connect your wallet before uploading data'}
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="contained"
          component="label"
          disabled={!walletConnected}
          sx={{
            textTransform: 'none',
            px: 4,
            py: 1
          }}
        >
          Select CSV File
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileUpload}
          />
        </Button>
        
        <CsvDownloadButton />
      </Stack>
      
      <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2 }}>
        Need a template? Download a CSV template file
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default HealthDataUpload; 