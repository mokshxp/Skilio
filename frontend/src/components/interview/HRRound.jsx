import React, { useState } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { interviewApi } from '../../services/api';
import { Send, Star, AlertCircle, Quote, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HRRound = ({ questions = [] }) => {
  const { 
    hrAnswers, 
    submitHRAnswer, 
    hrCurrentIndex, 
    setHRIndex,
    finishHRRound,
    roundStatus
  } = useInterviewStore();

  const { role, difficulty } = useInterviewSession();
  const [currentValue, setCurrentValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUp, setFollowUp] = useState(null); // { question: string, score: number, active: boolean, answer: "" }
  const currentQ = questions[hrCurrentIndex];
  const answered = hrAnswers[currentQ?.id];

  const handleSubmit = async () => {
    if (!currentValue.trim()) return;
    setIsSubmitting(true);
    
    try {
      // 1. Evaluate adaptive follow-up
      const res = await interviewApi.getFollowUp({
        question: currentQ.question_text || currentQ.questionText,
        answer: currentValue,
        role: role || "Software Engineer",
        difficulty: difficulty || "Intermediate"
      });

      if (res.needsFollowUp && res.followUp) {
        setFollowUp({
          question: res.followUp,
          score: res.score,
          active: true,
          answer: ""
        });
      } else {
        // No follow-up needed, save main response
        await submitHRAnswer(currentQ.id, currentValue);
      }
    } catch (err) {
      console.error("Adaptive evaluation failed", err);
      // Fallback: just save main response
      await submitHRAnswer(currentQ.id, currentValue);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    setIsSubmitting(true);
    // For now, we combine main answer and follow-up for the final score/storage
    // or we could store them separately if the schema allowed.
    const combinedAnswer = `${currentValue}\n\n[Follow-up Response]: ${followUp.answer}`;
    await submitHRAnswer(currentQ.id, combinedAnswer);
    setFollowUp(null);
    setIsSubmitting(false);
  };

  if (!currentQ) return <div className="p-12 text-center text-neutral-500">Loading Behavioral...</div>;

  if (isSubmitting && !followUp?.active && !answered) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-6 text-center animate-fade-in" style={{ color: 'var(--text-1)' }}>
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin" style={{ color: 'var(--accent)' }} />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 animate-pulse text-orange-400" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-xl uppercase tracking-tighter" style={{ color: 'var(--text-0)' }}>Analyzing your response...</p>
          <p className="text-sm font-medium opacity-60">The AI is preparing a follow-up or grading your answer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 flex flex-col min-h-[calc(100vh-140px)]" style={{ color: 'var(--text-0)' }}>
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>HR & Behavioral</h2>
          <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: 'var(--text-2)' }}>Question {hrCurrentIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex gap-2">
           {questions.map((_, i) => (
             <div key={i} className={`w-12 h-1 rounded-full ${hrCurrentIndex === i ? 'shadow-md' : (hrAnswers[questions[i].id] ? 'bg-[var(--text-2)]' : 'bg-[var(--bg-3)]')}`} 
                  style={{ background: hrCurrentIndex === i ? 'var(--accent)' : '' }} />
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
          <Quote className="absolute -top-12 -left-6 w-16 h-16 opacity-10" style={{ color: 'var(--accent)' }} />
          
          <div className="flex flex-col gap-6 mb-12">
            <span className="px-3 py-1 border text-[10px] font-bold uppercase w-fit rounded tracking-widest"
                  style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent-glow)', color: 'var(--accent)' }}>
              {currentQ.topic}
            </span>
            <h3 className="text-3xl font-bold leading-[1.3] text-balance" style={{ color: 'var(--text-0)' }}>
              {followUp?.active ? followUp.question : (currentQ.question_text || currentQ.questionText)}
            </h3>
            {followUp?.active ? (
              <div className="follow-up-badge">
                <Zap className="w-3 h-3" />
                <span>Adaptive Follow-up Triggered</span>
              </div>
            ) : currentQ.followUp && (
              <p className="italic text-lg leading-relaxed border-l-2 pl-6" style={{ color: 'var(--text-2)', borderColor: 'var(--border-hi)' }}>
                "{currentQ.followUp}"
              </p>
            )}
          </div>

          {(!answered && !followUp?.active) && (
            <div className="space-y-6">
              <textarea
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Type your response here using the STAR method..."
                className="w-full rounded-2xl p-8 min-h-[300px] text-lg transition-all resize-none shadow-inner border focus:outline-none"
                style={{ 
                    background: 'var(--bg-1)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text-0)',
                }}
              />
              
              <div className="flex justify-between items-center text-xs font-bold tracking-widest" style={{ color: 'var(--text-2)' }}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" /> Recommended length: 150-300 words
                </div>
                <span>{currentValue.split(/\s+/).filter(Boolean).length} WORDS</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={currentValue.trim().length < 20 || isSubmitting}
                className="w-full py-5 font-extrabold text-lg rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-30"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Submit Response <Send className="w-5 h-5" /></>
                )}
              </button>
            </div>
          )}

          {followUp?.active && (
            <div className="space-y-6">
              <textarea
                value={followUp.answer}
                onChange={(e) => setFollowUp({ ...followUp, answer: e.target.value })}
                placeholder="Dig deeper! Provide more details on the point raised above..."
                className="w-full rounded-2xl p-8 min-h-[300px] text-lg transition-all resize-none shadow-inner border focus:outline-none ring-2 ring-orange-500/20"
                style={{ 
                    background: 'var(--bg-1)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text-0)',
                }}
              />

              <button
                onClick={handleFollowUpSubmit}
                disabled={followUp.answer.trim().length < 10 || isSubmitting}
                className="w-full py-5 font-extrabold text-lg rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Submit Follow-up <Zap className="w-5 h-5" /></>
                )}
              </button>
            </div>
          )}
          {answered && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="border rounded-2xl p-8"
               style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-6 text-green-500">
                <CheckCircle className="w-6 h-6" />
                <h4 className="font-bold text-xl uppercase tracking-tighter">Response Recorded</h4>
              </div>
              <p className="leading-relaxed mb-8 italic" style={{ color: 'var(--text-1)' }}>"{answered}"</p>
              
              <div className="flex gap-4">
                  {hrCurrentIndex < questions.length - 1 ? (
                    <button 
                      onClick={() => {
                        setHRIndex(hrCurrentIndex + 1);
                        setCurrentValue("");
                        setFollowUp(null);
                      }}
                      className="px-8 py-3 rounded-xl transition-colors font-bold text-sm"
                      style={{ background: 'var(--bg-3)', color: 'var(--text-0)' }}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button 
                      onClick={finishHRRound}
                      disabled={roundStatus === 'submitting'}
                      className="px-8 py-3 rounded-xl transition-all font-bold text-sm shadow-lg hover:opacity-90"
                      style={{ background: 'var(--accent)', color: 'white' }}
                    >
                      {roundStatus === 'submitting' ? 'Submitting...' : 'Complete Behavioral Round'}
                    </button>
                  )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-2)' }}>
         <AlertCircle className="w-3 h-3" />
         Behavioral questions are graded based on STAR structure
      </div>
    </div>
  );
};

export default HRRound;
