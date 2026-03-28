import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Bookmark, CheckCircle, Clock, Lock, Share2, MessageSquare, ChevronRight, Copy, Check } from 'lucide-react'
import { sheetsApi } from '../services/api'
import SectionRenderer from '../components/sheets/SectionRenderer'
import FeatureGate from '../components/subscription/FeatureGate'
import { useSubscription } from '../hooks/useSubscription'

export default function SheetDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [sheet, setSheet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState({ is_bookmarked: false, is_completed: false })
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const fetchSheet = async () => {
            setLoading(true)
            try {
                const data = await sheetsApi.get(slug)
                setSheet(data)
                
                // Fetch progress for this sheet
                try {
                    const prog = await sheetsApi.getProgress(data.id)
                    setProgress(prog)
                } catch (e) {
                    // Silently fail if not logged in
                }
            } catch (err) {
                console.error(err)
                navigate('/sheets')
            } finally {
                setLoading(false)
            }
        }
        fetchSheet()
    }, [slug, navigate])

    const toggleBookmark = async () => {
        if (!sheet) return
        try {
            const newStatus = !progress.is_bookmarked
            await sheetsApi.toggleBookmark(sheet.id, newStatus)
            setProgress({ ...progress, is_bookmarked: newStatus })
        } catch (err) {
            console.error(err)
        }
    }

    const toggleComplete = async () => {
        if (!sheet) return
        try {
            const newStatus = !progress.is_completed
            await sheetsApi.updateProgress(sheet.id, { is_completed: newStatus, progress_percent: newStatus ? 100 : 0 })
            setProgress({ ...progress, is_completed: newStatus })
        } catch (err) {
            console.error(err)
        }
    }

    const copyCode = (code) => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!sheet) return null

    return (
        <div className="max-w-[1240px] mx-auto px-6 py-12 relative">
            
            {/* Top Navigation Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sticky top-0 z-20 bg-[var(--bg-0)] py-4 border-b border-[var(--border)] -mx-6 px-6">
                <div className="flex items-center gap-4">
                    <Link to="/sheets" className="p-2.5 rounded-xl hover:bg-[var(--bg-1)] transition-colors border border-transparent hover:border-[var(--border)] group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                    </Link>
                    <div className="h-4 w-px bg-[var(--border)] mx-1" />
                    <nav className="hidden sm:flex items-center gap-2 font-semibold text-xs text-[var(--text-2)] uppercase tracking-wider">
                        <Link to="/sheets" className="hover:text-[var(--text-0)] transition-colors">Sheets</Link>
                        <ChevronRight size={14} className="opacity-40" />
                        <span className="text-[var(--text-1)]">{sheet.category}</span>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleBookmark}
                        className={`p-2.5 rounded-xl transition-all flex items-center gap-2 border ${
                            progress.is_bookmarked 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                            : 'bg-[var(--bg-1)] border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-0)] hover:border-[var(--text-1)]'
                        }`}
                    >
                        <Bookmark size={20} fill={progress.is_bookmarked ? "currentColor" : "none"} />
                        <span className="text-[13.5px] font-bold sm:block hidden">{progress.is_bookmarked ? 'Saved' : 'Save'}</span>
                    </button>
                    
                    <button 
                        onClick={toggleComplete}
                        className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2.5 border font-bold text-[13.5px] ${
                            progress.is_completed 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-lg shadow-emerald-500/10' 
                            : 'bg-[var(--accent)] border-transparent text-black hover:scale-[1.03] active:scale-95 shadow-lg shadow-[var(--accent)]/20'
                        }`}
                    >
                        {progress.is_completed ? <CheckCircle size={18} /> : <CheckCircle size={18} strokeWidth={2.5} />}
                        {progress.is_completed ? 'Finished' : 'Mark Complete'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
                {sheet.is_premium ? (
                    <FeatureGate 
                        feature="roundTypes" 
                        featureName="Masterclass Cheat Sheets"
                        requiredPlan="Pro"
                    >
                        {/* Main Content Column */}
                        <article className="min-w-0">
                            <header className="mb-12">
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/10">
                                        {sheet.difficulty}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-1)] text-[var(--text-2)] border border-[var(--border)]">
                                        {sheet.estimated_read_time} min read
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-['Outfit'] font-extrabold tracking-tight text-[var(--text-0)] mb-6 leading-[1.15]">
                                    {sheet.title}
                                </h1>
                                <p className="text-xl text-[var(--text-1)] leading-relaxed font-medium">
                                    {sheet.description}
                                </p>
                            </header>

                            <div className="space-y-12">
                                {sheet.content?.sections?.map((section, idx) => (
                                    <section key={idx} id={`section-${idx}`} className="scroll-mt-32">
                                        <h2 className="text-2xl font-['Outfit'] font-bold text-[var(--text-0)] mb-5 flex items-center gap-3">
                                            <span className="text-[var(--accent)] opacity-40 font-mono text-lg">{String(idx + 1).padStart(2, '0')}</span>
                                            {section.title}
                                        </h2>
                                        <div className="mt-8">
                                            <SectionRenderer 
                                                section={section} 
                                                copyCode={copyCode} 
                                                copied={copied} 
                                            />
                                        </div>
                                    </section>
                                ))}
                            </div>

                            {/* Final CTA */}
                            <div className="mt-20 p-10 bg-[var(--bg-1)] border border-[var(--border)] rounded-[32px] text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700" />
                                <h3 className="text-2xl font-['Outfit'] font-bold text-[var(--text-0)] mb-4">Completed this topic?</h3>
                                <p className="text-[var(--text-2)] mb-8 max-w-[440px] mx-auto font-medium">Ready to test your knowledge in a live interview? Jump into a mock session with AI.</p>
                                <button 
                                    onClick={() => navigate('/start')}
                                    className="bg-white text-black px-8 py-3.5 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                                >
                                    🚀 Start AI Interview
                                </button>
                            </div>
                        </article>

                        {/* Sidebar Navigation */}
                        <aside className="hidden lg:block sticky top-[120px] space-y-8 h-fit max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide pr-2">
                            <div className="bg-[var(--bg-1)] border border(--border)] rounded-2xl p-6">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)] mb-6 sticky top-0 bg-[var(--bg-1)] pb-4 z-10 border-b border-[var(--border)]">
                                    Table of Contents
                                </h4>
                                <nav className="space-y-1">
                                    {sheet.content?.sections?.map((section, idx) => (
                                        <a 
                                            key={idx} 
                                            href={`#section-${idx}`}
                                            className="block py-2.5 text-[13.5px] font-semibold text-[var(--text-1)] hover:text-[var(--accent)] transition-all line-clamp-1 border-l-2 border-transparent pl-4 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-r-lg"
                                        >
                                            {section.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            <div className="bg-gradient-to-br from-[var(--bg-1)] to-[var(--bg-0)] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MessageSquare size={48} className="text-[var(--accent)]" />
                                </div>
                                <h4 className="text-sm font-bold text-[var(--text-0)] mb-3 relative z-10">Confused about this?</h4>
                                <p className="text-xs text-[var(--text-2)] leading-relaxed mb-4 font-medium opacity-80 relative z-10">Our career copilot can explain these concepts in detail and quiz you live.</p>
                                <button 
                                    onClick={() => navigate('/copilot', { state: { context: `I'd like to discuss the concepts mentioned in the ${sheet.title} sheet.` } })}
                                    className="w-full bg-[var(--bg-3)] hover:bg-[var(--accent)] hover:text-black border border-[var(--border)] py-2.5 rounded-xl text-xs font-bold transition-all relative z-10"
                                >
                                    Ask Copilot
                                </button>
                            </div>
                        </aside>
                    </FeatureGate>
                ) : (
                   /* FREE CONTENT - RENDER DIRECTLY */
                   <>
                        {/* Main Content Column */}
                        <article className="min-w-0">
                            <header className="mb-12">
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/10">
                                        {sheet.difficulty}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-1)] text-[var(--text-2)] border border-[var(--border)]">
                                        {sheet.estimated_read_time} min read
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-['Outfit'] font-extrabold tracking-tight text-[var(--text-0)] mb-6 leading-[1.15]">
                                    {sheet.title}
                                </h1>
                                <p className="text-xl text-[var(--text-1)] leading-relaxed font-medium">
                                    {sheet.description}
                                </p>
                            </header>

                            <div className="space-y-12">
                                {sheet.content?.sections?.map((section, idx) => (
                                    <section key={idx} id={`section-${idx}`} className="scroll-mt-32">
                                        <h2 className="text-2xl font-['Outfit'] font-bold text-[var(--text-0)] mb-5 flex items-center gap-3">
                                            <span className="text-[var(--accent)] opacity-40 font-mono text-lg">{String(idx + 1).padStart(2, '0')}</span>
                                            {section.title}
                                        </h2>
                                        <div className="mt-8">
                                            <SectionRenderer 
                                                section={section} 
                                                copyCode={copyCode} 
                                                copied={copied} 
                                            />
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </article>

                        {/* Sidebar Navigation */}
                        <aside className="hidden lg:block sticky top-[120px] space-y-8 h-fit max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-hide pr-2">
                            <div className="bg-[var(--bg-1)] border border-[var(--border)] rounded-2xl p-6">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)] mb-6 sticky top-0 bg-[var(--bg-1)] pb-4 z-10 border-b border-[var(--border)]">
                                    Table of Contents
                                </h4>
                                <nav className="space-y-1">
                                    {sheet.content?.sections?.map((section, idx) => (
                                        <a 
                                            key={idx} 
                                            href={`#section-${idx}`}
                                            className="block py-2.5 text-[13.5px] font-semibold text-[var(--text-1)] hover:text-[var(--accent)] transition-all line-clamp-1 border-l-2 border-transparent pl-4 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-r-lg"
                                        >
                                            {section.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>
                   </>
                )}
            </div>
        </div>
    )
}
