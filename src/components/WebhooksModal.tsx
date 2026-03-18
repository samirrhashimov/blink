import React, { useState, useEffect } from 'react';
import { useContainer } from '../contexts/ContainerContext';
import { X, Save, CheckCircle2, PauseCircle } from 'lucide-react';
import { FaDiscord, FaSlack } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { Container } from '../types';

interface WebhooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: Container;
}

const Toggle = ({
  checked,
  onChange,
  disabled
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    aria-checked={checked}
    role="switch"
    style={{
      position: 'relative',
      width: 40,
      height: 22,
      borderRadius: 99,
      border: 'none',
      padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked && !disabled ? '#22c55e' : 'var(--border-color)',
      transition: 'background 0.2s ease',
      opacity: disabled ? 0.4 : 1,
      flexShrink: 0
    }}
  >
    <span style={{
      position: 'absolute',
      top: 3,
      left: checked ? 21 : 3,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: 'white',
      transition: 'left 0.2s ease',
      boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
    }} />
  </button>
);


const WebhooksModal: React.FC<WebhooksModalProps> = ({ isOpen, onClose, container }) => {
  const { t } = useTranslation();
  const { updateContainer } = useContainer();

  const [formData, setFormData] = useState({
    discordWebhookUrl: container.discordWebhookUrl || '',
    discordLanguage: container.discordLanguage || 'en',
    discordEnabled: container.discordEnabled ?? true, // Default to true if not set
    slackWebhookUrl: container.slackWebhookUrl || '',
    slackLanguage: container.slackLanguage || 'en',
    slackEnabled: container.slackEnabled ?? true // Default to true if not set
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        discordWebhookUrl: container.discordWebhookUrl || '',
        discordLanguage: container.discordLanguage || 'en',
        discordEnabled: container.discordEnabled ?? true,
        slackWebhookUrl: container.slackWebhookUrl || '',
        slackLanguage: container.slackLanguage || 'en',
        slackEnabled: container.slackEnabled ?? true
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
        discordLanguage: formData.discordLanguage as 'en' | 'tr',
        discordEnabled: formData.discordEnabled,
        slackWebhookUrl: formData.slackWebhookUrl.trim(),
        slackLanguage: formData.slackLanguage as 'en' | 'tr',
        slackEnabled: formData.slackEnabled
      });
      onClose();
    } catch (err: any) {
      setError(err.message || t('container.modals.webhooks.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  const discordConnected = !!formData.discordWebhookUrl.trim();
  const slackConnected = !!formData.slackWebhookUrl.trim();

  const langSelectStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '68px',
    padding: '0.55rem 0.4rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none'
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': container.color || '#6366f1' } as React.CSSProperties}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ minHeight: '540px' }}
      >

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: '0.2rem' }}>{t('container.modals.webhooks.title')}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
              Notifies a channel automatically when a new link is added.
            </p>
          </div>
          <button onClick={onClose} className="modal-close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — uses global .modal-body (overflow-y: auto, flex: 1) */}
        <form id="webhooks-form" onSubmit={handleSubmit} className="modal-body" style={{ overflowY: 'auto' }}>
          {error && <div className="error-message">{error}</div>}

          {/* Discord Card */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            transition: 'border-color 0.2s ease'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: 'var(--surface-secondary)',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(88,101,242,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaDiscord size={18} color="#5865F2" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Discord</p>
                  <a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" target="_blank" rel="noopener noreferrer" style={{ margin: 0, fontSize: '0.72rem', color: 'var(--primary, #6366f1)', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                    {t('container.modals.webhooks.howToDiscord', 'How to get a Discord webhook?')}
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {discordConnected && formData.discordEnabled && <CheckCircle2 size={16} color="#22c55e" />}
                {discordConnected && !formData.discordEnabled && <PauseCircle size={16} color="#eab308" />}
                <Toggle
                  checked={formData.discordEnabled}
                  disabled={!discordConnected}
                  onChange={(v) => setFormData(prev => ({ ...prev, discordEnabled: v }))}
                />
              </div>
            </div>
            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select name="discordLanguage" value={formData.discordLanguage} onChange={handleChange} disabled={loading} style={langSelectStyle}>
                  <option value="en">EN</option>
                  <option value="tr">TR</option>
                </select>
                <input
                  name="discordWebhookUrl" type="url" value={formData.discordWebhookUrl}
                  onChange={handleChange} disabled={loading}
                  className="form-input" style={{ flex: 1, margin: 0, fontSize: '0.82rem' }}
                  placeholder={t('container.modals.webhooks.discordWebhookPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Slack Card */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            transition: 'border-color 0.2s ease'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: 'var(--surface-secondary)',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(74,21,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaSlack size={18} color="#4A154B" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Slack</p>
                  <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" style={{ margin: 0, fontSize: '0.72rem', color: 'var(--primary, #6366f1)', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                    {t('container.modals.webhooks.howToSlack', 'How to get a Slack webhook?')}
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {slackConnected && formData.slackEnabled && <CheckCircle2 size={16} color="#22c55e" />}
                {slackConnected && !formData.slackEnabled && <PauseCircle size={16} color="#eab308" />}
                <Toggle
                  checked={formData.slackEnabled}
                  disabled={!slackConnected}
                  onChange={(v) => setFormData(prev => ({ ...prev, slackEnabled: v }))}
                />
              </div>
            </div>
            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select name="slackLanguage" value={formData.slackLanguage} onChange={handleChange} disabled={loading} style={langSelectStyle}>
                  <option value="en">EN</option>
                  <option value="tr">TR</option>
                </select>
                <input
                  name="slackWebhookUrl" type="url" value={formData.slackWebhookUrl}
                  onChange={handleChange} disabled={loading}
                  className="form-input" style={{ flex: 1, margin: 0, fontSize: '0.82rem' }}
                  placeholder={t('container.modals.webhooks.slackWebhookPlaceholder')}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer — pinned, exactly like EditContainerModal */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} disabled={loading} className="btn-cancel">
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
