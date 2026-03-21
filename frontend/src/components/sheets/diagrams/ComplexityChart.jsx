import React from 'react'

/**
 * ComplexityChart — visual bar chart showing relative complexity growth
 */
export function ComplexityChart({ data }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)] p-6 my-6 shadow-sm overflow-hidden">
      <div className="flex items-end gap-3 h-48 mb-6 bg-white/[0.02] rounded-lg p-4">
        {data.bars.map((bar) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="text-[10px] text-[var(--text-3)] font-mono text-center leading-tight whitespace-nowrap">
              {bar.label}
            </span>
            <div
              className="w-full rounded-t-lg transition-all duration-700 ease-out hover:brightness-110"
              style={{
                height: `${Math.max(bar.height, 4)}%`,
                background: bar.color || 'var(--accent)',
                minHeight: '4px',
                boxShadow: `0 4px 12px ${bar.color || 'var(--accent)'}20`
              }}
            />
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[var(--border)]">
        {data.bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md shadow-sm flex-shrink-0" style={{ background: bar.color || 'var(--accent)' }} />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[var(--text-0)] leading-none mb-1">
                {bar.label} <span className="text-[var(--text-2)] font-normal ml-1">— {bar.name}</span>
              </span>
              <span className="text-[11px] text-[var(--text-3)] font-medium italic">Example: {bar.example}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
