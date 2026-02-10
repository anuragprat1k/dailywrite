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
import { useTheme } from '../lib/theme'
import { Project } from '@dailywrite/shared'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>

export function ProjectsScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProjects = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    setProjects(data ?? [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useFocusEffect(
    useCallback(() => {
      fetchProjects()
    }, [fetchProjects])
  )

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('NewProject')}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>+ New</Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, colors])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (projects.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 32 }}>{'\uD83D\uDCDD'}</Text>
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No projects yet</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Get started by creating your first project
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
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProjects() }} tintColor={colors.primary} />
      }
    >
      {projects.map((project) => (
        <TouchableOpacity
          key={project.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
          onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {project.title}
            </Text>
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
          </View>
          {project.description && (
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {project.description}
            </Text>
          )}
          <Text style={[styles.cardDate, { color: colors.textTertiary }]}>
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, gap: 12, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyDesc: { fontSize: 15, marginBottom: 24 },
  ctaButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaText: { fontWeight: '600', fontSize: 15 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeBadgeText: { fontSize: 12, fontWeight: '500' },
  cardDesc: { fontSize: 14, marginBottom: 8 },
  cardDate: { fontSize: 12 },
})
