import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopNav from './TopNav.jsx'
import Footer from './Footer.jsx'

export default function AppLayout({ devMode = false }) {
    const location = useLocation()

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-0)' }}>
            <TopNav devMode={devMode} />
            <motion.main
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                    flex: 1,
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '48px 32px 80px',
                    width: '100%',
                }}
            >
                <Outlet />
            </motion.main>
            <Footer />
        </div>
    )
}
