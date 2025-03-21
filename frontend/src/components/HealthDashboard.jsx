import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Box, Paper, Grid } from '@mui/material';

// Initialize Highcharts global settings
Highcharts.setOptions({
  chart: {
    style: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }
  }
});

const HealthDashboard = ({ healthData }) => {
  useEffect(() => {
    // Cleanup function to destroy charts when component unmounts
    return () => {
      const chartIds = ['steps-chart', 'distance-chart', 'calories-chart'];
      chartIds.forEach(id => {
        const charts = Highcharts.charts;
        if (charts) {
          charts.forEach((chart, i) => {
            if (chart && chart.renderTo.id === id) {
              chart.destroy();
              Highcharts.charts[i] = undefined;
            }
          });
        }
      });
    };
  }, []);

  if (!healthData || healthData.length === 0) {
    return null;
  }

  // Calculate KPIs
  const averageSteps = Math.round(
    healthData.reduce((sum, row) => sum + row.steps, 0) / healthData.length
  );
  const averageDistance = (
    healthData.reduce((sum, row) => sum + row.distance, 0) / healthData.length
  ).toFixed(1);
  const averageCalories = Math.round(
    healthData.reduce((sum, row) => sum + row.calories, 0) / healthData.length
  );

  // Chart configurations
  const stepsChartOptions = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Daily Steps'
    },
    xAxis: {
      categories: healthData.map(row => row.date),
      title: { text: 'Date' }
    },
    yAxis: {
      title: { text: 'Steps' },
      min: 0
    },
    series: [{
      name: 'Steps',
      data: healthData.map(row => row.steps),
      color: '#2ecc71'
    }]
  };

  const distanceChartOptions = {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Distance Covered'
    },
    xAxis: {
      categories: healthData.map(row => row.date),
      title: { text: 'Date' }
    },
    yAxis: {
      title: { text: 'Distance (km)' },
      min: 0
    },
    series: [{
      name: 'Distance',
      data: healthData.map(row => row.distance),
      color: '#3498db',
      marker: {
        enabled: true
      }
    }]
  };

  const caloriesChartOptions = {
    chart: {
      type: 'area'
    },
    title: {
      text: 'Calories Burned'
    },
    xAxis: {
      categories: healthData.map(row => row.date),
      title: { text: 'Date' }
    },
    yAxis: {
      title: { text: 'Calories' },
      min: 0
    },
    series: [{
      name: 'Calories',
      data: healthData.map(row => row.calories),
      color: '#e74c3c',
      fillOpacity: 0.3
    }]
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 1 }}>
                Average Daily Steps
              </Box>
              <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71' }}>
                {averageSteps.toLocaleString()}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 1 }}>
                Average Distance
              </Box>
              <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                {averageDistance} km
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 1 }}>
                Average Calories
              </Box>
              <Box sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                {averageCalories}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box id="steps-chart">
            <HighchartsReact
              highcharts={Highcharts}
              options={stepsChartOptions}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box id="distance-chart">
            <HighchartsReact
              highcharts={Highcharts}
              options={distanceChartOptions}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box id="calories-chart">
            <HighchartsReact
              highcharts={Highcharts}
              options={caloriesChartOptions}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default HealthDashboard; 