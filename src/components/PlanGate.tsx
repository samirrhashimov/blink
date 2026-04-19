import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isAppWebView } from '../utils/device';
import type { UserPlan } from '../types';
import { useTranslation } from 'react-i18next';

interface PlanGateProps {
  /** Minimum plan required to access */
  requiredPlan: UserPlan;
  /** The content to show when the user has access */
  children: React.ReactNode;
  /** Optional: show a small inline badge instead of a full gate */
  inline?: boolean;
}

const planOrder: UserPlan[] = ['starter', 'pro', 'pro+'];

const hasAccess = (userPlan: UserPlan | undefined, requiredPlan: UserPlan): boolean => {
  const userIdx = planOrder.indexOf(userPlan ?? 'starter');
  const reqIdx = planOrder.indexOf(requiredPlan);
  return userIdx >= reqIdx;
};

const PLAN_LABELS: Record<UserPlan, string> = {
  'starter': 'Starter',
  'pro': 'Pro',
  'pro+': 'Pro+',
};

const PlanGate: React.FC<PlanGateProps> = ({ requiredPlan, children, inline = false }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userPlan = currentUser?.plan;

  if (hasAccess(userPlan, requiredPlan)) {
    return <>{children}</>;
  }

  if (inline) {
    return (
      <div
        className="plan-gate-inline"
        onClick={() => !isAppWebView() && navigate('/paywall')}
        style={{ cursor: isAppWebView() ? 'default' : 'pointer' }}
        title={isAppWebView() ? `Requires ${PLAN_LABELS[requiredPlan]} plan` : `Upgrade to ${PLAN_LABELS[requiredPlan]}`}
      >
        <Lock size={12} />
        <span>{PLAN_LABELS[requiredPlan]}</span>
      </div>
    );
  }

  return (
    <div className="plan-gate-overlay">
      <div className="plan-gate-content">
        <div className="plan-gate-icon">
          <Zap size={28} />
        </div>
        <h3 className="plan-gate-title">
          {t('plans.gate.title', { plan: PLAN_LABELS[requiredPlan] })}
        </h3>
        <p className="plan-gate-desc">
          {t('plans.gate.desc', {
            required: PLAN_LABELS[requiredPlan],
            current: PLAN_LABELS[userPlan ?? 'starter'],
          })}
        </p>
        <button
          className="plan-gate-btn"
          onClick={() => navigate(isAppWebView() ? '/mobile-upgrade' : '/paywall')}
        >
          <Zap size={16} />
          {t('plans.gate.cta')}
        </button>
      </div>
    </div>
  );
};

export { hasAccess };
export default PlanGate;
