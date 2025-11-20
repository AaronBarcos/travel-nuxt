const ANON_USER_ID_KEY = 'travel_anon_user_id'
const ANON_CREDITS_KEY = 'travel_anon_credits'
const ANON_CREDITS_RESET_KEY = 'travel_anon_credits_reset'
const DEFAULT_CREDITS = 2
const CREDITS_RESET_HOURS = 24

export const useCredits = () => {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()

  const getAnonUserId = (): string => {
    if (!import.meta.client) return ''
    
    let userId = localStorage.getItem(ANON_USER_ID_KEY)
    if (!userId) {
      userId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
      localStorage.setItem(ANON_USER_ID_KEY, userId)
    }
    return userId
  }

  const getAnonCredits = (): number => {
    if (!import.meta.client) return DEFAULT_CREDITS

    const resetTime = localStorage.getItem(ANON_CREDITS_RESET_KEY)
    const now = Date.now()
    
    if (resetTime && now > parseInt(resetTime)) {
      localStorage.setItem(ANON_CREDITS_KEY, DEFAULT_CREDITS.toString())
      localStorage.setItem(ANON_CREDITS_RESET_KEY, (now + CREDITS_RESET_HOURS * 60 * 60 * 1000).toString())
      return DEFAULT_CREDITS
    }

    const credits = localStorage.getItem(ANON_CREDITS_KEY)
    if (!credits) {
      localStorage.setItem(ANON_CREDITS_KEY, DEFAULT_CREDITS.toString())
      localStorage.setItem(ANON_CREDITS_RESET_KEY, (now + CREDITS_RESET_HOURS * 60 * 60 * 1000).toString())
      return DEFAULT_CREDITS
    }

    return parseInt(credits) || 0
  }

  const setAnonCredits = (credits: number) => {
    if (!import.meta.client) return
    localStorage.setItem(ANON_CREDITS_KEY, credits.toString())
  }

  const getCredits = async (): Promise<number> => {
    if (supabaseUser.value) {
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', supabaseUser.value.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('[credits] Error obteniendo créditos:', error)
          return 0
        }

        if (data) {
          return data.credits || 0
        }

        return DEFAULT_CREDITS
      } catch (err) {
        console.error('[credits] Error obteniendo créditos:', err)
        return 0
      }
    } else {
      return getAnonCredits()
    }
  }

  const consumeCredit = async (): Promise<{ success: boolean; remaining: number; error?: string }> => {
    if (supabaseUser.value) {
      try {
        const { data, error } = await supabase.rpc('consume_user_credit', {
          user_id_param: supabaseUser.value.id
        })

        if (error) {
          if (error.code === 'P0001') {
            return { success: false, remaining: 0, error: 'No tienes créditos suficientes' }
          }
          console.error('[credits] Error consumiendo crédito:', error)
          return { success: false, remaining: 0, error: 'Error al consumir crédito' }
        }

        return { success: true, remaining: data?.remaining || 0 }
      } catch (err) {
        console.error('[credits] Error consumiendo crédito:', err)
        return { success: false, remaining: 0, error: 'Error al consumir crédito' }
      }
    } else {
      const current = getAnonCredits()
      if (current <= 0) {
        return { success: false, remaining: 0, error: 'No tienes créditos suficientes' }
      }
      setAnonCredits(current - 1)
      return { success: true, remaining: current - 1 }
    }
  }

  const credits = ref(0)
  const loading = ref(false)

  const refreshCredits = async () => {
    if (!import.meta.client) return
    loading.value = true
    try {
      credits.value = await getCredits()
    } catch (err) {
      console.error('[credits] Error refrescando créditos:', err)
    } finally {
      loading.value = false
    }
  }

  // Inicializar créditos cuando el composable se usa
  if (import.meta.client) {
    refreshCredits()
    
    watch(
      () => supabaseUser.value,
      () => {
        refreshCredits()
      }
    )
  }

  return {
    credits: readonly(credits),
    loading: readonly(loading),
    refreshCredits,
    consumeCredit,
    getCredits
  }
}

