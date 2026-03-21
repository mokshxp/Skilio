import React, { useState, useEffect } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { CheckCircle2, XCircle, Timer, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MCQRound = ({ questions = [] }) => {
  const { 
    mcqAnswers, 
    selectMCQAnswer, 
    mcqCurrentIndex, 
    setMCQIndex, 
    completeMCQRound, 
    roundStatus 
  } = useInterviewStore();

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const currentQ = questions[mcqCurrentIndex];
  const selected = mcqAnswers[currentQ?.id];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (option) => {
    if (selected) return; // Prevent changing after selection
    selectMCQAnswer(currentQ.id, option);
    
    // Auto advance after 2 seconds
    setTimeout(() => {
        if (mcqCurrentIndex < questions.length - 1) {
            setMCQIndex(mcqCurrentIndex + 1);
        }
    }, 2000);
  };

  if (!currentQ) return <div className="p-8 text-neutral-400">Loading questions...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold text-neutral-200">Aptitude & Core CS</h2>
          <p className="text-sm text-neutral-500">Question {mcqCurrentIndex + 1} of {questions.length}</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${timeLeft < 60 ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-neutral-800 bg-neutral-900 text-neutral-400'}`}>
          <Timer className="w-4 h-4" />
          <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-900 h-1.5 rounded-full mb-12 overflow-hidden">
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((mcqCurrentIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-cyan-500"
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
           key={currentQ.id}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-neutral-800 text-neutral-400 text-xs font-medium rounded-md uppercase tracking-wider">{currentQ.subject}</span>
            <span className="px-3 py-1 border border-neutral-800 text-neutral-500 text-xs font-medium rounded-md uppercase tracking-wider">{currentQ.difficulty}</span>
          </div>
          
          <h3 className="text-2xl text-white leading-relaxed mb-10">
            {currentQ.questionText}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(currentQ.options || {}).map(([key, value]) => {
              const isSelected = selected === key;
              const isCorrect = (currentQ.correctAnswer === key) || (currentQ.correct_answer === key);
              const showCheck = selected && isCorrect;
              const showCross = selected && isSelected && !isCorrect;

              let borderClass = "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50";
              let textClass = "text-neutral-300";

              if (selected) {
                if (isCorrect) {
                  borderClass = "border-green-500/50 bg-green-500/5";
                  textClass = "text-green-500";
                } else if (isSelected) {
                  borderClass = "border-red-500/50 bg-red-500/5";
                  textClass = "text-red-500";
                } else {
                  borderClass = "border-neutral-800 opacity-40";
                }
              }

              return (
                <button
                  key={key}
                  disabled={!!selected}
                  onClick={() => handleSelect(key)}
                  className={`flex items-start gap-4 p-5 rounded-xl border transition-all text-left group ${borderClass}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition-colors ${selected ? (isCorrect ? 'bg-green-500/20 border-green-500 text-green-500' : isSelected ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-neutral-800 border-neutral-700 text-neutral-500') : 'bg-neutral-800 border-neutral-700 text-neutral-400 group-hover:border-cyan-500 group-hover:text-cyan-400'}`}>
                    {key}
                  </span>
                  <span className={`flex-1 pt-1 font-medium ${textClass}`}>
                    {value}
                  </span>
                  {showCheck && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />}
                  {showCross && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Explanation Box */}
      {selected && (
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
            <AlertCircle className="w-4 h-4" />
            Explanation
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {currentQ.explanation}
          </p>
        </motion.div>
      )}

      {/* Footer Controls */}
      <div className="mt-auto flex justify-between items-center py-6 border-t border-neutral-900">
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setMCQIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${mcqCurrentIndex === i ? 'bg-cyan-500 scale-125' : (mcqAnswers[questions[i].id] ? 'bg-neutral-600' : 'bg-neutral-800')}`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <button 
             onClick={() => setMCQIndex(Math.max(0, mcqCurrentIndex - 1))}
             disabled={mcqCurrentIndex === 0}
             className="p-2 text-neutral-500 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {mcqCurrentIndex === questions.length - 1 ? (
            <button
               onClick={completeMCQRound}
               disabled={Object.keys(mcqAnswers).length < questions.length || roundStatus === 'submitting'}
               className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {roundStatus === 'submitting' ? 'Submitting...' : 'Complete Round'}
            </button>
          ) : (
            <button 
               onClick={() => setMCQIndex(mcqCurrentIndex + 1)}
               className="p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQRound;
