import { useState } from 'react'
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import HealthDataUpload from './components/HealthDataUpload'
import HealthDashboard from './components/HealthDashboard'
import AndroidHealthConnect from './components/AndroidHealthConnect'
import Web3Connection from './components/Web3Connection'
import './App.css'

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2ecc71',
    },
    secondary: {
      main: '#3498db',
    },
    error: {
      main: '#e74c3c',
    },
  },
});

function App() {
  const [healthData, setHealthData] = useState(null);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  const handleDataUpload = (data) => {
    setHealthData(data);
  };

  const handleHealthConnectData = (data) => {
    setHealthData(data);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <h1>Health Data Dashboard</h1>
        
        <AndroidHealthConnect onDataReceived={handleHealthConnectData} />
        <HealthDataUpload onDataUpload={handleDataUpload} />
        <Web3Connection contractAddress={contractAddress} />
        
        {healthData && <HealthDashboard healthData={healthData} />}
      </Container>
    </ThemeProvider>
  )
}

export default App
