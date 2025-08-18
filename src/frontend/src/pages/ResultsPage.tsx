import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { quizApi } from '../services/apiClient'
import { ThinkingSpinner } from '../components/ThinkingSpinner'

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

  const getScoreColorHex = (score: number) => {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#ca8a04'
    return '#dc2626'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent work!'
    if (score >= 80) return 'Great job!'
    if (score >= 70) return 'Good effort!'
    if (score >= 60) return 'Keep practicing!'
    return 'Review the material and try again!'
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

      <div className="cards-two" style={{ marginBottom: 16 }}>
        <div className="card card-elevated score-card">
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

        <div className="card card-elevated">
          <h3 className="chart-title" style={{ marginBottom: 10 }}>AI Study Recommendations</h3>
          {isLoadingRecommendations ? (
            <ThinkingSpinner type="recommendations" />
          ) : recommendationsError ? (
            <p style={{ color: '#dc2626', margin: 0 }}>
              Failed to generate recommendations. Please try refreshing the page.
            </p>
          ) : recommendations.length > 0 ? (
            <div className="recommendations">
              {recommendations.map((recommendation, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: recommendation.priority === 'high' ? '#dc2626' : recommendation.priority === 'medium' ? '#ca8a04' : '#16a34a'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: recommendation.priority === 'high' ? '#dc2626' : recommendation.priority === 'medium' ? '#ca8a04' : '#16a34a'
                    }} />
                    {recommendation.topic}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: recommendation.priority === 'high' ? '#fef2f2' : recommendation.priority === 'medium' ? '#fefbeb' : '#f0fdf4',
                      color: recommendation.priority === 'high' ? '#991b1b' : recommendation.priority === 'medium' ? '#92400e' : '#166534'
                    }}>
                      {recommendation.priority}
                    </span>
                  </div>
                  <p style={{ color: '#475569', margin: '0 0 8px 16px', fontSize: 14 }}>
                    {recommendation.reason}
                  </p>
                  <ul style={{ margin: '0 0 0 16px', padding: 0, listStyle: 'none' }}>
                    {recommendation.resources.map((resource, resourceIndex) => (
                      <li key={resourceIndex} className="rec-item" style={{ fontSize: 14 }}>
                        <span className="rec-dot" />
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', margin: 0 }}>
              No specific recommendations needed. Great performance!
            </p>
          )}
        </div>
      </div>

      <div className="results-actions">
        <Link to="/" className="btn btn-primary">Take Another Quiz</Link>
        <Link to="/progress" className="btn btn-secondary">View Progress</Link>
      </div>
    </div>
  )
}