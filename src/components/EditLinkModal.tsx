import React, { useState, useEffect } from 'react';
import { useVault } from '../contexts/VaultContext';
import { X, Save } from 'lucide-react';
import type { Link } from '../types';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  link: Link;
  vaultColor?: string;
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({ isOpen, onClose, vaultId, link, vaultColor }) => {
  const { updateLinkInVault } = useVault();
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    description: link.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: link.title,
        url: link.url,
        description: link.description || ''
      });
      setError('');
    }
  }, [isOpen, link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      setError('Title and URL are required');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await updateLinkInVault(vaultId, link.id, {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update link');
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
          <h2>Edit Link</h2>
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
              Link Title *
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter link title"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-url" className="form-label">
              URL *
            </label>
            <input
              id="edit-url"
              name="url"
              type="url"
              required
              value={formData.url}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description" className="form-label">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input resize-none"
              rows={3}
              placeholder="Enter link description (optional)"
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
            form="edit-link-form"
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

export default EditLinkModal;
