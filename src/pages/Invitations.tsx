import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useContainer } from '../contexts/ContainerContext';
import { SharingService } from '../services/sharingService';
import { NotificationService } from '../services/notificationService';
import { UserService } from '../services/userService';
import type { ShareInvite } from '../types';
import blinkLogo from '../assets/blinklogo2.png';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import {
  ArrowLeft,
  Check,
  X,
  Settings,
  UserPlus,
  Clock,
  Eye,
  MessageCircle,
  Edit3
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

const Invitations: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { refreshContainers } = useContainer();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<ShareInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.email) {
      loadInvitations();
    }
  }, [currentUser]);

  const loadInvitations = async () => {
    if (!currentUser?.email) return;

    setLoading(true);
    setError('');

    try {
      const invites = await SharingService.getUserInvitations(currentUser.email);
      setInvitations(invites);
    } catch (err: any) {
      setError(err.message || t('invitations.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invite: ShareInvite) => {
    if (!currentUser) return;

    setProcessingId(invite.id);
    setError('');

    try {
      await SharingService.acceptInvitation(invite.id, currentUser.uid);

      // Send notification to container owner
      try {
        const sharerName = UserService.formatUserName(currentUser.displayName, currentUser.email);
        await NotificationService.notifyContainerShared(
          invite.invitedBy,
          invite.containerId,
          sharerName,
          invite.containerId,
          currentUser.uid
        );
      } catch (err) {
        console.log('Could not send notification:', err);
      }

      // Refresh containers to include the newly shared container
      await refreshContainers();

      // Remove from list
      setInvitations(prev => prev.filter(inv => inv.id !== invite.id));

      // Navigate to the container
      navigate(`/container/${invite.containerId}`);
    } catch (err: any) {
      setError(err.message || t('invitations.errors.acceptFailed'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    setError('');

    try {
      await SharingService.declineInvitation(inviteId);
      setInvitations(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (err: any) {
      setError(err.message || t('invitations.errors.declineFailed'));
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(t('common.locale', { defaultValue: 'en-US' }), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-page overflow-hidden">
      <SEO title={t('landing.features.invitations.title')} description={t('landing.features.invitations.desc')} />
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
              <Link to="/settings" className="theme-toggle" title={t('dashboard.tooltips.settings')}>
                <Settings className="h-5 w-5" />
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
        <div className="container-header">
          <h2>{t('invitations.title')}</h2>
          <p>{t('invitations.subtitle')}</p>
        </div>

        <div className="container-content">
          <div className="links-section">

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-12">
                <LoadingSkeleton variant="card" count={3} />
              </div>
            ) : invitations.length === 0 ? (
              <EmptyState
                type="invitations"
                title={t('invitations.empty.title')}
                description={t('invitations.empty.desc')}
                action={
                  <Link
                    to="/dashboard"
                    className="btn-primary inline-block"
                    style={{ textDecoration: 'none' }}
                  >
                    {t('invitations.empty.button')}
                  </Link>
                }
              />
            ) : (
              <div className="links-list">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="link-item invitation-item"
                  >
                    <div className="link-item-content">
                      <div className="link-icon">
                        <UserPlus />
                      </div>
                      <div className="link-info">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {t('invitations.item.title', { name: invite.containerName || 'Container' })}
                        </h4>
                        {invite.inviterName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('invitations.item.from', { name: invite.inviterName })}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`permission-badge permission-badge-${invite.permission}`}>
                            {invite.permission === 'view' && <Eye className="h-3 w-3" />}
                            {invite.permission === 'comment' && <MessageCircle className="h-3 w-3" />}
                            {invite.permission === 'edit' && <Edit3 className="h-3 w-3" />}
                            <span className="capitalize">{invite.permission}</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatDate(invite.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="link-item-actions invitation-actions">
                      <button
                        onClick={() => handleAccept(invite)}
                        disabled={processingId === invite.id}
                        className="invitation-btn invitation-btn-accept"
                      >
                        <Check />
                        <span>{t('invitations.item.buttons.accept')}</span>
                      </button>
                      <button
                        onClick={() => handleDecline(invite.id)}
                        disabled={processingId === invite.id}
                        className="invitation-btn invitation-btn-decline"
                      >
                        <X />
                        <span>{t('invitations.item.buttons.decline')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Invitations;
