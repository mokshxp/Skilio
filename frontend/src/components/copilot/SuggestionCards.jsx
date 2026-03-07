import { motion } from 'framer-motion'
import { BookOpen, BarChart3, Target, MessageCircle, Code2 } from 'lucide-react'

const SUGGESTIONS = [
    { id: 'study_plan', icon: BookOpen, text: 'Generate a 4-week DSA study plan', color: 'var(--accent)' },
    { id: 'explain_results', icon: BarChart3, text: 'Explain my last interview results', color: 'var(--emerald)' },
    { id: 'focus_topics', icon: Target, text: 'What topics should I focus on?', color: 'var(--sky)' },
    { id: 'hr_question', icon: MessageCircle, text: 'Practice a mock HR question', color: 'var(--rose)' },
    { id: 'weak_points', icon: Code2, text: 'Review my coding weak points', color: 'var(--accent-soft)' },
]

export default function SuggestionCards({ onSelect, disabled }) {
    return (
        <div className="cop-suggestions">
            <div className="cop-suggestions-header">
                <motion.div
                    className="cop-suggestions-icon"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    ✨
                </motion.div>
                <h2 className="cop-suggestions-title">How can I help you today?</h2>
                <p className="cop-suggestions-sub">Choose a prompt or type your own question below.</p>
            </div>

            <div className="cop-suggestions-grid">
                {SUGGESTIONS.map((s, i) => {
                    const Icon = s.icon
                    return (
                        <motion.button
                            key={i}
                            className="cop-suggestion-card"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: i * 0.07 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(s.id)}
                            disabled={disabled}
                        >
                            <div className="cop-suggestion-icon" style={{ color: s.color }}>
                                <Icon size={18} />
                            </div>
                            <span className="cop-suggestion-text">{s.text}</span>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
