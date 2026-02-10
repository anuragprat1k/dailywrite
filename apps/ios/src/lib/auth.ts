import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from './supabase'

WebBrowser.maybeCompleteAuthSession()

const redirectTo = makeRedirectUri({ scheme: 'dailywrite' })

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (error) throw error

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

    if (result.type === 'success') {
      const url = new URL(result.url)
      const params = new URLSearchParams(url.hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      }
    }
  }
}

export async function signOut() {
  await supabase.auth.signOut()
}
