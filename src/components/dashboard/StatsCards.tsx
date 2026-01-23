'use client'

import { Card, CardContent } from '@/components/ui/Card'

interface StatsCardsProps {
  currentStreak: number
  longestStreak: number
  totalWords: number
  wordsToday: number
  timeToday: string
}

export function StatsCards({
  currentStreak,
  longestStreak,
  totalWords,
  wordsToday,
  timeToday,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Current Streak',
      value: currentStreak,
      suffix: currentStreak === 1 ? 'day' : 'days',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Longest Streak',
      value: longestStreak,
      suffix: longestStreak === 1 ? 'day' : 'days',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Words Today',
      value: wordsToday.toLocaleString(),
      suffix: 'words',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Time Today',
      value: timeToday,
      suffix: 'writing',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
      label: 'Total Words',
      value: totalWords.toLocaleString(),
      suffix: 'words',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={stat.bgColor}>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.suffix}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
