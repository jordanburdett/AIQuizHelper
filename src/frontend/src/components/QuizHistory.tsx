import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { quizApi } from '../services/apiClient'
import { formatDistanceToNow } from 'date-fns'

export const QuizHistory = () => {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: quizApi.getQuizHistory,
  })

  const handleQuizClick = (quizId: string, attemptId?: string) => {
    if (attemptId) {
      navigate(`/results/${attemptId}`)
    } else {
      navigate(`/quiz/${quizId}`)
    }
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
              <h3 className="quiz-history-topic">{quiz.topic}</h3>
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
                  <span className="quiz-questions">{quiz.questionCount} questions</span>
                  {latestAttempt.timeTaken > 0 && (
                    <span className="quiz-time">{Math.round(latestAttempt.timeTaken / 60)} min</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="quiz-history-stats">
                <div className="quiz-not-attempted">
                  <span className="quiz-status">Not attempted yet</span>
                  <span className="quiz-questions">{quiz.questionCount} questions</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
