import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, ChevronLeft, Sparkles, Trash2 } from 'lucide-react'

const DEMO_CONVERSATIONS = [
    { id: 'current', title: 'New Conversation', time: 'now', group: 'Today' },
]

export default function CopilotSidebar({ collapsed, onToggle, activeConvId, onNewChat, onSelectChat, onDeleteChat, conversations = DEMO_CONVERSATIONS }) {
    const grouped = groupByTime(conversations)

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        className="cop-sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onToggle}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                className={`cop-sidebar ${collapsed ? 'cop-sidebar--collapsed' : ''}`}
                initial={false}
                animate={{ width: collapsed ? 0 : 260, opacity: collapsed ? 0 : 1 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
                <div className="cop-sidebar-inner">
                    {/* Header */}
                    <div className="cop-sidebar-header">
                        <div className="cop-sidebar-brand">
                            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                            <span>AI Copilot</span>
                        </div>
                        <button className="cop-sidebar-collapse-btn" onClick={onToggle} title="Collapse sidebar">
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {/* New Chat */}
                    <button className="cop-new-chat-btn" onClick={onNewChat}>
                        <Plus size={15} />
                        <span>New Chat</span>
                    </button>

                    {/* Conversation List */}
                    <div className="cop-sidebar-list">
                        {Object.entries(grouped).map(([group, convs]) => (
                            <div key={group} className="cop-sidebar-group">
                                <p className="cop-sidebar-group-label">{group}</p>
                                {convs.map(conv => (
                                    <div key={conv.id} className="cop-sidebar-item-wrapper">
                                        <button
                                            className={`cop-sidebar-item ${conv.id === activeConvId ? 'cop-sidebar-item--active' : ''}`}
                                            onClick={() => onSelectChat && onSelectChat(conv.id)}
                                        >
                                            <MessageSquare size={14} />
                                            <span className="cop-sidebar-item-title">{conv.title}</span>
                                        </button>
                                        <button
                                            className="cop-sidebar-item-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteChat && onDeleteChat(conv.id);
                                            }}
                                            title="Delete chat"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.aside>
        </>
    )
}

function groupByTime(conversations) {
    const groups = { Today: [], Yesterday: [], Previous: [] }
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)

    conversations.forEach(conv => {
        if (conv.group) {
            groups[conv.group] = groups[conv.group] || []
            groups[conv.group].push(conv)
        } else {
            // Compute group dynamic
            const diff = Date.now() - new Date(conv.created_at || Date.now()).getTime()
            if (diff < 86400000) groups['Today'].push(conv)
            else if (diff < 172800000) groups['Yesterday'].push(conv)
            else groups['Previous'].push(conv)
        }
    })

    // Filter empty groups
    return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0))
}
