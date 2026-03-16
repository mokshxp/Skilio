import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import wsClient from '../services/websocket.js'
import { interviewApi } from '../services/api.js'
import { useInterview } from '../context/InterviewContext.jsx'

const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'go', 'rust', 'typescript']

export default function InterviewRoom() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getToken } = useAuth()
    const { setQuestion, setFeedback, addRoundScore, setWsStatus, wsStatus, currentQuestion, feedback, score } = useInterview()

    const [wsError, setWsError] = useState(null)
    const [answer, setAnswer] = useState('')
    const [code, setCode] = useState('# Write your solution here\n')
    const [language, setLanguage] = useState('python')
    const [output, setOutput] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [running, setRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(null)
    const [phase, setPhase] = useState('connecting') // connecting | question | feedback | ended
    const timerRef = useRef(null)

    // WebSocket setup
    useEffect(() => {
        let cleanup
            ; (async () => {
                const token = await getToken()
                wsClient.connect(id, token)
                setWsStatus('connecting')

                cleanup = [
                    wsClient.on('connected', () => { setWsStatus('connected'); setPhase('question') }),
                    wsClient.on('disconnected', () => { setWsStatus('disconnected'); setWsError('Connection lost. Auto-reconnecting…') }),
                    wsClient.on('error', () => { setWsStatus('error'); setWsError('WebSocket error. Check connection.') }),
                    wsClient.on('question', (d) => handleQuestion(d.payload)),
                    wsClient.on('feedback', (d) => handleFeedback(d.payload)),
                    wsClient.on('run_result', (d) => { setOutput(d.payload); setRunning(false) }),
                    wsClient.on('round_complete', (d) => { addRoundScore(d.payload); setPhase('feedback') }),
                    wsClient.on('interview_end', () => navigate(`/results/${id}`)),
                ]
            })()

        return () => {
            cleanup?.forEach((fn) => typeof fn === 'function' && fn())
            wsClient.disconnect()
            clearInterval(timerRef.current)
        }
    }, [id])

    const handleQuestion = useCallback((q) => {
        setQuestion(q)
        setAnswer('')
        setCode('# Write your solution here\n')
        setOutput(null)
        setFeedback(null)
        setPhase('question')
        if (q.time_limit_seconds) startTimer(q.time_limit_seconds)
    }, [setQuestion, setFeedback])

    const handleFeedback = useCallback((fb) => {
        setFeedback(fb)
        setPhase('feedback')
        clearInterval(timerRef.current)
        setTimeLeft(null)
    }, [setFeedback])

    const startTimer = (seconds) => {
        setTimeLeft(seconds)
        clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    const submitAnswer = async () => {
        setSubmitting(true)
        const isCoding = currentQuestion?.type === 'coding'
        if (isCoding) {
            wsClient.sendCode(code, language, currentQuestion.id)
        } else {
            wsClient.sendAnswer(answer, currentQuestion.id)
        }
        setSubmitting(false)
    }

    const runCode = () => {
        setRunning(true)
        setOutput(null)
        wsClient.runCode(code, language, currentQuestion?.id)
    }

    const isCoding = currentQuestion?.type === 'coding'

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-0)' }}>
            {/* Left Panel — Question */}
            <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-96 shrink-0 flex flex-col border-r overflow-y-auto"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <p className="label">Interview Room</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Session #{id?.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {wsStatus === 'connecting' ? (
                            <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
                                <span style={{
                                    position: 'absolute', inset: 0, borderRadius: '50%',
                                    background: 'var(--accent)', opacity: 0.6,
                                    animation: 'breathe 1.2s ease-in-out infinite'
                                }} />
                                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)' }} />
                            </span>
                        ) : (
                            <span className={wsStatus === 'connected' ? 'dot-live' : wsStatus === 'error' ? 'dot-dead' : 'dot-warn'} />
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-2)' }}>{wsStatus}</span>
                    </div>
                </div>

                {/* Timer */}
                {timeLeft != null && (
                    <motion.div
                        key={timeLeft < 30 ? 'urgent' : 'normal'}
                        initial={{ scale: 0.95, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mx-5 mt-4 px-4 py-3 rounded-xl flex items-center justify-between"
                        style={{
                            background: timeLeft < 30 ? 'rgba(251,113,133,0.1)' : 'var(--bg-3)',
                            border: `1px solid ${timeLeft < 30 ? 'rgba(251,113,133,0.3)' : 'var(--border)'}`,
                            animation: timeLeft < 15 ? 'timerUrgent 0.9s ease-in-out infinite' : 'none',
                        }}
                    >
                        <span className="label">Time Remaining</span>
                        <motion.span
                            key={timeLeft}
                            initial={{ scale: 1.15, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.18 }}
                            className="font-bold text-lg"
                            style={{
                                fontFamily: 'Fira Code, monospace',
                                color: timeLeft < 30 ? 'var(--rose)' : timeLeft < 60 ? 'var(--amber)' : 'var(--emerald)',
                            }}
                        >
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </motion.span>
                    </motion.div>
                )}

                {/* Question Display */}
                <div className="flex-1 px-5 py-4">
                    <AnimatePresence mode="wait">
                        {phase === 'connecting' && (
                            <motion.div key="conn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-full gap-4 text-center"
                            >
                                <Spinner size={32} />
                                <p style={{ color: 'var(--text-1)' }}>Connecting to interview session…</p>
                                {wsError && <p className="text-xs" style={{ color: 'var(--rose)' }}>{wsError}</p>}
                            </motion.div>
                        )}

                        {phase === 'question' && currentQuestion && (
                            <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <div className="mb-6">
                                    <p className="label mb-3" style={{ color: 'var(--amber)', letterSpacing: '0.05em' }}>AI Interviewer Question</p>
                                    <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }}>
                                        <QuestionPanel q={currentQuestion} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {phase === 'feedback' && feedback && (
                            <motion.div key="fb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <FeedbackPanel fb={feedback} score={score} onNext={() => wsClient.requestNextQuestion()} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Right Panel — Editor / Answer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <p className="label mb-3" style={{ color: 'var(--sky)', letterSpacing: '0.05em' }}>Your Answer</p>
                        {isCoding ? (
                            <CodingPanel
                                code={code} setCode={setCode} language={language} setLanguage={setLanguage}
                                output={output} running={running} submitting={submitting}
                                onRun={runCode} onSubmit={submitAnswer}
                                question={currentQuestion}
                            />
                        ) : (
                            <TheoryPanel
                                answer={answer} setAnswer={setAnswer}
                                submitting={submitting} onSubmit={submitAnswer}
                                phase={phase}
                            />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Reconnecting Overlay */}
            <AnimatePresence>
                {wsStatus === 'disconnected' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                    >
                        <div className="bg-white/10 p-8 rounded-2xl border border-white/20 text-center shadow-2xl">
                            <Spinner size={32} className="mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Connection Lost</h3>
                            <p className="text-sm opacity-80">Relaunching secure connection... Stand by.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function QuestionPanel({ q }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-amber">{q.type || 'Theory'}</span>
                {q.difficulty && <span className="badge-muted">{q.difficulty}</span>}
                {q.topic && <span className="badge-sky">{q.topic}</span>}
            </div>
            <h2 className="font-bold text-base leading-snug" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-0)' }}>
                {q.question || q.title}
            </h2>
            {q.description && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{q.description}</p>
            )}
            {q.constraints?.length > 0 && (
                <div>
                    <p className="label mb-2">Constraints</p>
                    <ul className="flex flex-col gap-1">
                        {q.constraints.map((c, i) => (
                            <li key={i} className="text-xs mono-data flex gap-2">
                                <span style={{ color: 'var(--amber)' }}>·</span> {c}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {q.examples?.length > 0 && (
                <div>
                    <p className="label mb-2">Examples</p>
                    {q.examples.map((ex, i) => (
                        <div key={i} className="rounded-lg p-3 mb-2 text-xs" style={{ background: 'var(--bg-3)', fontFamily: 'Fira Code, monospace' }}>
                            <div><span style={{ color: 'var(--text-2)' }}>Input: </span><span style={{ color: 'var(--amber)' }}>{ex.input}</span></div>
                            <div><span style={{ color: 'var(--text-2)' }}>Output: </span><span style={{ color: 'var(--emerald)' }}>{ex.output}</span></div>
                            {ex.explanation && <div className="mt-1" style={{ color: 'var(--text-2)' }}>{ex.explanation}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function FeedbackPanel({ fb, score, onNext }) {
    const scoreColor = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--amber)' : 'var(--rose)'
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 15 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                    style={{
                        background: `${scoreColor}20`, color: scoreColor, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem',
                        boxShadow: `0 0 18px ${scoreColor}50`,
                    }}
                >
                    {score ?? '—'}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                >
                    <p className="font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: scoreColor }}>
                        {score >= 75 ? 'Excellent!' : score >= 50 ? 'Good effort' : 'Needs improvement'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-2)' }}>Score out of 100</p>
                </motion.div>
            </div>
            {fb.feedback && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.35 }}
                >
                    <p className="label mb-2">AI Feedback</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{fb.feedback}</p>
                </motion.div>
            )}
            {fb.improvements?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.35 }}
                >
                    <p className="label mb-2">Improvements</p>
                    <ul className="flex flex-col gap-1.5">
                        {fb.improvements.map((imp, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.65 + i * 0.08, duration: 0.28 }}
                                className="text-xs flex gap-2" style={{ color: 'var(--text-1)' }}
                            >
                                <span style={{ color: 'var(--amber)' }}>→</span> {imp}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}
            <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 18px var(--amber-glow)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-amber btn-md w-full justify-center mt-2"
                onClick={onNext}
            >
                Next Question →
            </motion.button>
        </div>
    )
}

function CodingPanel({ code, setCode, language, setLanguage, output, running, submitting, onRun, onSubmit, question }) {
    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                <select className="select" style={{ width: 140 }} value={language} onChange={e => setLanguage(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="flex-1" />
                <button className="btn-outline btn-sm" onClick={onRun} disabled={running}>
                    {running ? <Spinner /> : '▶ Run'} Tests
                </button>
                <button className="btn-amber btn-sm" onClick={onSubmit} disabled={submitting}>
                    {submitting ? <Spinner /> : '↑ Submit'}
                </button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: '"Fira Code", monospace',
                        fontLigatures: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'gutter',
                    }}
                />
            </div>

            {/* Output Panel */}
            <AnimatePresence>
                {output && (
                    <motion.div
                        key="output"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t overflow-hidden"
                        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
                    >
                        <div className="px-4 py-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="label">Output</span>
                                {output.passed != null && (
                                    <span className={output.passed ? 'badge-emerald' : 'badge-rose'}>
                                        {output.passed ? '✓ Passed' : '✗ Failed'}
                                    </span>
                                )}
                                {output.time_ms != null && <span className="mono-data">{output.time_ms}ms</span>}
                            </div>
                            <pre className="text-xs overflow-auto max-h-32" style={{ fontFamily: 'Fira Code, monospace', color: output.error ? 'var(--rose)' : 'var(--emerald)' }}>
                                {output.stdout || output.error || JSON.stringify(output, null, 2)}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function TheoryPanel({ answer, setAnswer, submitting, onSubmit, phase }) {
    const disabled = phase === 'feedback' || submitting
    return (
        <div className="flex flex-col h-full p-6 gap-4">
            <div className="flex-1">
                <p className="label mb-2">Your Answer</p>
                <textarea
                    className="input w-full h-full resize-none"
                    style={{ minHeight: 300 }}
                    placeholder="Type your detailed answer here…"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    disabled={disabled}
                />
            </div>
            <div className="flex items-center justify-between">
                <span className="mono-data">{answer.length} chars</span>
                <button
                    className="btn-amber btn-lg"
                    onClick={onSubmit}
                    disabled={disabled || !answer.trim()}
                >
                    {submitting ? <Spinner /> : '↑ Submit Answer'}
                </button>
            </div>
        </div>
    )
}

function Spinner({ size = 16 }) {
    return (
        <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
    )
}
