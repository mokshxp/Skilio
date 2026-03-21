import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper, { FadeUp } from '../components/layout/PageWrapper.jsx'
import { resultsApi } from '../services/api.js'

const SUBJECT_ICONS = {
    CN: '📡', DBMS: '🗄️', OS: '⚙️', OOP: '🧱', DSA: '🧮',
    HR: '🤝', SystemDesign: '🏗️',
}

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
    const questions = data.questions ?? []
    const scoreColor = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--amber)' : 'var(--rose)'

    const correct = questions.filter(q => q.isCorrect).length
    const wrong = questions.filter(q => q.isCorrect === false).length

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

                        {/* Stats row */}
                        <div className="flex gap-4 mb-4 flex-wrap">
                            <StatBadge label="Questions" value={questions.length} color="var(--sky)" />
                            <StatBadge label="Correct" value={correct} color="var(--emerald)" />
                            <StatBadge label="Wrong" value={wrong} color="var(--rose)" />
                            <StatBadge label="Role" value={data.role || '—'} color="var(--text-1)" />
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <button className="btn-amber btn-md" onClick={() => navigate('/start')}>
                                ↺ Retry Interview
                            </button>
                            <button
                                className="btn-outline btn-md"
                                onClick={() => navigate('/copilot', { state: { context: `Explain my mistakes from interview ${id}` } })}
                            >
                                🤖 Explain Mistakes
                            </button>
                            <button className="btn-ghost btn-md" onClick={() => navigate('/analytics')}>
                                📊 Analytics
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

            {/* Per-Question Breakdown */}
            {questions.length > 0 && (
                <FadeUp>
                    <div>
                        <p className="section-label mb-4">Question Breakdown</p>
                        <div className="flex flex-col gap-3">
                            {questions.map((q, i) => (
                                <QuestionResultCard key={q.id || i} q={q} index={i} />
                            ))}
                        </div>
                    </div>
                </FadeUp>
            )}

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
                <FadeUp>
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
                </FadeUp>
            )}
        </PageWrapper>
    )
}

function QuestionResultCard({ q, index }) {
    const scoreColor = (q.score ?? 0) >= 7 ? 'var(--emerald)' : (q.score ?? 0) >= 4 ? 'var(--amber)' : 'var(--rose)'
    const subjectIcon = SUBJECT_ICONS[q.subject] || '💡'

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="card-hover"
            style={{ padding: '16px 20px' }}
        >
            <div className="flex items-start gap-4">
                {/* Score circle */}
                <div
                    className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{
                        fontFamily: 'Outfit, sans-serif',
                        background: `${scoreColor}15`,
                        color: scoreColor,
                        border: `1px solid ${scoreColor}30`,
                    }}
                >
                    {q.score ?? '—'}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-bold" style={{
                            fontFamily: 'Outfit, sans-serif', color: 'var(--text-2)',
                        }}>
                            Q{q.questionNumber || index + 1}
                        </span>
                        {q.subject && (
                            <span className="badge-sky" style={{ fontSize: 10, padding: '2px 8px' }}>
                                {subjectIcon} {q.subject}
                            </span>
                        )}
                        {q.topic && (
                            <span className="badge-muted" style={{ fontSize: 10, padding: '2px 8px' }}>
                                {q.topic}
                            </span>
                        )}
                        {q.type && (
                            <span className="badge-amber" style={{ fontSize: 10, padding: '2px 8px', textTransform: 'uppercase' }}>
                                {q.type}
                            </span>
                        )}
                        <span style={{
                            fontFamily: 'Fira Code, monospace', fontSize: 10,
                            color: q.isCorrect ? 'var(--emerald)' : 'var(--rose)',
                        }}>
                            {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                    </div>

                    {/* Question text */}
                    <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-0)' }}>
                        {(q.content || '').substring(0, 200)}{(q.content || '').length > 200 ? '…' : ''}
                    </p>

                    {/* MCQ answer */}
                    {q.options && q.correctAnswer && (
                        <div className="flex gap-4 mb-2 text-xs" style={{ fontFamily: 'Fira Code, monospace' }}>
                            <span style={{ color: 'var(--text-2)' }}>Answer: <span style={{ color: q.isCorrect ? 'var(--emerald)' : 'var(--rose)' }}>{q.answer}</span></span>
                            {!q.isCorrect && (
                                <span style={{ color: 'var(--text-2)' }}>Correct: <span style={{ color: 'var(--emerald)' }}>{q.correctAnswer}</span></span>
                            )}
                        </div>
                    )}

                    {/* Feedback */}
                    {q.feedback && (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                            {q.feedback}
                        </p>
                    )}

                    {/* Improvements */}
                    {q.improvements?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {q.improvements.map((imp, i) => (
                                <span key={i} className="text-xs" style={{
                                    padding: '2px 8px', borderRadius: 4,
                                    background: 'var(--bg-3)', color: 'var(--text-2)',
                                    border: '1px solid var(--border)',
                                }}>
                                    → {imp}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function StatBadge({ label, value, color }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 6,
            background: 'var(--bg-3)', border: '1px solid var(--border)',
        }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700, color }}>{value}</span>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)' }}>{label}</span>
        </div>
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
