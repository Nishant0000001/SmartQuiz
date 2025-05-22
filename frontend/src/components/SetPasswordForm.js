import React, { useState } from 'react';
import axios from 'axios';

function SetPasswordForm({ backendUrl, setMessage }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const apiBase = backendUrl || process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!userId.trim() || !password.trim()) {
      setErrorMessage('Please enter both user ID and password.');
      return;
    }

    try {
      const response = await axios.post(`${apiBase}/set-password`, {
        user_id: userId.trim(),
        password: password.trim(),
      });

      if (response.data.success) {
        setMessage('Password successfully updated.');
        setUserId('');
        setPassword('');
      } else {
        setErrorMessage(response.data.message || 'Failed to set password.');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      setErrorMessage('Error setting password. Please try again later.');
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSetPassword} noValidate>
        <div style={{ marginBottom: 22 }}>
          <label htmlFor="userId" style={labelStyle}>User ID</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
            required
            style={inputStyle}
            autoComplete="off"
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
            style={inputStyle}
            autoComplete="new-password"
          />
        </div>

        {errorMessage && (
          <div role="alert" style={errorStyle}>{errorMessage}</div>
        )}

        <button
          type="submit"
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#276749')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#2f855a')}
        >
          Set Password
        </button>
      </form>
    </div>
  );
}

const containerStyle = {
  maxWidth: 480,
  margin: 'auto',
  backgroundColor: '#f0fff4',
  padding: 30,
  borderRadius: 15,
  boxShadow: '0 8px 20px rgba(72, 187, 120, 0.2)',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 10,
  border: '2px solid #cbd5e0',
  outline: 'none',
  transition: 'border-color 0.3s ease',
  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
};

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 8,
  color: '#276749',
  userSelect: 'none',
};

const errorStyle = {
  backgroundColor: '#fed7d7',
  color: '#742a2a',
  borderRadius: 8,
  padding: '12px 15px',
  marginBottom: 20,
  fontWeight: 600,
  textAlign: 'center',
  userSelect: 'none',
  boxShadow: 'inset 0 0 10px rgba(197, 48, 48, 0.3)',
};

const buttonStyle = {
  width: '100%',
  padding: '14px 0',
  backgroundColor: '#2f855a',
  color: 'white',
  fontSize: 20,
  fontWeight: 700,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  boxShadow: '0 5px 15px rgba(47, 133, 90, 0.4)',
  userSelect: 'none',
  transition: 'background-color 0.3s ease',
};

export default SetPasswordForm;
