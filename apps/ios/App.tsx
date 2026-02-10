import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { ThemeProvider, useTheme } from './src/lib/theme'
import { AppNavigator } from './src/navigation/AppNavigator'

function AppContent() {
  const { theme } = useTheme()
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
