import { useEffect, useState } from "react";

export default function InterviewNavbar({
  trackSequence = [],
  currentRoundNum = 1,
  role = "Software Engineer",
  onEnd,
  aiState = "idle",
  isRecording = false,
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const aiDot = {
    listening: '#22c55e',
    thinking:  '#f59e0b',
    speaking:  '#3b82f6',
    idle:      'var(--text-2)',
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--bg-0)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 24,
      }}>

        {/* ── LEFT: Logo + Progress ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #C4501A, #ff8c00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: '#fff',
              fontFamily: 'Outfit, sans-serif',
            }}>S</div>
            <span style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800, fontSize: 15,
              color: 'var(--text-0)',
              letterSpacing: '-0.3px',
              fontStyle: 'italic',
            }}>Skilio</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {/* Round Track */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {trackSequence.map((r, i) => {
              const isPast   = r.round < currentRoundNum;
              const isActive = r.round === currentRoundNum;

              return (
                <div key={r.round} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

                  {/* Pill */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: isActive ? '4px 10px 4px 6px' : '0',
                    borderRadius: 20,
                    background: isActive
                      ? `color-mix(in srgb, var(--accent) 12%, transparent)`
                      : 'transparent',
                    border: isActive
                      ? '1px solid var(--accent)'
                      : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 26, height: 26,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13,
                      background: isPast
                        ? 'rgba(34,197,94,0.15)'
                        : isActive
                        ? 'var(--accent)'
                        : 'var(--bg-2)',
                      border: isPast
                        ? '1px solid rgba(34,197,94,0.3)'
                        : isActive
                        ? 'none'
                        : '1px solid var(--border)',
                      color: isPast ? '#22c55e' : isActive ? '#fff' : 'var(--text-2)',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}>
                      {isPast ? '✓' : r.icon}
                    </div>

                    {/* Active label */}
                    {isActive && (
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          color: 'var(--accent)',
                          opacity: 0.7,
                          fontFamily: 'Fira Code, monospace',
                        }}>Now</span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--text-0)',
                          fontFamily: 'Outfit, sans-serif',
                          whiteSpace: 'nowrap',
                        }}>{r.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Connector line */}
                  {i < trackSequence.length - 1 && (
                    <div style={{
                      width: 16, height: 1.5,
                      background: isPast
                        ? 'rgba(34,197,94,0.4)'
                        : 'var(--border)',
                      borderRadius: 1,
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Status + Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

          {/* AI State dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: aiDot[aiState] || 'var(--text-2)',
              boxShadow: `0 0 6px ${aiDot[aiState] || 'transparent'}`,
            }} />
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: 'var(--text-2)',
              textTransform: 'capitalize',
              fontFamily: 'Fira Code, monospace',
            }}>{aiState}</span>
          </div>

          {/* REC badge */}
          {isRecording && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse 1.5s infinite',
              }} />
              <span style={{
                fontSize: 10, fontWeight: 800,
                color: '#ef4444',
                fontFamily: 'Fira Code, monospace',
                letterSpacing: '0.5px',
              }}>REC</span>
            </div>
          )}

          {/* Timer */}
          <span style={{
            fontSize: 13, fontWeight: 600,
            fontFamily: 'Fira Code, monospace',
            color: 'var(--text-1)',
            minWidth: 36, textAlign: 'center',
          }}>{formatTime()}</span>

          {/* Role badge */}
          <div style={{
            padding: '4px 10px', borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-1)',
            fontSize: 10, fontWeight: 700,
            color: 'var(--text-1)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontFamily: 'Outfit, sans-serif',
          }}>
            {role}
          </div>

          {/* End Session */}
          <button
            onClick={() => {
              if (window.confirm("End the interview? You'll be taken to your results.")) {
                onEnd();
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'transparent',
              color: '#ef4444',
              fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.6px',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
              <line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
            End
          </button>
        </div>
      </div>
    </nav>
  );
}
