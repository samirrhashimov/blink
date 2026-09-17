import { version } from '../../package.json';

export type AnnouncementTheme = 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'dark';

export interface AnnouncementMessage {
  text: string;
  linkLabel?: string;
}

export interface AnnouncementDetail {
  title: string;
  content: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  theme: AnnouncementTheme;
  hasDetailPage: boolean;
  updatedAt: string;
  messages: Record<string, AnnouncementMessage>;
  url: string | null;
  details: Record<string, AnnouncementDetail>;
  dismissKey: string;
}

const announcement: AnnouncementConfig = {
  enabled: false,
  theme: 'yellow',
  hasDetailPage: false,
  updatedAt: '2026-09-17',

  messages: {
    tr: {
      text: '',
      linkLabel: 'Detayları İncele',
    },
    en: {
      text: '',
      linkLabel: 'Learn More',
    },
  },

  url: '/announcement',

  details: {
    tr: {
      title: '',
      content: ``,
    },
    en: {
      title: '',
      content: ``,
    },
  },

  dismissKey: 'announcement-dismissed-v2.0.2',
};

export default announcement;
