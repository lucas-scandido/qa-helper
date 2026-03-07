import { useEffect, useState } from 'react'
import { ThemeContext, type Theme } from './ThemeContext'

const VALID_THEMES: ReadonlySet<Theme> = new Set(['dark', 'light'])

function readTheme(): Theme {
  const stored = localStorage.getItem('theme')
  return stored !== null && VALID_THEMES.has(stored as Theme) ? (stored as Theme) : 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}