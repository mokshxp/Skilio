import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper, { FadeUp } from '../components/layout/PageWrapper.jsx'
import { resultsApi } from '../services/api.js'

export default function Results() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        resultsApi.get(id)
            .then(r => setData(r))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <LoadingState />
    if (error) return <ErrorState msg={error} navigate={navigate} />
    if (!data) return null

    const score = data.total_score ?? 0
    const rounds = data.rounds ?? []
    const weakTopics = data.weak_topics ?? []
    const aiSummary = data.ai_feedback_summary ?? ''
    const scoreColor = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--amber)' : 'var(--rose)'

    return (
        <PageWrapper>
            <FadeUp>
                <div className="page-header">
                    <p className="label mb-1">Session #{id?.slice(0, 8)}</p>
                    <h1 className="headline text-3xl">Interview Results</h1>
                </div>
            </FadeUp>

            {/* Score Hero */}
            <FadeUp>
                <div className="card-hover flex flex-col md:flex-row items-center gap-8 p-8">
                    {/* Big Score Circle */}
                    <div className="shrink-0 relative w-36 h-36">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--bg-3)" strokeWidth="2.5" />
                            <motion.circle
                                cx="18" cy="18" r="15.9" fill="none"
                                stroke={scoreColor} strokeWidth="2.5"
                                strokeDasharray="100"
                                strokeDashoffset="100"
                                animate={{ strokeDashoffset: 100 - score }}
                                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: scoreColor }}>{score}</span>
                            <span className="text-xs" style={{ color: 'var(--text-2)' }}>/ 100</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="headline text-2xl mb-1" style={{ color: scoreColor }}>
                            {score >= 75 ? '🏆 Great Interview!' : score >= 50 ? '👍 Solid Performance' : '📈 Room to Grow'}
                        </h2>
                        {aiSummary && (
                            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-1)' }}>{aiSummary}</p>
                        )}
                        <div className="flex gap-3 flex-wrap">
                            <button className="btn-amber btn-md" onClick={() => navigate('/start')}>
                                ↺ Retry Interview
                            </button>
                            <button
                                className="btn-outline btn-md"
                                onClick={() => navigate('/copilot', { state: { context: `Explain my mistakes from interview ${id}` } })}
                            >
                                🤖 Explain My Mistakes
                            </button>
                            <button className="btn-ghost btn-md" onClick={() => navigate('/analytics')}>
                                📊 View Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </FadeUp>

            {/* Round Breakdown */}
            {rounds.length > 0 && (
                <FadeUp>
                    <div>
                        <p className="section-label mb-4">Round Breakdown</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rounds.map((r, i) => <RoundCard key={i} round={r} index={i} />)}
                        </div>
                    </div>
                </FadeUp>
            )}

            {/* Weak Topics + Coding */}
            <FadeUp>
                <div className="grid md:grid-cols-2 gap-6">
                    {weakTopics.length > 0 && (
                        <div className="card-hover">
                            <p className="label mb-3">Weak Topics Identified</p>
                            <div className="flex flex-col gap-2">
                                {weakTopics.map((t) => (
                                    <div key={t.topic} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--rose)' }} />
                                        <span className="text-sm flex-1" style={{ color: 'var(--text-1)' }}>{t.topic}</span>
                                        {t.score != null && (
                                            <span className="mono-value text-xs">{t.score}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.coding_stats && (
                        <div className="card-hover">
                            <p className="label mb-3">Coding Performance</p>
                            <div className="flex flex-col gap-3">
                                <CodingStat label="Test Cases Passed" value={`${data.coding_stats.passed}/${data.coding_stats.total}`} color="var(--emerald)" />
                                <CodingStat label="Avg Runtime" value={`${data.coding_stats.avg_ms}ms`} color="var(--sky)" />
                                <CodingStat label="Correctness" value={`${data.coding_stats.correctness_pct}%`} color="var(--amber)" />
                            </div>
                        </div>
                    )}
                </div>
            </FadeUp>
        </PageWrapper>
    )
}

function RoundCard({ round, index }) {
    const score = round.score ?? 0
    const color = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--amber)' : 'var(--rose)'
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-hover"
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-0)' }}>
                        {round.round_type || `Round ${index + 1}`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-2)' }}>{round.question_count || 0} questions</p>
                </div>
                <span className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color }}>{score}</span>
            </div>
            <div className="progress-track">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                />
            </div>
            {round.feedback && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-2)' }}>{round.feedback}</p>
            )}
        </motion.div>
    )
}

function CodingStat({ label, value, color }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-1)' }}>{label}</span>
            <span className="font-bold text-sm" style={{ fontFamily: 'Fira Code, monospace', color }}>{value}</span>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="flex-1 flex items-center justify-center gap-3" style={{ color: 'var(--text-2)' }}>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Loading results…
        </div>
    )
}

function ErrorState({ msg, navigate }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <span className="text-4xl">⚠️</span>
            <p style={{ color: 'var(--rose)' }}>{msg}</p>
            <button className="btn-outline btn-md" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>
    )
}
