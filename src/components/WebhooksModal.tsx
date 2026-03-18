import React, { useState, useEffect } from 'react';
import { useContainer } from '../contexts/ContainerContext';
import { X, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Container } from '../types';

interface WebhooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: Container;
}

const WebhooksModal: React.FC<WebhooksModalProps> = ({ isOpen, onClose, container }) => {
  const { t } = useTranslation();
  const { updateContainer } = useContainer();

  const [formData, setFormData] = useState({
    discordWebhookUrl: container.discordWebhookUrl || '',
    discordLanguage: container.discordLanguage || 'en'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        discordWebhookUrl: container.discordWebhookUrl || '',
        discordLanguage: container.discordLanguage || 'en'
      });
      setError('');
    }
  }, [isOpen, container]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await updateContainer(container.id, {
        discordWebhookUrl: formData.discordWebhookUrl.trim(),
        discordLanguage: formData.discordLanguage as 'en' | 'tr'
      });
      onClose();
    } catch (err: any) {
      setError(err.message || t('container.modals.webhooks.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      style={{ '--primary': container.color || '#6366f1' } as React.CSSProperties}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('container.modals.webhooks.title')}</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="webhooks-form" onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="discord-webhook" className="form-label mb-1">
              {t('container.modals.webhooks.discordWebhook')}
            </label>
            <p className="text-xs text-secondary mb-2">
              {t('container.modals.webhooks.discordWebhookDesc')}
            </p>
            <input
              id="discord-webhook"
              name="discordWebhookUrl"
              type="url"
              value={formData.discordWebhookUrl}
              onChange={handleChange}
              className="form-input"
              placeholder={t('container.modals.webhooks.discordWebhookPlaceholder')}
              disabled={loading}
            />
          </div>

          <div className="form-group mt-3" style={{ opacity: formData.discordWebhookUrl ? 1 : 0.5, transition: 'opacity 0.2s ease' }}>
            <label htmlFor="discord-language" className="form-label mb-1">
              {t('container.modals.webhooks.discordLanguage')}
            </label>
            <select
              id="discord-language"
              name="discordLanguage"
              value={formData.discordLanguage}
              onChange={handleChange}
              className="form-input"
              disabled={loading || !formData.discordWebhookUrl}
              style={{ cursor: formData.discordWebhookUrl ? 'pointer' : 'not-allowed' }}
            >
              <option value="en">{t('container.modals.webhooks.discordLanguageEn')}</option>
              <option value="tr">{t('container.modals.webhooks.discordLanguageTr')}</option>
            </select>
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
            form="webhooks-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('container.modals.webhooks.buttons.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('container.modals.webhooks.buttons.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebhooksModal;
