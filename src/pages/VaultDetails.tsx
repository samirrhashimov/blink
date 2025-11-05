import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useVault } from '../contexts/VaultContext';
import { useToast } from '../contexts/ToastContext';
import { SharingService } from '../services/sharingService';
import { UserService } from '../services/userService';
import LinkPreviewService from '../services/linkPreviewService';
import type { Link as LinkType } from '../types';
import blinkLogo from '../assets/blinklogo2.png';
import { 
  LinkIcon,
  ArrowLeft, 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  Share2, 
  Moon,
  Sun,
  Settings,
  ExternalLink,
  Users,
  LogOut,
  Search
} from 'lucide-react';
import AddLinkModal from '../components/AddLinkModal';
import EditLinkModal from '../components/EditLinkModal';
import EditVaultModal from '../components/EditVaultModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CollaboratorsModal from '../components/CollaboratorsModal';
import ShareLinkModal from '../components/ShareLinkModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const VaultDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { vaults, loading, error, deleteLinkFromVault, deleteVault } = useVault();
  const navigate = useNavigate();
  const toast = useToast();
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [showEditVaultModal, setShowEditVaultModal] = useState(false);
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);
  const [showDeleteVaultModal, setShowDeleteVaultModal] = useState(false);
  const [showLeaveVaultModal, setShowLeaveVaultModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [userPermission, setUserPermission] = useState<'view' | 'comment' | 'edit' | null>(null);
  const [collaboratorNames, setCollaboratorNames] = useState<Record<string, string>>({});

  // Find the current vault from the vaults array
  const vault = vaults.find(v => v.id === id) || null;
  
  // Debug vault data
  useEffect(() => {
    if (vault) {
      console.log('Current vault data:', {
        id: vault.id,
        name: vault.name,
        ownerId: vault.ownerId,
        authorizedUsers: vault.authorizedUsers,
        currentUserId: currentUser?.uid
      });
    }
  }, [vault, currentUser]);

  // Load collaborator names (including owner if not current user)
  useEffect(() => {
    const loadCollaboratorNames = async () => {
      if (!vault) {
        console.log('No vault to load');
        return;
      }
      
      console.log('Loading collaborator names...');
      console.log('Vault owner:', vault.ownerId);
      console.log('Authorized users:', vault.authorizedUsers);
      console.log('Current user:', currentUser?.uid);
      
      const names: Record<string, string> = {};
      const userIdsToFetch = new Set<string>();
      
      // Add owner if not current user
      if (vault.ownerId && vault.ownerId !== currentUser?.uid) {
        userIdsToFetch.add(vault.ownerId);
      }
      
      // Add all authorized users who are not current user
      if (vault.authorizedUsers && vault.authorizedUsers.length > 0) {
        vault.authorizedUsers.forEach(userId => {
          if (userId !== currentUser?.uid) {
            userIdsToFetch.add(userId);
          }
        });
      }
      
      console.log('Fetching names for users:', Array.from(userIdsToFetch));
      
      // Fetch names for all users
      await Promise.all(
        Array.from(userIdsToFetch).map(async (userId) => {
          try {
            console.log(`Fetching name for user: ${userId}`);
            const name = await UserService.getUserDisplayName(userId);
            console.log(`Got name for ${userId}: ${name}`);
            names[userId] = name;
          } catch (err) {
            console.error(`Failed to fetch name for user ${userId}:`, err);
            names[userId] = 'User';
          }
        })
      );
      
      console.log('All collaborator names loaded:', names);
      setCollaboratorNames(names);
    };
    
    loadCollaboratorNames();
  }, [vault?.ownerId, vault?.authorizedUsers, currentUser?.uid]);

  // Load user permission for this vault
  useEffect(() => {
    const loadUserPermission = async () => {
      if (!vault || !currentUser) return;
      
      // Owner has full permissions
      if (vault.ownerId === currentUser.uid) {
        setUserPermission('edit');
        return;
      }
      
      // Check permission for shared users
      const permission = await SharingService.getUserPermission(vault.id, currentUser.uid);
      setUserPermission(permission?.permission || null);
    };
    
    loadUserPermission();
  }, [vault?.id, currentUser]);

  // Filter links based on search query
  const filteredLinks = vault?.links.filter(link => {
    const query = linkSearchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.description?.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  }) || [];

  const copyToClipboard = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleEditLink = (link: LinkType) => {
    setSelectedLink(link);
    setShowEditLinkModal(true);
  };

  const handleDeleteLink = (link: LinkType) => {
    setSelectedLink(link);
    setShowDeleteLinkModal(true);
  };

  const confirmDeleteLink = async () => {
    if (!selectedLink || !vault) return;
    try {
      await deleteLinkFromVault(vault.id, selectedLink.id);
      setShowDeleteLinkModal(false);
      setSelectedLink(null);
      toast.success('Link deleted successfully');
    } catch (err: any) {
      console.error('Error deleting link:', err);
      toast.error(err.message || 'Failed to delete link');
    }
  };

  const confirmDeleteVault = async () => {
    if (!vault) return;
    try {
      await deleteVault(vault.id);
      setShowDeleteVaultModal(false);
      toast.success('Vault deleted successfully');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error deleting vault:', err);
      toast.error(err.message || 'Failed to delete vault');
      setShowDeleteVaultModal(false);
    }
  };

  const confirmLeaveVault = async () => {
    if (!vault || !currentUser) return;
    try {
      await SharingService.removeUserFromVault(vault.id, currentUser.uid);
      setShowLeaveVaultModal(false);
      toast.success('Left vault successfully');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error leaving vault:', err);
      toast.error(err.message || 'Failed to leave vault');
      setShowLeaveVaultModal(false);
    }
  };

  // Check if current user is the owner
  const isOwner = vault?.ownerId === currentUser?.uid;
  
  // Check if user can edit (owner or has edit permission)
  const canEdit = isOwner || userPermission === 'edit';

  if (loading) {
    return <LoadingSkeleton variant="fullscreen" />;
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vault not found</h1>
          <Link to="/dashboard" className="text-primary hover:text-primary/80">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-details-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to="/dashboard" className="back-link">
                <ArrowLeft />
              </Link>
              <img src={blinkLogo} alt="Blink" className="logo-image" style={{height: '40px', width: 'auto', marginLeft: '1rem'}} />
            </div>
            <nav className="main-nav">
              <Link to="/dashboard">Home</Link>
              <span className="active-link">My Links</span>
            </nav>
            <div className="header-right">
              <button onClick={toggleTheme} className="theme-toggle mediaforbuttons">
                {theme === 'light' ? <Moon /> : <Sun />}
              </button>
              <Link to="/settings" className="settings-link mediaforbuttons">
                <Settings />
              </Link>
              <div className="user-avatar">
                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="vault-header">
          <h2>{vault.name}</h2>
          <p>{vault.description}</p>
        </div>

        <div className="vault-content">
          <div className="links-section">
            <div className="links-header">
              <h3>Links ({vault.links.length})</h3>
              {canEdit && (
                <button onClick={() => setShowAddLinkModal(true)} className="add-link-button">
                  <Plus />
                  Add Link
                </button>
              )}
            </div>

            {/* Search Input */}
            {vault.links.length > 0 && (
              <div className="modern-search-bar mb-4">
                <Search className="modern-search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  className="modern-search-input"
                />
              </div>
            )}

            <div className="links-list">
              {vault.links.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No links yet. Click "Add Link" to get started.</p>
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No links match your search.</p>
                </div>
              ) : (
                filteredLinks.map((link) => {
                  const faviconUrl = LinkPreviewService.getPreviewImage(link);
                  return (
                  <div key={link.id} className="link-item">
                    <div className="link-item-content">
                      <div className="link-icon">
                        {faviconUrl ? (
                          <img 
                            src={faviconUrl} 
                            alt={`${link.title} favicon`}
                            className="link-favicon"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.lucide-link')) {
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
                                parent.appendChild(icon.firstChild!);
                              }
                            }}
                          />
                        ) : (
                          <LinkIcon />
                        )}
                      </div>
                      <div className="link-info">
                        <h4 className="font-medium text-gray-900 dark:text-white">{link.title}</h4>
                        {link.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
                        )}
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          {link.url}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                    <div className="link-item-actions">
                      <button 
                        onClick={() => copyToClipboard(link.url, link.id)} 
                        className="copy-button"
                        title={copiedLinkId === link.id ? 'Copied!' : 'Copy URL'}
                      >
                        {copiedLinkId === link.id ? '✓' : <Copy />}
                      </button>
                      {canEdit && (
                        <>
                          <button 
                            onClick={() => handleEditLink(link)} 
                            className="copy-button"
                            title="Edit link"
                          >
                            <Edit />
                          </button>
                          <button 
                            onClick={() => handleDeleteLink(link)} 
                            className="copy-button text-red-600 dark:text-red-400"
                            title="Delete link"
                          >
                            <Trash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>

          <aside className="sidebar">
            <div className="collaborators-widget">
              <h3>Collaborators</h3>
              <div className="collaborators-list">
                {/* Current User */}
                <div className="avatar" title={currentUser?.displayName || 'You (Owner)'}>
                  {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                {/* Owner (if not current user) */}
                {vault.ownerId !== currentUser?.uid && (
                  <div 
                    key={vault.ownerId} 
                    className="avatar" 
                    title={`${collaboratorNames[vault.ownerId] || 'Owner'} (Owner)`}
                  >
                    {(collaboratorNames[vault.ownerId] || 'O').charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Other Authorized Users (excluding owner and current user) */}
                {vault.authorizedUsers
                  .filter(userId => userId !== currentUser?.uid && userId !== vault.ownerId)
                  .slice(0, 2)
                  .map((userId) => {
                    const userName = collaboratorNames[userId] || 'Loading...';
                    return (
                      <div key={userId} className="avatar" title={userName}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    );
                  })}
                
                {/* Show +N more if there are additional collaborators */}
                {(() => {
                  const otherUsers = vault.authorizedUsers.filter(
                    userId => userId !== currentUser?.uid && userId !== vault.ownerId
                  );
                  const remainingCount = otherUsers.length - 2;
                  return remainingCount > 0 && (
                    <div className="avatar" title={`+${remainingCount} more`}>
                      +{remainingCount}
                    </div>
                  );
                })()}
              </div>
              <div className="flex gap-3 mt-3">
                {canEdit && (
                  <Link to={`/vault/${vault.id}/share`} className="manage-collaborators-button flex-1">
                    <Share2 />
                    Invite
                  </Link>
                )}
                <button 
                  onClick={() => setShowCollaboratorsModal(true)}
                  className="manage-collaborators-button flex-1"
                >
                  <Users />
                  Manage
                </button>
              </div>
            </div>

            <div className="actions-widget">
              <h3>Actions</h3>
              <div className="actions-list">
                {isOwner && (
                  <button 
                    onClick={() => setShowEditVaultModal(true)}
                    className="action-button"
                  >
                    <Edit />
                    <span>Edit Container</span>
                  </button>
                )}
                {isOwner ? (
                  <button 
                    onClick={() => setShowDeleteVaultModal(true)}
                    className="action-button delete-button"
                  >
                    <Trash2 />
                    <span>Delete Container</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowLeaveVaultModal(true)}
                    className="action-button delete-button"
                  >
                    <LogOut />
                    <span>Leave Container</span>
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>

      {/* Add Link Modal */}
      {vault && canEdit && (
        <AddLinkModal 
          isOpen={showAddLinkModal} 
          onClose={() => setShowAddLinkModal(false)}
          vaultId={vault.id}
        />
      )}

      {/* Edit Link Modal */}
      {vault && selectedLink && canEdit && (
        <EditLinkModal 
          isOpen={showEditLinkModal} 
          onClose={() => {
            setShowEditLinkModal(false);
            setSelectedLink(null);
          }}
          vaultId={vault.id}
          link={selectedLink}
        />
      )}

      {/* Edit Vault Modal */}
      {vault && isOwner && (
        <EditVaultModal 
          isOpen={showEditVaultModal} 
          onClose={() => setShowEditVaultModal(false)}
          vault={vault}
        />
      )}

      {/* Delete Link Confirmation */}
      {selectedLink && (
        <DeleteConfirmModal 
          isOpen={showDeleteLinkModal} 
          onClose={() => {
            setShowDeleteLinkModal(false);
            setSelectedLink(null);
          }}
          onConfirm={confirmDeleteLink}
          title="Delete Link"
          message="Are you sure you want to delete this link?"
          itemName={selectedLink.title}
        />
      )}

      {/* Delete Vault Confirmation */}
      {vault && (
        <DeleteConfirmModal 
          isOpen={showDeleteVaultModal} 
          onClose={() => setShowDeleteVaultModal(false)}
          onConfirm={confirmDeleteVault}
          title="Delete Vault"
          message="Are you sure you want to delete this vault? All links will be permanently deleted."
          itemName={vault.name}
        />
      )}

      {/* Leave Vault Confirmation */}
      {vault && (
        <DeleteConfirmModal 
          isOpen={showLeaveVaultModal} 
          onClose={() => setShowLeaveVaultModal(false)}
          onConfirm={confirmLeaveVault}
          title="Leave Vault"
          message="Are you sure you want to leave this vault? You will lose access to all its contents."
          itemName={vault.name}
        />
      )}

      {/* Collaborators Modal */}
      {vault && currentUser && (
        <CollaboratorsModal 
          isOpen={showCollaboratorsModal} 
          onClose={() => setShowCollaboratorsModal(false)}
          vaultId={vault.id}
          authorizedUsers={vault.authorizedUsers}
          ownerId={vault.ownerId}
          currentUserId={currentUser.uid}
        />
      )}

      {/* Share Link Modal */}
      {vault && currentUser && (
        <ShareLinkModal 
          isOpen={showShareLinkModal} 
          onClose={() => setShowShareLinkModal(false)}
          vaultId={vault.id}
          vaultName={vault.name}
          currentUserId={currentUser.uid}
        />
      )}
    </div>
  );
};

export default VaultDetails;
