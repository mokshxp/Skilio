import { motion } from 'framer-motion'

export default function PageWrapper({ children, className = '' }) {
    return (
        <div className={`page-wrapper ${className}`}>
            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.08 } },
                }}
                className="flex flex-col gap-6"
            >
                {children}
            </motion.div>
        </div>
    )
}

// Staggered child wrapper
export function FadeUp({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
