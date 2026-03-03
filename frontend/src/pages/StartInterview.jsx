import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { interviewApi } from '../services/api.js'

const ROLES = ['Frontend Engineer', 'Backend Engineer', 'Full Stack', 'Data Scientist', 'ML Engineer', 'DevOps', 'System Design', 'Product Manager']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const ROUNDS = [
    { id: 'technical', label: 'Technical', desc: 'DSA, system design, architecture' },
    { id: 'coding', label: 'Coding', desc: 'Live coding with AI test cases' },
    { id: 'behavioural', label: 'Behavioural', desc: 'STAR-method soft skills questions' },
    { id: 'mixed', label: 'Mixed', desc: 'Combination of all round types' },
]

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function StartInterview() {
    const navigate = useNavigate()
    const [role, setRole] = useState('Frontend Engineer')
    const [difficulty, setDifficulty] = useState('Intermediate')
    const [round, setRound] = useState('technical')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const selectedRound = ROUNDS.find(r => r.id === round)

    const handleStart = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await interviewApi.create({ role, difficulty, round_type: round })
            navigate(`/interview/${res.data.session_id}`)
        } catch (e) {
            setError(e.message || 'Failed to start. Please try again.')
            setLoading(false)
        }
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    New Session
                </p>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', margin: 0 }}>
                    Configure Interview
                </h1>
            </motion.div>

            {/* 2-col grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64, alignItems: 'start' }}>

                {/* LEFT — Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

                    {/* Role */}
                    <motion.div variants={fadeUp}>
                        <p style={labelStyle}>Target Role</p>
                        <motion.div
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {ROLES.map(r => (
                                <motion.button
                                    key={r}
                                    variants={{ hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.34, 1.2, 0.64, 1] } } }}
                                    onClick={() => setRole(r)}
                                    whileHover={{ scale: 1.04, y: -1 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={pillStyle(r === role)}
                                >
                                    {r}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={fadeUp} style={{ height: 1, background: 'var(--border)' }} />

                    {/* Difficulty */}
                    <motion.div variants={fadeUp}>
                        <p style={labelStyle}>Difficulty</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            {DIFFICULTIES.map((d, i) => (
                                <motion.button
                                    key={d}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.06, duration: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
                                    onClick={() => setDifficulty(d)}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={pillStyle(d === difficulty)}
                                >
                                    {d}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={fadeUp} style={{ height: 1, background: 'var(--border)' }} />

                    {/* Round Type */}
                    <motion.div variants={fadeUp}>
                        <p style={labelStyle}>Round Type</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 12 }}>
                            {ROUNDS.map((r, i) => (
                                <motion.button
                                    key={r.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.07, duration: 0.35 }}
                                    onClick={() => setRound(r.id)}
                                    whileHover={{ x: r.id === round ? 0 : 4 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '14px 0', background: 'none', border: 'none',
                                        borderBottom: '1px solid var(--border)', cursor: 'pointer',
                                        textAlign: 'left', width: '100%',
                                        borderLeft: r.id === round ? '2px solid var(--amber)' : '2px solid transparent',
                                        paddingLeft: r.id === round ? 12 : 14,
                                        transition: 'border-color 0.2s, padding-left 0.2s',
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: r.id === round ? 600 : 400, color: r.id === round ? 'var(--text-0)' : 'var(--text-1)', margin: 0, transition: 'color 0.15s, font-weight 0.15s' }}>
                                            {r.label}
                                        </p>
                                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0' }}>
                                            {r.desc}
                                        </p>
                                    </div>
                                    <AnimatePresence>
                                        {r.id === round && (
                                            <motion.div
                                                key="dot"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                                                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT — Session Summary */}
                <motion.div
                    variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } } }}
                    style={{ position: 'sticky', top: 96 }}
                >
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                                Session Preview
                            </p>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <SummaryRow label="Role" value={role} />
                            <SummaryRow label="Difficulty" value={difficulty} />
                            <SummaryRow label="Round" value={selectedRound?.label} last />
                        </div>

                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={selectedRound?.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.22 }}
                                    style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}
                                >
                                    {selectedRound?.desc}
                                </motion.p>
                            </AnimatePresence>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--rose)', marginBottom: 10 }}
                                >
                                    {error}
                                </motion.p>
                            )}

                            <motion.button
                                onClick={handleStart}
                                disabled={loading}
                                whileHover={loading ? {} : { scale: 1.02, boxShadow: '0 0 20px var(--accent-glow)' }}
                                whileTap={loading ? {} : { scale: 0.97 }}
                                style={{
                                    width: '100%', padding: '12px 0',
                                    background: loading ? 'var(--bg-3)' : 'var(--amber)',
                                    color: loading ? 'var(--text-2)' : 'var(--bg-0)',
                                    border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer',
                                    fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600,
                                    transition: 'background 0.2s, color 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                {loading ? (
                                    <><Spinner /> Starting…</>
                                ) : (
                                    'Start Interview'
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

const labelStyle = {
    fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)',
    letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
}

const pillStyle = (active) => ({
    padding: '7px 16px', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: active ? 500 : 400,
    border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
    background: active ? 'var(--amber-dim)' : 'transparent',
    color: active ? 'var(--amber)' : 'var(--text-2)',
    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
    boxShadow: active ? '0 0 12px var(--amber-glow)' : 'none',
})

function SummaryRow({ label, value, last }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={value}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 500, color: 'var(--text-0)' }}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    )
}

function Spinner() {
    return <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
}
