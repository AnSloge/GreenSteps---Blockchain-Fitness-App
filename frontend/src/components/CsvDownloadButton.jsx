import React from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const CsvDownloadButton = () => {
  const handleDownload = () => {
    // Create CSV content
    const csvHeader = 'date,steps,distanceKM,calories';
    const currentDate = new Date();
    
    // Create sample data for 7 days (past week)
    const sampleData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      
      // Random data for example purposes
      const steps = Math.floor(Math.random() * 5000) + 5000; // Between 5000-10000 steps
      const distanceKM = (steps * 0.0007).toFixed(1); // Rough estimate
      const calories = Math.floor(steps * 0.05); // Rough estimate
      
      sampleData.push(`${formattedDate},${steps},${distanceKM},${calories}`);
    }
    
    // Combine header and data
    const csvContent = [csvHeader, ...sampleData].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'health_data_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
      sx={{ 
        fontSize: '0.75rem',
        textTransform: 'none',
        borderRadius: '20px',
        padding: '4px 12px',
        minWidth: 'auto'
      }}
    >
      CSV Template
    </Button>
  );
};

export default CsvDownloadButton; 