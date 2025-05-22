import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Paper } from '@mui/material';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7e9, #f5fdf7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 6,
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: 500,
          width: '90%',
          backgroundColor: '#ffffff',
        }}
      >
        <img
          src="/quizpng.png"
          alt="Quiz Logo"
          style={{
            width: '100px',
            marginBottom: '20px',
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: '#2d3748',
            mb: 2,
          }}
        >
           QUIZ!
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#555', mb: 4 }}
        >
          Test your knowledge and challenge yourself with our fun and interactive quizzes!
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin-login')}
          sx={{
            backgroundColor: 'rgb(36, 236, 43)',
            borderRadius: '30px',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '16px',
            m: 1,
            boxShadow: '0 6px 12px rgba(69, 197, 73, 0.4)',
            '&:hover': {
              backgroundColor: 'rgb(88, 225, 95)',
            },
          }}
        >
          👨‍💻 Admin Login
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/user-login')}
          sx={{
            backgroundColor: '#4299e1',
            borderRadius: '30px',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '16px',
            m: 1,
            boxShadow: '0 6px 12px rgba(66, 153, 225, 0.4)',
            '&:hover': {
              backgroundColor: '#3182ce',
            },
          }}
        >
          👤 User Login
        </Button>
      </Paper>
    </Box>
  );
}

export default LandingPage;
