import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import announcement from '../config/announcement';

/**
 * AnnouncementBanner
 *
 * A thin, dismissible, themed banner rendered directly below the top navbar.
 * It pushes page content down — no overlap.
 * All content and theme are driven by `src/config/announcement.ts`.
 */
const AnnouncementBanner: React.FC = () => {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!announcement.enabled) return;
    const dismissed = localStorage.getItem(announcement.dismissKey);
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(announcement.dismissKey, 'true');
    setVisible(false);
  };

  if (!visible || !announcement.enabled) return null;

  // Pick the message for the current language, fall back to 'en'
  const lang = i18n.language?.split('-')[0] ?? 'en';
  const msg = announcement.messages[lang] ?? announcement.messages['en'];

  if (!msg) return null;

  const isInternalUrl = !!announcement.url && announcement.url.startsWith('/');
  const themeClass = `ab-theme-${announcement.theme || 'yellow'}`;

  const Inner = (
    <>
      <span className="ab__text">{msg.text}</span>
      {announcement.url && msg.linkLabel && (
        <span className="ab__label">{msg.linkLabel}</span>
      )}
      {announcement.url && (
        isInternalUrl ? (
          <ArrowRight size={12} className="ab__ext-icon" aria-hidden />
        ) : (
          <ExternalLink size={11} className="ab__ext-icon" aria-hidden />
        )
      )}
    </>
  );

  return (
    <div className={`ab-wrapper ${themeClass}`} ref={bannerRef}>
      <div className="ab" role="alert" aria-live="polite">
        {announcement.url ? (
          isInternalUrl ? (
            <Link
              to={announcement.url}
              className="ab__link"
              aria-label={msg.text}
            >
              {Inner}
            </Link>
          ) : (
            <a
              href={announcement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ab__link"
              aria-label={msg.text}
            >
              {Inner}
            </a>
          )
        ) : (
          <span className="ab__link ab__link--plain">{Inner}</span>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className="ab__close"
          aria-label="Duyuruyu kapat"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
