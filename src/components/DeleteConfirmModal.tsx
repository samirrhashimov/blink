import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  itemName 
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
      setError(err.message || 'Failed to delete');
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

          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {message}
          </p>
          
          <p className="text-gray-900 dark:text-white font-semibold mb-3">
            "{itemName}"
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
