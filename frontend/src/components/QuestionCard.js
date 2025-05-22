import React from 'react';

const QuestionCard = ({ question, selected, onSelect }) => {
  return (
    <div className="border p-4 rounded mb-4">
      <p className="font-semibold">{question.id}. {question.question}</p>
      <div className="ml-4 mt-2 space-y-1">
        {['option_a', 'option_b', 'option_c', 'option_d'].map(opt => (
          <div key={opt}>
            <label>
              <input
                type="radio"
                name={`q${question.id}`}
                checked={selected === question[opt]}
                onChange={() => onSelect(question.id, question[opt])}
              /> {question[opt]}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
