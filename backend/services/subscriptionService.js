const supabase = require('../config/db');
const { PLANS } = require('./plans');

/**
 * Fetch a user's subscription details. Default to 'free' if missing.
 */
async function getUserSubscription(userId) {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        // No subscription found = free plan
        return {
            user_id: userId,
            plan: 'free',
            status: 'active',
            interviews_used_this_month: 0,
            resume_uploads_this_month: 0,
        };
    }

    // Reset usage if past reset date
    const now = new Date();
    if (data.usage_reset_date && new Date(data.usage_reset_date) < now) {
        const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        const { data: updated, error: upErr } = await supabase
            .from('subscriptions')
            .update({
                interviews_used_this_month: 0,
                resume_uploads_this_month: 0,
                usage_reset_date: nextReset,
                updated_at: now.toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();
            
        if (!upErr && updated) return updated;
    }

    return data;
}

/**
 * Logic to check if an interview can be started.
 * (3 per month for Free plan)
 */
async function checkCanStartInterview(userId) {
    const sub = await getUserSubscription(userId);
    const plan = PLANS[sub.plan || 'free'];

    if (sub.status !== 'active' && sub.status !== 'trialing') {
        return { allowed: false, reason: 'Subscription is not active', upgradeRequired: 'pro' };
    }

    const limit = plan.limits.interviewsPerMonth;
    if (sub.interviews_used_this_month >= limit) {
        return {
            allowed: false,
            reason: `Monthly limit reached (${limit}/month) for the ${plan.name} plan.`,
            upgradeRequired: 'pro',
        };
    }

    return { allowed: true };
}

/**
 * Logic to check if a resume can be uploaded.
 * (Pro/Enterprise only)
 */
async function checkCanUploadResume(userId) {
    const sub = await getUserSubscription(userId);
    const plan = PLANS[sub.plan || 'free'];

    if (!plan.limits.resumeUploadsPerMonth) {
        return { allowed: false, reason: 'Resume analysis requires a Pro plan.', upgradeRequired: 'pro' };
    }

    const limit = plan.limits.resumeUploadsPerMonth;
    if (sub.resume_uploads_this_month >= limit) {
        return {
            allowed: false,
            reason: `Monthly upload limit reached (${limit}/month).`,
            upgradeRequired: 'pro',
        };
    }

    return { allowed: true };
}

/**
 * Logic to check if a specific round type (e.g., 'coding') is allowed.
 */
async function canAccessRoundType(userId, roundType) {
    const sub = await getUserSubscription(userId);
    const plan = PLANS[sub.plan || 'free'];
    
    // technical & mcq are open to all
    if (roundType === 'mcq' || roundType === 'technical') return true;
    
    // coding, behavioural, mixed require paid tiers
    return plan.limits.roundTypes.includes(roundType);
}

/**
 * Increment usage counters.
 */
async function incrementInterviewUsage(userId) {
    // We use standard supabase update instead of rpc to avoid dashboard setup for now
    const sub = await getUserSubscription(userId);
    const newVal = (sub.interviews_used_this_month || 0) + 1;
    
    const { error } = await supabase
        .from('subscriptions')
        .upsert({ 
            user_id: userId, 
            interviews_used_this_month: newVal,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
    if (!error) await logUsageEvent(userId, 'interview_started');
    return !error;
}

async function incrementResumeUsage(userId) {
    const sub = await getUserSubscription(userId);
    const newVal = (sub.resume_uploads_this_month || 0) + 1;
    
    const { error } = await supabase
        .from('subscriptions')
        .upsert({ 
            user_id: userId, 
            resume_uploads_this_month: newVal,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
    if (!error) await logUsageEvent(userId, 'resume_uploaded');
    return !error;
}

async function logUsageEvent(userId, eventType, metadata = {}) {
    await supabase.from('usage_events').insert({
        user_id: userId,
        event_type: eventType,
        metadata,
    });
}

/**
 * Create or upgrade a subscription (called after payment).
 */
async function createOrUpdateSubscription(userId, planId, providerData = {}) {
    const now = new Date();
    const upsertData = {
        user_id: userId,
        plan: planId,
        status: 'active',
        updated_at: now.toISOString(),
        payment_provider: providerData.provider,
        provider_subscription_id: providerData.subscriptionId,
        provider_customer_id: providerData.customerId,
        current_period_start: providerData.periodStart ? providerData.periodStart.toISOString() : now.toISOString(),
        current_period_end: providerData.periodEnd ? providerData.periodEnd.toISOString() : null,
    };

    const { error } = await supabase
        .from('subscriptions')
        .upsert(upsertData, { onConflict: 'user_id' });

    if (error) throw error;
    return true;
}

module.exports = {
    getUserSubscription,
    checkCanStartInterview,
    checkCanUploadResume,
    canAccessRoundType,
    incrementInterviewUsage,
    incrementResumeUsage,
    logUsageEvent,
    createOrUpdateSubscription
};
