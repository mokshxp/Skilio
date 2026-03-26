import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { analyticsApi, interviewApi } from '../services/api.js'
import { useSubscription } from '../hooks/useSubscription.js'
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'
import { 
    Target, BarChart3, Trophy, Zap, 
    BookOpen, FileText, Bot, ArrowRight,
    TrendingUp, Calendar, Layout, AlertCircle, Trash2
} from 'lucide-react'

/* ── COMPONENTS ─────────────────────────────────────────────── */

function DashboardHeader({ userName }) {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    
    const motivations = [
        'Your next interview could change everything.',
        'Consistency beats talent every time.',
        'One more session closer to your offer.',
        'Practice daily. Stay ahead of the curve.',
        'Great engineering requires relentless practice.',
        'You are building the skills for your dream role.'
    ]
    const motivation = motivations[new Date().getDay() % motivations.length]

    return (
        <div style={{ marginBottom: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--border)' }}>
            <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px'
            }}>
                {greeting}
            </p>
            <h1 style={{
                fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800,
                letterSpacing: '-0.04em', color: 'var(--text-0)',
                marginBottom: '8px', lineHeight: 1.15
            }}>
                Welcome back, {userName} 👋
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-2)', fontWeight: 500 }}>
                {motivation}
            </p>
        </div>
    )
}

function StatsRow({ stats, loading }) {
    const cards = [
        {
            label: 'Total Sessions',
            value: stats.totalSessions ?? 0,
            icon: <Target size={20} />,
            color: 'var(--primary)',
            bg: 'rgba(196,80,26,0.1)',
            trend: stats.totalSessions > 0 ? `+${stats.totalSessions} sessions` : 'Begin your journey'
        },
        {
            label: 'Average Score',
            value: stats.avgScore ? (stats.avgScore / 10).toFixed(1) : '—',
            suffix: stats.avgScore ? '/10' : '',
            icon: <BarChart3 size={20} />,
            color: '#2563EB',
            bg: 'rgba(37,99,235,0.1)',
            trend: stats.avgScore >= 70 ? 'Performing at peak' : stats.avgScore ? 'Keep improving' : 'Awaiting data'
        },
        {
            label: 'Best Score',
            value: stats.bestScore ? (stats.bestScore / 10).toFixed(1) : '—',
            suffix: stats.bestScore ? '/10' : '',
            icon: <Trophy size={20} />,
            color: '#D97706',
            bg: 'rgba(217,119,6,0.1)',
            trend: stats.bestScore ? 'Personal record' : 'Aim for the top'
        },
        {
            label: 'Readiness',
            value: stats.readiness ?? 0,
            suffix: '%',
            icon: <Zap size={20} />,
            color: '#16A34A',
            bg: 'rgba(22,163,74,0.1)',
            trend: stats.readiness >= 75 ? 'Interview ready' : 'Level up soon'
        }
    ]

    return (
        <div className="dashboard-stats-row">
            {cards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                        background: 'var(--bg-1)', border: '1px solid var(--border)',
                        borderRadius: '16px', padding: '24px', position: 'relative',
                        transition: 'all 0.2s ease', cursor: 'default'
                    }}
                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
                >
                    <div style={{
                        width: '40px', height: '40px', background: card.bg,
                        borderRadius: '12px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: card.color, marginBottom: '16px'
                    }}>
                        {card.icon}
                    </div>

                    <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '4px' }}>
                        {loading ? '—' : card.value}
                        {card.value !== '—' && card.suffix && (
                            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-2)', marginLeft: '2px' }}>
                                {card.suffix}
                            </span>
                        )}
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '12px' }}>
                        {card.label}
                    </div>

                    <div style={{ fontSize: '12px', color: card.color, fontWeight: 600 }}>
                        {card.trend}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

function ReadinessMeter({ score }) {
    const pct = Math.min(100, Math.max(0, score || 0))
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (pct / 100) * circumference

    const getStatus = (p) => {
        if (p >= 80) return { text: 'Interview Ready', color: '#16A34A' }
        if (p >= 50) return { text: 'Building Strength', color: '#D97706' }
        return { text: 'Early Stage', color: 'var(--text-2)' }
    }
    const status = getStatus(pct)

    return (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: '24px', textAlign: 'left' }}>
                Overall Readiness
            </p>

            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '16px' }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bg-3)" strokeWidth="8" />
                    <motion.circle 
                        cx="70" cy="70" r={radius} fill="none" 
                        stroke={status.color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>{pct}%</span>
                </div>
            </div>

            <p style={{ fontSize: '14px', fontWeight: 700, color: status.color, marginBottom: '4px' }}>{status.text}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                {pct >= 80 ? 'You are within the high-hire probability zone.' : 'Continue sessions to improve your hiring score.'}
            </p>
        </div>
    )
}

function ScoreChart({ data, loading }) {
    return (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', height: '340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)' }}>
                    Performance History
                </p>
                <TrendingUp size={16} className="text-[var(--text-2)]" />
            </div>

            <div style={{ width: '100%', height: '240px' }}>
                {loading ? (
                    <div className="w-full h-full animate-pulse bg-[var(--bg-2)] rounded-lg" />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="session" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-2)' }} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-2)' }} />
                            <Tooltip 
                                contentStyle={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                                itemStyle={{ color: 'var(--text-0)', fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

function QuickActions({ plan, navigate }) {
    const actions = [
        { label: 'Start Interview', icon: <Target size={18}/>, href: '/start', sub: 'Practice a full session', primary: true },
        { label: 'Study Sheets', icon: <BookOpen size={18}/>, href: '/sheets', sub: 'Review cheat sheets', primary: false },
        { label: 'Upload Resume', icon: <FileText size={18}/>, href: '/resume', sub: 'Get resume analysis', primary: false },
        { label: 'AI Copilot', icon: <Bot size={18}/>, href: '/copilot', sub: 'Career Q&A support', primary: false },
    ]

    return (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: '16px' }}>
                Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {actions.map(action => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.href)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                            background: action.primary ? 'var(--primary)' : 'var(--bg-2)',
                            borderRadius: '12px', border: action.primary ? 'none' : '1px solid var(--border)',
                            cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left',
                            color: action.primary ? 'white' : 'var(--text-0)'
                        }}
                        onMouseEnter={e => {
                            if (!action.primary) e.currentTarget.style.borderColor = 'var(--primary)'
                            else e.currentTarget.style.opacity = '0.9'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.opacity = '1'
                        }}
                    >
                        <div style={{ background: action.primary ? 'rgba(255,255,255,0.15)' : 'var(--bg-3)', padding: '8px', borderRadius: '10px' }}>
                            {action.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700 }}>{action.label}</div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>{action.sub}</div>
                        </div>
                        <ArrowRight size={14} opacity={0.5} />
                    </button>
                ))}
            </div>
        </div>
    )
}

function RecentSessions({ sessions, navigate, loading, onDelete }) {
    if (loading) return (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
            <div className="h-4 w-32 bg-[var(--bg-2)] animate-pulse rounded mb-8" />
            <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 w-full bg-[var(--bg-2)] animate-pulse rounded-xl" />)}
            </div>
        </div>
    )

    return (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)' }}>
                    Recent Sessions
                </p>
                <button onClick={() => navigate('/analytics')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    History →
                </button>
            </div>

            {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: 16 }}>
                    <Layout size={32} className="text-[var(--text-2)] mb-4 mx-auto" opacity={0.5} />
                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '8px' }}>No Sessions Yet</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '20px' }}>Your interview history will appear here once you start practicing.</p>
                    <button onClick={() => navigate('/start')} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        Practice Now
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sessions.slice(0, 5).map(s => (
                        <div 
                            key={s.id} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '14px', 
                                padding: '12px 16px', background: 'var(--bg-2)', 
                                borderRadius: '14px', border: '1px solid var(--border)',
                                cursor: 'default', transition: 'all 0.15s ease',
                                position: 'relative',
                                group: 'true'
                            }}
                            className="group"
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <Calendar size={18} className="text-[var(--text-2)]" />
                            <div 
                                style={{ flex: 1, cursor: 'pointer' }}
                                onClick={() => navigate(`/results/${s.id}`)}
                            >
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)' }}>
                                    {s.role || 'Interview Session'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                                    {new Date(s.created_at).toLocaleDateString()} · {s.type || 'Mixed'}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                                    {s.final_score ? (s.final_score / 10).toFixed(1) : '—'}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this session permanently?')) onDelete(s.id);
                                    }}
                                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-[var(--text-2)]"
                                    title="Delete session"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function WeakAreas({ topics }) {
    const defaultTopics = [
        { topic: 'DSA Fundamentals', score: 0 },
        { topic: 'System Design', score: 0 },
        { topic: 'Leadership Principles', score: 0 }
    ]
    const items = topics?.length > 0 ? topics : defaultTopics

    return (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: '20px' }}>
                Primary Focus Areas
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.slice(0, 3).map(item => (
                    <div key={item.topic}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>{item.topic}</span>
                            <span style={{ fontSize: '12px', color: item.score > 0 ? 'var(--primary)' : 'var(--text-2)', fontWeight: 700 }}>
                                {item.score > 0 ? `${item.score}%` : 'Not Measured'}
                            </span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '2px' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {(!topics || topics.length === 0) && (
                <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(196,80,26,0.05)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'start' }}>
                    <AlertCircle size={16} className="text-[var(--primary)] shrink-0 mt-0.5" />
                    <p style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                        Complete sessions to unlock detailed skill gap analysis.
                    </p>
                </div>
            )}
        </div>
    )
}

/* ── MAIN DASHBOARD ─────────────────────────────────────────── */

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { plan, isFree } = useSubscription()
    const [analytics, setAnalytics] = useState(null)
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    
    const userName = user?.firstName || 'Candidate'

    useEffect(() => {
        Promise.all([
            analyticsApi.get(), 
            interviewApi.list({ limit: 8 })
        ])
        .then(([a, b]) => { 
            setAnalytics(a); 
            setSessions(b.data?.sessions || []) 
        })
        .catch(err => console.error('Dashboard Fetch failed:', err))
        .finally(() => setLoading(false))
    }, [])

    const stats = {
        totalSessions: analytics?.total_sessions || 0,
        avgScore: analytics?.average_score || 0,
        bestScore: analytics?.best_score || 0,
        readiness: analytics?.readiness_pct || 0
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="dashboard-page"
        >
            <DashboardHeader userName={userName} />

            <StatsRow stats={stats} loading={loading} />

            <div className="dashboard-grid">
                {/* LEFT: Main Content */}
                <div className="dashboard-left">
                    <ScoreChart data={analytics?.score_trend || []} loading={loading} />
                    <RecentSessions 
                        sessions={sessions} 
                        navigate={navigate} 
                        loading={loading} 
                        onDelete={async (id) => {
                            try {
                                await interviewApi.delete(id);
                                setSessions(sessions.filter(s => s.id !== id));
                            } catch (err) {
                                console.error('[Dashboard] Delete failed:', err);
                                alert(`Failed to delete session: ${err.message}`);
                            }

                        }}
                    />
                </div>

                {/* RIGHT: Telemetry & Actions */}
                <div className="dashboard-right">
                    <ReadinessMeter score={stats.readiness} />
                    <QuickActions plan={plan} navigate={navigate} />
                    <WeakAreas topics={analytics?.weak_topics} />
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-30" />
        </motion.div>
    )
}
