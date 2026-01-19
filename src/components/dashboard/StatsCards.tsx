'use client'

import { Card, CardContent } from '@/components/ui/Card'

interface StatsCardsProps {
  currentStreak: number
  longestStreak: number
  totalWords: number
  wordsToday: number
}

export function StatsCards({
  currentStreak,
  longestStreak,
  totalWords,
  wordsToday,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Current Streak',
      value: currentStreak,
      suffix: currentStreak === 1 ? 'day' : 'days',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Longest Streak',
      value: longestStreak,
      suffix: longestStreak === 1 ? 'day' : 'days',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Words',
      value: totalWords.toLocaleString(),
      suffix: 'words',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Words Today',
      value: wordsToday.toLocaleString(),
      suffix: 'words',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={stat.bgColor}>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.suffix}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
