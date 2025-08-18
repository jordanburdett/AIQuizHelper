import axios from 'axios'
import type { 
  GenerateQuizRequest, 
  GenerateQuizResponse, 
  GetQuizResponse,
  SubmitQuizRequest, 
  SubmitQuizResponse,
  GetQuizAttemptResponse,
  GetProgressResponse,
  GetRecommendationsResponse 
} from '@shared/interfaces/ApiResponses'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const quizApi = {
  generateQuiz: async (request: GenerateQuizRequest): Promise<GenerateQuizResponse> => {
    const response = await apiClient.post<GenerateQuizResponse>('/quiz/generate', request)
    return response.data
  },

  getQuiz: async (quizId: string): Promise<GetQuizResponse> => {
    const response = await apiClient.get<GetQuizResponse>(`/quiz/${quizId}`)
    return response.data
  },

  submitQuiz: async (request: SubmitQuizRequest): Promise<SubmitQuizResponse> => {
    const response = await apiClient.post<SubmitQuizResponse>('/quiz/submit', request)
    return response.data
  },

  getQuizAttempt: async (attemptId: string): Promise<GetQuizAttemptResponse> => {
    const response = await apiClient.get<GetQuizAttemptResponse>(`/quiz/attempt/${attemptId}`)
    return response.data
  },
}

export const userApi = {
  getProgress: async (): Promise<GetProgressResponse> => {
    const response = await apiClient.get<GetProgressResponse>('/user/progress')
    return response.data
  },

  getRecommendations: async (): Promise<GetRecommendationsResponse> => {
    const response = await apiClient.get<GetRecommendationsResponse>('/user/recommendations')
    return response.data
  },
}