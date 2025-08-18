import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { quizApi } from '../services/apiClient'
import type { SubmitQuizRequest } from '@shared/interfaces/ApiResponses'

export const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Mock quiz data - in real app, fetch from API
  const mockQuiz = {
    id: quizId || '',
    topic: 'JavaScript Fundamentals',
    questions: [
      {
        id: '1',
        question: 'What is a key concept in JavaScript Fundamentals?',
        options: [
          { id: 'a', text: 'Variables and Data Types', value: 'a' },
          { id: 'b', text: 'CSS Styling', value: 'b' },
          { id: 'c', text: 'Database Design', value: 'c' },
          { id: 'd', text: 'Network Security', value: 'd' }
        ],
        correctAnswer: 'a'
      }
    ],
    createdAt: new Date()
  }

  const submitQuizMutation = useMutation({
    mutationFn: (request: SubmitQuizRequest) => quizApi.submitQuiz(request),
    onSuccess: (response) => {
      if (response.success && response.data) {
        navigate(`/results/${response.data.attempt.id}`)
      }
    },
  })

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizId) return

    const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer
    }))

    submitQuizMutation.mutate({
      quizId,
      answers: formattedAnswers
    })
  }

  const allQuestionsAnswered = mockQuiz.questions.every(q => answers[q.id])

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="hero" style={{ marginBottom: 16 }}>
        <h1 className="hero-title">Quiz: {mockQuiz.topic}</h1>
        <p className="hero-subtitle">Answer all questions to see results and get AI study recommendations.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {mockQuiz.questions.map((question, index) => (
          <div key={question.id} className="card card-elevated question-card">
            <div className="question-meta">Question {index + 1} of {mockQuiz.questions.length}</div>
            <p className="question-text">{question.question}</p>

            <div className="options-grid">
              {question.options.map((option) => (
                <label key={option.id} className="option-label">
                  <input
                    type="radio"
                    className="option-input"
                    name={`question-${question.id}`}
                    value={option.value}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    disabled={submitQuizMutation.isPending}
                  />
                  <div className="option-content">
                    <span className="option-badge">{option.value.toUpperCase()}</span>
                    <span className="option-text">{option.text}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="quiz-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            disabled={submitQuizMutation.isPending}
          >
            Back to Home
          </button>
          
          <button
            type="submit"
            disabled={!allQuestionsAnswered || submitQuizMutation.isPending}
            className="btn btn-primary"
          >
            {submitQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </form>

      {submitQuizMutation.error && (
        <div className="error mt-4">
          Failed to submit quiz. Please try again.
        </div>
      )}
    </div>
  )
}