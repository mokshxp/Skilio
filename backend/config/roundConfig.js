/**
 * ROUND_SEQUENCES: Defines the tracks for different interview paths.
 * Used by both frontend (to show preview) and backend (to drive logic).
 */
const ROUND_SEQUENCES = {
  // --- ENGINEERING TRACKS (Default) ---
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

  // --- PRODUCT MANAGEMENT TRACKS ---
  technical_pm: [
    { round: 1, type: "mcq",        label: "Product Sense",  icon: "💡", difficulty: "easy" },
    { round: 2, type: "hr",         label: "Product Strategy", icon: "🗺️", difficulty: "medium" },
    { round: 3, type: "hr",         label: "Execution",      icon: "⚙️", difficulty: "medium" },
  ],
  coding_pm: [
    { round: 1, type: "mcq",        label: "Analytical Case", icon: "📊", difficulty: "medium" },
    { round: 2, type: "mcq",        label: "Product Design", icon: "🎨", difficulty: "medium" },
  ],
  mixed_pm: [
    { round: 1, type: "mcq",        label: "Product Sense",   icon: "💡", difficulty: "easy" },
    { round: 2, type: "mcq",        label: "Metrics & Data",  icon: "📈", difficulty: "medium" },
    { round: 3, type: "hr",         label: "Product Strategy", icon: "🗺️", difficulty: "medium" },
    { round: 4, type: "hr",         label: "Leadership",     icon: "👑", difficulty: "hard" },
  ],
};

/**
 * Resolves the correct sequence based on track selection and role.
 */
function getSequence(track, role) {
  const isPM = role?.toLowerCase()?.includes('product manager');
  const trackKey = track?.toLowerCase();

  if (isPM) {
    if (trackKey === 'technical') return ROUND_SEQUENCES.technical_pm;
    if (trackKey === 'coding') return ROUND_SEQUENCES.coding_pm;
    if (trackKey === 'mixed') return ROUND_SEQUENCES.mixed_pm;
  }

  // Default to standard engineering tracks
  return ROUND_SEQUENCES[trackKey] || ROUND_SEQUENCES.mixed;
}

module.exports = { ROUND_SEQUENCES, getSequence };
