import { Link } from 'react-router-dom'
import { Github, Linkedin } from 'lucide-react'

export default function Footer({ style = {}, className = '' }) {
    return (
        <footer
            className={className}
            style={{
                borderTop: '1px solid var(--border)',
                color: 'var(--text-2)',
                fontSize: '0.75rem',
                padding: '14px 32px',
                flexShrink: 0,
                ...style,
            }}
        >
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
            }}>
                {/* Left — branding */}
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: 'var(--text-1)' }}>
                    Interview<span style={{ color: 'var(--accent)' }}>IQ</span>
                </span>

                {/* Center — links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <Link
                        to="/terms"
                        style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        Terms
                    </Link>
                    <Link
                        to="/contact"
                        style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        Contact Support
                    </Link>
                </div>

                {/* Right — socials + copyright */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <a
                        href="https://github.com/mokshxp"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--text-2)', display: 'flex', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <Github size={16} />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/moksh-gupta-8b7588279/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--text-2)', display: 'flex', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <Linkedin size={16} />
                    </a>
                    <span style={{ marginLeft: 4 }}>
                        © {new Date().getFullYear()} InterviewIQ
                    </span>
                </div>
            </div>
        </footer>
    )
}
