import React from 'react';
import useInterviewStore from '../../store/interviewStore';
import { Award, Timer, Target, Brain, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RoundSummary = ({ summary }) => {
  const { proceedToNextRound, isInterviewComplete } = useInterviewStore();

  if (!summary) return null;

  const scoreEmoji = summary.score >= 8 ? "🔥" : (summary.score >= 5 ? "👍" : "🤔");

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-[#0F0F10] border border-neutral-900 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent p-12 text-center relative overflow-hidden">
          <Award className="w-24 h-24 text-cyan-500 absolute -top-4 -right-4 opacity-10 rotate-12" />
          
          <motion.div 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="space-y-4 mb-12"
          >
             <h4 className="text-sm font-black text-cyan-500 uppercase tracking-[0.4em]">Round Complete {scoreEmoji}</h4>
             <h2 className="text-6xl font-black text-white tracking-tighter">Excellent Progress</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl flex flex-col items-center gap-3">
                <Target className="w-6 h-6 text-green-500" />
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Score</span>
                <span className="text-4xl font-black text-white">{(summary.score || 0).toFixed(1)} <span className="text-lg text-neutral-600">/ 10</span></span>
             </div>

             <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl flex flex-col items-center gap-3">
                <Brain className="w-6 h-6 text-cyan-500" />
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Accuracy</span>
                <span className="text-4xl font-black text-white">{((summary.correct_count / summary.total_count) * 100).toFixed(0)} <span className="text-lg text-neutral-600">%</span></span>
             </div>

             <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl flex flex-col items-center gap-3">
                <Timer className="w-6 h-6 text-orange-500" />
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Efficiency</span>
                <span className="text-4xl font-black text-white">{Math.floor((summary.time_taken_seconds || 420) / 60)} <span className="text-lg text-neutral-600">min</span></span>
             </div>
          </div>
        </div>

        <div className="p-12 border-t border-neutral-900 bg-neutral-950/50">
           <div className="space-y-6 mb-12">
              <h5 className="flex items-center gap-3 text-white font-bold text-lg uppercase tracking-tight">
                 <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                 AI Performance Analysis
              </h5>
              <p className="text-neutral-400 leading-relaxed text-lg border-l-4 border-neutral-800 pl-8">
                 {summary.ai_summary || "Based on your responses, you exhibit strong proficiency in computer networking fundamentals and memory management. You should focus on optimizing database indexing strategies."}
              </p>
           </div>

           <button
             onClick={proceedToNextRound}
             className="w-full py-6 bg-white text-black font-black text-xl rounded-2xl flex items-center justify-center gap-4 hover:bg-neutral-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] group"
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
