import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Star, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS, getPlanDisplayName } from '../utils/plans';
import type { UserPlan } from '../types';
import { useTranslation } from 'react-i18next';

const PLAN_ICONS: Record<UserPlan, React.ReactNode> = {
  'starter': <Star size={22} />,
  'pro': <Zap size={22} />,
  'pro+': <Crown size={22} />,
};

const PLAN_COLORS: Record<UserPlan, { bg: string; border: string; badge: string }> = {
  'starter': {
    bg: 'var(--bg-secondary)',
    border: 'var(--border-color)',
    badge: '#64748b',
  },
  'pro': {
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
    border: '#8b5cf6',
    badge: '#8b5cf6',
  },
  'pro+': {
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.08))',
    border: '#f59e0b',
    badge: '#f59e0b',
  },
};

const Paywall: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userPlan = currentUser?.plan ?? 'starter';

  const planOrder: UserPlan[] = ['starter', 'pro', 'pro+'];

  const handleUpgrade = (plan: UserPlan) => {
    // RevenueCat entegrasyon noktası — şimdilik placeholder
    console.log(`Initiate purchase for plan: ${plan}`);
    alert(t('plans.paywall.comingSoon', 'Payment integration coming soon! Plan: ' + PLANS[plan].name));
  };

  return (
    <div className="paywall-page">
      <div className="paywall-header">
        <button className="paywall-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="paywall-header-text">
          <h1>{t('plans.paywall.title', 'Choose Your Plan')}</h1>
          <p>{t('plans.paywall.subtitle', 'Unlock more features with a Blink subscription')}</p>
        </div>
      </div>

      <div className="paywall-current-plan">
        <span className="paywall-current-label">
          {t('plans.paywall.currentPlan', 'Your current plan:')}
        </span>
        <span
          className="plan-badge"
          style={{ backgroundColor: PLAN_COLORS[userPlan].badge }}
        >
          {PLAN_ICONS[userPlan]}
          {getPlanDisplayName(userPlan)}
        </span>
      </div>

      <div className="paywall-plans-grid">
        {planOrder.map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = planId === userPlan;
          const colors = PLAN_COLORS[planId];
          const isPopular = planId === 'pro';

          return (
            <div
              key={planId}
              className={`paywall-plan-card ${isCurrent ? 'paywall-plan-card--current' : ''} ${isPopular ? 'paywall-plan-card--popular' : ''}`}
              style={{
                background: colors.bg,
                borderColor: isCurrent ? colors.border : undefined,
              }}
            >
              {isPopular && !isCurrent && (
                <div className="paywall-popular-badge">
                  {t('plans.paywall.popular', 'Most Popular')}
                </div>
              )}
              {isCurrent && (
                <div className="paywall-current-badge" style={{ backgroundColor: colors.badge }}>
                  {t('plans.paywall.currentBadge', 'Current')}
                </div>
              )}

              <div className="paywall-plan-header">
                <div
                  className="paywall-plan-icon"
                  style={{ color: colors.badge, backgroundColor: `${colors.badge}18` }}
                >
                  {PLAN_ICONS[planId]}
                </div>
                <div>
                  <h2 className="paywall-plan-name">{plan.name}</h2>
                  <div className="paywall-plan-price">
                    {plan.price === 0 ? (
                      <span className="paywall-price-free">{t('plans.paywall.free', 'Free')}</span>
                    ) : (
                      <>
                        <span className="paywall-price-amount">${plan.price}</span>
                        <span className="paywall-price-period">/{t('plans.paywall.month', 'mo')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <ul className="paywall-features-list">
                {plan.features.map((feature, i) => (
                  <li key={`f-${i}`} className="paywall-feature-item">
                    <Check size={15} className="paywall-feature-check" style={{ color: colors.badge }} />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation, i) => (
                  <li key={`l-${i}`} className="paywall-feature-item paywall-feature-item--limit">
                    <X size={15} className="paywall-feature-check" style={{ color: '#ef4444' }} />
                    <span style={{ opacity: 0.6 }}>{limitation}</span>
                  </li>
                ))}
              </ul>

              <div className="paywall-plan-footer">
                {isCurrent ? (
                  <button className="paywall-btn paywall-btn--current" disabled>
                    {t('plans.paywall.currentBtn', 'Current Plan')}
                  </button>
                ) : planId === 'starter' ? (
                  <button className="paywall-btn paywall-btn--downgrade" onClick={() => navigate(-1)}>
                    {t('plans.paywall.downgrade', 'Continue with Free')}
                  </button>
                ) : (
                  <button
                    className="paywall-btn paywall-btn--upgrade"
                    style={{ background: colors.badge }}
                    onClick={() => handleUpgrade(planId)}
                  >
                    <Zap size={16} />
                    {t('plans.paywall.upgrade', 'Upgrade to {{plan}}', { plan: plan.name })}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="paywall-footer-note">
        {t('plans.paywall.note', 'Payment powered by RevenueCat. Cancel anytime.')}
      </p>
    </div>
  );
};

export default Paywall;
