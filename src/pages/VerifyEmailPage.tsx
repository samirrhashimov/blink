import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';

const VerifyEmailPage: React.FC = () => {
  const { currentUser, resendEmailVerification, checkEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

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
                <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  We've sent a verification email to <strong>{currentUser.email}</strong>.
                  Please check your inbox and click on the verification link.
                </p>
                <div style={{ 
                  background: '#f1f5f9', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginTop: '1.5rem',
                  textAlign: 'left'
                }}>
                </div>
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
                gap: '1.5rem',
                alignItems: 'stretch',
                width: '100%'
              }}>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending || isChecking}
                  className="submit-button"
                  style={{ 
                    opacity: (isResending || isChecking) ? 0.6 : 1,
                    cursor: (isResending || isChecking) ? 'not-allowed' : 'pointer',
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
                  disabled={isChecking || isResending}
                  className="submit-button"
                  style={{ 
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    opacity: (isChecking || isResending) ? 0.6 : 1,
                    cursor: (isChecking || isResending) ? 'not-allowed' : 'pointer',
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
