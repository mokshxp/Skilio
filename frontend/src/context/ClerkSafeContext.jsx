import { createContext, useContext } from 'react'
import {
    SignedIn,
    SignedOut,
    SignInButton,
    RedirectToSignIn,
} from '@clerk/clerk-react'

// ─── Context ─────────────────────────────────────────────────────────────────
const DevModeContext = createContext(false)

export function DevModeProvider({ children, devMode = false }) {
    return (
        <DevModeContext.Provider value={devMode}>
            {children}
        </DevModeContext.Provider>
    )
}

export const useDevMode = () => useContext(DevModeContext)

// ─── Safe Clerk component stubs ───────────────────────────────────────────────

/** Shows children when signed in. In dev mode: always shows children. */
export function SafeSignedIn({ children }) {
    const devMode = useDevMode()
    if (devMode) return <>{children}</>
    return <SignedIn>{children}</SignedIn>
}

/** Shows children when signed out. In dev mode: never shows (user is "logged in"). */
export function SafeSignedOut({ children }) {
    const devMode = useDevMode()
    if (devMode) return null
    return <SignedOut>{children}</SignedOut>
}

/** Wraps children in SignInButton. In dev mode: renders children as-is. */
export function SafeSignInButton({ children, mode = 'modal' }) {
    const devMode = useDevMode()
    if (devMode) return <>{children}</>
    return <SignInButton mode={mode}>{children}</SignInButton>
}

/** Redirects to sign-in. In dev mode: no-op. */
export function SafeRedirectToSignIn() {
    const devMode = useDevMode()
    if (devMode) return null
    return <RedirectToSignIn />
}
