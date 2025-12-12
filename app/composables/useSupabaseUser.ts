import type { User } from '@supabase/supabase-js'
import type { Ref } from 'vue'

export const useSupabaseUser = () => {
  const nuxtApp = useNuxtApp()
  const user = nuxtApp.$supabaseUser as Ref<User | null> | undefined

  if (!user) {
    return useState<User | null>('supabase:user', () => null)
  }

  return user
}

