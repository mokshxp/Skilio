import React from 'react';

/**
 * UsageMeter — shows usage progress bar.
 * Props:
 *   used: number
 *   limit: number | Infinity
 *   label: string
 */
export default function UsageMeter({ used = 0, limit = 3, label = 'Usage' }) {
  const isUnlimited = limit === Infinity || limit >= 1000;
  const pct = isUnlimited ? 100 : Math.min(100, (used / limit) * 100);
  const isWarning = !isUnlimited && pct >= 80;
  const isMaxed = !isUnlimited && used >= limit;

  return (
    <div className="usage-meter">
      <div className="usage-meter__header">
        <span className="usage-meter__label">{label}</span>
        <span className="usage-meter__count" style={{ color: isMaxed ? 'var(--rose)' : isWarning ? 'var(--accent)' : 'var(--text-1)' }}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={isWarning ? 'progress-fill-rose' : 'progress-fill-amber'}
          style={{ width: `${isUnlimited ? 15 : pct}%` }}
        />
      </div>
      {isMaxed && (
        <p className="usage-meter__maxed">Limit reached — upgrade for more</p>
      )}
    </div>
  );
}
