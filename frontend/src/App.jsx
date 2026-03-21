import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { SafeSignedIn, SafeSignedOut, SafeRedirectToSignIn } from './context/ClerkSafeContext.jsx'
import { InterviewProvider } from './context/InterviewContext.jsx'

import AppLayout from './components/layout/AppLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ResumeUpload from './pages/ResumeUpload.jsx'
import StartInterview from './pages/StartInterview.jsx'
import InterviewRoom from './pages/InterviewRoom.jsx'
import Results from './pages/Results.jsx'
import Analytics from './pages/Analytics.jsx'
import CareerCopilot from './pages/CareerCopilot.jsx'
import Contact from './pages/Contact.jsx'
import Terms from './pages/Terms.jsx'
import Pricing from './pages/Pricing.jsx'
import Billing from './pages/Billing.jsx'
import Sheets from './pages/Sheets.jsx'
import SheetDetail from './pages/SheetDetail.jsx'

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
        </InterviewProvider>
    )
}
