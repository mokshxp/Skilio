/**
 * ROUND_SEQUENCES: Defines the tracks for different interview paths.
 * Shown in the Session Preview on the /start page.
 */
/**
 * ROUND_SEQUENCES: Defines the tracks for different interview paths.
 * Shown in the Session Preview on the /start page.
 */
export const ROUND_SEQUENCES = {
  // --- ENGINEERING TRACKS (Default) ---
  technical: [
    { round: 1, type: "mcq",        label: "Core CS",        icon: "🧠" },
    { round: 2, type: "mcq",        label: "System Design",  icon: "🏗️" },
    { round: 3, type: "dsa",        label: "DSA Challenge",  icon: "⚡" },
  ],
  coding: [
    { round: 1, type: "dsa",        label: "Coding Round",   icon: "💻" },
    { round: 2, type: "dsa",        label: "Algorithm Lab",  icon: "💻" },
    { round: 3, type: "dsa",        label: "Final Test",     icon: "💻" },
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

  // --- PRODUCT MANAGEMENT TRACKS ---
  technical_pm: [
    { round: 1, type: "mcq",        label: "Product Sense",  icon: "💡" },
    { round: 2, type: "hr",         label: "Product Strategy", icon: "🗺️" },
    { round: 3, type: "hr",         label: "Execution",      icon: "⚙️" },
  ],
  coding_pm: [
    { round: 1, type: "mcq",        label: "Analytical Case", icon: "📊" },
    { round: 2, type: "mcq",        label: "Product Design", icon: "🎨" },
  ],
  mixed_pm: [
    { round: 1, type: "mcq",        label: "Product Sense",   icon: "💡" },
    { round: 2, type: "mcq",        label: "Metrics & Data",  icon: "📈" },
    { round: 3, type: "hr",         label: "Product Strategy", icon: "🗺️" },
    { round: 4, type: "hr",         label: "Leadership",     icon: "👑" },
  ],
};

/**
 * Resolves the correct sequence based on track selection and role.
 */
export function getSequence(track, role) {
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
