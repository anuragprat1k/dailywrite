import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
import { useAutoSave } from '../lib/useAutoSave'
import { useWritingTimer } from '../lib/useWritingTimer'
import { countWords, getLocalDateString, formatTime } from '@dailywrite/shared'
import { Chapter } from '@dailywrite/shared'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Editor'>

export function EditorScreen({ route, navigation }: Props) {
  const { chapterId, projectId } = route.params
  const { colors } = useTheme()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const initialWordCount = useMemo(
    () => (chapter ? countWords(chapter.content) : 0),
    [chapter]
  )
  const lastSavedWordCountRef = useRef(initialWordCount)

  const wordCount = countWords(content)
  const { elapsedSeconds, isPaused, handleActivity } = useWritingTimer()

  useEffect(() => {
    const fetchChapter = async () => {
      const { data } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single()

      if (data) {
        const ch = data as Chapter
        setChapter(ch)
        setContent(ch.content)
        setTitle(ch.title)
        lastSavedWordCountRef.current = countWords(ch.content)
      }
      setLoading(false)
    }
    fetchChapter()
  }, [chapterId])

  const saveContent = useCallback(
    async (data: string) => {
      const newWordCount = countWords(data)
      const delta = newWordCount - lastSavedWordCountRef.current

      await supabase
        .from('chapters')
        .update({
          content: data,
          word_count: newWordCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapterId)

      await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId)

      if (delta !== 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const today = getLocalDateString()
          const { data: existing } = await supabase
            .from('writing_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

          if (existing) {
            await supabase
              .from('writing_sessions')
              .update({
                words_written: Math.max(0, existing.words_written + delta),
              })
              .eq('id', existing.id)
          } else if (delta > 0) {
            await supabase.from('writing_sessions').insert({
              user_id: user.id,
              date: today,
              words_written: delta,
            })
          }
        }
      }

      lastSavedWordCountRef.current = newWordCount
    },
    [chapterId, projectId]
  )

  const { isSaving, lastSaved } = useAutoSave({
    data: content,
    onSave: saveContent,
    delay: 2000,
    enabled: !loading,
  })

  const handleTitleBlur = async () => {
    if (chapter && title.trim() !== chapter.title) {
      await supabase
        .from('chapters')
        .update({ title: title.trim(), updated_at: new Date().toISOString() })
        .eq('id', chapterId)
      navigation.setOptions({ title: title.trim() })
    }
  }

  // Update header with live stats
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <Text style={[styles.headerStat, { color: colors.textSecondary }]}>
            {formatTime(elapsedSeconds)}
            {isPaused ? ' (paused)' : ''}
          </Text>
          <Text style={[styles.headerStat, { color: colors.textSecondary }]}>
            {wordCount.toLocaleString()} words
          </Text>
          <View style={styles.saveIndicator}>
            <View
              style={[
                styles.saveDot,
                {
                  backgroundColor: isSaving
                    ? '#facc15'
                    : lastSaved
                      ? '#4ade80'
                      : 'transparent',
                },
              ]}
            />
            <Text style={[styles.saveText, { color: colors.textTertiary }]}>
              {isSaving ? 'Saving' : lastSaved ? 'Saved' : ''}
            </Text>
          </View>
        </View>
      ),
    })
  }, [navigation, colors, elapsedSeconds, isPaused, wordCount, isSaving, lastSaved])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="interactive"
      >
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          onBlur={handleTitleBlur}
          placeholder="Chapter title..."
          placeholderTextColor={colors.textTertiary}
        />
        <TextInput
          style={[styles.editor, { color: colors.text }]}
          value={content}
          onChangeText={(text) => {
            setContent(text)
            handleActivity()
          }}
          placeholder="Start writing..."
          placeholderTextColor={colors.textTertiary}
          multiline
          textAlignVertical="top"
          autoFocus
          scrollEnabled={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  titleInput: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    padding: 0,
  },
  editor: {
    fontSize: 17,
    lineHeight: 28,
    minHeight: 400,
    padding: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerStat: {
    fontSize: 12,
  },
  saveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  saveText: {
    fontSize: 11,
  },
})
