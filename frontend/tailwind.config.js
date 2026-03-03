/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Syne', 'sans-serif'],
                sans: ['Manrope', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            colors: {
                navy: {
                    950: '#08080E',
                    900: '#0E0E18',
                    850: '#111120',
                    800: '#14141F',
                    750: '#18182A',
                    700: '#1E1E30',
                    600: '#272740',
                },
                amber: {
                    DEFAULT: '#F59E0B',
                    soft: '#FCD34D',
                    glow: 'rgba(245,158,11,0.25)',
                    dim: 'rgba(245,158,11,0.12)',
                },
                emerald: {
                    DEFAULT: '#34D399',
                    soft: '#6EE7B7',
                    glow: 'rgba(52,211,153,0.2)',
                    dim: 'rgba(52,211,153,0.1)',
                },
                sky: {
                    DEFAULT: '#38BDF8',
                    glow: 'rgba(56,189,248,0.2)',
                },
                rose: {
                    DEFAULT: '#FB7185',
                    glow: 'rgba(251,113,133,0.2)',
                },
            },
            animation: {
                'fade-up': 'fadeUp 0.5s ease forwards',
                'fade-in': 'fadeIn 0.4s ease forwards',
                'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
                'slide-right': 'slideRight 0.35s ease forwards',
                'shimmer': 'shimmer 1.5s infinite',
                'blink': 'blink 1s step-end infinite',
                'typing': 'typing 0.05s steps(1) forwards',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(18px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                },
                slideRight: {
                    '0%': { opacity: '0', transform: 'translateX(-12px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
            },
            boxShadow: {
                'amber-glow': '0 0 30px rgba(245,158,11,0.2)',
                'emerald-glow': '0 0 30px rgba(52,211,153,0.15)',
                'card': '0 4px 32px rgba(0,0,0,0.5)',
                'card-hover': '0 8px 48px rgba(0,0,0,0.6)',
            },
        },
    },
    plugins: [],
}
