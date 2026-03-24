import React from 'react';
import useInterviewStore from '../../store/interviewStore';
import { Award, Timer, Target, Brain, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RoundSummary = ({ summary }) => {
  const { proceedToNextRound, isInterviewComplete } = useInterviewStore();

  if (!summary) return null;

  const scoreEmoji = summary.score >= 8 ? "🔥" : (summary.score >= 5 ? "👍" : "🤔");

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]" style={{ color: 'var(--text-0)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full border rounded-[32px] overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
      >
        <div className="p-12 text-center relative overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, var(--accent-dim), transparent)' }}>
          <Award className="w-24 h-24 absolute -top-4 -right-4 opacity-10 rotate-12" style={{ color: 'var(--accent)' }} />
          
          <motion.div 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="space-y-4 mb-12"
          >
             <h4 className="text-sm font-black uppercase tracking-[0.4em]" style={{ color: 'var(--accent)' }}>Round Complete {scoreEmoji}</h4>
             <h2 className="text-6xl font-black tracking-tighter" style={{ color: 'var(--text-0)' }}>
               {summary.score >= 8 ? "Outperforming!" : (summary.score >= 5 ? "Strong Progress" : "Keep Developing")}
             </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="backdrop-blur-xl border p-8 rounded-3xl flex flex-col items-center gap-3 transition-colors"
                  style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
                <Target className="w-6 h-6 text-green-500" />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>Score</span>
                <span className="text-4xl font-black" style={{ color: 'var(--text-0)' }}>{(summary.score || 0).toFixed(1)} <span className="text-lg opacity-40">/ 10</span></span>
             </div>

             <div className="backdrop-blur-xl border p-8 rounded-3xl flex flex-col items-center gap-3 transition-colors"
                  style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
                <Brain className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>Accuracy</span>
                <span className="text-4xl font-black" style={{ color: 'var(--text-0)' }}>{((summary.correct_count / (summary.total_count || 1)) * 100).toFixed(0)} <span className="text-lg opacity-40">%</span></span>
             </div>

             <div className="backdrop-blur-xl border p-8 rounded-3xl flex flex-col items-center gap-3 transition-colors"
                  style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
                <Timer className="w-6 h-6 text-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>Efficiency</span>
                <span className="text-4xl font-black" style={{ color: 'var(--text-0)' }}>{Math.floor((summary.time_taken_seconds || 420) / 60)} <span className="text-lg opacity-40">min</span></span>
             </div>
          </div>
        </div>

        <div className="p-12 border-t" style={{ background: 'var(--bg-0)', borderColor: 'var(--border)' }}>
           <div className="space-y-6 mb-12">
              <h5 className="flex items-center gap-3 font-bold text-lg uppercase tracking-tight" style={{ color: 'var(--text-0)' }}>
                 <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                 AI Performance Analysis
              </h5>
              <p className="leading-relaxed text-lg border-l-4 pl-8" style={{ color: 'var(--text-1)', borderColor: 'var(--border-hi)' }}>
                 {summary.ai_summary || "Based on your responses, you exhibit strong proficiency in the core concepts. Continue focusing on these details for future rounds."}
              </p>
           </div>

           <button
             onClick={proceedToNextRound}
             className="w-full py-6 font-black text-xl rounded-2xl flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-xl group"
             style={{ background: 'var(--accent)', color: 'white' }}
           >
              {!isInterviewComplete ? (
                <>Proceed to Round {summary.round_number + 1} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                <>View Final Performance Report <ChevronRight className="w-6 h-6" /></>
              )}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoundSummary;
