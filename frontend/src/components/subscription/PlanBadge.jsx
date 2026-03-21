import React from 'react';

/**
 * PlanBadge — small colored badge showing plan name.
 * Free = muted gray, Pro = amber, Enterprise = sky blue
 */
export default function PlanBadge({ plan = 'free', size = 'sm' }) {
  const config = {
    free: { label: 'Free', className: 'badge-muted' },
    pro: { label: 'Pro', className: 'badge-amber' },
    enterprise: { label: 'Enterprise', className: 'badge-sky' },
  };

  const { label, className } = config[plan] || config.free;

  return (
    <span className={`${className} plan-badge plan-badge--${size}`}>
      {label}
    </span>
  );
}
