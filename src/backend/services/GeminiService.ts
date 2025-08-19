import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, QuizAttempt } from '@shared/types/Quiz';
import { StudyRecommendation } from '@shared/types/User';
import { LLMProvider, LLMConfig } from '@shared/interfaces/LLMProvider';
import { generateQuestionId } from '../utils/idGenerator';
import { config as appConfig } from '../config/env';
import { LLMPromptHandler } from '@shared/utils/LLMPromptHandler';

export class GeminiService implements LLMProvider {
  private genAI: GoogleGenerativeAI;
  private config: LLMConfig;

  constructor(config?: LLMConfig) {
    this.config = config || {
      apiKey: appConfig.gemini.apiKey,
      model: appConfig.gemini.model,
      temperature: 0.7,
      maxTokens: 8192,
    };

    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
  }

  async generateQuizQuestions(
    topic: string, 
    count: number = 5, 
    effort?: 'speed' | 'balanced' | 'quality',
    factCheckingContext?: string
  ): Promise<Question[]> {
    const prompt = LLMPromptHandler.buildQuestionPrompt(topic, count, effort, factCheckingContext);
    
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model,
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 8192,
        }
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No content received from Gemini');
      }

      const questions = this.parseQuestions(content);
      return questions;
    } catch (error) {
      console.error('❌ [GeminiService] Failed to generate quiz questions:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }


  private parseQuestions(content: string): Question[] {
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response format');
      }

      return parsed.questions.map((q: any) => ({
        id: generateQuestionId(),
        question: q.question,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          value: opt.value
        })),
        correctAnswer: q.correctAnswer
      }));
    } catch (error) {
      console.error('❌ [GeminiService] Failed to parse quiz questions response:', error);
      throw new Error('Invalid response format from AI');
    }
  }

  async generateStudyRecommendations(quizAttempt: QuizAttempt, topic: string): Promise<StudyRecommendation[]> {
    const prompt = LLMPromptHandler.buildRecommendationPrompt(quizAttempt, topic);
    
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model,
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 8192,
        }
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No content received from Gemini');
      }

      return this.parseRecommendations(content);
    } catch (error) {
      console.error('❌ [GeminiService] Failed to generate study recommendations:', error);
      throw new Error('Failed to generate study recommendations');
    }
  }


  private parseRecommendations(content: string): StudyRecommendation[] {
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid recommendation response format');
      }

      return parsed.recommendations.map((rec: any) => ({
        topic: rec.topic,
        reason: rec.reason,
        resources: Array.isArray(rec.resources) ? rec.resources : [],
        priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium'
      }));
    } catch (error) {
      console.error('❌ [GeminiService] Failed to parse study recommendations response:', error);
      throw new Error('Invalid recommendation response format from AI');
    }
  }

  async generateSearchQueries(topic: string): Promise<string[]> {
    const prompt = LLMPromptHandler.buildSearchQueryPrompt(topic);

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100,
        }
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const cleaned = response.trim().replace(/^Search terms:\s*/i, '');
      return cleaned
        .split(';')
        .map(term => term.trim())
        .filter(term => term.length > 0)
        .slice(0, 3);
    } catch (error) {
      console.warn('❌ [GeminiService] Search query generation failed, using original topic:', error);
      return [topic];
    }
  }

  async generateQuestionExplanation(question: Question, topic: string): Promise<string> {
    const prompt = LLMPromptHandler.buildQuestionExplanationPrompt(question, topic);

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model,
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 8192,
        }
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const explanation = response.text();
      
      if (!explanation) {
        throw new Error('No explanation generated');
      }

      return explanation.trim();
    } catch (error) {
      console.error('❌ [GeminiService] Failed to generate question explanation:', error);
      throw new Error('Failed to generate explanation for question');
    }
  }
}