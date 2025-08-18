import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { quizApi } from '../services/apiClient'
import { ThinkingSpinner } from '../components/ThinkingSpinner'
import type { GenerateQuizRequest } from '@shared/interfaces/ApiResponses'

export const HomePage = () => {
  const [topic, setTopic] = useState('')
  const [effort, setEffort] = useState<'speed' | 'balanced' | 'quality'>('balanced')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const navigate = useNavigate()

  const { data: configResponse, refetch: refetchConfig } = useQuery({
    queryKey: ['config'],
    queryFn: () => quizApi.getConfig(),
  })

  const setProviderMutation = useMutation({
    mutationFn: (provider: string) => quizApi.setProvider({ provider }),
    onSuccess: () => {
      refetchConfig()
    },
  })

  const config = configResponse?.data
  const showModelSelector = config?.showModelSelector || false
  const showEffortSelection = config?.currentProvider !== 'gemini'
  
  // Set default provider when config loads
  if (config && !selectedProvider) {
    setSelectedProvider(config.defaultProvider)
  }

  const generateQuizMutation = useMutation({
    mutationFn: (request: GenerateQuizRequest) => quizApi.generateQuiz(request),
    onSuccess: (response) => {
      if (response.success && response.data) {
        navigate(`/quiz/${response.data.id}`)
      }
    },
  })

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setProviderMutation.mutate(provider)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      const request: GenerateQuizRequest = { topic: topic.trim() }
      if (showEffortSelection) {
        request.effort = effort
      }
      generateQuizMutation.mutate(request)
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
              {showModelSelector && (
                <div className="form-group">
                  <label htmlFor="model" className="form-label">
                    AI Model
                  </label>
                  <select
                    id="model"
                    className="form-input"
                    value={selectedProvider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                  >
                    {config?.availableProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} ({provider.model})
                      </option>
                    ))}
                  </select>
                  <div className="form-help">
                    Select the AI model to generate your quiz questions.
                  </div>
                </div>
              )}

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

              {showEffortSelection && (
                <div className="form-group mt-4">
                  <label htmlFor="effort" className="form-label">
                    Effort (speed vs quality)
                  </label>
                  <select
                    id="effort"
                    className="form-input"
                    value={effort}
                    onChange={(e) => setEffort(e.target.value as 'speed' | 'balanced' | 'quality')}
                  >
                    <option value="speed">Speed — fastest responses</option>
                    <option value="balanced">Balanced — good trade-off</option>
                    <option value="quality">Quality — best question quality</option>
                  </select>
                  <div className="form-help">
                    Speed reduces depth for quicker generation; Quality increases depth for richer questions.
                  </div>
                </div>
              )}

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
    </div>
  )
}