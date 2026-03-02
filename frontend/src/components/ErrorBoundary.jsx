import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging purposes
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error information
    this.setState({
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    // Reset error state to try rendering again
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2
              }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </Typography>
            {this.state.error && (
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'error.dark',
                  textAlign: 'left',
                  overflowX: 'auto'
                }}
              >
                {this.state.error.toString()}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 4,
                py: 1
              }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
