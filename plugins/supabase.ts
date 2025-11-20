import { createClient } from '@supabase/supabase-js'
import type { SupportedStorage } from '@supabase/auth-js'
import type { User } from '@supabase/supabase-js'

const serverStorage: SupportedStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.dev) {
      console.warn('[supabase] Faltan NUXT_PUBLIC_SUPABASE_URL o NUXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    return
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: import.meta.client,
      detectSessionInUrl: import.meta.client,
      storage: import.meta.client ? undefined : serverStorage
    }
  })

  const supabaseUser = useState<User | null>('supabase:user', () => null)

  if (import.meta.client) {
    const { data } = await supabaseClient.auth.getSession()
    supabaseUser.value = data.session?.user ?? null

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      supabaseUser.value = session?.user ?? null
    })
  }

  nuxtApp.provide('supabaseClient', supabaseClient)
  nuxtApp.provide('supabaseUser', supabaseUser)
})

