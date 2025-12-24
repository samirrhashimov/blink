import React, { useState, useEffect } from 'react';
import { useVault } from '../contexts/VaultContext';
import { X, Save } from 'lucide-react';
import type { Vault } from '../types';

interface EditVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: Vault;
  vaultColor?: string;
}

const EditVaultModal: React.FC<EditVaultModalProps> = ({ isOpen, onClose, vault, vaultColor }) => {
  const { updateVault } = useVault();
  const [formData, setFormData] = useState({
    name: vault.name,
    description: vault.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const MAX_NAME_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 200;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: vault.name,
        description: vault.description || ''
      });
      setError('');
    }
  }, [isOpen, vault]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Vault name is required');
      return;
    }

    if (formData.name.trim().length > MAX_NAME_LENGTH) {
      setError(`Vault name must be ${MAX_NAME_LENGTH} characters or less`);
      return;
    }

    if (formData.description.trim().length > MAX_DESCRIPTION_LENGTH) {
      setError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await updateVault(vault.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update vault');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': vaultColor } as React.CSSProperties}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Vault</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="edit-vault-form" onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="vault-name" className="form-label">
              Vault Name *
              <span className="char-counter">
                {formData.name.length}/{MAX_NAME_LENGTH}
              </span>
            </label>
            <input
              id="vault-name"
              name="name"
              type="text"
              required
              maxLength={MAX_NAME_LENGTH}
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter vault name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="vault-description" className="form-label">
              Description
              <span className="char-counter">
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </label>
            <textarea
              id="vault-description"
              name="description"
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={formData.description}
              onChange={handleChange}
              className="form-input resize-none"
              rows={3}
              placeholder="Enter vault description (optional)"
              disabled={loading}
            />
          </div>
        </form>

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
            type="submit"
            form="edit-vault-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVaultModal;
