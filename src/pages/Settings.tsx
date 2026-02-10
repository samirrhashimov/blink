import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useVault } from '../contexts/VaultContext';
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
  Scale,
  Download,
  Upload,
  HelpCircle
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { parseNetscapeBookmarks } from '../utils/bookmarkParser';
import { downloadBookmarks } from '../utils/bookmarkExporter';
import { VaultService } from '../services/vaultService';
import '../css/Settings.css';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, logout, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { vaults } = useVault();
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [importing, setImporting] = useState(false);

  const [importSummary, setImportSummary] = useState<{ vaults: number, links: number, data: any } | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSuccess('');
    setError('');

    try {
      const text = await file.text();
      const results = parseNetscapeBookmarks(text);
      if (results.length === 0) {
        throw new Error('No bookmarks found in the file.');
      }

      // Group by folder
      const grouped: Record<string, typeof results> = {};
      results.forEach(item => {
        const folder = item.folder || 'Imported Bookmarks';
        if (!grouped[folder]) grouped[folder] = [];
        grouped[folder].push(item);
      });

      const totalVaults = Object.keys(grouped).length;
      const totalLinks = results.length;

      setImportSummary({ vaults: totalVaults, links: totalLinks, data: grouped });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse bookmarks.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importSummary || !currentUser) return;

    setImporting(true);
    const { data: grouped } = importSummary;

    try {
      for (const [folderName, items] of Object.entries(grouped)) {
        await VaultService.createVault({
          name: folderName,
          description: `Imported from browser bookmarks on ${new Date().toLocaleDateString()}`,
          ownerId: currentUser.uid,
          authorizedUsers: [],
          links: (items as any[]).map(item => ({
            id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            url: item.url,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: currentUser.uid
          })),
          isShared: false,
          color: '#6366f1'
        });
      }

      setSuccess(t('settings.messages.importSuccess', { links: importSummary.links, vaults: importSummary.vaults }));
      setImportSummary(null);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to import bookmarks.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cancelImport = () => {
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    if (vaults.length === 0) {
      setError(t('settings.messages.noExport'));
      return;
    }

    setExporting(true);
    setSuccess('');
    setError('');

    try {
      downloadBookmarks(vaults, `blink_backup_${new Date().toISOString().split('T')[0]}.html`);
      setSuccess(t('settings.messages.exportSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError(t('settings.messages.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const [showImportHelp, setShowImportHelp] = useState(false);
  const helpRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowImportHelp(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [helpRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ... rest of imports/functions


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

      setSuccess(t('settings.messages.updateSuccess'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating account:', err);
      setError(err.message || t('settings.messages.updateFailed'));
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
      setError(t('settings.messages.noUser'));
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
          <h2>{t('settings.title')}</h2>
          <p>{t('settings.subtitle')}</p>
        </div>

        <div className="settings-content">

          {/* Account Section */}
          <section className="settings-section">
            <h3>{t('settings.account')}</h3>

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
                <label className="form-label" htmlFor="name">{t('settings.labels.name')}</label>
                <input
                  id="name"
                  name="displayName"
                  type="text"
                  className="form-input"
                  placeholder={t('settings.placeholders.name')}
                  value={formData.displayName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">{t('settings.labels.email')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder={t('settings.placeholders.email')}
                  value={formData.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  title={t('settings.messages.emailDisabled')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('settings.messages.emailDisabled')}</p>
              </div>
            </form>
            <button
              type="submit"
              onClick={handleUpdateAccount}
              disabled={loading}
              className="btn-primary update-account-btn"
              style={{ marginTop: '1.5rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? t('settings.buttons.updating') : t('settings.buttons.update')}
            </button>
          </section>

          {/* Preferences Section */}
          <section className="settings-section">
            <h3>{t('settings.preferences')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="settings-item">
                <div className="settings-item-info">
                  <h4>{t('settings.theme')}</h4>
                  <p>{t('settings.themeDesc')}</p>
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
              <div className="settings-item">
                <div className="settings-item-info">
                  <h4>{t('settings.language')}</h4>
                  <p>{t('settings.languageDesc')}</p>
                </div>
                <div className="language-dropdown-container" style={{ width: '180px' }}>
                  <select
                    className="language-select"
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    aria-label={t('settings.language')}
                  >
                    <option value="en">English (US)</option>
                    <option value="tr">Türkçe (TR)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Import / Export Section */}
          <section className="settings-section">
            <h3>{t('settings.dataManagement')}</h3>
            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4>{t('settings.import')}</h4>
                  <div
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    ref={helpRef}
                    onMouseEnter={() => setShowImportHelp(true)}
                    onMouseLeave={() => setShowImportHelp(false)}
                  >
                    <button
                      onClick={() => setShowImportHelp(!showImportHelp)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                      title="How to import?"
                    >
                      <HelpCircle size={18} />
                    </button>
                    {showImportHelp && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '10px',
                        width: '280px',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        zIndex: 50,
                        color: theme === 'dark' ? '#e5e7eb' : '#1f2937',
                        fontSize: '14px',
                        textAlign: 'left'
                      }}>
                        <h5 style={{ fontWeight: 600, marginBottom: '8px', color: theme === 'dark' ? '#93c5fd' : '#2563eb' }}>{t('settings.messages.importHelp.title')}</h5>
                        <ol style={{ paddingLeft: '20px', margin: 0, listStyleType: 'decimal' }}>
                          <li style={{ marginBottom: '4px' }}>{t('settings.messages.importHelp.step1')}</li>
                          <li style={{ marginBottom: '4px' }}>{t('settings.messages.importHelp.step2')}</li>
                          <li style={{ marginBottom: '4px' }}>{t('settings.messages.importHelp.step3')}</li>
                          <li>{t('settings.messages.importHelp.step4')}</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
                <p>{t('settings.importDesc')}</p>
              </div>
              <div className='data-management-buttons'>
                <input
                  type="file"
                  accept=".html"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="btn-secondary flex items-center gap-2 data-management-button"
                >
                  <Download size={16} />
                  {importing ? t('settings.messages.importing') : t('settings.buttons.importHtml')}
                </button>
              </div>
            </div>

            <div className="settings-item settings-item-media settings-item-non-mobile">
              <div className="settings-item-info">
                <h4>{t('settings.export')}</h4>
                <p>{t('settings.exportDesc')}</p>
              </div>
              <div className='data-management-buttons'>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Upload className={exporting ? 'animate-bounce' : ''} size={16} />
                  {exporting ? t('settings.messages.exporting') : t('settings.buttons.exportHtml')}
                </button>
              </div>
            </div>


          </section>

          <section className="settings-section">
            <h3>{t('settings.appInfo')}</h3>
            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <h4>{t('settings.openSource')}</h4>
                <p>{t('settings.openSourceDesc')}</p>
              </div>
              <button
                onClick={() => window.open('https://github.com/samirrhashimov/blink', '_blank', 'noopener,noreferrer')}
                className="btn-secondary"
              >
                <Github className="h-4 w-4" />
                GitHub
              </button>
            </div>

            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <h4>{t('settings.legal')}</h4>
                <p>{t('settings.legalDesc')}</p>
              </div>
              <button
                onClick={() => navigate('/legal')}
                className="btn-secondary"
              >
                <Scale className="h-4 w-4" />
                {t('settings.legal')}
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="settings-section">
            <h3 style={{ color: '#ef4444' }}>{t('settings.dangerZone')}</h3>
            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <h4>{t('settings.logout')}</h4>
                <p>{t('settings.logoutDesc')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                <LogOut className="h-4 w-4" />
                {t('settings.logout')}
              </button>
            </div>

            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <h4 style={{ color: '#ef4444' }}>{t('settings.deleteAccount')}</h4>
                <p>{t('settings.deleteAccountDesc')}</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
              >
                {t('settings.deleteAccount')}
              </button>
            </div>
          </section>



          <ConfirmModal
            isOpen={!!importSummary}
            onClose={cancelImport}
            onConfirm={confirmImport}
            title={t('settings.messages.importConfirm.title')}
            message={t('settings.messages.importConfirm.message', { vaults: importSummary?.vaults, links: importSummary?.links })}
            confirmText={importing ? t('settings.messages.importing') : t('settings.messages.importConfirm.title')}
            variant="primary"
            icon={<Download className="h-4 w-4" />}
          />
          <ConfirmModal
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={performLogout}
            title={t('settings.logout')}
            message={t('common.confirmation.logout.message')}
            confirmText={t('settings.logout')}
            variant="danger"
            icon={<LogOut className="h-4 w-4" />}
          />
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={performDeleteAccount}
            title={t('settings.deleteAccount')}
            message={t('settings.deleteAccountDesc')}
            confirmText={t('settings.deleteAccount')}
            confirmWord="delete"
            variant="danger"
            icon={<LogOut className="h-4 w-4" />}
          />
        </div>
      </main>
    </div>
  );
};

export default Settings;
