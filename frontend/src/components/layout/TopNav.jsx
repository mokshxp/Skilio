import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { UserButton, SignUpButton } from '@clerk/clerk-react'
import { SafeSignInButton, SafeSignedOut, SafeSignedIn } from '../../context/ClerkSafeContext.jsx'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useSubscription } from '../../hooks/useSubscription.js'
import PlanBadge from '../subscription/PlanBadge.jsx'

const NAV_LINKS = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/resume', label: 'Resume' },
    { to: '/start', label: 'Interview' },
    { to: '/sheets', label: 'Sheets' },
    { to: '/copilot', label: 'Copilot' },
    { to: '/analytics', label: 'Analytics' },
]

const THEME_OPTIONS = [
    { id: 'ivory', label: 'Ivory', color: '#F6F2EA' },
    { id: 'midnight', label: 'Midnight', color: '#121722' },
    { id: 'carbon', label: 'Carbon', color: '#1b1b1b' },
]

function ThemeSwitcher() {
    const [open, setOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 10px',
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    color: 'var(--text-2)',
                }}
                title="Switch theme"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: THEME_OPTIONS.find(t => t.id === theme)?.color || '#F6F2EA',
                    border: '1.5px solid var(--border)',
                    flexShrink: 0,
                }}/>
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div 
                            style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                            onClick={() => setOpen(false)} 
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                zIndex: 50,
                                background: 'var(--bg-1)',
                                border: '1px solid var(--border)',
                                borderRadius: '14px',
                                padding: '8px',
                                minWidth: '170px',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                display: 'flex', flexDirection: 'column', gap: '2px',
                            }}
                        >
                            <div style={{
                                fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.1em', color: 'var(--text-2)',
                                padding: '6px 10px 10px',
                            }}>Appearance</div>
                            
                            {THEME_OPTIONS.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setTheme(t.id); setOpen(false) }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 12px', borderRadius: '10px',
                                        border: 'none', cursor: 'pointer',
                                        width: '100%', textAlign: 'left',
                                        fontSize: '13px', fontWeight: theme === t.id ? 600 : 500,
                                        background: theme === t.id ? 'var(--bg-2)' : 'transparent',
                                        color: theme === t.id ? 'var(--text-0)' : 'var(--text-2)',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: t.color,
                                        border: theme === t.id ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                                        transition: 'border 0.2s',
                                    }}/>
                                    {t.label}
                                    {theme === t.id && (
                                        <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '14px' }}>✓</span>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function TopNav({ devMode }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()
    const { plan, isFree } = useSubscription()
    const { pathname } = useLocation()

    return (
        <>
        <header className="skilio-nav">
            <div className="skilio-nav-inner">
                
                {/* LEFT: Logo */}
                <div 
                    onClick={() => navigate('/')}
                    className="skilio-nav-logo"
                >
                    <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: 'linear-gradient(135deg, #C4501A, #ff8c00)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900, color: '#fff',
                    }}>S</div>
                    <span className="skilio-nav-logo-text">
                        Skilio
                    </span>
                </div>

                {/* CENTER: Nav Links */}
                <nav className="skilio-nav-links">
                    {NAV_LINKS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `skilio-nav-link ${isActive ? 'active' : ''}`}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* RIGHT SECTION */}
                <div className="skilio-nav-right">
                    
                    {/* Plan label — subtitle text */}
                    <span className="skilio-nav-plan">
                        {plan === 'free' ? 'Free' : plan}
                    </span>

                    {/* Theme switcher */}
                    <ThemeSwitcher />


                    {/* Upgrade — prominent CTA */}
                    {isFree && (
                        <button 
                            onClick={() => navigate('/pricing')}
                            className="skilio-nav-upgrade"
                        >
                            ⚡ Upgrade
                        </button>
                    )}

                    {/* Avatar / Auth */}
                    <div className="skilio-nav-avatar">
                        <SafeSignedOut>
                            <SafeSignInButton mode="modal">
                                <button style={{
                                    background: 'transparent', border: 'none',
                                    fontSize: '13.5px', fontWeight: 600,
                                    color: 'var(--text-1)', cursor: 'pointer'
                                }}>
                                    Log in
                                </button>
                            </SafeSignInButton>
                        </SafeSignedOut>
                        
                        <SafeSignedIn>
                            <UserButton 
                                appearance={{ 
                                    elements: { 
                                        avatarBox: { width: 32, height: 32, borderRadius: 10 } 
                                    } 
                                }} 
                                afterSignOutUrl="/" 
                            />
                        </SafeSignedIn>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden ml-2"
                        onClick={() => setMobileOpen(o => !o)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-1)' }}
                    >
                        <HamburgerIcon open={mobileOpen} />
                    </button>
                </div>
            </div>
        </header>


            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-nav"
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
                            background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '12px 0',
                        }}
                    >
                        {NAV_LINKS.map(({ to, label }) => (
                            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>
                                {({ isActive }) => (
                                    <div style={{
                                        padding: '10px 32px', fontFamily: 'Manrope, sans-serif', fontSize: 14,
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? 'var(--accent)' : 'var(--text-1)',
                                        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                                    }}>
                                        {label}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

function HamburgerIcon({ open }) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {open
                ? <><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></>
                : <><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" /></>}
        </svg>
    )
}
