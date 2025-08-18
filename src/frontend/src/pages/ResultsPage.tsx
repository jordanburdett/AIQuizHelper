import { useParams, Link } from 'react-router-dom'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export const ResultsPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>()

  // Mock results data - in real app, fetch from API based on attemptId
  const mockResults = {
    score: 80,
    totalQuestions: 5,
    correctAnswers: 4,
    recommendations: [
      'Review variable declaration patterns and scope rules',
      'Practice with different data types and type conversion',
      'Study function expressions and arrow functions'
    ]
  }

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

  const ringData = [
    { name: 'score', value: mockResults.score },
    { name: 'rest', value: 100 - mockResults.score },
  ]

  const scoreColor = getScoreColorHex(mockResults.score)

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
              <div className="score-percent" style={{ color: scoreColor }}>{mockResults.score}%</div>
              <div className="score-message">{getScoreMessage(mockResults.score)}</div>
            </div>
          </div>
          <div className="summary-list">
            <div className="summary-row"><span>Correct Answers</span><span>{mockResults.correctAnswers}/{mockResults.totalQuestions}</span></div>
            <div className="summary-row"><span>Time Taken</span><span>2 minutes 30 seconds</span></div>
          </div>
        </div>

        <div className="card card-elevated">
          <h3 className="chart-title" style={{ marginBottom: 10 }}>AI Study Recommendations</h3>
          <ul className="recommendations">
            {mockResults.recommendations.map((recommendation, index) => (
              <li key={index} className="rec-item">
                <span className="rec-dot" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="results-actions">
        <Link to="/" className="btn btn-primary">Take Another Quiz</Link>
        <Link to="/progress" className="btn btn-secondary">View Progress</Link>
      </div>
    </div>
  )
}