import { useState } from 'react'
import { Container, Typography, Box, CssBaseline, Divider } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import HealthDataUpload from './components/HealthDataUpload'
import Web3Connection from './components/Web3Connection'
import AndroidHealthConnect from './components/AndroidHealthConnect'

// Your deployed contract address
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS"; // Replace with actual address after deployment

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // Green color for environmental theme
    },
  },
});

function App() {
  const [web3Data, setWeb3Data] = useState(null);
  const [healthData, setHealthData] = useState(null);

  const handleWeb3Connect = (data) => {
    setWeb3Data(data);
  };

  const handleHealthData = (data) => {
    setHealthData(data);
    if (web3Data?.contract) {
      web3Data.contract.submitStepsToContract(data);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            GreenSteps
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Convert Your Steps into Carbon Credits
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Web3Connection 
              onConnect={handleWeb3Connect}
              contractAddress={CONTRACT_ADDRESS}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <AndroidHealthConnect 
              onDataReceived={handleHealthData}
            />
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ mt: 3 }}>
            <HealthDataUpload 
              onDataUpload={handleHealthData}
            />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
