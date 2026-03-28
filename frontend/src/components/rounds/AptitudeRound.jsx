import React, { useState, useEffect } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { CheckCircle2, XCircle, Timer, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  alphabet_series: "Alphabet Series",
  coding_decoding:  "Coding-Decoding",
  ages:             "Ages",
  partnership:      "Partnership",
  number_series:    "Number Series",
};

const AptitudeRound = ({ questions = [], onComplete }) => {
  const {
    mcqAnswers,
    selectMCQAnswer,
    mcqCurrentIndex,
    setMCQIndex,
    roundStatus,
  } = useInterviewStore();

  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes for aptitude
  const currentQ = questions[mcqCurrentIndex];
  const selected = mcqAnswers[currentQ?.id];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
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
    if (selected) return;
    selectMCQAnswer(currentQ.id, option);
  };

  const handleComplete = () => {
    if (onComplete) {
      // Format the answers to match what completeAptitudeRound expects
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        category: q.category,
        selected: mcqAnswers[q.id],
        isCorrect: mcqAnswers[q.id] === (q.correctAnswer || q.correct_answer || q.correct)
      }));
      onComplete(formattedAnswers);
    }
  };

  if (!currentQ) return (
    <div className="p-8" style={{ color: 'var(--text-1)' }}>
      Loading questions...
    </div>
  );

  const correctAnswer = currentQ.correctAnswer || currentQ.correct_answer || currentQ.correct;

  return (
    <div
      className="max-w-4xl mx-auto p-4 flex flex-col min-h-[calc(100vh-140px)]"
      style={{ color: 'var(--text-0)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-0)' }}>
            Aptitude
          </h2>
          <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            Question {mcqCurrentIndex + 1} of {questions.length}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            timeLeft < 60
              ? 'border-red-500/50 bg-red-500/10 text-red-500'
              : 'border-[var(--border)] bg-[var(--bg-1)]'
          }`}
          style={{ color: timeLeft < 60 ? 'red' : 'var(--text-2)' }}
        >
          <Timer className="w-4 h-4" />
          <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--bg-1)] h-1.5 rounded-full mb-12 overflow-hidden border border-[var(--border)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((mcqCurrentIndex + 1) / questions.length) * 100}%` }}
          className="h-full"
          style={{ background: 'var(--accent)' }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="border rounded-2xl p-8 mb-8 shadow-xl"
          style={{ background: 'var(--bg-1)', borderColor: 'var(--border-md)' }}
        >
          {/* Category + Difficulty badges */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[var(--bg-2)] text-[var(--text-2)] text-xs font-medium rounded-md uppercase tracking-wider">
              {CATEGORY_LABELS[currentQ.category] || currentQ.category || 'Aptitude'}
            </span>
            <span className="px-3 py-1 border border-[var(--border)] text-[var(--text-2)] text-xs font-medium rounded-md uppercase tracking-wider">
              {currentQ.difficulty || 'Medium'}
            </span>
          </div>

          <h3
            className="text-2xl font-bold leading-relaxed mb-10"
            style={{ color: 'var(--text-0)' }}
          >
            {currentQ.question_text || currentQ.questionText || currentQ.question}
          </h3>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(currentQ.options || {}).map(([key, value]) => {
              const isSelected = selected === key;
              const isCorrect = correctAnswer === key;
              const showCheck = selected && isCorrect;
              const showCross = selected && isSelected && !isCorrect;

              let borderStyle = { borderColor: 'var(--border)', background: 'var(--bg-2)' };
              let textStyle = { color: 'var(--text-1)' };

              if (selected) {
                if (isCorrect) {
                  borderStyle = { borderColor: 'rgba(34,197,94,0.5)', background: 'rgba(34,197,94,0.05)' };
                  textStyle = { color: '#22c55e' };
                } else if (isSelected) {
                  borderStyle = { borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.05)' };
                  textStyle = { color: '#ef4444' };
                } else {
                  borderStyle = { borderColor: 'var(--border)', opacity: 0.4 };
                }
              }

              return (
                <button
                  key={key}
                  disabled={!!selected}
                  onClick={() => handleSelect(key)}
                  className="flex items-start gap-4 p-5 rounded-xl border transition-all text-left group"
                  style={borderStyle}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition-colors ${
                      selected
                        ? isCorrect
                          ? 'bg-green-500/20 border-green-500 text-green-500'
                          : isSelected
                          ? 'bg-red-500/20 border-red-500 text-red-500'
                          : 'bg-[var(--bg-3)] border-[var(--border)] text-[var(--text-2)]'
                        : 'bg-[var(--bg-3)] border-[var(--border)] text-[var(--text-2)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]'
                    }`}
                  >
                    {key.toUpperCase()}
                  </span>
                  <span className="flex-1 pt-1 font-medium" style={textStyle}>
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
          className="mb-8 p-6 border rounded-xl"
          style={{
            background: selected === correctAnswer ? 'var(--emerald-dim)' : 'var(--accent-dim)',
            borderColor: selected === correctAnswer ? 'var(--emerald-glow)' : 'var(--accent-glow)',
          }}
        >
          <div
            className="flex items-center gap-2 mb-2 font-semibold"
            style={{ color: selected === correctAnswer ? 'var(--emerald)' : 'var(--accent)' }}
          >
            {selected === correctAnswer
              ? <CheckCircle2 className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />
            }
            Explanation
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>
            {currentQ.explanation}
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <div
        className="mt-auto flex justify-between items-center py-6 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setMCQIndex(i)}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: mcqCurrentIndex === i
                  ? 'var(--accent)'
                  : mcqAnswers[questions[i]?.id]
                  ? 'var(--text-2)'
                  : 'var(--bg-3)',
                transform: mcqCurrentIndex === i ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setMCQIndex(Math.max(0, mcqCurrentIndex - 1))}
            disabled={mcqCurrentIndex === 0}
            className="p-2 transition-colors disabled:opacity-30"
            style={{ color: 'var(--text-2)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {mcqCurrentIndex === questions.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={
                Object.keys(mcqAnswers).length < questions.length ||
                roundStatus === 'submitting'
              }
              className="px-8 py-3 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {roundStatus === 'submitting' ? 'Submitting...' : 'Complete Round'}
            </button>
          ) : (
            <button
              onClick={() => setMCQIndex(mcqCurrentIndex + 1)}
              className="p-2 transition-colors"
              style={{ color: 'var(--text-2)' }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeRound;
