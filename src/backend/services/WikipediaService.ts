export interface WikipediaSearchResult {
  title: string;
  url: string;
  description: string;
}

export interface WikipediaPageContent {
  title: string;
  extract: string;
}

export class WikipediaService {
  private readonly baseUrl = 'https://en.wikipedia.org/w/api.php';
  private readonly requestTimeout = 5000;

  async searchArticles(query: string, limit: number = 5): Promise<WikipediaSearchResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, limit);
      const response = await this.makeRequest(searchUrl);
      return this.parseSearchResults(response);
    } catch (error) {
      console.warn(`❌ [WikipediaService] Search failed for query "${query}":`, error);
      return [];
    }
  }

  async getPageContent(title: string): Promise<WikipediaPageContent | null> {
    try {
      const contentUrl = this.buildContentUrl(title);
      const response = await this.makeRequest(contentUrl);
      return this.parsePageContent(response);
    } catch (error) {
      console.warn(`❌ [WikipediaService] Content retrieval failed for title "${title}":`, error);
      return null;
    }
  }

  private buildSearchUrl(query: string, limit: number): string {
    const params = new URLSearchParams({
      action: 'opensearch',
      search: query,
      limit: limit.toString(),
      namespace: '0',
      format: 'json'
    });
    return `${this.baseUrl}?${params.toString()}`;
  }

  private buildContentUrl(title: string): string {
    const params = new URLSearchParams({
      action: 'query',
      prop: 'extracts',
      titles: title,
      exintro: 'true',
      explaintext: 'true',
      exsectionformat: 'plain',
      format: 'json'
    });
    return `${this.baseUrl}?${params.toString()}`;
  }

  private async makeRequest(url: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AIQuizHelper/1.0 (https://github.com/user/aiquizhelper)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseSearchResults(response: any): WikipediaSearchResult[] {
    if (!Array.isArray(response) || response.length < 4) {
      return [];
    }

    const [, titles, descriptions, urls] = response;
    
    if (!Array.isArray(titles) || !Array.isArray(descriptions) || !Array.isArray(urls)) {
      return [];
    }

    return titles.map((title: string, index: number) => ({
      title,
      description: descriptions[index] || '',
      url: urls[index] || ''
    }));
  }

  private parsePageContent(response: any): WikipediaPageContent | null {
    const pages = response?.query?.pages;
    if (!pages) {
      return null;
    }

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    
    if (!page || page.missing) {
      return null;
    }

    return {
      title: page.title,
      extract: page.extract || ''
    };
  }

  async gatherContentFromQueries(searchQueries: string[], maxArticles: number = 3, minContentLength: number = 50): Promise<WikipediaPageContent[]> {
    const allContent: WikipediaPageContent[] = [];
    
    for (const query of searchQueries) {
      if (allContent.length >= maxArticles) {
        break;
      }
      
      const searchResults = await this.searchArticles(query, 2);
      
      for (const result of searchResults) {
        if (allContent.length >= maxArticles) break;
        
        const content = await this.getPageContent(result.title);
        if (content && content.extract.length > minContentLength) {
          allContent.push(content);
        }
      }
    }
    
    return allContent;
  }
}