import React from 'react'

/**
 * AsciiDiagram — for tree/graph visualizations
 * Renders pre-formatted ASCII art diagrams cleanly
 */
export function AsciiDiagram({ data }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden my-8 shadow-xl">
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-2)] border-b border-[var(--border-md)]">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)]">Diagram Visualization</span>
      </div>
      <pre
        className="p-8 text-[14px] leading-[1.8] overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--bg-3)]"
        style={{
          background: 'var(--ascii-bg, #0D1117)',
          color: '#58A6FF',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'pre',
          tabSize: 4
        }}
      >
        {data.art}
      </pre>
      {data.legend && (
        <div className="px-6 py-4 bg-[var(--bg-1)] border-t border-[var(--border)] flex flex-wrap gap-6 items-center">
          {Object.entries(data.legend).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[14px] text-[var(--accent)] font-bold font-mono">{key}</span>
              <span className="text-[12px] text-[var(--text-3)] font-medium">= {val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
