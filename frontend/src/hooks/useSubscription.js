import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '$0',
    limits: {
      interviewsPerMonth: 3,
      resumeUploadsPerMonth: 0,
      roundTypes: ['mcq', 'technical'],
      aiEvaluation: false,
      analytics: false,
      reportDownload: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 499,
    priceDisplay: '₹499',
    limits: {
      interviewsPerMonth: Infinity,
      resumeUploadsPerMonth: 5,
      roundTypes: ['mcq', 'technical', 'coding', 'behavioural', 'mixed'],
      aiEvaluation: true,
      analytics: true,
      reportDownload: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    priceDisplay: '₹799',
    limits: {
      interviewsPerMonth: Infinity,
      resumeUploadsPerMonth: Infinity,
      roundTypes: ['mcq', 'technical', 'coding', 'behavioural', 'mixed'],
      aiEvaluation: true,
      analytics: true,
      reportDownload: true,
      customTopics: true,
      teamSeats: 10,
      apiAccess: true,
    },
  },
};

const DEFAULT_STATE = {
  plan: 'free',
  status: 'active',
  usage: { interviewsUsed: 0, interviewsLimit: 3, resumeUploadsUsed: 0, resumeUploadsLimit: 0 },
  limits: PLANS.free.limits,
  isLoading: true,
  isPro: false,
  isEnterprise: false,
  isFree: true,
  canStartInterview: true,
  canUploadResume: false,
};

export function useSubscription() {
  const [data, setData] = useState(DEFAULT_STATE);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await api.get('/subscription');
      const sub = res.data;
      const planId = sub.subscription?.plan || 'free';
      const planDef = PLANS[planId] || PLANS.free;
      const limits = planDef.limits;
      const usage = sub.usage || { interviewsUsed: 0, interviewsLimit: 3 };

      setData({
        plan: planId,
        status: sub.subscription?.status || 'active',
        usage,
        limits,
        isLoading: false,
        isPro: planId === 'pro',
        isEnterprise: planId === 'enterprise',
        isFree: planId === 'free',
        canStartInterview:
          limits.interviewsPerMonth === Infinity ||
          usage.interviewsUsed < limits.interviewsPerMonth,
        canUploadResume:
          !!limits.resumeUploadsPerMonth &&
          (limits.resumeUploadsPerMonth === Infinity ||
            usage.resumeUploadsUsed < (limits.resumeUploadsPerMonth || 0)),
      });
    } catch {
      // On error, default to free plan (fail open)
      setData({ ...DEFAULT_STATE, isLoading: false });
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { ...data, refetch: fetchSubscription, PLANS };
}

export { PLANS };
