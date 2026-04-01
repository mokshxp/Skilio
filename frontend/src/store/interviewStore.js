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
      totalRounds: 5,
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
      dsaQuestions: [],
      dsaCurrentIndex: 0,
      lastDSASubmission: null,
      
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
          totalRounds: session.total_rounds || 5,
          roundData: round, // Backwards compatibility for now
          // If the round data has questions, populate them
          mcqQuestions: (round.roundType === 'mcq' || round.roundType === 'technical') ? round.questions || [] : [],
          mcqCurrentIndex: 0,
          mcqAnswers: {},
          dsaQuestions: (round.roundType === 'coding' || round.roundType === 'dsa') ? round.questions || [] : [],
          dsaCurrentIndex: 0,
          dsaCode: { python: '', javascript: '', java: '', cpp: '' },
          dsaTestResults: [],
          hrQuestions: (round.roundType === 'behavioural' || round.roundType === 'behavioral' || round.roundType === 'hr' || round.roundType === 'text') ? round.questions || [] : [],
          hrAnswers: {},
          hrCurrentIndex: 0,
          roundStatus: session.status === 'completed' ? 'complete' : 'active',
          isInterviewComplete: session.status === 'completed',
          roundSummaries: session.interview_round_summaries || session.round_summaries || []
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
          
          if (isComplete) {
            set((state) => ({
              roundSummaries: [...state.roundSummaries, roundSummary],
              roundStatus: 'complete',
              isInterviewComplete: true,
              mcqScore: roundSummary.score || 0
            }));
          } else {
            // SKIP SUMMARY: Directly proceed to next round
            set((state) => ({
              roundSummaries: [...state.roundSummaries, roundSummary],
              currentRound: nextRound.roundNumber,
              roundType: nextRound.roundType,
              roundData: nextRound,
              roundStatus: 'active',
              nextRoundData: null,
              mcqScore: roundSummary.score || 0,
              
              // Reset MCQ specific state
              mcqQuestions: (nextRound.roundType === 'mcq' || nextRound.roundType === 'technical') ? nextRound.questions || [] : [],
              dsaQuestion: (nextRound.roundType === 'coding' || nextRound.roundType === 'dsa') ? nextRound.questions?.[0] || nextRound.questions || null : null,
              hrQuestions: (nextRound.roundType === 'behavioural' || nextRound.roundType === 'behavioral' || nextRound.roundType === 'hr') ? nextRound.questions || [] : [],
              mcqAnswers: {},
              mcqCurrentIndex: 0,
              dsaTestResults: [],
              dsaAttempts: 0,
              hrAnswers: {},
              hrCurrentIndex: 0
            }));
          }
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

      setDSAIndex: (index) => set({ dsaCurrentIndex: index, dsaTestResults: [] }),
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
          // 1. Only run execution/AI if there's actually something to evaluate
          // This prevents crashes or 'stuck' states on empty submissions
          const hasCode = code && code.trim().length > 50; 
          
          let res = { testResults: [], allPassed: false };
          if (hasCode) {
            try {
              res = await interviewApi.submitDSA({
                interviewId,
                questionId,
                roundNumber: currentRound,
                code,
                language
              });
            } catch (e) {
              console.warn("Backend evaluation failed, falling back to soft submit", e);
            }
          }
          
          set({ dsaTestResults: res.testResults || [] });
          
          // 2. FORCED COMPLETION: Move to the next round regardless of what the backend said
          const compRes = await interviewApi.completeRound(interviewId, {
              roundNumber: currentRound,
              responses: [{
                  questionId,
                  answer: code || "// No code submitted",
                  timeTaken: 600
              }]
          });

          set((state) => ({
              roundSummaries: [...state.roundSummaries, compRes.roundSummary],
              lastDSASubmission: compRes,
              nextRoundData: compRes.nextRound,
              isInterviewComplete: compRes.isComplete,
              roundStatus: 'active' // Reset to active so the component displays the result modal
          }));

          return { ...res, compRes };
        } catch (err) {
          console.error("Critical submission failure", err);
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

      completeAptitudeRound: async (answers) => {
        const { interviewId, currentRound } = get();
        set({ roundStatus: 'submitting' });
        try {
          const responses = (answers || []).map(a => ({
            questionId: a.questionId,
            answer: a.selected || null,
            isCorrect: a.isCorrect,
            category: a.category,
            timeTaken: 90,
          }));

          const res = await interviewApi.completeRound(interviewId, {
            roundNumber: currentRound,
            responses,
          });

          const { roundSummary, nextRound, isComplete } = res;

          if (isComplete) {
            set((state) => ({
              roundSummaries: [...state.roundSummaries, roundSummary],
              roundStatus: 'complete',
              isInterviewComplete: true,
            }));
          } else {
            set((state) => ({
              roundSummaries: [...state.roundSummaries, roundSummary],
              currentRound: nextRound.roundNumber,
              roundType: nextRound.roundType,
              roundData: nextRound,
              roundStatus: 'active',
              nextRoundData: null,
              // Reset per-round state
              mcqQuestions: (nextRound.roundType === 'mcq' || nextRound.roundType === 'technical') ? nextRound.questions || [] : [],
              mcqAnswers: {},
              mcqCurrentIndex: 0,
              dsaQuestions: (nextRound.roundType === 'coding' || nextRound.roundType === 'dsa') ? nextRound.questions || [] : [],
              dsaCode: { python: '', javascript: '', java: '', cpp: '' },
              dsaTestResults: [],
              dsaAttempts: 0,
              hrQuestions: (nextRound.roundType === 'hr' || nextRound.roundType === 'behavioural' || nextRound.roundType === 'behavioral') ? nextRound.questions || [] : [],
              hrAnswers: {},
              hrCurrentIndex: 0,
            }));
          }
        } catch (err) {
          console.error('Aptitude round submission failed', err);
          set({ roundStatus: 'active' });
        }
      },

      endInterview: async () => {
        const { interviewId } = get();
        try {
          await interviewApi.post(`/interview/end`, { interviewId });
          set({
            isInterviewComplete: true,
            roundStatus: 'complete'
          });
        } catch (err) {
          console.error("End interview failed", err);
          // Fallback: still show report even if API fails to update status
          set({
            isInterviewComplete: true,
            roundStatus: 'complete'
          });
        }
      },

    setRoundStatus: (status) => set({ roundStatus: status }),

    clearLastSubmission: () => set({ lastDSASubmission: null }),

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
            mcqQuestions: (nextRoundData.roundType === 'mcq' || nextRoundData.roundType === 'technical') ? nextRoundData.questions || [] : [],
            mcqCurrentIndex: 0,
            mcqAnswers: {},
            dsaQuestions: (nextRoundData.roundType === 'coding' || nextRoundData.roundType === 'dsa') ? nextRoundData.questions || [] : [],
            dsaCurrentIndex: 0,
            dsaCode: { python: '', javascript: '', java: '', cpp: '' },
            dsaTestResults: [],
            dsaAttempts: 0,
            hrQuestions: (nextRoundData.roundType === 'behavioural' || nextRoundData.roundType === 'behavioral' || nextRoundData.roundType === 'hr') ? nextRoundData.questions || [] : [],
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
      },

      resetInterviewState: () => set({
        roundStatus: 'active',
        isInterviewComplete: false,
        roundData: null,
        roundSummaries: [],
      }),
    }),
    { name: 'skilio-interview-flow' }
  )
)

export default useInterviewStore;
