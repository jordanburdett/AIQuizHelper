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
      maxTokens: 4000, // GPT-5 Nano needs tokens for both reasoning and output
    };

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  async generateQuizQuestions(topic: string, count: number = 5, effort?: 'speed' | 'balanced' | 'quality'): Promise<Question[]> {
    const prompt = this.buildQuestionPrompt(topic, count, effort);
    
    try {
      const tuned = this.tuneByEffort(effort);
      const requestParams: any = {
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
      };
      
      // Try adding reasoning_effort if available
      if (tuned.reasoningEffort) {
        requestParams.reasoning_effort = tuned.reasoningEffort;
      }
      
      const response = await this.openai.chat.completions.create(requestParams);
      
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

  private buildQuestionPrompt(topic: string, count: number, effort?: 'speed' | 'balanced' | 'quality'): string {
    const tone = effort === 'quality' ? 'Provide well-considered, high-quality questions.' : effort === 'speed' ? 'Favor brevity and straightforward questions.' : 'Balance speed and quality.';
    return `Generate ${count} multiple choice questions about "${topic}". Each question should have 4 options (A, B, C, D) with exactly one correct answer.

IMPORTANT: Randomize which option (a, b, c, or d) is correct for each question. Do not always make "a" the correct answer. Distribute correct answers evenly across all options.

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
      "correctAnswer": "b"
    }
  ]
}

Requirements:
- Questions should be educational and appropriate difficulty
- Each option should be plausible but only one correct
- Use proper grammar and clear language
- Make questions specific to the topic
- VARY the correct answer position - use a, b, c, and d roughly equally
- Return valid JSON only, no additional text
- ${tone}`;
  }

  private tuneByEffort(effort?: 'speed' | 'balanced' | 'quality') {
    // Only use reasoning_effort, let the model handle token allocation
    switch (effort) {
      case 'speed':
        return {
          reasoningEffort: 'low' as const,
        };
      case 'quality':
        return {
          reasoningEffort: 'high' as const,
        };
      case 'balanced':
      default:
        return {
          reasoningEffort: 'medium' as const,
        };
    }
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
        max_completion_tokens: this.config.maxTokens ?? null,
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

For the "reason" field, use markdown formatting with **bold** for emphasis and proper structure.

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

  async generateQuestionExplanation(question: Question, topic: string): Promise<string> {
    const prompt = `
You are a helpful tutor explaining a quiz question about ${topic}.

Question: ${question.question}

Options:
${question.options.map(opt => `${opt.value.toUpperCase()}: ${opt.text}`).join('\n')}

Correct Answer: ${question.correctAnswer.toUpperCase()}

Please provide a clear, well-formatted explanation using markdown. Structure your response as follows:

## Correct Answer: ${question.correctAnswer.toUpperCase()}

Explain why this is correct.

## Why Other Options Are Incorrect:

- **Option X**: Explanation
- **Option Y**: Explanation  
- **Option Z**: Explanation

## Key Concepts:

- Important concept 1
- Important concept 2

Use **bold** for emphasis, \`code formatting\` for code examples, and proper line breaks between sections.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert tutor who provides clear, helpful explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        // Remove max_completion_tokens limit for explanations too
      });

      const explanation = response.choices[0]?.message?.content;
      if (!explanation) {
        throw new Error('No explanation generated');
      }

      return explanation.trim();
    } catch (error) {
      console.error('Failed to generate question explanation:', error);
      throw new Error('Failed to generate explanation for question');
    }
  }
}