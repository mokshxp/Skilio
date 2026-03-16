import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trash2, MessageSquare, Play } from 'lucide-react'
import { resumeApi } from '../services/api.js'

const ACCEPTED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ACCEPTED_EXT = '.pdf,.doc,.docx'

const GUIDELINES = [
    'Ensure a quiet, distraction-free environment',
    'Use a stable internet connection throughout',
    'Allocate 30–60 uninterrupted minutes per session',
    'Coding rounds require full keyboard focus — close other tabs',
    'For behavioural answers, use the STAR method (Situation · Task · Action · Result)',
    'Do not refresh the page during an active interview',
]

const HOW_IT_WORKS = [
    { n: '01', label: 'Upload Resume', desc: 'PDF or Word document — AI reads your full profile' },
    { n: '02', label: 'Skills Extracted', desc: 'Technologies, roles, and experience automatically parsed' },
    { n: '03', label: 'Adaptive Questions', desc: 'Questions generated based on your specific background' },
    { n: '04', label: 'Live Evaluation', desc: 'Code runs in a sandbox. Answers scored in real time' },
    { n: '05', label: 'Performance Report', desc: 'Detailed breakdown ready immediately after the session' },
]

export default function ResumeUpload() {
    const [dragging, setDragging] = useState(false)
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [resumes, setResumes] = useState([])
    const inputRef = useRef()
    const navigate = useNavigate()

    const fetchResumes = useCallback(async () => {
        try {
            const res = await resumeApi.list()
            setResumes(res || [])
        } catch (e) {
            console.error('Failed to fetch resumes', e)
        }
    }, [])

    useEffect(() => {
        fetchResumes()
    }, [fetchResumes])

    const handleDelete = async (id, e) => {
        e.stopPropagation()
        if (!window.confirm('Delete this resume?')) return
        try {
            await resumeApi.delete(id)
            fetchResumes()
        } catch (err) {
            console.error(err)
        }
    }

    const handleTouch = async (id) => {
        try {
            await resumeApi.touch(id)
            navigate('/copilot', { state: { context: "I'd like to discuss the resume I just activated." } })
        } catch (err) {
            console.error(err)
        }
    }

    const handleFile = useCallback((f) => {
        if (!f) return
        if (!ACCEPTED.includes(f.type)) { setError('Please upload a PDF or Word document.'); return }
        if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
        setFile(f); setError(null); setResult(null)
        uploadFile(f)
    }, [])

    const uploadFile = async (f) => {
        setUploading(true); setProgress(0)
        const fd = new FormData()
        fd.append('resume', f)
        try {
            const res = await resumeApi.upload(fd, (pct) => setProgress(pct))
            setResult(res)
            fetchResumes()
        } catch (e) {
            setError(e.message || 'Upload failed.')
        } finally { setUploading(false) }
    }

    const onDrop = (e) => {
        e.preventDefault(); setDragging(false)
        handleFile(e.dataTransfer.files[0])
    }

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* ── Header ─────────────────────────────────────────── */}
            <div style={{ marginBottom: 48 }}>
                <p style={MONO_LABEL}>Preparation Gateway</p>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', margin: '6px 0 8px' }}>
                    Upload your resume.
                </h1>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    AI extracts your skills and tailors every interview question to your profile.
                </p>
            </div>

            {/* ── Upload zone ────────────────────────────────────── */}
            <motion.div
                animate={{ borderColor: dragging ? 'var(--accent)' : error ? 'var(--rose)' : 'var(--border-md)' }}
                transition={{ duration: 0.15 }}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                style={{
                    border: '1px dashed var(--border-md)', borderRadius: 10, padding: '52px 40px',
                    textAlign: 'center', cursor: uploading ? 'default' : 'pointer',
                    background: dragging ? 'var(--accent-dim)' : 'var(--bg-1)',
                    transition: 'background 0.15s, box-shadow 0.15s',
                    boxShadow: dragging ? '0 0 0 4px var(--accent-dim)' : 'none',
                }}
            >
                <input ref={inputRef} type="file" accept={ACCEPTED_EXT} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

                {uploading ? (
                    <div>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: 'var(--text-1)', marginBottom: 20 }}>
                            Analysing <strong style={{ color: 'var(--text-0)' }}>{file?.name}</strong>…
                        </p>
                        <div style={{ maxWidth: 320, margin: '0 auto', height: 2, background: 'var(--bg-3)', borderRadius: 2 }}>
                            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                                style={{ height: '100%', borderRadius: 2, background: 'var(--accent)' }} />
                        </div>
                        <p style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, color: 'var(--accent)', marginTop: 8, letterSpacing: '0.08em' }}>{progress}%</p>
                    </div>
                ) : file && result ? (
                    <div>
                        <div style={{ display: 'inline-flex', width: 36, height: 36, borderRadius: '50%', background: 'var(--emerald-dim)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12" /></svg>
                        </div>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: 'var(--emerald)', fontWeight: 600 }}>Resume analysed</p>
                        <p style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, color: 'var(--text-2)', marginTop: 4, marginBottom: 16 }}>{file.name}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate('/start', { state: { role: result.structured?.primary_role, resumeId: result.id } }); }}
                            style={{
                                background: 'var(--accent)', color: '#000', border: 'none',
                                padding: '8px 24px', borderRadius: 8, fontSize: 13,
                                fontWeight: 700, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 4px 12px var(--accent-glow)'
                            }}
                        >
                            <Play size={14} fill="currentColor" /> Start Interview
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-3)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: dragging ? 'var(--accent)' : 'var(--text-1)', marginBottom: 4, transition: 'color 0.15s' }}>
                            {dragging ? 'Drop to upload' : 'Drop your resume or click to browse'}
                        </p>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, color: 'var(--text-2)' }}>PDF or Word · Max 10 MB</p>
                    </div>
                )}
            </motion.div>

            {error && <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--rose)', marginTop: 10 }}>{error}</p>}

            {/* Extracted results */}
            <AnimatePresence>
                {result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginTop: 36 }}>
                        <Divider label="AI Analysis" />
                        {result.structured?.summary && (
                            <div style={{ marginBottom: 28 }}>
                                <p style={MONO_LABEL}>Summary</p>
                                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: 'var(--text-1)', lineHeight: 1.7, marginTop: 10 }}>{result.structured.summary}</p>
                            </div>
                        )}
                        {result.structured?.skills?.length > 0 && (
                            <div>
                                <p style={MONO_LABEL}>Extracted Skills</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                    {result.structured.skills.map((s, i) => (
                                        <motion.span key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                                            style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-1)', background: 'var(--bg-2)' }}>
                                            {s}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Manage Resumes ────────────────────────────────── */}
            {resumes.length > 0 && (
                <div style={{ marginTop: 64 }}>
                    <Divider label="Your Resumes" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {resumes.map(r => (
                            <motion.div
                                key={r.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => handleTouch(r.id)}
                                style={{
                                    padding: '16px 20px', background: 'var(--bg-2)', border: '1px solid var(--border)',
                                    borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    transition: 'border-color 0.2s'
                                }}
                            >
                                <div>
                                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text-0)', margin: 0 }}>
                                        {r.primary_role || 'Software Engineer'}
                                    </p>
                                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                                        Uploaded {new Date(r.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate('/start', { state: { role: r.primary_role, resumeId: r.id } }); }}
                                        style={{ background: 'var(--bg-3)', color: 'var(--text-0)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                                    >
                                        <Play size={12} fill="currentColor" /> Practice
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleTouch(r.id); }}
                                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                                    >
                                        <MessageSquare size={12} /> Copilot
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(r.id, e)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: 4 }}
                                        title="Delete resume"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Prepare section ────────────────────────────────── */}
            <div style={{ marginTop: 64 }}>
                <Divider label="Before You Start" />

                {/* Guidelines panel */}
                <div style={{
                    borderLeft: '3px solid var(--accent)', paddingLeft: 20, marginBottom: 48,
                }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-0)', marginBottom: 16, letterSpacing: '-0.01em' }}>
                        Prepare for your interview
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {GUIDELINES.map((g, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--accent)', marginTop: 3, flexShrink: 0 }}>{'→'}</span>
                                <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.55 }}>{g}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How it works */}
                <div>
                    <p style={MONO_LABEL}>How it works</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 20 }}>
                        {HOW_IT_WORKS.map(({ n, label, desc }, i) => (
                            <div key={n} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 28, paddingBottom: 24,
                                borderBottom: i < HOW_IT_WORKS.length - 1 ? '1px solid var(--border)' : 'none',
                                marginBottom: i < HOW_IT_WORKS.length - 1 ? 24 : 0,
                            }}>
                                <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 20, fontWeight: 700, color: 'var(--accent)', minWidth: 32, lineHeight: 1.2, opacity: 0.85 }}>
                                    {n}
                                </span>
                                <div>
                                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-0)', margin: 0 }}>{label}</p>
                                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const MONO_LABEL = {
    fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--text-2)',
    letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0,
}

function Divider({ label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ ...MONO_LABEL }}>{label}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
    )
}
