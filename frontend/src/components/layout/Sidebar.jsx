import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { motion } from 'framer-motion'
import { useSubscription } from '../../hooks/useSubscription.js'
import PlanBadge from '../subscription/PlanBadge.jsx'

const NAV = [
    { path: '/dashboard', label: 'Dashboard', icon: DashIcon },
    { path: '/resume', label: 'Resume', icon: ResumeIcon },
    { path: '/start', label: 'Interview', icon: InterviewIcon },
    { path: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
    { path: '/sheets', label: 'Topic Sheets', icon: SheetsIcon },
    { path: '/copilot', label: 'AI Copilot', icon: CopilotIcon },
    { path: '/pricing', label: 'Pricing', icon: PricingIcon },
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
    const { plan, isFree } = useSubscription()

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
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg"
                        style={{
                            background: 'linear-gradient(135deg, var(--amber), var(--emerald))',
                            color: 'var(--bg-0)',
                            fontFamily: 'Outfit, sans-serif',
                        }}
                    >
                        S
                    </div>
                    <span
                        className="font-bold text-xl tracking-tight"
                        style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-0)' }}
                    >
                        Skili<span style={{ color: 'var(--amber)' }}>o</span>
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

            {/* User + Plan */}
            <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {/* Plan badge + billing link */}
                <button
                    onClick={() => navigate('/settings/billing')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl mb-2"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    title="Manage billing"
                >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 600 }}>Your Plan</span>
                    <PlanBadge plan={plan} />
                </button>

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

                {isFree ? (
                    <button
                        onClick={() => navigate('/pricing')}
                        className="w-full mt-3 justify-center"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '0.5rem 1rem', borderRadius: 10,
                            background: 'var(--accent-dim)',
                            border: '1px solid rgba(255,183,3,0.25)',
                            color: 'var(--accent)',
                            fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        <ZapIcon size={13} />
                        Upgrade to Pro
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/start')}
                        className="btn-amber w-full mt-3 justify-center"
                    >
                        <PlusIcon size={14} />
                        New Interview
                    </button>
                )}
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
function PricingIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 6v2M12 16v2M8 12h8" />
            <path d="M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5c0 1.5-2.5 2.5-2.5 2.5s-2.5 1-2.5 2.5C9.5 15.88 10.62 17 12 17s2.5-1.12 2.5-2.5" />
        </svg>
    )
}
function ZapIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
        </svg>
    )
}

function SheetsIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

