export interface LinkPreviewData {
  favicon?: string;
  image?: string;
  title?: string;
  description?: string;
}

class LinkPreviewService {
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  static getFaviconUrl(url: string): string {
    const domain = this.extractDomain(url);
    if (!domain) return '';
    
    // Use Google's favicon service as a reliable fallback
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  }

  static async fetchLinkPreview(url: string): Promise<LinkPreviewData> {
    if (!url || url.trim() === '') {
      return {};
    }

    try {
      const favicon = this.getFaviconUrl(url);
      return {
        favicon,
        image: undefined,
        title: undefined,
        description: undefined
      };
    } catch (error) {
      console.warn('Error fetching link preview:', error);
      return {};
    }
  }

  static getPreviewImage(link: { url: string; favicon?: string }): string | null {
    if (link.favicon) {
      return link.favicon;
    }
    return this.getFaviconUrl(link.url);
  }
}

export default LinkPreviewService;
