import { useNavigate } from 'react-router-dom'
import { SafeSignedIn, SafeSignedOut, SafeSignInButton } from '../context/ClerkSafeContext.jsx'
import { SignUpButton, UserButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import Footer from '../components/layout/Footer.jsx'

const CORE_FEATURES = [
    { icon: '🎯', title: 'Adaptive AI Questions', desc: 'Questions that evolve based on your answers and resume.' },
    { icon: '💻', title: 'Live Coding Environment', desc: 'Monaco Editor with real-time code execution and test cases.' },
    { icon: '⚡', title: 'Real-time Feedback', desc: 'Instant AI scoring and improvement tips after each answer.' },
]

const INTEL_FEATURES = [
    { icon: '📊', title: 'Deep Analytics', desc: 'Score trends, heatmaps, and topic-level breakdown.' },
    { icon: '🤖', title: 'AI Career Copilot', desc: 'Your 24/7 mentor for study plans, feedback, and prep.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'Clerk-powered auth — your data is always safe.' },
]

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
}
const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function FeatureGroup({ label, features, startIndex }) {
    return (
        <div style={{ marginTop: 40 }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}
            >
                <h3 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-2)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    margin: 0,
                    whiteSpace: 'nowrap',
                }}>
                    {label}
                </h3>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </motion.div>

            <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
            >
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        variants={item}
                        style={{
                            background: 'var(--bg-1)',
                            border: '1px solid var(--border)',
                            borderRadius: 14,
                            padding: '26px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                            cursor: 'default',
                        }}
                        whileHover={{
                            y: -5,
                            boxShadow: '0 10px 32px rgba(0,0,0,0.10)',
                            borderColor: 'var(--border-md)',
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                background: 'var(--bg-0)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 19,
                                flexShrink: 0,
                            }}
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2.5 + (startIndex + i) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            {f.icon}
                        </motion.div>
                        <div>
                            <h3 style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: 15,
                                fontWeight: 700,
                                color: 'var(--text-0)',
                                letterSpacing: '-0.01em',
                                marginBottom: 5,
                            }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-1)', margin: 0 }}>
                                {f.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}

export default function LandingPage({ devMode }) {
    const navigate = useNavigate()


    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: 'var(--bg-0)',
                position: 'relative',
            }}
        >
            {/* Animated background orbs */}
            <div className="orb orb-amber" style={{ width: 600, height: 600, top: '-180px', left: '-100px', opacity: 0.7 }} />
            <div className="orb orb-emerald" style={{ width: 500, height: 500, bottom: '10%', right: '-80px', opacity: 0.6 }} />
            <div className="orb orb-sky" style={{ width: 350, height: 350, top: '35%', left: '55%', opacity: 0.5, animationDelay: '1.5s' }} />

            {/* Moving dot grid overlay */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />

            {/* Nav */}
            <motion.nav
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="flex items-center justify-between px-8 py-5"
                style={{ borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 10, backdropFilter: 'blur(8px)' }}
            >
                <div className="flex items-center gap-2.5">
                    <motion.div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, var(--amber), var(--emerald))', color: 'var(--bg-0)', fontFamily: 'Outfit, sans-serif' }}
                        whileHover={{ scale: 1.1, rotate: 6 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                        S
                    </motion.div>
                    <span className="font-bold text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Skili<span style={{ color: 'var(--amber)' }}>o</span>
                    </span>
                </div>
                <div>
                    {devMode ? (
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--bg-3)', border: '1px solid var(--border-md)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, color: 'var(--text-2)', fontFamily: 'Fira Code, monospace',
                        }}>?</div>
                    ) : (
                        <>
                            <SafeSignedOut>
                                <div className="flex items-center gap-4">
                                    <SafeSignInButton mode="modal">
                                        <button style={{
                                            background: 'none', border: 'none',
                                            fontFamily: 'Manrope, sans-serif', fontSize: 13.5, fontWeight: 600,
                                            color: 'var(--text-1)', cursor: 'pointer', padding: '6px 12px',
                                            transition: 'color 0.2s', letterSpacing: '-0.01em'
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-0)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-1)'}
                                        >
                                            Log in
                                        </button>
                                    </SafeSignInButton>
                                    <SignUpButton mode="modal">
                                        <button style={{
                                            background: 'var(--accent)', border: 'none', borderRadius: 6,
                                            fontFamily: 'Manrope, sans-serif', fontSize: 13.5, fontWeight: 600,
                                            color: 'var(--bg-0)', cursor: 'pointer', padding: '6px 14px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.1s, box-shadow 0.2s',
                                            letterSpacing: '-0.01em'
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-1px)'
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)'
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            Sign up
                                        </button>
                                    </SignUpButton>
                                </div>
                            </SafeSignedOut>
                            <SafeSignedIn>
                                <div className="flex items-center gap-4">
                                    <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} afterSignOutUrl="/" />
                                </div>
                            </SafeSignedIn>
                        </>
                    )}
                </div>
            </motion.nav>

            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-8" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-center gap-4 max-w-5xl"
                >
                    <motion.div variants={item}>
                        <motion.span
                            className="badge-amber text-sm px-4 py-2"
                            animate={{ boxShadow: ['0 0 0px var(--amber-glow)', '0 0 18px var(--amber-glow)', '0 0 0px var(--amber-glow)'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            Beta — Free to use
                        </motion.span>
                    </motion.div>

                    <motion.h1
                        variants={item}
                        className="headline text-6xl md:text-8xl leading-none"
                    >
                        Ace Your Next<br />
                        <span
                            className="gradient-text"
                            style={{
                                background: 'linear-gradient(135deg, var(--amber) 0%, var(--emerald) 60%, var(--sky) 100%)',
                                backgroundSize: '200% 200%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'gradientShift 4s ease infinite',
                            }}
                        >
                            Technical Interview
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={item}
                        className="text-lg max-w-xl leading-relaxed"
                        style={{ color: 'var(--text-1)' }}
                    >
                        AI-powered mock interviews with adaptive questions, live coding environment,
                        real-time feedback, and a personal career copilot.
                    </motion.p>

                    <motion.div variants={item} className="flex gap-4 flex-wrap justify-center">
                        <SafeSignedOut>
                            <SafeSignInButton mode="modal">
                                <motion.button
                                    className="btn-amber btn-lg ripple-btn"
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 32px var(--amber-glow), 0 8px 24px rgba(0,0,0,0.2)' }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span>🚀</span> Start Free Interview
                                </motion.button>
                            </SafeSignInButton>
                        </SafeSignedOut>
                        <SafeSignedIn>
                            <motion.button
                                className="btn-amber btn-lg ripple-btn"
                                onClick={() => navigate('/dashboard')}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 32px var(--amber-glow), 0 8px 24px rgba(0,0,0,0.2)' }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span>🚀</span> Go to Dashboard
                            </motion.button>
                        </SafeSignedIn>
                        <motion.button
                            className="btn-outline btn-lg"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            whileHover={{ scale: 1.03, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                            whileTap={{ scale: 0.97 }}
                        >
                            See Features
                        </motion.button>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div variants={item} className="flex gap-8 mt-2">
                        {[
                            { val: '10+', label: 'Interview Rounds' },
                            { val: 'AI', label: 'Powered Feedback' },
                            { val: '∞', label: 'Practice Sessions' },
                        ].map((s, i) => (
                            <motion.div
                                key={s.label}
                                className="text-center"
                                whileHover={{ scale: 1.08, y: -3 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            >
                                <p className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--amber)' }}>{s.val}</p>
                                <p className="text-xs" style={{ color: 'var(--text-2)' }}>{s.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Top divider */}
            <div style={{ height: 1, background: 'var(--border)', margin: '0 24px', position: 'relative', zIndex: 10 }} />

            {/* Features */}
            <section id="features" style={{ position: 'relative', zIndex: 10, padding: '56px 24px 64px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                    {/* Section header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45 }}
                        style={{ textAlign: 'center', marginBottom: 52 }}
                    >
                        <p style={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                            marginBottom: 14,
                        }}>
                            Platform Capabilities
                        </p>
                        <h2 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 32,
                            fontWeight: 800,
                            color: 'var(--text-0)',
                            letterSpacing: '-0.02em',
                            marginBottom: 12,
                        }}>
                            Everything you need to master interviews
                        </h2>
                        <p style={{ fontSize: 14.5, color: 'var(--text-1)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
                            Designed for engineers who want structured, adaptive, and realistic preparation.
                        </p>
                    </motion.div>

                    {/* Group 1 — Core Interview Engine */}
                    <FeatureGroup label="Core Interview Engine" features={CORE_FEATURES} startIndex={0} />

                    {/* Group 2 — Intelligence Layer */}
                    <FeatureGroup label="Intelligence Layer" features={INTEL_FEATURES} startIndex={3} />

                </div>
            </section>

            {/* Bottom divider */}
            <div style={{ height: 1, background: 'var(--border)', margin: '0 24px 56px', position: 'relative', zIndex: 10 }} />

            {/* CTA Footer */}
            <section className="text-center px-6 pb-10" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="card-amber inline-flex flex-col items-center gap-4 px-10 py-8"
                    style={{ position: 'relative', overflow: 'hidden' }}
                >
                    {/* Shimmer sweep effect */}
                    <motion.div
                        style={{
                            position: 'absolute', inset: 0, opacity: 0.4,
                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,183,3,0.18) 50%, transparent 60%)',
                            backgroundSize: '200% 100%',
                        }}
                        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <h2 className="headline text-3xl" style={{ position: 'relative' }}>Ready to level up?</h2>
                    <p className="text-sm" style={{ color: 'var(--text-1)', position: 'relative' }}>Start your first AI-powered interview for free.</p>
                    <div style={{ position: 'relative' }}>
                        <SafeSignedOut>
                            <SafeSignInButton mode="modal">
                                <motion.button
                                    className="btn-amber btn-lg"
                                    whileHover={{ scale: 1.06, boxShadow: '0 0 32px var(--amber-glow)' }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    Get Started Free →
                                </motion.button>
                            </SafeSignInButton>
                        </SafeSignedOut>
                        <SafeSignedIn>
                            <motion.button
                                className="btn-amber btn-lg"
                                onClick={() => navigate('/start')}
                                whileHover={{ scale: 1.06, boxShadow: '0 0 32px var(--amber-glow)' }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Launch AI Interview Engine →
                            </motion.button>
                        </SafeSignedIn>
                    </div>
                </motion.div>
            </section>

            <Footer style={{ position: 'relative', zIndex: 10 }} />
        </div>
    )
}
