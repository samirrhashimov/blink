import type { Container, Link } from '../types';

interface SlackUser {
  name: string;
  photoURL?: string;
  email?: string;
}

class SlackService {
  /**
   * Sends a formatted Slack block message to the container's webhook URL
   * when a new link is added to the container.
   */
  static async notifyNewLink(
    container: Container,
    newLink: Link,
    user: SlackUser
  ): Promise<void> {
    if (!container.slackWebhookUrl) return;
    // If explicitly disabled by user, skip
    if (container.slackEnabled === false) return;

    try {
      const language = container.slackLanguage || 'en';
      const isTurkish = language === 'tr';

      const containerUrl = `${window.location.origin}/container/${container.id}`;
      
      const headline = isTurkish
        ? `*${user.name}* konteynere yeni bir bağlantı ekledi:`
        : `*${user.name}* added a new link to the container:`;

      const linkTitle = newLink.title;
      const linkUrl = newLink.url;
      const linkDesc = newLink.description ? `\n_${newLink.description}_` : '';

      const payload = {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${headline}\n\n*<${linkUrl}|${linkTitle}>*${linkDesc}`
            },
            accessory: newLink.favicon ? {
              type: "image",
              image_url: newLink.favicon,
              alt_text: "favicon"
            } : undefined
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: isTurkish 
                  ? `Konteyner: *<${containerUrl}|${container.name}>*` 
                  : `Container: *<${containerUrl}|${container.name}>*`
              }
            ]
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: isTurkish ? "Konteyneri Aç" : "Open Container",
                  emoji: true
                },
                url: containerUrl,
                style: "primary"
              }
            ]
          }
        ]
      };

      await fetch(container.slackWebhookUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

    } catch (err) {
      console.warn('Failed to send Slack notification:', err);
    }
  }
}

export default SlackService;
