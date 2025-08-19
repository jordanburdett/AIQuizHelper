# Wikipedia Fact-Checking Implementation Guide

## Overview

This document outlines how to implement an optional preprompt fact-checking flow for the AI Quiz Helper application. The feature adds Wikipedia context to quiz generation by:

1. Converting user topics into Wikipedia search queries using Gemini Flash
2. Retrieving relevant Wikipedia content 
3. Augmenting the quiz generation prompt with factual context

## Architecture Design

### Current Quiz Generation Flow
```
User Input (topic) → GeminiService.generateQuizQuestions() → Quiz Questions
```

### Enhanced Flow with Fact-Checking
```
User Input (topic) → 
  WikipediaService.convertTopicToSearchQuery() → 
  WikipediaService.searchWikipedia() → 
  WikipediaService.extractContent() → 
  GeminiService.generateQuizQuestions(topic + context) → 
  Quiz Questions
```

## Implementation Components

### 1. WikipediaService

**File**: `src/backend/services/WikipediaService.ts`

```typescript
export class WikipediaService {
  private geminiService: GeminiService;
  
  async getFactCheckingContext(topic: string): Promise<string> {
    // Convert topic to search query using Gemini Flash
    const searchQuery = await this.convertTopicToSearchQuery(topic);
    
    // Search Wikipedia
    const searchResults = await this.searchWikipedia(searchQuery);
    
    // Get content from top results
    const content = await this.extractContentFromResults(searchResults);
    
    return content;
  }
  
  private async convertTopicToSearchQuery(topic: string): Promise<string> {
    // Use Gemini Flash with optimized prompt for search query generation
  }
  
  private async searchWikipedia(query: string): Promise<WikipediaSearchResult[]> {
    // Use MediaWiki OpenSearch API
  }
  
  private async extractContentFromResults(results: WikipediaSearchResult[]): Promise<string> {
    // Extract and summarize content from top 2-3 articles
  }
}
```

### 2. Wikipedia API Integration

#### OpenSearch Endpoint
- **URL**: `https://en.wikipedia.org/w/api.php`
- **Parameters**:
  - `action=opensearch`
  - `search={query}`
  - `limit=5`
  - `namespace=0`
  - `format=json`

#### Page Content Retrieval
- **URL**: `https://en.wikipedia.org/w/api.php`
- **Parameters**:
  - `action=query`
  - `prop=extracts`
  - `titles={page_title}`
  - `exintro=true`
  - `explaintext=true`
  - `format=json`

### 3. Enhanced GeminiService

**Modifications to**: `src/backend/services/GeminiService.ts`

```typescript
// Add optional context parameter
async generateQuizQuestions(
  topic: string, 
  count: number = 5, 
  effort?: 'speed' | 'balanced' | 'quality',
  factCheckingContext?: string
): Promise<Question[]> {
  const prompt = this.buildQuestionPrompt(topic, count, effort, factCheckingContext);
  // ... rest of implementation
}

private buildQuestionPrompt(
  topic: string, 
  count: number, 
  effort?: string,
  context?: string
): string {
  let basePrompt = `Generate ${count} multiple choice questions about "${topic}".`;
  
  if (context) {
    basePrompt += `\n\nFactual Context from Wikipedia:\n${context}\n\nUse this context to ensure questions are factually accurate and well-grounded.`;
  }
  
  // ... rest of prompt building
}
```

### 4. Configuration & Controls

**Add to**: `src/backend/config/env.ts`

```typescript
export const config = {
  // ... existing config
  wikipedia: {
    enabled: process.env.WIKIPEDIA_FACT_CHECK_ENABLED === 'true',
    maxArticles: parseInt(process.env.WIKIPEDIA_MAX_ARTICLES) || 3,
    contentLimit: parseInt(process.env.WIKIPEDIA_CONTENT_LIMIT) || 1000
  }
};
```

**Add to**: `src/shared/interfaces/ApiResponses.ts`

```typescript
export interface GenerateQuizRequest {
  topic: string;
  effort?: 'speed' | 'balanced' | 'quality';
  enableFactChecking?: boolean; // Optional user control
}
```

## Gemini Flash Query Conversion Strategy

### Prompt for Topic-to-Search Conversion

```typescript
const searchQueryPrompt = `
Convert this quiz topic into 1-3 optimal Wikipedia search terms that will find the most relevant factual content.

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
```

## Rate Limiting & Performance

### Wikipedia API Limits
- **No hard rate limit** for read requests
- **Best Practice**: 1 request per second maximum
- **Recommended**: Implement exponential backoff on rate limit errors

### Performance Optimizations
1. **Caching**: Cache Wikipedia content for common topics (Redis/memory)
2. **Concurrency**: Fetch multiple articles in parallel
3. **Content Limits**: Extract only introductory sections (first 1000 chars)
4. **Timeout Handling**: 5-second timeout for Wikipedia requests

## Error Handling Strategy

```typescript
class WikipediaService {
  async getFactCheckingContext(topic: string): Promise<string> {
    try {
      // Implementation...
      return content;
    } catch (error) {
      console.warn(`Wikipedia fact-checking failed for topic "${topic}":`, error);
      return ''; // Graceful degradation - proceed without context
    }
  }
}
```

## Integration Points

### 1. QuizController Enhancement

**File**: `src/backend/controllers/QuizController.ts`

```typescript
generateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic, effort, enableFactChecking } = req.body as GenerateQuizRequest;
    
    let quiz;
    if (enableFactChecking && config.wikipedia.enabled) {
      quiz = await this.quizService.generateQuizWithFactChecking(topic, effort);
    } else {
      quiz = await this.quizService.generateQuiz(topic, effort);
    }
    
    res.json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};
```

### 2. QuizService Enhancement

**File**: `src/backend/services/QuizService.ts`

```typescript
export class QuizService {
  private wikipediaService: WikipediaService;
  
  constructor(llmProvider?: LLMProvider) {
    this.llmProvider = llmProvider || this.createDefaultProvider();
    this.wikipediaService = new WikipediaService(this.llmProvider);
  }
  
  async generateQuizWithFactChecking(topic: string, effort?: string): Promise<Quiz> {
    const factContext = await this.wikipediaService.getFactCheckingContext(topic);
    const questions = await this.llmProvider.generateQuizQuestions(topic, 5, effort, factContext);
    
    const quiz: Quiz = {
      id: generateQuizId(),
      topic,
      questions,
      createdAt: new Date(),
      factChecked: true // Add flag to indicate fact-checking was used
    };

    const quizModel = new QuizModel(quiz);
    await quizModel.save();
    
    return quiz;
  }
}
```

## Frontend Integration

### Optional UI Controls

**File**: `src/frontend/components/QuizGenerator.tsx`

```tsx
// Add fact-checking toggle
const [enableFactChecking, setEnableFactChecking] = useState(false);

// Include in API request
const generateQuiz = async () => {
  const response = await fetch('/api/quiz/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      topic, 
      effort, 
      enableFactChecking 
    })
  });
  // ...
};
```

## Testing Strategy

### 1. Unit Tests
- Wikipedia API response parsing
- Search query generation accuracy  
- Error handling and graceful degradation
- Content extraction and summarization

### 2. Integration Tests
- End-to-end fact-checking flow
- Performance under various topics
- Rate limiting behavior
- Caching effectiveness

### 3. Example Test Topics
- "World War 2" → Should find comprehensive historical context
- "Machine Learning" → Should find technical definitions and concepts  
- "Photosynthesis" → Should find biological process details
- "Shakespeare" → Should find biographical and literary context

## Deployment Considerations

### Environment Variables
```bash
WIKIPEDIA_FACT_CHECK_ENABLED=true
WIKIPEDIA_MAX_ARTICLES=3
WIKIPEDIA_CONTENT_LIMIT=1000
```

### Monitoring
- Track fact-checking success/failure rates
- Monitor Wikipedia API response times
- Log topics that fail to find relevant content

## Future Enhancements

1. **Multi-language Support**: Extend to other Wikipedia language editions
2. **Source Attribution**: Display Wikipedia sources used in quiz generation
3. **Content Verification**: Cross-reference with multiple sources
4. **Adaptive Caching**: Intelligent cache invalidation based on topic popularity
5. **Quality Scoring**: Rate the relevance of retrieved Wikipedia content

## Cost Analysis

### API Usage Impact
- **Additional Gemini Calls**: 1 extra call per quiz for search query generation
- **Wikipedia API**: Free, no direct cost impact
- **Processing Time**: Estimated 2-3 second increase per quiz generation

### Value Proposition
- Improved factual accuracy of quiz questions
- Enhanced educational value
- Reduced likelihood of incorrect or outdated information
- Better user trust and satisfaction

This implementation provides a robust, optional fact-checking enhancement that maintains the system's performance while adding significant educational value through Wikipedia's comprehensive knowledge base.