import { createContext, useContext, useReducer, useCallback } from 'react'

const InterviewContext = createContext(null)

const initialState = {
    sessionId: null,
    role: '',
    difficulty: '',
    roundType: '',
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    score: null,
    feedback: null,
    roundScores: [],
    wsStatus: 'disconnected', // 'connected' | 'disconnected' | 'error'
    isLoading: false,
    error: null,
}

function reducer(state, action) {
    switch (action.type) {
        case 'SET_SESSION':
            return { ...state, ...action.payload, error: null }
        case 'SET_QUESTION':
            return {
                ...state,
                currentQuestion: action.payload,
                questionIndex: state.questionIndex + 1,
                feedback: null,
                score: null,
            }
        case 'SET_FEEDBACK':
            return { ...state, feedback: action.payload.feedback, score: action.payload.score }
        case 'ADD_ROUND_SCORE':
            return { ...state, roundScores: [...state.roundScores, action.payload] }
        case 'SET_WS_STATUS':
            return { ...state, wsStatus: action.payload }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false }
        case 'RESET':
            return { ...initialState }
        default:
            return state
    }
}

export function InterviewProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState)

    const startSession = useCallback((sessionData) => {
        // Persist session ID for reconnect
        if (sessionData.sessionId) {
            localStorage.setItem('iq_session_id', sessionData.sessionId)
        }
        dispatch({ type: 'SET_SESSION', payload: sessionData })
    }, [])

    const setQuestion = useCallback((q) => dispatch({ type: 'SET_QUESTION', payload: q }), [])
    const setFeedback = useCallback((fb) => dispatch({ type: 'SET_FEEDBACK', payload: fb }), [])
    const addRoundScore = useCallback((rs) => dispatch({ type: 'ADD_ROUND_SCORE', payload: rs }), [])
    const setWsStatus = useCallback((s) => dispatch({ type: 'SET_WS_STATUS', payload: s }), [])
    const setLoading = useCallback((b) => dispatch({ type: 'SET_LOADING', payload: b }), [])
    const setError = useCallback((e) => dispatch({ type: 'SET_ERROR', payload: e }), [])
    const reset = useCallback(() => {
        localStorage.removeItem('iq_session_id')
        dispatch({ type: 'RESET' })
    }, [])

    return (
        <InterviewContext.Provider
            value={{ ...state, startSession, setQuestion, setFeedback, addRoundScore, setWsStatus, setLoading, setError, reset }}
        >
            {children}
        </InterviewContext.Provider>
    )
}

export function useInterview() {
    const ctx = useContext(InterviewContext)
    if (!ctx) throw new Error('useInterview must be used inside InterviewProvider')
    return ctx
}
