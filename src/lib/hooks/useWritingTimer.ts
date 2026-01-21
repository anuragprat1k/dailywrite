'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const INACTIVITY_TIMEOUT = 2 * 60 * 1000 // 2 minutes of inactivity
const SAVE_INTERVAL = 30 * 1000 // Save every 30 seconds

export function useWritingTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const lastActivityRef = useRef<number | null>(null)
  const unsavedSecondsRef = useRef(0)
  const isVisibleRef = useRef(true)
  const isActiveRef = useRef(true)

  // Initialize lastActivityRef on mount
  useEffect(() => {
    lastActivityRef.current = Date.now()
  }, [])

  // Reset activity timer on user interaction
  const handleActivity = useCallback(() => {
    if (lastActivityRef.current !== null) {
      lastActivityRef.current = Date.now()
    }
    if (!isActiveRef.current) {
      isActiveRef.current = true
      // Resume if tab is also visible
      if (isVisibleRef.current) {
        setIsRunning(true)
        setIsPaused(false)
      }
    }
  }, [])

  // Save time to database
  const saveTime = useCallback(async (seconds: number) => {
    if (seconds <= 0) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('writing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existing) {
      const session = existing as { id: string; time_spent: number }
      await supabase
        .from('writing_sessions')
        .update({ time_spent: (session.time_spent || 0) + seconds })
        .eq('id', session.id)
    } else {
      await supabase
        .from('writing_sessions')
        .insert({
          user_id: user.id,
          date: today,
          words_written: 0,
          time_spent: seconds,
        })
    }

    unsavedSecondsRef.current = 0
  }, [])

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible'
      isVisibleRef.current = isVisible

      if (isVisible) {
        // Resume if user was also active
        lastActivityRef.current = Date.now()
        isActiveRef.current = true
        setIsRunning(true)
        setIsPaused(false)
      } else {
        // Pause and save when tab becomes hidden
        setIsRunning(false)
        setIsPaused(true)
        if (unsavedSecondsRef.current > 0) {
          saveTime(unsavedSecondsRef.current)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [saveTime])

  // Handle activity detection
  useEffect(() => {
    const events = ['keydown', 'mousedown', 'mousemove', 'touchstart', 'scroll']

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [handleActivity])

  // Check for inactivity
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      if (lastActivityRef.current === null) return

      const now = Date.now()
      const timeSinceActivity = now - lastActivityRef.current

      if (timeSinceActivity >= INACTIVITY_TIMEOUT && isActiveRef.current) {
        isActiveRef.current = false
        setIsRunning(false)
        setIsPaused(true)
        // Save accumulated time when becoming inactive
        if (unsavedSecondsRef.current > 0) {
          saveTime(unsavedSecondsRef.current)
        }
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(checkInactivity)
  }, [saveTime])

  // Main timer
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
      unsavedSecondsRef.current += 1
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  // Periodic save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (unsavedSecondsRef.current > 0) {
        saveTime(unsavedSecondsRef.current)
      }
    }, SAVE_INTERVAL)

    return () => clearInterval(saveInterval)
  }, [saveTime])

  // Save on unmount
  useEffect(() => {
    return () => {
      if (unsavedSecondsRef.current > 0) {
        saveTime(unsavedSecondsRef.current)
      }
    }
  }, [saveTime])

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
  }
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
