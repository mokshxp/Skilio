import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import UpgradePrompt from './UpgradePrompt';

/**
 * FeatureGate — renders children if the user's plan has access.
 * Otherwise renders the fallback (default: UpgradePrompt).
 *
 * Props:
 *   feature: string — key from PLANS[plan].limits
 *   requiredPlan: string — 'pro' | 'enterprise'
 *   featureName: string — human readable, e.g. "AI Evaluation"
 *   fallback: ReactNode — optional custom fallback
 *   children: ReactNode
 */
export default function FeatureGate({
  feature,
  requiredPlan = 'Pro',
  featureName,
  fallback,
  children,
}) {
  const { limits, isLoading } = useSubscription();

  if (isLoading) return null;

  const hasAccess = !!limits[feature];

  if (hasAccess) return children;

  return fallback || (
    <UpgradePrompt
      feature={featureName || feature}
      requiredPlan={requiredPlan}
    />
  );
}
