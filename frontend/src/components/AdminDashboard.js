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

  const backendUrl = 'https://smartquiz-t8un.onrender.com' || 'http://localhost:3000';

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
            src="\quizpng.png"
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

        {/* Add Question */}
        {activeTab === 'add' && (
          <section>
            <h2
              style={{
                marginBottom: 25,
                color: '#276749',
                fontWeight: '700',
                fontSize: '28px',
              }}
            >
              ➕ Add New Question
            </h2>
            <form
              onSubmit={handleAddQuestion}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Type (e.g., MCQ)"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Timer (seconds)"
                  value={formData.timer}
                  onChange={(e) =>
                    setFormData({ ...formData, timer: e.target.value })
                  }
                  required
                  style={inputStyle}
                />
              </div>

              <textarea
                placeholder="Question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                required
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  placeholder="Option A"
                  value={formData.option_a}
                  onChange={(e) =>
                    setFormData({ ...formData, option_a: e.target.value })
                  }
                  required
                  style={inputStyle}
                />
                <input
                  placeholder="Option B"
                  value={formData.option_b}
                  onChange={(e) =>
                    setFormData({ ...formData, option_b: e.target.value })
                  }
                  required
                  style={inputStyle}
                />
                <input
                  placeholder="Option C"
                  value={formData.option_c}
                  onChange={(e) =>
                    setFormData({ ...formData, option_c: e.target.value })
                  }
                  required
                  style={inputStyle}
                />
                <input
                  placeholder="Option D"
                  value={formData.option_d}
                  onChange={(e) =>
                    setFormData({ ...formData, option_d: e.target.value })
                }
                required
                style={inputStyle}
              />
              </div>
          <input
            placeholder="Correct Answer (a/b/c/d)"
            value={formData.correct_answer}
            onChange={(e) =>
              setFormData({ ...formData, correct_answer: e.target.value })
            }
            required
            maxLength={1}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              backgroundColor: '#2f855a',
              color: 'white',
              padding: '14px 0',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(47, 133, 90, 0.4)',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#276749')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#2f855a')}
          >
            Add Question
          </button>
        </form>
      </section>
    )}

    {/* Delete Question */}
    {activeTab === 'delete' && (
      <section>
        <h2
          style={{
            marginBottom: 25,
            color: '#9b2c2c',
            fontWeight: '700',
            fontSize: '28px',
          }}
        >
          🗑️ Delete Question
        </h2>
        <p style={{ marginBottom: 20, color: '#742a2a' }}>
          Select a Question ID to delete from the list below:
        </p>
        <select
          value={questionIdToDelete}
          onChange={(e) => setQuestionIdToDelete(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 15px',
            borderRadius: '8px',
            border: '1px solid #c53030',
            fontSize: '16px',
            marginBottom: 20,
            cursor: 'pointer',
          }}
        >
          <option value="">-- Select Question ID --</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              ID {q.id} : {q.question.slice(0, 40)}...
            </option>
          ))}
        </select>
        <button
          onClick={handleDeleteQuestion}
          disabled={!questionIdToDelete}
          style={{
            backgroundColor: questionIdToDelete ? '#c53030' : '#fbd5d5',
            color: questionIdToDelete ? 'white' : '#742a2a',
            padding: '14px 0',
            width: '100%',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: questionIdToDelete ? 'pointer' : 'not-allowed',
            boxShadow: questionIdToDelete
              ? '0 5px 15px rgba(197, 48, 48, 0.5)'
              : 'none',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (questionIdToDelete) e.target.style.backgroundColor = '#9b2c2c';
          }}
          onMouseLeave={(e) => {
            if (questionIdToDelete) e.target.style.backgroundColor = '#c53030';
          }}
        >
          Delete Selected Question
        </button>
      </section>
    )}

    {/* User Scores */}
    {activeTab === 'scores' && (
      <section>
        <h2
          style={{
            marginBottom: 25,
            color: '#2c5282',
            fontWeight: '700',
            fontSize: '28px',
          }}
        >
          📊 User Scores
        </h2>
        {scores.length === 0 ? (
          <p>No user scores available.</p>
        ) : (
          <div
            style={{
              maxHeight: 400,
              overflowY: 'auto',
              borderRadius: '12px',
              boxShadow: 'inset 0 0 8px rgba(44, 82, 130, 0.15)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '16px',
              }}
            >
              <thead style={{ backgroundColor: '#bee3f8' }}>
                <tr>
                  <th style={tableHeaderStyle}>User ID</th>
                  <th style={tableHeaderStyle}>Score</th>
                  <th style={tableHeaderStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ebf8ff' : 'white',
                    }}
                  >
                    <td style={tableCellStyle}>{score.user_id}</td>
                    <td style={tableCellStyle}>{score.score}</td>
                    <td style={tableCellStyle}>
                      {new Date(score.score_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )}

    {/* Set Password */}
    {activeTab === 'password' && (
      <section>
        <h2
          style={{
            marginBottom: 25,
            color: '#276749',
            fontWeight: '700',
            fontSize: '28px',
          }}
        >
          🔐 Set User Password
        </h2>
        <SetPasswordForm backendUrl='https://smartquiz-t8un.onrender.com' setMessage={setMessage} />
      </section>
    )}

    {/* All Questions */}
    {activeTab === 'all' && (
      <section>
        <h2
          style={{
            marginBottom: 25,
            color: '#2d3748',
            fontWeight: '700',
            fontSize: '28px',
          }}
        >
          📋 All Questions List
        </h2>
        {questions.length === 0 ? (
          <p>No questions available.</p>
        ) : (
          <div
            style={{
              maxHeight: 450,
              overflowY: 'auto',
              borderRadius: '12px',
              boxShadow: 'inset 0 0 10px rgba(45, 55, 72, 0.1)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '15px',
                minWidth: 700,
              }}
            >
              <thead style={{ backgroundColor: '#e2e8f0' }}>
                <tr>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Question</th>
                  <th style={tableHeaderStyle}>Options (A-D)</th>
                  <th style={tableHeaderStyle}>Correct</th>
                  <th style={tableHeaderStyle}>Timer (sec)</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => (
                  <tr
                    key={q.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f7fafc',
                      verticalAlign: 'top',
                    }}
                  >
                    <td style={tableCellStyle}>{q.id}</td>
                    <td style={tableCellStyle}>{q.type}</td>
                    <td style={tableCellStyle}>{q.question}</td>
                    <td style={tableCellStyle}>
                      A: {q.option_a}
                      <br />
                      B: {q.option_b}
                      <br />
                      C: {q.option_c}
                      <br />
                      D: {q.option_d}
                    </td>
                    <td style={tableCellStyle}>{q.correct_answer.toUpperCase()}</td>
                    <td style={tableCellStyle}>{q.timer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )}
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
