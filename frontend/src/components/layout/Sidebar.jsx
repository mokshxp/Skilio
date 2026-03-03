import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { motion } from 'framer-motion'

const NAV = [
    { path: '/dashboard', label: 'Dashboard', icon: DashIcon },
    { path: '/resume', label: 'Resume', icon: ResumeIcon },
    { path: '/start', label: 'Interview', icon: InterviewIcon },
    { path: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
    { path: '/copilot', label: 'AI Copilot', icon: CopilotIcon },
]

function navLinkClass({ isActive }) {
    const base = 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative'
    return isActive
        ? `${base} text-amber bg-amber-dim border border-amber`
        : `${base} text-11 hover:text-00 hover:bg-n3`
}

export default function Sidebar() {
    const { signOut, user } = useAuth()
    const navigate = useNavigate()

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-64 flex flex-col shrink-0 border-r"
            style={{
                background: 'var(--bg-1)',
                borderColor: 'var(--border)',
                minHeight: '100vh',
            }}
        >
            {/* Logo */}
            <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2.5 group">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{
                            background: 'linear-gradient(135deg, var(--amber), var(--emerald))',
                            color: 'var(--bg-0)',
                            fontFamily: 'Outfit, sans-serif',
                        }}
                    >
                        IQ
                    </div>
                    <span
                        className="font-bold text-lg tracking-tight"
                        style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-0)' }}
                    >
                        Interview<span style={{ color: 'var(--amber)' }}>IQ</span>
                    </span>
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <p className="label px-4 mb-3">Navigation</p>
                {NAV.map((item, i) => (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.3 }}
                    >
                        <NavLink to={item.path} className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={18}
                                        style={{ color: isActive ? 'var(--amber)' : 'var(--text-2)' }}
                                    />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute right-3 w-1.5 h-1.5 rounded-full"
                                            style={{ background: 'var(--amber)' }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    </motion.div>
                ))}
            </nav>

            {/* User */}
            <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--amber), var(--emerald))', color: 'var(--bg-0)' }}
                    >
                        {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-0)', fontFamily: 'Outfit, sans-serif' }}>
                            {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-2)' }}>
                            {user?.emailAddresses?.[0]?.emailAddress || 'No email'}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut(() => navigate('/'))}
                        title="Sign out"
                        className="shrink-0 p-1 rounded-lg transition-colors"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--rose)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
                    >
                        <SignOutIcon size={15} />
                    </button>
                </div>

                <button
                    onClick={() => navigate('/start')}
                    className="btn-amber w-full mt-3 justify-center"
                >
                    <PlusIcon size={14} />
                    New Interview
                </button>
            </div>
        </motion.aside>
    )
}

// ── Inline SVG Icons ─────────────────────────────────────────
function DashIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    )
}
function ResumeIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" />
        </svg>
    )
}
function InterviewIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16 10,8" />
        </svg>
    )
}
function AnalyticsIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
        </svg>
    )
}
function CopilotIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
            <path d="M12 6v6l4 2" />
        </svg>
    )
}
function SignOutIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    )
}
function PlusIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}
