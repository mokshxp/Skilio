import { Mail, Github, Linkedin, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const CONTACT_LINKS = [
    {
        icon: Mail,
        label: 'gmoksh985@gmail.com',
        href: 'mailto:gmoksh985@gmail.com',
    },
    {
        icon: Linkedin,
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/moksh-gupta-8b7588279/',
        external: true,
    },
    {
        icon: Github,
        label: 'GitHub',
        href: 'https://github.com/mokshxp',
        external: true,
    },
]

export default function Contact() {
    const [focusedInput, setFocusedInput] = useState(null);
    const [hoveredLink, setHoveredLink] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const inputStyle = (id) => ({
        width: '100%',
        padding: '14px 18px',
        background: 'var(--bg-0)',
        border: `1px solid ${focusedInput === id ? 'var(--accent)' : 'var(--border-md)'}`,
        borderRadius: 16,
        color: 'var(--text-0)',
        fontSize: 16,
        fontFamily: 'Manrope, sans-serif',
        outline: 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: focusedInput === id
            ? '0 0 0 4px var(--accent-dim), inset 0 2px 4px rgba(0,0,0,0.02)'
            : 'inset 0 2px 4px rgba(0,0,0,0.02)',
    });

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 24px',
            background: 'var(--bg-0)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Subtle decorative background text */}
            <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '25vw',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                color: 'var(--text-0)',
                opacity: 0.02,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.05em',
            }}>
                CONTACT
            </div>

            <style>
                {`
                .contact-card {
                    position: relative;
                    z-index: 10;
                    max-width: 950px;
                    width: 100%;
                    background: var(--bg-1);
                    border-radius: 28px;
                    padding: 60px 50px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 50px;
                    border: 1px solid var(--border-md);
                }
                
                @media (max-width: 900px) {
                    .contact-card {
                        grid-template-columns: 1fr;
                        padding: 40px 30px;
                        gap: 40px;
                        border-radius: 24px;
                    }
                }

                .input-field::placeholder {
                    color: var(--text-2);
                    opacity: 0.7;
                }
                `}
            </style>

            <motion.div
                className="contact-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Left: Form */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* Headers */}
                    <div style={{ marginBottom: 28, position: 'relative' }}>
                        {/* Decorative thin line */}
                        <div style={{
                            position: 'absolute',
                            left: -20,
                            top: 6,
                            bottom: 6,
                            width: 3,
                            background: 'var(--accent)',
                            borderRadius: 4,
                            opacity: 0.8,
                        }} />

                        <span style={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.15em',
                            color: 'var(--accent)',
                            textTransform: 'uppercase',
                            marginBottom: 12,
                            display: 'block'
                        }}>
                            CONTACT
                        </span>
                        <h1 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(32px, 5vw, 40px)',
                            fontWeight: 700,
                            color: 'var(--text-0)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            marginBottom: 12,
                        }}>
                            Get In Touch
                        </h1>
                        <p style={{
                            fontSize: 16,
                            color: 'var(--text-1)',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 500,
                            lineHeight: 1.5,
                            maxWidth: 400,
                        }}>
                            Facing an issue with your account or have feedback? Reach out to us, and we'll help you resolve it as soon as possible.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Your Name"
                            style={inputStyle('name')}
                            onFocus={() => setFocusedInput('name')}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <input
                            className="input-field"
                            type="email"
                            placeholder="Your Email"
                            style={inputStyle('email')}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <textarea
                            className="input-field"
                            placeholder="Your Message..."
                            rows={4}
                            style={{
                                ...inputStyle('message'),
                                resize: 'vertical',
                                minHeight: 120,
                            }}
                            onFocus={() => setFocusedInput('message')}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <button style={{
                            alignSelf: 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '16px 40px',
                            background: 'var(--accent)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 50,
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 600,
                            fontSize: 16,
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            marginTop: 8,
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 6px 20px var(--accent-dim)',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 8px 25px var(--accent-glow)'
                                const icon = e.currentTarget.querySelector('.btn-icon');
                                if (icon) icon.style.transform = 'translateX(4px)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 6px 20px var(--accent-dim)'
                                const icon = e.currentTarget.querySelector('.btn-icon');
                                if (icon) icon.style.transform = 'translateX(0)'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97) translateY(0)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        >
                            Send Message
                            <ArrowRight className="btn-icon" size={18} style={{ transition: 'transform 0.3s ease' }} />
                        </button>
                    </div>
                </div>

                {/* Right: Links Panel */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        background: 'var(--bg-2)',
                        borderRadius: 20,
                        padding: '40px 32px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 24,
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.01)',
                    }}>
                        <div style={{ marginBottom: 4 }}>
                            <h3 style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: 20,
                                fontWeight: 700,
                                color: 'var(--text-0)',
                                marginBottom: 8,
                            }}>
                                Direct Contact
                            </h3>
                            <p style={{
                                fontSize: 15,
                                color: 'var(--text-1)',
                                fontFamily: 'Manrope, sans-serif',
                                lineHeight: 1.5,
                            }}>
                                Prefer to reach out directly? Message me through any of the channels below.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {CONTACT_LINKS.map(({ icon: Icon, label, href, external }) => {
                                const isHovered = hoveredLink === href;
                                return (
                                    <a
                                        key={href}
                                        href={href}
                                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            color: isHovered ? 'var(--accent)' : 'var(--text-1)',
                                            textDecoration: 'none',
                                            fontSize: 16,
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 500,
                                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                            transform: isHovered ? 'translateX(6px)' : 'translateX(0)',
                                        }}
                                        onMouseEnter={() => setHoveredLink(href)}
                                        onMouseLeave={() => setHoveredLink(null)}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            background: isHovered ? 'var(--accent-dim)' : 'var(--bg-1)',
                                            border: `1px solid ${isHovered ? 'transparent' : 'var(--border)'}`,
                                            transition: 'all 0.3s ease',
                                        }}>
                                            <Icon
                                                size={18}
                                                style={{
                                                    color: isHovered ? 'var(--accent)' : 'var(--text-2)',
                                                    transition: 'color 0.3s ease',
                                                    strokeWidth: 2,
                                                }}
                                            />
                                        </div>
                                        <span style={{
                                            fontWeight: isHovered ? 600 : 500,
                                            transition: 'font-weight 0.3s ease'
                                        }}>
                                            {label}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
