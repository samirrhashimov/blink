import React, { useState } from 'react';
import { useContainer } from '../contexts/ContainerContext';
import { X, Plus } from 'lucide-react';

interface CreateContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useTranslation } from 'react-i18next';

const CreateContainerModal: React.FC<CreateContainerModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const { createContainer } = useContainer();
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
      setError(t('container.modals.createContainer.errors.nameRequired'));
      return;
    }

    if (formData.name.trim().length > MAX_NAME_LENGTH) {
      setError(t('container.modals.createContainer.errors.nameLength', { max: MAX_NAME_LENGTH }));
      return;
    }

    if (formData.description.trim().length > MAX_DESCRIPTION_LENGTH) {
      setError(t('container.modals.createContainer.errors.descLength', { max: MAX_DESCRIPTION_LENGTH }));
      return;
    }

    try {
      setError('');
      setLoading(true);
      await createContainer(formData.name.trim(), formData.description.trim(), formData.color);
      setFormData({ name: '', description: '', color: '#6366f1' });
      onClose();
    } catch (err: any) {
      setError(err.message || t('container.modals.createContainer.errors.failed'));
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

  const CONTAINER_COLORS = [
    '#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6',
    '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d',
    '#facc15', '#a3e635', '#22d3ee', '#fb7185', '#94a3b8'
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('container.modals.createContainer.title')}</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="create-container-form" onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              {t('container.modals.createContainer.name')} *
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
              placeholder={t('container.modals.createContainer.placeholders.name')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {t('container.modals.createContainer.description')}
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
              placeholder={t('container.modals.createContainer.placeholders.description')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('container.modals.createContainer.color')}</label>
            <div className="color-picker-grid">
              {CONTAINER_COLORS.map(color => (
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
            {t('container.modals.addLink.buttons.cancel')}
          </button>
          <button
            type="submit"
            form="create-container-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('container.modals.createContainer.buttons.creating')}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t('container.modals.createContainer.buttons.create')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContainerModal;
