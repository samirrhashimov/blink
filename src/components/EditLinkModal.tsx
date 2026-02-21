import React, { useState, useEffect } from 'react';
import { useContainer } from '../contexts/ContainerContext';
import { X, Save, Tag, Plus } from 'lucide-react';
import type { Link } from '../types';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  link: Link;
  containerColor?: string;
}

import { useTranslation } from 'react-i18next';

const EditLinkModal: React.FC<EditLinkModalProps> = ({ isOpen, onClose, containerId, link, containerColor }) => {
  const { t } = useTranslation();

  const { updateLinkInContainer } = useContainer();
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    description: link.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>(link.tags || []);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: link.title,
        url: link.url,
        description: link.description || ''
      });
      setTags(link.tags || []);
      setTagInput('');
      setError('');
    }
  }, [isOpen, link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      setError(t('container.modals.addLink.errors.required'));
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      setError(t('container.modals.addLink.errors.invalidUrl'));
      return;
    }

    try {
      setError('');
      setLoading(true);
      await updateLinkInContainer(containerId, link.id, {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        tags
      });
      onClose();
    } catch (err: any) {
      setError(err.message || t('container.modals.editLink.errors.failed'));
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

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': containerColor } as React.CSSProperties}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('container.modals.editLink.title')}</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="edit-link-form" onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="edit-title" className="form-label">
              {t('container.modals.addLink.linkTitle')} *
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder={t('container.modals.addLink.placeholders.title')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-url" className="form-label">
              {t('container.modals.addLink.url')} *
            </label>
            <input
              id="edit-url"
              name="url"
              type="url"
              required
              value={formData.url}
              onChange={handleChange}
              className="form-input"
              placeholder={t('container.modals.addLink.placeholders.url')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description" className="form-label">
              {t('container.modals.addLink.description')}
            </label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input resize-none"
              rows={3}
              placeholder={t('container.modals.addLink.placeholders.description')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-tags" className="form-label">
              {t('container.modals.addLink.tags')}
            </label>
            <div className="tags-input-wrapper">
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag-badge">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="remove-tag">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-input-field-wrapper">
                <div className="tag-input-icon">
                  <Tag size={16} />
                </div>
                <input
                  id="edit-tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="form-input tag-input-padding"
                  placeholder={t('container.modals.addLink.placeholders.tags')}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="tag-add-btn"
                  title={t('container.modals.addLink.tooltips.addTag')}
                >
                  <Plus size={16} />
                </button>
              </div>
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
            form="edit-link-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('container.modals.editLink.buttons.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('container.modals.editLink.buttons.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLinkModal;
