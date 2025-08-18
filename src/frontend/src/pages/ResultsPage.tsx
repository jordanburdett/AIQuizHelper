import { useParams, Link } from 'react-router-dom'

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent work!'
    if (score >= 80) return 'Great job!'
    if (score >= 70) return 'Good effort!'
    if (score >= 60) return 'Keep practicing!'
    return 'Review the material and try again!'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quiz Results
        </h1>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(mockResults.score)}`}>
          {mockResults.score}%
        </div>
        <p className="text-xl text-gray-600 mb-4">
          {getScoreMessage(mockResults.score)}
        </p>
        <p className="text-gray-600">
          You answered {mockResults.correctAnswers} out of {mockResults.totalQuestions} questions correctly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Score:</span>
              <span className={`font-semibold ${getScoreColor(mockResults.score)}`}>
                {mockResults.score}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span>{mockResults.correctAnswers}/{mockResults.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Taken:</span>
              <span>2 minutes 30 seconds</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI Study Recommendations</h3>
          <ul className="space-y-2">
            {mockResults.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Link to="/" className="btn btn-primary">
          Take Another Quiz
        </Link>
        <Link to="/progress" className="btn btn-secondary">
          View Progress
        </Link>
      </div>
    </div>
  )
}