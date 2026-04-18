import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { isMobileDevice } from '../utils/device';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useContainer } from '../contexts/ContainerContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import blinkLogo from '../assets/blinklogo2.png';
import { ProfileService } from '../services/profileService';
import {
  LogOut,
  ArrowLeft,
  Github,
  Scale,
  Download,
  Upload,
  HelpCircle,
  MessageSquare,
  Camera,
  AtSign,
  User,
  Mail,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { getPlanConfig } from '../utils/plans';
import type { UserPlan } from '../types';
import SupportButton from '../components/SupportButton';
import ConfirmModal from '../components/ConfirmModal';
import { parseNetscapeBookmarks } from '../utils/bookmarkParser';
import { downloadBookmarks } from '../utils/bookmarkExporter';
import { ContainerService } from '../services/containerService';
import '../css/Settings.css';


const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, logout, deleteAccount, refreshUserProfile } = useAuth();
  const { theme, toggleTheme, animationsEnabled, toggleAnimations, searchShortcut, setSearchShortcut } = useTheme();
  const { containers } = useContainer();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    username: currentUser?.username || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser?.photoURL || null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync photoPreview when currentUser changes
  useEffect(() => {
    setPhotoPreview(currentUser?.photoURL || null);
    // Sync other user data as well
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        username: currentUser.username || ''
      }));
    }
  }, [currentUser]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    setPhotoLoading(true);
    try {
      const base64 = await ProfileService.fileToBase64(file, 256);
      setPhotoPreview(base64);
      await ProfileService.updateProfilePhoto(currentUser.uid, base64);
      await refreshUserProfile();
      toast.success(t('settings.messages.photoSuccess'));
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      toast.error(err.message || t('settings.messages.photoFailed'));
    } finally {
      setPhotoLoading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };
  // const language = 'English';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [importing, setImporting] = useState(false);

  const [importSummary, setImportSummary] = useState<{ containers: number, links: number, data: any } | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      const totalContainers = Object.keys(grouped).length;
      const totalLinks = results.length;

      setImportSummary({ containers: totalContainers, links: totalLinks, data: grouped });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to parse bookmarks.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importSummary || !currentUser) return;

    setImporting(true);
    const { data: grouped } = importSummary;

    try {
      for (const [folderName, items] of Object.entries(grouped)) {
        await ContainerService.createContainer({
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

      toast.success(t('settings.messages.importSuccess', { links: importSummary.links, containers: importSummary.containers }));
      setImportSummary(null);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to import bookmarks.');
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
    if (containers.length === 0) {
      toast.error(t('settings.messages.noExport'));
      return;
    }

    setExporting(true);

    try {
      downloadBookmarks(containers, `blink_backup_${new Date().toISOString().split('T')[0]}.html`);
      toast.success(t('settings.messages.exportSuccess'));
    } catch (err: any) {
      console.error(err);
      toast.error(t('settings.messages.exportFailed'));
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

    try {
      let usernameChanged = false;
      const trimmedUsername = formData.username.trim().toLowerCase().replace(/^@/, '');

      // 1. Update Username if changed
      if (trimmedUsername && trimmedUsername !== (currentUser.username || '')) {
        const available = await ProfileService.isUsernameAvailable(trimmedUsername, currentUser.uid);
        if (!available) {
          toast.error(t('settings.messages.usernameTaken'));
          setLoading(false);
          return;
        }
        await ProfileService.updateUsername(currentUser.uid, trimmedUsername);
        usernameChanged = true;
      }

      // 2. Update display name in Firebase Auth
      let displayNameChanged = false;
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        });
        displayNameChanged = true;
      }

      // 3. Update user document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        updatedAt: new Date()
      });

      // Refresh context if needed
      if (usernameChanged || displayNameChanged) {
        await refreshUserProfile();
      }

      toast.success(t('settings.messages.updateSuccess'));

      // Redirect/Refresh is handled by refreshUserProfile
    } catch (err: any) {
      console.error('Error updating account:', err);
      toast.error(err.message || t('settings.messages.updateFailed'));
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
      toast.error(t('settings.messages.noUser'));
      return;
    }

    setLoading(true);
    setShowDeleteModal(false);

    try {
      await deleteAccount();
      // Account deleted successfully, navigate to home
      navigate('/');
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account. You may need to re-authenticate.');
      setLoading(false);
    }
  };

  return (
    <div className="container-details-page">
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
              <div className="hidden md:flex">
                <SupportButton />
              </div>
              <Link to={currentUser?.username ? `/profile/${currentUser.username}` : '#'} className="user-avatar-link" title={t('settings.profilePhoto.change')}>
                <div
                  className="user-avatar"
                  style={{
                    backgroundImage: photoPreview ? `url(${photoPreview})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onClick={() => {
                    // Prevent navigation to profile if they just wanted to clik the div to change photo from the setting modal body 
                    // Wait, the user specifically asked: "ayarlarda navbarda profil resmine dokununca bizi prodil sayfaasina atmali" -> "in settings, clicking navbar profile photo should take us to profile page"
                    // We shouldn't trigger the file picker from the navbar photo. File picker has its own dedicated button in the page content.
                  }}
                >
                  {!photoPreview && (currentUser?.displayName?.charAt(0).toUpperCase() || 'U')}
                </div>
              </Link>
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container fade-in">
        <div className="container-header">
          <h2>{t('settings.title')}</h2>
          <p>{t('settings.subtitle')}</p>
        </div>

        <div className="settings-content">

          {/* Account Section */}
          <section className="settings-section">
            <h3>{t('settings.account')}</h3>


            {/* Profile Photo Upload */}
            <div className="settings-item settings-profile-photo">
              <div className="settings-item-info">
                <h4>{t('settings.profilePhoto.label')}</h4>
                <p>{t('settings.profilePhoto.desc')}</p>
              </div>
              <div className="profile-photo-upload-wrap">
                <div
                  className="profile-photo-upload-preview"
                  onClick={() => photoInputRef.current?.click()}
                  title={t('settings.profilePhoto.change')}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="profile-photo-preview-img" />
                  ) : (
                    <div className="profile-photo-placeholder">
                      {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="profile-photo-overlay">
                    {photoLoading ? (
                      <span className="profile-photo-spinner" />
                    ) : (
                      <Camera size={20} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <h4>{t('settings.username.label')}</h4>
                <p>{t('settings.username.desc')}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', width: '100%', maxWidth: '350px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 0 }}>
                  <AtSign size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="form-input w-full"
                    placeholder={t('settings.username.placeholder')}
                    value={formData.username}
                    onChange={handleChange}
                    maxLength={20}
                    style={{ paddingLeft: '2.5rem', margin: 0, minWidth: 0, width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <h4>{t('settings.labels.name')}</h4>
                <p>{t('settings.placeholders.name')}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', width: '100%', maxWidth: '350px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 0 }}>
                  <User size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <input
                    id="name"
                    name="displayName"
                    type="text"
                    className="form-input w-full"
                    placeholder={t('settings.placeholders.name')}
                    value={formData.displayName}
                    onChange={handleChange}
                    maxLength={30}
                    style={{ paddingLeft: '2.25rem', margin: 0, minWidth: 0, width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="settings-item settings-item-media" style={{ borderBottom: 'none' }}>
              <div className="settings-item-info">
                <h4>{t('settings.labels.email')}</h4>
                <p>{t('settings.messages.emailDisabled')}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', width: '100%', maxWidth: '350px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 0 }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input w-full"
                    placeholder={t('settings.placeholders.email')}
                    value={formData.email}
                    disabled
                    style={{ paddingLeft: '2.25rem', margin: 0, minWidth: 0, width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                    title={t('settings.messages.emailDisabled')}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="submit"
                onClick={handleUpdateAccount}
                disabled={loading}
                className="btn-primary update-account-btn"
                style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? t('settings.buttons.updating') : t('settings.buttons.update')}
              </button>
            </div>

            {/* Subscription Plan Sub-Item */}
            <div className="settings-item settings-item-media" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div className="settings-item-info">
                <h4>{t('settings.plan.title', 'Subscription Plan')}</h4>
                <p>{t('settings.plan.desc', 'Manage your Blink subscription and unlock more features.')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span
                    className="settings-plan-badge"
                    style={{
                      backgroundColor:
                        currentUser?.plan === 'pro+' ? '#f59e0b' :
                          currentUser?.plan === 'pro' ? '#8b5cf6' :
                            'var(--text-secondary)'
                    }}
                  >
                    {currentUser?.plan === 'pro+' ? <Crown size={13} /> :
                      currentUser?.plan === 'pro' ? <Zap size={13} /> :
                        <Star size={13} />}
                    {getPlanConfig(currentUser?.plan as UserPlan | undefined).name}
                  </span>
                  {(!currentUser?.plan || currentUser?.plan === 'starter') && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {t('settings.plan.upgradeHint', 'Upgrade to unlock file uploads and more.')}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {currentUser?.email === 'samirhasimov10@gmail.com' && (
                  <button
                    onClick={async () => {
                      if (!currentUser) return;
                      try {
                        const order: UserPlan[] = ['starter', 'pro', 'pro+'];
                        const currentIdx = order.indexOf((currentUser.plan as UserPlan) ?? 'starter');
                        const nextPlan = order[(currentIdx + 1) % order.length];
                        const userRef = doc(db, 'users', currentUser.uid);
                        await updateDoc(userRef, { plan: nextPlan });
                        toast.success(`Debug: Plan updated to ${nextPlan}. Reloading...`);
                        setTimeout(() => window.location.reload(), 1500);
                      } catch (err: any) {
                        toast.error('Failed to change plan: ' + err.message);
                      }
                    }}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t('settings.plan.devBtn', 'Change Plan (Dev)')}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (currentUser?.plan && currentUser.plan !== 'starter') {
                      alert(t('plans.paywall.portalNote', 'You can manage your subscription through the link in your email or by contacting support.'));
                    } else if (isMobileDevice()) {
                      navigate('/mobile-upgrade');
                    } else {
                      navigate('/paywall');
                    }
                  }}
                  className="btn-primary"
                  style={{
                    background:
                      currentUser?.plan === 'pro+' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                        currentUser?.plan === 'pro' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' :
                          'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Zap size={15} />
                  {currentUser?.plan === 'starter' || !currentUser?.plan
                    ? t('settings.plan.upgradeBtn', 'Upgrade Plan')
                    : t('settings.plan.manageBtn', 'Manage Plan')
                  }
                </button>
              </div>
            </div>
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
                  <div className="toggle-thumb" />
                </div>
              </div>

              {/* Animation Toggle */}
              <div className="settings-item">
                <div className="settings-item-info">
                  <h4>{t('settings.animations')}</h4>
                  <p>{t('settings.animationsDesc')}</p>
                </div>
                <div
                  className={`toggle-switch ${animationsEnabled ? 'checked' : ''}`}
                  onClick={toggleAnimations}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleAnimations();
                    }
                  }}
                  aria-label="Toggle animations"
                >
                  <div className="toggle-thumb" />
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
              <div className="settings-item">
                <div className="settings-item-info">
                  <h4>Search Shortcut</h4>
                  <p>Choose the keyboard shortcut to open global search.</p>
                </div>
                <div className="language-dropdown-container" style={{ width: '180px' }}>
                  <select
                    className="language-select"
                    value={searchShortcut}
                    onChange={(e) => setSearchShortcut(e.target.value as 'ctrl-k' | 'cmd-f')}
                    aria-label="Search Shortcut"
                  >
                    <option value="ctrl-k">Ctrl + K</option>
                    <option value="cmd-f">Cmd/Super + F</option>
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

            <div className="settings-item settings-item-media">
              <div className="settings-item-info">
                <h4>{t('settings.feedback')}</h4>
                <p>{t('settings.feedbackDesc')}</p>
              </div>
              <button
                onClick={() => navigate('/support')}
                className="btn-secondary"
              >
                <MessageSquare className="h-4 w-4" />
                {t('settings.feedback')}
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
            message={t('settings.messages.importConfirm.message', { containers: importSummary?.containers, links: importSummary?.links })}
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
