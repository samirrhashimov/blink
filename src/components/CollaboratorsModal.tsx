import React, { useState, useEffect } from 'react';
import { X, UserMinus, Eye, Edit3, AlertCircle, Trash2, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SharingService } from '../services/sharingService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSkeleton from './LoadingSkeleton';
import { useContainer } from '../contexts/ContainerContext';
import { UserService } from '../services/userService';
import { ContainerService } from '../services/containerService';
import type { Link as AppLink } from '../types';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  authorizedUsers: string[];
  ownerId: string;
  currentUserId: string | null;
  containerColor?: string;
}

interface CollaboratorInfo {
  userId: string;
  email: string;
  displayName: string;
  username?: string;
  photoURL?: string;
  permission: 'view' | 'edit';
  isPending?: boolean;
}

const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  containerId,
  authorizedUsers,
  ownerId,
  currentUserId,
  containerColor
}) => {
  const { t } = useTranslation();
  const { containers } = useContainer();

  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [removalTarget, setRemovalTarget] = useState<{ userId: string; isPending: boolean } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStats, setTransferStats] = useState({ count: 0, bytes: 0 });

  const obfuscateEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name[0]}••••@${domain}`;
    return `${name[0]}${'•'.repeat(Math.min(name.length - 2, 8))}${name[name.length - 1]}@${domain}`;
  };

  useEffect(() => {
    if (isOpen) loadCollaborators();
  }, [isOpen, containerId, authorizedUsers]);

  const loadCollaborators = async () => {
    setLoading(true);
    setError('');

    try {
      const permissionsResult = await SharingService.getContainerPermissions(containerId).catch(() => []);
      const pendingInvites = await SharingService.getContainerInvitations(containerId).catch(() => []);
      const collabInfos: CollaboratorInfo[] = [];

      // Only try to load owner if ownerId is provided
      if (ownerId) {
        try {
          const ownerDoc = await getDoc(doc(db, 'users', ownerId));
          const ownerData = ownerDoc.exists() ? ownerDoc.data() : {};
          collabInfos.push({
            userId: ownerId,
            email: ownerData?.email || t('container.modals.collaborators.unknown'),
            displayName: ownerData?.displayName || ownerData?.email || t('container.modals.collaborators.owner'),
            username: ownerData?.username,
            photoURL: ownerData?.photoURL,
            permission: 'edit',
            isPending: false
          });
        } catch (err) {
          console.error('Error loading owner doc:', err);
          collabInfos.push({
            userId: ownerId,
            email: t('container.modals.collaborators.unknown'),
            displayName: t('container.modals.collaborators.owner'),
            permission: 'edit',
            isPending: false
          });
        }
      }

      const usersToLoad = authorizedUsers || [];
      for (const userId of usersToLoad) {
        if (!userId || userId === ownerId) continue;
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userPermission = permissionsResult.find(p => p.userId === userId);
          const userData = userDoc.exists() ? userDoc.data() : {};
          collabInfos.push({
            userId,
            email: userData?.email || t('container.modals.collaborators.unknown'),
            displayName: userData?.displayName || userData?.email || 'User',
            username: userData?.username,
            photoURL: userData?.photoURL,
            permission: (userPermission?.permission === 'edit' ? 'edit' : 'view'),
            isPending: false
          });
        } catch (err) {
          console.error(`Error loading collaborator doc for ${userId}:`, err);
          const userPermission = permissionsResult.find(p => p.userId === userId);
          collabInfos.push({
            userId,
            email: t('container.modals.collaborators.unknown'),
            displayName: t('container.modals.collaborators.errorLoading'),
            permission: (userPermission?.permission === 'edit' ? 'edit' : 'view'),
            isPending: false
          });
        }
      }

      for (const invite of pendingInvites) {
        if (!invite.email) continue;
        const alreadyAccepted = collabInfos.some(c => c.email.toLowerCase() === invite.email.toLowerCase());
        if (!alreadyAccepted) {
          collabInfos.push({
            userId: invite.id,
            email: invite.email,
            displayName: `${obfuscateEmail(invite.email)} (${t('container.modals.collaborators.invited')})`,
            permission: (invite.permission === 'edit' ? 'edit' : 'view'),
            isPending: true
          });
        }
      }

      setCollaborators(collabInfos);
    } catch (err: any) {
      console.error('Core loadCollaborators error:', err);
      setError(err.message || t('container.modals.collaborators.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string, isPending: boolean = false) => {
    if (isPending) {
      try {
        setError('');
        await SharingService.cancelInvitation(userId);
        await loadCollaborators();
      } catch (err: any) {
        setError(err.message || t('container.modals.collaborators.errors.removeFailed'));
      }
      return;
    }

    const container = containers.find(c => c.id === containerId);
    const userLinks = container?.links.filter((l: AppLink) => l.createdBy === userId && l.type === 'file') || [];
    
    if (userLinks.length > 0) {
      const totalBytes = userLinks.reduce((sum: number, l: AppLink) => sum + (l.fileData?.bytes || 0), 0);
      setTransferStats({ count: userLinks.length, bytes: totalBytes });
      setRemovalTarget({ userId, isPending });
      setShowTransferModal(true);
    } else {
      await proceedWithRemoval(userId);
    }
  };

  const deleteCloudinaryFile = async (publicId: string, resourceType?: string) => {
    try {
      await fetch('/.netlify/functions/deleteFile', {
        method: 'POST',
        body: JSON.stringify({ publicId, resourceType })
      });
    } catch (err) {
      console.error('Failed to delete file from Cloudinary:', err);
    }
  };

  const proceedWithRemoval = async (userId: string, transferOwnership: boolean = false) => {
    try {
      setLoading(true);
      setError('');
      
      const container = containers.find(c => c.id === containerId);

      if (container && currentUserId) {
        const userFiles = container.links.filter((l: AppLink) => l.createdBy === userId && l.type === 'file');
        
        if (transferOwnership) {
          const totalBytes = userFiles.reduce((sum: number, l: AppLink) => sum + (l.fileData?.bytes || 0), 0);

          // 2. Update links metadata locally first if we want
          const updatedLinks = container.links.map((l: AppLink) => {
            if (l.createdBy === userId && l.type === 'file') {
              return { ...l, createdBy: currentUserId, updatedAt: new Date() };
            }
            return l;
          });

          // 3. Update the container in Firestore with new ownership
          const containerRef = doc(db, 'vaults', containerId);
          await updateDoc(containerRef, {
            links: updatedLinks,
            updatedAt: new Date()
          });

          // 4. Update quotas: Subtract from leaving user, add to admin
          await UserService.updateStorageUsage(userId, -totalBytes);
          await UserService.updateStorageUsage(currentUserId, totalBytes);
        } else {
          // 1. Delete from Cloudinary
          for (const file of userFiles) {
            if (file.fileData?.publicId) {
              await deleteCloudinaryFile(file.fileData.publicId, file.fileData.resourceType);
            }
          }

          // 2. Clear from container 
          if (userFiles.length > 0) {
            const fileIdsToDelete = userFiles.map(l => l.id);
            const totalBytesToDelete = userFiles.reduce((sum: number, l: AppLink) => sum + (l.fileData?.bytes || 0), 0);
            
            // Subtract quota manually first to be absolutely sure
            await UserService.updateStorageUsage(userId, -totalBytesToDelete);
            
            // Then remove from container
            await ContainerService.deleteLinksFromContainer(containerId, fileIdsToDelete);
          }
        }
      }

      await SharingService.removeUserFromContainer(containerId, userId);
      
      await loadCollaborators();
      setShowTransferModal(false);
      setRemovalTarget(null);
      
      // Refresh page to update quotas everywhere
      window.location.reload();
    } catch (err: any) {
      setError(err.message || t('container.modals.collaborators.errors.removeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (userId: string, newPermission: 'view' | 'edit') => {
    try {
      if (!currentUserId) return;
      setError('');
      await SharingService.setUserPermission(containerId, userId, newPermission, currentUserId);
      await loadCollaborators();
    } catch (err: any) {
      setError(err.message || t('container.modals.collaborators.errors.updateFailed'));
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': containerColor } as React.CSSProperties}
    >
      <div className="modal-content collaborators-modal max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="collaborators-modal-header">
          <h2>{t('container.modals.collaborators.title')}</h2>
          <button onClick={onClose} className="collaborators-modal-close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="collaborators-modal-body overflow-y-auto flex-grow">
          {error && <div className="error-message mb-4">{error}</div>}

          {loading ? (
            <div className="py-8">
              <LoadingSkeleton variant="card" count={2} />
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-500">{t('container.modals.collaborators.empty')}</p>
            </div>
          ) : (
            <div className="collaborators-list-modern">
              {collaborators.map((collab) => {
                const isOwner = collab.userId === ownerId;
                const isCurrentUser = collab.userId === currentUserId;
                const canManageThisUser = currentUserId === ownerId && !isOwner;
                const isPending = collab.isPending || false;

                return (
                  <div key={collab.userId} className="collaborator-card">
                    <div className="collaborator-card-main">
                      {collab.username ? (
                        <Link to={`/profile/${collab.username}`} className="collaborator-avatar-modern shrink-0 hover:opacity-80 transition-opacity overflow-hidden">
                          {collab.photoURL ? (
                            <img src={collab.photoURL} alt={collab.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{collab.displayName.charAt(0).toUpperCase()}</span>
                          )}
                        </Link>
                      ) : (
                        <div className="collaborator-avatar-modern shrink-0 relative">
                          <span>{collab.displayName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}

                      <div className="collaborator-info min-w-0">
                        <div className="collaborator-name-row flex flex-wrap items-center gap-x-2">
                          {collab.username ? (
                            <Link to={`/profile/${collab.username}`} className="collaborator-name-modern hover:underline decoration-primary/50">
                              {collab.displayName}
                            </Link>
                          ) : (
                            <p className="collaborator-name-modern">{collab.displayName}</p>
                          )}
                          <div className="collaborator-badges flex gap-1">
                            {isOwner && <span className="badge-modern badge-owner">{t('container.modals.collaborators.owner')}</span>}
                            {isCurrentUser && !isOwner && <span className="badge-modern badge-you">{t('container.modals.collaborators.you')}</span>}
                            {isPending && <span className="badge-modern badge-pending">{t('container.modals.collaborators.pending')}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          {collab.username && <p className="text-xs text-gray-500 dark:text-gray-400">@{collab.username}</p>}
                          <p className="collaborator-email-modern truncate">{obfuscateEmail(collab.email)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="collaborator-card-actions">
                      {canManageThisUser && !isPending ? (
                        <select
                          value={collab.permission}
                          onChange={(e) => handlePermissionChange(collab.userId, e.target.value as 'view' | 'edit')}
                          className="permission-select-modern"
                        >
                          <option value="view">{t('container.modals.collaborators.canView')}</option>
                          <option value="edit">{t('container.modals.collaborators.canEdit')}</option>
                        </select>
                      ) : (
                        <div className="permission-display">
                          {collab.permission === 'view' && <Eye className="h-4 w-4" />}
                          {collab.permission === 'edit' && <Edit3 className="h-4 w-4" />}
                          <span>{collab.permission === 'view' ? t('container.modals.collaborators.canView') : t('container.modals.collaborators.canEdit')}</span>
                        </div>
                      )}

                      {canManageThisUser && (
                        <button
                          onClick={() => handleRemoveCollaborator(collab.userId, isPending)}
                          className="remove-btn-modern"
                          title={isPending ? t('container.modals.collaborators.cancelInvite') : t('container.modals.collaborators.remove')}
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="collaborators-modal-footer">
          <button onClick={onClose} className="close-btn-modern">{t('common.buttons.close')}</button>
        </div>

        {/* Transfer Ownership Modal */}
        {showTransferModal && (
          <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
            <div className="modal-content max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <AlertCircle size={24} />
                <h3 className="text-xl font-bold">{t('container.modals.transfer.title', 'User Removal')}</h3>
              </div>
              
              <p className="mb-6 text-[var(--text-secondary)]">
                {t('container.modals.transfer.desc', 'The user you are removing has {{count}} files ({{size}}). What would you like to do with them?', { 
                  count: transferStats.count, 
                  size: formatBytes(transferStats.bytes) 
                })}
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => removalTarget && proceedWithRemoval(removalTarget.userId, true)}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  style={{ background: 'linear-gradient(135deg, var(--primary), #818cf8)' }}
                >
                  <UserPlus size={18} />
                  <div className="text-left">
                    <div className="font-bold">{t('container.modals.transfer.keep', 'Transfer to Me')}</div>
                    <div className="text-[10px] opacity-80">{t('container.modals.transfer.keepDesc', 'Files will consume your storage quota.')}</div>
                  </div>
                </button>

                <button 
                  onClick={() => removalTarget && proceedWithRemoval(removalTarget.userId, false)}
                  className="btn-danger w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                  <div className="text-left">
                    <div className="font-bold">{t('container.modals.transfer.delete', 'Delete Files')}</div>
                    <div className="text-[10px] opacity-80">{t('container.modals.transfer.deleteDesc', 'Permanently delete user\'s files.')}</div>
                  </div>
                </button>

                <button 
                   onClick={() => setShowTransferModal(false)}
                   className="btn-cancel w-full py-3"
                >
                  {t('common.buttons.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorsModal;
