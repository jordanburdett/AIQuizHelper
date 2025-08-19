import { WikipediaService, WikipediaPageContent } from './WikipediaService';
import { LLMProvider } from '@shared/interfaces/LLMProvider';

export interface FactCheckingResult {
  context: string;
  sources: string[];
  successful: boolean;
}

export class FactCheckingService {
  private wikipediaService: WikipediaService;
  private llmProvider: LLMProvider;
  private maxArticles: number;
  private contentLimit: number;

  constructor(llmProvider: LLMProvider, maxArticles: number = 3, contentLimit: number = 1000) {
    this.wikipediaService = new WikipediaService();
    this.llmProvider = llmProvider;
    this.maxArticles = maxArticles;
    this.contentLimit = contentLimit;
  }

  async getFactCheckingContext(topic: string): Promise<FactCheckingResult> {
    console.log(`\n🔍 [FactCheckingService] Starting fact-checking process for topic: "${topic}"`);
    
    try {
      const searchQueries = await this.generateSearchQueries(topic);
      console.log(`📝 [FactCheckingService] Generated search queries:`, searchQueries);
      
      const allContent = await this.gatherWikipediaContent(searchQueries);
      console.log(`📚 [FactCheckingService] Gathered content from ${allContent.length} Wikipedia articles:`, 
        allContent.map(c => c.title)
      );
      
      const context = this.synthesizeContext(allContent);
      console.log(`✅ [FactCheckingService] Synthesized context (${context.length} characters)`);
      
      const result = {
        context,
        sources: allContent.map(content => content.title),
        successful: context.length > 0
      };
      
      console.log(`🎯 [FactCheckingService] Fact-checking completed successfully:`, {
        successful: result.successful,
        sourceCount: result.sources.length,
        sources: result.sources,
        contextLength: result.context.length
      });
      
      return result;
    } catch (error) {
      console.error(`❌ [FactCheckingService] Fact-checking failed for topic "${topic}":`, error);
      return {
        context: '',
        sources: [],
        successful: false
      };
    }
  }

  private async generateSearchQueries(topic: string): Promise<string[]> {
    const prompt = this.buildSearchQueryPrompt(topic);
    console.log(`\n🤖 [FactCheckingService] Requesting Gemini to generate Wikipedia search queries`);
    console.log(`📋 [FactCheckingService] User prompt: "${topic}"`);
    
    try {
      const model = this.llmProvider as any;
      if (typeof model.genAI?.getGenerativeModel === 'function') {
        const geminiModel = model.genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
          }
        });
        
        console.log(`📤 [FactCheckingService] Sending to Gemini Flash with prompt:`, prompt);
        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();
        console.log(`📥 [FactCheckingService] Gemini response:`, response);
        
        const queries = this.parseSearchQueries(response);
        console.log(`✨ [FactCheckingService] Parsed search queries:`, queries);
        return queries;
      }
      
      console.log(`⚠️ [FactCheckingService] LLM provider doesn't support Gemini Flash, using original topic`);
      return [topic];
    } catch (error) {
      console.warn('❌ [FactCheckingService] Search query generation failed, using original topic:', error);
      return [topic];
    }
  }

  private buildSearchQueryPrompt(topic: string): string {
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

  private parseSearchQueries(response: string): string[] {
    const cleaned = response.trim().replace(/^Search terms:\s*/i, '');
    return cleaned
      .split(';')
      .map(term => term.trim())
      .filter(term => term.length > 0)
      .slice(0, 3);
  }

  private async gatherWikipediaContent(searchQueries: string[]): Promise<WikipediaPageContent[]> {
    const allContent: WikipediaPageContent[] = [];
    console.log(`\n🌐 [FactCheckingService] Starting Wikipedia content gathering`);
    
    for (const query of searchQueries) {
      if (allContent.length >= this.maxArticles) {
        console.log(`📌 [FactCheckingService] Reached max articles limit (${this.maxArticles}), stopping search`);
        break;
      }
      
      console.log(`🔎 [FactCheckingService] Searching Wikipedia for: "${query}"`);
      const searchResults = await this.wikipediaService.searchArticles(query, 2);
      console.log(`📄 [FactCheckingService] Found ${searchResults.length} results for "${query}":`, 
        searchResults.map(r => r.title)
      );
      
      for (const result of searchResults) {
        if (allContent.length >= this.maxArticles) break;
        
        console.log(`📖 [FactCheckingService] Fetching content for: "${result.title}"`);
        const content = await this.wikipediaService.getPageContent(result.title);
        if (content && content.extract.length > 50) {
          console.log(`✅ [FactCheckingService] Added article: "${content.title}" (${content.extract.length} chars)`);
          allContent.push(content);
        } else {
          console.log(`⏭️ [FactCheckingService] Skipped article: "${result.title}" (insufficient content)`);
        }
      }
    }
    
    console.log(`\n📊 [FactCheckingService] Wikipedia content gathering complete:`, {
      totalArticles: allContent.length,
      articles: allContent.map(c => ({ title: c.title, extractLength: c.extract.length }))
    });
    
    return allContent;
  }

  private synthesizeContext(contents: WikipediaPageContent[]): string {
    if (contents.length === 0) {
      return '';
    }

    let totalLength = 0;
    const synthesized: string[] = [];

    for (const content of contents) {
      const trimmedExtract = content.extract.substring(0, this.contentLimit);
      const formattedContent = `**${content.title}**: ${trimmedExtract}`;
      
      if (totalLength + formattedContent.length > this.contentLimit * 2) {
        break;
      }
      
      synthesized.push(formattedContent);
      totalLength += formattedContent.length;
    }

    return synthesized.join('\n\n');
  }
}