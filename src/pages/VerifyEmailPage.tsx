import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';

const VerifyEmailPage: React.FC = () => {
  const { currentUser, resendEmailVerification, checkEmailVerification, updateUserEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setNewEmail(currentUser.email);
    // Check if email is already verified
    checkVerificationStatus();
  }, [currentUser, navigate]);

  const checkVerificationStatus = async () => {
    if (!currentUser) return;

    setIsChecking(true);
    try {
      const verified = await checkEmailVerification();
      setIsVerified(verified);
      if (verified) {
        setMessage('Email verified! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError('An error occurred while checking email status.');
      console.error('Error checking verification:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setError('');
    setMessage('');

    try {
      await resendEmailVerification();
      setMessage('Verification email has been resent! Please check your inbox.');
    } catch (err: any) {
      if (err.message.includes('already verified')) {
        setError('Email is already verified.');
        setIsVerified(true);
      } else {
        setError(err.message || 'An error occurred while sending email. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === currentUser?.email) {
      setIsEditingEmail(false);
      return;
    }

    setIsUpdatingEmail(true);
    setError('');
    setMessage('');

    try {
      await updateUserEmail(newEmail);
      setMessage('Email updated and new verification link sent!');
      setIsEditingEmail(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update email. Please try again.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signup');
    } catch (err: any) {
      setError('Failed to sign out.');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <img src={blinkLogo} alt="Blink" style={{ height: '60px', width: 'auto' }} />
          </div>
          <h2>Email Verification</h2>
        </div>

        <div className="auth-form" style={{ textAlign: 'center' }}>
          {isVerified ? (
            <div style={{ padding: '2rem' }}>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>Email Verified!</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Your email has been successfully verified. Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              <div>
                {isEditingEmail ? (
                  <form onSubmit={handleUpdateEmail} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Update Your Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter correct email"
                      required
                      style={{ marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={isUpdatingEmail}
                        className="submit-button"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(false)}
                        className="submit-button"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          background: 'transparent',
                          border: '1px solid #cbd5e1',
                          color: '#64748b'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    We've sent a verification email to <strong>{currentUser.email}</strong>.
                    <br />
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        padding: 0,
                        fontSize: '0.85rem',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        marginTop: '0.25rem'
                      }}
                    >
                      Wrong email? Change it
                    </button>
                  </p>
                )}
              </div>

              {message && (
                <div className="success-alert" style={{ marginBottom: '1rem' }}>
                  {message}
                </div>
              )}

              {error && (
                <div className="error-alert" style={{ marginBottom: '1rem' }}>
                  <AlertCircle className="h-5 w-5 inline mr-2" />
                  {error}
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'stretch',
                width: '100%'
              }}>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending || isChecking || isEditingEmail}
                  className="submit-button"
                  style={{
                    opacity: (isResending || isChecking || isEditingEmail) ? 0.6 : 1,
                    cursor: (isResending || isChecking || isEditingEmail) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      <span>Resend Email</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={checkVerificationStatus}
                  disabled={isChecking || isResending || isEditingEmail}
                  className="submit-button"
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    opacity: (isChecking || isResending || isEditingEmail) ? 0.6 : 1,
                    cursor: (isChecking || isResending || isEditingEmail) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span>Check Status</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  Sign in with a different account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
