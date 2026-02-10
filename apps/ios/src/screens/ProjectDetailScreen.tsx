import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
import { Project, Chapter, SINGLE_DOCUMENT_TYPES } from '@dailywrite/shared'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>

export function ProjectDetailScreen({ route, navigation }: Props) {
  const { projectId } = route.params
  const { colors } = useTheme()
  const [project, setProject] = useState<Project | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchData = useCallback(async () => {
    const [projectRes, chaptersRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('chapters').select('*').eq('project_id', projectId).order('sort_order', { ascending: true }),
    ])

    if (projectRes.data) setProject(projectRes.data as Project)
    setChapters((chaptersRes.data ?? []) as Chapter[])
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [fetchData])
  )

  useEffect(() => {
    if (project) {
      navigation.setOptions({ title: project.title })
    }
  }, [project, navigation])

  // For single-document types, navigate directly to editor
  useEffect(() => {
    if (!loading && project && SINGLE_DOCUMENT_TYPES.includes(project.type as 'blog' | 'essay')) {
      if (chapters.length > 0) {
        navigation.replace('Editor', {
          chapterId: chapters[0].id,
          projectId,
          chapterTitle: project.title,
        })
      } else {
        // Create a default chapter for single-doc project
        const createDefault = async () => {
          const { data } = await supabase
            .from('chapters')
            .insert({ project_id: projectId, title: project.title, sort_order: 0 })
            .select()
            .single()
          if (data) {
            navigation.replace('Editor', {
              chapterId: data.id,
              projectId,
              chapterTitle: project.title,
            })
          }
        }
        createDefault()
      }
    }
  }, [loading, project, chapters, navigation, projectId])

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return
    setIsCreating(true)

    const maxOrder = chapters.length > 0
      ? Math.max(...chapters.map((c) => c.sort_order))
      : -1

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        project_id: projectId,
        title: newChapterTitle.trim(),
        sort_order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      Alert.alert('Error', 'Failed to create chapter')
    } else if (data) {
      setNewChapterTitle('')
      navigation.navigate('Editor', {
        chapterId: data.id,
        projectId,
        chapterTitle: data.title,
      })
    }
    setIsCreating(false)
  }

  const handleDeleteChapter = (chapterId: string, title: string) => {
    Alert.alert('Delete Chapter', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('chapters').delete().eq('id', chapterId)
          fetchData()
        },
      },
    ])
  }

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      'This will permanently delete this project and all its chapters.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('chapters').delete().eq('project_id', projectId)
            await supabase.from('projects').delete().eq('id', projectId)
            navigation.goBack()
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!project) return null

  const totalWords = chapters.reduce((sum, c) => sum + c.word_count, 0)

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Chapter creation */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Chapters</Text>
        <View style={styles.createRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="New chapter title..."
            placeholderTextColor={colors.textTertiary}
            value={newChapterTitle}
            onChangeText={setNewChapterTitle}
            onSubmitEditing={handleCreateChapter}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary, opacity: !newChapterTitle.trim() || isCreating ? 0.5 : 1 }]}
            onPress={handleCreateChapter}
            disabled={!newChapterTitle.trim() || isCreating}
          >
            <Text style={[styles.addButtonText, { color: colors.primaryText }]}>
              {isCreating ? '...' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {chapters.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No chapters yet. Add your first chapter above.
          </Text>
        ) : (
          chapters
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((chapter, index) => (
              <TouchableOpacity
                key={chapter.id}
                style={[styles.chapterRow, { borderColor: colors.surfaceBorder }]}
                onPress={() =>
                  navigation.navigate('Editor', {
                    chapterId: chapter.id,
                    projectId,
                    chapterTitle: chapter.title,
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={[styles.chapterNum, { color: colors.textTertiary }]}>{index + 1}</Text>
                <View style={styles.chapterInfo}>
                  <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
                  <Text style={[styles.chapterWords, { color: colors.textSecondary }]}>
                    {chapter.word_count.toLocaleString()} words
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteChapter(chapter.id, chapter.title)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ color: colors.textTertiary, fontSize: 18 }}>{'\u00D7'}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
        )}
      </View>

      {/* Project info */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{project.title}</Text>
        {project.description && (
          <Text style={[styles.projectDesc, { color: colors.textSecondary }]}>
            {project.description}
          </Text>
        )}
        <View style={styles.infoGrid}>
          {[
            { label: 'Type', value: project.type },
            { label: 'Chapters', value: chapters.length.toString() },
            { label: 'Total Words', value: totalWords.toLocaleString() },
            { label: 'Created', value: new Date(project.created_at).toLocaleDateString() },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Danger zone */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.danger }]}>Danger Zone</Text>
        <Text style={[styles.dangerText, { color: colors.textSecondary }]}>
          Deleting this project will remove all chapters and content permanently.
        </Text>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={handleDeleteProject}
        >
          <Text style={styles.deleteButtonText}>Delete Project</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, gap: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  createRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  addButton: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { fontWeight: '600', fontSize: 15 },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 15,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  chapterNum: { fontSize: 14, width: 24, textAlign: 'center' },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontSize: 15, fontWeight: '500' },
  chapterWords: { fontSize: 13, marginTop: 2 },
  projectDesc: { fontSize: 14, marginBottom: 12 },
  infoGrid: { gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, textTransform: 'capitalize' },
  dangerText: { fontSize: 14, marginBottom: 12 },
  deleteButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
})
