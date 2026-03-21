import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react'

const PLATFORM = [
    { label: 'Interview Guide', to: '/start' },
    { label: 'Resume Analysis', to: '/resume' },
    { label: 'Topic Sheets', to: '/sheets' },
    { label: 'Dashboard', to: '/dashboard' },
]

const RESOURCES = [
    { label: 'Prep Roadmap', to: '/sheets' },
    { label: 'AI Documentation', to: '#' },
    { label: 'FAQ', to: '/contact' },
    { label: 'Support', to: '/contact' },
]

/**
 * Custom X (formerly Twitter) Brand Icon
 */
function XIcon({ size = 16, className = "" }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={className}
        >
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z" />
        </svg>
    )
}

function FooterLink({ to, children }) {
    return (
        <Link 
            to={to} 
            className="text-[var(--text-2)] hover:text-[var(--text-0)] transition-all duration-200 text-[13px] leading-6 block font-medium hover:translate-x-1"
        >
            {children}
        </Link>
    )
}

export default function Footer({ className = "" }) {
    return (
        <footer className={`relative border-t border-[var(--border)] bg-[var(--bg-0)] overflow-hidden ${className}`}>
            <div className="max-w-[1200px] mx-auto px-8 py-10 sm:py-14 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    
                    {/* Brand Column */}
                    <div className="flex flex-col">
                        <Link to="/" className="inline-block mb-4">
                            <span className="font-['Outfit'] text-[22px] font-extrabold tracking-tighter text-[var(--text-0)]">
                                Skili<span className="text-[var(--accent)]">o</span>
                            </span>
                        </Link>
                        <p className="text-[var(--text-2)] text-[13px] leading-relaxed max-w-[240px] font-medium opacity-80 mb-6">
                            Master your interviews with AI-powered sessions and personalized roadmaps.
                        </p>
                        <div className="mt-auto">
                            <p className="text-[var(--text-2)] text-[10.5px] font-bold uppercase tracking-widest opacity-40">
                                © {new Date().getFullYear()} Skilio
                            </p>
                        </div>
                    </div>

                    {/* Platform Column */}
                    <div>
                        <h4 className="font-['Outfit'] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-0)] mb-5 opacity-80">
                            Platform
                        </h4>
                        <nav className="flex flex-col gap-0.5">
                            {PLATFORM.map((link) => (
                                <FooterLink key={link.label} to={link.to}>
                                    {link.label}
                                </FooterLink>
                            ))}
                        </nav>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="font-['Outfit'] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-0)] mb-5 opacity-80">
                            Resources
                        </h4>
                        <nav className="flex flex-col gap-0.5">
                            {RESOURCES.map((link) => (
                                <FooterLink key={link.label} to={link.to}>
                                    {link.label}
                                </FooterLink>
                            ))}
                        </nav>
                    </div>

                    {/* Connect Column */}
                    <div className="flex flex-col">
                        <h4 className="font-['Outfit'] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-0)] mb-5 opacity-80">
                            Connect
                        </h4>
                        
                        <div className="flex items-center gap-2.5 mb-5">
                            <a href="https://github.com/mokshxp" target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 text-[var(--text-2)] hover:text-[var(--text-0)] bg-[var(--bg-2)] border border-[var(--border)] rounded-lg transition-all" aria-label="GitHub">
                                <Github size={16} />
                            </a>
                            <a href="https://x.com/ezmoksh" target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 text-[var(--text-2)] hover:text-[var(--text-0)] bg-[var(--bg-2)] border border-[var(--border)] rounded-lg transition-all" aria-label="X (Twitter)">
                                <XIcon size={14} />
                            </a>
                            <a href="https://linkedin.com/in/moksh-gupta-8b7588279/" target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 text-[var(--text-2)] hover:text-[#0A66C2] bg-[var(--bg-2)] border border-[var(--border)] rounded-lg transition-all" aria-label="LinkedIn">
                                <Linkedin size={16} />
                            </a>
                            <a href="mailto:hello@skilio.dev" className="flex items-center justify-center w-8 h-8 text-[var(--text-2)] hover:text-[var(--accent)] bg-[var(--bg-2)] border border-[var(--border)] rounded-lg transition-all" aria-label="Email">
                                <Mail size={16} />
                            </a>
                        </div>

                        <p className="text-[var(--text-2)] text-[12.5px] leading-relaxed font-medium opacity-70 mb-4">
                            Join our community for interview tips and tech news.
                        </p>

                        <Link to="/contact" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest hover:text-[var(--accent-soft)] transition-colors">
                            Contact Us <ArrowUpRight size={11} />
                        </Link>
                    </div>

                </div>
            </div>

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0 overflow-hidden" 
                 style={{ backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }} />
        </footer>
    )
}
