import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { motion } from 'framer-motion'
import { analyticsApi, interviewApi } from '../services/api.js'

const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'MORNING'
    if (h < 17) return 'AFTERNOON'
    return 'EVENING'
}

/* Stagger container + child variants */
const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const fadeLeft = {
    hidden: { opacity: 0, x: 22 },
    show: { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [analytics, setAnalytics] = useState(null)
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const firstName = user?.firstName || 'there'

    useEffect(() => {
        Promise.all([analyticsApi.get(), interviewApi.list({ limit: 6 })])
            .then(([a, b]) => { setAnalytics(a.data); setSessions(b.data?.sessions || []) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const score = analytics?.average_score ?? null
    const best = analytics?.best_score ?? null
    const readiness = analytics?.readiness_pct ?? null
    const total = analytics?.total_sessions ?? 0

    const scoreColor = (s) => s >= 75 ? 'var(--emerald)' : s >= 50 ? 'var(--accent)' : 'var(--rose)'

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Section header */}
            <motion.div variants={fadeUp} style={{ marginBottom: 36 }}>
                <p style={{
                    fontFamily: 'Fira Code, monospace', fontSize: 10, letterSpacing: '0.14em',
                    color: 'var(--text-2)', marginBottom: 3, textTransform: 'uppercase',
                }}>
                    Interview Performance · {getGreeting()}
                </p>
                <h1 style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800,
                    color: 'var(--text-0)', lineHeight: 1, letterSpacing: '-0.03em', margin: 0,
                }}>
                    {firstName}
                </h1>
            </motion.div>

            {/* Main 2-col */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, alignItems: 'start' }}>

                {/* LEFT */}
                <div>
                    {/* Score */}
                    <motion.div variants={fadeUp} style={{ marginBottom: 36 }}>
                        <p style={LABEL}>Average Score</p>
                        {loading ? (
                            <div style={{ width: 100, height: 72, borderRadius: 6, marginTop: 8 }} className="animate-shimmer" />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.25, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
                                style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}
                            >
                                <AnimatedNumber
                                    value={score}
                                    style={{
                                        fontFamily: 'Outfit, sans-serif', fontSize: 72, fontWeight: 800, lineHeight: 1,
                                        color: score != null ? scoreColor(score) : 'var(--text-2)', letterSpacing: '-0.04em',
                                    }}
                                />
                                {score != null && (
                                    <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 13, color: 'var(--text-2)' }}>/100</span>
                                )}
                            </motion.div>
                        )}

                        {/* Readiness bar */}
                        {readiness != null && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                style={{ marginTop: 20, maxWidth: 420 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)' }}>Interview Readiness</span>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.4 }}
                                        style={{ fontFamily: 'Fira Code, monospace', fontSize: 12, color: 'var(--accent)' }}
                                    >
                                        {readiness}%
                                    </motion.span>
                                </div>
                                <div style={{ height: 2, background: 'var(--bg-3)', borderRadius: 2 }}>
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${readiness}%` }} transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
                                        style={{ height: '100%', borderRadius: 2, background: 'var(--accent)' }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={fadeUp} style={{ height: 1, background: 'var(--border)', marginBottom: 36 }} />

                    {/* Recent Sessions */}
                    <motion.div variants={fadeUp}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <p style={LABEL}>Recent Sessions</p>
                            <button onClick={() => navigate('/analytics')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Fira Code, monospace', fontSize: 11, color: 'var(--accent)', padding: 0, letterSpacing: '0.04em', transition: 'opacity 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                all →
                            </button>
                        </div>

                        {loading ? (
                            <SessionsSkeleton />
                        ) : sessions.length === 0 ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-2)', paddingTop: 8 }}
                            >
                                No sessions yet. Start your first interview below.
                            </motion.p>
                        ) : (
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                            >
                                {sessions.map((s, i) => <SessionRow key={s.id || i} session={s} navigate={navigate} index={i} />)}
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* RIGHT — Telemetry column */}
                <motion.div variants={fadeLeft}>
                    <p style={{ ...LABEL, marginBottom: 0 }}>Metrics</p>
                    <TelRow label="Total Sessions" value={loading ? null : total} />
                    <TelRow label="Best Score" value={loading ? null : best} unit="/100" accent={best != null ? scoreColor(best) : null} />
                    <TelRow label="Avg Score" value={loading ? null : score} unit="/100" accent={score != null ? scoreColor(score) : null} />
                    <TelRow label="Readiness" value={loading ? null : readiness} unit="%" accent="var(--accent)" last />

                    <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />

                    <p style={{ ...LABEL, marginBottom: 12 }}>Actions</p>
                    <QA label="Start Interview" onClick={() => navigate('/start')} primary />
                    <QA label="Upload Resume" onClick={() => navigate('/resume')} />
                    <QA label="Open Copilot" onClick={() => navigate('/copilot')} />
                    <QA label="View Analytics" onClick={() => navigate('/analytics')} />
                </motion.div>
            </div>
        </motion.div>
    )
}

const LABEL = {
    fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-2)',
    letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0,
}

/* Animated number: counts up from 0 to value */
function AnimatedNumber({ value, style }) {
    const [display, setDisplay] = useState(0)
    const raf = useRef(null)

    useEffect(() => {
        if (value == null) return
        const start = performance.now()
        const duration = 900
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setDisplay(Math.round(eased * value))
            if (progress < 1) raf.current = requestAnimationFrame(animate)
        }
        raf.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(raf.current)
    }, [value])

    return <span style={style}>{value != null ? display : '—'}</span>
}

function TelRow({ label, value, unit = '', accent, last }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
            {value == null
                ? <div style={{ width: 36, height: 14, borderRadius: 3 }} className="animate-shimmer" />
                : <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 14, fontWeight: 600, color: accent || 'var(--text-0)' }}>{value}{unit}</span>}
        </motion.div>
    )
}

function SessionRow({ session, navigate, index }) {
    const score = session.total_score ?? session.score
    const color = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--accent)' : 'var(--rose)'
    const date = session.created_at ? new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null

    return (
        <motion.button
            variants={fadeUp}
            onClick={() => navigate(`/results/${session.id}`)}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.15 }}
            style={{
                display: 'flex', alignItems: 'center', padding: '11px 0', width: '100%',
                background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                cursor: 'pointer', textAlign: 'left', gap: 16,
            }}
        >
            <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-0)', margin: 0, fontWeight: 500 }}>
                    {session.role || 'Interview Session'}
                </p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0' }}>
                    {session.round_type || 'Mixed'}{date ? ` · ${date}` : ''}
                </p>
            </div>
            {score != null && (
                <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{score}</span>
            )}
        </motion.button>
    )
}

function QA({ label, onClick, primary }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.015, x: primary ? 0 : 2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.13 }}
            style={{
                display: 'block', width: '100%', padding: '9px 14px', marginBottom: 7, borderRadius: 7, cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 500, textAlign: 'left',
                background: primary ? 'var(--accent)' : 'transparent',
                color: primary ? 'var(--bg-0)' : 'var(--text-1)',
                border: primary ? '1px solid transparent' : '1px solid var(--border-md)',
                position: 'relative', overflow: 'hidden',
            }}
        >
            {label}
        </motion.button>
    )
}

function SessionsSkeleton() {
    return <div>{[0, 1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
                <div style={{ width: 150, height: 12, borderRadius: 3, marginBottom: 6 }} className="animate-shimmer" />
                <div style={{ width: 90, height: 10, borderRadius: 3 }} className="animate-shimmer" />
            </div>
            <div style={{ width: 30, height: 16, borderRadius: 3 }} className="animate-shimmer" />
        </div>
    ))}</div>
}
