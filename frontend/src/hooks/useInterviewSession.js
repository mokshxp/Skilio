import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * useInterviewSession: Global state for the active interview parameters.
 * Persists selected role, difficulty, and resume context across page reloads
 * to ensure AI generation always has the necessary 'DNA' even if interrupted.
 */
export const useInterviewSession = create(
  persist(
    (set) => ({
      role: null,
      difficulty: "Intermediate",
      roundType: "Technical",
      resumeContext: null,

      /**
       * Updates the global session configuration.
       * @param {Object} config - { role, difficulty, roundType, resumeContext }
       */
      setSessionConfig: ({ role, difficulty, roundType, resumeContext }) =>
        set({ role, difficulty, roundType, resumeContext }),

      /**
       * Resets the session state for a fresh start.
       */
      clearSession: () => set({ 
        role: null, 
        difficulty: "Intermediate", 
        roundType: "Technical", 
        resumeContext: null 
      }),
    }),
    {
      name: "skilio-interview-session", // unique name for storage
    }
  )
);
