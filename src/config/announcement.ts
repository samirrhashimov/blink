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
  enabled: true,
  theme: 'yellow',
  hasDetailPage: true,
  updatedAt: '2026-09-01',

  messages: {
    tr: {
      text: 'Blink taşındı. Bu link 15 Eylül’de kapatılacaktır. Lütfen blink.linzaapps.duckdns.org adresini kullanın.',
      linkLabel: 'Detayları İncele',
    },
    en: {
      text: '⚠️ Blink has migrated. Access via this link ends Sep 15. Please use blink.linzaapps.duckdns.org.',
      linkLabel: 'Learn More',
    },
  },

  url: '/announcement',

  details: {
    tr: {
      title: 'Önemli Duyuru: Blink Yeni Adresine Taşındı',
      content: `Sizlere daha hızlı, güvenli ve kesintisiz bir deneyim sunabilmek amacıyla Blink altyapımızı yeni sunucularımıza taşıyoruz.

Yeni Adresimiz: https://blink.linzaapps.duckdns.org

Kapanış Tarihi: 15 Eylül 2026

Yapmanız Gerekenler: Lütfen tarayıcınızdaki yer işaretlerini (bookmarks) yeni alan adımızla güncelleyin. Eski bağlantı üzerinden sağlanan otomatik yönlendirme 15 Eylül 2026 tarihine kadar devam edecek, bu tarihten sonra eski adres tamamen erişime kapatılacaktır.

Hesap verileriniz, kaydedilmiş tüm bağlantılarınız ve ayarlarınız bu durumdan etkilenmeden güvenle korunmaktadır.`,
    },
    en: {
      title: 'Important Notice: Blink Has Migrated to a New Address',
      content: `To provide better performance, improved security, and higher service reliability, Blink is transitioning to a new self-hosted infrastructure.

New Address: https://blink.linzaapps.duckdns.org

Effective Date: September 15, 2026

What you need to do: Please update your bookmarks to our new domain. All legacy links will automatically redirect until September 15, 2026, after which access through the old address will be permanently disabled.

All your account data, saved links, and settings remain completely safe and untouched.`,
    },
  },

  dismissKey: 'announcement-dismissed-v2.0.2',
};

export default announcement;
