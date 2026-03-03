import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chatApi } from '../services/api.js'

const QUICK_TAGS = [
    'Generate a 4-week study plan',
    'Explain my last interview results',
    'What topics should I focus on?',
    'Practice a mock HR question',
    'Review my coding weak points',
]

export default function CareerCopilot() {
    const location = useLocation()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState(location.state?.context || '')
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const bottomRef = useRef(null)
    const textareaRef = useRef(null)

    useEffect(() => {
        chatApi.history()
            .then(r => setMessages(r.data?.messages || []))
            .catch(() => setMessages([]))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (location.state?.context && !loading) handleSend(location.state.context)
    }, [loading])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, sending])

    const handleSend = async (text) => {
        const content = (text ?? input).trim()
        if (!content || sending) return
        setInput('')
        setSending(true)
        const userMsg = { role: 'user', content, id: Date.now() }
        setMessages(prev => [...prev, userMsg])
        try {
            const res = await chatApi.send(content)
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response, id: Date.now() + 1 }])
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}`, id: Date.now() + 1, error: true }])
        } finally {
            setSending(false)
        }
    }

    const onKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    const adjustHeight = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }

    return (
        <div className="copilot-container">

            {/* Header */}
            <div className="copilot-header">
                <p className="copilot-label">
                    AI Career Copilot
                </p>
                <h1 className="copilot-title">
                    Ask anything.
                </h1>
            </div>

            {/* Messages */}
            <div className="copilot-messages">
                {loading ? (
                    <LoadingDots />
                ) : messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="copilot-messages-list">
                        {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
                    </div>
                )}
                {sending && <TypingBubble />}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="copilot-input-area">
                {/* Quick tags */}
                <div className="copilot-quick-tags">
                    {QUICK_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => handleSend(tag)}
                            disabled={sending}
                            className="copilot-tag-btn"
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Input box */}
                <div className="copilot-input-box"
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-md)'}
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={e => { setInput(e.target.value); adjustHeight() }}
                        onKeyDown={onKey}
                        placeholder="Ask about your career, study plan, interview results…"
                        rows={1}
                        className="copilot-textarea"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || sending}
                        className="copilot-send-btn"
                        style={{
                            background: input.trim() && !sending ? 'var(--amber)' : 'var(--bg-3)',
                            cursor: input.trim() && !sending ? 'pointer' : 'default',
                            color: input.trim() && !sending ? 'var(--bg-0)' : 'var(--text-2)',
                        }}
                    >
                        {sending ? <Spinner /> : <SendIcon />}
                    </button>
                </div>
                <p className="copilot-hint">
                    Enter to send · Shift+Enter for newline
                </p>
            </div>

            <style>{copilotCSS}</style>
        </div>
    )
}

function ChatMessage({ msg }) {
    const isUser = msg.role === 'user'
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`copilot-msg ${isUser ? 'copilot-msg-user' : 'copilot-msg-ai'}`}
        >
            <p className="copilot-msg-label">
                {isUser ? 'You' : 'Copilot'}
            </p>
            <div
                className={`copilot-msg-bubble ${isUser ? 'copilot-bubble-user' : ''} ${msg.error ? 'copilot-bubble-error' : ''}`}
                style={{
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                }}
            >
                <FormattedContent content={msg.content} />
            </div>
        </motion.div>
    )
}

function FormattedContent({ content }) {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('```')) {
                    const code = part.slice(3, -3).replace(/^\w+\n/, '').trim()
                    return (
                        <pre key={i} className="copilot-code-block">{code}</pre>
                    )
                }
                return <span key={i}>{part}</span>
            })}
        </>
    )
}

function TypingBubble() {
    return (
        <div className="copilot-typing">
            <p className="copilot-msg-label">Copilot</p>
            <div className="copilot-typing-bubble">
                {[0, 1, 2].map(i => (
                    <motion.div key={i} className="copilot-typing-dot"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.13 }} />
                ))}
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="copilot-empty">
            <p className="copilot-empty-title">Ready when you are.</p>
            <p className="copilot-empty-sub">Ask anything about your career, study plan, or interview performance.</p>
        </div>
    )
}

function LoadingDots() {
    return (
        <div style={{ display: 'flex', gap: 6, padding: 24 }}>
            {[0, 1, 2].map(i => (
                <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bg-3)' }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
            ))}
        </div>
    )
}

function Spinner() {
    return <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
}
function SendIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" /></svg>
}

/* ── Responsive CSS ──────────────────────────────────────────── */
const copilotCSS = `
.copilot-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 160px);
    padding: 0 16px;
    box-sizing: border-box;
}

.copilot-header {
    margin-bottom: 24px;
    flex-shrink: 0;
}

.copilot-label {
    font-family: Manrope, sans-serif;
    font-size: 11px;
    color: var(--text-2);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.copilot-title {
    font-family: Outfit, sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--text-0);
    letter-spacing: -0.02em;
    margin: 0;
}

.copilot-messages {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}

.copilot-messages-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 16px;
}

.copilot-input-area {
    flex-shrink: 0;
    padding-top: 16px;
    padding-bottom: 8px;
}

.copilot-quick-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}

.copilot-tag-btn {
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    font-family: Manrope, sans-serif;
    font-size: 12px;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
}

.copilot-tag-btn:hover:not(:disabled) {
    border-color: var(--amber);
    color: var(--amber);
}

.copilot-input-box {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    border: 1px solid var(--border-md);
    border-radius: 12px;
    padding: 12px 16px;
    background: var(--bg-1);
    transition: border-color 0.15s;
}

.copilot-textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: Manrope, sans-serif;
    font-size: 14px;
    color: var(--text-0);
    line-height: 1.5;
    min-height: 24px;
    min-width: 0;
}

.copilot-send-btn {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
}

.copilot-hint {
    font-family: Manrope, sans-serif;
    font-size: 11px;
    color: var(--text-2);
    margin-top: 8px;
    text-align: center;
}

/* Message bubbles */
.copilot-msg {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.copilot-msg-user {
    align-items: flex-end;
}

.copilot-msg-ai {
    align-items: flex-start;
}

.copilot-msg-label {
    font-family: Manrope, sans-serif;
    font-size: 11px;
    color: var(--text-2);
    margin-bottom: 4px;
}

.copilot-msg-bubble {
    max-width: 78%;
    padding: 12px 16px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    font-family: Manrope, sans-serif;
    font-size: 14px;
    line-height: 1.65;
    color: var(--text-0);
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
}

.copilot-bubble-user {
    background: var(--amber-dim);
    border-color: rgba(245,158,11,0.25);
}

.copilot-bubble-error {
    background: rgba(251,113,133,0.08);
    border-color: rgba(251,113,133,0.25);
    color: var(--rose);
}

.copilot-code-block {
    margin: 10px 0;
    padding: 12px 14px;
    border-radius: 8px;
    background: var(--bg-0);
    font-family: Fira Code, monospace;
    font-size: 13px;
    color: var(--emerald);
    overflow-x: auto;
    white-space: pre;
    max-width: 100%;
}

.copilot-typing {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: 16px;
}

.copilot-typing-bubble {
    padding: 12px 18px;
    border-radius: 16px 16px 16px 4px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    display: flex;
    gap: 4px;
    align-items: center;
}

.copilot-typing-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--amber);
}

.copilot-empty {
    text-align: center;
    padding-top: 80px;
}

.copilot-empty-title {
    font-family: Outfit, sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-0);
    margin-bottom: 8px;
}

.copilot-empty-sub {
    font-family: Manrope, sans-serif;
    font-size: 14px;
    color: var(--text-2);
}

/* ── Tablet (≤768px) ──────────────────────────────────────── */
@media (max-width: 768px) {
    .copilot-container {
        height: calc(100vh - 120px);
        padding: 0 12px;
    }

    .copilot-title {
        font-size: 24px;
    }

    .copilot-header {
        margin-bottom: 16px;
    }

    .copilot-msg-bubble {
        max-width: 85%;
        padding: 10px 14px;
        font-size: 13.5px;
    }

    .copilot-quick-tags {
        gap: 6px;
        margin-bottom: 10px;
    }

    .copilot-tag-btn {
        font-size: 11px;
        padding: 4px 10px;
    }

    .copilot-empty {
        padding-top: 48px;
    }

    .copilot-empty-title {
        font-size: 20px;
    }

    .copilot-empty-sub {
        font-size: 13px;
    }
}

/* ── Mobile (≤480px) ──────────────────────────────────────── */
@media (max-width: 480px) {
    .copilot-container {
        height: calc(100vh - 100px);
        height: calc(100dvh - 100px);
        padding: 0 8px;
    }

    .copilot-header {
        margin-bottom: 12px;
    }

    .copilot-label {
        font-size: 10px;
    }

    .copilot-title {
        font-size: 20px;
    }

    .copilot-messages-list {
        gap: 16px;
    }

    .copilot-msg-bubble {
        max-width: 90%;
        padding: 10px 12px;
        font-size: 13px;
        line-height: 1.55;
    }

    .copilot-code-block {
        font-size: 11.5px;
        padding: 10px 12px;
    }

    .copilot-quick-tags {
        gap: 6px;
        margin-bottom: 8px;
        overflow-x: auto;
        flex-wrap: nowrap;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding-bottom: 4px;
    }

    .copilot-quick-tags::-webkit-scrollbar {
        display: none;
    }

    .copilot-tag-btn {
        font-size: 11px;
        padding: 4px 10px;
        flex-shrink: 0;
    }

    .copilot-input-box {
        padding: 10px 12px;
        gap: 8px;
        border-radius: 10px;
    }

    .copilot-textarea {
        font-size: 14px;
    }

    .copilot-send-btn {
        width: 32px;
        height: 32px;
    }

    .copilot-hint {
        font-size: 10px;
        margin-top: 6px;
    }

    .copilot-empty {
        padding-top: 32px;
        padding-left: 16px;
        padding-right: 16px;
    }

    .copilot-empty-title {
        font-size: 18px;
    }

    .copilot-empty-sub {
        font-size: 13px;
        line-height: 1.5;
    }
}
`
