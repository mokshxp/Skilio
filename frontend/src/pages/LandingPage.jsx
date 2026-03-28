import { useNavigate } from 'react-router-dom'
import { SafeSignedIn, SafeSignedOut, SafeSignInButton } from '../context/ClerkSafeContext.jsx'
import { SignUpButton, UserButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import Footer from '../components/layout/Footer.jsx'

/* ── animation helpers ─────────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [.25,.46,.45,.94] } } }
const fadeLeft = { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { duration: 0.6 } } }
const fadeRight = { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.6 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

/* ── shared styles ─────────────────────────────────────── */
const sectionPad = { padding: '100px 32px', position: 'relative', zIndex: 10 }
const maxW = { maxWidth: 1200, margin: '0 auto' }
const glassCard = {
    background: 'var(--bg-1)',
    backdropFilter: 'blur(18px)',
    border: '1px solid var(--border-md)',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}
const sectionDivider = { height: 1, background: 'var(--border)', margin: '0 48px', position: 'relative', zIndex: 10 }
const labelStyle = {
    fontFamily: 'Fira Code, monospace', fontSize: 11, fontWeight: 500,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14,
}
const h2Style = {
    fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800,
    color: 'var(--text-0)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 16,
}
const bodyText = { fontSize: 15, lineHeight: 1.7, color: 'var(--text-1)', maxWidth: 480, margin: 0 }

/* ── feature data ──────────────────────────────────────── */
const FEATURES = [
    { icon: '🎯', title: 'AI Mock Interviews', desc: 'Adaptive questions that evolve based on your resume and real-time performance.', color: 'var(--accent)' },
    { icon: '📄', title: 'Resume Intelligence', desc: 'Deep analysis of your resume to surface strengths, gaps, and targeted improvements.', color: 'var(--emerald)' },
    { icon: '🤖', title: 'AI Career Copilot', desc: 'Your 24/7 mentor — study plans, career advice, and prep strategies on demand.', color: 'var(--sky)' },
    { icon: '📊', title: 'Performance Analytics', desc: 'Heatmaps, score trends, and topic-level breakdown to track your growth.', color: 'var(--rose)' },
]

const STEPS = [
    { num: '01', title: 'Upload Resume', desc: 'Drop your resume and let AI parse skills, experience, and target roles.', icon: '📄' },
    { num: '02', title: 'AI Profile', desc: 'We build a dynamic profile tailored to your strengths and interview goals.', icon: '🧠' },
    { num: '03', title: 'Mock Interviews', desc: 'Practice with adaptive AI interviewers across behavioral and technical rounds.', icon: '🎙️' },
    { num: '04', title: 'Feedback & Improve', desc: 'Get instant scores, detailed feedback, and a personalized improvement plan.', icon: '📈' },
]

/* ── Mock UI components ────────────────────────────────── */
function MockHeroUI() {
    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '20px 0' }}>
            {/* Main IDE Window */}
            <div style={{ background: 'var(--bg-1)', borderRadius: 16, border: '1px solid var(--border-md)', boxShadow: '0 24px 48px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {/* OS Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', boxShadow: '0 0 4px #ff5f57' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', boxShadow: '0 0 4px #febc2e' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', boxShadow: '0 0 4px #28c840' }} />
                    <span style={{ flex: 1 }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-1)', background: 'var(--bg-3)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>useDebounce.jsx</span>
                    </div>
                </div>
                {/* Code Area */}
                <div style={{ padding: '24px 20px', fontFamily: 'Fira Code, monospace', fontSize: 13, lineHeight: 1.6, color: 'var(--text-0)' }}>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>1</span>
                        <span><span style={{ color: 'var(--accent)' }}>import</span> {'{'} useState, useEffect {'}'} <span style={{ color: 'var(--accent)' }}>from</span> <span style={{ color: 'var(--sky)' }}>'react'</span>;</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>2</span>
                        <span></span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>3</span>
                        <span><span style={{ color: 'var(--accent)' }}>export function</span> <span style={{ color: 'var(--emerald)' }}>useDebounce</span>(value, delay) {'{'}</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>4</span>
                        <span>&nbsp;&nbsp;<span style={{ color: 'var(--accent)' }}>const</span> [dbVal, setDbVal] = <span style={{ color: 'var(--emerald)' }}>useState</span>(value);</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>5</span>
                        <span>&nbsp;&nbsp;</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>6</span>
                        <span>&nbsp;&nbsp;<span style={{ color: 'var(--emerald)' }}>useEffect</span>(() <span style={{ color: 'var(--accent)' }}>{'=>'}</span> {'{'}</span>
                    </div>
                    <div style={{ display: 'flex', background: 'var(--accent-dim)', boxShadow: 'inset 2px 0 0 var(--accent)' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>7</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: 'var(--accent)' }}>const</span> timer = <span style={{ color: 'var(--emerald)' }}>setTimeout</span>(() <span style={{ color: 'var(--accent)' }}>{'=>'}</span> <span style={{ color: 'var(--emerald)' }}>setDbVal</span>(value), delay);</span>
                    </div>
                    <div style={{ display: 'flex', background: 'var(--accent-dim)', boxShadow: 'inset 2px 0 0 var(--accent)' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>8</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: 'var(--accent)' }}>return</span> () <span style={{ color: 'var(--accent)' }}>{'=>'}</span> <span style={{ color: 'var(--emerald)' }}>clearTimeout</span>(timer);<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ display: 'inline-block', width: 8, height: 16, background: 'var(--accent)', verticalAlign: 'middle', marginLeft: 4 }} /></span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>9</span>
                        <span>&nbsp;&nbsp;{'}'}, [value, delay]);</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>10</span>
                        <span>&nbsp;&nbsp;</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>11</span>
                        <span>&nbsp;&nbsp;<span style={{ color: 'var(--accent)' }}>return</span> dbVal;</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ color: 'var(--text-2)', userSelect: 'none', width: 24, textAlign: 'right', paddingRight: 10 }}>12</span>
                        <span>{'}'}</span>
                    </div>
                </div>
            </div>

            {/* AI Call Bubble */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' }}
                style={{ 
                    position: 'absolute', top: -20, right: -30, zIndex: 10, 
                    background: 'var(--bg-1)', backdropFilter: 'blur(12px)', 
                    border: '1px solid var(--border-hi)', borderRadius: 20, 
                    padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, 
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)' 
                }}
            >
                <div style={{ position: 'relative' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                    <span style={{ position: 'absolute', bottom: 2, right: -2, width: 12, height: 12, borderRadius: '50%', background: 'var(--emerald)', border: '2px solid var(--bg-1)' }}></span>
                </div>
                <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-0)' }}>AI Interviewer</div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
                        {[...Array(5)].map((_, i) => (
                            <motion.div key={i} animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }} style={{ width: 3, background: 'var(--accent)', borderRadius: 2 }} />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Success Toast */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, type: 'spring' }}
                style={{ 
                    position: 'absolute', bottom: -16, left: -40, zIndex: 10, 
                    background: 'var(--bg-1)', border: '1px solid var(--border-hi)', 
                    borderRadius: 14, padding: '14px 18px', display: 'flex', 
                    alignItems: 'flex-start', gap: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' 
                }}
            >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--emerald-dim)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
                <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--text-0)' }}>Perfect cleanup!</div>
                    <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 2, maxWidth: 180, lineHeight: 1.4 }}>You handled the unmount edge case exactly right.</div>
                </div>
            </motion.div>
        </div>
    )
}

function MockInterviewUI() {
    return (
        <div style={{ ...glassCard, padding: 0, overflow: 'hidden', width: '100%', maxWidth: 520 }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-0)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-2)' }}>interview_session.live</span>
            </div>
            {/* Chat area */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
                    <div style={{ background: 'var(--bg-2)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6, maxWidth: 360 }}>
                        Given an array of integers, find two numbers that add up to a target sum. What's your approach?
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', alignSelf: 'flex-end' }}>
                    <div style={{ background: 'rgba(255,183,3,0.12)', border: '1px solid rgba(255,183,3,0.2)', borderRadius: '12px 4px 12px 12px', padding: '10px 14px', fontSize: 13, color: 'var(--text-0)', lineHeight: 1.6, maxWidth: 300 }}>
                        I'd use a hash map for O(n) lookup...
                    </div>
                </div>
            </div>
            {/* Code editor mini */}
            <div style={{ borderTop: '1px solid var(--border)', padding: 16, background: 'var(--bg-0)' }}>
                <div style={{ fontFamily: 'Fira Code, monospace', fontSize: 11.5, lineHeight: 1.8, color: 'var(--text-1)' }}>
                    <span style={{ color: 'var(--sky)' }}>def</span> <span style={{ color: 'var(--accent)' }}>two_sum</span>(nums, target):
                    <br />&nbsp;&nbsp;seen = {'{}'}
                    <br />&nbsp;&nbsp;<span style={{ color: 'var(--sky)' }}>for</span> i, n <span style={{ color: 'var(--sky)' }}>in</span> enumerate(nums):
                    <br />&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: 'var(--sky)' }}>if</span> target - n <span style={{ color: 'var(--sky)' }}>in</span> seen:
                </div>
            </div>
        </div>
    )
}

function MockCopilotUI() {
    return (
        <div style={{ ...glassCard, padding: 0, overflow: 'hidden', width: '100%', maxWidth: 480 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-0)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-0)' }}>AI Career Copilot</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-2)' }}>online</span>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--emerald-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🧠</div>
                    <div style={{ background: 'var(--bg-2)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.65 }}>
                        Based on your resume, I recommend focusing on <span style={{ color: 'var(--accent)', fontWeight: 600 }}>system design</span> and <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>dynamic programming</span>. Your React skills are strong — let's leverage that in interviews.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--emerald-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🧠</div>
                    <div style={{ background: 'var(--bg-2)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.65 }}>
                        Here's your <span style={{ color: 'var(--sky)', fontWeight: 600 }}>2-week prep plan</span>: Week 1 — Arrays, Trees, Graphs. Week 2 — System Design + mock interviews.
                    </div>
                </div>
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg-0)' }}>
                <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)' }}>Ask about your career, prep strategy...</div>
            </div>
        </div>
    )
}

function MockAnalyticsUI() {
    const bars = [65, 78, 55, 88, 72, 92, 85]
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return (
        <div style={{ ...glassCard, padding: 24, width: '100%', maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-0)' }}>Performance Overview</span>
                <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-2)', background: 'var(--bg-3)', padding: '4px 10px', borderRadius: 6 }}>This Week</span>
            </div>
            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[{ label: 'Avg Score', value: '76%', color: 'var(--accent)' }, { label: 'Strengths', value: 'Arrays', color: 'var(--emerald)' }, { label: 'Improve', value: 'DP', color: 'var(--rose)' }].map(m => (
                    <div key={m.label} style={{ background: 'var(--bg-2)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 4 }}>{m.label}</div>
                    </div>
                ))}
            </div>
            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                {bars.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${v * 0.8}px` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            style={{ width: '100%', borderRadius: 4, background: `linear-gradient(180deg, var(--accent), var(--emerald))`, opacity: 0.7 + (v / 300) }}
                        />
                        <span style={{ fontSize: 9, color: 'var(--text-2)' }}>{labels[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── MAIN PAGE ─────────────────────────────────────────── */
export default function LandingPage({ devMode }) {
    const navigate = useNavigate()

    return (
        <div style={{ background: 'var(--bg-0)', position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* ── Background effects ──────────────────────── */}
            <div className="orb orb-amber" style={{ width: 700, height: 700, top: '-200px', left: '-120px', opacity: 0.55 }} />
            <div className="orb orb-emerald" style={{ width: 500, height: 500, bottom: '15%', right: '-100px', opacity: 0.4 }} />
            <div className="orb orb-sky" style={{ width: 400, height: 400, top: '50%', left: '40%', opacity: 0.3, animationDelay: '2s' }} />

            {/* ── Nav ─────────────────────────────────────── */}
            <motion.nav
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 20, backdropFilter: 'blur(12px)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.div
                        style={{ 
                            width: 34, height: 34, borderRadius: 10, 
                            background: 'linear-gradient(135deg, var(--accent), #ff8c00)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 900, fontSize: 13, color: 'var(--bg-0)', 
                            fontFamily: 'Outfit, sans-serif' 
                        }}
                        whileHover={{ scale: 1.1, rotate: 6 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >S</motion.div>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginTop: '-1px' }}>
                        Skili<span style={{ color: 'var(--accent)' }}>o</span>
                    </span>
                </div>
                <div>
                    {devMode ? (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-2)', fontFamily: 'Fira Code, monospace' }}>?</div>
                    ) : (
                        <>
                            <SafeSignedOut>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <SafeSignInButton mode="modal">
                                        <button style={{ background: 'none', border: 'none', fontFamily: 'Manrope, sans-serif', fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', cursor: 'pointer', padding: '6px 12px', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-0)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-1)'}
                                        >Log in</button>
                                    </SafeSignInButton>
                                    <SignUpButton mode="modal">
                                        <button style={{ background: 'var(--accent)', border: 'none', borderRadius: 8, fontFamily: 'Manrope, sans-serif', fontSize: 13.5, fontWeight: 600, color: 'var(--bg-0)', cursor: 'pointer', padding: '8px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'transform 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >Sign up</button>
                                    </SignUpButton>
                                </div>
                            </SafeSignedOut>
                            <SafeSignedIn>
                                <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} afterSignOutUrl="/" />
                            </SafeSignedIn>
                        </>
                    )}
                </div>
            </motion.nav>

            {/* ═══════════════════════════════════════════════
                SECTION 1 — HERO (split layout)
               ═══════════════════════════════════════════════ */}
            <section style={{ ...sectionPad, paddingTop: 80, paddingBottom: 80 }}>
                <div style={{ ...maxW, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
                    {/* Left — copy */}
                    <motion.div variants={stagger} initial="hidden" animate="show">
                        <motion.div variants={fadeUp}>
                            <motion.span
                                style={{ display: 'inline-block', fontFamily: 'Fira Code, monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(255,183,3,0.2)', borderRadius: 8, padding: '6px 14px', marginBottom: 24 }}
                                animate={{ boxShadow: ['0 0 0px var(--amber-glow)', '0 0 20px var(--amber-glow)', '0 0 0px var(--amber-glow)'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            >Beta — Free Access</motion.span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} style={{ fontFamily: 'Outfit, sans-serif', fontSize: 56, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 20, color: 'var(--text-0)' }}>
                            Practice Real Interviews.{' '}
                            <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--emerald) 60%, var(--sky) 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradientShift 4s ease infinite' }}>
                                Get Hired Faster.
                            </span>
                        </motion.h1>
                        <motion.p variants={fadeUp} style={{ ...bodyText, marginBottom: 32 }}>
                            Skilio simulates real technical interviews using AI, analyzes your resume for targeted prep, and provides a personal career copilot — all so you land the job you deserve.
                        </motion.p>
                        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                            <SafeSignedOut>
                                <SafeSignInButton mode="modal">
                                    <button className="btn-primary">
                                        Start Your Interview
                                        <div className="btn-primary-icon">⚡</div>
                                    </button>
                                </SafeSignInButton>
                            </SafeSignedOut>
                            <SafeSignedIn>
                                <button className="btn-primary" onClick={() => navigate('/start')}>
                                    Start Your Interview
                                    <div className="btn-primary-icon">⚡</div>
                                </button>
                            </SafeSignedIn>

                            <button className="btn-secondary" onClick={() => navigate('/resume')}>
                                <div className="upload-icon">↑</div>
                                <span>Upload Resume</span>
                            </button>
                        </motion.div>
                    </motion.div>
                    {/* Right — floating mock UI */}
                    <motion.div variants={fadeRight} initial="hidden" animate="show" style={{ display: 'flex', justifyContent: 'flex-end', transformOrigin: 'center' }}>
                        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}>
                            <MockHeroUI />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div style={sectionDivider} />

            {/* ═══════════════════════════════════════════════
                SECTION 2 — CORE FEATURES (horizontal strips)
               ═══════════════════════════════════════════════ */}
            <section id="features" style={{ ...sectionPad, background: `linear-gradient(180deg, transparent, var(--bg-1), transparent)` }}>
                <div style={maxW}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
                        <p style={labelStyle}>Core Capabilities</p>
                        <h2 style={h2Style}>Everything you need to ace interviews</h2>
                        <p style={{ ...bodyText, margin: '0 auto' }}>Four pillars that transform your interview preparation from guesswork to strategy.</p>
                    </motion.div>
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {FEATURES.map((f, i) => (
                            <motion.div key={f.title} variants={fadeUp}
                                style={{ ...glassCard, padding: '28px 28px', display: 'flex', gap: 18, alignItems: 'flex-start', cursor: 'default' }}
                                whileHover={{ y: -4, borderColor: f.color, boxShadow: `0 8px 32px ${f.color}15` }}
                                transition={{ duration: 0.25 }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
                                <div>
                                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-0)', marginBottom: 6 }}>{f.title}</h3>
                                    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-1)', margin: 0 }}>{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <div style={sectionDivider} />

            {/* ═══════════════════════════════════════════════
                SECTION 3 — HOW IT WORKS (step flow)
               ═══════════════════════════════════════════════ */}
            <section style={sectionPad}>
                <div style={maxW}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
                        <p style={labelStyle}>How It Works</p>
                        <h2 style={h2Style}>From resume to ready in four steps</h2>
                    </motion.div>
                    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
                        {/* Connector line */}
                        <div style={{ position: 'absolute', top: 36, left: '8%', right: '8%', height: 2, background: 'linear-gradient(90deg, var(--accent), var(--emerald), var(--sky), var(--rose))', opacity: 0.3, zIndex: 0 }} />
                        {STEPS.map((s, i) => (
                            <motion.div key={s.num}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}
                            >
                                <motion.div
                                    style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--bg-1)', border: '2px solid var(--border-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 18px', position: 'relative' }}
                                    whileHover={{ scale: 1.1, borderColor: 'var(--accent)', boxShadow: '0 0 24px var(--accent-glow)' }}
                                >
                                    {s.icon}
                                    <span style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-0)', fontSize: 10, fontWeight: 800, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.num}</span>
                                </motion.div>
                                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-0)', marginBottom: 6 }}>{s.title}</h4>
                                <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-2)', padding: '0 12px', margin: 0 }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <div style={sectionDivider} />

            {/* ═══════════════════════════════════════════════
                SECTION 4 — LIVE INTERVIEW SIMULATION (split)
               ═══════════════════════════════════════════════ */}
            <section style={{ ...sectionPad, background: `linear-gradient(180deg, transparent, var(--bg-1), transparent)` }}>
                <div style={{ ...maxW, display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60, alignItems: 'center' }}>
                    <motion.div variants={fadeLeft} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ transformOrigin: 'center' }}>
                        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}>
                            <MockInterviewUI />
                        </motion.div>
                    </motion.div>
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <motion.p variants={fadeUp} style={labelStyle}>Live Simulation</motion.p>
                        <motion.h2 variants={fadeUp} style={h2Style}>Interview like it's the real thing</motion.h2>
                        <motion.p variants={fadeUp} style={bodyText}>
                            Our AI interviewer asks adaptive questions, watches you code in a real editor, and provides instant feedback — just like a human interviewer at a top tech company.
                        </motion.p>
                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 24, marginTop: 28 }}>
                            {[{ val: 'Adaptive', sub: 'AI Questions' }, { val: 'Real-time', sub: 'Code Execution' }, { val: 'Instant', sub: 'Feedback' }].map(s => (
                                <div key={s.sub}>
                                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{s.val}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{s.sub}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div style={sectionDivider} />

            {/* ═══════════════════════════════════════════════
                SECTION 5 — AI COPILOT (split, reversed)
               ═══════════════════════════════════════════════ */}
            <section style={sectionPad}>
                <div style={{ ...maxW, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, alignItems: 'center' }}>
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <motion.p variants={fadeUp} style={labelStyle}>AI Career Copilot</motion.p>
                        <motion.h2 variants={fadeUp} style={h2Style}>Your personal interview coach, 24/7</motion.h2>
                        <motion.p variants={fadeUp} style={bodyText}>
                            Get personalized study plans, resume-aware career advice, and targeted prep strategies. The Copilot knows your strengths and helps you close the gaps.
                        </motion.p>
                        <motion.ul variants={fadeUp} style={{ marginTop: 24, listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {['Resume-aware career guidance', 'Custom study plans & timelines', 'Topic-specific deep dives'].map(item => (
                                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--text-1)' }}>
                                    <span style={{ color: 'var(--emerald)', fontSize: 14 }}>✓</span> {item}
                                </li>
                            ))}
                        </motion.ul>
                    </motion.div>
                    <motion.div variants={fadeRight} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ display: 'flex', justifyContent: 'flex-end', transformOrigin: 'center' }}>
                        <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}>
                            <MockCopilotUI />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div style={sectionDivider} />

            {/* ═══════════════════════════════════════════════
                SECTION 6 — ANALYTICS DASHBOARD (split)
               ═══════════════════════════════════════════════ */}
            <section style={{ ...sectionPad, background: `linear-gradient(180deg, transparent, var(--bg-1), transparent)` }}>
                <div style={{ ...maxW, display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60, alignItems: 'center' }}>
                    <motion.div variants={fadeLeft} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ transformOrigin: 'center' }}>
                        <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}>
                            <MockAnalyticsUI />
                        </motion.div>
                    </motion.div>
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <motion.p variants={fadeUp} style={labelStyle}>Performance Analytics</motion.p>
                        <motion.h2 variants={fadeUp} style={h2Style}>Track every dimension of your growth</motion.h2>
                        <motion.p variants={fadeUp} style={bodyText}>
                            Visualize your progress with score trends, topic heatmaps, and strength/weakness analysis. Know exactly where to focus your time for maximum improvement.
                        </motion.p>
                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
                            {['Score Trends', 'Topic Heatmaps', 'Strengths Analysis', 'Improvement Plan'].map(tag => (
                                <span key={tag} style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, padding: '6px 14px', borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{tag}</span>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div style={sectionDivider} />

            {/* ═══════════════════════════════════════════════
                SECTION 7 — FINAL CTA
               ═══════════════════════════════════════════════ */}
            <section style={{ ...sectionPad, paddingBottom: 80 }}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', ...glassCard, padding: '56px 48px', position: 'relative', overflow: 'hidden' }}
                >
                    <motion.div
                        style={{ position: 'absolute', inset: 0, opacity: 0.35, background: 'linear-gradient(105deg, transparent 40%, rgba(255,183,3,0.15) 50%, transparent 60%)', backgroundSize: '200% 100%' }}
                        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <h2 style={{ ...h2Style, position: 'relative', marginBottom: 12 }}>Ready to ace your next interview?</h2>
                    <p style={{ fontSize: 14.5, color: 'var(--text-1)', marginBottom: 32, position: 'relative' }}>
                        Start your first AI-powered mock interview for free. No credit card required.
                    </p>
                    <div style={{ position: 'relative' }}>
                        <SafeSignedOut>
                            <SafeSignInButton mode="modal">
                                <motion.button className="btn-amber btn-lg" whileHover={{ scale: 1.06, boxShadow: '0 0 32px var(--amber-glow)' }} whileTap={{ scale: 0.97 }}>
                                    🚀 Start Your First Interview →
                                </motion.button>
                            </SafeSignInButton>
                        </SafeSignedOut>
                        <SafeSignedIn>
                            <motion.button className="btn-amber btn-lg" onClick={() => navigate('/start')} whileHover={{ scale: 1.06, boxShadow: '0 0 32px var(--amber-glow)' }} whileTap={{ scale: 0.97 }}>
                                🚀 Launch AI Interview →
                            </motion.button>
                        </SafeSignedIn>
                    </div>
                </motion.div>
            </section>

            <Footer style={{ position: 'relative', zIndex: 10 }} />
        </div>
    )
}
