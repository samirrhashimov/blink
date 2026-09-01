import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { Calendar, ExternalLink, Megaphone, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import announcement from '../config/announcement';
import { useToast } from '../contexts/ToastContext';

const AnnouncementPage: React.FC = () => {
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();
    const toast = useToast();

    const lang = i18n.language?.split('-')[0] ?? 'en';
    const detail = announcement.details[lang] ?? announcement.details['en'] ?? {
        title: 'Announcement',
        content: 'No content available.',
    };

    // Format date based on locale
    const formattedDate = React.useMemo(() => {
        try {
            if (!announcement.updatedAt) return '';
            const dateObj = new Date(announcement.updatedAt);
            if (isNaN(dateObj.getTime())) return announcement.updatedAt;
            return dateObj.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return announcement.updatedAt;
        }
    }, [announcement.updatedAt, lang]);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success(lang === 'tr' ? 'Sayfa bağlantısı kopyalandı!' : 'Page link copied to clipboard!');
        }
    };

    return (
        <div className="legal-page-container">
            <SEO
                title={`${detail.title} - Blink`}
                description={detail.content.slice(0, 160)}
            />

            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                {/* Back Button & Actions Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="back-btn-legal"
                        title={lang === 'tr' ? 'Geri Dön' : 'Go back'}
                        style={{ position: 'static', margin: 0 }}
                    >
                        <FaArrowLeft />
                    </button>

                    <button
                        onClick={handleShare}
                        className="btn-secondary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                        }}
                    >
                        <Share2 size={16} />
                        <span>{lang === 'tr' ? 'Paylaş' : 'Share'}</span>
                    </button>
                </div>

                {/* Main Card */}
                <div className="legal-card" style={{ padding: '2.5rem' }}>
                    {/* Header Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: 'rgba(var(--primary-rgb, 19, 164, 236), 0.12)',
                                color: 'var(--primary)',
                            }}
                        >
                            <Megaphone size={13} />
                            {lang === 'tr' ? 'Resmi Duyuru' : 'Official Notice'}
                        </span>

                        {formattedDate && (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                <Calendar size={14} style={{ opacity: 0.7 }} />
                                {formattedDate}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 800,
                        lineHeight: 1.3,
                        marginBottom: '1.75rem',
                        color: 'var(--text-main)'
                    }}>
                        {detail.title}
                    </h1>

                    {/* Content text */}
                    <div
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: 1.8,
                            fontSize: '1.05rem',
                            color: 'var(--text-main)',
                            opacity: 0.92,
                        }}
                    >
                        {detail.content}
                    </div>

                    {/* Footer return to app link */}
                    <div
                        style={{
                            marginTop: '3rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}
                    >
                        <Link
                            to="/dashboard"
                            style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                            }}
                        >
                            ← {lang === 'tr' ? 'Blink Paneline Dön' : 'Return to Blink Dashboard'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementPage;
