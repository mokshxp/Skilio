import React, { useState } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { Send, Star, AlertCircle, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HRRound = ({ questions = [] }) => {
  const { 
    hrAnswers, 
    submitHRAnswer, 
    hrCurrentIndex, 
    setHRIndex 
  } = useInterviewStore();

  const [currentValue, setCurrentValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentQ = questions[hrCurrentIndex];
  const answered = hrAnswers[currentQ?.id];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitHRAnswer(currentQ.id, currentValue);
    // Move to next after a delay OR allow manual next
    setIsSubmitting(false);
  };

  if (!currentQ) return <div className="p-12 text-center text-neutral-500">Loading Behavioral...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 flex flex-col min-h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">HR & Behavioral</h2>
          <p className="text-sm text-neutral-500 uppercase tracking-widest font-semibold">Question {hrCurrentIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex gap-2">
           {questions.map((_, i) => (
             <div key={i} className={`w-12 h-1 rounded-full ${hrCurrentIndex === i ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : (hrAnswers[questions[i].id] ? 'bg-neutral-600' : 'bg-neutral-800')}`} />
           ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={currentQ.id}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="relative"
        >
          <Quote className="absolute -top-12 -left-6 w-16 h-16 text-cyan-500/10" />
          
          <div className="flex flex-col gap-6 mb-12">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-bold uppercase w-fit rounded tracking-widest">
              {currentQ.topic}
            </span>
            <h3 className="text-3xl font-bold text-white leading-[1.3] text-balance">
              {currentQ.questionText}
            </h3>
            {currentQ.followUp && (
              <p className="text-neutral-500 italic text-lg leading-relaxed border-l-2 border-neutral-800 pl-6">
                "{currentQ.followUp}"
              </p>
            )}
          </div>

          {!answered ? (
            <div className="space-y-6">
              <textarea
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Type your response here using the STAR method..."
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 min-h-[300px] text-lg text-white placeholder:text-neutral-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none shadow-inner"
              />
              
              <div className="flex justify-between items-center text-xs font-bold text-neutral-600 tracking-widest">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" /> Recommended length: 150-300 words
                </div>
                <span>{currentValue.split(/\s+/).filter(Boolean).length} WORDS</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={currentValue.trim().length < 20 || isSubmitting}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-extrabold text-lg rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(6,182,212,0.2)] disabled:opacity-30"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Submit Response <Send className="w-5 h-5" /></>
                )}
              </button>
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6 text-green-500">
                <CheckCircle className="w-6 h-6" />
                <h4 className="font-bold text-xl uppercase tracking-tighter">Response Recorded</h4>
              </div>
              <p className="text-neutral-400 leading-relaxed mb-8 italic">"{answered}"</p>
              
              {/* Optional: Show AI feedback immediately if available */}
              <div className="flex gap-4">
                 <button 
                   onClick={() => setHRIndex(Math.min(questions.length - 1, hrCurrentIndex + 1))}
                   className="px-8 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors font-bold text-sm"
                 >
                   Next Question
                 </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center justify-center gap-4 text-neutral-600 text-[10px] font-black uppercase tracking-[0.3em]">
         <AlertCircle className="w-3 h-3" />
         Behavioral questions are graded based on STAR structure
      </div>
    </div>
  );
};

export default HRRound;
