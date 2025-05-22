import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    // Fetch quiz questions from backend
    axios.get('http://localhost:3000/quiz') // Your backend API
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => {
        console.error('Error fetching quiz questions:', error);
      });
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null); // Clear selected answer
    setCurrentQuestionIndex(currentQuestionIndex + 1); // Move to next question
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Loading...</div>; // Or a "No more questions" message
  }

  return (
    <div>
      <h2>{currentQuestion.question}</h2>
      <div>
        <button onClick={() => handleAnswerSelect(currentQuestion.option_a)}>{currentQuestion.option_a}</button>
        <button onClick={() => handleAnswerSelect(currentQuestion.option_b)}>{currentQuestion.option_b}</button>
        <button onClick={() => handleAnswerSelect(currentQuestion.option_c)}>{currentQuestion.option_c}</button>
        <button onClick={() => handleAnswerSelect(currentQuestion.option_d)}>{currentQuestion.option_d}</button>
      </div>
      
      <div>
        <p>Selected answer: {selectedAnswer}</p>
      </div>

      <div>
        <button onClick={handleNextQuestion}>Next Question</button>
      </div>
    </div>
  );
}

export default UserPage;
