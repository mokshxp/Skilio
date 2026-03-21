import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, ArrowRight } from 'lucide-react';

/**
 * UpgradePrompt — shown when a feature is locked behind a paid plan.
 * Props:
 *   feature: string — e.g. "DSA Coding Rounds"
 *   requiredPlan: string — e.g. "Pro"
 *   description: string — optional extra context
 *   compact: bool — smaller inline version
 */
export default function UpgradePrompt({ feature, requiredPlan = 'Pro', description, compact = false }) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="upgrade-prompt-compact" onClick={() => navigate('/pricing')}>
        <Lock size={12} />
        <span>{feature} · <strong>{requiredPlan}</strong></span>
        <ArrowRight size={12} />
      </div>
    );
  }

  return (
    <div className="upgrade-prompt">
      <div className="upgrade-prompt__icon">
        <Lock size={22} />
      </div>
      <div className="upgrade-prompt__body">
        <p className="upgrade-prompt__title">
          <Lock size={14} style={{ display: 'inline', marginRight: 6 }} />
          {feature} requires <strong style={{ color: 'var(--accent)' }}>{requiredPlan}</strong>
        </p>
        {description && (
          <p className="upgrade-prompt__desc">{description}</p>
        )}
        <button
          className="upgrade-prompt__btn"
          onClick={() => navigate('/pricing')}
        >
          <Zap size={14} />
          Upgrade to {requiredPlan}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
