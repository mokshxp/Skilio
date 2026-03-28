import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import UsageMeter from '../components/subscription/UsageMeter';
import PlanBadge from '../components/subscription/PlanBadge';
import api from '../services/api';

export default function Billing() {
  const navigate = useNavigate();
  const { plan, status, usage, isFree, isPro, isEnterprise, isLoading, refetch } = useSubscription();

  async function handleCancel() {
    if (!confirm('Cancel your subscription? You will keep access until the end of your billing period.')) return;
    try {
      await api.post('/subscription/cancel');
      refetch();
    } catch (e) {
      alert('Failed to cancel. Please try again.');
    }
  }

  const statusConfig = {
    active: { icon: <CheckCircle size={14} />, color: 'var(--emerald)', label: 'Active' },
    trialing: { icon: <CheckCircle size={14} />, color: 'var(--sky)', label: 'Trial' },
    cancelled: { icon: <XCircle size={14} />, color: 'var(--rose)', label: 'Cancelled' },
    past_due: { icon: <AlertCircle size={14} />, color: 'var(--accent)', label: 'Past Due' },
  };
  const statusInfo = statusConfig[status] || statusConfig.active;

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <p className="label">Account</p>
        <h1 className="section-title">Billing & Plan</h1>
        <p className="section-subtitle">Manage your subscription and view usage.</p>
      </div>

      <div className="billing-grid">
        {/* Current Plan Card */}
        <motion.div className="card billing-plan-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="billing-plan-card__header">
            <CreditCard size={18} style={{ color: 'var(--accent)' }} />
            <h3>Current Plan</h3>
          </div>

          <div className="billing-plan-card__plan">
            <PlanBadge plan={plan} size="lg" />
            <div className="billing-plan-card__status" style={{ color: statusInfo.color }}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </div>
          </div>

          <div className="billing-plan-card__actions">
            <button className="btn-amber btn-md" onClick={() => navigate('/pricing')}>
              <Zap size={14} />
              {isFree ? 'Upgrade Plan' : 'Change Plan'}
            </button>
            {!isFree && (
              <button className="btn-danger btn-md" onClick={handleCancel}>
                Cancel Subscription
              </button>
            )}
          </div>
        </motion.div>

        {/* Usage Card */}
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>This Month's Usage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <UsageMeter
              used={usage.interviewsUsed}
              limit={usage.interviewsLimit}
              label="Interview Sessions"
            />
            <UsageMeter
              used={usage.resumeUploadsUsed}
              limit={usage.resumeUploadsLimit || 0}
              label="Resume Analyses"
            />
          </div>
        </motion.div>
      </div>

      {isFree && (
        <motion.div
          className="card-amber"
          style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: 'var(--text-0)' }}>Unlock your full potential</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-1)', marginTop: 4 }}>
              Pro gives you unlimited interviews, DSA coding rounds, AI evaluation, and more.
            </p>
          </div>
          <button className="btn-amber btn-md" onClick={() => navigate('/pricing')}>
            <Zap size={14} />
            Upgrade to Pro — ₹1499/mo
          </button>
        </motion.div>
      )}
    </div>
  );
}
