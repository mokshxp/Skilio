import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create base instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
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
            const message = err.response?.data?.detail || err.message || 'Unknown error'

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
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
        })
    },
    get: () => api.get('/resume/latest'),
}

// ── Interviews ───────────────────────────────────────────────
export const interviewApi = {
    create: (payload) => api.post('/interview/start', payload),
    get: (id) => api.get(`/interview/${id}`),
    list: (params) => api.get('/interview', { params }),
    submit: (id, ans) => api.post(`/interview/${id}/submit-answer`, ans),
    end: (id) => api.post(`/interview/${id}/end`),
}

// ── Results ──────────────────────────────────────────────────
export const resultsApi = {
    get: (id) => api.get(`/interview/${id}/results`),
}

// ── Analytics ────────────────────────────────────────────────
export const analyticsApi = {
    get: () => api.get('/analytics'),
}

// ── Chat / Copilot ───────────────────────────────────────────
export const chatApi = {
    send: (msg) => api.post('/chat/message', { message: msg }),
    history: () => api.get('/chat/history'),
    quickAction: (type) => api.post('/chat/quick-action', { action: type }),
}

export default api
