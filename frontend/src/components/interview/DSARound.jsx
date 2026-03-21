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
  Layout, 
  Settings,
  Code2,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DSARound = ({ question }) => {
  const { 
    dsaCode, 
    dsaLanguage, 
    dsaTestResults, 
    dsaAttempts, 
    updateDSACode, 
    setDSALanguage, 
    runDSACode, 
    submitDSACode,
    roundStatus
  } = useInterviewStore();

  const [activeTab, setActiveTab] = useState('problem');
  const [outputTab, setOutputTab] = useState('testcases');
  const [isExecuting, setIsExecuting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes

  // Handle default code stub
  useEffect(() => {
    if (!dsaCode[dsaLanguage] && question?.function_signature?.[dsaLanguage]) {
      updateDSACode(dsaLanguage, question.function_signature[dsaLanguage]);
    }
  }, [dsaLanguage, question]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    const res = await submitDSACode(dsaCode[dsaLanguage], dsaLanguage, question.id);
    setIsExecuting(false);
  };

  if (!question) return <div className="p-12 text-center text-neutral-500">Loading DSA Problem...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0A0A0B] text-neutral-200">
      
      {/* Sidebar - Problem Panel */}
      <div className="w-[40%] flex flex-col border-r border-neutral-900 bg-[#0F0F10]">
        <div className="flex border-b border-neutral-900">
          <button 
            onClick={() => setActiveTab('problem')}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'problem' ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            <Info className="w-4 h-4" /> Description
          </button>
          <button 
            onClick={() => setActiveTab('hints')}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'hints' ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            <Settings className="w-4 h-4" /> Hints
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'problem' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{question.question_text || question.title}</h1>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  question.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' : 
                  question.difficulty === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {question.difficulty}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-8 text-neutral-500 text-xs">
                <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> {question.topic}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Round 3 of 5</span>
              </div>

              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-neutral-400 leading-relaxed mb-6 whitespace-pre-wrap">
                  {question.question_text || question.problemStatement}
                </p>

                {question.examples && (
                  <div className="space-y-6 mb-8">
                    <h4 className="text-white font-semibold">Examples</h4>
                    {question.examples.map((ex, i) => (
                      <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3">
                        <div className="text-xs font-mono">
                          <span className="text-cyan-500">Input:</span> {ex.input}
                        </div>
                        <div className="text-xs font-mono">
                          <span className="text-green-500">Output:</span> {ex.output}
                        </div>
                        {ex.explanation && (
                          <div className="text-xs text-neutral-500 italic">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.constraints && (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Constraints</h4>
                    <pre className="text-xs bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-neutral-500 font-mono">
                      {question.constraints}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
               {question.hints?.map((hint, i) => (
                 <details key={i} className="group border border-neutral-900 rounded-xl bg-neutral-900/30 overflow-hidden">
                   <summary className="p-4 cursor-pointer text-sm font-medium text-neutral-400 group-hover:text-white transition-colors list-none flex items-center justify-between">
                     Hint {i + 1}
                     <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="p-4 pt-0 text-sm text-neutral-500 leading-relaxed border-t border-neutral-900">
                     {hint}
                   </div>
                 </details>
               ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-900 bg-[#0A0A0B] flex items-center justify-between">
           <div className="flex items-center gap-2 text-neutral-500">
             <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`} />
             <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-neutral-400'}`}>{formatTime(timeLeft)}</span>
           </div>
           <button className="text-neutral-500 hover:text-white p-2 transition-colors">
              <AlertTriangle className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Main - Editor Panel */}
      <div className="flex-1 flex flex-col bg-[#0A0A0B]">
        {/* Editor Toolbar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-neutral-900 bg-[#0F0F10]">
          <div className="flex items-center gap-4">
            <select 
              value={dsaLanguage}
              onChange={(e) => setDSALanguage(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs font-semibold rounded px-4 py-1.5 focus:outline-none focus:border-cyan-500 text-neutral-300"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={handleRun}
               disabled={isExecuting}
               className="flex items-center gap-2 px-4 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white text-sm font-semibold transition-all disabled:opacity-50"
             >
               {isExecuting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
               Run
             </button>
             <button 
               onClick={handleSubmit}
               disabled={isExecuting}
               className="flex items-center gap-2 px-6 py-1.5 rounded bg-cyan-600 text-black hover:bg-cyan-500 text-sm font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-50"
             >
               <Send className="w-3.5 h-3.5" />
               Submit
             </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-0 bg-[#0A0A0B]">
          <Editor
            height="100%"
            theme="vs-dark"
            language={dsaLanguage === 'cpp' ? 'cpp' : (dsaLanguage === 'python' ? 'python' : 'javascript')}
            value={dsaCode[dsaLanguage] || ""}
            onChange={(val) => updateDSACode(dsaLanguage, val)}
            options={{
              fontSize: 14,
              fontFamily: 'Fira Code, monospace',
              fontWeight: '500',
              minimap: { enabled: false },
              padding: { top: 20 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              lineHeight: 1.6,
              renderLineHighlight: 'all',
              scrollBeyondLastLine: false,
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
              }
            }}
          />
        </div>

        {/* Console / Output Area */}
        <div className="h-[30%] border-t border-neutral-900 flex flex-col bg-[#0F0F10]">
          <div className="flex items-center px-6 h-10 border-b border-neutral-900 gap-6">
             <button 
               onClick={() => setOutputTab('testcases')}
               className={`text-xs font-bold uppercase tracking-widest transition-colors ${outputTab === 'testcases' ? 'text-cyan-500' : 'text-neutral-500 hover:text-neutral-300'}`}
             >
               Test Cases
             </button>
             <button 
               onClick={() => setOutputTab('results')}
               className={`text-xs font-bold uppercase tracking-widest transition-colors ${outputTab === 'results' ? 'text-cyan-500' : 'text-neutral-500 hover:text-neutral-300'}`}
             >
               Run Result
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
             {outputTab === 'testcases' ? (
               <div className="space-y-4">
                 {question.testCases?.filter(tc => tc.isVisible).map((tc, i) => (
                   <div key={i} className="flex flex-col gap-2">
                     <span className="text-[10px] font-bold text-neutral-600 uppercase">Case {tc.id}</span>
                     <div className="bg-[#0A0A0B] border border-neutral-900 rounded p-3 font-mono text-xs text-neutral-400">
                       {tc.input}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="space-y-6">
                 {isExecuting ? (
                   <div className="flex flex-col items-center justify-center py-12 gap-4 text-neutral-500">
                      <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="text-sm font-medium animate-pulse">Running test cases...</span>
                   </div>
                 ) : dsaTestResults.length > 0 ? (
                   <div className="space-y-4">
                     <div className="flex items-center gap-3 mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${dsaTestResults.every(r => r.passed) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {dsaTestResults.every(r => r.passed) ? 'All Passed' : 'Failures Detected'}
                        </span>
                        <span className="text-sm text-neutral-500">Passed {dsaTestResults.filter(r => r.passed).length}/{dsaTestResults.length}</span>
                     </div>

                     <div className="space-y-3">
                       {dsaTestResults.map((res, i) => (
                         <div key={i} className="bg-neutral-900/30 border border-neutral-900 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               {res.passed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                               <span className="text-sm font-semibold">Test Case {res.id}</span>
                            </div>
                            <span className="text-xs font-mono text-neutral-600">{res.runtime}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-12 text-neutral-600 gap-2">
                      <Terminal className="w-8 h-8 opacity-20" />
                      <span className="text-sm font-medium">Run your code to see results</span>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSARound;
