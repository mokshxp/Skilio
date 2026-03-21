/**
 * Single source of truth for all plan limits
 */
const PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        priceDisplay: '$0',
        description: 'Basic interview practice',
        color: '#7f8794', // var(--text-2)
        limits: {
            interviewsPerMonth: 3,
            resumeUploadsPerMonth: 0,
            roundTypes: ['mcq', 'technical'], // Only basic MCQ rounds
            aiEvaluation: false,
            analytics: false,
            reportDownload: false
        },
        features: [
            { text: '3 sessions / mo', included: true },
            { text: 'MCQ & Technical rounds', included: true },
            { text: 'Basic results', included: true },
            { text: 'DSA & Coding rounds', included: false },
            { text: 'Resume analysis', included: false },
            { text: 'AI evaluation', included: false }
        ]
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 19,
        priceDisplay: '$19',
        priceAnnual: 190,
        description: 'For serious candidates',
        color: '#ffb703', // var(--accent)
        badge: 'Popular',
        limits: {
            interviewsPerMonth: 1000, 
            resumeUploadsPerMonth: 5,
            roundTypes: ['mcq', 'technical', 'coding', 'behavioural', 'mixed'],
            aiEvaluation: true,
            analytics: true,
            reportDownload: true
        },
        features: [
            { text: 'Unlimited sessions', included: true },
            { text: 'All round types (DSA/HR)', included: true },
            { text: 'Advanced AI feedback', included: true },
            { text: '5 resume analyses / mo', included: true },
            { text: 'Analytics dashboard', included: true },
            { text: 'PDF reports', included: true }
        ]
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 49,
        priceDisplay: '$49',
        priceAnnual: 490,
        description: 'For teams & power users',
        color: '#00d4ff', // var(--carbon accent)
        limits: {
            interviewsPerMonth: 10000,
            resumeUploadsPerMonth: 10000,
            roundTypes: ['mcq', 'technical', 'coding', 'behavioural', 'mixed'],
            aiEvaluation: true,
            analytics: true,
            reportDownload: true,
            customTopics: true,
            teamSeats: 10,
            apiAccess: true
        },
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Full team access', included: true },
            { text: 'Unlimited resumes', included: true },
            { text: 'Custom topics', included: true },
            { text: 'Priority support', included: true },
            { text: 'API/Webhook access', included: true }
        ]
    }
};

module.exports = { PLANS };
