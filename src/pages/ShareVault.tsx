import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useVault } from '../contexts/VaultContext';
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
  MessageCircle,
  Edit3,
  UserPlus
} from 'lucide-react';

const ShareVault: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { vaults } = useVault();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<ShareInvite[]>([]);

  const vault = vaults.find(v => v.id === id);
  const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];
  const vaultColor = vault?.color || (id ? colors[id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length] : colors[0]);

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
      const invites = await SharingService.getVaultInvitations(id);
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
        vault?.name,
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
            vault?.name || 'a vault',
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

      setTimeout(() => {
        navigate(`/vault/${id}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || t('share.messages.error'));
    } finally {
      setLoading(false);
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
      className="vault-details-page"
      style={{
        '--accent-color': vaultColor,
        '--primary': vaultColor,
        '--primary-rgb': hexToRgb(vaultColor)
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to={`/vault/${id}`} className="back-link">
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
      <main className="container">
        <div className="vault-header">
          <h2>{t('share.title', { name: vault?.name || 'Vault' })}</h2>
          <p>{t('share.subtitle')}</p>
        </div>

        <div className="vault-content">
          <div className="links-section">
            <div className="collaborators-widget">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="form-group">
                  <label className="form-label" htmlFor="invite-input">
                    {t('share.form.label')}
                  </label>
                  <div className="relative">
                    <div
                      className="absolute left-4 pointer-events-none text-gray-400"
                      style={{ top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}
                    >
                    </div>
                    <input
                      id="invite-input"
                      type="email"
                      placeholder={t('share.form.placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input pl-12"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 mt-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('share.form.permissions')}</h3>
                  </div>
                  <div className="permissions-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <label className="permission-card group cursor-pointer">
                      <input
                        type="radio"
                        name="permissions"
                        value="view"
                        checked={permission === 'view'}
                        onChange={(e) => setPermission(e.target.value as 'view' | 'comment' | 'edit')}
                        className="sr-only"
                      />
                      <div className={`permission-card-content ${permission === 'view' ? 'permission-card-selected' : ''}`}>
                        <div className="permission-icon-wrapper">
                          <Eye className="permission-icon" />
                        </div>
                        <div className="flex-grow">
                          <p className="permission-title">{t('share.form.view')}</p>
                          <p className="permission-description">{t('share.form.viewDesc')}</p>
                        </div>
                        <div className="permission-radio">
                          <div className="permission-radio-outer">
                            <div className="permission-radio-inner"></div>
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="permission-card group cursor-pointer">
                      <input
                        type="radio"
                        name="permissions"
                        value="edit"
                        checked={permission === 'edit'}
                        onChange={(e) => setPermission(e.target.value as 'view' | 'comment' | 'edit')}
                        className="sr-only"
                      />
                      <div className={`permission-card-content ${permission === 'edit' ? 'permission-card-selected' : ''}`}>
                        <div className="permission-icon-wrapper">
                          <Edit3 className="permission-icon" />
                        </div>
                        <div className="flex-grow">
                          <p className="permission-title">{t('share.form.edit')}</p>
                          <p className="permission-description">{t('share.form.editDesc')}</p>
                        </div>
                        <div className="permission-radio">
                          <div className="permission-radio-outer">
                            <div className="permission-radio-inner"></div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Link
                    to={`/vault/${id}`}
                    className="btn-cancel"
                  >
                    {t('common.buttons.cancel')}
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? t('share.form.submitting') : t('share.form.submit')}
                  </button>
                </div>
              </form>

              {/* Pending Invitations */}
              {pendingInvites.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="sharingcollabtitle flex items-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('share.pending.title')}</h3>
                    <span className="invitation-badge">{pendingInvites.length}</span>
                  </div>
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className="invitation-item">
                        <div className="flex items-center gap-3 flex-grow">
                          <div className="invitation-avatar">
                            {invite.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="invitation-email">{invite.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`permission-badge permission-badge-${invite.permission}`}>
                                {invite.permission === 'view' && <Eye className="h-3 w-3" />}
                                {invite.permission === 'comment' && <MessageCircle className="h-3 w-3" />}
                                {invite.permission === 'edit' && <Edit3 className="h-3 w-3" />}
                                <span className="capitalize">{invite.permission === 'view' ? t('share.form.view') : t('share.form.edit')}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="invitation-cancel-btn"
                          title="Cancel invitation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareVault;
