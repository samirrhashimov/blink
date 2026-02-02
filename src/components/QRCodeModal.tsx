import React from 'react';
import { X, Download, QrCode } from 'lucide-react';
import type { Link } from '../types';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: Link | null;
    vaultColor?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
    isOpen,
    onClose,
    link,
    vaultColor = '#6366f1'
}) => {
    if (!isOpen || !link) return null;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link.url)}`;

    const handleDownload = async () => {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-${link.title.toLowerCase().replace(/\s+/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download QR code:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        <div>
                            <h2 style={{ fontSize: '1.25rem' }}>QR Code</h2>

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
                    padding: '2.5rem 2rem'
                }}>
                    <div style={{
                        background: '#ffffff',
                        padding: '1.25rem',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        border: `2px solid ${vaultColor}40`,
                        margin: '0 auto'
                    }}>
                        <img
                            src={qrCodeUrl}
                            alt={`QR Code for ${link.url}`}
                            style={{
                                width: '200px',
                                height: '200px',
                                display: 'block',
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
                            backgroundColor: vaultColor
                        }}
                    >
                        <Download size={18} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;
