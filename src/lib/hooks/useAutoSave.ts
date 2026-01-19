'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface UseAutoSaveOptions {
  data: string
  onSave: (data: string) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>(data)

  const save = useCallback(async () => {
    if (data === lastSavedDataRef.current) return

    setIsSaving(true)
    try {
      await onSave(data)
      lastSavedDataRef.current = data
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [data, onSave])

  // Debounced auto-save
  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save])

  // Save on unmount
  useEffect(() => {
    return () => {
      if (data !== lastSavedDataRef.current) {
        onSave(data)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    await save()
  }, [save])

  return { isSaving, lastSaved, saveNow }
}
