import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { quizApi } from '../services/apiClient'
import { ThinkingSpinner } from '../components/ThinkingSpinner'
import { QuizHistory } from '../components/QuizHistory'
import type { GenerateQuizRequest } from '@shared/interfaces/ApiResponses'

export const HomePage = () => {
  const [topic, setTopic] = useState('')
  const navigate = useNavigate()

  const generateQuizMutation = useMutation({
    mutationFn: (request: GenerateQuizRequest) => quizApi.generateQuiz(request),
    onSuccess: (response) => {
      if (response.success && response.data) {
        navigate(`/quiz/${response.data.id}`)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      generateQuizMutation.mutate({ topic: topic.trim() })
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">AI Quiz Helper</h1>
        <p className="hero-subtitle">Generate personalized quizzes on any topic using AI</p>
      </div>

      <div className="card card-elevated">
        {generateQuizMutation.isPending ? (
          <ThinkingSpinner type="quiz-generation" />
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="topic" className="form-label">
                  What would you like to be quizzed on?
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., JavaScript fundamentals, World War II, Calculus..."
                  className="form-input input-lg"
                />
              </div>

              <button
                type="submit"
                disabled={!topic.trim()}
                className="btn btn-primary btn-lg w-full"
              >
                Generate Quiz
              </button>
            </form>

            {generateQuizMutation.error && (
              <div className="error mt-4">
                Failed to generate quiz. Please try again.
              </div>
            )}
          </>
        )}
      </div>

      <div className="features">
        <p className="features-subtitle">
          Get 5 personalized multiple-choice questions, instant feedback, and AI-powered study recommendations.
        </p>
        <div className="features-row">
          <div className="feature-pill">✨ AI-Generated</div>
          <div className="feature-pill">📊 Progress Tracking</div>
          <div className="feature-pill">🎯 Personalized</div>
        </div>
      </div>

      <QuizHistory />
    </div>
  )
}