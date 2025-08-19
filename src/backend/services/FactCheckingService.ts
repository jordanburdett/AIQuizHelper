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
    
    try {
      const searchQueries = await this.generateSearchQueries(topic);
      
      const allContent = await this.gatherWikipediaContent(searchQueries);
      
      const context = this.synthesizeContext(allContent);
      
      const result = {
        context,
        sources: allContent.map(content => content.title),
        successful: context.length > 0
      };
      
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
    try {
      return await this.llmProvider.generateSearchQueries(topic);
    } catch (error) {
      console.warn('❌ [FactCheckingService] Search query generation failed, using original topic:', error);
      return [topic];
    }
  }

  private async gatherWikipediaContent(searchQueries: string[]): Promise<WikipediaPageContent[]> {
    try {
      return await this.wikipediaService.gatherContentFromQueries(searchQueries, this.maxArticles, 50);
    } catch (error) {
      console.warn('❌ [FactCheckingService] Wikipedia content gathering failed:', error);
      return [];
    }
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