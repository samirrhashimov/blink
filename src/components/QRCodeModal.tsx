import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Link } from '../types';
import blinkLogo from '../assets/blinklogo2.png';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: Link | null;
    containerColor?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
    isOpen,
    onClose,
    link,
    containerColor = '#6366f1'
}) => {
    const { t } = useTranslation();
    const [imageLoaded, setImageLoaded] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setImageLoaded(false);
        }
    }, [isOpen, link?.id]);

    if (!isOpen || !link) return null;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link.url)}`;

    const handleDownload = async () => {
        if (!link) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set high resolution for better quality
            const size = 1000;
            canvas.width = size;
            canvas.height = size;

            // Fill background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);

            // 1. Draw Logo in top-left
            const logo = new Image();
            logo.src = blinkLogo;
            await new Promise((resolve, reject) => {
                logo.onload = resolve;
                logo.onerror = reject;
            });

            const padding = 60;
            const logoHeight = 60;
            const logoWidth = (logo.width / logo.height) * logoHeight;
            ctx.drawImage(logo, padding, padding, logoWidth, logoHeight);

            // 2. Fetch and Draw QR Code in center
            const qrImg = new Image();
            qrImg.crossOrigin = 'anonymous'; // Important for canvas cross-domain
            qrImg.src = qrCodeUrl;
            await new Promise((resolve, reject) => {
                qrImg.onload = resolve;
                qrImg.onerror = reject;
            });

            const qrSize = 650;
            const qrX = (size - qrSize) / 2;
            const qrY = (size - qrSize) / 2 + 40;

            // Subtle background for QR code
            const qrBgPadding = 35;
            ctx.fillStyle = '#f8fafc';
            // Simple rounded rect implementation for better compatibility
            const r = 40;
            const bx = qrX - qrBgPadding;
            const by = qrY - qrBgPadding;
            const bw = qrSize + qrBgPadding * 2;
            const bh = qrSize + qrBgPadding * 2;

            ctx.beginPath();
            ctx.moveTo(bx + r, by);
            ctx.lineTo(bx + bw - r, by);
            ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
            ctx.lineTo(bx + bw, by + bh - r);
            ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
            ctx.lineTo(bx + r, by + bh);
            ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
            ctx.lineTo(bx, by + r);
            ctx.quadraticCurveTo(bx, by, bx + r, by);
            ctx.closePath();
            ctx.fill();

            // Draw shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 40;
            ctx.shadowOffsetY = 20;

            // Draw QR code image
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // 3. Add text at bottom right
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = '#333333'; // Updated color as requested
            ctx.font = '600 24px Inter, system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('Your links, organized.', size - padding, size - padding);

            // Trigger Download
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `qr-${link.title.toLowerCase().replace(/\s+/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to generate branded QR code:', error);
            // Fallback to simple download if canvas fails
            const a = document.createElement('a');
            a.href = qrCodeUrl;
            a.download = `qr-${link.title.toLowerCase().replace(/\s+/g, '-')}.png`;
            a.click();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        <div>
                            <h2 style={{ fontSize: '1.25rem' }}>{t('container.modals.qrCode.title')}</h2>

                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="modal-body" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem 1rem', // Reduced padding for better mobile fit
                    overflowX: 'hidden'
                }}>
                    <div style={{
                        background: '#ffffff',
                        padding: '1.25rem',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        border: `2px solid ${containerColor}40`,
                        margin: '0 auto',
                        position: 'relative',
                        width: '100%',
                        maxWidth: '240px',
                        aspectRatio: '1/1',
                        boxSizing: 'border-box'
                    }}>
                        {!imageLoaded && (
                            <div className="skeleton-box shimmer" style={{
                                position: 'absolute',
                                width: 'calc(100% - 2.5rem)',
                                height: 'calc(100% - 2.5rem)',
                                borderRadius: '12px'
                            }}></div>
                        )}
                        <img
                            src={qrCodeUrl}
                            alt={t('container.modals.qrCode.alt', { url: link.url })}
                            onLoad={() => setImageLoaded(true)}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '200px',
                                display: imageLoaded ? 'block' : 'none',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                </div>

                <div className="modal-footer desktop-only" style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleDownload}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            gap: '8px',
                            display: 'flex',
                            backgroundColor: containerColor
                        }}
                    >
                        <Download size={18} />
                        {t('common.buttons.download')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;
