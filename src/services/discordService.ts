import type { Container, Link } from '../types';

interface DiscordUser {
  name: string;
  photoURL?: string;
  email?: string;
}

class DiscordService {
  /**
   * Sends a beautifully formatted Discord embed to the container's webhook URL
   * when a new link is added to the container.
   */
  static async notifyNewLink(
    container: Container,
    newLink: Link,
    user: DiscordUser
  ): Promise<void> {
    if (!container.discordWebhookUrl) return; // Feature disabled for this container

    try {
      const language = container.discordLanguage || 'en';
      const isTurkish = language === 'tr';

      // Texts based on language preference
      const titleText = isTurkish
        ? `Yeni Link Eklendi: ${container.name}`
        : `New Link Added: ${container.name}`;

      const descriptionText = isTurkish
        ? `**${user.name}** konteynere yeni bir bağlantı ekledi:\n\n**[${newLink.title}](${newLink.url})**\n${newLink.description ? `*${newLink.description}*` : ''}`
        : `**${user.name}** added a new link to the container:\n\n**[${newLink.title}](${newLink.url})**\n${newLink.description ? `*${newLink.description}*` : ''}`;

      let embedColor = 6543249;
      if (container.color) {
        embedColor = parseInt(container.color.replace('#', ''), 16);
      }

      const containerUrl = `${window.location.origin}/container/${container.id}`;

      const payload: any = {
        embeds: [
          {
            title: titleText,
            description: descriptionText + `\n\n[**👉 ${isTurkish ? "Konteyneri Aç" : "Open Container"}**](${containerUrl})`,
            url: containerUrl,
            color: embedColor,
            author: {
              name: "Blink - Your Links, Organized",
              url: window.location.origin
            },
            thumbnail: newLink.favicon ? {
              url: newLink.favicon
            } : undefined,
            footer: {
              text: isTurkish ? "Blink Workspace" : "Blink Workspace"
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      await fetch(container.discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

    } catch (err) {
      console.warn('Failed to send Discord notification:', err);
    }
  }
}

export default DiscordService;
