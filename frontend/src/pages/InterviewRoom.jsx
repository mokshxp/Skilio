import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useInterviewStore from '../store/interviewStore';
import { interviewApi } from '../services/api';

// V2 Components
import MCQRound from '../components/interview/MCQRound';
import DSARound from '../components/interview/DSARound';
import HRRound from '../components/interview/HRRound';
import RoundSummary from '../components/interview/RoundSummary';
import FinalReport from '../components/interview/FinalReport';

import { Loader2, AlertCircle, Home, RefreshCcw } from 'lucide-react';

const InterviewRoom = () => {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  
  const { 
    session,
    roundType,
    roundData,
    roundStatus,
    initSession,
    roundSummaries,
    isInterviewComplete
  } = useInterviewStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        // Fetching from confirmed backend route: /interview/session/:id
        const data = await interviewApi.get(interviewId); 
        
        const currentRoundNum = data.current_round;
        const currentRoundQs = data.interview_questions.filter(q => q.round_number === currentRoundNum);
        
        initSession({
          interviewId,
          session: data,
          round: {
            roundNumber: currentRoundNum,
            roundType: currentRoundQs[0]?.round_type || 'mcq',
            questions: currentRoundQs
          }
        });
      } catch (err) {
        console.error("Failed to load session", err);
        setError(err.message || "Interview session not found");
      } finally {
        setIsLoading(false);
      }
    };

    if (interviewId) {
      fetchSession();
    }
  }, [interviewId, initSession]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0B] gap-4">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        <p className="text-neutral-500 font-medium animate-pulse uppercase tracking-widest text-xs">Initializing Secure Session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0B] p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-neutral-500 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all font-bold"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (roundStatus === 'summary') {
      return <RoundSummary summary={roundSummaries[roundSummaries.length - 1]} />;
    }

    if (roundStatus === 'complete' || isInterviewComplete) {
      return <FinalReport roundSummaries={roundSummaries} session={session} />;
    }

    switch (roundType) {
      case 'mcq':
        return <MCQRound questions={roundData?.questions || []} />;
      case 'dsa':
        return <DSARound question={roundData?.questions?.[0]} />;
      case 'hr':
        return <HRRound questions={roundData?.questions || []} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
             <RefreshCcw className="w-12 h-12 text-neutral-800 animate-spin-slow" />
             <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs tracking-widest">Awaiting Round Data...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
       {/* Global Background Elements */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
       </div>

       <main className="flex-1 relative z-10">
         <AnimatePresence mode="wait">
           <motion.div
             key={`${roundType}-${roundStatus}`}
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.02 }}
             transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
           >
              {renderContent()}
           </motion.div>
         </AnimatePresence>
       </main>
    </div>
  );
};

export default InterviewRoom;
