import axios from 'axios'
import type { 
  GenerateQuizRequest, 
  GenerateQuizResponse, 
  SubmitQuizRequest, 
  SubmitQuizResponse,
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

  submitQuiz: async (request: SubmitQuizRequest): Promise<SubmitQuizResponse> => {
    const response = await apiClient.post<SubmitQuizResponse>('/quiz/submit', request)
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