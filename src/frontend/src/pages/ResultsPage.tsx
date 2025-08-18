import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { quizApi } from '../services/apiClient'
import { QuestionReview } from '../components/QuestionReview'
import { StudyRecommendations } from '../components/StudyRecommendations'

export const ResultsPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()

  const { data: attemptResponse, isLoading, error } = useQuery({
    queryKey: ['quizAttempt', attemptId],
    queryFn: () => quizApi.getQuizAttempt(attemptId!),
    enabled: !!attemptId,
  })

  const { data: recommendationsResponse, isLoading: isLoadingRecommendations, error: recommendationsError } = useQuery({
    queryKey: ['recommendations', attemptId],
    queryFn: () => quizApi.generateRecommendations(attemptId!),
    enabled: !!attemptId && !!attemptResponse?.success,
  })

  const { data: quizResponse, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', attemptResponse?.data?.attempt.quizId],
    queryFn: () => quizApi.getQuiz(attemptResponse!.data!.attempt.quizId),
    enabled: !!attemptResponse?.success && !!attemptResponse?.data?.attempt.quizId,
  })

  const getScoreColorHex = (score: number) => {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#ca8a04'
    return '#dc2626'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent!'
    if (score >= 80) return 'Great job!'
    if (score >= 70) return 'Good work!'
    if (score >= 60) return 'Keep trying!'
    return 'Try again!'
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="loading">Loading results...</div>
      </div>
    )
  }

  if (error || !attemptResponse?.success || !attemptResponse.data) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="error">Failed to load quiz results. Please try again.</div>
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

  const { attempt } = attemptResponse.data
  const recommendations = recommendationsResponse?.success ? recommendationsResponse.data : []
  const totalQuestions = attempt.answers.length
  const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length

  const ringData = [
    { name: 'score', value: attempt.score },
    { name: 'rest', value: 100 - attempt.score },
  ]

  const scoreColor = getScoreColorHex(attempt.score)

  return (
    <div className="container-wide" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="hero" style={{ marginBottom: 16 }}>
        <h1 className="hero-title">Quiz Results</h1>
        <p className="hero-subtitle">Your score and AI-powered next steps</p>
      </div>

      <div className="card card-elevated score-card" style={{ marginBottom: 16 }}>
        <div className="score-ring-wrap">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ringData} dataKey="value" innerRadius={70} outerRadius={90} startAngle={90} endAngle={-270}>
                  <Cell key="score" fill={scoreColor} />
                  <Cell key="rest" fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="score-ring-label">
            <div className="score-percent" style={{ color: scoreColor }}>{attempt.score}%</div>
            <div className="score-message">{getScoreMessage(attempt.score)}</div>
          </div>
        </div>
        <div className="summary-list">
          <div className="summary-row"><span>Correct Answers</span><span>{correctAnswers}/{totalQuestions}</span></div>
          <div className="summary-row"><span>Time Taken</span><span>{attempt.timeTaken > 0 ? `${Math.round(attempt.timeTaken / 60)} minutes` : 'Not tracked'}</span></div>
        </div>
      </div>

      <StudyRecommendations 
        recommendations={recommendations}
        isLoading={isLoadingRecommendations}
        error={recommendationsError}
      />

      {quizResponse?.success && quizResponse.data && (
        <QuestionReview quiz={quizResponse.data} attempt={attempt} />
      )}

      <div className="results-actions">
        <Link to="/" className="btn btn-primary">Take Another Quiz</Link>
        <Link to="/progress" className="btn btn-secondary">View Progress</Link>
      </div>
    </div>
  )
}