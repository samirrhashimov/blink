import React, { useState, useEffect } from 'react';
import { useVault } from '../contexts/VaultContext';
import { X, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Vault } from '../types';

interface EditVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: Vault;
}

const EditVaultModal: React.FC<EditVaultModalProps> = ({ isOpen, onClose, vault }) => {
  const { t } = useTranslation();

  const { updateVault } = useVault();
  const [formData, setFormData] = useState({
    name: vault.name,
    description: vault.description || '',
    color: vault.color || '#6366f1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_NAME_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 200;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: vault.name,
        description: vault.description || '',
        color: vault.color || '#6366f1'
      });
      setError('');
    }
  }, [isOpen, vault]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t('vault.modals.editVault.errors.nameRequired'));
      return;
    }

    if (formData.name.trim().length > MAX_NAME_LENGTH) {
      setError(t('vault.modals.editVault.errors.nameLength', { max: MAX_NAME_LENGTH }));
      return;
    }

    if (formData.description.trim().length > MAX_DESCRIPTION_LENGTH) {
      setError(t('vault.modals.editVault.errors.descLength', { max: MAX_DESCRIPTION_LENGTH }));
      return;
    }

    try {
      setError('');
      setLoading(true);
      await updateVault(vault.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color
      });
      onClose();
    } catch (err: any) {
      setError(err.message || t('vault.modals.editVault.errors.failed'));
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
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': formData.color } as React.CSSProperties}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('vault.modals.editVault.title')}</h2>
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
              {t('vault.modals.editVault.name')} *
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
              placeholder={t('vault.modals.editVault.placeholders.name')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="vault-description" className="form-label">
              {t('vault.modals.editVault.description')}
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
              placeholder={t('vault.modals.editVault.placeholders.description')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('vault.modals.editVault.color')}</label>
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
            {t('common.buttons.cancel')}
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
                {t('vault.modals.editVault.buttons.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('vault.modals.editVault.buttons.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVaultModal;
