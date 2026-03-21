import React from 'react'

/**
 * VisualStack — for memory/call stack visualization
 * Shows stack frames, memory layout, or data structure state
 */
export function VisualStack({ data }) {
  const { frames, label, direction = 'top-down' } = data
  const orderedFrames = direction === 'bottom-up' ? [...frames].reverse() : frames

  // Mapping string colors to tailwind classes
  const colorMap = {
    primary: 'bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]',
    muted:   'bg-[var(--bg-2)] border-[var(--border)] text-[var(--text-2)]',
    success: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400',
    danger:  'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400',
  }

  return (
    <div className="flex gap-8 items-start my-8">
      <div className="flex-1">
        {label && (
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)] mb-4 ml-1">
            {label}
          </div>
        )}
        <div className="flex flex-col gap-1 font-mono">
          {orderedFrames.map((frame, i) => (
            <div
              key={i}
              className={`
                flex items-center justify-between
                px-5 py-3 border rounded-xl text-[14px]
                ${colorMap[frame.color || 'muted']}
                ${frame.highlight ? 'ring-2 ring-[var(--accent)] ring-offset-0 z-10 relative' : ''}
                shadow-sm transition-transform hover:scale-[1.01]
              `}
            >
              <span className="font-bold tracking-tight">{frame.label}</span>
              <div className="flex items-center gap-3">
                {frame.sublabel && (
                  <span className="text-[12px] opacity-60 font-medium">{frame.sublabel}</span>
                )}
                {frame.highlight && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[var(--accent)] text-black rounded-md animate-pulse">
                    TOP
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {direction === 'bottom-up' && (
          <div className="text-[10px] text-center text-[var(--text-3)] mt-4 font-bold uppercase tracking-widest opacity-60">
            ↑ Stack grows upward ↑
          </div>
        )}
      </div>
    </div>
  )
}
