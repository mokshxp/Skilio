import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
    CartesianGrid, Legend,
} from 'recharts'
import PageWrapper, { FadeUp } from '../components/layout/PageWrapper.jsx'
import { analyticsApi } from '../services/api.js'

const COLORS = ['#F59E0B', '#34D399', '#38BDF8', '#FB7185', '#A855F7', '#F97316']

export default function Analytics() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        analyticsApi.get()
            .then(r => setData(r.data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <LoadingGrid />
    if (error) return (
        <PageWrapper>
            <div className="text-center py-16" style={{ color: 'var(--rose)' }}>
                <p className="text-3xl mb-2">⚠️</p>
                <p>{error}</p>
            </div>
        </PageWrapper>
    )

    const scoreTrend = data?.score_trend ?? MOCK_TREND
    const codingStats = data?.coding_success_rate ?? MOCK_CODING
    const topicStrength = data?.topic_strength ?? MOCK_TOPICS
    const weakHeatmap = data?.weak_topics ?? MOCK_WEAK
    const readiness = data?.readiness_pct ?? 64

    return (
        <PageWrapper>
            <FadeUp>
                <div className="page-header">
                    <p className="label mb-1">Analytics</p>
                    <h1 className="headline text-3xl">Performance Insights</h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-1)' }}>
                        Track your progress across all interview sessions.
                    </p>
                </div>
            </FadeUp>

            {/* Readiness Badge */}
            <FadeUp>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickStat label="Readiness" value={`${readiness}%`} color="var(--amber)" />
                    <QuickStat label="Sessions" value={data?.total_sessions ?? '—'} color="var(--sky)" />
                    <QuickStat label="Avg Score" value={data?.average_score != null ? `${data.average_score}/100` : '—'} color="var(--emerald)" />
                    <QuickStat label="Best Score" value={data?.best_score != null ? `${data.best_score}/100` : '—'} color="var(--amber)" />
                </div>
            </FadeUp>

            {/* Score Trend */}
            <FadeUp>
                <div className="card-hover">
                    <p className="section-title mb-1">Score Trend</p>
                    <p className="section-subtitle mb-5">Your score across recent sessions</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={scoreTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="session" tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Fira Code' }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Fira Code' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line
                                type="monotone" dataKey="score" stroke="var(--amber)" strokeWidth={2.5}
                                dot={{ r: 4, fill: 'var(--amber)', strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: 'var(--amber)', stroke: 'var(--bg-0)', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </FadeUp>

            {/* Coding Success + Topic Strength */}
            <FadeUp>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Coding Success Rate */}
                    <div className="card-hover">
                        <p className="section-title mb-1">Coding Success Rate</p>
                        <p className="section-subtitle mb-5">Test cases passed per session</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={codingStats} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="session" tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Fira Code' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'Fira Code' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip suffix="%" />} />
                                <Bar dataKey="rate" fill="var(--emerald)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Topic Strength Pie */}
                    <div className="card-hover">
                        <p className="section-title mb-1">Topic Strength</p>
                        <p className="section-subtitle mb-4">Distribution of performance by topic</p>
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={180}>
                                <PieChart>
                                    <Pie data={topicStrength} dataKey="score" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                                        {topicStrength.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 flex flex-col gap-2">
                                {topicStrength.map((t, i) => (
                                    <div key={t.topic} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-1)' }}>{t.topic}</span>
                                        <span className="mono-data text-xs">{t.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </FadeUp>

            {/* Weak Topics Heatmap */}
            <FadeUp>
                <div className="card-hover">
                    <p className="section-title mb-1">Weak Topic Heatmap</p>
                    <p className="section-subtitle mb-5">Topics that need the most attention</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {weakHeatmap.map((t, i) => {
                            const intensity = Math.max(0.1, 1 - (t.score / 100))
                            return (
                                <motion.div
                                    key={t.topic}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-3 py-3 rounded-xl text-center"
                                    style={{
                                        background: `rgba(251,113,133,${intensity * 0.3})`,
                                        border: `1px solid rgba(251,113,133,${intensity * 0.5})`,
                                    }}
                                >
                                    <p className="text-xs font-semibold mb-1 truncate" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-0)' }}>
                                        {t.topic}
                                    </p>
                                    <p className="text-lg font-bold" style={{ fontFamily: 'Fira Code, monospace', color: `rgba(251,113,133,${0.5 + intensity * 0.5})` }}>
                                        {t.score}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </FadeUp>

            {/* Readiness Radial */}
            <FadeUp>
                <div className="card-hover flex flex-col items-center gap-4">
                    <p className="section-title">Overall Interview Readiness</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <RadialBarChart
                            cx="50%" cy="100%" innerRadius="60%" outerRadius="100%"
                            startAngle={180} endAngle={0}
                            data={[{ name: 'Readiness', value: readiness, fill: readiness >= 70 ? 'var(--emerald)' : readiness >= 40 ? 'var(--amber)' : 'var(--rose)' }]}
                        >
                            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'var(--bg-3)' }} />
                            <text x="50%" y="75%" textAnchor="middle" fill="var(--text-0)" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700 }}>
                                {readiness}%
                            </text>
                            <text x="50%" y="88%" textAnchor="middle" fill="var(--text-2)" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.75rem' }}>
                                Readiness Score
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </FadeUp>
        </PageWrapper>
    )
}

function QuickStat({ label, value, color }) {
    return (
        <div className="card-hover text-center">
            <p className="label mb-2">{label}</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color }}>{value}</p>
        </div>
    )
}

function ChartTooltip({ active, payload, label, suffix = '' }) {
    if (!active || !payload?.length) return null
    return (
        <div className="tooltip">
            <p className="label mb-1">{label}</p>
            <p className="mono-value">{payload[0].value}{suffix}</p>
        </div>
    )
}

function LoadingGrid() {
    return (
        <div className="page-wrapper">
            <div className="flex flex-col gap-6">
                <div className="skeleton h-10 w-64 rounded-xl" />
                <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
                <div className="skeleton h-64 rounded-xl" />
                <div className="grid grid-cols-2 gap-6">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />)}</div>
            </div>
        </div>
    )
}

// Mock data for when backend is offline
const MOCK_TREND = [1, 2, 3, 4, 5, 6].map(i => ({ session: `S${i}`, score: 45 + Math.round(Math.random() * 40) }))
const MOCK_CODING = [1, 2, 3, 4, 5].map(i => ({ session: `S${i}`, rate: 50 + Math.round(Math.random() * 45) }))
const MOCK_TOPICS = ['Arrays', 'Trees', 'DP', 'Graphs', 'OS', 'Networks'].map((t, i) => ({ topic: t, score: 40 + i * 8 + Math.round(Math.random() * 12) }))
const MOCK_WEAK = ['DP', 'Graphs', 'OS', 'Concurrency', 'Trees', 'Sorting', 'Regex', 'SQL'].map(t => ({ topic: t, score: Math.round(30 + Math.random() * 50) }))
