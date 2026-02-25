import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useContainer } from '../contexts/ContainerContext';
import { NotificationService } from '../services/notificationService';
import {
  Bell,
  Plus,
  Settings,
  Moon,
  Sun,
  Search,
  Menu,
  X,
  Tag,
  UserPlus
} from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import NotificationsPanel from '../components/NotificationsPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import SortableContainerCard from '../components/SortableContainerCard';
import SEO from '../components/SEO';
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
  const { theme, toggleTheme } = useTheme();
  const { containers, loading, error, reorderContainers } = useContainer();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'f')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleDragEnd = async (event: DragEndEvent, section: 'personal' | 'shared') => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceList = section === 'personal' ? filteredPersonalContainers : filteredSharedContainers;
    const oldIndex = sourceList.findIndex(c => c.id === active.id);
    const newIndex = sourceList.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sourceList, oldIndex, newIndex);

    // Merge back with the other section to maintain full list
    const otherList = section === 'personal' ? filteredSharedContainers : filteredPersonalContainers;
    const fullReordered = section === 'personal' ? [...reordered, ...otherList] : [...otherList, ...reordered];

    try {
      await reorderContainers(fullReordered);
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  // Enhanced search: search in container name, description, and link titles
  const filteredPersonalContainers = personalContainers.filter(container => {
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

  const filteredSharedContainers = sharedContainers.filter(container => {
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
              <Link to="/invitations" className="theme-toggle mediaforbuttons" title={t('dashboard.tooltips.invitations')}>
                <UserPlus className="h-5 w-5" />
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
              <button onClick={toggleTheme} className="theme-toggle mediaforbuttons" title={t('dashboard.tooltips.switchTheme')}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <Link to="/settings" className="theme-toggle mediaforbuttons" title={t('dashboard.tooltips.settings')}>
                <Settings className="h-5 w-5" />
              </Link>
              <div className="user-avatar">
                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
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
                  to="/invitations"
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

        {/* Personal Containers */}
        <section className="fade-in">
          <h2 className="section-title">{t('dashboard.personal')}</h2>
          {filteredPersonalContainers.length === 0 ? (
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
              onDragEnd={(e) => handleDragEnd(e, 'personal')}
            >
              <SortableContext
                items={filteredPersonalContainers.map(c => c.id)}
                strategy={rectSortingStrategy}
              >
                <div className="container-grid">
                  {filteredPersonalContainers.map((container) => {
                    const containerColor = getContainerColor(container);
                    return (
                      <SortableContainerCard
                        key={container.id}
                        container={container}
                        containerColor={containerColor}
                        isLightColor={isLightColor(containerColor)}
                        isNewlyAdded={newlyAddedContainerId === container.id}
                        isOpening={openingContainerId === container.id}
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

        {/* Shared Containers */}
        <section className="fade-in" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">{t('dashboard.shared')}</h2>
          {filteredSharedContainers.length === 0 ? (
            <div className="fade-in">
              <EmptyState
                type={searchQuery ? 'search' : 'shared'}
                title={searchQuery ? t('dashboard.emptyShared.searchTitle') : t('dashboard.emptyShared.title')}
                description={searchQuery ? t('dashboard.emptyShared.searchDesc') : t('dashboard.emptyShared.desc')}
              />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, 'shared')}
            >
              <SortableContext
                items={filteredSharedContainers.map(c => c.id)}
                strategy={rectSortingStrategy}
              >
                <div className="container-grid">
                  {filteredSharedContainers.map((container) => {
                    const containerColor = getContainerColor(container);
                    return (
                      <SortableContainerCard
                        key={container.id}
                        container={container}
                        containerColor={containerColor}
                        isLightColor={isLightColor(containerColor)}
                        isNewlyAdded={newlyAddedContainerId === container.id}
                        isOpening={openingContainerId === container.id}
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
    </div >
  );
};

export default Dashboard;
