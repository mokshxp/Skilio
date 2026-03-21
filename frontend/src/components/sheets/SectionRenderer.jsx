import React from 'react'
import { Copy, Check } from 'lucide-react'
import { FlowDiagram } from './diagrams/FlowDiagram'
import { ComplexityChart } from './diagrams/ComplexityChart'
import { VisualStack } from './diagrams/VisualStack'
import { AsciiDiagram } from './diagrams/AsciiDiagram'
import { MemoryLayout } from './diagrams/MemoryLayout'

/**
 * SectionRenderer — Handles rendering for all interview sheet section types
 */
export default function SectionRenderer({ section, copyCode, copied }) {
  switch (section.type) {
    case 'text':
      return (
        <div className="space-y-6">
          {section.content?.body?.split('\n').map((para, i) => (
            <p key={i} className="text-[17px] leading-[1.8] text-[var(--text-2)] font-medium">
              {para}
            </p>
          ))}
        </div>
      )

    case 'tips':
      return (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 my-8">
          {section.content?.items?.map((item, i) => (
            <li key={i} className="flex gap-4 bg-[var(--bg-1)] border border-[var(--border)] p-5 rounded-2xl items-start shadow-sm hover:border-[var(--text-3)] transition-all group">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0 group-hover:scale-125 transition-transform" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)] mb-1 opacity-60">Study Tip</span>
                <span className="text-[15px] leading-relaxed text-[var(--text-1)] font-medium">{item}</span>
              </div>
            </li>
          ))}
        </ul>
      )

    case 'comparison':
      return (
        <div className="space-y-4 my-8 bg-[var(--bg-1)] p-8 rounded-3xl border border-[var(--border)]">
          {section.content?.items?.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-8 py-5 border-b border-[var(--border)] last:border-0 last:pb-0 group">
              <span className="text-[var(--text-0)] font-extrabold min-w-[160px] text-[13px] uppercase tracking-[0.15em] opacity-80 group-hover:text-[var(--accent)] transition-colors">
                {item.label}
              </span>
              <span className="text-[var(--text-2)] text-[16px] leading-relaxed font-medium">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )

    case 'table':
      return (
        <div className="overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--bg-1)] my-10 shadow-xl scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-2)] border-b border-[var(--border)]">
                {section.content?.headers?.map((h, i) => (
                  <th key={i} className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--text-3)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {section.content?.rows?.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                  {row.map((cell, j) => (
                    <td key={j} className="px-8 py-5 text-[15px] font-bold text-[var(--text-1)] whitespace-pre-wrap leading-relaxed">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'code': {
      // FIX: Database uses 'code' key, not 'snippet'
      const { language, code, explanation } = section.content
      const displayCode = code || section.content.snippet // Fallback for old data
      
      return (
        <div key={section.id} className="mb-10 group relative">
          <div className="rounded-2xl overflow-hidden border border-[var(--border-md)] shadow-2xl bg-[#0d1117] transition-all group-hover:shadow-[var(--accent)]/5">
            {/* Language label bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-3)] border-b border-white/5 bg-white/5">
              <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                {language || 'code'} snippet
              </span>
              <button
                onClick={() => copyCode(displayCode)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
            
            {/* Code block */}
            <pre
              className="p-8 overflow-x-auto text-[14px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
              style={{
                background: 'var(--code-bg, #0D1117)',
                color: 'var(--code-text, #E6EDF3)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre',        // Critical for preserving \n
                tabSize: 2,
              }}
            >
              <code>{displayCode}</code>
            </pre>
          </div>
          
          {explanation && (
            <div className="mt-4 px-6 py-4 bg-[var(--bg-1)] border-l-4 border-[var(--accent)] rounded-r-xl shadow-sm italic flex gap-4 items-start">
              <span className="text-lg leading-none mt-0.5">💡</span>
              <p className="text-[14px] text-[var(--text-2)] font-medium leading-[1.6]">
                {explanation}
              </p>
            </div>
          )}
        </div>
      )
    }

    case 'diagram': {
      const { diagramType, data, caption } = section.content
      return (
        <div key={section.id} className="mb-12 bg-white/[0.01] p-8 rounded-[40px] border border-[var(--border)] border-dashed">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-[2px] bg-[var(--accent)] opacity-30 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-3)]">Architectural Diagram</span>
          </div>

          {diagramType === 'flow' && <FlowDiagram data={data} />}
          {diagramType === 'complexity_chart' && <ComplexityChart data={data} />}
          {diagramType === 'ascii' && <AsciiDiagram data={data} />}
          {diagramType === 'visual_stack' && <VisualStack data={data} />}
          {diagramType === 'memory_layout' && <MemoryLayout data={data} />}
          
          {caption && (
            <p className="mt-8 text-[12px] text-center text-[var(--text-3)] italic font-bold tracking-tight opacity-80 uppercase leading-relaxed">
              <span className="mr-2 opacity-40">—</span> {caption} <span className="ml-2 opacity-40">—</span>
            </p>
          )}
        </div>
      )
    }

    default:
      return null
  }
}
