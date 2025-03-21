import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HealthDataUpload = ({ onDataUpload }) => {
  const [healthData, setHealthData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    title: {
      text: 'Daily Steps'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Steps'
      }
    },
    series: [{
      name: 'Steps',
      data: []
    }]
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = parseHealthData(text);
      setHealthData(data);
      
      // Update chart with new data
      setChartOptions(prevOptions => ({
        ...prevOptions,
        series: [{
          name: 'Steps',
          data: data.map(item => [new Date(item.date).getTime(), item.steps])
        }]
      }));

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
    // Assuming CSV format: date,steps
    const lines = fileContent.split('\n');
    return lines
      .slice(1) // Skip header row
      .filter(line => line.trim())
      .map(line => {
        const [date, steps] = line.split(',');
        return {
          date: date.trim(),
          steps: parseInt(steps.trim(), 10)
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
      
      {healthData && (
        <Box sx={{ mt: 3 }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
          />
        </Box>
      )}
    </Paper>
  );
};

export default HealthDataUpload; 