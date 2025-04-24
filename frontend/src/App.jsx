import { useState, useEffect } from 'react'
import { Container, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Box, Typography, Button, Snackbar, Alert } from '@mui/material'
import HealthDataUpload from './components/HealthDataUpload'
import HealthDashboard from './components/HealthDashboard'
import Web3Connection from './components/Web3Connection'
import './App.css'

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // Apple blue
      dark: '#0056b3',
      light: '#47a3ff',
    },
    secondary: {
      main: '#5856D6', // Apple purple
      dark: '#4644b8',
      light: '#7675e0',
    },
    error: {
      main: '#FF3B30', // Apple red
      dark: '#d63229',
      light: '#ff6259',
    },
    success: {
      main: '#34C759', // Apple green
      dark: '#28a347',
      light: '#5cd278',
    },
    background: {
      default: '#F5F5F7', // Apple light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1D1D1F', // Apple dark gray
      secondary: '#86868B', // Apple secondary text
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '2rem',
          paddingBottom: '2rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
});

function App() {
  const [healthData, setHealthData] = useState(null);
  const [showUpload, setShowUpload] = useState(true);
  const [contract, setContract] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [error, setError] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [account, setAccount] = useState(null);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  // Track scroll position to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      // Only show header when at the top (position 0)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowHeader(scrollTop === 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDataUpload = (data) => {
    if (!walletConnected) {
      setError('Please connect your wallet before uploading data');
      return;
    }
    setHealthData(data);
    setShowUpload(false);
  };

  const handleRemoveData = () => {
    setHealthData(null);
    setShowUpload(true);
  };

  const handleWeb3Connect = (connection) => {
    setContract(connection.contract);
    setAccount(connection.account);
    setWalletConnected(connection.account !== null);
    
    // If wallet is disconnected and we have data, remove the dashboard
    if (!connection.account && healthData) {
      setHealthData(null);
      setShowUpload(true);
    }
  };

  // Denne funksjonen mottar tokens-mengden fra HealthDashboard når belønninger kreves.
  // Web3Connection-komponenten viser allerede saldoen, så vi trenger ikke å lagre det separat.
  const handleRewardsClaimed = () => {
    // Vi trenger ikke å gjøre noe her siden Web3Connection automatisk oppdaterer saldoen
    console.log('Rewards claimed successfully');
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        flexGrow: 1, 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}>
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease',
            opacity: showHeader ? 1 : 0,
            transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
            visibility: showHeader ? 'visible' : 'hidden'
          }}
        >
          <Container maxWidth="lg">
            <Toolbar 
              sx={{ 
                justifyContent: 'space-between',
                minHeight: { xs: '72px', sm: '80px' },
                px: { xs: 2, sm: 3 }
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'flex-start', sm: 'flex-start' }
                }}
              >
                <Typography 
                  variant="h1" 
                  component="div" 
                  sx={{ 
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                    mb: 0.5,
                    background: 'linear-gradient(135deg, #34C759 0%, #007AFF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }}
                >
                  GreenSteps
                </Typography>
                <Typography 
                  variant="subtitle1"
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    letterSpacing: '-0.01em',
                    fontWeight: 400,
                    opacity: 0.85
                  }}
                >
                  Track Your Steps, Earn Green Rewards
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Web3Connection contractAddress={contractAddress} onConnect={handleWeb3Connect} />
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        
        <Box
          component="main"
          sx={{ 
            flexGrow: 1, 
            pt: { xs: '100px', sm: '120px' },
            pb: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <Container maxWidth="lg">
            {showUpload && (
              <HealthDataUpload onDataUpload={handleDataUpload} walletConnected={walletConnected} />
            )}
            {healthData && (
              <>
                <HealthDashboard 
                  healthData={healthData} 
                  contract={contract} 
                  account={account}
                  onRewardsClaimed={handleRewardsClaimed}
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveData}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'white'
                      }
                    }}
                  >
                    Remove Data
                  </Button>
                </Box>
              </>
            )}
          </Container>
        </Box>
      </Box>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
