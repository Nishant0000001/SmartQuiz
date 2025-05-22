import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'user') {
      navigate('/quiz');
    } else {
      alert('Please select a role');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Select Role</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
      <br /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
