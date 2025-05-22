import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

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

  // Fetch questions
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

  // Timer logic on question change & start
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
        flexDirection: 'column',   // Stack image and text vertically
        alignItems: 'center',      // Center horizontally
        justifyContent: 'center',  // Center vertically if needed
        textAlign: 'center',       // Center text
        height: '100vh',           // Full height (optional)
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

        <div className="question-box">
          <h3 dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
          <div className="options">
            {['A', 'B', 'C', 'D'].map(opt => (
              <label key={opt} className="option-label">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={opt}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() => handleOptionChange(currentQuestion.id, opt)}
                  disabled={submitted || timeRemaining[currentQuestion.id] === 0}
                />
                <span className="option-text">
                  {opt === 'A' && currentQuestion.option_a}
                  {opt === 'B' && currentQuestion.option_b}
                  {opt === 'C' && currentQuestion.option_c}
                  {opt === 'D' && currentQuestion.option_d}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button onClick={goPrev} disabled={currentIndex === 0} className="nav-btn">
            ← Previous
          </button>

          <button onClick={goNext} disabled={currentIndex === questions.length - 1} className="nav-btn">
            Next →
          </button>
        </div>
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
      </aside>

      {/* Styles */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5;
          margin: 0;
          padding: 0;
        }
        .loading-container, .result-container, .start-container {
          max-width: 600px;
          margin: 80px auto;
          padding: 30px;
          background: white;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          border-radius: 12px;
          text-align: center;
        }
      
        .dashboard-container {
          display: flex;
          gap: 30px;
          padding: 30px;
          max-width: 1100px;
          margin: 40px auto;
        }

        .quiz-section {
          flex: 1.5;
          background: white;
          border-radius: 14px;
          padding: 25px 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          user-select: none;
        }

        .timer {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          transition: color 0.3s ease;
        }

        .timer.warning {
          color: #e53935;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .question-box {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 25px 20px;
          margin-bottom: 25px;
          background: #fafafa;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
        }

        .question-box h3 {
          margin-bottom: 18px;
          color: #222;
          font-weight: 600;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-label {
          display: flex;
          align-items: center;
          background: white;
          padding: 10px 15px;
          border-radius: 8px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.07);
          cursor: pointer;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          user-select: none;
          font-weight: 500;
          color: #333;
        }

        .option-label:hover {
          background-color: #e8f5e9;
          box-shadow: 0 6px 14px rgba(76,175,80,0.3);
        }

        .option-label input[type="radio"] {
          margin-right: 15px;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .option-text {
          flex: 1;
        }

        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
        }

        .nav-btn {
          background-color: #1976d2;
          color: white;
          border: none;
          padding: 12px 25px;
          font-size: 16px;
          border-radius: 25px;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(25,118,210,0.4);
          transition: background-color 0.3s ease;
        }

        .nav-btn:disabled {
          background-color: #a0a0a0;
          cursor: not-allowed;
          box-shadow: none;
        }

        .nav-btn:not(:disabled):hover {
          background-color: #115293;
        }

        .status-sidebar {
          width: 140px;
          background: white;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          user-select: none;
        }

        .status-sidebar h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .status-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          max-height: 65vh;
          overflow-y: auto;
          width: 100%;
          padding-right: 4px;
        }

        .status-box {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          color: white;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease,
          box-shadow 0.2s ease;
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
         }
              .status-box:hover {
      transform: scale(1.15);
      box-shadow: 0 6px 15px rgba(0,0,0,0.25);
    }

    .status-box.active {
      box-shadow: 0 0 12px 3px #1976d2;
      border: 2px solid #1976d2;
    }

    .submit-btn {
      margin-top: 25px;
      width: 100%;
      padding: 12px 0;
      background-color:rgb(58, 218, 34);
      color: white;
      border: none;
      border-radius: 30px;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(58, 211, 47, 0.6);
      transition: background-color 0.3s ease;
      user-select: none;
    }

    .submit-btn:hover {
      background-color:rgb(54, 142, 25);
    }

    @media (max-width: 900px) {
      .dashboard-container {
        flex-direction: column;
        padding: 20px;
      }
      .status-sidebar {
        width: 100%;
        margin-top: 30px;
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        max-height: none;
        overflow-y: visible;
      }
      .status-grid {
        max-height: none;
      }
    }
  `}</style>
</div>
);
}

export default UserDashboard;
