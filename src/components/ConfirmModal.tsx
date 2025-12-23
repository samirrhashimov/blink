import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

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
    icon
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        try {
            setError('');
            setLoading(true);
            await onConfirm();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="modal-close">
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
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="btn-cancel"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
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
        </div>
    );
};

export default ConfirmModal;
