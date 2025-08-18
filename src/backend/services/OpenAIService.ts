import OpenAI from 'openai';
import { Question, QuizAttempt } from '@shared/types/Quiz';
import { LLMProvider, LLMConfig, StudyRecommendation } from '@shared/interfaces/LLMProvider';
import { generateQuestionId } from '../utils/idGenerator';
import { config as appConfig } from '../config/env';

export class OpenAIService implements LLMProvider {
  private openai: OpenAI;
  private config: LLMConfig;

  constructor(config?: LLMConfig) {
    this.config = config || {
      apiKey: appConfig.openai.apiKey,
      model: appConfig.openai.model,
      temperature: 1.0, // Default for GPT-5 Nano (not used in API call)
      maxTokens: 8000, // Higher limit needed for GPT-5 Nano reasoning tokens
    };

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  async generateQuizQuestions(topic: string, count: number = 5): Promise<Question[]> {
    const prompt = this.buildQuestionPrompt(topic, count);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: this.config.maxTokens,
        // Note: GPT-5 Nano uses default temperature (1.0) - no temperature parameter needed
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return this.parseQuestions(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  private buildQuestionPrompt(topic: string, count: number): string {
    return `Generate ${count} multiple choice questions about "${topic}". Each question should have 4 options (A, B, C, D) with exactly one correct answer.

Format your response as valid JSON with this exact structure:
{
  "questions": [
    {
      "question": "What is...?",
      "options": [
        {"id": "a", "text": "Option A text", "value": "a"},
        {"id": "b", "text": "Option B text", "value": "b"},
        {"id": "c", "text": "Option C text", "value": "c"},
        {"id": "d", "text": "Option D text", "value": "d"}
      ],
      "correctAnswer": "a"
    }
  ]
}

Requirements:
- Questions should be educational and appropriate difficulty
- Each option should be plausible but only one correct
- Use proper grammar and clear language
- Make questions specific to the topic
- Return valid JSON only, no additional text`;
  }

  private parseQuestions(content: string): Question[] {
    try {
      const parsed = JSON.parse(content);
      
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
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from AI');
    }
  }

  async generateStudyRecommendations(quizAttempt: QuizAttempt, topic: string): Promise<StudyRecommendation[]> {
    const prompt = this.buildRecommendationPrompt(quizAttempt, topic);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: this.config.maxTokens,
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return this.parseRecommendations(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate study recommendations');
    }
  }

  private buildRecommendationPrompt(quizAttempt: QuizAttempt, topic: string): string {
    const correctAnswers = quizAttempt.answers.filter(a => a.isCorrect).length;
    const totalQuestions = quizAttempt.answers.length;
    const score = quizAttempt.score;
    
    const incorrectQuestions = quizAttempt.answers
      .filter(a => !a.isCorrect)
      .map(a => `Question ID: ${a.questionId}, Selected: ${a.selectedAnswer}`)
      .join('\n');

    return `Analyze this quiz performance and generate personalized study recommendations for the topic "${topic}".

Quiz Performance:
- Score: ${score}% (${correctAnswers}/${totalQuestions} correct)
- Time taken: ${Math.round(quizAttempt.timeTaken / 1000)} seconds
- Incorrect answers: ${incorrectQuestions || 'None - perfect score!'}

Generate 3-5 study recommendations that help improve understanding of areas where the student struggled. Focus on specific subtopics and provide actionable study suggestions.

Format your response as valid JSON with this exact structure:
{
  "recommendations": [
    {
      "topic": "Specific subtopic to focus on",
      "reason": "Why this area needs attention based on quiz performance", 
      "resources": ["Specific study suggestion 1", "Specific study suggestion 2", "Specific study suggestion 3"],
      "priority": "high"
    }
  ]
}

Requirements:
- Use priority levels: "high" for critical gaps, "medium" for improvement areas, "low" for advanced topics
- Make resources specific and actionable (not just "study more")
- Base recommendations on actual performance gaps
- If score is perfect, suggest advanced topics to explore next
- Return valid JSON only, no additional text`;
  }

  private parseRecommendations(content: string): StudyRecommendation[] {
    try {
      const parsed = JSON.parse(content);
      
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
      console.error('Failed to parse OpenAI recommendations response:', error);
      throw new Error('Invalid recommendation response format from AI');
    }
  }
}