'use client'

import { createContext, useContext, useEffect, useState, useSyncExternalStore, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const savedTheme = localStorage.getItem('theme') as Theme | null
  if (savedTheme) return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', callback)
  window.addEventListener('storage', callback)
  return () => {
    mediaQuery.removeEventListener('change', callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot(): Theme {
  return getInitialTheme()
}

function getServerSnapshot(): Theme {
  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [theme, setTheme] = useState<Theme>(systemTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
