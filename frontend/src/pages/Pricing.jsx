import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscription } from '../hooks/useSubscription.js'

// ── Components ─────────────────────────────────────────────────────────────

/**
 * Reusable Icon components for features
 */
function CheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function XIcon({ className = "w-5 h-5", opacity = "opacity-40" }) {
  return (
    <svg className={`${className} ${opacity}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

/**
 * Reusable Pricing Card Component
 */
function PricingCard({ plan, billing, currentPlan, onSelect, index }) {
  const isAnnual = billing === 'annual'
  const price = isAnnual ? plan.price.annual : plan.price.monthly
  const isCurrent = currentPlan === plan.id
  
  // Custom glass effect based on highlight
  const cardClasses = `
    relative flex flex-col h-full rounded-2xl border transition-all duration-300
    ${plan.highlight 
      ? 'border-amber shadow-amber-glow scale-105 z-10 bg-[var(--bg-1)] shadow-xl' 
      : 'border-[var(--border)] bg-[var(--bg-1)] shadow-lg hover:shadow-xl hover:scale-[1.02]'
    }
  `

  const badge = plan.badge || plan.customBadge

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="flex h-full w-full"
    >
      <div className={cardClasses}>
        {/* Badge (Most Popular or Best for Teams) */}
        {badge && (
          <div className={`
            absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-lg z-20
            ${plan.highlight ? 'bg-amber text-white' : 'bg-[var(--bg-3)] text-[var(--text-1)] border border-[var(--border-md)]'}
          `}>
            {badge}
          </div>
        )}

        {/* Card Header & Content */}
        <div className="flex flex-col flex-grow p-8">
          <div className="mb-8">
            <h3 className="text-xl font-bold font-sans tracking-tight text-[var(--text-0)] mb-2">
              {plan.name}
            </h3>
            <p className="text-sm text-[var(--text-2)] leading-relaxed">
              {plan.description}
            </p>
          </div>

          {/* Pricing Section */}
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tighter text-[var(--text-0)]">
                ${price}
              </span>
              <span className="text-[var(--text-2)] font-medium">
                {plan.id === 'free' ? '/forever' : isAnnual ? '/mo' : '/mo'}
              </span>
            </div>
            {!isAnnual && plan.id !== 'free' && (
              <p className="text-xs text-transparent select-none mt-1">—</p>
            )}
            {isAnnual && plan.id !== 'free' && (
              <p className="text-[11px] font-bold text-emerald mt-1 tracking-wide uppercase">
                Billed Annually (Save 20%)
              </p>
            )}
          </div>

          <div className="h-px w-full bg-[var(--border)] mb-8 opacity-50" />

          {/* Features List */}
          <ul className="space-y-4 flex-grow">
            {plan.features.map((feature, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${feature.ok ? 'text-[var(--text-1)]' : 'text-[var(--text-2)] opacity-50'}`}>
                {feature.ok ? (
                  <CheckIcon className="w-5 h-5 text-emerald flex-shrink-0" />
                ) : (
                  <XIcon className="w-5 h-5 text-[var(--text-2)] flex-shrink-0" />
                )}
                <span className={feature.ok ? '' : 'line-through decoration-[var(--border-hi)]'}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Section - Fixed at bottom */}
        <div className="p-8 pt-0">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => !isCurrent && onSelect(plan.id)}
            disabled={isCurrent}
            className={`
              w-full py-4 rounded-xl text-sm font-bold tracking-tight transition-all duration-200
              ${isCurrent 
                ? 'bg-emerald/10 text-emerald border border-emerald/20 cursor-default' 
                : plan.highlight 
                  ? 'bg-amber hover:bg-amber-soft text-white shadow-amber-glow hover:shadow-lg'
                  : 'bg-[var(--bg-3)] text-[var(--text-0)] border border-[var(--border-md)] hover:bg-[var(--bg-4)] hover:border-[var(--text-2)]'
              }
            `}
          >
            {isCurrent ? '✓ Current Plan' : plan.cta}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Pricing Component ───────────────────────────────────────────────────

export default function Pricing() {
  const navigate = useNavigate()
  const { plan: currentPlan, isLoading } = useSubscription()
  const [billing, setBilling] = useState('annual')

  const PLANS = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for exploring and occasional practice.',
      price: { monthly: 0, annual: 0 },
      badge: null,
      highlight: false,
      cta: 'Get Started Free',
      features: [
        { text: '3 interview sessions / month', ok: true },
        { text: 'MCQ & Technical rounds', ok: true },
        { text: 'Basic score & feedback', ok: true },
        { text: 'Premium AI evaluations', ok: false },
        { text: 'Resume analysis', ok: false },
        { text: 'Detailed PDF reports', ok: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Comprehensive prep for serious candidates.',
      price: { monthly: 19, annual: 15 },
      badge: 'Most Popular',
      highlight: true,
      cta: 'Upgrade to Pro',
      features: [
        { text: 'Unlimited interview sessions', ok: true },
        { text: 'All 5 rounds — MCQ, DSA, HR', ok: true },
        { text: 'Full AI evaluation & scoring', ok: true },
        { text: '5 resume analyses / month', ok: true },
        { text: 'Advanced analytics dashboard', ok: true },
        { text: 'PDF report downloads', ok: true },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Premium features for teams and heavy users.',
      price: { monthly: 49, annual: 39 },
      badge: null,
      customBadge: 'Best for Teams',
      highlight: false,
      cta: 'Upgrade to Enterprise',
      features: [
        { text: 'Everything in Pro', ok: true },
        { text: 'Unlimited resume uploads', ok: true },
        { text: 'Custom interview topics', ok: true },
        { text: 'Team management (10 seats)', ok: true },
        { text: 'API priority access', ok: true },
        { text: 'White-label reports', ok: true },
      ],
    },
  ]

  function handleSelect(planId) {
    if (planId === 'free') return navigate('/dashboard')
    navigate('/settings/billing')
  }

  return (
    <div className="relative min-h-screen py-16 sm:py-24 bg-[var(--bg-0)] overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-block py-1 px-4 rounded-full bg-amber/10 border border-amber/20 text-amber text-xs font-bold uppercase tracking-widest mb-6"
          >
            Subscription Plans
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-0)] mb-6"
          >
            Choose your <span className="text-amber">Interview Plan</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[var(--text-1)] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Start free. Upgrade when you're ready to go all-in on your career prep and land your dream job.
          </motion.p>
        </div>

        {/* Improved Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="relative flex items-center p-1 bg-[var(--bg-2)] border border-[var(--border-md)] rounded-2xl">
            <div 
              className={`absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-[var(--bg-3)] rounded-xl transition-transform duration-300 ease-in-out shadow-sm
                ${billing === 'annual' ? 'translate-x-full' : 'translate-x-0'}`}
            />
            {['monthly', 'annual'].map((type) => (
              <button
                key={type}
                onClick={() => setBilling(type)}
                className={`relative z-10 px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors duration-200
                  ${billing === type ? 'text-[var(--text-0)]' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}`}
              >
                {type}
                {type === 'annual' && (
                  <span className={`ml-2 text-[10px] py-0.5 px-2 rounded-lg bg-emerald/10 text-emerald`}>
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billing={billing}
              currentPlan={isLoading ? null : currentPlan}
              onSelect={handleSelect}
              index={i}
            />
          ))}
        </div>

        {/* Footer Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center text-[var(--text-2)] text-sm"
        >
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-4 opacity-75">
            <span>Powered by Razorpay</span>
            <span>PCI DSS Compliant</span>
            <span>Secure SSL Encryption</span>
          </div>
          <p>
            No contracts. Cancel anytime.{' '}
            <a href="mailto:hello@skilio.dev" className="text-amber hover:opacity-80 font-semibold transition-opacity italic underline-offset-4 decoration-amber/30 underline decoration-2">
              Questions?
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
