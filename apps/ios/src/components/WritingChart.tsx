import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../lib/theme'
import { formatDateForDisplay } from '@dailywrite/shared'

interface WritingChartProps {
  data: { date: string; words: number }[]
}

export function WritingChart({ data }: WritingChartProps) {
  const { colors } = useTheme()

  const maxWords = Math.max(...data.map((d) => d.words), 1)

  // Show labels for first, middle, and last dates
  const labelIndices = [0, Math.floor(data.length / 2), data.length - 1]

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      <Text style={[styles.title, { color: colors.text }]}>Words Written (Last 30 Days)</Text>

      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
            {maxWords.toLocaleString()}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
            {Math.round(maxWords / 2).toLocaleString()}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>0</Text>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = maxWords > 0 ? (item.words / maxWords) * 120 : 0
            return (
              <View key={item.date} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, item.words > 0 ? 2 : 0),
                      backgroundColor: colors.primary,
                      opacity: item.words > 0 ? 1 : 0.15,
                    },
                  ]}
                />
              </View>
            )
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {data.map((item, index) => (
          <View key={item.date} style={styles.xLabelWrapper}>
            {labelIndices.includes(index) && (
              <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
                {formatDateForDisplay(item.date)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    height: 140,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 20,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: '80%',
    borderRadius: 2,
    minWidth: 2,
  },
  xAxis: {
    flexDirection: 'row',
    marginLeft: 40,
  },
  xLabelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  axisLabel: {
    fontSize: 10,
  },
})
