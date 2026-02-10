import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/theme'

import { LoginScreen } from '../screens/LoginScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { ProjectsScreen } from '../screens/ProjectsScreen'
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen'
import { EditorScreen } from '../screens/EditorScreen'
import { NewProjectScreen } from '../screens/NewProjectScreen'

export type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  Projects: undefined
  ProjectDetail: { projectId: string }
  Editor: { chapterId: string; projectId: string; chapterTitle: string }
  NewProject: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { colors } = useTheme()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.navBg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      >
        {session ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Daily Write' }}
            />
            <Stack.Screen
              name="Projects"
              component={ProjectsScreen}
              options={{ title: 'Projects' }}
            />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{ title: 'Project' }}
            />
            <Stack.Screen
              name="Editor"
              component={EditorScreen}
              options={({ route }) => ({
                title: route.params.chapterTitle,
                headerBackTitle: 'Back',
              })}
            />
            <Stack.Screen
              name="NewProject"
              component={NewProjectScreen}
              options={{ title: 'New Project', presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
