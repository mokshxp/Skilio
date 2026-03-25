import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import useInterviewStore from '../../store/interviewStore';
import { 
  Play, 
  Send, 
  Terminal, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Settings,
  Code2,
  AlertTriangle,
  Zap,
  Cpu,
  Trophy,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const DSARound = ({ questions = [] }) => {
  const { 
    dsaCode, 
    dsaLanguage, 
    dsaTestResults, 
    updateDSACode, 
    setDSALanguage, 
    dsaCurrentIndex,
    setDSAIndex,
    runDSACode, 
    submitDSACode,
    roundStatus,
    currentRound,
    totalRounds,
    lastDSASubmission,
    setRoundStatus,
    clearLastSubmission
  } = useInterviewStore();

  const question = questions[dsaCurrentIndex];

  const [activeTab, setActiveTab] = useState('problem');
  const [outputTab, setOutputTab] = useState('results');
  const [isExecuting, setIsExecuting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'midnight' || 
                     document.documentElement.getAttribute('data-theme') === 'carbon';
      setEditorTheme(isDark ? 'vs-dark' : 'vs');
    };
    checkTheme();
    // Watch for dynamic theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!question) return;
    const sigs = question.function_signatures || question.functionSignatures || question.starter_code;
    if (!sigs) return;

    // Auto-select javascript first, then fallback to first available
    const preferred = ['javascript', 'python', 'java', 'cpp'];
    const available = preferred.find(l => sigs[l]);
    if (available && !dsaCode[available]) {
      setDSALanguage(available);
      updateDSACode(available, sigs[available]);
    }
  }, [question]);

  // Separate effect: when language changes, load its signature
  useEffect(() => {
    if (!question) return;
    const sigs = question.function_signatures || question.functionSignatures || question.starter_code;
    if (sigs?.[dsaLanguage] && !dsaCode[dsaLanguage]) {
      updateDSACode(dsaLanguage, sigs[dsaLanguage]);
    }
  }, [dsaLanguage, question]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lastDSASubmission) {
      setShowResultModal(true);
    }
  }, [lastDSASubmission]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setOutputTab('results');
    await runDSACode(dsaCode[dsaLanguage], dsaLanguage, question.id);
    setIsExecuting(false);
  };

  const handleSubmit = async () => {
    setIsExecuting(true);
    setOutputTab('results');
    await submitDSACode(dsaCode[dsaLanguage], dsaLanguage, question.id);
    setIsExecuting(false);
  };

  const proceedToNextIndex = () => {
    const isComplete = lastDSASubmission?.isComplete;
    clearLastSubmission();
    
    if (dsaCurrentIndex < questions.length - 1) {
      setDSAIndex(dsaCurrentIndex + 1);
      setShowResultModal(false);
    } else {
      setRoundStatus(isComplete ? 'complete' : 'summary');
    }
  };

  if (!question) return <div className="p-12 text-center text-neutral-500">Loading DSA Problem...</div>;

  const evaluation = lastDSASubmission?.aiEvaluation;

  return (
    <div className="flex h-screen overflow-hidden text-[var(--text-1)]" style={{ background: 'var(--bg-0)' }}>
      {/* LEFT PANEL: Problem Statement */}
      <div className="w-[42%] flex flex-col border-r shadow-2xl z-10" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          <button 
            onClick={() => setActiveTab('problem')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 flex items-center gap-2 ${activeTab === 'problem' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]' : 'border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]'}`}
          >
            <Info className="w-3.5 h-3.5" /> Statement
          </button>
          <button 
            onClick={() => setActiveTab('hints')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 flex items-center gap-2 ${activeTab === 'hints' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]' : 'border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]'}`}
          >
            <Zap className="w-3.5 h-3.5" /> Hints
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'problem' ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] px-3 py-1 bg-[var(--accent-dim)] rounded border border-[var(--accent-glow)]">
                   Round {currentRound} — {question.difficulty || 'Medium'}
                </span>
                <div className="flex gap-1.5 items-center">
                   {[...Array(totalRounds || 5)].map((_, i) => (
                     <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i + 1 < currentRound ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : (i + 1 === currentRound ? 'bg-[var(--accent)] scale-150 shadow-[0_0_12px_rgba(196,82,42,0.5)]' : 'bg-[var(--bg-3)]')}`} />
                   ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tighter leading-none" style={{ color: 'var(--text-0)' }}>
                  {question.topic || question.title || "Coding Quest"}
                </h1>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-2)] border border-[var(--border)] text-[10px] font-black uppercase tracking-wider text-[var(--text-1)]">
                     <Cpu className="w-3 h-3" /> {question.subject || 'Algorithms'}
                   </div>
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-2)] border border-[var(--border)] text-[10px] font-black uppercase tracking-wider text-[var(--text-1)]">
                     <Activity className="w-3 h-3" /> {timeLeft < 300 ? 'Low Time' : 'Deep Work'}
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-lg leading-relaxed whitespace-pre-wrap tracking-tight" style={{ color: 'var(--text-1)' }}>
                  {question.question_text || question.problemStatement}
                </p>

                {question.examples && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Illustrations</h4>
                    {question.examples.map((ex, i) => (
                      <div key={i} className="group border rounded-2xl p-5 space-y-3 transition-all bg-[var(--bg-2)] hover:border-[var(--accent)]" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-start gap-4 font-mono text-[13px]">
                          <span className="text-[var(--accent)] font-black uppercase text-[10px] tracking-widest pt-1">Input</span>
                          <span className="flex-1 text-[var(--text-0)] bg-black/5 p-2 rounded-lg border border-black/5">{fmt(ex.input)}</span>
                        </div>
                        <div className="flex items-start gap-4 font-mono text-[13px]">
                          <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest pt-1">Output</span>
                          <span className="flex-1 text-[var(--text-0)] bg-black/5 p-2 rounded-lg border border-black/5">{fmt(ex.output)}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-[11px] text-[var(--text-2)] pl-4 border-l-2 py-1 leading-relaxed" style={{ borderColor: 'var(--accent-glow)' }}>
                             {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.constraints && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">System Constraints</h4>
                    <div className="text-[13px] border p-6 rounded-3xl font-mono leading-relaxed bg-black/20" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                      {Array.isArray(question.constraints) ? question.constraints.map(c => `• ${c}\n`) : question.constraints}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               {question.hints?.map((hint, i) => (
                 <div key={i} className="group border rounded-3xl p-6 space-y-3 bg-[var(--bg-2)] border-dashed" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                      <Zap className="w-3.5 h-3.5 fill-current" /> Recommendation {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{hint}</p>
                 </div>
               ))}
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t flex items-center justify-between bg-black/20" style={{ borderColor: 'var(--border)' }}>
           <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-[var(--bg-2)] border" style={{ borderColor: 'var(--border)' }}>
             <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-neutral-600'}`} />
             <span className={`font-mono font-black text-sm tracking-widest ${timeLeft < 300 ? 'text-rose-500' : 'text-[var(--text-0)]'}`}>{formatTime(timeLeft)}</span>
           </div>
           <button className="p-2 transition-all hover:rotate-90 text-[var(--text-2)] hover:text-[var(--accent)]">
              <Settings className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* RIGHT PANEL: Editor & Console */}
      <div className="flex-1 flex flex-col shadow-inner">
        {/* Editor Toolbar */}
        <div className="h-20 flex items-center justify-between px-8 border-b" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <div className="px-5 py-2 rounded-2xl bg-[var(--bg-1)] border border-[var(--border)] flex items-center gap-3 focus-within:border-[var(--accent)] transition-all">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <select 
                 value={dsaLanguage}
                 onChange={(e) => setDSALanguage(e.target.value)}
                 className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none cursor-pointer outline-none border-none ring-0 appearance-none pr-4"
                 style={{ color: 'var(--text-1)' }}
               >
                 <option value="python">Python 3</option>
                 <option value="javascript">JavaScript</option>
                 <option value="java">Java 17</option>
                 <option value="cpp">C++ 20</option>
               </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={handleRun}
               disabled={isExecuting}
               className="flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-[0.2em] bg-[var(--bg-2)] border-[var(--border)] hover:bg-[var(--bg-3)] text-[var(--text-0)] shadow-lg active:scale-95 disabled:opacity-50"
             >
               {isExecuting ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
               Dry Run
             </button>
             <button 
               onClick={handleSubmit}
               disabled={isExecuting || roundStatus === 'submitting'}
               className="flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(196,82,42,0.2)] hover:shadow-[0_15px_40px_rgba(196,82,42,0.35)] hover:-translate-y-0.5 active:translate-y-0 text-white"
               style={{ background: 'var(--accent)' }}
             >
               <Send className="w-3.5 h-3.5" />
               Complete Round
             </button>
          </div>
        </div>

        {/* Editor Core */}
        <div className="flex-1 min-h-0 bg-[#0A0B10]">
          <Editor
            height="100%"
            theme={editorTheme}
            language={dsaLanguage === 'cpp' ? 'cpp' : (dsaLanguage === 'python' ? 'python' : (dsaLanguage === 'java' ? 'java' : 'javascript'))}
            value={dsaCode[dsaLanguage] || ""}
            onChange={(val) => updateDSACode(dsaLanguage, val)}
            options={{
              fontSize: 15,
              fontFamily: 'Fira Code, monospace',
              fontWeight: '500',
              minimap: { enabled: false },
              padding: { top: 40, bottom: 40 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorStyle: 'block',
              lineHeight: 1.8,
              renderLineHighlight: 'all',
              scrollBeyondLastLine: false,
              backgroundColor: '#0A0B10',
              letterSpacing: 0.5,
              scrollbar: { verticalWidth: 4, horizontalHeight: 4 }
            }}
          />
        </div>

        {/* Console Drawer */}
        <div className="h-[300px] border-t flex flex-col" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
          <div className="flex items-center px-10 h-14 border-b gap-12" style={{ borderColor: 'var(--border)' }}>
             <button 
               onClick={() => setOutputTab('testcases')}
               className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all border-b-2 py-5 ${outputTab === 'testcases' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-neutral-600 hover:text-neutral-400'}`}
             >
               Test Suite
             </button>
             <button 
               onClick={() => setOutputTab('results')}
               className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all border-b-2 py-5 ${outputTab === 'results' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-neutral-600 hover:text-neutral-400'}`}
             >
               Runtime Console
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono text-[13px] leading-relaxed">
             {outputTab === 'testcases' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {(question.test_cases || question.testCases || []).filter(tc => tc.isVisible !== false).map((tc, i) => (
                   <div key={i} className="flex flex-col gap-3 p-6 rounded-3xl border bg-black/20" style={{ borderColor: 'var(--border)' }}>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Case {tc.id || i+1}</span>
                        <div className="w-2 h-2 rounded-full bg-neutral-800" />
                     </div>
                     <div className="space-y-1.5 opacity-80">
                        <div className="flex gap-2"><span className="text-[var(--accent)] font-bold">In:</span> <span>{fmt(tc.input)}</span></div>
                        <div className="flex gap-2"><span className="text-emerald-500 font-bold">Ex:</span> <span>{fmt(tc.expectedOutput || tc.expected)}</span></div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="h-full">
                 {isExecuting ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6 text-neutral-500">
                       <div className="w-10 h-10 border-[3px] border-[var(--bg-3)] border-t-[var(--accent)] rounded-full animate-spin" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Running compilation...</span>
                    </div>
                 ) : dsaTestResults && dsaTestResults.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 mb-8">
                         <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border flex items-center gap-3 ${dsaTestResults.every(r => r.passed) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                           {dsaTestResults.every(r => r.passed) ? <Trophy className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                           {dsaTestResults.every(r => r.passed) ? 'Execution Success' : 'Logical Error Detected'}
                         </div>
                         <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">{dsaTestResults.filter(r => r.passed).length} / {dsaTestResults.length} Units Passed</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {dsaTestResults.map((res, i) => (
                          <div key={i} className="group bg-[var(--bg-2)] border rounded-xl px-6 py-3 flex items-center justify-between hover:border-[var(--accent-glow)] transition-all" style={{ borderColor: 'var(--border)' }}>
                             <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${res.passed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                <div className="flex flex-col">
                                   <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-0)]">Unit #{res.id || i+1}</span>
                                   {!res.passed && <span className="text-[10px] text-rose-500 font-bold">Assertion Failure</span>}
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                   <span className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-tighter">Latency</span>
                                   <span className="text-[11px] font-bold text-[var(--text-1)]">{res.runtime || '38ms'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                   <span className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-tighter">Status</span>
                                   <span className={`text-[11px] font-bold ${res.passed ? 'text-emerald-500' : 'text-rose-500'}`}>{res.passed ? 'PASS' : 'FAIL'}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[var(--text-2)] opacity-30 group-hover:opacity-100 transition-opacity" />
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4">
                       <Terminal className="w-16 h-16" />
                       <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Idle - Input Required</span>
                    </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL (Prototype Integration) */}
      <AnimatePresence>
        {showResultModal && evaluation && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-xl bg-[#0F0F10] border border-neutral-800 rounded-[3rem] p-12 overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
              
              <div className="text-center space-y-10">
                 <div className="relative inline-block group">
                    <div className={`w-40 h-40 rounded-full border-[6px] flex flex-col items-center justify-center mx-auto transition-all duration-700 ${evaluation.score >= 0.7 ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-[var(--accent)]'}`}>
                       <span className={`text-6xl font-black tracking-tighter ${evaluation.score >= 0.7 ? 'text-emerald-500' : 'text-[var(--accent)]'}`}>
                         {Math.round(evaluation.score * 100)}
                       </span>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Score</span>
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -bottom-2 -right-2 bg-neutral-900 border border-neutral-800 p-3 rounded-full shadow-2xl"
                    >
                       <Trophy className="w-6 h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    </motion.div>
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                      {evaluation.score >= 0.7 ? "Exceptional" : "Recorded"}
                    </h3>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-[0.3em]">
                       {dsaTestResults?.filter(r => r.passed).length} / {dsaTestResults?.length} Assertions Correct
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center gap-2 p-5 rounded-[2rem] border border-neutral-900 bg-neutral-900/20 group hover:bg-neutral-900/40 transition-colors">
                       <Cpu className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Efficiency</span>
                       <span className="font-mono text-sm font-bold text-white">{evaluation.timeComplexity || 'O(NlogN)'}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-5 rounded-[2rem] border border-neutral-900 bg-neutral-900/20 group hover:bg-neutral-900/40 transition-colors">
                       <Activity className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Memory</span>
                       <span className="font-mono text-sm font-bold text-white">{evaluation.spaceComplexity || 'O(1)'}</span>
                    </div>
                 </div>

                 <div className="p-8 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] text-left relative overflow-hidden group">
                    <Info className="absolute -top-4 -right-4 w-20 h-20 text-white/5 group-hover:scale-125 transition-transform" />
                    <p className="text-sm leading-relaxed text-[var(--text-1)] italic font-medium relative">
                       "{evaluation.feedback}"
                    </p>
                 </div>

                 <button 
                  onClick={proceedToNextIndex}
                  className="w-full py-6 rounded-[2rem] text-white font-black uppercase text-xs tracking-[0.5em] transition-all flex items-center justify-center gap-4 group"
                  style={{ background: 'var(--accent)', boxShadow: '0 20px 40px rgba(196,82,42,0.3)' }}
                 >
                    Next Objective <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DSARound;
