import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadarChart,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export const ProgressPage = () => {
  // Mock progress data - in real app, fetch from API
  const mockProgress = [
    {
      topic: 'JavaScript Fundamentals',
      totalQuizzes: 5,
      averageScore: 78,
      bestScore: 90,
      lastQuizDate: '2024-03-15'
    },
    {
      topic: 'React Basics',
      totalQuizzes: 3,
      averageScore: 85,
      bestScore: 95,
      lastQuizDate: '2024-03-14'
    },
    {
      topic: 'TypeScript',
      totalQuizzes: 2,
      averageScore: 72,
      bestScore: 80,
      lastQuizDate: '2024-03-13'
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const barData = mockProgress.map((t) => ({ topic: t.topic, average: t.averageScore }))
  const pieData = mockProgress.map((t) => ({ name: t.topic, value: t.totalQuizzes }))
  const radarData = mockProgress.map((t) => ({ subject: t.topic, score: t.averageScore }))

  const pieColors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa']
  const topicsCount = mockProgress.length
  const isManyTopics = topicsCount > 3

  return (
    <div className="container-wide" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div className="hero" style={{ marginBottom: 24 }}>
        <h1 className="hero-title">Your Learning Progress</h1>
        <p className="hero-subtitle">Track your quiz performance across topics over time.</p>
      </div>

      {mockProgress.length === 0 ? (
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
                {mockProgress.reduce((sum, topic) => sum + topic.totalQuizzes, 0)}
              </div>
              <div className="stat-label">Total Quizzes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-green-600">
                {Math.round(
                  mockProgress.reduce((sum, topic) => sum + topic.averageScore, 0) / mockProgress.length
                )}%
              </div>
              <div className="stat-label">Overall Average</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-purple-600">{mockProgress.length}</div>
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