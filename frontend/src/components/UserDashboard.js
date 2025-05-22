import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});

  const timerRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted && hasStarted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted, hasStarted]);

  useEffect(() => {
    axios.get('https://smartquiz-t8un.onrender.com/quiz')
      .then(res => {
        setQuestions(res.data);
        const initialTimers = {};
        res.data.forEach(q => {
          initialTimers[q.id] = q.timer || 30;
        });
        setTimeRemaining(initialTimers);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching quiz:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!hasStarted || submitted || questions.length === 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    const qid = currentQuestion.id;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const updated = { ...prev };
        if (updated[qid] <= 1) {
          clearInterval(timerRef.current);
          updated[qid] = 0;
          setTimeout(() => handleAutoNext(), 500);
        } else {
          updated[qid] -= 1;
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);

  }, [currentIndex, hasStarted, submitted, questions]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleAutoNext = () => {
    const nextIndexForward = questions.findIndex((q, idx) =>
      idx > currentIndex && !answers[q.id] && timeRemaining[q.id] > 0
    );

    if (nextIndexForward !== -1) {
      setCurrentIndex(nextIndexForward);
      return;
    }

    const anyUnansweredIndex = questions.findIndex(q =>
      !answers[q.id] && timeRemaining[q.id] > 0
    );

    if (anyUnansweredIndex !== -1) {
      setCurrentIndex(anyUnansweredIndex);
      return;
    }

    const allTimersZero = questions.every(q => timeRemaining[q.id] === 0);
    if (allTimersZero) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;

    let calculatedScore = 0;
    const responses = [];

    questions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected?.toUpperCase() === q.correct_answer?.toUpperCase();

      if (selected) {
        responses.push({
          question_id: q.id,
          selected_answer: selected,
          is_correct: isCorrect,
        });

        if (isCorrect) calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);
    clearInterval(timerRef.current);

    try {
      await axios.post('https://smartquiz-t8un.onrender.com/submit-quiz', {
        user_id: userId,
        score: calculatedScore,
        responses,
      });
      console.log('✅ Quiz submitted');
    } catch (err) {
      console.error('❌ Failed to submit quiz:', err);
    }
  };

  const pauseCurrentTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const goNext = () => {
    pauseCurrentTimer();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    pauseCurrentTimer();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Logout function: clear user and redirect to landing page "/"
  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) return (
    <div className="loading-container">
      <p>Loading quiz questions...</p>
    </div>
  );

  if (submitted) {
    return (
      <div
        className="result-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100vh',
        }}
      >
        <img
          src="/quizpng.png"
          alt="Logo"
          style={{ height: 150, marginBottom: 20 }}
        />
        <h2>🎉 Thank you for submitting the quiz!</h2>
        <p>
          Your final score: <strong>{score} / {questions.length}</strong>
        </p>

            <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            marginTop: '12px',
            padding: '12px 30px',
            backgroundColor: '#f44336', // red
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.6)',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#d32f2f')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#f44336')}
        >
          Logout
        </button>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '80px auto',
          padding: '30px',
          background: '#ffffff',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          textAlign: 'center',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          animation: 'fadeIn 0.8s ease',
        }}
      >

        <img
          src="\quizpng.png"
          alt="Logo"
          style={{ height: 90, marginRight: 15 }}
        />
        <h2
          style={{
            textAlign: 'left',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#2d3748',
          }}
        >
          📝 Quiz Rules
        </h2>

        <ul
          style={{
            textAlign: 'left',
            color: '#4a5568',
            listStyleType: 'disc',
            paddingLeft: '20px',
            lineHeight: '1.6',
          }}
        >
          <li>You must answer all questions to complete the quiz.</li>
          <li>Each question has only one correct answer.</li>
          <li>Each question has a time limit.</li>
          <li>No negative marking.</li>
          <li>Your final score will be shown after submission.</li>
        </ul>

        <button
          onClick={() => setHasStarted(true)}
          style={{
            marginTop: '30px',
            padding: '14px 36px',
            backgroundColor: 'rgb(36, 236, 43)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 12px rgba(69, 197, 73, 0.4)',
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgb(88, 225, 95)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'rgb(36, 236, 43)';
          }}
        >
          Start Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex] || null;
  const timer = currentQuestion ? (timeRemaining[currentQuestion.id] || 0) : 0;

  if (!currentQuestion) {
    return <p>No question found.</p>;
  }

  const getQuestionStatusColor = (q) => {
    if (answers[q.id]) return '#4caf50'; // green
    if (timeRemaining[q.id] === 0) return '#f44336'; // red
    return '#bbb'; // grey
  };

  return (
    <div className="dashboard-container">
      <div className="quiz-section">
        <header className="quiz-header">
          <h2>Question {currentIndex + 1} of {questions.length}</h2>
          <div className={`timer ${timer <= 5 ? 'warning' : ''}`}>
            ⏰ {timer}s
          </div>
        </header>

        <div className="question-text">
          <p>{currentQuestion.question}</p>
        </div>

        <form className="options-form">
          {['A', 'B', 'C', 'D'].map(option => {
            const optionText = currentQuestion[`option_${option.toLowerCase()}`];
            if (!optionText) return null;
            return (
              <label
                key={option}
                className={`option-label ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question_${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleOptionChange(currentQuestion.id, option)}
                />
                <span>{option}. {optionText}</span>
              </label>
            );
          })}
        </form>

        <footer className="quiz-footer">
          <button
            className="prev-btn"
            onClick={(e) => { e.preventDefault(); goPrev(); }}
            disabled={currentIndex === 0}
          >
            Previous
          </button>

          <button
            className="next-btn"
            onClick={(e) => { e.preventDefault(); goNext(); }}
            disabled={currentIndex === questions.length - 1}
          >
            Next
          </button>
        </footer>
      </div>

      <aside className="status-sidebar">
        <img
          src="\quizpng.png"
          alt="Logo"
          style={{ height: 90, marginRight: 1 }}
        />
        <h3>Status</h3>
        <div className="status-grid">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              title={`Question ${idx + 1}`}
              className={`status-box ${currentIndex === idx ? 'active' : ''}`}
              style={{ backgroundColor: getQuestionStatusColor(q) }}
            >
              {idx + 1}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="submit-btn"
        >
          Submit Quiz
        </button>

        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            marginTop: '12px',
            padding: '12px 30px',
            backgroundColor: '#f44336', // red
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.6)',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#d32f2f')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#f44336')}
        >
          Logout
        </button>
      </aside>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: row;
          height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5;
        }
        .quiz-section {
          flex: 3;
          padding: 32px 48px;
          overflow-y: auto;
          background: white;
          box-shadow: 0 4px 20px rgb(0 0 0 / 0.1);
          border-radius: 16px 0 0 16px;
        }
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .timer {
          font-size: 18px;
          font-weight: 600;
          color: #2f855a;
          transition: color 0.3s ease;
        }
        .timer.warning {
          color: #e53e3e;
          font-weight: 700;
          animation: blink 1s step-start 0s infinite;
        }
        @keyframes blink {
          50% { opacity: 0.3; }
        }
        .question-text p {
          font-size: 20px;
          margin-bottom: 28px;
          color: #1a202c;
          font-weight: 600;
        }
        .options-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .option-label {
          background: #edf2f7;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 17px;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }
        .option-label:hover {
          background-color: #c6f6d5;
        }
        .option-label.selected {
          background-color: #68d391;
          color: white;
          font-weight: 700;
        }
        .option-label input {
          margin-right: 12px;
          cursor: pointer;
        }
        .quiz-footer {
          margin-top: 36px;
          display: flex;
          justify-content: space-between;
        }
        .prev-btn, .next-btn, .submit-btn {
          background-color: #3182ce;
          color: white;
          border: none;
          padding: 14px 34px;
          font-size: 18px;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease;
          box-shadow: 0 6px 14px rgba(66, 153, 225, 0.5);
        }
        .prev-btn:disabled, .next-btn:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
          box-shadow: none;
        }
        .prev-btn:hover:not(:disabled), .next-btn:hover:not(:disabled), .submit-btn:hover {
          background-color: #2b6cb0;
        }
        .status-sidebar {
          flex: 1;
          background-color: white;
          padding: 24px 16px 40px;
          border-radius: 0 16px 16px 0;
          box-shadow: 0 4px 20px rgb(0 0 0 / 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .status-sidebar h3 {
          margin: 18px 0 8px 0;
          font-weight: 700;
          font-size: 22px;
          color: #2d3748;
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(5, 36px);
          grid-gap: 8px;
          margin-bottom: 28px;
        }
        .status-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          text-align: center;
          line-height: 36px;
          font-weight: 700;
          color: white;
          user-select: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
          transition: transform 0.2s ease;
        }
        .status-box:hover {
          transform: scale(1.1);
        }
        .status-box.active {
          border: 2px solid #3182ce;
          box-shadow: 0 6px 18px rgba(49, 130, 206, 0.7);
        }
        .logout-btn {
          /* styles applied inline */
        }
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 20px;
          color: #4a5568;
          font-weight: 600;
        }

       @media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
    height: auto; /* Let it grow naturally */
  }
  .status-sidebar {
    width: 95%;
    height: auto;
    display: flex;
    flex-wrap: wrap;
    padding: 24px 16px;
    border-radius: 0px 0px 0 0; /* Rounded top corners */
    box-shadow: 0 4px 20px rgb(0 0 0 / 0.1);
    margin-bottom: 16px;
  }
  .quiz-section {
    flex: none;
    width: 100%;
    padding: 16px 24px;
    border-radius: 0 0 0px 0px; /* Rounded bottom corners */
  }
  .status-grid {
    justify-content: center; /* center the boxes on small screen */
  }
  .submit-btn,
  .logout-btn {
    width: 95%;
    margin-top: 12px;
    padding: 14px;
  }
}


      `}</style>
    </div>
  );
}

export default UserDashboard;
