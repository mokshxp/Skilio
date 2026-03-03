import { createContext, useContext, useEffect } from 'react'
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/clerk-react'
import { useDevMode } from './ClerkSafeContext.jsx'
import { setupApiInterceptors } from '../services/api.js'

const AuthContext = createContext(null)

const DEV_AUTH = {
    isSignedIn: true,
    isLoaded: true,
    user: {
        firstName: 'Dev',
        emailAddresses: [{ emailAddress: 'dev@localhost' }],
    },
    getToken: async () => 'dev-token',
    signOut: (cb) => cb?.(),
}

function ClerkAuthProvider({ children }) {
    const { getToken, isSignedIn, isLoaded } = useClerkAuth()
    const { user } = useUser()
    const { signOut } = useClerk()

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            setupApiInterceptors(getToken)
        }
    }, [isLoaded, isSignedIn, getToken])

    return (
        <AuthContext.Provider value={{ isSignedIn, isLoaded, user, getToken, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

function DevAuthProvider({ children }) {
    useEffect(() => {
        setupApiInterceptors(DEV_AUTH.getToken)
    }, [])

    return (
        <AuthContext.Provider value={DEV_AUTH}>
            {children}
        </AuthContext.Provider>
    )
}

export function AuthProvider({ children }) {
    const devMode = useDevMode()
    if (devMode) return <DevAuthProvider>{children}</DevAuthProvider>
    return <ClerkAuthProvider>{children}</ClerkAuthProvider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
