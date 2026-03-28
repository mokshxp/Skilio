import { useEffect, useState } from "react";
import { Home } from "lucide-react";

export default function InterviewNavbar({
  trackSequence = [],
  currentRoundNum = 1,
  role = "Software Engineer",
  onEnd,
  aiState = "idle", // "listening" | "thinking" | "speaking"
  isRecording = false,
}) {
  const [seconds, setSeconds] = useState(0);

  // ⏱ Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 🎤 AI STATE COLORS
  const aiColors = {
    listening: "bg-green-500",
    thinking: "bg-yellow-500",
    speaking: "bg-blue-500",
    idle: "bg-neutral-500",
  };

  return (
    <div className="w-full sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: 'var(--bg-0)cc', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-8">

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-sm shadow-sm">
              S
            </div>
            <span className="font-bold text-lg tracking-tight italic" style={{ color: 'var(--text-0)' }}>
              Skilio
            </span>
          </div>

          {/* PROGRESS */}
          <div className="flex items-center gap-2">
            {trackSequence.map((r, i) => {
              const isPast = r.round < currentRoundNum;
              const isActive = r.round === currentRoundNum;

              return (
                <div key={r.round} className="flex items-center gap-2">

                  {/* STEP */}
                  <div
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-lg text-sm
                      transition-all duration-300
                      ${isActive ? "bg-orange-500 scale-110 text-white shadow-lg" : ""}
                      ${isPast ? "bg-green-500 text-white shadow-sm" : ""}
                      ${!isPast && !isActive ? "text-neutral-500 border" : ""}
                    `}
                    style={{ 
                      background: !isPast && !isActive ? 'var(--bg-2)' : undefined,
                      borderColor: !isPast && !isActive ? 'var(--border)' : 'transparent'
                    }}
                  >
                    {isPast ? "✓" : r.icon}
                  </div>

                  {/* LABEL */}
                  {isActive && (
                    <span className="text-xs font-semibold animate-fadeIn" style={{ color: 'var(--text-0)' }}>
                      {r.label}
                    </span>
                  )}

                  {/* LINE */}
                  {i < trackSequence.length - 1 && (
                    <div className="w-6 h-[2px]" style={{ background: 'var(--border)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* 🎤 AI STATUS */}
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
            <div className={`w-2.5 h-2.5 rounded-full ${aiColors[aiState]} animate-pulse shadow-sm`} />
            <span className="capitalize">{aiState}</span>
          </div>

          {/* 🔴 RECORDING */}
          {isRecording && (
            <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold px-2 py-0.5 rounded bg-rose-500/10">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              REC
            </div>
          )}

          {/* ⏱ TIMER */}
          <div className="text-sm font-mono font-medium" style={{ color: 'var(--text-1)' }}>
            {formatTime()}
          </div>

          {/* ROLE */}
          <div className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border" style={{ color: 'var(--text-2)', borderColor: 'var(--border)', background: 'var(--bg-1)' }}>
            {role || "Software Engineer"}
          </div>

          {/* END INTERVIEW */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to end the interview early? You will be taken straight to your results.")) {
                onEnd();
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 active:scale-95 group"
          >
            <span className="text-[10px] uppercase tracking-widest sm:block hidden">End Session</span>
            <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:rotate-12 transition-transform">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
