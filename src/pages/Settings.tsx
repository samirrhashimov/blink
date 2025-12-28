import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import blinkLogo from '../assets/blinklogo2.png';
import {
  LogOut,
  Moon,
  Sun,
  ArrowLeft,
  Github,
  Settings as SettingsIcon
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Settings: React.FC = () => {
  const { currentUser, logout, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [error, setError] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const language = 'English';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !auth.currentUser) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update display name in Firebase Auth using the Firebase auth instance
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        });
      }

      // Update user document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        updatedAt: new Date()
      });

      setSuccess('Account updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating account:', err);
      setError(err.message || 'Failed to update account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const performDeleteAccount = async () => {
    if (!currentUser || !auth.currentUser) {
      setError('No user is currently signed in.');
      return;
    }

    setLoading(true);
    setError('');
    setShowDeleteModal(false);

    try {
      await deleteAccount();
      // Account deleted successfully, navigate to home
      navigate('/');
    } catch (error: any) {
      console.error('Delete account error:', error);
      setError(error.message || 'Failed to delete account. You may need to re-authenticate.');
      setLoading(false);
    }
  };

  return (
    <div className="vault-details-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to="/dashboard" className="back-link">
                <ArrowLeft />
              </Link>
              <img src={blinkLogo} alt="Blink" className="logo-image" style={{ height: '40px', width: 'auto', marginLeft: '1rem' }} />
            </div>
            <div className="header-right">
              <Link to="/settings" className="theme-toggle" title="Settings">
                <SettingsIcon size={20} />
              </Link>
              <div className="user-avatar">
                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        <div className="vault-header">
          <h2>Settings</h2>
          <p>Manage your account preferences and settings</p>
        </div>

        <div className="settings-content">

          {/* Account Section */}
          <section className="settings-section">
            <h3>Account</h3>

            {success && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="displayName"
                  type="text"
                  className="form-input"
                  placeholder="Full name"
                  value={formData.displayName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="Email address"
                  value={formData.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  title="Email cannot be changed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>
            </form>
            <button
              type="submit"
              onClick={handleUpdateAccount}
              disabled={loading}
              className="btn-primary update-account-btn"
              style={{ marginTop: '1.5rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Updating...' : 'Update Account'}
            </button>
          </section>

          {/* Preferences Section */}
          <section className="settings-section">
            <h3>Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="settings-item">
                <div className="settings-item-info">
                  <h4>Theme</h4>
                  <p>Choose between a light or dark theme.</p>
                </div>
                <div
                  className={`toggle-switch ${theme === 'dark' ? 'checked' : ''}`}
                  onClick={toggleTheme}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTheme();
                    }
                  }}
                  aria-label="Toggle theme"
                >
                  <div className="toggle-thumb">
                    {theme === 'dark' ? (
                      <Moon className="toggle-icon" />
                    ) : (
                      <Sun className="toggle-icon" />
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="settings-item">
                <div className="settings-item-info">
                  <h4>Language</h4>
                  <p>Set your preferred language for the app.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  {language}
                  <svg fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z"></path>
                  </svg>
                </button>
              </div> */}
            </div>
          </section>

          <section className="settings-section" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
            <h3 style={{ color: '#ffffffff' }}>App Info</h3>
            <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(100, 116, 139, 0.3)', background: 'rgba(100, 116, 139, 0.05)', marginBottom: '1.5rem' }}>
              <div className="flex items-center justify-between settings-action-row">
                <div className="settings-item-info">
                  <h4>Open source</h4>
                  <p>Explore the source code or give a star on GitHub.</p>
                </div>
                <button
                  onClick={() => window.open('https://github.com/samirrhashimov/blink', '_blank', 'noopener,noreferrer')}
                  className="btn-secondary"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="settings-section" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
            <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(100, 116, 139, 0.3)', background: 'rgba(100, 116, 139, 0.05)', marginBottom: '1.5rem' }}>
              <div className="flex items-center justify-between settings-action-row">
                <div className="settings-item-info">
                  <h4>Logout</h4>
                  <p>Sign out of your account on this device.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' }}>
              <div className="flex items-center justify-between settings-action-row">
                <div className="settings-item-info">
                  <h4 style={{ color: '#ef4444' }}>Delete Account</h4>
                  <p>Permanently delete your account and all of your data.</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="btn-danger"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
          <ConfirmModal
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={performLogout}
            title="Logout"
            message="Are you sure you want to logout of your account?"
            confirmText="Logout"
            variant="danger"
            icon={<LogOut className="h-4 w-4" />}
          />
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={performDeleteAccount}
            title="Delete Account"
            message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
            confirmText="Delete Account"
            variant="danger"
            icon={<LogOut className="h-4 w-4" />}
          />
        </div>
      </main>
    </div>
  );
};

export default Settings;
