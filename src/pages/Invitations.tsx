import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useVault } from '../contexts/VaultContext';
import { SharingService } from '../services/sharingService';
import { NotificationService } from '../services/notificationService';
import { UserService } from '../services/userService';
import type { ShareInvite } from '../types';
import blinkLogo from '../assets/blinklogo2.png';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Moon, 
  Sun, 
  Settings,
  Mail,
  Clock,
  Eye,
  MessageCircle,
  Edit3
} from 'lucide-react';

const Invitations: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { refreshVaults } = useVault();
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
      setError(err.message || 'Failed to load invitations');
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
      
      // Send notification to vault owner
      try {
        const sharerName = UserService.formatUserName(currentUser.displayName, currentUser.email);
        await NotificationService.notifyVaultShared(
          invite.invitedBy,
          invite.vaultId,
          sharerName,
          invite.vaultId,
          currentUser.uid
        );
      } catch (err) {
        console.log('Could not send notification:', err);
      }
      
      // Refresh vaults to include the newly shared vault
      await refreshVaults();
      
      // Remove from list
      setInvitations(prev => prev.filter(inv => inv.id !== invite.id));
      
      // Navigate to the vault
      navigate(`/vault/${invite.vaultId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
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
      setError(err.message || 'Failed to decline invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <img src={blinkLogo} alt="Blink" className="logo-image" style={{height: '40px', width: 'auto', marginLeft: '1rem'}} />
            </div>
            <nav className="main-nav">
              <Link to="/dashboard">Home</Link>
              <span className="active-link">Invitations</span>
            </nav>
            <div className="header-right">
              <button onClick={toggleTheme} className="theme-toggle mediaforbuttons">
                {theme === 'light' ? <Moon /> : <Sun />}
              </button>
              <Link to="/settings" className="settings-link mediaforbuttons">
                <Settings />
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
          <h2>Invitations</h2>
          <p>Accept or decline invitations to collaborate on containers</p>
        </div>

        <div className="vault-content">
          <div className="links-section">

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-light dark:text-muted-dark">Loading invitations...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-16">
                <div className="collaborators-widget" style={{maxWidth: '500px', margin: '0 auto'}}>
                  <Mail className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No pending invitations
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    When someone invites you to collaborate on a vault, it will appear here.
                  </p>
                  <Link
                    to="/dashboard"
                    className="btn-primary inline-block"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="links-list">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="link-item"
                  >
                    <div className="link-icon">
                      <Mail />
                    </div>
                    <div className="link-info">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {invite.vaultName || 'Vault'} Invitation
                      </h4>
                      {invite.inviterName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          From: <span className="font-medium">{invite.inviterName}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(invite)}
                        disabled={processingId === invite.id}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(invite.id)}
                        disabled={processingId === invite.id}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Decline
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
