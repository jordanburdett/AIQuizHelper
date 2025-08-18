import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadarChart,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { userApi } from '../services/apiClient'

export const ProgressPage = () => {
  const { data: progressResponse, isLoading, error } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => userApi.getProgress(),
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="loading">Loading progress data...</div>
      </div>
    )
  }

  if (error || !progressResponse?.success) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="error">Failed to load progress data. Please try again.</div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to Home
        </Link>
      </div>
    )
  }

  const progressData = progressResponse.data || []
  
  // Convert Date objects to strings for display and fix type compatibility
  const displayProgress = progressData.map(item => ({
    ...item,
    lastQuizDate: new Date(item.lastQuizDate).toISOString().split('T')[0]
  }))

  const barData = displayProgress.map((t) => ({ topic: t.topic, average: t.averageScore }))
  const pieData = displayProgress.map((t) => ({ name: t.topic, value: t.totalQuizzes }))
  const radarData = displayProgress.map((t) => ({ subject: t.topic, score: t.averageScore }))

  const pieColors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa']
  const topicsCount = displayProgress.length
  const isManyTopics = topicsCount > 3

  return (
    <div className="container-wide" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div className="hero" style={{ marginBottom: 24 }}>
        <h1 className="hero-title">Your Learning Progress</h1>
        <p className="hero-subtitle">Track your quiz performance across topics over time.</p>
      </div>

      {displayProgress.length === 0 ? (
        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-4">No Quiz History Yet</h3>
          <p className="text-gray-600 mb-6">
            Take your first quiz to start tracking your progress!
          </p>
          <Link to="/" className="btn btn-primary">
            Take a Quiz
          </Link>
        </div>
      ) : (
        <>
          <div className="cards-grid">
            <div className="stat-card">
              <div className="stat-value text-blue-600">
                {displayProgress.reduce((sum, topic) => sum + topic.totalQuizzes, 0)}
              </div>
              <div className="stat-label">Total Quizzes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-green-600">
                {displayProgress.length > 0 ? Math.round(
                  displayProgress.reduce((sum, topic) => sum + topic.averageScore, 0) / displayProgress.length
                ) : 0}%
              </div>
              <div className="stat-label">Overall Average</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-purple-600">{displayProgress.length}</div>
              <div className="stat-label">Topics Studied</div>
            </div>
          </div>

          {isManyTopics ? (
            <>
              <div className="card card-elevated chart-card chart-card--wide">
                <h2 className="chart-title">Average Score by Topic</h2>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="topic" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="average" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-grid-two">
                <div className="card card-elevated chart-card">
                  <h2 className="chart-title">Proficiency by Topic</h2>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <RadarChart data={radarData} outerRadius="70%">
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card card-elevated chart-card">
                  <h2 className="chart-title">Quiz Distribution</h2>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="chart-grid chart-grid-desktop">
              <div className="card card-elevated chart-card">
                <h2 className="chart-title">Average Score by Topic</h2>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="topic" tick={{ fontSize: 12 }} tickMargin={8} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="average" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card card-elevated chart-card">
                <h2 className="chart-title">Proficiency by Topic</h2>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card card-elevated chart-card">
                <h2 className="chart-title">Quiz Distribution</h2>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8 text-center">
        <Link to="/" className="btn btn-primary">
          Take Another Quiz
        </Link>
      </div>
    </div>
  )
}