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

    const favicon = this.getFaviconUrl(url);

    try {
      let html = '';

      // Try corsproxy.io first (usually more reliable for raw HTML)
      try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
        if (response.ok) {
          html = await response.text();
        }
      } catch (err) {
        console.warn('corsproxy.io failed, trying fallback');
      }

      // Fallback to AllOrigins if first attempt failed
      if (!html) {
        try {
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
          if (response.ok) {
            const data = await response.json();
            html = data.contents;
          }
        } catch (err) {
          console.warn('AllOrigins fallback failed');
        }
      }

      if (!html) return { favicon };

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Extract Title
      let title = doc.querySelector('title')?.innerText ||
        doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');

      // 2. Extract Description
      let description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
        doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');

      // 3. Extract Image
      let image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');

      return {
        favicon,
        title: (title?.trim() || undefined) as string | undefined,
        description: (description?.trim() || undefined) as string | undefined,
        image: (image?.trim() || undefined) as string | undefined
      };
    } catch (error) {
      console.warn('Error fetching link preview:', error);
      return { favicon };
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
