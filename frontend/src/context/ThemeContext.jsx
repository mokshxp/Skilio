import { createContext, useContext, useEffect, useState } from 'react'

const THEMES = ['midnight', 'ivory', 'carbon']
const ThemeContext = createContext({ theme: 'midnight', setTheme: () => { }, themes: THEMES })

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('iq-theme') || 'midnight'
    )

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('iq-theme', theme)
    }, [theme])

    // Set initial theme on mount (before React hydrates)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
