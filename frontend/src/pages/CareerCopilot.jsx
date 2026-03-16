import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Menu, Trash2, Zap } from 'lucide-react'
import { chatApi } from '../services/api.js'

import CopilotSidebar from '../components/copilot/CopilotSidebar.jsx'
import ChatMessage from '../components/copilot/ChatMessage.jsx'
import TypingIndicator from '../components/copilot/TypingIndicator.jsx'
import SuggestionCards from '../components/copilot/SuggestionCards.jsx'
import ChatInput from '../components/copilot/ChatInput.jsx'
import InsightsPanel from '../components/copilot/InsightsPanel.jsx'

export default function CareerCopilot() {
    const location = useLocation()
    const [messages, setMessages] = useState([])
    const [sessions, setSessions] = useState([])
    const [activeConvId, setActiveConvId] = useState(null)
    const [input, setInput] = useState(location.state?.context || '')
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const bottomRef = useRef(null)

    // Load chat sessions
    useEffect(() => {
        chatApi.sessions()
            .then(r => {
                const loaded = r.sessions || [];
                setSessions(loaded);
                if (loaded.length > 0) {
                    loadChat(loaded[0].id);
                } else {
                    handleNewChat();
                }
            })
            .catch((e) => {
                console.warn("Load sessions error:", e.message);
                setLoading(false);
            })
    }, [])

    const loadChat = async (id) => {
        setLoading(true);
        setActiveConvId(id);
        try {
            const res = await chatApi.history(id);
            setMessages(res.messages || []);
        } catch (e) {
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = async () => {
        setLoading(true);
        try {
            const res = await chatApi.createSession("New Conversation");
            const newSess = res.session;
            setSessions(prev => [newSess, ...prev]);
            setActiveConvId(newSess.id);
            setMessages([]);
        } catch (e) {
            alert("New chat error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-send context message on load
    useEffect(() => {
        if (location.state?.context && !loading && activeConvId) {
            handleSend(location.state.context)
        }
    }, [loading, activeConvId])

    // Scroll to bottom on new messages or typing state changes
    useEffect(() => {
        if (messages.length > 0 || sending) {
            // Tiny timeout ensures the DOM and Framer Motion elements have painted
            const timer = setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [messages, sending])

    const handleSend = async (text) => {
        const content = (text ?? input).trim()
        if (!content || sending || !activeConvId) return
        setInput('')
        setSending(true)

        const isAction = ['study_plan', 'explain_results', 'weak_points', 'hr_question', 'focus_topics'].includes(content);

        const actionLabels = {
            study_plan: "Generate a 4-week DSA study plan",
            explain_results: "Explain my last interview results",
            weak_points: "Review my coding weak points",
            hr_question: "Practice a mock HR question",
            focus_topics: "What topics should I focus on?"
        };

        const displayContent = isAction ? actionLabels[content] : content;
        const userMsg = { role: 'user', content: displayContent, id: Date.now() }
        setMessages(prev => [...prev, userMsg])

        try {
            let res;
            if (isAction) {
                res = await chatApi.quickAction(content, activeConvId);
            } else {
                res = await chatApi.send(content, activeConvId);
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.response,
                id: Date.now() + 1,
            }])

            // Update session title if it was "New Conversation" locally
            setSessions(prev => prev.map(s => {
                if (s.id === activeConvId && s.title === "New Conversation") {
                    let newTitle = isAction
                        ? "Quick Action: " + content.replace(/_/g, ' ')
                        : content.substring(0, 30);
                    return { ...s, title: newTitle };
                }
                return s;
            }));

        } catch (e) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${e.message}`,
                id: Date.now() + 1,
                error: true,
            }])
        } finally {
            setSending(false)
        }
    }

    const deleteConversation = async (idToDel = activeConvId) => {
        if (!idToDel) return;
        try {
            await chatApi.deleteSession(idToDel);
            // Remove from list
            const remaining = sessions.filter(s => s.id !== idToDel);
            setSessions(remaining);
            if (idToDel === activeConvId) {
                if (remaining.length > 0) {
                    loadChat(remaining[0].id);
                } else {
                    handleNewChat();
                }
            }
        } catch (e) {
            console.error("Failed to delete chat", e);
        }
    }

    return (
        <div className="cop-layout">
            {/* Left Sidebar */}
            <CopilotSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                activeConvId={activeConvId}
                onNewChat={handleNewChat}
                onSelectChat={loadChat}
                onDeleteChat={deleteConversation}
                conversations={sessions}
            />

            {/* Center — Main Chat */}
            <div className="cop-center">
                {/* Chat Header */}
                <div className="cop-chat-header">
                    <div className="cop-chat-header-left">
                        {sidebarCollapsed && (
                            <button
                                className="cop-header-icon-btn"
                                onClick={() => setSidebarCollapsed(false)}
                                title="Show sidebar"
                            >
                                <Menu size={18} />
                            </button>
                        )}
                        <div>
                            <h1 className="cop-chat-title">AI Career Copilot</h1>
                            <div className="cop-model-badge">
                                <Zap size={11} />
                                <span>Llama 3.1 70B · Fast</span>
                            </div>
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <button className="cop-header-icon-btn cop-header-clear" onClick={() => deleteConversation()} title="Clear conversation">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Chat Messages */}
                <div className="cop-chat-scroll">
                    {loading ? (
                        <div className="cop-loading">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="cop-loading-bar" style={{ animationDelay: `${i * 0.2}s`, width: `${60 - i * 15}%` }} />
                            ))}
                        </div>
                    ) : messages.length === 0 && !sending ? (
                        <SuggestionCards onSelect={(val) => {
                            if (val) handleSend(val);
                        }} disabled={sending} />
                    ) : (
                        <div className="cop-messages-list">
                            {messages.map((msg, i) => (
                                <ChatMessage key={msg.id} msg={msg} index={i} />
                            ))}
                        </div>
                    )}

                    <AnimatePresence>
                        {sending && <TypingIndicator />}
                    </AnimatePresence>

                    <div ref={bottomRef} />
                </div>

                {/* Chat Input */}
                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSend={() => handleSend()}
                    sending={sending || loading}
                />
            </div>

            {/* Right — Insights Panel */}
            <div className="cop-right">
                <InsightsPanel />
            </div>

            <style>{copilotStyles}</style>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   CSS — Modern AI Chat Interface
   ═══════════════════════════════════════════════════════════════ */
const copilotStyles = `

/* ── LAYOUT ───────────────────────────────────────────────── */
.cop-layout {
    display: flex;
    height: calc(100vh - 65px); /* 100vh - nav (65) */
    overflow: hidden;
    margin: -48px -32px -32px;
    background: var(--bg-0);
}

.cop-center {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
}

.cop-right {
    width: 280px;
    flex-shrink: 0;
    overflow-y: auto;
    border-left: 1px solid var(--border);
}

/* ── SIDEBAR ──────────────────────────────────────────────── */
.cop-sidebar {
    flex-shrink: 0;
    overflow: hidden;
    background: var(--bg-1);
    position: relative;
    z-index: 10;
}

.cop-sidebar--collapsed {
    width: 0 !important;
    border: none;
}

.cop-sidebar-overlay {
    display: none;
}

.cop-sidebar-inner {
    width: 260px;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px 12px;
    gap: 8px;
}

.cop-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 12px;
}

.cop-sidebar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: Outfit, sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: var(--text-0);
}

.cop-sidebar-collapse-btn {
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: all 0.15s;
}
.cop-sidebar-collapse-btn:hover {
    background: var(--bg-3);
    color: var(--text-0);
}

.cop-new-chat-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    border: 1px dashed var(--border-md);
    border-radius: 10px;
    background: transparent;
    color: var(--text-1);
    font-family: Manrope, sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.cop-new-chat-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
}

.cop-sidebar-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8px;
}

.cop-sidebar-group-label {
    font-family: Manrope, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-2);
    padding: 0 10px;
    margin-bottom: 4px;
}

.cop-sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-1);
    font-family: Manrope, sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
}
.cop-sidebar-item:hover {
    background: var(--bg-3);
    color: var(--text-0);
}
.cop-sidebar-item--active {
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 600;
}
.cop-sidebar-item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.cop-sidebar-item-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.cop-sidebar-item-delete {
    position: absolute;
    right: 8px;
    background: transparent;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    opacity: 0;
    transition: opacity 0.2s, background 0.2s, color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.cop-sidebar-item-wrapper:hover .cop-sidebar-item-delete {
    opacity: 1;
}
.cop-sidebar-item-delete:hover {
    color: var(--rose);
    background: rgba(251, 113, 133, 0.1);
}

/* ── CHAT HEADER ──────────────────────────────────────────── */
.cop-chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    background: var(--bg-0);
    backdrop-filter: blur(12px);
}

.cop-chat-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cop-chat-title {
    font-family: Outfit, sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: var(--text-0);
    letter-spacing: -0.02em;
    margin: 0;
    line-height: 1.2;
}

.cop-model-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: Fira Code, monospace;
    font-size: 10px;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 2px 8px;
    border-radius: 20px;
    margin-top: 2px;
}

.cop-header-icon-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    padding: 7px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
}
.cop-header-icon-btn:hover {
    background: var(--bg-3);
    color: var(--text-0);
    border-color: var(--border-md);
}
.cop-header-clear:hover {
    color: var(--rose);
    border-color: rgba(251, 113, 133, 0.3);
    background: rgba(251, 113, 133, 0.08);
}

/* ── CHAT SCROLL AREA ─────────────────────────────────────── */
.cop-chat-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
}

.cop-messages-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* ── MESSAGE BUBBLES ──────────────────────────────────────── */
.cop-message {
    display: flex;
    gap: 12px;
    max-width: 85%;
}
.cop-message--user {
    align-self: flex-end;
    flex-direction: row-reverse;
}
.cop-message--ai {
    align-self: flex-start;
}

.cop-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}
.cop-avatar--user {
    background: linear-gradient(135deg, var(--accent), var(--accent-soft));
    color: #0b0e14;
}
.cop-avatar--ai {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
}

.cop-message-content {
    flex: 1;
    min-width: 0;
}

.cop-message-label {
    font-family: Manrope, sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-2);
    margin-bottom: 4px;
    letter-spacing: 0.02em;
}

.cop-message-bubble {
    padding: 14px 18px;
    font-family: Manrope, sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-0);
    word-break: break-word;
}

.cop-bubble--user {
    background: linear-gradient(135deg, rgba(255,183,3,0.12), rgba(255,183,3,0.06));
    border: 1px solid rgba(255,183,3,0.2);
    border-radius: 18px 18px 4px 18px;
}

.cop-bubble--ai {
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 18px 18px 18px 4px;
}

.cop-bubble--error {
    background: rgba(251,113,133,0.06) !important;
    border-color: rgba(251,113,133,0.25) !important;
    color: var(--rose) !important;
}

/* ── MARKDOWN STYLES ──────────────────────────────────────── */
.cop-markdown {
    overflow-wrap: anywhere;
}
.cop-md-heading {
    font-family: Outfit, sans-serif;
    font-weight: 700;
    margin: 16px 0 8px;
    color: var(--text-0);
}
.cop-md-p {
    margin: 6px 0;
}
.cop-md-list {
    padding-left: 20px;
    margin: 8px 0;
}
.cop-md-list--ordered {
    list-style-type: decimal;
}
.cop-md-li {
    margin: 4px 0;
    line-height: 1.6;
}
.cop-md-strong {
    color: var(--accent);
    font-weight: 700;
}
.cop-md-blockquote {
    border-left: 3px solid var(--accent);
    padding: 8px 16px;
    margin: 12px 0;
    background: var(--accent-dim);
    border-radius: 0 8px 8px 0;
    color: var(--text-1);
    font-style: italic;
}
.cop-inline-code {
    background: var(--bg-3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: Fira Code, monospace;
    font-size: 0.88em;
    color: var(--emerald);
}
.cop-code-block {
    margin: 12px 0;
    padding: 14px 16px;
    border-radius: 10px;
    background: var(--bg-0);
    border: 1px solid var(--border);
    font-family: Fira Code, monospace;
    font-size: 13px;
    color: var(--emerald);
    overflow-x: auto;
    white-space: pre;
    line-height: 1.6;
}

/* ── TYPING INDICATOR ─────────────────────────────────────── */
.cop-typing-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 18px 18px 18px 4px;
}
.cop-typing-text {
    font-family: Manrope, sans-serif;
    font-size: 13px;
    color: var(--text-2);
    font-style: italic;
}
.cop-typing-dots {
    display: flex;
    gap: 4px;
}
.cop-typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    display: inline-block;
}

/* ── SUGGESTION CARDS ─────────────────────────────────────── */
.cop-suggestions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 20px;
}
.cop-suggestions-header {
    text-align: center;
    margin-bottom: 32px;
}
.cop-suggestions-icon {
    font-size: 36px;
    margin-bottom: 12px;
}
.cop-suggestions-title {
    font-family: Outfit, sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: var(--text-0);
    letter-spacing: -0.02em;
    margin: 0 0 8px;
}
.cop-suggestions-sub {
    font-family: Manrope, sans-serif;
    font-size: 14px;
    color: var(--text-2);
}
.cop-suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    max-width: 520px;
    width: 100%;
}
.cop-suggestion-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}
.cop-suggestion-card:hover {
    border-color: var(--border-hi);
    background: var(--bg-2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.cop-suggestion-icon {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--bg-3);
    display: flex;
    align-items: center;
    justify-content: center;
}
.cop-suggestion-text {
    font-family: Manrope, sans-serif;
    font-size: 13px;
    color: var(--text-1);
    line-height: 1.4;
}

/* ── INPUT AREA ───────────────────────────────────────────── */
.cop-input-area {
    flex-shrink: 0;
    padding: 16px 24px 12px;
    border-top: 1px solid var(--border);
    background: var(--bg-0);
}
.cop-input-box {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-1);
    border: 1px solid var(--border-md);
    border-radius: 14px;
    transition: all 0.2s;
}
.cop-input-box:focus-within {
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
}
.cop-input-box--active {
    border-color: var(--accent);
}
.cop-textarea {
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
    max-height: 160px;
    min-width: 0;
}
.cop-textarea::placeholder {
    color: var(--text-2);
}
.cop-send-btn {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    background: var(--bg-3);
    color: var(--text-2);
    transition: all 0.2s;
}
.cop-send-btn--active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
}
.cop-send-btn--active:hover {
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.45);
    transform: translateY(-1px);
}
.cop-input-hint {
    font-family: Manrope, sans-serif;
    font-size: 11px;
    color: var(--text-2);
    text-align: center;
    margin-top: 8px;
}
.cop-input-hint kbd {
    background: var(--bg-3);
    padding: 1px 5px;
    border-radius: 4px;
    font-family: Fira Code, monospace;
    font-size: 10px;
    border: 1px solid var(--border);
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
.cop-spinner {
    animation: spin 1s linear infinite;
}

/* ── LOADING SKELETON ─────────────────────────────────────── */
.cop-loading {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 48px 24px;
}
.cop-loading-bar {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, var(--bg-2) 25%, var(--bg-3) 50%, var(--bg-2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ── INSIGHTS PANEL ───────────────────────────────────────── */
.cop-insights {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.cop-insights-title {
    font-family: Outfit, sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-0);
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    margin: 0;
}
.cop-insight-card {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px;
}
.cop-insight-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: Manrope, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-2);
    margin-bottom: 8px;
}
.cop-insight-value {
    font-family: Outfit, sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--accent);
    margin: 0;
}

/* Skill bars */
.cop-skill-bars {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.cop-skill-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.cop-skill-info {
    display: flex;
    justify-content: space-between;
    font-family: Manrope, sans-serif;
    font-size: 12px;
}
.cop-skill-name { color: var(--text-1); }
.cop-skill-score { color: var(--text-2); font-family: Fira Code, monospace; font-size: 11px; }
.cop-skill-track {
    height: 5px;
    border-radius: 3px;
    background: var(--bg-3);
    overflow: hidden;
}
.cop-skill-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1s ease;
}

/* Topics */
.cop-topics-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.cop-topic-tag {
    padding: 4px 10px;
    border-radius: 20px;
    background: var(--bg-3);
    border: 1px solid var(--border);
    font-family: Manrope, sans-serif;
    font-size: 11px;
    color: var(--text-1);
    transition: all 0.15s;
}
.cop-topic-tag:hover {
    border-color: var(--accent);
    color: var(--accent);
}

/* Feedback */
.cop-insight-feedback {
    font-family: Manrope, sans-serif;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--text-1);
    margin: 0;
    font-style: italic;
}

/* ── RESPONSIVE ───────────────────────────────────────────── */

/* Tablet — hide right panel */
@media (max-width: 1024px) {
    .cop-right {
        display: none;
    }
}

/* Mobile — sidebar becomes overlay */
@media (max-width: 768px) {
    .cop-layout {
        margin: -48px -32px -80px;
    }
    .cop-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 100;
        box-shadow: 4px 0 24px rgba(0,0,0,0.5);
    }
    .cop-sidebar--collapsed {
        box-shadow: none;
    }
    .cop-sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 99;
    }
    .cop-right {
        display: none;
    }
    .cop-chat-scroll {
        padding: 16px;
    }
    .cop-input-area {
        padding: 12px 16px 8px;
    }
    .cop-message {
        max-width: 95%;
    }
    .cop-suggestions-grid {
        grid-template-columns: 1fr;
    }
    .cop-suggestions-title {
        font-size: 22px;
    }
}
`
