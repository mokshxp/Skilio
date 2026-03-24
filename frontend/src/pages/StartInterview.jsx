import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, ChevronUp, Upload, Loader2, Play, Lock, Zap } from 'lucide-react'
import { interviewApi, resumeApi } from '../services/api.js'
import { useSubscription } from '../hooks/useSubscription.js'

const ROLES = ['Frontend Engineer', 'Backend Engineer', 'Full Stack', 'Data Scientist', 'ML Engineer', 'DevOps', 'System Design', 'Product Manager']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const ROUNDS = [
    { id: 'technical', label: 'Technical', desc: 'DSA, system design, architecture' },
    { id: 'coding', label: 'Coding', desc: 'Live coding with AI test cases' },
    { id: 'behavioural', label: 'Behavioural', desc: 'STAR-method soft skills questions' },
    { id: 'mixed', label: 'Mixed', desc: 'Combination of all round types' },
]

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function StartInterview() {
    const navigate = useNavigate()
    const location = useLocation()
    const { canStartInterview, isFree, usage, isLoading: subLoading } = useSubscription()
    const [role, setRole] = useState('Frontend Engineer')
    const [difficulty, setDifficulty] = useState('Intermediate')
    const [round, setRound] = useState('technical')
    const [resumeId, setResumeId] = useState(null)
    const [selectedResume, setSelectedResume] = useState(null)
    const [allResumes, setAllResumes] = useState([])
    const [showResumeSelector, setShowResumeSelector] = useState(false)
    const [loadingResumes, setLoadingResumes] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch all resumes for the selector
    useEffect(() => {
        const fetchAllResumes = async () => {
            try {
                const list = await resumeApi.list()
                setAllResumes(list || [])
            } catch (err) {
                console.error('Failed to fetch resumes list', err)
            } finally {
                setLoadingResumes(false)
            }
        }
        fetchAllResumes()
    }, [])

    // Fetch selected resume details
    useEffect(() => {
        const fetchResume = async (id) => {
            try {
                const res = await resumeApi.get(id)
                if (res) {
                    setSelectedResume(res)
                    setResumeId(res.id)
                    if (res.primary_role && !location.state?.role) {
                        setRole(res.primary_role)
                    }
                }
            } catch (err) {
                console.error('Failed to fetch resume context', err)
            }
        }

        if (location.state?.resumeId) {
            setResumeId(location.state.resumeId)
            fetchResume(location.state.resumeId)
        } else {
            // Fallback to latest
            fetchResume('latest')
        }

        if (location.state?.role) {
            setRole(location.state.role)
        }
    }, [location.state])

    const handleSelectResume = async (resume) => {
        try {
            const fullResume = await resumeApi.get(resume.id)
            setSelectedResume(fullResume)
            setResumeId(fullResume.id)
            if (fullResume.primary_role) {
                setRole(fullResume.primary_role)
            }
            setShowResumeSelector(false)
        } catch (err) {
            console.error('Failed to select resume', err)
        }
    }

    const selectedRound = ROUNDS.find(r => r.id === round)

    const handleStart = async () => {
        if (!role) {
            setError('Please select a target role')
            return
        }
        if (!difficulty) {
            setError('Please select a difficulty')
            return
        }
        if (!round) {
            setError('Please select a round type')
            return
        }

        if (!canStartInterview) {
            setError('You have reached your interview limit for this billing cycle. Please upgrade your plan.')
            return
        }

        setLoading(true)
        setError(null)
        
        try {
            const payload = {
                role: role.trim(),
                difficulty: difficulty.toLowerCase().trim(),
                roundType: round.toLowerCase().trim(),
                resumeId: (selectedResume?.id) || null,
                totalRounds: 5,
            }
            
            console.log('[Frontend] Starting interview with payload:', payload)
            
            const res = await interviewApi.create(payload)
            navigate(`/interview/${res.interviewId}`)
        } catch (e) {
            console.error('[Frontend] Start failed:', e)
            if (e.response?.data) {
                console.error('[Frontend] Error Body:', e.response.data)
            }
            setError(e.response?.data?.message || e.message || 'Failed to start. Please try again.')
            setLoading(false)
        }
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    New Session
                </p>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', margin: 0 }}>
                    Configure Interview
                </h1>
            </motion.div>

            {/* 2-col grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64, alignItems: 'start' }}>

                {/* LEFT — Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

                    {/* ── Resume Context Card ──────────────────────────── */}
                    <motion.div variants={fadeUp}>
                        <p style={labelStyle}>Resume Context</p>
                        <div style={{ marginTop: 12, position: 'relative' }}>
                            {selectedResume ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        border: '1px solid var(--amber)',
                                        borderRadius: 10,
                                        background: 'var(--amber-dim)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Selected resume info */}
                                    <div
                                        onClick={() => allResumes.length > 1 && setShowResumeSelector(!showResumeSelector)}
                                        style={{
                                            padding: '14px 18px',
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            cursor: allResumes.length > 1 ? 'pointer' : 'default',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 8,
                                            background: 'var(--amber)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <FileText size={18} color="var(--bg-0)" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
                                                color: 'var(--text-0)', margin: 0,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {selectedResume.primary_role || 'Resume'}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                                <span style={{
                                                    fontFamily: 'Fira Code, monospace', fontSize: 10,
                                                    color: 'var(--amber)', letterSpacing: '0.05em',
                                                }}>
                                                    ACTIVE
                                                </span>
                                                <span style={{
                                                    width: 3, height: 3, borderRadius: '50%',
                                                    background: 'var(--text-2)', display: 'inline-block',
                                                }} />
                                                <span style={{
                                                    fontFamily: 'Manrope, sans-serif', fontSize: 11,
                                                    color: 'var(--text-2)',
                                                }}>
                                                    {selectedResume.experience_years ? `${selectedResume.experience_years} yrs exp` : 'Uploaded'} · {new Date(selectedResume.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {allResumes.length > 1 && (
                                            <motion.div
                                                animate={{ rotate: showResumeSelector ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown size={16} style={{ color: 'var(--text-2)' }} />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Skills preview */}
                                    {selectedResume.skills?.length > 0 && (
                                        <div style={{
                                            padding: '0 18px 12px',
                                            display: 'flex', flexWrap: 'wrap', gap: 5,
                                        }}>
                                            {selectedResume.skills.slice(0, 8).map((s, i) => (
                                                <span key={i} style={{
                                                    fontFamily: 'Manrope, sans-serif', fontSize: 10,
                                                    color: 'var(--text-1)', background: 'var(--bg-2)',
                                                    padding: '2px 8px', borderRadius: 4,
                                                    border: '1px solid var(--border)',
                                                }}>
                                                    {s}
                                                </span>
                                            ))}
                                            {selectedResume.skills.length > 8 && (
                                                <span style={{
                                                    fontFamily: 'Manrope, sans-serif', fontSize: 10,
                                                    color: 'var(--text-2)', padding: '2px 6px',
                                                }}>
                                                    +{selectedResume.skills.length - 8} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Resume selector dropdown */}
                                    <AnimatePresence>
                                        {showResumeSelector && allResumes.length > 1 && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{
                                                    overflow: 'hidden',
                                                    borderTop: '1px solid var(--border)',
                                                    background: 'var(--bg-1)',
                                                }}
                                            >
                                                <div style={{ padding: '8px 10px' }}>
                                                    <p style={{
                                                        fontFamily: 'Manrope, sans-serif', fontSize: 10,
                                                        color: 'var(--text-2)', letterSpacing: '0.1em',
                                                        textTransform: 'uppercase', margin: '4px 8px 8px',
                                                    }}>
                                                        Switch Resume
                                                    </p>
                                                    {allResumes
                                                        .filter(r => r.id !== selectedResume.id)
                                                        .map(r => (
                                                            <motion.div
                                                                key={r.id}
                                                                onClick={() => handleSelectResume(r)}
                                                                whileHover={{ background: 'var(--bg-3)' }}
                                                                style={{
                                                                    padding: '10px 12px', borderRadius: 6,
                                                                    cursor: 'pointer', display: 'flex',
                                                                    alignItems: 'center', gap: 10,
                                                                    transition: 'background 0.15s',
                                                                }}
                                                            >
                                                                <FileText size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <p style={{
                                                                        fontFamily: 'Manrope, sans-serif', fontSize: 13,
                                                                        color: 'var(--text-1)', margin: 0,
                                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                    }}>
                                                                        {r.primary_role || 'Resume'}
                                                                    </p>
                                                                    <p style={{
                                                                        fontFamily: 'Manrope, sans-serif', fontSize: 11,
                                                                        color: 'var(--text-2)', margin: '2px 0 0',
                                                                    }}>
                                                                        {new Date(r.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    }
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => navigate('/resume')}
                                    style={{
                                        border: '1px dashed var(--border)', borderRadius: 10,
                                        padding: '20px 18px', display: 'flex', alignItems: 'center',
                                        gap: 14, cursor: 'pointer', background: 'var(--bg-1)',
                                        transition: 'border-color 0.2s, background 0.2s',
                                    }}
                                >
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 8,
                                        background: 'var(--bg-3)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Upload size={16} style={{ color: 'var(--text-2)' }} />
                                    </div>
                                    <div>
                                        <p style={{
                                            fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 500,
                                            color: 'var(--text-1)', margin: 0,
                                        }}>
                                            {loadingResumes ? 'Loading resumes…' : 'No resume selected'}
                                        </p>
                                        <p style={{
                                            fontFamily: 'Manrope, sans-serif', fontSize: 11,
                                            color: 'var(--text-2)', margin: '3px 0 0',
                                        }}>
                                            Upload a resume for personalized questions
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={fadeUp} style={{ height: 1, background: 'var(--border)' }} />

                    {/* Role */}
                    <motion.div variants={fadeUp}>
                        <p style={labelStyle}>Target Role</p>
                        <motion.div
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {ROLES.map(r => (
                                <motion.button
                                    key={r}
                                    variants={{ hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.34, 1.2, 0.64, 1] } } }}
                                    onClick={() => setRole(r)}
                                    whileHover={{ scale: 1.04, y: -1 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={pillStyle(r === role)}
                                >
                                    {r}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={fadeUp} style={{ height: 1, background: 'var(--border)' }} />

                    {/* Difficulty */}
                    <motion.div variants={fadeUp}>
                        <p style={labelStyle}>Difficulty</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            {DIFFICULTIES.map((d, i) => (
                                <motion.button
                                    key={d}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.06, duration: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
                                    onClick={() => setDifficulty(d)}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={pillStyle(d === difficulty)}
                                >
                                    {d}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={fadeUp} style={{ height: 1, background: 'var(--border)' }} />

                    {/* Round Type */}
                    <motion.div variants={fadeUp}>
                        <p style={labelStyle}>Round Type</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 12 }}>
                            {ROUNDS.map((r, i) => (
                                <motion.button
                                    key={r.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.07, duration: 0.35 }}
                                    onClick={() => setRound(r.id)}
                                    whileHover={{ x: r.id === round ? 0 : 4 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        padding: '14px 0', background: 'none', border: 'none',
                                        borderBottom: '1px solid var(--border)', cursor: 'pointer',
                                        textAlign: 'left', width: '100%',
                                        borderLeft: r.id === round ? '2px solid var(--amber)' : '2px solid transparent',
                                        paddingLeft: r.id === round ? 12 : 14,
                                        transition: 'border-color 0.2s, padding-left 0.2s',
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: r.id === round ? 600 : 400, color: r.id === round ? 'var(--text-0)' : 'var(--text-1)', margin: 0, transition: 'color 0.15s, font-weight 0.15s' }}>
                                            {r.label}
                                        </p>
                                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0' }}>
                                            {r.desc}
                                        </p>
                                    </div>
                                    <AnimatePresence>
                                        {r.id === round && (
                                            <motion.div
                                                key="dot"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                                                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT — Session Summary */}
                <motion.div
                    variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } } }}
                    style={{ position: 'sticky', top: 96 }}
                >
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                                Session Preview
                            </p>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <SummaryRow label="Resume" value={selectedResume ? (selectedResume.primary_role || 'Uploaded') : 'None'} highlight={!!selectedResume} />
                            <SummaryRow label="Role" value={role} />
                            <SummaryRow label="Difficulty" value={difficulty} />
                            <SummaryRow label="Round" value={selectedRound?.label} last />
                        </div>

                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={selectedRound?.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.22 }}
                                    style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}
                                >
                                    {selectedResume
                                        ? `Questions will be personalized based on your ${selectedResume.primary_role || 'resume'} profile.`
                                        : selectedRound?.desc
                                    }
                                </motion.p>
                            </AnimatePresence>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--rose)', marginBottom: 10 }}
                                >
                                    {error}
                                </motion.p>
                            )}

                            {!canStartInterview && !error && !subLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ padding: '10px 14px', background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.3)', borderRadius: 8, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}
                                >
                                    <Lock size={14} style={{ color: 'var(--rose)', flexShrink: 0 }} />
                                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--rose)', margin: 0, lineHeight: 1.4 }}>
                                        Interview limit reached. <span onClick={() => navigate('/pricing')} style={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Upgrade to Pro</span>
                                    </p>
                                </motion.div>
                            )}

                            <motion.button
                                onClick={handleStart}
                                disabled={loading || subLoading || (!canStartInterview && isFree)}
                                whileHover={(loading || (!canStartInterview && isFree)) ? {} : { scale: 1.02, boxShadow: '0 0 20px var(--accent-glow)' }}
                                whileTap={(loading || (!canStartInterview && isFree)) ? {} : { scale: 0.97 }}
                                style={{
                                    width: '100%', padding: '12px 0',
                                    background: (loading || (!canStartInterview && isFree)) ? 'var(--bg-3)' : 'var(--amber)',
                                    color: (loading || (!canStartInterview && isFree)) ? 'var(--text-2)' : 'var(--bg-0)',
                                    border: 'none', borderRadius: 8, cursor: (loading || (!canStartInterview && isFree)) ? 'not-allowed' : 'pointer',
                                    fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600,
                                    transition: 'background 0.2s, color 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    position: 'relative', overflow: 'hidden',
                                }}
                            >
                                {loading || subLoading ? (
                                    <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'flex' }}><Loader2 size={16} /></motion.div> {subLoading ? 'Verifying...' : 'Starting…'}</>
                                ) : !canStartInterview && isFree ? (
                                    <><Lock size={16} /> Upgrade to Start</>
                                ) : (
                                    'Start Interview'
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

const labelStyle = {
    fontFamily: 'Manrope, sans-serif', fontSize: 11, color: 'var(--text-2)',
    letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
}

const pillStyle = (active) => ({
    padding: '7px 16px', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: active ? 500 : 400,
    border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
    background: active ? 'var(--amber-dim)' : 'transparent',
    color: active ? 'var(--amber)' : 'var(--text-2)',
    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
    boxShadow: active ? '0 0 12px var(--amber-glow)' : 'none',
})

function SummaryRow({ label, value, last, highlight }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={value}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    style={{
                        fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 500,
                        color: highlight ? 'var(--amber)' : 'var(--text-0)',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}
                >
                    {highlight && (
                        <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: 'var(--amber)', display: 'inline-block',
                            boxShadow: '0 0 6px var(--amber-glow)',
                        }} />
                    )}
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    )
}

function Spinner() {
    return <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
}
