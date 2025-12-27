import React, { useState, useEffect } from 'react';
import { useVault } from '../contexts/VaultContext';
import { X, Link as LinkIcon, Sparkles } from 'lucide-react';
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
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [isTitleAutoFilled, setIsTitleAutoFilled] = useState(false);
  const [isDescAutoFilled, setIsDescAutoFilled] = useState(false);
  const [error, setError] = useState('');
  const [fetchTimeout, setFetchTimeout] = useState<any>(null);

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
        favicon = undefined;
      }

      await addLinkToVault(vaultId, {
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        favicon
      });
      setFormData({ title: '', url: '', description: '' });
      setIsTitleAutoFilled(false);
      setIsDescAutoFilled(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlScan = (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setIsAutoFetching(false);
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      return;
    }

    if (fetchTimeout) clearTimeout(fetchTimeout);

    const timeout = setTimeout(async () => {
      try {
        setIsAutoFetching(true);
        const preview = await LinkPreviewService.fetchLinkPreview(trimmedUrl);

        setFormData(prev => {
          const newData = { ...prev };

          // Only fill if current value is empty or was previously auto-filled
          if ((!prev.title || isTitleAutoFilled) && preview.title) {
            newData.title = preview.title;
            setIsTitleAutoFilled(true);
          }

          if ((!prev.description || isDescAutoFilled) && preview.description) {
            newData.description = preview.description;
            setIsDescAutoFilled(true);
          }

          return newData;
        });
      } catch (err) {
        console.warn('Scan failed:', err);
      } finally {
        setIsAutoFetching(false);
      }
    }, 1000);

    setFetchTimeout(timeout);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'title') setIsTitleAutoFilled(false);
    if (name === 'description') setIsDescAutoFilled(false);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'url') {
      handleUrlScan(value);
    }
  };

  const clearField = (field: 'title' | 'description' | 'url') => {
    if (field === 'url') {
      setFormData({ title: '', url: '', description: '' });
      setIsTitleAutoFilled(false);
      setIsDescAutoFilled(false);
      setIsAutoFetching(false);
      if (fetchTimeout) clearTimeout(fetchTimeout);
    } else {
      setFormData(prev => ({ ...prev, [field]: '' }));
      if (field === 'title') setIsTitleAutoFilled(false);
      if (field === 'description') setIsDescAutoFilled(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: '', url: '', description: '' });
      setIsTitleAutoFilled(false);
      setIsDescAutoFilled(false);
      setIsAutoFetching(false);
      if (fetchTimeout) clearTimeout(fetchTimeout);
    }
  }, [isOpen]);

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
            <label htmlFor="url" className="form-label">
              URL *
            </label>
            <div className={`url-input-wrapper ${formData.url ? 'input-with-clear' : ''}`}>
              <input
                id="url"
                name="url"
                type="url"
                required
                value={formData.url}
                onChange={handleChange}
                className={`form-input ${isAutoFetching ? 'border-primary' : ''}`}
                placeholder="https://example.com"
                disabled={loading}
              />
              {isAutoFetching && (
                <div className="loading-bar-container">
                  <div className="loading-bar"></div>
                </div>
              )}
              {formData.url && !loading && (
                <button type="button" onClick={() => clearField('url')} className="input-clear-btn" title="Clear URL">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Link Title *
              {isTitleAutoFilled && (
                <span className="auto-filled-hint">
                  <Sparkles size={10} /> Auto-filled
                </span>
              )}
            </label>
            <div className={`input-with-icon ${isTitleAutoFilled ? 'input-with-magic' : ''} ${formData.title ? 'input-with-clear' : ''}`}>
              {isTitleAutoFilled && <Sparkles className="input-magic-icon" size={16} />}
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
              {formData.title && !loading && (
                <button type="button" onClick={() => clearField('title')} className="input-clear-btn" title="Clear title">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
              {isDescAutoFilled && (
                <span className="auto-filled-hint">
                  <Sparkles size={10} /> Auto-filled
                </span>
              )}
            </label>
            <div className={`input-with-icon ${isDescAutoFilled ? 'input-with-magic' : ''} ${formData.description ? 'input-with-clear' : ''}`}>
              {isDescAutoFilled && <Sparkles className="input-magic-icon" size={16} />}
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
              {formData.description && !loading && (
                <button type="button" onClick={() => clearField('description')} className="input-clear-btn" title="Clear description">
                  <X size={12} />
                </button>
              )}
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
