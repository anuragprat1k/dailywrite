import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { useTheme } from '../lib/theme'
import { signInWithGoogle } from '../lib/auth'

export function LoginScreen() {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('Failed to sign in. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.text }]}>Daily Write</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your writing companion for blogs, novels, and creative projects.
          </Text>
        </View>

        <View style={styles.features}>
          {[
            { title: 'Track Your Progress', desc: 'Writing streaks, word counts, and daily stats' },
            { title: 'Organize Projects', desc: 'Manage blogs, novels, essays, and more' },
            { title: 'Distraction-Free', desc: 'Clean editor with auto-save' },
          ].map((feature, i) => (
            <View key={i} style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.desc}</Text>
            </View>
          ))}
        </View>

        {error && (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>
              Sign in with Google
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 12,
    marginBottom: 40,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
