const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECTS = 5

class InterviewWebSocket {
    constructor() {
        this.socket = null
        this.sessionId = null
        this.listeners = {}
        this.reconnectCount = 0
        this.shouldReconnect = false
        this.pingInterval = null
    }

    connect(sessionId, token) {
        this.sessionId = sessionId
        this.shouldReconnect = true
        this.reconnectCount = 0
        this._open(token)
    }

    _open(token) {
        // Token sent via first message, NOT in URL (avoids logging in server/proxy/browser history)
        const url = `${WS_BASE}/ws/interview/${this.sessionId}`
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
            console.log('[WS] Connected to session', this.sessionId)
            // Authenticate via first message instead of URL query param
            if (token) {
                this._send({ type: 'auth', token })
            }
            this.reconnectCount = 0
            this._emit('connected', { sessionId: this.sessionId })
            this._startPing()
        }

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                this._emit(data.type || 'message', data)
                this._emit('any', data)
            } catch {
                this._emit('raw', event.data)
            }
        }

        this.socket.onerror = (err) => {
            console.error('[WS] Error', err)
            this._emit('error', err)
        }

        this.socket.onclose = (ev) => {
            console.warn('[WS] Closed', ev.code)
            this._stopPing()
            this._emit('disconnected', { code: ev.code })
            if (this.shouldReconnect && this.reconnectCount < MAX_RECONNECTS) {
                this.reconnectCount++
                console.log(`[WS] Reconnecting attempt ${this.reconnectCount}/${MAX_RECONNECTS}`)
                setTimeout(() => this._open(token), RECONNECT_DELAY_MS * this.reconnectCount)
            }
        }
    }

    sendAnswer(answer, questionId) {
        this._send({ type: 'answer', payload: { answer, question_id: questionId } })
    }

    sendCode(code, language, questionId) {
        this._send({ type: 'code_submission', payload: { code, language, question_id: questionId } })
    }

    runCode(code, language, questionId) {
        this._send({ type: 'run_code', payload: { code, language, question_id: questionId } })
    }

    requestNextQuestion() {
        this._send({ type: 'next_question' })
    }

    _send(data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data))
        } else {
            console.warn('[WS] Cannot send — socket not open')
        }
    }

    on(event, cb) {
        if (!this.listeners[event]) this.listeners[event] = []
        this.listeners[event].push(cb)
        return () => this.off(event, cb)
    }

    off(event, cb) {
        this.listeners[event] = (this.listeners[event] || []).filter((fn) => fn !== cb)
    }

    _emit(event, data) {
        ; (this.listeners[event] || []).forEach((fn) => fn(data))
    }

    disconnect() {
        this.shouldReconnect = false
        this._stopPing()
        this.socket?.close()
    }

    _startPing() {
        this.pingInterval = setInterval(() => this._send({ type: 'ping' }), 25000)
    }

    _stopPing() {
        clearInterval(this.pingInterval)
        this.pingInterval = null
    }

    get isConnected() {
        return this.socket?.readyState === WebSocket.OPEN
    }
}

// Singleton
const wsClient = new InterviewWebSocket()
export default wsClient
