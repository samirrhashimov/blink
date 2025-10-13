import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft
} from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    username: '',
    password: ''
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const language = 'English';

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

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion logic
      console.log('Deleting account');
    }
  };

  return (
    <div className="vault-details-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <a href="/dashboard" className="back-link">
                <ArrowLeft />
              </a>
              <img src={blinkLogo} alt="Blink" className="logo-image" style={{height: '40px', width: 'auto', marginLeft: '1rem'}} />
            </div>
            <nav className="main-nav">
              <a href="/dashboard">Home</a>
              <a href="/dashboard">My Links</a>
              <span className="active-link">Settings</span>
            </nav>
            <div className="header-right">
              <button onClick={toggleTheme} className="theme-toggle mediaforbuttons">
                {theme === 'light' ? <Moon /> : <Sun />}
              </button>
              <button onClick={logout} className="logout-button mediaforbuttons" title="Logout">
                <LogOut />
              </button>
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
                  style={{opacity: 0.6, cursor: 'not-allowed'}}
                  title="Email cannot be changed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>
            </form>
            <button
              type="submit"
              onClick={handleUpdateAccount}
              disabled={loading}
              className="btn-primary"
              style={{marginTop: '1.5rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
            >
              {loading ? 'Updating...' : 'Update Account'}
            </button>
          </section>

          {/* Preferences Section */}
          <section className="settings-section">
            <h3>Preferences</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div className="settings-item">
                <div className="settings-item-info">
                  <h4>Theme</h4>
                  <p>Choose between a light or dark theme.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => theme === 'light' ? null : toggleTheme()}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${theme === 'light' ? 'bg-primary/20 dark:bg-primary/30 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => theme === 'dark' ? null : toggleTheme()}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${theme === 'dark' ? 'bg-primary/20 dark:bg-primary/30 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <h4>Email Notifications</h4>
                  <p>Enable or disable email notifications.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="settings-item">
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
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="settings-section" style={{borderColor: 'rgba(239, 68, 68, 0.3)'}}>
            <h3 style={{color: '#ef4444'}}>Danger Zone</h3>
            <div style={{padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(100, 116, 139, 0.3)', background: 'rgba(100, 116, 139, 0.05)', marginBottom: '1.5rem'}}>
              <div className="flex items-center justify-between">
                <div className="settings-item-info">
                  <h4>Logout</h4>
                  <p>Sign out of your account on this device.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
            
            <div style={{padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)'}}>
              <div className="flex items-center justify-between">
                <div className="settings-item-info">
                  <h4 style={{color: '#ef4444'}}>Delete Account</h4>
                  <p>Permanently delete your account and all of your data.</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
