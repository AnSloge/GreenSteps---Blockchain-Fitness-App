import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography,
  Box,
  Divider,
  Paper
} from '@mui/material';
import { Close, EmojiEvents } from '@mui/icons-material';

const Leaderboard = ({ open, onClose, tokenBalance, account }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Static friends data - 10 people with much higher GRST amounts to position user near bottom
  const staticFriends = [
    { id: 1, name: 'Emma', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', balance: 1875 },
    { id: 2, name: 'John', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', balance: 1643 },
    { id: 3, name: 'Olivia', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', balance: 1412 },
    { id: 4, name: 'Michael', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', balance: 1242 },
    { id: 5, name: 'Sophia', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', balance: 1087 },
    { id: 6, name: 'David', address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', balance: 923 },
    { id: 7, name: 'Emily', address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9', balance: 778 },
    { id: 8, name: 'James', address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', balance: 626 },
    { id: 9, name: 'Charlotte', address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', balance: 484 },
  ];

  // Update leaderboard data whenever tokenBalance changes or the popup is opened
  useEffect(() => {
    if (open && account && tokenBalance !== undefined) {
      // Create a user entry with the current user's data
      const userEntry = {
        id: 0,
        name: 'You',
        address: account,
        balance: tokenBalance,
        isCurrentUser: true
      };

      // Combine static friends with current user
      const combinedData = [...staticFriends, userEntry];
      
      // Sort by token balance (descending)
      const sortedData = combinedData.sort((a, b) => b.balance - a.balance);
      
      setLeaderboardData(sortedData);
    }
  }, [open, account, tokenBalance]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff, #f5f5f7)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEvents sx={{ color: '#FFD700', mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            GRST Leaderboard
          </Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
          {leaderboardData.map((person, index) => (
            <Paper 
              key={person.id}
              elevation={person.isCurrentUser ? 2 : 0}
              sx={{ 
                mb: 1, 
                bgcolor: person.isCurrentUser ? 'rgba(52, 199, 89, 0.1)' : 'transparent',
                borderRadius: 2,
              }}
            >
              <ListItem alignItems="center">
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%',
                    bgcolor: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 'rgba(0, 0, 0, 0.1)',
                    color: index < 3 ? '#000' : '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    mr: 2
                  }}
                >
                  {index + 1}
                </Box>
                <ListItemAvatar>
                  <Avatar 
                    src={person.isCurrentUser 
                      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=Male-${account}&gender=male` 
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
                    sx={{ 
                      bgcolor: person.isCurrentUser ? 'primary.main' : undefined,
                      border: person.isCurrentUser ? '2px solid #007AFF' : 'none'
                    }} 
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={person.isCurrentUser ? 600 : 400}>
                      {person.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'inline', mr: 1 }}
                      >
                        {person.balance} GRST
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard; 