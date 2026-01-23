import { WritingSession } from '@/types/database'

// Get local date string in YYYY-MM-DD format
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Parse a YYYY-MM-DD string as a local date (not UTC)
// This avoids the timezone shift that occurs with new Date("YYYY-MM-DD")
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function calculateStreak(sessions: WritingSession[]): number {
  if (sessions.length === 0) return 0

  // Sort sessions by date descending
  const sorted = [...sessions].sort(
    (a, b) => parseLocalDateString(b.date).getTime() - parseLocalDateString(a.date).getTime()
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if most recent session is today or yesterday
  const mostRecentDate = parseLocalDateString(sorted[0].date)

  if (mostRecentDate < yesterday) {
    return 0 // Streak is broken
  }

  let streak = 1
  let currentDate = mostRecentDate

  for (let i = 1; i < sorted.length; i++) {
    const sessionDate = parseLocalDateString(sorted[i].date)

    const expectedDate = new Date(currentDate)
    expectedDate.setDate(expectedDate.getDate() - 1)

    if (sessionDate.getTime() === expectedDate.getTime()) {
      streak++
      currentDate = sessionDate
    } else if (sessionDate.getTime() < expectedDate.getTime()) {
      break // Gap in streak
    }
    // If same date, continue to next
  }

  return streak
}

export function calculateLongestStreak(sessions: WritingSession[]): number {
  if (sessions.length === 0) return 0

  // Sort sessions by date ascending
  const sorted = [...sessions].sort(
    (a, b) => parseLocalDateString(a.date).getTime() - parseLocalDateString(b.date).getTime()
  )

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = parseLocalDateString(sorted[i - 1].date)
    const currDate = parseLocalDateString(sorted[i].date)

    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else if (diffDays > 1) {
      currentStreak = 1
    }
    // If same day, don't change streak
  }

  return longestStreak
}

export function getTotalWords(sessions: WritingSession[]): number {
  return sessions.reduce((sum, session) => sum + session.words_written, 0)
}

export function getWordsToday(sessions: WritingSession[]): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySession = sessions.find((s) => {
    const sessionDate = parseLocalDateString(s.date)
    return sessionDate.getTime() === today.getTime()
  })
  return todaySession?.words_written ?? 0
}

export function getTimeToday(sessions: WritingSession[]): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySession = sessions.find((s) => {
    const sessionDate = parseLocalDateString(s.date)
    return sessionDate.getTime() === today.getTime()
  })
  return todaySession?.time_spent ?? 0
}

export function formatTimeDisplay(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0
  return text.trim().split(/\s+/).length
}

export function getLast30DaysData(
  sessions: WritingSession[]
): { date: string; words: number }[] {
  const result: { date: string; words: number }[] = []

  // Create a map with normalized date timestamps as keys
  const sessionMap = new Map(
    sessions.map((s) => [parseLocalDateString(s.date).getTime(), s.words_written])
  )

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const dateStr = getLocalDateString(date)
    result.push({
      date: dateStr,
      words: sessionMap.get(date.getTime()) ?? 0,
    })
  }

  return result
}
