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
  X
} from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import CreateVaultModal from '../components/CreateVaultModal';
import NotificationsPanel from '../components/NotificationsPanel';

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
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your vaults...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <img src={blinkLogo} alt="Blink" className="logo-image" style={{height: '40px', width: 'auto'}} />
            </div>
            <nav className="main-nav">
              <span className="active-link">Home</span>
              <Link to="/invitations">Invitations</Link>
            </nav>
            
            
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
              className="mobile-menu-button md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className="theme-toggle"
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button onClick={toggleTheme} className="theme-toggle mediaforbuttons" title="Toggle Theme">
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
                to="#"
                className="mobile-nav-link active"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
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
              className="add-link-button"
            >
              <Plus className="h-5 w-5" />
              New Vault
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
          <div className="vault-grid">
            {filteredPersonalVaults.map((vault) => {
              const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              return (
              <Link
                key={vault.id}
                to={`/vault/${vault.id}`}
                className="vault-card"
              >
                <div className="vault-card-overlay" style={{backgroundColor: randomColor}}></div>
                <div className="vault-card-content">
                  <h3 className="vault-card-title">{vault.name}</h3>
                </div>
              </Link>
            );
            })}
          </div>
        </section>

        {/* Shared Vaults */}
        <section style={{marginTop: '3rem'}}>
          <h2 className="section-title">Shared</h2>
          <div className="vault-grid">
            {filteredSharedVaults.map((vault) => {
              const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              return (
              <Link
                key={vault.id}
                to={`/vault/${vault.id}`}
                className="vault-card"
              >
                <div className="vault-card-overlay" style={{backgroundColor: randomColor}}></div>
                <div className="vault-card-content">
                  <h3 className="vault-card-title">{vault.name}</h3>
                </div>
              </Link>
            );
            })}
          </div>
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
