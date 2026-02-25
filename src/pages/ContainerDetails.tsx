import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useContainer } from '../contexts/ContainerContext';
import { useToast } from '../contexts/ToastContext';
import { SharingService } from '../services/sharingService';
import { NotificationService } from '../services/notificationService';
import { UserService } from '../services/userService';
import type { Link as LinkType } from '../types';
import blinkLogo from '../assets/blinklogo2.png';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Share2,
  Settings,
  Users,
  LogOut,
  Search,
  CheckSquare,
  XCircle,
  ArrowRightLeft
} from 'lucide-react';
import AddLinkModal from '../components/AddLinkModal';
import EditLinkModal from '../components/EditLinkModal';
import EditContainerModal from '../components/EditContainerModal';
import ConfirmModal from '../components/ConfirmModal';
import CollaboratorsModal from '../components/CollaboratorsModal';
import ShareLinkModal from '../components/ShareLinkModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SortableLinkItem from '../components/SortableLinkItem';
import MoveLinkModal from '../components/MoveLinkModal';
import LinkStatsModal from '../components/LinkStatsModal';
import QRCodeModal from '../components/QRCodeModal';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { useTranslation } from 'react-i18next';

const ContainerDetails: React.FC = () => {
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const {
    containers,
    loading,
    error,
    deleteLinkFromContainer,
    deleteLinksFromContainer,
    deleteContainer,
    reorderLinks,
    updateLinkInContainer,
    trackClick,
    refreshContainers
  } = useContainer();
  const navigate = useNavigate();
  const toast = useToast();
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);

  // Expose setShowAddLinkModal to window for mobile navigation
  useEffect(() => {
    (window as any).dispatchSetShowAddLinkModal = setShowAddLinkModal;
    return () => {
      delete (window as any).dispatchSetShowAddLinkModal;
    };
  }, []);
  const [showEditContainerModal, setShowEditContainerModal] = useState(false);
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);
  const [showDeleteContainerModal, setShowDeleteContainerModal] = useState(false);
  const [showLeaveContainerModal, setShowLeaveContainerModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showMoveLinkModal, setShowMoveLinkModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [userPermission, setUserPermission] = useState<'view' | 'comment' | 'edit' | null>(null);
  const [collaboratorNames, setCollaboratorNames] = useState<Record<string, string>>({});
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Bulk Selection State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedLinkIds(new Set());
  };

  const handleSelectLink = (link: LinkType) => {
    const newSelected = new Set(selectedLinkIds);
    if (newSelected.has(link.id)) {
      newSelected.delete(link.id);
    } else {
      newSelected.add(link.id);
    }
    setSelectedLinkIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLinkIds.size === filteredLinks.length) {
      setSelectedLinkIds(new Set());
    } else {
      setSelectedLinkIds(new Set(filteredLinks.map(l => l.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedLinkIds.size === 0) return;
    setShowDeleteConfirmModal(true);
  };

  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [deletingLinkIds, setDeletingLinkIds] = useState<Set<string>>(new Set());
  const [newlyAddedLinkId, setNewlyAddedLinkId] = useState<string | null>(null);

  const [softDeletedLinks, setSoftDeletedLinks] = useState<Set<string>>(new Set());
  const deleteTimers = useRef<Record<string, any>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);


  const confirmBulkDelete = async () => {
    try {
      if (!container) return;

      // Close modal immediately so animation is visible
      setShowDeleteConfirmModal(false);

      setDeletingLinkIds(new Set(selectedLinkIds));

      // Wait for animation (400ms match CSS)
      await new Promise(resolve => setTimeout(resolve, 400));

      await deleteLinksFromContainer(container.id, Array.from(selectedLinkIds));
      toast.success(t('container.messages.deleted', { count: selectedLinkIds.size }));
      setSelectionMode(false);
      setSelectedLinkIds(new Set());
      setDeletingLinkIds(new Set());
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      toast.error(err.message || t('container.messages.deleteError'));
      setDeletingLinkIds(new Set());
      throw err;
    }
  };



  const handleBulkMove = () => {
    if (selectedLinkIds.size === 0) return;
    setShowBulkMoveModal(true);
  };

  // Navbar scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show navbar at top
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar
        setShowNavbar(false);
      } else {
        // Scrolling up - show navbar
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Find the current container from the containers array
  const container = containers.find(v => v.id === id) || null;

  // Debug container data
  useEffect(() => {
    if (container) {
      console.log('Current container data:', {
        id: container.id,
        name: container.name,
        ownerId: container.ownerId,
        authorizedUsers: container.authorizedUsers,
        currentUserId: currentUser?.uid
      });
    }
  }, [container, currentUser]);

  // Load collaborator names (including owner if not current user)
  useEffect(() => {
    const loadCollaboratorNames = async () => {
      if (!container) {
        console.log('No container to load');
        return;
      }

      console.log('Loading collaborator names...');
      console.log('Container owner:', container.ownerId);
      console.log('Authorized users:', container.authorizedUsers);
      console.log('Current user:', currentUser?.uid);

      const names: Record<string, string> = {};
      const userIdsToFetch = new Set<string>();

      // Add owner if not current user
      if (container.ownerId && container.ownerId !== currentUser?.uid) {
        userIdsToFetch.add(container.ownerId);
      }

      // Add all authorized users who are not current user
      if (container.authorizedUsers && container.authorizedUsers.length > 0) {
        container.authorizedUsers.forEach(userId => {
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
  }, [container?.ownerId, container?.authorizedUsers, currentUser?.uid]);

  // Load user permission for this container
  useEffect(() => {
    const loadUserPermission = async () => {
      if (!container || !currentUser) return;

      // Owner has full permissions
      if (container.ownerId === currentUser.uid) {
        setUserPermission('edit');
        return;
      }

      // Check permission for shared users
      const permission = await SharingService.getUserPermission(container.id, currentUser.uid);
      setUserPermission(permission?.permission || null);
    };

    loadUserPermission();
  }, [container?.id, currentUser]);

  // Handle Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && container) {
      const oldIndex = container.links.findIndex((l) => l.id === active.id);
      const newIndex = container.links.findIndex((l) => l.id === over.id);

      const newLinks = arrayMove(container.links, oldIndex, newIndex);

      try {
        await reorderLinks(container.id, newLinks);
        toast.success(t('container.messages.orderUpdated'));
      } catch (err: any) {
        toast.error(t('container.messages.updateOrderError'));
      }
    }
  };

  const handleMoveLink = (link: LinkType) => {
    setSelectedLink(link);
    setShowMoveLinkModal(true);
  };

  // Filter links based on search query
  const filteredLinks = container?.links.filter(link => {
    if (softDeletedLinks.has(link.id)) return false;
    const query = linkSearchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.description?.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  }) || [];

  // Sort: Pinned links stay at the top
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // Maintain original order otherwise
  });

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
    if (!container) return;

    // 1. Mark as disintegrating to trigger CSS animation
    setDeletingLinkId(link.id);

    // 2. Wait for animation, then soft delete and show Toast with Undo
    setTimeout(() => {
      setDeletingLinkId(null);
      setSoftDeletedLinks(prev => new Set(prev).add(link.id));

      const timerId = setTimeout(async () => {
        try {
          await deleteLinkFromContainer(container.id, link.id);
        } catch (err: any) {
          console.error('Error hard deleting link:', err);
        }
        delete deleteTimers.current[link.id];
      }, 5000);

      deleteTimers.current[link.id] = timerId;

      toast.success(t('container.messages.linkDeleted'), 5000, {
        label: t('common.undo') || 'Undo',
        onClick: () => {
          clearTimeout(deleteTimers.current[link.id]);
          delete deleteTimers.current[link.id];
          setSoftDeletedLinks(prev => {
            const next = new Set(prev);
            next.delete(link.id);
            return next;
          });
        }
      });
    }, 400); // 400ms match current CSS fadeOut
  };

  const handleTogglePin = async (link: LinkType) => {
    if (!container) return;
    try {
      await updateLinkInContainer(container.id, link.id, { isPinned: !link.isPinned });
      toast.success(link.isPinned ? t('container.messages.unpinned') : t('container.messages.pinned'));
    } catch (err: any) {
      toast.error(t('container.messages.pinError'));
    }
  };

  const handleUpdateLink = async (linkId: string, updates: Partial<LinkType>) => {
    if (!container) return;
    try {
      await updateLinkInContainer(container.id, linkId, updates);
    } catch (err: any) {
      toast.error('Failed to update link');
    }
  };

  const handleTrackClick = (linkId: string) => {
    if (!container) return;
    trackClick(container.id, linkId);
  };

  const handleShowStats = (link: LinkType) => {
    setSelectedLink(link);
    setShowStatsModal(true);
  };

  const handleShowQRCode = (link: LinkType) => {
    setSelectedLink(link);
    setShowQRCodeModal(true);
  };

  const confirmDeleteLink = async () => { };

  const [isDeletingContainer, setIsDeletingContainer] = useState(false);

  const confirmDeleteContainer = async () => {
    if (!container) return;
    try {
      // Close modal immediately
      setShowDeleteContainerModal(false);

      setIsDeletingContainer(true);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 400));

      await deleteContainer(container.id);
      toast.success(t('container.messages.containerDeleted'));
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error deleting container:', err);
      toast.error(err.message || t('container.messages.containerDeleteError'));
      setIsDeletingContainer(false);
    }
  };

  const confirmLeaveContainer = async () => {
    if (!container || !currentUser) return;
    try {
      await SharingService.removeUserFromContainer(container.id, currentUser.uid);
      setShowLeaveContainerModal(false);

      // Notify the container owner
      try {
        const leaverName = UserService.formatUserName(currentUser.displayName, currentUser.email);
        await NotificationService.notifyContainerLeft(
          container.ownerId,
          container.name,
          leaverName,
          container.id,
          currentUser.uid
        );
      } catch (notifErr) {
        console.error('Failed to send leave notification:', notifErr);
      }

      // Refresh containers so collaborators list updates in real-time
      await refreshContainers();

      toast.success(t('container.messages.leftContainer'));
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error leaving container:', err);
      toast.error(err.message || t('container.messages.leaveError'));
      setShowLeaveContainerModal(false);
    }
  };

  // Check if current user is the owner
  const isOwner = container?.ownerId === currentUser?.uid;

  // Check if user can edit (owner or has edit permission)
  const canEdit = isOwner || userPermission === 'edit';

  if (loading) {
    return <LoadingSkeleton variant="fullscreen" />;
  }

  if (!container) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('container.notFound.title')}</h1>
          <Link to="/dashboard" className="text-primary hover:text-primary/80">
            {t('container.notFound.return')}
          </Link>
        </div>
      </div>
    );
  }

  const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];
  const containerColor = container.color || colors[container.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length];

  // Helper to get RGB from hex
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '99, 102, 241';
  };

  // Detect newly added links
  const [prevLinksCount, setPrevLinksCount] = useState(container?.links.length || 0);
  useEffect(() => {
    if (container && container.links.length > prevLinksCount) {
      // Find the link with the newest createdAt
      const newestLink = [...container.links].sort((a, b) =>
        (b.createdAt as any)?.seconds - (a.createdAt as any)?.seconds
      )[0];

      if (newestLink) {
        setNewlyAddedLinkId(newestLink.id);
        setTimeout(() => setNewlyAddedLinkId(null), 3000); // Clear after 3 seconds
      }
    }
    setPrevLinksCount(container?.links.length || 0);
  }, [container?.links.length]);

  return (
    <div
      className="container-details-page"
      style={{
        '--accent-color': containerColor,
        '--primary': containerColor,
        '--primary-rgb': hexToRgb(containerColor)
      } as React.CSSProperties}
    >
      <SEO
        title={container.name}
        description={container.description || t('container.description', { name: container.name })}
      />
      <header className={`header ${showNavbar ? 'navbar-visible' : 'navbar-hidden'}`}>
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to="/dashboard" className="back-link">
                <ArrowLeft />
              </Link>
              <img src={blinkLogo} alt="Blink" className="logo-image" style={{ height: '40px', width: 'auto', marginLeft: '1rem' }} />
            </div>
            <div className="header-right">
              <Link to="/settings" className="settings-link" title={t('dashboard.tooltips.settings')}>
                <Settings size={20} />
              </Link>
              <div className="user-avatar">
                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={`container fade-in ${isDeletingContainer ? 'disintegrate' : ''}`}>
        <div className="container-header">
          <div className="container-header-info">
            <h2 className="container-name-title">{container.name}</h2>
            {container.description && <p className="container-description-text">{container.description}</p>}
          </div>
        </div>

        <div className="container-content">
          <div className="links-section">
            <div className="links-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>{t('container.links')} ({container.links.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={toggleSelectionMode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: selectionMode ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: selectionMode ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    color: selectionMode ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  title={selectionMode ? 'Cancel Selection' : 'Select Multiple'}
                >
                  {selectionMode ? <XCircle size={16} /> : <CheckSquare size={16} />}
                  <span className="hidden sm:inline">{selectionMode ? t('container.cancel') : t('container.select')}</span>
                </button>
                {canEdit && (
                  <button
                    onClick={() => setShowAddLinkModal(true)}
                    className="add-link-button"
                  >
                    <Plus size={18} />
                    {t('container.addLink')}
                  </button>
                )}
              </div>
            </div>

            {/* Search Input */}
            {container.links.length > 0 && !selectionMode && (
              <div className="modern-search-bar search-links-wrapper">
                <Search className="modern-search-icon" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('container.searchLinks')}
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  className="modern-search-input"
                />
              </div>
            )}

            {/* Bulk Selection Header */}
            {selectionMode && (
              <div className="card mb-4 flex items-center justify-between" style={{ padding: '1rem' }}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filteredLinks.length > 0 && selectedLinkIds.size === filteredLinks.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="font-medium">{selectedLinkIds.size} {t('container.selected')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkMove}
                    disabled={selectedLinkIds.size === 0}
                    className="btn-secondary rounded-lg disabled:opacity-50"
                    title="Move Selected"
                    style={{
                      padding: '6px 10px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <ArrowRightLeft size={18} />
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedLinkIds.size === 0}
                    className="btn-danger rounded-lg disabled:opacity-50"
                    title="Delete Selected"
                    style={{ padding: '6px 10px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}

            <div className="links-list">
              {container.links.length === 0 ? (
                <div className="fade-in">
                  <EmptyState
                    type="links"
                    title={t('container.empty')}
                    description={t('container.emptyDesc')}
                  />
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="fade-in">
                  <EmptyState
                    type="search"
                    title={t('container.emptySearch')}
                    description={t('container.emptySearchDesc')}
                  />
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedLinks.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="links-cards-grid">
                      {sortedLinks.map((link) => (
                        <SortableLinkItem
                          key={link.id}
                          link={link}
                          canEdit={canEdit}
                          disabled={linkSearchQuery.trim().length > 0 || link.isPinned || selectionMode} // Disable drag if searching OR if pinned OR selecting
                          copiedLinkId={copiedLinkId}
                          onCopy={copyToClipboard}
                          onEdit={handleEditLink}
                          onDelete={handleDeleteLink}
                          onMove={handleMoveLink}
                          onTogglePin={handleTogglePin}
                          onStats={handleShowStats}
                          onQRCode={handleShowQRCode}
                          onTrackClick={handleTrackClick}
                          selectionMode={selectionMode}
                          isSelected={selectedLinkIds.has(link.id)}
                          onSelect={handleSelectLink}
                          isDeleting={deletingLinkId === link.id || deletingLinkIds.has(link.id)}
                          isNewlyAdded={newlyAddedLinkId === link.id}
                          onUpdateLink={handleUpdateLink}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          <aside className="sidebar">
            <div className="collaborators-widget">
              <h3>{t('container.collaborators.title')}</h3>
              <div className="collaborators-list">
                {/* Current User */}
                <div className="avatar" title={currentUser?.displayName || t('container.collaborators.you')}>
                  {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Owner (if not current user) */}
                {container.ownerId !== currentUser?.uid && (
                  <div
                    key={container.ownerId}
                    className="avatar"
                    title={`${collaboratorNames[container.ownerId] || t('container.collaborators.owner')} (${t('container.collaborators.owner')})`}
                  >
                    {(collaboratorNames[container.ownerId] || 'O').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Other Authorized Users (excluding owner and current user) */}
                {container.authorizedUsers
                  .filter(userId => userId !== currentUser?.uid && userId !== container.ownerId)
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
                  const otherUsers = container.authorizedUsers.filter(
                    userId => userId !== currentUser?.uid && userId !== container.ownerId
                  );
                  const remainingCount = otherUsers.length - 2;
                  return remainingCount > 0 && (
                    <div className="avatar" title={t('container.collaborators.more', { count: remainingCount })}>
                      +{remainingCount}
                    </div>
                  );
                })()}
              </div>
              <div className="collaborators-actions">
                {canEdit && (
                  <Link
                    to={`/container/${container.id}/share`}
                    className="manage-collaborators-button"
                  >
                    <Share2 size={18} />
                    {t('container.collaborators.invite')}
                  </Link>
                )}
                <button
                  onClick={() => setShowCollaboratorsModal(true)}
                  className="manage-collaborators-button"
                >
                  <Users size={18} />
                  {t('container.collaborators.manage')}
                </button>
              </div>
            </div>

            <div className="actions-widget">
              <h3>{t('container.actions.title')}</h3>
              <div className="actions-list">
                {isOwner && (
                  <button
                    onClick={() => setShowEditContainerModal(true)}
                    className="action-button"
                  >
                    <Edit />
                    <span>{t('container.actions.editContainer')}</span>
                  </button>
                )}
                {isOwner ? (
                  <button
                    onClick={() => setShowDeleteContainerModal(true)}
                    className="action-button delete-button"
                  >
                    <Trash2 />
                    <span>{t('container.actions.deleteContainer')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLeaveContainerModal(true)}
                    className="action-button delete-button"
                  >
                    <LogOut />
                    <span>{t('container.actions.leaveContainer')}</span>
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
      {container && canEdit && (
        <AddLinkModal
          isOpen={showAddLinkModal}
          onClose={() => setShowAddLinkModal(false)}
          containerId={container.id}
          containerColor={containerColor}
        />
      )}

      {/* Edit Link Modal */}
      {container && selectedLink && canEdit && (
        <EditLinkModal
          isOpen={showEditLinkModal}
          onClose={() => {
            setShowEditLinkModal(false);
            setSelectedLink(null);
          }}
          containerId={container.id}
          link={selectedLink}
          containerColor={containerColor}
        />
      )}

      {/* Edit Container Modal */}
      {container && isOwner && (
        <EditContainerModal
          isOpen={showEditContainerModal}
          onClose={() => setShowEditContainerModal(false)}
          container={container}
        />
      )}

      {/* Delete Link Confirmation */}
      {selectedLink && (
        <ConfirmModal
          isOpen={showDeleteLinkModal}
          onClose={() => {
            setShowDeleteLinkModal(false);
            setSelectedLink(null);
          }}
          onConfirm={confirmDeleteLink}
          title={t('container.modals.deleteLink.title')}
          message={t('container.modals.deleteLink.message', { title: selectedLink.title })}
          confirmText={t('container.modals.deleteLink.confirm')}
          variant="danger"
          icon={<Trash2 size={18} />}
        />
      )}

      {/* Delete Container Confirmation */}
      {container && (
        <ConfirmModal
          isOpen={showDeleteContainerModal}
          onClose={() => setShowDeleteContainerModal(false)}
          onConfirm={confirmDeleteContainer}
          title={t('container.modals.deleteContainer.title')}
          message={t('container.modals.deleteContainer.message', { name: container.name })}
          confirmText={t('container.modals.deleteContainer.confirm')}
          variant="danger"
          icon={<Trash2 size={18} />}
          confirmWord={container.name}
        />
      )}

      {/* Leave Container Confirmation */}
      {container && (
        <ConfirmModal
          isOpen={showLeaveContainerModal}
          onClose={() => setShowLeaveContainerModal(false)}
          onConfirm={confirmLeaveContainer}
          title="Leave Container"
          message={`Are you sure you want to leave "${container.name}"? You will lose access to all its contents.`}
          confirmText="Leave Container"
          variant="danger"
          confirmWord="LEAVE"
        />
      )}

      {/* Collaborators Modal */}
      {container && currentUser && (
        <CollaboratorsModal
          isOpen={showCollaboratorsModal}
          onClose={() => setShowCollaboratorsModal(false)}
          containerId={container.id}
          authorizedUsers={container.authorizedUsers}
          ownerId={container.ownerId}
          currentUserId={currentUser.uid}
          containerColor={containerColor}
        />
      )}

      {/* Share Link Modal */}
      {container && currentUser && (
        <ShareLinkModal
          isOpen={showShareLinkModal}
          onClose={() => setShowShareLinkModal(false)}
          containerId={container.id}
          containerName={container.name}
          currentUserId={currentUser.uid}
          containerColor={containerColor}
        />
      )}

      {/* Move Link Modal (Single) */}
      {container && selectedLink && (
        <MoveLinkModal
          isOpen={showMoveLinkModal}
          onClose={() => {
            setShowMoveLinkModal(false);
            setSelectedLink(null);
          }}
          link={selectedLink}
          currentContainerId={container.id}
          containerColor={containerColor}
        />
      )}

      {/* Move Link Modal (Bulk) */}
      {container && showBulkMoveModal && (
        <MoveLinkModal
          isOpen={showBulkMoveModal}
          onClose={() => {
            setShowBulkMoveModal(false);
            setSelectionMode(false);
            setSelectedLinkIds(new Set());
          }}
          linkIds={Array.from(selectedLinkIds)}
          currentContainerId={container.id}
          containerColor={containerColor}
        />
      )}

      {/* Bulk Delete Confirm Modal */}
      {container && showDeleteConfirmModal && (
        <ConfirmModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={confirmBulkDelete}
          title="Delete Selected Links"
          message={`Are you sure you want to delete these ${selectedLinkIds.size} selected links? This action cannot be undone.`}
          confirmText={`Delete ${selectedLinkIds.size} Links`}
          variant="danger"
          icon={<Trash2 size={18} />}
        />
      )}

      {/* Link Stats Modal */}
      {container && selectedLink && (
        <LinkStatsModal
          isOpen={showStatsModal}
          onClose={() => {
            setShowStatsModal(false);
            setSelectedLink(null);
          }}
          link={selectedLink}
          containerColor={containerColor}
        />
      )}

      {/* QR Code Modal */}
      {container && selectedLink && (
        <QRCodeModal
          isOpen={showQRCodeModal}
          onClose={() => {
            setShowQRCodeModal(false);
            setSelectedLink(null);
          }}
          link={selectedLink}
          containerColor={containerColor}
        />
      )}
    </div>
  );
};

export default ContainerDetails;
