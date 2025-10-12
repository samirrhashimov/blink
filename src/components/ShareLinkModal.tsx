import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Copy, Trash2, Plus } from 'lucide-react';
import { ShareLinkService, type ShareLink } from '../services/shareLinkService';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  vaultName: string;
  currentUserId: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ 
  isOpen, 
  onClose, 
  vaultId,
  vaultName,
  currentUserId 
}) => {
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
      setError(err.message || 'Failed to load share links');
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
      setError(err.message || 'Failed to create share link');
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
      setError(err.message || 'Failed to deactivate link');
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Share Links</h2>
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
              className="w-full mb-4 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" />
              Create New Share Link
            </button>
          )}

          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">New Share Link</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Permission
                  </label>
                  <select
                    value={newLinkConfig.permission}
                    onChange={(e) => setNewLinkConfig({ ...newLinkConfig, permission: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="view">Can view</option>
                    <option value="comment">Can comment</option>
                    <option value="edit">Can edit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expires in (days, 0 = never)
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
                    Max uses (0 = unlimited)
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
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateLink}
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Link'}
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
              <p>No share links created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((link) => (
                <div key={link.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                          {link.permission}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Uses: {link.currentUses}{link.maxUses ? `/${link.maxUses}` : ''}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Expires: {formatDate(link.expiresAt)}
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
                        title={copiedLinkId === link.id ? 'Copied!' : 'Copy link'}
                      >
                        {copiedLinkId === link.id ? '✓' : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeactivateLink(link.id)}
                        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        title="Deactivate link"
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
