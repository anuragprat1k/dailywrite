import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import { signOut } from '../lib/auth'
import { useTheme } from '../lib/theme'
import {
  Project,
  WritingSession,
  calculateStreak,
  calculateLongestStreak,
  getTotalWords,
  getWordsToday,
  getTimeToday,
  formatTimeDisplay,
  getLast30DaysData,
} from '@dailywrite/shared'
import { RootStackParamList } from '../navigation/AppNavigator'
import { StatsCards } from '../components/StatsCards'
import { WritingChart } from '../components/WritingChart'

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>

export function DashboardScreen({ navigation }: Props) {
  const { colors, toggleTheme, theme } = useTheme()
  const [sessions, setSessions] = useState<WritingSession[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [sessionsRes, projectsRes] = await Promise.all([
      supabase
        .from('writing_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5),
    ])

    setSessions(sessionsRes.data ?? [])
    setProjects(projectsRes.data ?? [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [fetchData])
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={toggleTheme}>
            <Text style={{ fontSize: 20 }}>{theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut}>
            <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ),
    })
  }, [navigation, colors, toggleTheme, theme])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  const currentStreak = calculateStreak(sessions)
  const longestStreak = calculateLongestStreak(sessions)
  const totalWords = getTotalWords(sessions)
  const wordsToday = getWordsToday(sessions)
  const timeToday = formatTimeDisplay(getTimeToday(sessions))
  const chartData = getLast30DaysData(sessions)

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={[styles.greeting, { color: colors.text }]}>Welcome back!</Text>
      <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
        Here&apos;s your writing overview.
      </Text>

      <StatsCards
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        totalWords={totalWords}
        wordsToday={wordsToday}
        timeToday={timeToday}
      />

      <WritingChart data={chartData} />

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NewProject')}>
            <Text style={[styles.newButton, { color: colors.primary }]}>+ New</Text>
          </TouchableOpacity>
        </View>

        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No projects yet. Start writing!
            </Text>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('NewProject')}
            >
              <Text style={[styles.ctaText, { color: colors.primaryText }]}>
                Create Your First Project
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[styles.projectRow, { borderColor: colors.surfaceBorder }]}
              onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
              activeOpacity={0.7}
            >
              <View style={styles.projectInfo}>
                <Text style={[styles.projectTitle, { color: colors.text }]}>{project.title}</Text>
                {project.description && (
                  <Text style={[styles.projectDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                    {project.description}
                  </Text>
                )}
              </View>
              <View style={[
                styles.typeBadge,
                { backgroundColor: (colors.badge as Record<string, { bg: string; text: string }>)[project.type]?.bg ?? colors.badge.other.bg }
              ]}>
                <Text style={[
                  styles.typeBadgeText,
                  { color: (colors.badge as Record<string, { bg: string; text: string }>)[project.type]?.text ?? colors.badge.other.text }
                ]}>
                  {project.type}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {projects.length > 0 && (
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => navigation.navigate('Projects')}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Projects</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subGreeting: { fontSize: 15, marginBottom: 20 },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  newButton: { fontSize: 15, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { marginBottom: 16, fontSize: 15 },
  ctaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: { fontWeight: '600', fontSize: 15 },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  projectInfo: { flex: 1, marginRight: 12 },
  projectTitle: { fontSize: 15, fontWeight: '500' },
  projectDesc: { fontSize: 13, marginTop: 2 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: { fontSize: 12, fontWeight: '500' },
  viewAll: {
    alignItems: 'center',
    paddingTop: 12,
  },
  viewAllText: { fontSize: 15, fontWeight: '500' },
})
