import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useVault } from '../contexts/VaultContext';
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
  FolderOpen,
  FolderPlus,
  Tag,
  UserPlus
} from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import CreateVaultModal from '../components/CreateVaultModal';
import NotificationsPanel from '../components/NotificationsPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SEO from '../components/SEO';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { vaults, loading, error } = useVault();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    (window as any).dispatchSetShowCreateModal = setShowCreateModal;
    return () => {
      delete (window as any).dispatchSetShowCreateModal;
    };
  }, []);

  const loadUnreadCount = async () => {
    if (!currentUser) return;
    try {
      const count = await NotificationService.getUnreadCount(currentUser.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const personalVaults = vaults.filter(vault => !vault.isShared);
  const sharedVaults = vaults.filter(vault => vault.isShared);

  // Enhanced search: search in vault name, description, and link titles
  const filteredPersonalVaults = personalVaults.filter(vault => {
    const query = searchQuery.toLowerCase();
    const nameMatch = vault.name.toLowerCase().includes(query);
    const descMatch = vault.description?.toLowerCase().includes(query);
    const linkMatch = vault.links.some(link =>
      link.title.toLowerCase().includes(query) ||
      link.description?.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
    return nameMatch || descMatch || linkMatch;
  });

  const filteredSharedVaults = sharedVaults.filter(vault => {
    const query = searchQuery.toLowerCase();
    const nameMatch = vault.name.toLowerCase().includes(query);
    const descMatch = vault.description?.toLowerCase().includes(query);
    const linkMatch = vault.links.some(link =>
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
      <SEO title="Dashboard" description="Manage your link containers and workspaces in Blink." />
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

              <Link to="/tags" className="theme-toggle mediaforbuttons" title="Tags">
                <Tag className="h-5 w-5" />
              </Link>
              <Link to="/invitations" className="theme-toggle mediaforbuttons" title="Invitations">
                <UserPlus className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className="theme-toggle relative"
                aria-label="Notifications"
                title="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button onClick={toggleTheme} className="theme-toggle mediaforbuttons" title="Switch Theme">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <Link to="/settings" className="theme-toggle mediaforbuttons" title="Settings">
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
      {mobileMenuOpen && (
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
                Home
              </Link>
              <Link
                to="/tags"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tags
              </Link>
              <Link
                to="/invitations"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Invitations
              </Link>
              <Link
                to="/settings"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </nav>
            <div className="mobile-nav-actions">
              {/* add mobile actions here */}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container">
        <div className="vault-header">
          <div className="flex items-center justify-between mb-6">
            <h2>My Library</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="add-link-button mediaforbuttons"
            >
              <Plus className="h-5 w-5" />
              New Container
            </button>
          </div>


          {/* Search Bar */}
          <div className="modern-search-bar">
            <Search className="modern-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search containers, links, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modern-search-input"
            />
          </div>
        </div>

        {/* Personal Vaults */}
        <section>
          <h2 className="section-title">Personal</h2>
          {filteredPersonalVaults.length === 0 ? (
            <div className="empty-state">
              <FolderOpen className="empty-state-icon" size={64} />
              <h3 className="empty-state-title">
                {searchQuery ? 'No containers found' : 'No personal containers yet'}
              </h3>
              <p className="empty-state-description">
                {searchQuery
                  ? 'Try adjusting your search terms or create a new container.'
                  : 'Create your first container to start organizing your links and resources.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="empty-state-button"
                >
                  <Plus className="h-5 w-5" />
                  Create Container
                </button>
              )}
            </div>
          ) : (
            <div className="vault-grid">
              {filteredPersonalVaults.map((vault) => {
                const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];
                const vaultColor = vault.color || colors[vault.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length];

                // Helper to check if color is light
                const isLightColor = (color: string) => {
                  const hex = color.replace('#', '');
                  const r = parseInt(hex.substr(0, 2), 16);
                  const g = parseInt(hex.substr(2, 2), 16);
                  const b = parseInt(hex.substr(4, 2), 16);
                  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                  return brightness > 180;
                };

                return (
                  <Link
                    key={vault.id}
                    to={`/vault/${vault.id}`}
                    className={`vault-card ${isLightColor(vaultColor) ? 'light-color' : ''}`}
                    style={{ '--vault-color': vaultColor } as React.CSSProperties}
                  >
                    <div className="vault-card-overlay" style={{ backgroundColor: vaultColor }}></div>
                    <div className="vault-card-content">
                      <h3 className="vault-card-title">{vault.name}</h3>
                      {vault.description && (
                        <p className="vault-card-description">{vault.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Shared Vaults */}
        <section style={{ marginTop: '3rem' }}>
          <h2 className="section-title">Shared</h2>
          {filteredSharedVaults.length === 0 ? (
            <div className="empty-state">
              <FolderPlus className="empty-state-icon" size={64} />
              <h3 className="empty-state-title">
                {searchQuery ? 'No shared containers found' : 'No shared containers yet'}
              </h3>
              <p className="empty-state-description">
                {searchQuery
                  ? 'Try adjusting your search terms.'
                  : 'Containers shared with you will appear here.'}
              </p>
            </div>
          ) : (
            <div className="vault-grid">
              {filteredSharedVaults.map((vault) => {
                const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];
                const vaultColor = vault.color || colors[vault.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length];

                const isLightColor = (color: string) => {
                  const hex = color.replace('#', '');
                  const r = parseInt(hex.substr(0, 2), 16);
                  const g = parseInt(hex.substr(2, 2), 16);
                  const b = parseInt(hex.substr(4, 2), 16);
                  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                  return brightness > 180;
                };

                return (
                  <Link
                    key={vault.id}
                    to={`/vault/${vault.id}`}
                    className={`vault-card ${isLightColor(vaultColor) ? 'light-color' : ''}`}
                    style={{ '--vault-color': vaultColor } as React.CSSProperties}
                  >
                    <div className="vault-card-overlay" style={{ backgroundColor: vaultColor }}></div>
                    <div className="vault-card-content">
                      <h3 className="vault-card-title">{vault.name}</h3>
                      {vault.description && (
                        <p className="vault-card-description">{vault.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>

      {/* Create Vault Modal */}
      <CreateVaultModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Notifications Panel */}
      {currentUser && (
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => {
            setShowNotifications(false);
            loadUnreadCount(); // Refresh count when closing
          }}
          userId={currentUser.uid}
        />
      )}
    </div>
  );
};

export default Dashboard;
