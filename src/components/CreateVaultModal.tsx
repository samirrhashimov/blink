import React, { useState } from 'react';
import { useVault } from '../contexts/VaultContext';
import { X, Plus } from 'lucide-react';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateVaultModal: React.FC<CreateVaultModalProps> = ({ isOpen, onClose }) => {
  const { createVault } = useVault();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1' // Default color
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_NAME_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 200;

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
      await createVault(formData.name.trim(), formData.description.trim(), formData.color);
      setFormData({ name: '', description: '', color: '#6366f1' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create vault');
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

  const VAULT_COLORS = [
    '#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6',
    '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d',
    '#facc15', '#a3e635', '#22d3ee', '#fb7185', '#94a3b8'
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Vault</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="create-vault-form" onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Vault Name *
              <span className="char-counter">
                {formData.name.length}/{MAX_NAME_LENGTH}
              </span>
            </label>
            <input
              id="name"
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
            <label htmlFor="description" className="form-label">
              Description
              <span className="char-counter">
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </label>
            <textarea
              id="description"
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

          <div className="form-group">
            <label className="form-label">Vault Color</label>
            <div className="color-picker-grid">
              {VAULT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  title={color}
                />
              ))}
            </div>
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
            form="create-vault-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Vault
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;
