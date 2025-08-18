import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { ResultsPage } from './pages/ResultsPage'
import { ProgressPage } from './pages/ProgressPage'
import { Layout } from './components/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/results/:attemptId" element={<ResultsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Routes>
    </Layout>
  )
}

export default App