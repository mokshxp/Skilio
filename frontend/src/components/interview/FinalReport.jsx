import React from 'react';
import useInterviewStore from '../../store/interviewStore';
import { 
  Trophy, 
  Map, 
  Target, 
  TrendingUp, 
  ArrowRight, 
  Download, 
  PieChart, 
  CheckCircle2, 
  XCircle, 
  FileText,
  User,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

const FinalReport = ({ roundSummaries = [], session = {} }) => {
  const overallScore = (roundSummaries.reduce((acc, curr) => acc + (curr.score || 0), 0) / (roundSummaries.length || 1)).toFixed(1);
  const grade = overallScore >= 9 ? 'A+' : (overallScore >= 8 ? 'A' : (overallScore >= 7 ? 'B+' : (overallScore >= 6 ? 'B' : 'C')));

  return (
    <div className="max-w-5xl mx-auto p-12 py-24 space-y-24">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row items-center gap-16 justify-between border-b border-neutral-900 pb-24">
         <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
              <span className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full text-black font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20">
                Interview Completed
              </span>
              <span className="text-neutral-500 font-bold text-xs uppercase tracking-[0.1em]">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-8xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
               Performance <br />Report
            </h1>
            
            <div className="flex gap-8 items-center pt-8">
               <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-neutral-600 uppercase tracking-widest mb-1">Overall</span>
                  <span className="text-6xl font-black text-white">{overallScore}</span>
               </div>
               <div className="w-[1px] h-16 bg-neutral-900" />
               <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-neutral-600 uppercase tracking-widest mb-1">Grade</span>
                  <span className="text-6xl font-black text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">{grade}</span>
               </div>
            </div>
         </div>

         <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="w-80 h-80 rounded-full border-[1.5rem] border-neutral-900 flex items-center justify-center relative bg-[#0A0A0B]">
               <svg className="w-full h-full -rotate-90">
                 <circle
                   cx="160" cy="160" r="140"
                   fill="transparent"
                   stroke="#141415"
                   strokeWidth="24"
                 />
                 <circle
                   cx="160" cy="160" r="140"
                   fill="transparent"
                   stroke="url(#grad)"
                   strokeWidth="24"
                   strokeDasharray={880}
                   strokeDashoffset={880 - (880 * overallScore / 10)}
                   strokeLinecap="round"
                 />
                 <defs>
                   <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#0891b2" />
                     <stop offset="100%" stopColor="#22d3ee" />
                   </linearGradient>
                 </defs>
               </svg>
               <div className="absolute flex flex-col items-center">
                  <Trophy className="w-12 h-12 text-cyan-500 mb-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  <span className="text-neutral-500 font-black text-sm uppercase tracking-widest">Rank</span>
                  <span className="text-white font-black text-2xl uppercase">Top 12%</span>
               </div>
            </div>
         </div>
      </div>

      {/* Round Breakdown */}
      <section className="space-y-12">
         <h3 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-cyan-500" /> Round Breakdown
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roundSummaries.map((round, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-[#0F0F10] border border-neutral-900 p-8 rounded-[2rem] space-y-8 relative group overflow-hidden"
              >
                 <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 group-hover:scale-150 transition-transform rounded-full" />
                 
                 <div className="flex justify-between items-start relative">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Round {round.round_number}</span>
                       <h4 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors capitalize">{round.round_type === 'mcq' ? 'Technical Concepts' : (round.round_type === 'dsa' ? 'Algorithms' : 'Behavioral')}</h4>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-black text-white">{round.score}</div>
                       <div className="text-[10px] text-neutral-600 font-bold uppercase">Points</div>
                    </div>
                 </div>

                 <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <motion.div
                       initial={{ width: 0 }}
                       whileInView={{ width: `${(round.score / 10) * 100}%` }}
                       viewport={{ once: true }}
                       className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    />
                 </div>

                 <p className="text-sm text-neutral-500 leading-relaxed italic relative">
                    "{round.ai_summary || 'Exceptional performance in specialized topics.'}"
                 </p>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Candidate Profile Details */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-neutral-950/50 p-12 rounded-[3rem] border border-neutral-900/50">
         <div className="space-y-8">
            <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
               <User className="w-6 h-6 text-cyan-500" /> Candidate Details
            </h3>
            <div className="space-y-4">
               {[
                 { label: 'Name', value: 'Candidate' },
                 { label: 'Role', value: session.target_role || 'Software Engineer' },
                 { label: 'Difficulty', value: session.difficulty || 'Intermediate' },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center py-4 border-b border-neutral-900/50 last:border-0">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">{item.label}</span>
                    <span className="text-white font-black">{item.value}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-12">
            <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
               <Briefcase className="w-6 h-6 text-cyan-500" /> Technical Recommendation
            </h3>
            <div className="p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-[2rem] relative">
               <Map className="absolute -top-6 -right-6 w-20 h-20 text-cyan-500/10" />
               <p className="text-cyan-100/80 leading-relaxed font-medium">
                  Candidate demonstrates high cognitive flexibility and deep understanding of backend engineering patterns. Strong recommendation for full-time engineering role within core platform teams. Focus on expanding knowledge in distributed systems.
               </p>
            </div>
         </div>
      </section>

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between py-12">
         <div className="flex gap-4">
            <button className="flex items-center gap-3 px-8 py-4 bg-neutral-900 border border-neutral-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all">
               <Download className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex items-center gap-3 px-8 py-4 bg-neutral-900 border border-neutral-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all">
               <FileText className="w-4 h-4" /> Share Report
            </button>
         </div>

         <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-4 px-12 py-5 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-all group"
         >
            Back to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default FinalReport;
