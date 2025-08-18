import React, { useState, useEffect } from 'react';

interface ThinkingSpinnerProps {
  className?: string;
  type?: 'recommendations' | 'quiz-generation';
}

const recommendationMessages = [
  "Analyzing your quiz performance...",
  "Thinking about your learning patterns...", 
  "Generating personalized recommendations...",
  "Identifying areas for improvement...",
  "Crafting study suggestions just for you...",
  "Processing your learning data...",
  "Considering the best next steps...",
  "Reviewing knowledge gaps...",
  "Formulating study strategies...",
  "Almost ready with your recommendations..."
];

const quizGenerationMessages = [
  "Understanding your topic...",
  "Thinking about relevant concepts...",
  "Crafting educational questions...",
  "Designing multiple choice options...",
  "Ensuring proper difficulty balance...",
  "Reviewing question quality...",
  "Adding final touches...",
  "Preparing your personalized quiz...",
  "Generating answer explanations...",
  "Almost ready to quiz you..."
];

export const ThinkingSpinner: React.FC<ThinkingSpinnerProps> = ({ className = '', type = 'recommendations' }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = type === 'quiz-generation' ? quizGenerationMessages : recommendationMessages;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`thinking-spinner ${className}`}>
      <div className="spinner-container">
        <div className="spinner"></div>
        <div className="thinking-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
      <div className="thinking-message">
        {messages[messageIndex]}
      </div>
    </div>
  );
};