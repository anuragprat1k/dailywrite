import { WritingSession } from '@/types/database'

// Get local date string in YYYY-MM-DD format
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calculateStreak(sessions: WritingSession[]): number {
  if (sessions.length === 0) return 0

  // Sort sessions by date descending
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if most recent session is today or yesterday
  const mostRecentDate = new Date(sorted[0].date)
  mostRecentDate.setHours(0, 0, 0, 0)

  if (mostRecentDate < yesterday) {
    return 0 // Streak is broken
  }

  let streak = 1
  let currentDate = mostRecentDate

  for (let i = 1; i < sorted.length; i++) {
    const sessionDate = new Date(sorted[i].date)
    sessionDate.setHours(0, 0, 0, 0)

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
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date)
    const currDate = new Date(sorted[i].date)

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
  const today = getLocalDateString()
  const todaySession = sessions.find((s) => s.date === today)
  return todaySession?.words_written ?? 0
}

export function getTimeToday(sessions: WritingSession[]): number {
  const today = getLocalDateString()
  const todaySession = sessions.find((s) => s.date === today)
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
  const sessionMap = new Map(sessions.map((s) => [s.date, s.words_written]))

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = getLocalDateString(date)
    result.push({
      date: dateStr,
      words: sessionMap.get(dateStr) ?? 0,
    })
  }

  return result
}
