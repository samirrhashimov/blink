import React, { useState, useEffect } from 'react';
import { X, UserMinus, Eye, MessageCircle, Edit3, Crown } from 'lucide-react';
import { SharingService } from '../services/sharingService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  authorizedUsers: string[];
  ownerId: string;
  currentUserId: string;
}

interface CollaboratorInfo {
  userId: string;
  email: string;
  displayName: string;
  permission: 'view' | 'comment' | 'edit';
  isPending?: boolean;
}

const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({ 
  isOpen, 
  onClose, 
  vaultId,
  authorizedUsers,
  ownerId,
  currentUserId
}) => {
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, vaultId, authorizedUsers]);

  const loadCollaborators = async () => {
    setLoading(true);
    setError('');
    
    try {
      const permissions = await SharingService.getVaultPermissions(vaultId);
      const pendingInvites = await SharingService.getVaultInvitations(vaultId);
      const collabInfos: CollaboratorInfo[] = [];

      // Add owner first
      try {
        const ownerDoc = await getDoc(doc(db, 'users', ownerId));
        if (ownerDoc.exists()) {
          const ownerData = ownerDoc.data();
          collabInfos.push({
            userId: ownerId,
            email: ownerData.email || 'Unknown',
            displayName: ownerData.displayName || ownerData.email || 'Owner',
            permission: 'edit', // Owner always has edit permission
            isPending: false
          });
        } else {
          // Fallback if owner document doesn't exist
          collabInfos.push({
            userId: ownerId,
            email: 'Unknown',
            displayName: 'Owner',
            permission: 'edit',
            isPending: false
          });
        }
      } catch (err) {
        console.error('Error loading owner:', err);
        // Still add owner even if there's an error
        collabInfos.push({
          userId: ownerId,
          email: 'Unknown',
          displayName: 'Owner',
          permission: 'edit',
          isPending: false
        });
      }

      // Add other authorized users
      for (const userId of authorizedUsers) {
        if (userId === ownerId) continue; // Skip owner, already added
        
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userPermission = permissions.find(p => p.userId === userId);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            collabInfos.push({
              userId,
              email: userData.email || 'Unknown',
              displayName: userData.displayName || userData.email || 'User',
              permission: userPermission?.permission || 'view',
              isPending: false
            });
          } else {
            // User document doesn't exist yet - show as accepted but with placeholder
            collabInfos.push({
              userId,
              email: 'Unknown',
              displayName: 'User (No profile)',
              permission: userPermission?.permission || 'view',
              isPending: false
            });
          }
        } catch (err) {
          console.error('Error loading user:', err);
          // Still add the user with placeholder data
          const userPermission = permissions.find(p => p.userId === userId);
          collabInfos.push({
            userId,
            email: 'Unknown',
            displayName: 'User (Error loading)',
            permission: userPermission?.permission || 'view',
            isPending: false
          });
        }
      }

      // Add pending invitations
      for (const invite of pendingInvites) {
        // Check if this email is already in the collaborators (accepted)
        const alreadyAccepted = collabInfos.some(c => c.email.toLowerCase() === invite.email.toLowerCase());
        if (!alreadyAccepted) {
          collabInfos.push({
            userId: invite.id, // Use invite ID as temporary userId
            email: invite.email,
            displayName: `${invite.email} (Invited)`,
            permission: invite.permission,
            isPending: true
          });
        }
      }

      setCollaborators(collabInfos);
    } catch (err: any) {
      setError(err.message || 'Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string, isPending: boolean = false) => {
    try {
      setError('');
      if (isPending) {
        // If it's a pending invitation, cancel the invite
        await SharingService.cancelInvitation(userId);
      } else {
        // Otherwise remove the user from the vault
        await SharingService.removeUserFromVault(vaultId, userId);
      }
      await loadCollaborators();
    } catch (err: any) {
      setError(err.message || 'Failed to remove collaborator');
    }
  };

  const handlePermissionChange = async (userId: string, newPermission: 'view' | 'comment' | 'edit') => {
    try {
      setError('');
      await SharingService.setUserPermission(vaultId, userId, newPermission, currentUserId);
      await loadCollaborators();
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Collaborators</h2>
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

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading collaborators...</p>
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No collaborators yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collaborators.map((collab) => {
                const isOwner = collab.userId === ownerId;
                const isCurrentUser = collab.userId === currentUserId;
                const canManageThisUser = currentUserId === ownerId && !isOwner;
                const isPending = collab.isPending || false;
                
                return (
                  <div key={collab.userId} className="collaborator-item">
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                      <div className="collaborator-avatar">
                        {isOwner ? (
                          <Crown className="h-5 w-5 text-amber-500" />
                        ) : (
                          collab.displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="collaborator-name">
                            {collab.displayName}
                          </p>
                          {isOwner && <span className="status-badge status-badge-owner">Owner</span>}
                          {isCurrentUser && !isOwner && <span className="status-badge status-badge-you">You</span>}
                          {isPending && <span className="status-badge status-badge-pending">Pending</span>}
                        </div>
                        <p className="collaborator-email">{collab.email}</p>
                        <div className="mt-2">
                          {canManageThisUser && !isPending ? (
                            <select
                              value={collab.permission}
                              onChange={(e) => handlePermissionChange(collab.userId, e.target.value as 'view' | 'comment' | 'edit')}
                              className="permission-select"
                            >
                              <option value="view">👁️ Can view</option>
                              <option value="comment">💬 Can comment</option>
                              <option value="edit">✏️ Can edit</option>
                            </select>
                          ) : (
                            <span className={`permission-badge permission-badge-${collab.permission}`}>
                              {collab.permission === 'view' && <Eye className="h-3 w-3" />}
                              {collab.permission === 'comment' && <MessageCircle className="h-3 w-3" />}
                              {collab.permission === 'edit' && <Edit3 className="h-3 w-3" />}
                              <span className="capitalize">
                                {collab.permission === 'view' ? 'Can view' : collab.permission === 'comment' ? 'Can comment' : 'Can edit'}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canManageThisUser && (
                      <button
                        onClick={() => handleRemoveCollaborator(collab.userId, isPending)}
                        className="collaborator-remove-btn"
                        title={isPending ? 'Cancel invitation' : 'Remove collaborator'}
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
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

export default CollaboratorsModal;
