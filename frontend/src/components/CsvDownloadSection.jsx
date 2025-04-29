import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import CsvDownloadButton from './CsvDownloadButton';

const CsvDownloadSection = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        my: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(to right, rgba(52, 199, 89, 0.05), rgba(0, 122, 255, 0.05))'
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems="center" 
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Try GreenSteps Demo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Download a CSV template to see how GreenSteps would track your fitness data
            and calculate environmental impact.
          </Typography>
        </Box>
        
        <CsvDownloadButton />
      </Stack>
    </Paper>
  );
};

export default CsvDownloadSection; 