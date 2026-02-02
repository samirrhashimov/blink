import React, { useState } from 'react';
import { X } from 'lucide-react';

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
    confirmWord
}) => {
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
            setError(err.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setConfirmationInput('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                                Please type <strong>{confirmWord}</strong> to confirm:
                            </p>
                            <input
                                type="text"
                                className="form-input"
                                value={confirmationInput}
                                onChange={(e) => setConfirmationInput(e.target.value)}
                                placeholder={`Type '${confirmWord}'`}
                                style={{ width: '100%' }}
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
