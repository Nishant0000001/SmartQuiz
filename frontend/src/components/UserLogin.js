import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/user-login', {
        userId,
        password,
      });

      if (response.data && response.data.user) {
        localStorage.setItem('userId', response.data.user.user_id);
        navigate('/quiz');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid user ID or password.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '20px',

        // Same dashboard-like green gradient background as AdminLogin
        background: 'linear-gradient(135deg,rgb(231, 247, 232) 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '30px',
            fontWeight: '700',
            color: '#1a5c02', // Darker green for title
            marginBottom: '24px',
            userSelect: 'none',
          }}
        >
          👤 User Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '14px 18px',
              marginBottom: '20px',
              borderRadius: '12px',
              border: '2px solid #87c78a',
              fontSize: '17px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#24ec2b')}
            onBlur={(e) => (e.target.style.borderColor = '#87c78a')}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '14px 18px',
              marginBottom: '30px',
              borderRadius: '12px',
              border: '2px solid #87c78a',
              fontSize: '17px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#24ec2b')}
            onBlur={(e) => (e.target.style.borderColor = '#87c78a')}
          />

          <button
            type="submit"
            style={{
              width: '60%',
              padding: '14px',
              backgroundColor: 'rgb(39, 215, 45)',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              boxShadow: '0 6px 14px rgba(69, 197, 73, 0.5)',
              transition: 'background-color 0.3s ease',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgb(88, 225, 95)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgb(36, 236, 43)')}
          >
            Login
          </button>

          {error && (
            <p
              style={{
                color: '#ff4d4f',
                marginTop: '20px',
                fontWeight: '600',
                userSelect: 'none',
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
