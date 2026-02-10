import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import blinkLogo from '../assets/blinklogo2.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t('auth.errors.fillAll'));
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(t('auth.errors.loginFailed'));
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <SEO title={t('auth.login.title')} description={t('auth.login.subtitle')} />
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <img src={blinkLogo} alt="Blink" style={{ height: '60px', width: 'auto' }} />
          </div>
          <h2>{t('auth.login.welcome')}</h2>
          <p>{t('auth.login.signInToContinue')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-alert">
              {error}
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
            {t('auth.login.google')}
          </button>

          <div className="auth-divider desktop-only">OR</div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('auth.login.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder={t('auth.login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="password">{t('auth.login.password')}</label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--primary, #6366f1)',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="form-input pr-10"
                placeholder={t('auth.login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-0 p-0"
                style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </button>

          <div className="auth-footer">
            <p>
              {t('auth.login.noAccount')}{' '}
              <Link to="/signup">{t('auth.login.signUp')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
