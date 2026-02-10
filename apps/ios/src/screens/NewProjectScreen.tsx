import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'
import { PROJECT_TYPES } from '@dailywrite/shared'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'NewProject'>

export function NewProjectScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('blog')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      Alert.alert('Error', 'Not authenticated')
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        type,
      })
      .select()
      .single()

    if (error) {
      Alert.alert('Error', 'Failed to create project')
      setIsSubmitting(false)
      return
    }

    if (data) {
      navigation.replace('ProjectDetail', { projectId: data.id })
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode="on-drag"
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Project Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="Enter project title"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="What's this project about?"
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Project Type</Text>
        <View style={styles.typeGrid}>
          {PROJECT_TYPES.map((pt) => (
            <TouchableOpacity
              key={pt.value}
              style={[
                styles.typeOption,
                {
                  backgroundColor: type === pt.value ? colors.primary : colors.inputBg,
                  borderColor: type === pt.value ? colors.primary : colors.inputBorder,
                },
              ]}
              onPress={() => setType(pt.value)}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: type === pt.value ? colors.primaryText : colors.text },
                ]}
              >
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary, opacity: !title.trim() || isSubmitting ? 0.5 : 1 }]}
            onPress={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            <Text style={[styles.submitText, { color: colors.primaryText }]}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.inputBg }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
    marginTop: 24,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '500',
    fontSize: 16,
  },
})
