import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Copy, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShareLinkService, type ShareLink } from '../services/shareLinkService';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  vaultName: string;
  currentUserId: string;
  vaultColor?: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  vaultId,
  vaultName,
  currentUserId,
  vaultColor
}) => {
  const { t } = useTranslation();

  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLinkConfig, setNewLinkConfig] = useState({
    permission: 'view' as 'view' | 'comment' | 'edit',
    expiresInDays: 7,
    maxUses: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadShareLinks();
    }
  }, [isOpen, vaultId]);

  const loadShareLinks = async () => {
    setLoading(true);
    setError('');
    try {
      const links = await ShareLinkService.getVaultShareLinks(vaultId);
      setShareLinks(links);
    } catch (err: any) {
      setError(err.message || t('vault.modals.shareLink.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    setError('');
    try {
      await ShareLinkService.createShareLink(
        vaultId,
        currentUserId,
        newLinkConfig.permission,
        newLinkConfig.expiresInDays > 0 ? newLinkConfig.expiresInDays : undefined,
        newLinkConfig.maxUses > 0 ? newLinkConfig.maxUses : undefined
      );
      await loadShareLinks();
      setShowCreateForm(false);
      setNewLinkConfig({ permission: 'view', expiresInDays: 7, maxUses: 0 });
    } catch (err: any) {
      setError(err.message || t('vault.modals.shareLink.errors.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (token: string, linkId: string) => {
    const url = ShareLinkService.generateShareUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleDeactivateLink = async (linkId: string) => {
    try {
      await ShareLinkService.deactivateShareLink(linkId);
      await loadShareLinks();
    } catch (err: any) {
      setError(err.message || t('vault.modals.shareLink.errors.deactivateFailed'));
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return t('vault.modals.shareLink.never');
    return new Date(date).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': vaultColor } as React.CSSProperties}
    >
      <div className="modal-content max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{t('vault.modals.shareLink.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vaultName}</p>
          </div>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="modal-body overflow-y-auto flex-grow">
          {error && (
            <div className="error-message mb-4">
              {error}
            </div>
          )}

          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary w-full mb-4"
            >
              <Plus className="h-5 w-5" />
              {t('vault.modals.shareLink.createBtn')}
            </button>
          )}

          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('vault.modals.shareLink.form.title')}</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('vault.modals.shareLink.form.permission')}
                  </label>
                  <select
                    value={newLinkConfig.permission}
                    onChange={(e) => setNewLinkConfig({ ...newLinkConfig, permission: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="view">{t('vault.modals.shareLink.form.permissions.view')}</option>
                    <option value="comment">{t('vault.modals.shareLink.form.permissions.comment')}</option>
                    <option value="edit">{t('vault.modals.shareLink.form.permissions.edit')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('vault.modals.shareLink.form.expiresIn')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newLinkConfig.expiresInDays}
                    onChange={(e) => setNewLinkConfig({ ...newLinkConfig, expiresInDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('vault.modals.shareLink.form.maxUses')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newLinkConfig.maxUses}
                    onChange={(e) => setNewLinkConfig({ ...newLinkConfig, maxUses: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('common.buttons.cancel')}
                  </button>
                  <button
                    onClick={handleCreateLink}
                    disabled={creating}
                    className="btn-primary flex-1"
                  >
                    {creating ? t('vault.modals.shareLink.form.creating') : t('vault.modals.shareLink.form.create')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : shareLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <LinkIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('vault.modals.shareLink.empty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((link) => (
                <div key={link.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium" style={{ backgroundColor: `${vaultColor}15`, color: vaultColor }}>
                          {link.permission}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('vault.modals.shareLink.uses')}: {link.currentUses}{link.maxUses ? `/${link.maxUses}` : ''}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {t('vault.modals.shareLink.expires')}: {formatDate(link.expiresAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded flex-grow overflow-hidden text-ellipsis">
                          {ShareLinkService.generateShareUrl(link.token)}
                        </code>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopyLink(link.token, link.id)}
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                        title={copiedLinkId === link.id ? t('vault.modals.shareLink.copied') : t('vault.modals.shareLink.copy')}
                      >
                        {copiedLinkId === link.id ? '✓' : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeactivateLink(link.id)}
                        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        title={t('vault.modals.shareLink.deactivate')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-cancel w-full"
          >
            {t('common.buttons.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
