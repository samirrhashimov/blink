import React, { useState, useEffect } from 'react';
import { useVault } from '../contexts/VaultContext';
import { X, Link as LinkIcon } from 'lucide-react';
import LinkPreviewService from '../services/linkPreviewService';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  vaultColor?: string;
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, vaultId, vaultColor }) => {
  const { addLinkToVault } = useVault();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      // Get favicon (non-blocking)
      let favicon: string | undefined;
      try {
        const preview = await LinkPreviewService.fetchLinkPreview(formData.url.trim());
        favicon = preview.favicon;
      } catch {
        // Favicon fetch failed, continue without it
        favicon = undefined;
      }

      await addLinkToVault(vaultId, {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        favicon
      });
      setFormData({ title: '', url: '', description: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
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

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': vaultColor } as React.CSSProperties}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Link</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="add-link-form" onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Link Title *
            </label>
            <input
              id="title"
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
            <label htmlFor="url" className="form-label">
              URL *
            </label>
            <input
              id="url"
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
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
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
            form="add-link-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Add Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLinkModal;
