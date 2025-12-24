import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';

const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <img src={blinkLogo} alt="Blink" style={{ height: '60px', width: 'auto' }} />
          </div>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {success ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>Check Your Email</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and click on the link to reset your password.
              </p>
              <div style={{ 
                background: '#f1f5f9', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginTop: '1.5rem',
                textAlign: 'left'
              }}>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Link 
                  to="/login" 
                  className="submit-button"
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="error-alert">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="auth-footer">
                <p>
                  Remember your password?{' '}
                  <Link to="/login">Sign in</Link>
                </p>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

