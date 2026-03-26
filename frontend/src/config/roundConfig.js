/**
 * ROUND_SEQUENCES: Defines the tracks for different interview paths.
 * Shown in the Session Preview on the /start page.
 */
export const ROUND_SEQUENCES = {
  technical: [
    { round: 1, type: "mcq",        label: "Core CS",        icon: "🧠" },
    { round: 2, type: "mcq",        label: "System Design",  icon: "🏗️" },
    { round: 3, type: "dsa",        label: "DSA Challenge",  icon: "⚡" },
  ],

  coding: [
    { round: 1, type: "dsa",        label: "Coding Round 1", icon: "💻" },
    { round: 2, type: "dsa",        label: "Coding Round 2", icon: "💻" },
    { round: 3, type: "dsa",        label: "Coding Round 3", icon: "💻" },
  ],

  behavioural: [
    { round: 1, type: "hr",         label: "HR Screening",   icon: "🤝" },
    { round: 2, type: "hr",         label: "Competency",     icon: "🎯" },
    { round: 3, type: "hr",         label: "Leadership",     icon: "👑" },
  ],

  mixed: [
    { round: 1, type: "mcq",        label: "Core CS",        icon: "🧠" },
    { round: 2, type: "mcq",        label: "System Design",  icon: "🏗️" },
    { round: 3, type: "dsa",        label: "DSA Challenge",  icon: "⚡" },
    { round: 4, type: "dsa",        label: "Coding Round",   icon: "💻" },
    { round: 5, type: "hr",         label: "Behavioural",    icon: "🤝" },
  ],
};
