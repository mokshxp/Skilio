import React from 'react'

/**
 * FlowDiagram — for algorithm flow visualization
 * Renders a step-by-step flow diagram with arrows between steps
 */
export function FlowDiagram({ data }) {
  const { steps, direction = 'vertical' } = data

  const typeStyles = {
    start:    'rounded-full bg-primary text-primary-foreground',
    process:  'rounded-lg bg-card border-2 border-border',
    decision: 'rotate-45 bg-yellow-500/20 border-2 border-yellow-500/50',
    end:      'rounded-full bg-muted border-2 border-border',
  }

  return (
    <div className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} items-center gap-0 w-full overflow-x-auto py-8`}>
      {steps.map((step, i) => (
        <div key={step.id} className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} items-center`}>
          {/* Node */}
          <div className={`
            flex flex-col items-center justify-center
            min-w-[120px] min-h-[52px] px-4 py-2
            text-sm font-medium text-center
            ${typeStyles[step.type] || typeStyles.process}
            ${step.type === 'decision' ? 'w-24 h-24 p-2' : ''}
          `}
          style={step.color ? { borderColor: step.color, color: step.color } : {}}
          >
            <span className={step.type === 'decision' ? '-rotate-45 text-xs' : ''}>
              {step.label}
            </span>
            {step.sublabel && (
              <span className={`text-xs opacity-60 mt-0.5 ${step.type === 'decision' ? '-rotate-45' : ''}`}>
                {step.sublabel}
              </span>
            )}
          </div>
          {/* Arrow */}
          {i < steps.length - 1 && (
            <div className={`flex items-center justify-center ${direction === 'horizontal' ? 'w-12' : 'h-12'}`}>
              <span className="text-muted-foreground text-2xl font-bold">
                {direction === 'horizontal' ? '→' : '↓'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
