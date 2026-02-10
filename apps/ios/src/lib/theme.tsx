import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  colors: typeof lightColors
}

const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceBorder: '#f3f4f6',
  text: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  primary: '#2563eb',
  primaryText: '#ffffff',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  cardShadow: '#00000010',
  navBg: '#ffffff',
  navBorder: '#f3f4f6',
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  statOrange: '#ea580c',
  statOrangeBg: '#fff7ed',
  statPurple: '#9333ea',
  statPurpleBg: '#faf5ff',
  statGreen: '#16a34a',
  statGreenBg: '#f0fdf4',
  statCyan: '#0891b2',
  statCyanBg: '#ecfeff',
  statBlue: '#2563eb',
  statBlueBg: '#eff6ff',
  badge: {
    blog: { bg: '#dbeafe', text: '#1d4ed8' },
    novel: { bg: '#f3e8ff', text: '#7c3aed' },
    essay: { bg: '#dcfce7', text: '#15803d' },
    other: { bg: '#f3f4f6', text: '#374151' },
  },
} as const

const darkColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceBorder: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  danger: '#ef4444',
  dangerBg: '#450a0a',
  cardShadow: '#00000040',
  navBg: '#1e293b',
  navBorder: '#334155',
  inputBg: '#334155',
  inputBorder: '#475569',
  statOrange: '#fb923c',
  statOrangeBg: '#431407',
  statPurple: '#c084fc',
  statPurpleBg: '#3b0764',
  statGreen: '#4ade80',
  statGreenBg: '#052e16',
  statCyan: '#22d3ee',
  statCyanBg: '#083344',
  statBlue: '#60a5fa',
  statBlueBg: '#172554',
  badge: {
    blog: { bg: '#1e3a5f', text: '#93c5fd' },
    novel: { bg: '#3b0764', text: '#d8b4fe' },
    essay: { bg: '#052e16', text: '#86efac' },
    other: { bg: '#334155', text: '#d1d5db' },
  },
} as const

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [theme, setTheme] = useState<Theme>(systemScheme ?? 'light')

  useEffect(() => {
    AsyncStorage.getItem('theme').then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)
      }
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      AsyncStorage.setItem('theme', next)
      return next
    })
  }, [])

  const colors = theme === 'dark' ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
