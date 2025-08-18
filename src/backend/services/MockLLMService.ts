import { Question } from '@shared/types/Quiz';
import { LLMProvider } from '@shared/interfaces/LLMProvider';
import { generateQuestionId } from '../utils/idGenerator';

export class MockLLMService implements LLMProvider {
  async generateQuizQuestions(topic: string, count: number = 5): Promise<Question[]> {
    // Mock implementation for testing/development
    const questions: Question[] = [];
    
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: generateQuestionId(),
        question: `Mock question ${i} about ${topic}?`,
        options: [
          { id: 'a', text: 'First option', value: 'a' },
          { id: 'b', text: 'Second option', value: 'b' },
          { id: 'c', text: 'Third option', value: 'c' },
          { id: 'd', text: 'Fourth option', value: 'd' }
        ],
        correctAnswer: 'a'
      });
    }

    return questions;
  }
}