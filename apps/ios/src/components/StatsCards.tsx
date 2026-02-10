import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useTheme } from '../lib/theme'

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
  const { colors } = useTheme()

  const stats = [
    {
      label: 'Current Streak',
      value: currentStreak.toString(),
      suffix: currentStreak === 1 ? 'day' : 'days',
      color: colors.statOrange,
      bg: colors.statOrangeBg,
    },
    {
      label: 'Longest Streak',
      value: longestStreak.toString(),
      suffix: longestStreak === 1 ? 'day' : 'days',
      color: colors.statPurple,
      bg: colors.statPurpleBg,
    },
    {
      label: 'Words Today',
      value: wordsToday.toLocaleString(),
      suffix: 'words',
      color: colors.statGreen,
      bg: colors.statGreenBg,
    },
    {
      label: 'Time Today',
      value: timeToday,
      suffix: 'writing',
      color: colors.statCyan,
      bg: colors.statCyanBg,
    },
    {
      label: 'Total Words',
      value: totalWords.toLocaleString(),
      suffix: 'words',
      color: colors.statBlue,
      bg: colors.statBlueBg,
    },
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[styles.card, { backgroundColor: stat.bg, borderColor: colors.surfaceBorder }]}
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>{stat.label}</Text>
          <Text style={[styles.value, { color: stat.color }]}>{stat.value}</Text>
          <Text style={[styles.suffix, { color: colors.textTertiary }]}>{stat.suffix}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 10,
    paddingVertical: 4,
  },
  card: {
    width: 130,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  suffix: {
    fontSize: 11,
    marginTop: 2,
  },
})
