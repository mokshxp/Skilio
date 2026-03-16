import { NavLink, useNavigate } from 'react-router-dom'
import { UserButton, SignUpButton } from '@clerk/clerk-react'
import { SafeSignInButton, SafeSignedOut, SafeSignedIn } from '../../context/ClerkSafeContext.jsx'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext.jsx'

const NAV_LINKS = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/resume', label: 'Resume' },
    { to: '/start', label: 'Interview' },
    { to: '/copilot', label: 'Copilot' },
    { to: '/analytics', label: 'Analytics' },
]

const THEMES = ['midnight', 'ivory', 'carbon']
const THEME_LABELS = { midnight: 'Mid', ivory: 'Ivo', carbon: 'Car' }

export default function TopNav({ devMode }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()

    return (
        <>
            <header style={{
                height: 64,
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-0)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                transition: 'background 0.3s ease, border-color 0.3s ease',
            }}>
                <div style={{
                    maxWidth: 1400, margin: '0 auto', padding: '0 32px',
                    height: '100%', display: 'flex', alignItems: 'center', gap: 32,
                }}>
                    {/* Logo */}
                    <button
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    >
                        <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: 'linear-gradient(135deg, var(--accent), var(--emerald))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 800, color: '#fff',
                            fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em',
                        }}>S</div>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
                            Skili<span style={{ color: 'var(--accent)' }}>o</span>
                        </span>
                    </button>

                    {/* Center Nav */}
                    <nav className="hidden-mobile" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        {NAV_LINKS.map(({ to, label }) => (
                            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                                {({ isActive }) => (
                                    <div style={{ position: 'relative', padding: '6px 14px' }}>
                                        <span style={{
                                            fontFamily: 'Manrope, sans-serif', fontSize: 13.5,
                                            fontWeight: isActive ? 600 : 400,
                                            color: isActive ? 'var(--text-0)' : 'var(--text-2)',
                                            transition: 'color 0.15s',
                                            letterSpacing: '-0.01em',
                                        }}>
                                            {label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-underline"
                                                style={{
                                                    position: 'absolute', bottom: 0, left: 14, right: 14,
                                                    height: 1.5, borderRadius: 2,
                                                    background: 'var(--accent)',
                                                }}
                                                transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                                            />
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>

                        {/* Theme Toggle — segmented */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            background: 'var(--bg-2)', border: '1px solid var(--border-md)',
                            borderRadius: 20, padding: 3, gap: 2,
                            transition: 'background 0.3s ease',
                        }}>
                            {THEMES.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    title={t === 'midnight' ? 'Midnight Lab' : t === 'ivory' ? 'Ivory Editorial' : 'Carbon Terminal'}
                                    style={{
                                        padding: '3px 9px', borderRadius: 14,
                                        border: 'none', cursor: 'pointer',
                                        fontFamily: 'Fira Code, monospace', fontSize: 10.5,
                                        fontWeight: theme === t ? 600 : 400,
                                        background: theme === t ? 'var(--accent)' : 'transparent',
                                        color: theme === t ? 'var(--bg-0)' : 'var(--text-2)',
                                        transition: 'all 0.2s ease',
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {THEME_LABELS[t]}
                                </button>
                            ))}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="visible-mobile"
                            onClick={() => setMobileOpen(o => !o)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-1)' }}
                        >
                            <HamburgerIcon open={mobileOpen} />
                        </button>

                        {/* User */}
                        {devMode ? (
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'var(--bg-3)', border: '1px solid var(--border-md)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, color: 'var(--text-2)', fontFamily: 'Fira Code, monospace',
                            }}>?</div>
                        ) : (
                            <>
                                <SafeSignedOut>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                                    <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} afterSignOutUrl="/" />
                                </SafeSignedIn>
                            </>
                        )}
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
