import { useState } from 'react';
import { Quiz, QuizAttempt, UserAnswer } from '@shared/types/Quiz';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { quizApi } from '../services/apiClient';
import ReactMarkdown from 'react-markdown';

interface QuestionReviewProps {
  quiz: Quiz;
  attempt: QuizAttempt;
}

interface QuestionWithAnswer {
  questionNumber: number;
  question: string;
  options: Array<{ id: string; text: string; value: string }>;
  correctAnswer: string;
  userAnswer: UserAnswer;
}

export const QuestionReview = ({ quiz, attempt }: QuestionReviewProps) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  // Map questions with their answers
  const questionsWithAnswers: QuestionWithAnswer[] = quiz.questions.map((question, index) => {
    const userAnswer = attempt.answers.find(a => a.questionId === question.id)!;
    return {
      questionNumber: index + 1,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      userAnswer
    };
  });

  // Sort to show wrong answers first
  const sortedQuestions = [...questionsWithAnswers].sort((a, b) => {
    if (!a.userAnswer.isCorrect && b.userAnswer.isCorrect) return -1;
    if (a.userAnswer.isCorrect && !b.userAnswer.isCorrect) return 1;
    return a.questionNumber - b.questionNumber;
  });

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const explainMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await quizApi.getQuestionExplanation(quiz.id, questionId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to get explanation');
    },
    onSuccess: (data, questionId) => {
      setExplanations(prev => ({ ...prev, [questionId]: data.explanation }));
    }
  });

  const handleExplain = (questionId: string) => {
    if (!explanations[questionId] && !explainMutation.isPending) {
      explainMutation.mutate(questionId);
    }
  };

  return (
    <div className="question-review">
      <h2 className="section-title" style={{ marginBottom: 16 }}>Question Review</h2>
      
      <div className="questions-list">
        {sortedQuestions.map((item) => {
          const isExpanded = expandedQuestions.has(item.userAnswer.questionId);
          const questionId = item.userAnswer.questionId;
          const isCorrect = item.userAnswer.isCorrect;
          const explanation = explanations[questionId];
          
          return (
            <div
              key={questionId}
              className={`question-review-item ${isCorrect ? 'correct' : 'incorrect'}`}
            >
              <button
                className="question-header"
                onClick={() => toggleQuestion(questionId)}
              >
                <div className="question-info">
                  <span className={`status-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="question-number">Question {item.questionNumber}</span>
                  <span className="answer-status">
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="expand-icon">
                  {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
              </button>
              
              {isExpanded && (
                <div className="question-details">
                  <p className="question-text">{item.question}</p>
                  
                  <div className="answer-info">
                    <div className="user-answer">
                      <span className="label">Your answer:</span>
                      <span className={`answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {item.options.find(o => o.value === item.userAnswer.selectedAnswer)?.text}
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div className="correct-answer">
                        <span className="label">Correct answer:</span>
                        <span className="answer correct">
                          {item.options.find(o => o.value === item.correctAnswer)?.text}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!isCorrect && (
                    <div className="explanation-section">
                      {!explanation && (
                        <button
                          className="btn btn-secondary explain-btn"
                          onClick={() => handleExplain(questionId)}
                          disabled={explainMutation.isPending}
                        >
                          {explainMutation.isPending ? 'Getting explanation...' : 'Explain in more detail'}
                        </button>
                      )}
                      
                      {explanation && (
                        <div className="explanation-content">
                          <div className="markdown-content">
                            <ReactMarkdown>
                              {explanation}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
