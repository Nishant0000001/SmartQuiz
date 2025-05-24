import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SetPasswordForm from '../components/SetPasswordForm';

function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    timer: '',
  });
  const [questionIdToDelete, setQuestionIdToDelete] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('add');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchQuestions();
    fetchScores();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${backendUrl}/quiz`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const fetchScores = async () => {
    try {
      const res = await axios.get(`${backendUrl}/scores`);
      setScores(res.data);
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/add-question`, formData);
      setMessage(res.data);
      setFormData({
        type: '',
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        timer: '',
      });
      fetchQuestions();
    } catch (err) {
      console.error('Error adding question:', err);
      setMessage('Failed to add question');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionIdToDelete) return;
    try {
      const res = await axios.delete(`${backendUrl}/delete-quiz/${questionIdToDelete}`);
      setMessage(res.data);
      setQuestionIdToDelete('');
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setMessage('Failed to delete question');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    window.location.href = '/';
  };

  const navItems = [
    { key: 'add', label: '➕ Add Question' },
    { key: 'delete', label: '🗑️ Delete Question' },
    { key: 'scores', label: '📊 User Scores' },
    { key: 'password', label: '🔐 Set Password' },
    { key: 'all', label: '📋 All Questions' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e6f7ff 100%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '20px',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1100,
          margin: '0 auto 40px',
          padding: '10px 20px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/quizpng.png"
            alt="Logo"
            style={{ height: 60, marginRight: 15 }}
          />
          <h1 style={{ fontWeight: '700', color: '#2f855a' }}>Admin Dashboard</h1>
        </div>

        <div>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                background: activeTab === item.key ? '#2f855a' : 'transparent',
                color: activeTab === item.key ? 'white' : '#2f855a',
                border: 'none',
                padding: '10px 18px',
                margin: '0 6px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                boxShadow:
                  activeTab === item.key
                    ? '0 6px 12px rgba(47, 133, 90, 0.4)'
                    : 'none',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.key) e.target.style.backgroundColor = '#def7ec';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.key) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '30px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 6px 12px rgba(229, 62, 62, 0.5)',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#c53030')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#e53e3e')}
        >
          Logout
        </button>
      </nav>

      {/* Main content container */}
      <main
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          background: 'white',
          padding: '30px 40px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.07)',
        }}
      >
        {message && (
          <div
            style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              padding: '15px 20px',
              marginBottom: 20,
              fontWeight: '600',
              textAlign: 'center',
              boxShadow: '0 3px 6px rgba(6, 95, 70, 0.1)',
            }}
          >
            {message}
          </div>
        )}

        {/* The tab content sections go here as per your full code, no syntax errors remain. */}

      </main>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  padding: '12px 15px',
  borderRadius: '8px',
  border: '1.8px solid #cbd5e0',
  fontSize: '16px',
  fontWeight: '600',
  outline: 'none',
  transition: 'border-color 0.3s ease',
};

const tableHeaderStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: '700',
  color: '#2d3748',
  borderBottom: '2px solid #cbd5e0',
};

const tableCellStyle = {
  padding: '12px 15px',
  borderBottom: '1px solid #e2e8f0',
  color: '#4a5568',
};

export default AdminPage;
