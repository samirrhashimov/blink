import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useContainer } from '../contexts/ContainerContext';
import { NotificationService } from '../services/notificationService';
import {
  Bell,
  Plus,
  Settings,
  Search,
  Menu,
  X,
  Tag
} from 'lucide-react';
import { SharingService } from '../services/sharingService';
import { ContainerService } from '../services/containerService';
import { useToast } from '../contexts/ToastContext';
import { FiInbox } from "react-icons/fi";
import blinkLogo from '../assets/blinklogo2.png';
import NotificationsPanel from '../components/NotificationsPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import SortableContainerCard from '../components/SortableContainerCard';
import SEO from '../components/SEO';
import SupportButton from '../components/SupportButton';
import EditContainerModal from '../components/EditContainerModal';
import ConfirmModal from '../components/ConfirmModal';
import type { Container } from '../types';
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
  rectSortingStrategy
} from '@dnd-kit/sortable';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { containers, loading, error, reorderContainers, deleteContainer } = useContainer();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // States for Edit/Delete modals
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditInitiate = (container: Container) => {
    setSelectedContainer(container);
    setShowEditModal(true);
  };

  const handleDeleteInitiate = (container: Container) => {
    setSelectedContainer(container);
    setShowDeleteModal(true);
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

  const handleLeaveContainer = async (container: Container) => {
    if (!currentUser) return;
    
    const confirmLeave = window.confirm(t('container.modals.leaveContainer.confirm', 'Are you sure you want to leave this shared container? Any files you uploaded here will be deleted to clear your storage quota.'));
    if (!confirmLeave) return;

    try {
      // 1. Find the user's files in this container
      const userFiles = container.links.filter(l => l.createdBy === currentUser.uid && l.type === 'file');
      
      // 2. Clear Cloudinary storage for these files
      for (const file of userFiles) {
        if (file.fileData?.publicId) {
          await deleteCloudinaryFile(file.fileData.publicId, file.fileData.resourceType);
        }
      }

      // 3. Clear from container (this handles Firebase and User Storage Quota in ContainerService)
      if (userFiles.length > 0) {
        const fileIds = userFiles.map(f => f.id);
        await ContainerService.deleteLinksFromContainer(container.id, fileIds);
      }

      // 4. Finally leave the container
      await SharingService.removeUserFromContainer(container.id, currentUser.uid);
      
      toast.success(t('container.modals.leaveContainer.success', 'You have left the container and your files were cleared.'));
      
      // Refresh page to update quotas everywhere
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to leave container');
    }
  };


  useEffect(() => {
    if (currentUser) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadUnreadCount = async () => {
    if (!currentUser) return;
    try {
      const count = await NotificationService.getUnreadCount(currentUser.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const personalContainers = containers.filter(container => !container.isShared);
  const sharedContainers = containers.filter(container => container.isShared);

  const [newlyAddedContainerId, setNewlyAddedContainerId] = useState<string | null>(null);
  const [prevContainersCount, setPrevContainersCount] = useState(containers.length);

  useEffect(() => {
    if (containers.length > prevContainersCount) {
      // Find the newest container (by ID or some logic, but let's assume the one not in previous ones)
      // Actually, containers are often sorted or just appended.
      // Let's find the one with the highest timestamp if available, but containers might not have it in this view.
      // Simplest: find the container that wasn't in the previous list.
      const newContainer = containers.find(c => !personalContainers.some(p => p.id === c.id) && !sharedContainers.some(s => s.id === c.id));
      if (newContainer) {
        setNewlyAddedContainerId(newContainer.id);
        setTimeout(() => setNewlyAddedContainerId(null), 3000);
      }
    }
    setPrevContainersCount(containers.length);
  }, [containers.length]);

  // DnD sensors for container reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Opening animation state
  const [openingContainerId, setOpeningContainerId] = useState<string | null>(null);

  const handleContainerClick = (containerId: string) => {
    setOpeningContainerId(containerId);
    setTimeout(() => {
      navigate(`/container/${containerId}`);
    }, 350);
  };

  // Helper for color detection
  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  };

  const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];

  const getContainerColor = (container: { id: string; color?: string }) =>
    container.color || colors[container.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredContainers.findIndex(c => c.id === active.id);
    const newIndex = filteredContainers.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredContainers, oldIndex, newIndex);

    try {
      await reorderContainers(reordered);
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  // Enhanced search: search in container name, description, and link titles
  // Combined filtered containers
  const filteredContainers = containers.filter(container => {
    const query = searchQuery.toLowerCase();
    const nameMatch = container.name.toLowerCase().includes(query);
    const descMatch = container.description?.toLowerCase().includes(query);
    const linkMatch = container.links.some(link =>
      link.title.toLowerCase().includes(query) ||
      link.description?.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
    return nameMatch || descMatch || linkMatch;
  });

  if (loading) {
    return <LoadingSkeleton variant="fullscreen" />;
  }

  return (
    <div className="dashboard-page">
      <SEO title={t('dashboard.title')} description="Manage your link containers in Blink." />
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <img src={blinkLogo} alt="Blink" className="logo-image" style={{ height: '40px', width: 'auto' }} />
            </div>


            <div className="header-right">
              {/* <div className="modern-search-bar hidden sm:block" style={{ width: '16rem' }}>
                <Search className="modern-search-icon" size={16} />
                <input
                  className="modern-search-input modern-search-header"
                  placeholder="Search containers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div> */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-menu-toggle mediaforbuttons"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link to="/tags" className="theme-toggle mediaforbuttons" title={t('dashboard.tooltips.tags')}>
                <Tag className="h-5 w-5" />
              </Link>
              <Link to="/requests" className="theme-toggle mediaforbuttons" title={t('dashboard.tooltips.invitations')}>
                <FiInbox className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className="theme-toggle relative"
                aria-label={t('dashboard.tooltips.notifications')}
                title={t('dashboard.tooltips.notifications')}
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="notification-bubble">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <Link to="/settings" className="theme-toggle mediaforbuttons" title={t('dashboard.tooltips.settings')}>
                <Settings className="h-5 w-5" />
              </Link>
              <div className="hidden md:flex">
                <SupportButton />
              </div>
              <Link to={currentUser?.username ? `/profile/${currentUser.username}` : '/settings'} className="user-avatar-link">
                <div
                  className="user-avatar"
                  style={{
                    backgroundImage: currentUser?.photoURL ? `url(${currentUser.photoURL})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {!currentUser?.photoURL && (currentUser?.displayName?.charAt(0).toUpperCase() || 'U')}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {
        mobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-nav-header">
                <img src={blinkLogo} alt="Blink" className="mobile-logo" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-nav-close"
                  aria-label="Close mobile menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mobile-nav-links">
                <Link
                  to="/dashboard"
                  className="mobile-nav-link active"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dashboard.nav.home')}
                </Link>
                <Link
                  to="/tags"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dashboard.nav.tags')}
                </Link>
                <Link
                  to="/requests"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dashboard.nav.invitations')}
                </Link>
                <Link
                  to="/settings"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('dashboard.nav.settings')}
                </Link>
              </nav>
              <div className="mobile-nav-actions">
                {/* add mobile actions here */}
              </div>
            </div>
          </div>
        )
      }

      {/* Main Content */}
      <main className="container">
        <div className="container-header">
          <div className="flex items-center justify-between mb-6">
            <h2>{t('dashboard.library')}</h2>
            <button
              onClick={() => (window as any).dispatchSetShowCreateModal?.(true)}
              className="add-link-button mediaforbuttons"
            >
              <Plus className="h-5 w-5" />
              {t('dashboard.newContainer')}
            </button>
          </div>


          {/* Search Bar */}
          <div className="modern-search-bar">
            <Search className="modern-search-icon" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modern-search-input"
            />
          </div>
        </div>

        {/* Unified Containers Section */}
        <section className="fade-in">
          {filteredContainers.length === 0 ? (
            <div className="fade-in">
              <EmptyState
                type={searchQuery ? 'search' : 'personal'}
                title={searchQuery ? t('dashboard.emptyPersonal.searchTitle') : t('dashboard.emptyPersonal.title')}
                description={searchQuery ? t('dashboard.emptyPersonal.searchDesc') : t('dashboard.emptyPersonal.desc')}
                action={!searchQuery ? (
                  <button
                    onClick={() => (window as any).dispatchSetShowCreateModal?.(true)}
                    className="empty-state-button"
                  >
                    <Plus className="h-5 w-5" />
                    {t('dashboard.emptyPersonal.button')}
                  </button>
                ) : undefined}
              />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredContainers.map(c => c.id)}
                strategy={rectSortingStrategy}
              >
                <div className="container-grid">
                  {filteredContainers.map((container) => {
                    const containerColor = getContainerColor(container);
                    return (
                      <SortableContainerCard
                        key={container.id}
                        container={container}
                        containerColor={containerColor}
                        isLightColor={isLightColor(containerColor)}
                        isNewlyAdded={newlyAddedContainerId === container.id}
                        isOpening={openingContainerId === container.id}
                        onEdit={handleEditInitiate}
                        onDelete={handleDeleteInitiate}
                        onLeave={handleLeaveContainer}
                        currentUserId={currentUser?.uid}
                        onClick={(e) => {
                          e.preventDefault();
                          handleContainerClick(container.id);
                        }}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>

      {/* Notifications Panel */}
      {
        currentUser && (
          <NotificationsPanel
            isOpen={showNotifications}
            onClose={() => {
              setShowNotifications(false);
              loadUnreadCount(); // Refresh count when closing
            }}
            userId={currentUser.uid}
          />
        )
      }
      {/* Modals */}
      {selectedContainer && (
        <>
          <EditContainerModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            container={selectedContainer}
          />
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title={t('container.modals.deleteContainer.title')}
            message={t('container.modals.deleteContainer.message', { name: selectedContainer.name })}
            onConfirm={async () => {
              try {
                await deleteContainer(selectedContainer.id);
                toast.success(t('container.messages.containerDeleted', 'Container deleted successfully'));
              } catch (err: any) {
                toast.error(err.message || 'Failed to delete container');
              }
            }}
            variant="danger"
            confirmText={t('common.buttons.delete')}
            confirmWord={selectedContainer.name}
          />
        </>
      )}
    </div >
  );
};

export default Dashboard;
