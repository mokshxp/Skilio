/**
 * ROUND_SEQUENCES: Defines the tracks for different interview paths.
 * Used by both frontend (to show preview) and backend (to drive logic).
 */
const ROUND_SEQUENCES = {
  technical: [
    { round: 1, type: "mcq",        label: "Core CS",        icon: "🧠", difficulty: "easy" },
    { round: 2, type: "mcq",        label: "System Design",  icon: "🏗️", difficulty: "medium" },
    { round: 3, type: "dsa",        label: "DSA Challenge",  icon: "⚡", difficulty: "medium" },
  ],

  coding: [
    { round: 1, type: "dsa",        label: "Coding Round 1", icon: "💻", difficulty: "easy" },
    { round: 2, type: "dsa",        label: "Coding Round 2", icon: "💻", difficulty: "medium" },
    { round: 3, type: "dsa",        label: "Coding Round 3", icon: "💻", difficulty: "hard" },
  ],

  behavioural: [
    { round: 1, type: "hr",         label: "HR Screening",   icon: "🤝", difficulty: "medium" },
    { round: 2, type: "hr",         label: "Competency",     icon: "🎯", difficulty: "medium" },
    { round: 3, type: "hr",         label: "Leadership",     icon: "👑", difficulty: "hard" },
  ],

  mixed: [
    { round: 1, type: "mcq",        label: "Core CS",        icon: "🧠", difficulty: "easy" },
    { round: 2, type: "mcq",        label: "System Design",  icon: "🏗️", difficulty: "medium" },
    { round: 3, type: "dsa",        label: "DSA Challenge",  icon: "⚡", difficulty: "medium" },
    { round: 4, type: "dsa",        label: "Coding Round",   icon: "💻", difficulty: "hard" },
    { round: 5, type: "hr",         label: "Behavioural",    icon: "🤝", difficulty: "medium" },
  ],
};

module.exports = { ROUND_SEQUENCES };
