import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SetPasswordForm from '../components/SetPasswordForm';
import './AdminPage.css'; // Add this line for external CSS

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

  const inputStyle = {
    flex: 1,
    padding: '12px 15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
  };

  return (
    <div className="admin-container">
      <nav className="admin-navbar">
        <div className="admin-navbar-left">
          <img src="/quizpng.png" alt="Logo" className="admin-logo" />
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-nav-buttons">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`admin-tab-button ${activeTab === item.key ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="admin-main">
        {message && <div className="message-box">{message}</div>}

        {activeTab === 'add' && (
          <section>
            <h2 className="section-title">➕ Add New Question</h2>
            <form onSubmit={handleAddQuestion} className="form-section">
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Type (e.g., MCQ)"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Timer (seconds)"
                  value={formData.timer}
                  onChange={(e) => setFormData({ ...formData, timer: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <textarea
                placeholder="Question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <div className="input-row">
                <input
                  placeholder="Option A"
                  value={formData.option_a}
                  onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  placeholder="Option B"
                  value={formData.option_b}
                  onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="input-row">
                <input
                  placeholder="Option C"
                  value={formData.option_c}
                  onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  placeholder="Option D"
                  value={formData.option_d}
                  onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <input
                placeholder="Correct Answer (a/b/c/d)"
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                required
                maxLength={1}
                style={inputStyle}
              />
              <button type="submit" className="submit-button">Add Question</button>
            </form>
          </section>
        )}

        {activeTab === 'delete' && (
          <section>
            <h2 className="section-title delete">🗑️ Delete Question</h2>
            <p className="delete-desc">Select a Question ID to delete from the list below:</p>
            <select
              value={questionIdToDelete}
              onChange={(e) => setQuestionIdToDelete(e.target.value)}
              className="delete-select"
            >
              <option value="">-- Select Question ID --</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} - {q.question.slice(0, 40)}...
                </option>
              ))}
            </select>
            <button className="submit-button delete" onClick={handleDeleteQuestion}>Delete</button>
          </section>
        )}

        {activeTab === 'password' && <SetPasswordForm backendUrl={backendUrl} setMessage={setMessage} />}

        {activeTab === 'scores' && (
          <section>
            <h2 className="section-title">📊 User Scores</h2>
            <ul className="score-list">
              {scores.map((score) => (
                <li key={score.id} className="score-item">
                  {score.username} — {score.score} points
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'all' && (
          <section>
            <h2 className="section-title">📋 All Questions</h2>
            <ul className="question-list">
              {questions.map((q) => (
                <li key={q.id} className="question-item">
                  <strong>Q{q.id}:</strong> {q.question}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
