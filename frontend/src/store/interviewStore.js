import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { interviewApi } from '../services/api'

const useInterviewStore = create(
  persist(
    (set, get) => ({
      // SESSION STATE
      interviewId: null,
      session: null,
      
      // CONFIG (from setup)
      role: null,
      difficulty: 'intermediate',
      roundType: 'mixed',
      
      // FLOW
      currentRound: 1,
      roundStatus: 'active', // 'active' | 'submitting' | 'summary' | 'complete'
      isInterviewComplete: false,
      roundSummaries: [],
      nextRoundData: null,
      
      // MCQ STATE
      mcqQuestions: [],
      mcqAnswers: {}, 
      mcqCurrentIndex: 0,
      mcqScore: 0,
      
      // DSA STATE
      dsaCode: {
        python: '',
        javascript: '',
        java: '',
        cpp: ''
      },
      dsaLanguage: 'python',
      dsaTestResults: [],
      dsaAttempts: 0,
      dsaQuestion: null,
      
      // HR STATE
      hrQuestions: [],
      hrAnswers: {}, 
      hrCurrentIndex: 0,
      hrScores: [],
      
      // TIME tracking
      interviewStartTime: null,

      // -- ACTIONS --
      
      initSession: (data) => {
        const { interviewId, session, round } = data;
        set({
          interviewId,
          session,
          currentRound: round.roundNumber,
          roundType: round.roundType,
          roundData: round, // Backwards compatibility for now
          // If the round data has questions, populate them
          mcqQuestions: round.roundType === 'mcq' || round.roundType === 'technical' ? round.questions || [] : [],
          dsaQuestion: round.roundType === 'coding' ? round.questions?.[0] || round.questions || null : null,
          hrQuestions: round.roundType === 'behavioural' ? round.questions || [] : [],
          roundStatus: session.status === 'completed' ? 'complete' : 'active',
          isInterviewComplete: session.status === 'completed',
          mcqAnswers: {},
          mcqCurrentIndex: 0,
          dsaTestResults: [],
          hrAnswers: {},
          hrCurrentIndex: 0,
          roundSummaries: session.round_summaries || []
        });
      },

      setRole: (r) => set({ role: r }),
      setDifficulty: (d) => set({ difficulty: d }),
      setRoundType: (r) => set({ roundType: r }),
      setStartTime: (t) => set({ interviewStartTime: t }),

      selectMCQAnswer: (questionId, option) => {
        set((state) => ({
          mcqAnswers: { ...state.mcqAnswers, [questionId]: option }
        }));
      },

      setMCQIndex: (index) => set({ mcqCurrentIndex: index }),

      completeMCQRound: async () => {
        const { interviewId, currentRound, mcqAnswers, mcqQuestions } = get();
        set({ roundStatus: 'submitting' });
        
        try {
          const responses = (mcqQuestions || []).map(q => ({
            questionId: q.id,
            answer: mcqAnswers[q.id] || null,
            timeTaken: 30 
          }));

          const res = await interviewApi.completeRound(interviewId, {
            roundNumber: currentRound,
            responses
          });

          const { roundSummary, nextRound, isComplete } = res;
          
          set((state) => ({
            roundSummaries: [...state.roundSummaries, roundSummary],
            roundStatus: isComplete ? 'complete' : 'summary',
            nextRoundData: nextRound,
            isInterviewComplete: isComplete,
            mcqScore: roundSummary.score || 0
          }));
        } catch (err) {
          console.error("MCQ round submission failed", err);
          set({ roundStatus: 'active' });
        }
      },

      updateDSACode: (language, code) => {
        set((state) => ({
          dsaCode: { ...state.dsaCode, [language]: code }
        }));
      },

      setDSALanguage: (lang) => set({ dsaLanguage: lang }),

      runDSACode: async (code, language, questionId) => {
        try {
          const res = await interviewApi.runDSA({
            code,
            language,
            questionId
          });
          set({ dsaTestResults: res.testResults });
          return res;
        } catch (err) {
          console.error("Code execution failed", err);
        }
      },

      submitDSACode: async (code, language, questionId) => {
        const { interviewId, currentRound } = get();
        set({ roundStatus: 'submitting' });
        try {
          const res = await interviewApi.submitDSA({
            interviewId,
            questionId,
            roundNumber: currentRound,
            code,
            language
          });
          
          set({ dsaTestResults: res.testResults });
          
          // In V2, we might stay here until they're happy, or complete the round.
          // Let's call completeRound if they passed all or explicitly finished.
          if (res.allPassed) {
             const compRes = await interviewApi.completeRound(interviewId, {
                roundNumber: currentRound,
                responses: [{
                    questionId,
                    answer: code,
                    timeTaken: 600
                }]
             });
             set((state) => ({
                roundSummaries: [...state.roundSummaries, compRes.roundSummary],
                roundStatus: compRes.isComplete ? 'complete' : 'summary',
                nextRoundData: compRes.nextRound,
                isInterviewComplete: compRes.isComplete
             }));
          } else {
             set({ roundStatus: 'active' });
          }
          return res;
        } catch (err) {
          console.error("Code submission failed", err);
          set({ roundStatus: 'active' });
        }
      },

      submitHRAnswer: async (questionId, answer) => {
        set((state) => ({
          hrAnswers: { ...state.hrAnswers, [questionId]: answer }
        }));
        
        // We handle checking all answers in the component or here.
        // For HR, we typically have a single "Finish Round" button.
      },

      finishHRRound: async () => {
        const { interviewId, currentRound, hrAnswers, hrQuestions } = get();
        set({ roundStatus: 'submitting' });
        try {
          const responses = Object.entries(hrAnswers).map(([qId, ans]) => ({
            questionId: qId,
            answer: ans,
            timeTaken: 120
          }));
          const res = await interviewApi.completeRound(interviewId, {
            roundNumber: currentRound,
            responses
          });
          set((state) => ({
            roundSummaries: [...state.roundSummaries, res.roundSummary],
            roundStatus: res.isComplete ? 'complete' : 'summary',
            nextRoundData: res.nextRound,
            isInterviewComplete: res.isComplete
          }));
        } catch (err) {
          set({ roundStatus: 'active' });
        }
      },

      setHRIndex: (index) => set({ hrCurrentIndex: index }),

      proceedToNextRound: () => {
        const { nextRoundData } = get();
        if (nextRoundData) {
          set({
            currentRound: nextRoundData.roundNumber,
            roundType: nextRoundData.roundType,
            roundData: nextRoundData,
            roundStatus: 'active',
            nextRoundData: null,
            // Reset local states for the new round
            mcqQuestions: nextRoundData.roundType === 'mcq' || nextRoundData.roundType === 'technical' ? nextRoundData.questions || [] : [],
            dsaQuestion: nextRoundData.roundType === 'coding' ? nextRoundData.questions?.[0] || nextRoundData.questions || null : null,
            hrQuestions: nextRoundData.roundType === 'behavioural' ? nextRoundData.questions || [] : [],
            mcqAnswers: {},
            mcqCurrentIndex: 0,
            dsaTestResults: [],
            dsaAttempts: 0,
            hrAnswers: {},
            hrCurrentIndex: 0
          });
        }
      },

      reset: () => {
        set({
            interviewId: null,
            session: null,
            currentRound: 1,
            roundStatus: 'active',
            isInterviewComplete: false,
            roundSummaries: [],
            nextRoundData: null,
            mcqQuestions: [],
            mcqAnswers: {},
            mcqCurrentIndex: 0,
            dsaCode: { python: '', javascript: '', java: '', cpp: '' },
            dsaTestResults: [],
            dsaAttempts: 0,
            hrQuestions: [],
            hrAnswers: {},
            hrCurrentIndex: 0,
            interviewStartTime: null
        });
      }
    }),
    { name: 'skilio-interview-session' }
  )
)

export default useInterviewStore;
