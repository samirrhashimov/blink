import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import blinkLogo from '../assets/blinklogo2.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, AtSign } from 'lucide-react';
import SEO from '../components/SEO';
import { ProfileService } from '../services/profileService';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showCheckboxError, setShowCheckboxError] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === 'acceptedTerms' && checked) {
      setShowCheckboxError(false);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t('auth.errors.fillAll'));
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError(t('auth.errors.usernameInvalid'));
      return;
    }

    if (!formData.acceptedTerms) {
      setError(t('auth.errors.acceptTerms'));
      // Briefly disable then enable to re-trigger animation if already showing
      setShowCheckboxError(false);
      setTimeout(() => setShowCheckboxError(true), 10);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.errors.passwordsNoMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.errors.passwordLength'));
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Check if username is available
      const isAvailable = await ProfileService.isUsernameAvailable(formData.username, 'new-user');
      if (!isAvailable) {
        setError(t('auth.errors.usernameTaken'));
        setLoading(false);
        return;
      }

      await signup(formData.email, formData.password, formData.displayName, formData.username);
      setShowVerificationMessage(true);
      // Navigate to verify email page after 3 seconds
      setTimeout(() => {
        navigate('/verify-email');
      }, 3000);
    } catch (error: any) {
      console.error('Signup error:', error);

      // Provide more specific error messages
      if (error.code === 'auth/email-already-in-use') {
        setError(t('auth.errors.emailInUse'));
      } else if (error.code === 'auth/weak-password') {
        setError(t('auth.errors.weakPassword'));
      } else if (error.code === 'auth/invalid-email') {
        setError(t('auth.errors.invalidEmail'));
      } else if (error.code === 'auth/operation-not-allowed') {
        setError(t('auth.errors.operationNotAllowed'));
      } else {
        setError(t('auth.errors.createFailed', { message: error.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <SEO title={t('auth.signup.title')} description={t('auth.signup.subtitle')} />
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <img src={blinkLogo} alt="Blink" style={{ height: '60px', width: 'auto' }} />
          </div>
          <h2>{t('auth.signup.header')}</h2>
          <p>{t('auth.signup.subheader')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          {showVerificationMessage && (
            <div className="success-alert" style={{
              background: '#d1fae5',
              border: '1px solid #10b981',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <strong>{t('auth.verification.title')}</strong>
              <br />
              {t('auth.verification.message')}
              <br />
              <small style={{ fontSize: '0.85rem' }}>{t('auth.verification.redirecting')}</small>
            </div>
          )}

          <button
            type="button"
            className="google-btn desktop-only"
            onClick={loginWithGoogle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#fff',
              color: '#3c4043',
              border: '1px solid #dadce0',
              fontWeight: '500'
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
            {t('auth.signup.google')}
          </button>

          <div className="auth-divider desktop-only">OR</div>

          <div className="form-group">
            <label className="form-label" htmlFor="displayName">{t('auth.signup.fullName')}</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              className="form-input"
              placeholder={t('auth.signup.fullName')}
              value={formData.displayName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="username">{t('auth.signup.username')}</label>
            <div className="relative">
              <AtSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="username"
                name="username"
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '2rem' }}
                placeholder={t('auth.signup.usernamePlaceholder')}
                value={formData.username}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setFormData(prev => ({ ...prev, username: val }));
                }}
                maxLength={20}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.signup.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder={t('auth.signup.email')}
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('auth.signup.password')}</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="form-input pr-10"
                placeholder={t('auth.signup.password')}
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-0 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="form-input pr-10"
                placeholder={t('auth.signup.confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-0 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className={`form-group checkbox-group ${showCheckboxError ? 'error' : ''}`}>
            <input
              id="acceptedTerms"
              name="acceptedTerms"
              type="checkbox"
              checked={formData.acceptedTerms}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer', flexShrink: 0 }}
            />
            <label htmlFor="acceptedTerms" style={{ fontSize: '0.875rem', color: 'inherit', cursor: 'pointer', lineHeight: '1.4' }}>
              {t('auth.signup.terms.agree')} <Link to="/legal/terms-and-conditions" target="_blank" style={{ color: 'var(--primary)', fontWeight: '600' }}>{t('auth.signup.terms.conditions')}</Link> {t('auth.signup.terms.and')} <Link to="/legal/privacy-policy" target="_blank" style={{ color: 'var(--primary)', fontWeight: '600' }}>{t('auth.signup.terms.privacy')}</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? t('auth.signup.submitting') : t('auth.signup.submit')}
          </button>

          <div className="auth-footer">
            <p>
              {t('auth.signup.hasAccount')}{' '}
              <Link to="/login">{t('auth.signup.signIn')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
