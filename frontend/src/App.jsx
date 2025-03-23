import { useState } from 'react'
import { Container, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Box, Typography } from '@mui/material'
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
  shape: {
    borderRadius: 12,
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
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                    mb: 0.5,
                    background: 'linear-gradient(135deg, #34C759 0%, #007AFF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                  }}
                >
                  GreenSteps
                </Typography>
                <Typography 
                  variant="subtitle2"
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    letterSpacing: '-0.01em',
                    fontWeight: 400,
                    opacity: 0.85,
                  }}
                >
                  Get Fit. Go Green. Earn Rewards.
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 0 }}>
                <Web3Connection contractAddress={contractAddress} />
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Toolbar /> {/* Spacer for fixed AppBar */}
        
        <Container 
          maxWidth="lg" 
          sx={{ 
            flexGrow: 1, 
            mt: { xs: 3, sm: 5 },
            mb: { xs: 3, sm: 5 },
            px: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: { xs: 3, sm: 4 },
            alignItems: 'start' 
          }}>
            <Box sx={{ 
              bgcolor: 'background.paper',
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
            }}>
              <AndroidHealthConnect onDataReceived={handleHealthConnectData} />
            </Box>
            <Box sx={{ 
              bgcolor: 'background.paper',
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
            }}>
              <HealthDataUpload onDataUpload={handleDataUpload} />
            </Box>
          </Box>

          {healthData && (
            <Box sx={{ mt: { xs: 3, sm: 4 } }}>
              <Typography 
                variant="h2" 
                gutterBottom
                sx={{ 
                  color: 'text.primary',
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  fontWeight: 500,
                  letterSpacing: '-0.01em'
                }}
              >
                Your Health Analytics
              </Typography>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
              }}>
                <HealthDashboard healthData={healthData} />
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
