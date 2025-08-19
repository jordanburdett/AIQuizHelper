import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { quizApi } from '../services/apiClient'
import type { SubmitQuizRequest } from '@shared/interfaces/ApiResponses'

export const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startTime] = useState<number>(Date.now())
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const { data: quizResponse, isLoading, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuiz(quizId!),
    enabled: !!quizId,
  })

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

    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer
    }))

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    submitQuizMutation.mutate({
      quizId,
      answers: formattedAnswers,
      timeTaken
    })
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="loading">Loading quiz...</div>
      </div>
    )
  }

  if (error || !quizResponse?.success || !quizResponse.data) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="error">Failed to load quiz. Please try again.</div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{ marginTop: 16 }}
        >
          Back to Home
        </button>
      </div>
    )
  }

  const quiz = quizResponse.data
  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id])
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  const remainingSeconds = elapsedSeconds % 60

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="hero" style={{ marginBottom: 16 }}>
        <h1 className="hero-title">Quiz: {quiz.topic}</h1>
        <p className="hero-subtitle">Answer all questions to see results and get AI study recommendations.</p>
      </div>
      
      {quiz.factChecked && quiz.factCheckingSources && quiz.factCheckingSources.length > 0 && (
        <div className="card card-elevated" style={{ marginBottom: 16, background: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                Enhanced with Wikipedia Fact-Checking
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d', marginBottom: '8px' }}>
                Questions verified using Wikipedia articles for improved accuracy:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: '#166534' }}>
                {quiz.factCheckingSources.map((source, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    <a 
                      href={`https://en.wikipedia.org/wiki/${encodeURIComponent(source.replace(/ /g, '_'))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#15803d', textDecoration: 'underline' }}
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a202c' }}>
          Time Elapsed: {elapsedMinutes}:{remainingSeconds.toString().padStart(2, '0')}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="card card-elevated question-card">
            <div className="question-meta">Question {index + 1} of {quiz.questions.length}</div>
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