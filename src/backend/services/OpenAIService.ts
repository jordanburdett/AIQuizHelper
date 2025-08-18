import OpenAI from 'openai';
import { Question } from '@shared/types/Quiz';
import { LLMProvider, LLMConfig } from '@shared/interfaces/LLMProvider';
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
}