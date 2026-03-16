import { Link } from 'react-router-dom'
import { Github, Linkedin } from 'lucide-react'

const hoverIn = (e) => (e.currentTarget.style.opacity = '0.5')
const hoverOut = (e) => (e.currentTarget.style.opacity = '1')

const linkStyle = {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 12.5,
    color: 'var(--text-2)',
    textDecoration: 'none',
    transition: 'opacity 0.15s',
    lineHeight: 2.2,
    display: 'block',
}

const sectionTitle = {
    fontFamily: 'Manrope, sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-1)',
    margin: '0 0 12px',
}

const PLATFORM = [
    { label: 'Problems', to: '/dashboard' },
    { label: 'Sheets', to: '/dashboard' },
    { label: 'Interview', to: '/start' },
    { label: 'Dashboard', to: '/dashboard' },
]

const RESOURCES = [
    { label: 'Blog', to: '/contact' },
    { label: 'FAQ', to: '/contact' },
]

const LEGAL = [
    { label: 'Terms', to: '/terms' },
    { label: 'Contact Support', to: '/contact' },
]

function LinkColumn({ title, links }) {
    return (
        <div>
            <p style={sectionTitle}>{title}</p>
            {links.map(({ label, to }) => (
                <Link
                    key={label}
                    to={to}
                    style={linkStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                >
                    {label}
                </Link>
            ))}
        </div>
    )
}

export default function Footer({ style = {}, className = '' }) {
    return (
        <footer
            className={className}
            style={{
                marginTop: 'auto',
                borderTop: '1px solid var(--border)',
                color: 'var(--text-2)',
                flexShrink: 0,
                ...style,
            }}
        >
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>

                {/* ── Columns ────────────────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                    gap: 60,
                    alignItems: 'start',
                }}>

                    {/* Brand */}
                    <div>
                        <p style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 20,
                            fontWeight: 800,
                            color: 'var(--text-1)',
                            margin: '0 0 10px',
                            letterSpacing: '-0.02em',
                        }}>
                            Skili<span style={{ color: 'var(--accent)' }}>o</span>
                        </p>
                        <p style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: 12.5,
                            lineHeight: 1.7,
                            color: 'var(--text-2)',
                            margin: 0,
                            maxWidth: 240,
                        }}>
                            AI-powered platform to practice coding interviews and sharpen problem-solving skills.
                        </p>
                    </div>

                    <LinkColumn title="Platform" links={PLATFORM} />
                    <LinkColumn title="Resources" links={RESOURCES} />
                    <LinkColumn title="Legal" links={LEGAL} />
                </div>

                {/* ── Bottom bar ─────────────────────────────────────── */}
                <div style={{
                    borderTop: '1px solid var(--border)',
                    marginTop: 36,
                    paddingTop: 18,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                }}>
                    <span style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: 11.5,
                        color: 'var(--text-2)',
                    }}>
                        © {new Date().getFullYear()} Skilio
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <a
                            href="https://github.com/mokshxp"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                            style={{ color: 'var(--text-2)', display: 'flex', transition: 'opacity 0.15s' }}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            <Github size={16} />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/moksh-gupta-8b7588279/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="LinkedIn"
                            style={{ color: 'var(--text-2)', display: 'flex', transition: 'opacity 0.15s' }}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            <Linkedin size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
