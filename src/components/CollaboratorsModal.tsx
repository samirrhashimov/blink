import React, { useState, useEffect } from 'react';
import { X, UserMinus, Eye, Edit3, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SharingService } from '../services/sharingService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import LoadingSkeleton from './LoadingSkeleton';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  authorizedUsers: string[];
  ownerId: string;
  currentUserId: string;
  vaultColor?: string;
}

interface CollaboratorInfo {
  userId: string;
  email: string;
  displayName: string;
  permission: 'view' | 'edit';
  isPending?: boolean;
}

const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  vaultId,
  authorizedUsers,
  ownerId,
  currentUserId,
  vaultColor
}) => {
  const { t } = useTranslation();

  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) loadCollaborators();
  }, [isOpen, vaultId, authorizedUsers]);

  const loadCollaborators = async () => {
    setLoading(true);
    setError('');

    try {
      const permissions = await SharingService.getVaultPermissions(vaultId);
      const pendingInvites = await SharingService.getVaultInvitations(vaultId);
      const collabInfos: CollaboratorInfo[] = [];

      try {
        const ownerDoc = await getDoc(doc(db, 'users', ownerId));
        const ownerData = ownerDoc.exists() ? ownerDoc.data() : {};
        collabInfos.push({
          userId: ownerId,
          email: ownerData?.email || t('vault.modals.collaborators.unknown'),
          displayName: ownerData?.displayName || ownerData?.email || t('vault.modals.collaborators.owner'),
          permission: 'edit',
          isPending: false
        });
      } catch {
        collabInfos.push({
          userId: ownerId,
          email: t('vault.modals.collaborators.unknown'),
          displayName: t('vault.modals.collaborators.owner'),
          permission: 'edit',
          isPending: false
        });
      }

      for (const userId of authorizedUsers) {
        if (userId === ownerId) continue;
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userPermission = permissions.find(p => p.userId === userId);
          const userData = userDoc.exists() ? userDoc.data() : {};
          collabInfos.push({
            userId,
            email: userData?.email || t('vault.modals.collaborators.unknown'),
            displayName: userData?.displayName || userData?.email || 'User',
            permission: (userPermission?.permission === 'edit' ? 'edit' : 'view'),
            isPending: false
          });
        } catch {
          const userPermission = permissions.find(p => p.userId === userId);
          collabInfos.push({
            userId,
            email: t('vault.modals.collaborators.unknown'),
            displayName: t('vault.modals.collaborators.errorLoading'),
            permission: (userPermission?.permission === 'edit' ? 'edit' : 'view'),
            isPending: false
          });
        }
      }

      for (const invite of pendingInvites) {
        const alreadyAccepted = collabInfos.some(c => c.email.toLowerCase() === invite.email.toLowerCase());
        if (!alreadyAccepted) {
          collabInfos.push({
            userId: invite.id,
            email: invite.email,
            displayName: `${invite.email} (${t('vault.modals.collaborators.invited')})`,
            permission: (invite.permission === 'edit' ? 'edit' : 'view'),
            isPending: true
          });
        }
      }

      setCollaborators(collabInfos);
    } catch (err: any) {
      setError(err.message || t('vault.modals.collaborators.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string, isPending: boolean = false) => {
    try {
      setError('');
      if (isPending) await SharingService.cancelInvitation(userId);
      else await SharingService.removeUserFromVault(vaultId, userId);
      await loadCollaborators();
    } catch (err: any) {
      setError(err.message || t('vault.modals.collaborators.errors.removeFailed'));
    }
  };

  const handlePermissionChange = async (userId: string, newPermission: 'view' | 'edit') => {
    try {
      setError('');
      await SharingService.setUserPermission(vaultId, userId, newPermission, currentUserId);
      await loadCollaborators();
    } catch (err: any) {
      setError(err.message || t('vault.modals.collaborators.errors.updateFailed'));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': vaultColor } as React.CSSProperties}
    >
      <div className="modal-content collaborators-modal max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="collaborators-modal-header">
          <h2>{t('vault.modals.collaborators.title')}</h2>
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
              <p className="text-gray-500 dark:text-gray-500">{t('vault.modals.collaborators.empty')}</p>
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
                      <div className="collaborator-avatar-modern">
                        {isOwner ? (
                          <Crown className="h-5 w-5" />
                        ) : (
                          <span>{collab.displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="collaborator-info">
                        <div className="collaborator-name-row">
                          <p className="collaborator-name-modern">{collab.displayName}</p>
                          <div className="collaborator-badges">
                            {isOwner && <span className="badge-modern badge-owner">{t('vault.modals.collaborators.owner')}</span>}
                            {isCurrentUser && !isOwner && <span className="badge-modern badge-you">{t('vault.modals.collaborators.you')}</span>}
                            {isPending && <span className="badge-modern badge-pending">{t('vault.modals.collaborators.pending')}</span>}
                          </div>
                        </div>
                        <p className="collaborator-email-modern">{collab.email}</p>
                      </div>
                    </div>

                    <div className="collaborator-card-actions">
                      {canManageThisUser && !isPending ? (
                        <select
                          value={collab.permission}
                          onChange={(e) => handlePermissionChange(collab.userId, e.target.value as 'view' | 'edit')}
                          className="permission-select-modern"
                        >
                          <option value="view">{t('vault.modals.collaborators.canView')}</option>
                          <option value="edit">{t('vault.modals.collaborators.canEdit')}</option>
                        </select>
                      ) : (
                        <div className="permission-display">
                          {collab.permission === 'view' && <Eye className="h-4 w-4" />}
                          {collab.permission === 'edit' && <Edit3 className="h-4 w-4" />}
                          <span>{collab.permission === 'view' ? t('vault.modals.collaborators.canView') : t('vault.modals.collaborators.canEdit')}</span>
                        </div>
                      )}

                      {canManageThisUser && (
                        <button
                          onClick={() => handleRemoveCollaborator(collab.userId, isPending)}
                          className="remove-btn-modern"
                          title={isPending ? t('vault.modals.collaborators.cancelInvite') : t('vault.modals.collaborators.remove')}
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
      </div>
    </div>
  );
};

export default CollaboratorsModal;
