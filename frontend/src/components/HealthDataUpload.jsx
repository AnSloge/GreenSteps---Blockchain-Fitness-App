import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

const HealthDataUpload = ({ onDataUpload }) => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = parseHealthData(text);
      
      // Call parent callback with processed data
      if (onDataUpload) {
        onDataUpload(data);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please make sure it\'s in the correct format.');
    }
  };

  const parseHealthData = (fileContent) => {
    // Parse CSV format: date,steps,distance_km,calories
    const lines = fileContent.split('\n');
    return lines
      .slice(1) // Skip header row
      .filter(line => line.trim())
      .map(line => {
        const [date, steps, distance, calories] = line.split(',');
        return {
          date: date.trim(),
          steps: parseInt(steps.trim(), 10),
          distance: parseFloat(distance.trim()),
          calories: parseInt(calories.trim(), 10)
        };
      });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Health Data
        </Typography>
        <Button
          variant="contained"
          component="label"
          sx={{ mb: 2 }}
        >
          Upload CSV File
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>
    </Paper>
  );
};

export default HealthDataUpload; 