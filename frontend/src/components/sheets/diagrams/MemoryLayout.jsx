import React from 'react'

/**
 * MemoryLayout — for pointer/array visualizations
 * Shows array cells, pointer arrows, linked list nodes
 */
export function MemoryLayout({ data }) {
  const { cells, type } = data

  if (type === 'array') {
    return (
      <div className="overflow-x-auto my-10 py-4 scrollbar-hide">
        <div className="inline-flex flex-col gap-3 min-w-full">
          {/* Index row */}
          <div className="flex gap-1">
            {cells.map((_, i) => (
              <div key={i} className="w-16 text-center text-[10px] text-[var(--text-3)] font-extrabold font-mono uppercase tracking-widest flex-shrink-0">
                [{i}]
              </div>
            ))}
          </div>
          {/* Value row */}
          <div className="flex gap-1">
            {cells.map((cell, i) => (
              <div
                key={i}
                className={`
                  w-16 h-14 flex-shrink-0
                  border-2 flex flex-col items-center justify-center
                  text-[15px] font-mono font-bold
                  transition-all duration-300
                  ${i === 0 ? 'rounded-l-2xl' : ''}
                  ${i === cells.length - 1 ? 'rounded-r-2xl' : ''}
                  ${cell.highlighted
                    ? 'bg-[var(--accent)]/30 border-[var(--accent)] text-[var(--accent)] shadow-lg shadow-[var(--accent)]/10 scale-105 z-10'
                    : 'bg-[var(--bg-1)] border-[var(--border)] text-[var(--text-0)] hover:border-[var(--text-2)] hover:scale-[1.02]'}
                `}
              >
                {cell.value}
                <span className="text-[9px] opacity-40 font-medium leading-none mt-1">val</span>
              </div>
            ))}
          </div>
          {/* Label row */}
          <div className="flex gap-1">
            {cells.map((cell, i) => (
              <div key={i} className="w-16 text-center text-[11px] text-[var(--accent)] font-bold font-mono tracking-tight flex-shrink-0 min-h-[1.5em] leading-tight">
                {cell.label || ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Linked list type
  return (
    <div className="flex items-center gap-3 overflow-x-auto py-10 my-6 scrollbar-hide px-2">
      {cells.map((cell, i) => (
        <div key={i} className="flex items-center gap-3 flex-shrink-0">
          <div className={`
            flex border-2 rounded-2xl overflow-hidden transition-all duration-300
            ${cell.highlighted ? 'ring-4 ring-[var(--accent)]/20 border-[var(--accent)] scale-105 z-10' : 'border-[var(--border)] hover:border-[var(--text-3)]'}
          `}>
            <div className="px-5 py-4 bg-[var(--bg-1)] border-r-2 border-[var(--border)] text-[15px] font-mono font-bold min-w-[64px] text-center text-[var(--text-0)]">
              {cell.value}
            </div>
            <div className="px-4 py-4 bg-[var(--bg-2)] text-[10px] font-bold font-mono text-[var(--text-3)] min-w-[64px] text-center uppercase tracking-widest flex items-center justify-center">
              {i < cells.length - 1 ? 'next' : 'null'}
            </div>
          </div>
          {i < cells.length - 1 && (
            <div className="flex flex-col items-center gap-0.5 animate-pulse">
              <span className="text-[var(--accent)] text-2xl font-black">→</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
