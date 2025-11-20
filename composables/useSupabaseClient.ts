import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabaseClient = <Database = any>() => {
  const nuxtApp = useNuxtApp()
  const client = nuxtApp.$supabaseClient as SupabaseClient<Database> | undefined

  if (!client) {
    throw new Error('Supabase client no está inicializado. Revisa la configuración del plugin.')
  }

  return client
}

