import React, { useState, useEffect } from 'react';
import { useContainer } from '../contexts/ContainerContext';
import { X, Link as LinkIcon, Sparkles, Tag, Plus } from 'lucide-react';
import LinkPreviewService from '../services/linkPreviewService';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  containerColor?: string;
}

import { useTranslation } from 'react-i18next';

const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, containerId, containerColor }) => {
  const { t } = useTranslation();

  const { addLinkToContainer, updateLinkInContainer } = useContainer();
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [fetchTimeout, setFetchTimeout] = useState<any>(null);
  const [fetchSequence, setFetchSequence] = useState(0);

  useEffect(() => {
    if (isAutoFetching) {
      setFetchSequence(0);
      const interval = setInterval(() => {
        setFetchSequence(prev => (prev < 3 ? prev + 1 : prev));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setFetchSequence(0);
    }
  }, [isAutoFetching]);

  // Helper to normalize URL
  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return '';

    // Check if it starts with http:// or https://
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      setError(t('container.modals.addLink.errors.required'));
      return;
    }

    const normalizedUrl = normalizeUrl(formData.url);

    // Basic URL validation with normalized URL
    try {
      new URL(normalizedUrl);
    } catch {
      setError(t('container.modals.addLink.errors.invalidUrl'));
      return;
    }

    try {
      setError('');
      setLoading(true);

      // 1. Add link immediately without waiting for favicon
      // This makes the UI feel much faster
      const linkId = await addLinkToContainer(containerId, {
        title: formData.title.trim(),
        url: normalizedUrl,
        description: formData.description.trim(),
        favicon: undefined, // Will be updated in background
        tags
      });

      // 2. Close modal and reset form immediately
      setFormData({ title: '', url: '', description: '' });
      setIsTitleAutoFilled(false);
      setIsDescAutoFilled(false);
      setLoading(false);
      onClose();

      // 3. Fetch favicon in background (Fire & Forget)
      LinkPreviewService.fetchLinkPreview(normalizedUrl)
        .then(preview => {
          if (preview.favicon) {
            updateLinkInContainer(containerId, linkId, { favicon: preview.favicon })
              .catch(err => console.error('Background favicon update failed:', err));
          }
        })
        .catch(() => {
          // Silent failure for favicon is acceptable
        });

    } catch (err: any) {
      setError(err.message || t('container.modals.addLink.errors.failed'));
      setLoading(false);
    }
  };

  const handleUrlScan = (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setIsAutoFetching(false);
      return;
    }

    const normalizedUrl = normalizeUrl(trimmedUrl);

    try {
      new URL(normalizedUrl);
    } catch {
      return;
    }

    if (fetchTimeout) clearTimeout(fetchTimeout);

    const timeout = setTimeout(async () => {
      try {
        setIsAutoFetching(true);
        const preview = await LinkPreviewService.fetchLinkPreview(normalizedUrl);

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

  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: '', url: '', description: '' });
      setTags([]);
      setTagInput('');
      setIsTitleAutoFilled(false);
      setIsDescAutoFilled(false);
      setIsAutoFetching(false);
      setLoading(false);
      setError('');
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
      style={{ '--primary': containerColor } as React.CSSProperties}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('container.modals.addLink.title')}</h2>
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
              {t('container.modals.addLink.url')} *
            </label>
            <div className={`url-input-wrapper ${formData.url ? 'input-with-clear' : ''}`}>
              <input
                id="url"
                name="url"
                type="text"
                required
                value={formData.url}
                onChange={handleChange}
                className={`form-input ${isAutoFetching ? 'border-primary' : ''}`}
                placeholder={t('container.modals.addLink.placeholders.url')}
                disabled={loading}
              />
              {formData.url && !loading && (
                <button type="button" onClick={() => clearField('url')} className="input-clear-btn" title={t('container.modals.addLink.tooltips.clearUrl')}>
                  <X size={12} />
                </button>
              )}
            </div>
            {isAutoFetching && (
              <div className="mt-2 p-3 rounded-lg flex flex-col gap-2" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-primary font-medium">
                    <Sparkles size={12} className="animate-pulse" />
                    {t(`container.modals.addLink.fetching.step${fetchSequence + 1}`)}
                  </span>
                  <span className="text-gray-500 font-medium" style={{ opacity: 0.7 }}>
                    ~1s
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${(fetchSequence + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              {t('container.modals.addLink.linkTitle')} *
              {isTitleAutoFilled && (
                <span className="auto-filled-hint">
                  <Sparkles size={10} /> {t('container.modals.addLink.autoFilled')}
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
                placeholder={t('container.modals.addLink.placeholders.title')}
                disabled={loading}
              />
              {formData.title && !loading && (
                <button type="button" onClick={() => clearField('title')} className="input-clear-btn" title={t('container.modals.addLink.tooltips.clearTitle')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {t('container.modals.addLink.description')}
              {isDescAutoFilled && (
                <span className="auto-filled-hint">
                  <Sparkles size={10} /> {t('container.modals.addLink.autoFilled')}
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
                placeholder={t('container.modals.addLink.placeholders.description')}
                disabled={loading}
              />
              {formData.description && !loading && (
                <button type="button" onClick={() => clearField('description')} className="input-clear-btn" title={t('container.modals.addLink.tooltips.clearDescription')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">
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
            form="add-link-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('container.modals.addLink.buttons.adding')}
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                {t('container.modals.addLink.buttons.add')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLinkModal;
