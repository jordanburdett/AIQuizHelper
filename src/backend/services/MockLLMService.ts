import { Question, QuizAttempt } from '@shared/types/Quiz';
import { LLMProvider, StudyRecommendation } from '@shared/interfaces/LLMProvider';
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

  async generateStudyRecommendations(quizAttempt: QuizAttempt, topic: string): Promise<StudyRecommendation[]> {
    // Mock implementation for testing/development
    const score = quizAttempt.score;
    
    const recommendations: StudyRecommendation[] = [
      {
        topic: `Advanced ${topic} Concepts`,
        reason: `Based on your ${score}% score, you could benefit from deeper understanding of core principles`,
        resources: [
          'Review fundamental concepts and definitions',
          'Practice with additional exercises',
          'Explore real-world applications'
        ],
        priority: score < 70 ? 'high' : score < 85 ? 'medium' : 'low'
      },
      {
        topic: `${topic} Problem Solving`,
        reason: 'Strengthen analytical skills in this subject area',
        resources: [
          'Work through step-by-step examples',
          'Join study groups or forums',
          'Take practice quizzes'
        ],
        priority: 'medium'
      }
    ];

    return recommendations;
  }
}