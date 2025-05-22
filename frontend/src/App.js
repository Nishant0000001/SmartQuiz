import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';
import AdminDashboard from './components/AdminDashboard';
import UserPage from './components/UserDashboard';
import SetPasswordForm from './components/SetPasswordForm'; // Import your form component

// 🔐 Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin-login" />;
};

// 🔐 Protected Route for User
const ProtectedUserRoute = ({ children }) => {
  const user = localStorage.getItem('userId');
  return user ? children : <Navigate to="/user-login" />;
};

function App() {
  const [message, setMessage] = useState('');
  const backendUrl = 'http://localhost:3000'; // Set your backend URL here

  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/user-login" element={<UserLogin />} />

        {/* ➕ Add SetPasswordForm Route */}
        <Route
          path="/set-password"
          element={
            <>
              {message && (
                <div
                  style={{
                    maxWidth: 480,
                    margin: '15px auto',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontWeight: 600,
                    textAlign: 'center',
                    userSelect: 'none',
                    boxShadow: '0 4px 15px rgba(6, 95, 70, 0.2)',
                  }}
                >
                  {message}
                </div>
              )}
              <SetPasswordForm backendUrl={backendUrl} setMessage={setMessage} />
            </>
          }
        />

        {/* 🔐 Admin Dashboard (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* 👨‍🎓 User Quiz Page (Protected) */}
        <Route
          path="/quiz"
          element={
            <ProtectedUserRoute>
              <UserPage />
            </ProtectedUserRoute>
          }
        />

        {/* ❓ Catch-all: redirect unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
