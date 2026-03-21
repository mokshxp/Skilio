const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const authMiddleware = require('../middleware/authMiddleware');
const { PLANS } = require('../services/plans');
const { getUserSubscription, createOrUpdateSubscription } = require('../services/subscriptionService');
const supabase = require('../config/db');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * GET current subscription details
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
        const userId = authData?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const sub = await getUserSubscription(userId);
        const plan = PLANS[sub.plan || 'free'];

        res.json({
            subscription: sub,
            plan: {
                ...plan,
                id: sub.plan,
            },
            usage: {
                interviewsUsed: sub.interviews_used_this_month || 0,
                interviewsLimit: plan.limits.interviewsPerMonth,
                resumeUploadsUsed: sub.resume_uploads_this_month || 0,
                resumeUploadsLimit: plan.limits.resumeUploadsPerMonth,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST create Razorpay order for subscription upgrade
 */
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
        const userId = authData?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { planId, billing = 'monthly' } = req.body;
        const plan = PLANS[planId];

        if (!plan || planId === 'free') {
            return res.status(400).json({ error: 'Invalid plan choice' });
        }

        const amount = billing === 'annual' ? plan.priceAnnual : plan.price;
        // Amount in paise (multiply by 100)
        
        const options = {
            amount: amount * 100, 
            currency: 'USD',
            receipt: `skilio_sub_${userId}_${Date.now()}`,
            notes: { userId, planId, billing }
        };

        const order = await razorpay.orders.create(options);
        
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.error('[RAZORPAY_ERROR] Session setup failed:', err.message);
        res.status(500).json({ error: 'Payment initialization failed' });
    }
});

/**
 * POST verify Razorpay payment
 */
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
        const userId = authData?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Payment verified — update subscription
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await createOrUpdateSubscription(userId, planId, {
            provider: 'razorpay',
            subscriptionId: razorpay_payment_id,
            customerId: razorpay_order_id,
            periodStart: now,
            periodEnd,
        });

        res.json({ success: true, plan: planId });

    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * POST cancel subscription (setting delete at end)
 */
router.post('/cancel', authMiddleware, async (req, res) => {
    try {
        const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
        const userId = authData?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await supabase
            .from('subscriptions')
            .update({ cancel_at_period_end: true })
            .eq('user_id', userId);

        res.json({ success: true, message: 'Your plan will be cancelled at the end of the current period.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
