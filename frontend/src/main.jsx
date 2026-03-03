import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { DevModeProvider } from './context/ClerkSafeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// A real Clerk key starts with "pk_test_" or "pk_live_" and is ≥ 40 chars
const isValidClerkKey = (k) =>
    typeof k === 'string' && (k.startsWith('pk_test_') || k.startsWith('pk_live_')) && k.length > 40

// Use a lazy async wrapper to support the dynamic import
async function renderApp() {
    const { ClerkProvider } = isValidClerkKey(PUBLISHABLE_KEY)
        ? await import('@clerk/clerk-react')
        : { ClerkProvider: null }

    const root = ReactDOM.createRoot(document.getElementById('root'))

    if (!isValidClerkKey(PUBLISHABLE_KEY)) {
        console.warn(
            '[InterviewIQ] No valid Clerk key detected — running in Dev Mode (auth disabled).\n' +
            'Add VITE_CLERK_PUBLISHABLE_KEY to your .env to enable authentication.'
        )
        root.render(
            <DevModeProvider devMode>
                <ThemeProvider>
                    <BrowserRouter>
                        <AuthProvider>
                            <DevModeBanner />
                            <App devMode />
                        </AuthProvider>
                    </BrowserRouter>
                </ThemeProvider>
            </DevModeProvider>
        )
    } else {
        root.render(
            <DevModeProvider devMode={false}>
                <ThemeProvider>
                    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
                        <BrowserRouter>
                            <AuthProvider>
                                <App />
                            </AuthProvider>
                        </BrowserRouter>
                    </ClerkProvider>
                </ThemeProvider>
            </DevModeProvider>
        )
    }
}

function DevModeBanner() {
    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                background: 'rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(245,158,11,0.4)',
                padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'Manrope, sans-serif', fontSize: 13,
            }}
        >
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>⚠ Dev Mode</span>
            <span style={{ color: '#94A3B8' }}>
                Auth disabled — add{' '}
                <code style={{ fontFamily: 'Fira Code, monospace', color: '#F59E0B' }}>
                    VITE_CLERK_PUBLISHABLE_KEY
                </code>{' '}
                to <code style={{ fontFamily: 'Fira Code, monospace', color: '#F59E0B' }}>.env</code> to enable login.
            </span>
            <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: 'auto', color: '#F59E0B', fontWeight: 600, textDecoration: 'none' }}
            >
                Get Key →
            </a>
        </div>
    )
}

renderApp()
