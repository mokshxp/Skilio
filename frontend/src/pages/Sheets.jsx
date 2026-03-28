import { useState, useEffect, useMemo, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Bookmark, CheckCircle, Clock, Lock, Search, Filter, ArrowRight, ExternalLink } from 'lucide-react'
import { sheetsApi } from '../services/api'
import { useSubscription } from '../hooks/useSubscription'

const CATEGORIES = [
  { id: 'all',            label: 'All Topics',    icon: '✦' },
  { id: 'dsa',            label: 'DSA',           icon: '⬡' },
  { id: 'system-design',  label: 'System Design', icon: '◈' },
  { id: 'core-cs',        label: 'Core CS',       icon: '▣' },
  { id: 'behavioral',     label: 'Behavioral',    icon: '◎' },
  { id: 'language',       label: 'Languages',     icon: '⌥' },
]

const DIFFICULTY_COLORS = {
    beginner: 'text-emerald-500 bg-emerald-500/10',
    intermediate: 'text-amber-500 bg-amber-500/10',
    advanced: 'text-rose-500 bg-rose-500/10'
};

export default function Sheets() {
    const [allSheets, setAllSheets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const navigate = useNavigate()
    const { isFree } = useSubscription()

    // Fetch once on mount
    useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true)
            try {
                const res = await sheetsApi.list()
                setAllSheets(res || [])
            } catch (err) {
                console.error('[Sheets] Initialization Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchInitial()
    }, [])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 150) // Faster debounce for local filtering
        return () => clearTimeout(timer)
    }, [search])

    // Memoized category counts on ALL sheets
    const counts = useMemo(() => {
        const c = { all: allSheets.length }
        allSheets.forEach(s => {
            const cat = s.category || 'general'
            c[cat] = (c[cat] || 0) + 1
        })
        return c
    }, [allSheets])

    // Memoized filtered list
    const filteredSheets = useMemo(() => {
        return allSheets.filter(s => {
            if (!s) return false;
            const matchesCategory = filter === 'all' || s.category === filter
            
            const searchLower = debouncedSearch?.toLowerCase() || ''
            const matchesSearch = !searchLower || 
                s.title?.toLowerCase()?.includes(searchLower) ||
                s.description?.toLowerCase()?.includes(searchLower) ||
                s.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            
            return matchesCategory && matchesSearch
        })
    }, [allSheets, filter, debouncedSearch])

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            
            {/* ── Eyebrow ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '2px', background: 'var(--primary, #C4501A)', borderRadius: '1px' }} />
              <span style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--primary, #C4501A)',
              }}>
                Interview Vault
              </span>
            </div>

            {/* ── Hero row ── */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '32px',
              marginBottom: '36px', flexWrap: 'wrap',
            }}>
              {/* Left: Title + subtitle + tags */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <h1 style={{
                  fontSize: 'clamp(36px, 5vw, 52px)',
                  fontWeight: 800, lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: 'var(--foreground)',
                  marginBottom: '14px',
                }}>
                  Master the{' '}
                  <span style={{ color: 'var(--primary, #C4501A)' }}>Fundamentals.</span>
                </h1>
                <p style={{
                  fontSize: '16px', color: 'var(--muted-foreground)',
                  lineHeight: 1.65, maxWidth: '480px',
                }}>
                  Curated cheat sheets covering every high-impact interview topic —
                  from system design blueprints to DSA patterns.
                </p>
                {/* Tag strip */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {['FAANG-level', 'Curated by experts', 'Always updated'].map(tag => (
                    <span key={tag} style={{
                      padding: '4px 11px',
                      background: 'rgba(196,80,26,0.07)',
                      border: '1px solid rgba(196,80,26,0.15)',
                      borderRadius: '20px',
                      fontSize: '11px', fontWeight: 600,
                      color: 'var(--primary, #C4501A)',
                      letterSpacing: '0.04em',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Search + stats */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', paddingTop: '8px' }}>
                {/* Search pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'var(--card)', border: '1.5px solid var(--border)',
                  borderRadius: '50px', padding: '10px 18px', width: '260px',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
                    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search sheets..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      border: 'none', outline: 'none',
                      fontSize: '14px', color: 'var(--foreground)',
                      background: 'transparent', width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {[
                    { num: allSheets.length, label: 'Sheets' },
                    { num: allSheets.filter(s => !s.is_premium).length, label: 'Free' },
                    { num: allSheets.filter(s => s.is_premium).length, label: 'Pro', accent: true },
                  ].map((stat, i) => (
                    <Fragment key={stat.label}>
                      {i > 0 && <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '22px', fontWeight: 800, lineHeight: 1,
                          color: stat.accent ? 'var(--primary, #C4501A)' : 'var(--foreground)',
                        }}>
                          {stat.num}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 500, marginTop: '2px' }}>
                          {stat.label}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Category pills ── */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '10px 18px',
                      borderRadius: '50px',
                      border: `1.5px solid ${filter === cat.id ? 'var(--primary, #C4501A)' : 'var(--border)'}`,
                      background: filter === cat.id ? 'var(--primary, #C4501A)' : 'var(--card)',
                      cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600,
                      color: filter === cat.id ? 'white' : 'var(--muted-foreground)',
                      transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap',
                      boxShadow: filter === cat.id ? '0 4px 14px rgba(196,80,26,0.28)' : 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                    {cat.label}
                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      padding: '1px 6px', borderRadius: '20px',
                      background: filter === cat.id ? 'rgba(255,255,255,0.25)' : 'var(--muted)',
                      color: filter === cat.id ? 'white' : 'var(--muted-foreground)',
                    }}>
                      {counts[cat.id] || 0}
                    </span>
                  </button>
              ))}
            </div>

            {/* ── Divider + bottom row ── */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '24px 0 16px' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                Showing <strong style={{ color: 'var(--foreground)' }}>{filteredSheets.length}</strong> sheets
                · <strong style={{ color: 'var(--foreground)' }}>
                    {filteredSheets.filter(s => !s.is_premium).length}
                  </strong> free
                · <strong style={{ color: 'var(--foreground)' }}>
                    {filteredSheets.filter(s => s.is_premium).length}
                  </strong> require Pro
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                Sort by
                <select style={{
                  border: '1px solid var(--border)', borderRadius: '8px',
                  padding: '5px 10px', fontSize: '13px',
                  color: 'var(--foreground)', background: 'var(--card)',
                  outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <option>Most Popular</option>
                  <option>Newest First</option>
                  <option>Difficulty</option>
                  <option>Read Time</option>
                </select>
              </div>
            </div>

            {/* Sheets Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-[280px] rounded-2xl bg-[var(--bg-1)] animate-pulse border border-[var(--border)]" />
                    ))}
                </div>
            ) : (
                <AnimatePresence>
                    {filteredSheets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredSheets.map((sheet, idx) => (
                                <motion.div
                                    key={sheet.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                                    onClick={() => {
                                        if (sheet.is_premium && isFree) {
                                            navigate('/pricing');
                                        } else {
                                            navigate(`/sheets/${sheet.slug}`);
                                        }
                                    }}
                                    className={`group relative flex flex-col h-full bg-[var(--bg-1)] border border-[var(--border)] rounded-2xl p-6 transition-all duration-300 ${sheet.is_premium && isFree ? 'opacity-80' : 'hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/5 hover:-translate-y-1 cursor-pointer'}`}
                                >
                                    {sheet.is_premium && isFree && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl z-20 flex flex-col items-center justify-center text-center p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Lock className="text-amber-400 mb-3" size={32} />
                                            <p className="text-white font-bold text-sm mb-2">PRO CONTENT</p>
                                            <p className="text-white/70 text-xs mb-4">Upgrade to unlock this masterclass cheat sheet.</p>
                                            <button className="bg-amber-500 text-black px-4 py-2 rounded-lg font-bold text-xs">Upgrade Now</button>
                                        </div>
                                    )}
                                    {/* Premium Badge */}
                                    {sheet.is_premium && (
                                        <div className="absolute top-4 right-4 bg-gradient-to-tr from-amber-500 to-yellow-300 p-1.5 rounded-lg shadow-lg z-10">
                                            <Lock size={12} className="text-black" />
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${DIFFICULTY_COLORS[sheet.difficulty] || ''}`}>
                                            {sheet.difficulty || 'intermediate'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-3)] text-[var(--text-2)]">
                                            {(sheet.category || 'general').replace('-', ' ')}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-['Outfit'] font-bold text-[var(--text-0)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                                        {sheet.title}
                                    </h3>
                                    
                                    <p className="text-[var(--text-2)] text-sm line-clamp-2 mb-6 flex-grow font-medium leading-relaxed">
                                        {sheet.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-5 border-t border-[var(--border)] mt-auto mt-6">
                                        <div className="flex items-center gap-4 text-[var(--text-2)] text-xs font-semibold">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} /> {sheet.estimated_read_time} min
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen size={14} /> READ
                                            </span>
                                        </div>
                                        <ArrowRight className="text-[var(--text-2)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" size={18} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-1)] mb-6">
                                <Search className="text-[var(--text-2)]" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-0)] mb-2">No sheets found</h3>
                            <p className="text-[var(--text-2)]">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </AnimatePresence>
            )}

            {/* Bottom Glow */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20 blur-sm pointer-events-none" />
        </div>
    )
}
