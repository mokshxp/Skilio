import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SafeSignedIn, SafeSignedOut, SafeRedirectToSignIn } from './context/ClerkSafeContext.jsx'
import { InterviewProvider } from './context/InterviewContext.jsx'

// Eager load — Small, critical paths
import AppLayout from './components/layout/AppLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'

// Lazy load — Heavy pages
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ResumeUpload = lazy(() => import('./pages/ResumeUpload.jsx'))
const StartInterview = lazy(() => import('./pages/StartInterview.jsx'))
const InterviewRoom = lazy(() => import('./pages/InterviewRoom.jsx'))
const Results = lazy(() => import('./pages/Results.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const CareerCopilot = lazy(() => import('./pages/CareerCopilot.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const Pricing = lazy(() => import('./pages/Pricing.jsx'))
const Billing = lazy(() => import('./pages/Billing.jsx'))
const Sheets = lazy(() => import('./pages/Sheets.jsx'))
const SheetDetail = lazy(() => import('./pages/SheetDetail.jsx'))

// Fallback spinner using theme tokens
const PageLoader = () => (
    <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-0)',
    }}>
        <div style={{
            width: 32,
            height: 32,
            border: '3px solid var(--bg-2)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
        }} />
    </div>
)

function ProtectedRoute({ children, devMode }) {
    if (devMode) return children
    return (
        <>
            <SafeSignedIn>{children}</SafeSignedIn>
            <SafeSignedOut><SafeRedirectToSignIn /></SafeSignedOut>
        </>
    )
}

export default function App({ devMode = false }) {
    return (
        <InterviewProvider>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage devMode={devMode} />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/pricing" element={<Pricing />} />

                    {/* Interview — immersive, no TopNav */}
                    <Route
                        path="/interview/:id"
                        element={
                            <ProtectedRoute devMode={devMode}>
                                <InterviewRoom />
                            </ProtectedRoute>
                        }
                    />

                    {/* App shell — TopNav layout */}
                    <Route
                        element={
                            <ProtectedRoute devMode={devMode}>
                                <AppLayout devMode={devMode} />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/resume" element={<ResumeUpload />} />
                        <Route path="/start" element={<StartInterview />} />
                        <Route path="/results/:id" element={<Results />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/copilot" element={<CareerCopilot />} />
                        <Route path="/sheets" element={<Sheets />} />
                        <Route path="/sheets/:slug" element={<SheetDetail />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/settings/billing" element={<Billing />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </InterviewProvider>
    )
}
