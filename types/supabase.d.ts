import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Ref } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $supabaseClient: SupabaseClient
    $supabaseUser: Ref<User | null>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabaseClient: SupabaseClient
    $supabaseUser: Ref<User | null>
  }
}

export {}

