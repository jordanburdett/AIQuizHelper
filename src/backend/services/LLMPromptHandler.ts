import { QuizAttempt } from '@shared/types/Quiz';

export class LLMPromptHandler {
  static buildQuestionPrompt(
    topic: string, 
    count: number, 
    effort?: 'speed' | 'balanced' | 'quality',
    factCheckingContext?: string
  ): string {
    const tone = effort === 'quality' 
      ? 'Provide well-considered, high-quality questions.' 
      : effort === 'speed' 
        ? 'Favor brevity and straightforward questions.' 
        : 'Balance speed and quality.';
    
    let basePrompt = `Generate ${count} multiple choice questions about "${topic}". Each question should have 4 options (A, B, C, D) with exactly one correct answer.`;
    
    if (factCheckingContext) {
      basePrompt += `\n\nFactual Context from Wikipedia:\n${factCheckingContext}\n\nUse this context to ensure questions are factually accurate and well-grounded. Draw upon the provided information when creating questions.`;
    }

    return `${basePrompt}

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

  static buildRecommendationPrompt(quizAttempt: QuizAttempt, topic: string): string {
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

  static buildQuestionExplanationPrompt(question: any, topic: string): string {
    return `You are a helpful tutor explaining a quiz question about ${topic}.

Question: ${question.question}

Options:
${question.options.map((opt: any) => `${opt.value.toUpperCase()}: ${opt.text}`).join('\n')}

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

Use **bold** for emphasis, \`code formatting\` for code examples, and proper line breaks between sections.`;
  }

  static buildSearchQueryPrompt(topic: string): string {
    return `Convert this quiz topic into 1-3 optimal Wikipedia search terms that will find the most relevant factual content.

Topic: "${topic}"

Guidelines:
- Use specific, searchable terms
- Focus on core concepts and proper nouns
- Avoid overly broad or narrow terms
- Prioritize terms likely to have comprehensive Wikipedia articles

Return only the search terms, separated by semicolons.

Examples:
Input: "Ancient Egyptian pyramids"
Output: "Egyptian pyramids;Giza pyramid complex;Ancient Egypt"

Input: "Machine learning algorithms"  
Output: "Machine learning;Artificial neural network;Deep learning"

Search terms:`;
  }
}