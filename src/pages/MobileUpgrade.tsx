import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, ExternalLink, Copy } from 'lucide-react';
import SEO from '../components/SEO';
import { useToast } from '../contexts/ToastContext';

const MobileUpgrade: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText('https://blinklinknet.netlify.app');
    toast.success(t('mobileUpgrade.copied', 'Website link copied!'));
  };

  return (
    <div className="mobile-upgrade-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '24px',
      backgroundColor: 'var(--bg-light)',
      color: 'var(--text-primary)'
    }}>
      <SEO title={t('mobileUpgrade.title', 'Upgrade via Web')} />
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '60px' }}>
        <Link to="/dashboard" style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: 'rgba(var(--primary-rgb), 0.1)', 
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '32px',
          color: 'var(--primary)'
        }}>
          <Globe size={40} />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
          {t('mobileUpgrade.heading', 'Continue on Web')}
        </h1>
        
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>
          {t('mobileUpgrade.desc', 'Visit our website to manage your subscription and access premium features.')}
        </p>

        {/* Link Card */}
        <div style={{ 
          width: '100%', 
          backgroundColor: 'var(--card-bg)', 
          padding: '20px', 
          borderRadius: '20px', 
          border: '1px solid var(--border-color)',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontWeight: '600', fontSize: '18px', color: 'var(--primary)' }}>
            blinklinknet.netlify.app
          </span>
          <button 
            onClick={handleCopy}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              borderRadius: '12px', 
              border: 'none', 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Copy size={14} />
            {t('mobileUpgrade.copyBtn', 'Copy link')}
          </button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          {t('mobileUpgrade.returnNote', 'Log in to your account on the web to upgrade.')}
        </p>
      </main>

      {/* Footer CTA */}
      <div style={{ marginTop: 'auto', padding: '20px 0' }}>
        <button 
          onClick={() => window.open('https://blinklinknet.netlify.app', '_blank')}
          className="btn-primary"
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          <ExternalLink size={20} />
          {t('mobileUpgrade.openBtn', 'Open in Browser')}
        </button>
      </div>
    </div>
  );
};

export default MobileUpgrade;
