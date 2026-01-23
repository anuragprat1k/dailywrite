'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { parseLocalDateString } from '@/lib/utils/stats'
import { useTheme } from '@/components/ThemeProvider'

interface WritingChartProps {
  data: { date: string; words: number }[]
}

export function WritingChart({ data }: WritingChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const formattedData = data.map((item) => ({
    ...item,
    displayDate: parseLocalDateString(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const textColor = isDark ? '#94a3b8' : '#6b7280'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Words Written (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12, fill: textColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : 'white',
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#f1f5f9' : '#1f2937',
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value) => [`${(value as number).toLocaleString()} words`, 'Words']}
              />
              <Line
                type="monotone"
                dataKey="words"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
