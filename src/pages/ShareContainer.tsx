import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useContainer } from '../contexts/ContainerContext';
import { useToast } from '../contexts/ToastContext';
import { SharingService } from '../services/sharingService';
import { NotificationService } from '../services/notificationService';
import { UserService } from '../services/userService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ShareInvite } from '../types';
import blinkLogo from '../assets/blinklogo2.png';
import {
  ArrowLeft,
  Settings,
  X,
  Eye,
  Edit3,
  UserPlus,
  Globe,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import SEO from '../components/SEO';

const ShareContainer: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { containers, updateContainer } = useContainer();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<ShareInvite[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  const container = containers.find(v => v.id === id);
  const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];
  const containerColor = container?.color || (id ? colors[id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length] : colors[0]);

  // Helper to get RGB from hex
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '99, 102, 241';
  };

  useEffect(() => {
    if (id) {
      loadPendingInvites();
    }
  }, [id]);

  const loadPendingInvites = async () => {
    if (!id) return;
    try {
      const invites = await SharingService.getContainerInvitations(id);
      setPendingInvites(invites);
    } catch (err: any) {
      console.error('Error loading invites:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !currentUser) return;

    setLoading(true);

    try {
      // Validate email
      if (!email.trim()) {
        throw new Error('Please enter an email address');
      }

      // Check if trying to invite themselves
      if (email.toLowerCase() === currentUser.email.toLowerCase()) {
        throw new Error('You cannot invite yourself');
      }

      // Format inviter name consistently
      const inviterName = UserService.formatUserName(currentUser.displayName, currentUser.email);

      await SharingService.sendInvitation(
        id,
        email.trim(),
        permission,
        currentUser.uid,
        container?.name,
        inviterName
      );

      // Try to find the invited user by email and send notification
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', email.trim().toLowerCase())
        );
        const usersSnapshot = await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
          const userData = usersSnapshot.docs[0].data();
          await NotificationService.notifyInvitation(
            userData.uid,
            container?.name || 'a container',
            inviterName,
            id,
            currentUser.uid
          );
        }
      } catch (err) {
        console.log('Could not send notification:', err);
      }

      toast.success(t('share.messages.success'));
      setEmail('');
      setPermission('view');

      await loadPendingInvites();
    } catch (err: any) {
      toast.error(err.message || t('share.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePublicToggle = async () => {
    if (!id) return;
    try {
      const currentPublic = container?.isPublic || false;
      await updateContainer(id, { isPublic: !currentPublic });
      toast.success(t('share.messages.success'));
    } catch (err: any) {
      toast.error(err.message || t('share.messages.error'));
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await SharingService.cancelInvitation(inviteId);
      await loadPendingInvites();
      toast.success(t('share.messages.cancelSuccess'));
    } catch (err: any) {
      toast.error(t('share.messages.cancelError'));
    }
  };

  return (
    <div
      className="container-details-page"
      style={{
        '--accent-color': containerColor,
        '--primary': containerColor,
        '--primary-rgb': hexToRgb(containerColor)
      } as React.CSSProperties}
    >
      <SEO title={t('share.title', { name: container?.name || 'Container' })} />

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to={`/container/${id}`} className="back-link">
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

      {/* Main Content */}
      <main className="container fade-in">
        <div className="container-header">
          <div className="container-header-info">
            <h2 className="container-name-title">{t('share.title', { name: container?.name || 'Container' })}</h2>
            <p className="container-description-text">{t('share.subtitle')}</p>
          </div>
        </div>

        <div className="container-content">
          <div className="links-section">
            <div className="collaborators-widget" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Invite Form Section */}
              <section className="share-section">
                <form onSubmit={handleSubmit} className="share-invite-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="invite-input">
                      {t('share.form.label')}
                    </label>
                    <div className="modern-search-bar" style={{ marginTop: 0 }}>
                      <UserPlus className="modern-search-icon" size={18} />
                      <input
                        id="invite-input"
                        type="email"
                        placeholder={t('share.form.placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="modern-search-input"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">{t('share.form.permissions')}</label>
                    <div className="permission-grid">
                      <label
                        className={`permission-option-card ${permission === 'view' ? 'selected' : ''}`}
                        onClick={() => setPermission('view')}
                      >
                        <input
                          type="radio"
                          name="permissions"
                          value="view"
                          checked={permission === 'view'}
                          onChange={(e) => setPermission(e.target.value as 'view' | 'comment' | 'edit')}
                          className="sr-only"
                        />
                        <div className="permission-option-icon">
                          <Eye size={20} />
                        </div>
                        <div className="permission-option-info">
                          <span className="permission-option-title">{t('share.form.view')}</span>
                          <span className="permission-option-desc">{t('share.form.viewDesc')}</span>
                        </div>
                      </label>

                      <label
                        className={`permission-option-card ${permission === 'edit' ? 'selected' : ''}`}
                        onClick={() => setPermission('edit')}
                      >
                        <input
                          type="radio"
                          name="permissions"
                          value="edit"
                          checked={permission === 'edit'}
                          onChange={(e) => setPermission(e.target.value as 'view' | 'comment' | 'edit')}
                          className="sr-only"
                        />
                        <div className="permission-option-icon">
                          <Edit3 size={20} />
                        </div>
                        <div className="permission-option-info">
                          <span className="permission-option-title">{t('share.form.edit')}</span>
                          <span className="permission-option-desc">{t('share.form.editDesc')}</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <Link to={`/container/${id}`} className="btn-cancel">
                      {t('common.buttons.cancel')}
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center gap-2"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner-sm"></div>
                          <span>{t('share.form.submitting')}</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={18} />
                          <span>{t('share.form.submit')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* Pending Invitations Section */}
              {pendingInvites.length > 0 && (
                <>
                  <div className="share-divider"></div>
                  <section className="share-section pending-section">
                    <div className="pending-header">
                      <h3 className="pending-title">{t('share.pending.title')}</h3>
                      <span className="pending-badge">{pendingInvites.length}</span>
                    </div>
                    <div className="pending-list">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="pending-item">
                          <div className="pending-item-avatar" style={{ backgroundColor: `rgba(var(--primary-rgb), 0.1)`, color: 'var(--primary)' }}>
                            {invite.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="pending-item-info">
                            <p className="pending-item-email">{invite.email}</p>
                            <div className="pending-item-meta">
                              <span className={`permission-tag tag-${invite.permission}`}>
                                {invite.permission === 'view' ? <Eye size={12} /> : <Edit3 size={12} />}
                                {invite.permission === 'view' ? t('share.form.view') : t('share.form.edit')}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            className="pending-item-cancel"
                            title={t('share.pending.cancel')}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              <div className="share-divider"></div>

              {/* Public Section */}
              <section className="share-section">
                <div className="public-toggle-wrapper">
                  <div className="public-toggle-info">
                    <div className="public-toggle-title">
                      <Globe size={20} className="text-primary" />
                      <span>{t('share.form.public')}</span>
                    </div>
                    <p className="public-toggle-desc">{t('share.form.publicDesc')}</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={container?.isPublic || false}
                      onChange={handlePublicToggle}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {container?.isPublic && (
                  <div className="public-link-copy-container animate-scaleIn">
                    <label className="public-link-copy-label">
                      {t('share.form.copyLink')}
                    </label>
                    <div className="public-link-copy-group">
                      <div className="public-link-copy-display">
                        {window.location.origin}/container/{id}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/container/${id}`;
                          navigator.clipboard.writeText(url);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                        className={`public-link-copy-button ${linkCopied ? 'copied' : ''}`}
                        title={linkCopied ? t('share.form.linkCopied') : t('share.form.copyLink')}
                      >
                        {linkCopied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareContainer;
