import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation, Trans } from 'react-i18next';

import { X, Lock } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    icon?: React.ReactNode;
    confirmWord?: string;
    showPasswordInput?: boolean;
    passwordValue?: string;
    onPasswordChange?: (value: string) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    icon,
    confirmWord,
    showPasswordInput,
    passwordValue,
    onPasswordChange
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationInput, setConfirmationInput] = useState('');

    const handleConfirm = async () => {
        if (confirmWord && confirmationInput !== confirmWord) return;
        try {
            setError('');
            setLoading(true);
            await onConfirm();
            onClose();
        } catch (err: any) {
            setError(err.message || t('common.errors.operationFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setConfirmationInput('');
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={handleClose} className="modal-close">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <p className="text-gray-700 dark:text-gray-300">
                        {message}
                    </p>

                    {confirmWord && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <p className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>
                                <Trans
                                    i18nKey="common.confirmation.typeToConfirm"
                                    values={{ word: confirmWord }}
                                    components={{ b: <b /> }}
                                />:
                            </p>
                            <input
                                type="text"
                                className="form-input"
                                value={confirmationInput}
                                onChange={(e) => setConfirmationInput(e.target.value)}
                                placeholder={t('common.confirmation.placeholder', { word: confirmWord })}
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}

                    {showPasswordInput && (
                        <div className="security-verification-box" style={{ 
                            marginTop: '1.5rem', 
                            padding: '1.25rem', 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#ef4444' }}>
                                <Lock size={16} />
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    {t('common.securityVerification')}
                                </span>
                            </div>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                {t('settings.messages.reauthRequired')}
                            </p>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordValue}
                                onChange={(e) => onPasswordChange?.(e.target.value)}
                                placeholder={t('common.placeholders.password')}
                                style={{ 
                                    width: '100%', 
                                    fontSize: '0.95rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-primary)'
                                }}
                                autoComplete="current-password"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="btn-cancel"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || (!!confirmWord && confirmationInput !== confirmWord)}
                        className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: (loading || (!!confirmWord && confirmationInput !== confirmWord)) ? 0.6 : 1,
                            cursor: (loading || (!!confirmWord && confirmationInput !== confirmWord)) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {t('common.processing')}
                            </>
                        ) : (
                            <>
                                {icon}
                                {confirmText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
