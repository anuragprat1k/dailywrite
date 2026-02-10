import { useState, useEffect, useCallback, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { supabase } from './supabase'
import { getLocalDateString, INACTIVITY_TIMEOUT, SAVE_INTERVAL } from '@dailywrite/shared'

export function useWritingTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const lastActivityRef = useRef<number>(Date.now())
  const unsavedSecondsRef = useRef(0)
  const appStateRef = useRef<AppStateStatus>('active')

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (!isRunning && appStateRef.current === 'active') {
      setIsRunning(true)
      setIsPaused(false)
    }
  }, [isRunning])

  const saveTime = useCallback(async (seconds: number) => {
    if (seconds <= 0) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = getLocalDateString()

    const { data: existing } = await supabase
      .from('writing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existing) {
      await supabase
        .from('writing_sessions')
        .update({ time_spent: (existing.time_spent || 0) + seconds })
        .eq('id', existing.id)
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

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        setIsRunning(false)
        setIsPaused(true)
        if (unsavedSecondsRef.current > 0) {
          saveTime(unsavedSecondsRef.current)
        }
      } else if (nextState === 'active') {
        lastActivityRef.current = Date.now()
        setIsRunning(true)
        setIsPaused(false)
      }
      appStateRef.current = nextState
    })

    return () => subscription.remove()
  }, [saveTime])

  // Inactivity check
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current
      if (timeSinceActivity >= INACTIVITY_TIMEOUT && isRunning) {
        setIsRunning(false)
        setIsPaused(true)
        if (unsavedSecondsRef.current > 0) {
          saveTime(unsavedSecondsRef.current)
        }
      }
    }, 10000)

    return () => clearInterval(checkInactivity)
  }, [saveTime, isRunning])

  // Main timer
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
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

  return { elapsedSeconds, isRunning, isPaused, handleActivity }
}
