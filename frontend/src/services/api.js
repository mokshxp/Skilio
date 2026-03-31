import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

// Create base instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 300000, // 5 minutes — aptitude generation takes time
    withCredentials: true
})

// Token injector — call this once from a component with Clerk auth
export function setupApiInterceptors(getToken) {
    api.interceptors.request.use(async (config) => {
        try {
            const token = await getToken()
            if (token) config.headers.Authorization = `Bearer ${token}`
        } catch (e) {
            console.warn('[API] Could not attach auth token', e)
        }
        return config
    })

    api.interceptors.response.use(
        (res) => res,
        (err) => {
            const status = err.response?.status
            const message = err.response?.data?.error || err.response?.data?.message || err.response?.data?.detail || err.message || 'Unknown error'

            if (status === 401) {
                console.warn('[API] Unauthorized — redirecting to sign-in')
                window.location.href = '/'
            }
            if (status === 429) {
                throw new Error('Rate limit reached. Please wait before retrying.')
            }

            throw new Error(message)
        }
    )
}

// ── Resume ──────────────────────────────────────────────────
export const resumeApi = {
    upload: (formData, onProgress) => {
        return api.post('/resume/upload', formData, {
            onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
            timeout: 120000,
        }).then(res => res.data)
    },
    get: (id = 'latest') => api.get(`/resume/${id}`).then(res => res.data),
    list: () => api.get('/resume/list').then(res => res.data),
    delete: (id) => api.delete(`/resume/${id}`).then(res => res.data),
    touch: (id) => api.put(`/resume/${id}/touch`).then(res => res.data),
}

// ── Interviews (V2) ─────────────────────────────────────────
export const interviewApi = {
    create: (payload) => api.post('/interview/start', payload).then(res => res.data),
    get: (id) => {
        const cleanId = id.toString().replace('sess_', '');
        return api.get(`/interview/session/${cleanId}`).then(res => res.data);
    },
    list: (params) => api.get('/interview', { params }).then(res => res.data),
    completeRound: (id, payload) => api.post(`/interview/round/complete`, { ...payload, interviewId: id }).then(res => res.data),
    submitDSA: (payload) => api.post('/interview/dsa/submit', payload).then(res => res.data),
    runDSA: (payload) => api.post('/interview/dsa/run', payload).then(res => res.data),
    getFollowUp: (payload) => api.post('/interview/follow-up', payload).then(res => res.data),
    delete: (id) => {
        const cleanId = id.toString().replace('sess_', '');
        return api.delete(`/interview/${cleanId}`).then(res => res.data);
    },
    end: (id) => api.post('/interview/end', { interviewId: id }).then(res => res.data),
}

// ── Results ──────────────────────────────────────────────────
export const resultsApi = {
    get: (id) => api.get(`/interview/${id}/results`).then(res => res.data),
}

// ── Analytics ────────────────────────────────────────────────
export const analyticsApi = {
    get: () => api.get('/analytics').then(res => res.data),
}

// ── Chat / Copilot ───────────────────────────────────────────
export const chatApi = {
    sessions: () => api.get('/chat/sessions').then(res => res.data),
    createSession: (title) => api.post('/chat/sessions', { title }).then(res => res.data),
    deleteSession: (id) => api.delete(`/chat/sessions/${id}`).then(res => res.data),
    send: (msg, sessionId) => api.post('/chat/message', { message: msg, sessionId }).then(res => res.data),
    history: (sessionId) => api.get('/chat/history', { params: { sessionId } }).then(res => res.data),
    quickAction: (type, sessionId) => api.post('/chat/quick-action', { action: type, sessionId }).then(res => res.data),
}

// ── Sheets ───────────────────────────────────────────────────
export const sheetsApi = {
    list: (params) => api.get('/sheets/list', { params }).then(res => res.data),
    get: (slug) => api.get(`/sheets/${slug}`).then(res => res.data),
    getProgress: (id) => api.get(`/sheets/progress/${id}`).then(res => res.data),
    updateProgress: (id, payload) => api.post(`/sheets/progress/${id}/complete`, payload).then(res => res.data),
    toggleBookmark: (id, bookmarked) => api.post(`/sheets/progress/${id}/bookmark`, { bookmarked }).then(res => res.data),
}

export default api
