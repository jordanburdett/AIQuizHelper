import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { quizApi } from '../services/apiClient'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

export const QuizHistory = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [generatingForTopic, setGeneratingForTopic] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: quizApi.getQuizHistory,
  })

  const generateQuizMutation = useMutation({
    mutationFn: (topic: string) => quizApi.generateQuiz({ topic }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['quizHistory'] })
        navigate(`/quiz/${response.data.id}`)
      }
      setGeneratingForTopic(null)
    },
    onError: () => {
      setGeneratingForTopic(null)
    },
  })

  const handleQuizClick = (quizId: string, attemptId?: string) => {
    if (attemptId) {
      navigate(`/results/${attemptId}`)
    } else {
      navigate(`/quiz/${quizId}`)
    }
  }

  const handleRetryQuiz = (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation()
    navigate(`/quiz/${quizId}`)
  }

  const handleNewQuestions = (e: React.MouseEvent, topic: string, quizId: string) => {
    e.stopPropagation()
    setGeneratingForTopic(quizId)
    generateQuizMutation.mutate(topic)
  }

  if (isLoading) {
    return (
      <div className="quiz-history-section">
        <h2 className="section-title">Recent Quizzes</h2>
        <div className="quiz-history-loading">
          <div className="spinner-small"></div>
          <p>Loading quiz history...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.success) {
    return (
      <div className="quiz-history-section">
        <h2 className="section-title">Recent Quizzes</h2>
        <div className="quiz-history-error">
          <p>Failed to load quiz history</p>
        </div>
      </div>
    )
  }

  const quizHistory = data.data || []

  if (quizHistory.length === 0) {
    return null
  }

  return (
    <div className="quiz-history-section">
      <h2 className="section-title">Recent Quizzes</h2>
      <div className="quiz-history-grid">
        {quizHistory.map(({ quiz, latestAttempt }) => (
          <div
            key={quiz.id}
            className="quiz-history-item card card-hover"
            onClick={() => handleQuizClick(quiz.id, latestAttempt?.id)}
          >
            <div className="quiz-history-header">
              <h3 className="quiz-history-topic">
                {quiz.topic}
                {quiz.factChecked && (
                  <span className="fact-checked-badge" title={`Fact-checked with ${quiz.factCheckingSources?.length || 0} Wikipedia sources`}>
                    📚
                  </span>
                )}
              </h3>
              <span className="quiz-history-date">
                {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {latestAttempt ? (
              <div className="quiz-history-stats">
                <div className="quiz-score">
                  <span className="quiz-score-label">Score:</span>
                  <span className={`quiz-score-value ${latestAttempt.score >= 80 ? 'score-high' : latestAttempt.score >= 60 ? 'score-medium' : 'score-low'}`}>
                    {latestAttempt.score}%
                  </span>
                </div>
                <div className="quiz-meta">
                  {latestAttempt.timeTaken > 0 && (
                    <span className="quiz-time">{Math.round(latestAttempt.timeTaken / 60)} min</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="quiz-history-stats">
                <div className="quiz-not-attempted">
                  <span className="quiz-status">Not attempted yet</span>
                </div>
              </div>
            )}
            
            <div className="quiz-history-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => handleRetryQuiz(e, quiz.id)}
                disabled={generatingForTopic !== null}
              >
                Retry
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => handleNewQuestions(e, quiz.topic, quiz.id)}
                disabled={generatingForTopic !== null}
              >
                {generatingForTopic === quiz.id ? 'Generating...' : 'New Questions'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
