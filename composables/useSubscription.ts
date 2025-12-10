export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  stripe_price_id: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export const useSubscription = () => {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()

  const subscription = ref<Subscription | null>(null)
  const isSubscribed = ref(false)
  const loading = ref(false)

  const fetchSubscription = async () => {
    if (!supabaseUser.value) {
      subscription.value = null
      isSubscribed.value = false
      return
    }

    loading.value = true
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      if (!token) {
        subscription.value = null
        isSubscribed.value = false
        return
      }

      const response = await $fetch<{ subscription: Subscription | null; isSubscribed: boolean }>('/api/stripe/subscription', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      subscription.value = response.subscription
      isSubscribed.value = response.isSubscribed
    } catch (err) {
      console.error('[subscription] Error obteniendo suscripción:', err)
      subscription.value = null
      isSubscribed.value = false
    } finally {
      loading.value = false
    }
  }

  const createCheckout = async () => {
    const { data: session } = await supabase.auth.getSession()
    const token = session?.session?.access_token

    if (!token) {
      throw new Error('Debes iniciar sesión para suscribirte')
    }

    const response = await $fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.url) {
      window.location.href = response.url
    }
  }

  const openPortal = async () => {
    const { data: session } = await supabase.auth.getSession()
    const token = session?.session?.access_token

    if (!token) {
      throw new Error('Debes iniciar sesión')
    }

    const response = await $fetch('/api/stripe/create-portal', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.url) {
      window.location.href = response.url
    }
  }

  // Inicializar cuando el composable se usa
  if (import.meta.client) {
    fetchSubscription()
    
    watch(
      () => supabaseUser.value,
      () => {
        fetchSubscription()
      }
    )
  }

  return {
    subscription: readonly(subscription),
    isSubscribed: readonly(isSubscribed),
    loading: readonly(loading),
    fetchSubscription,
    createCheckout,
    openPortal
  }
}

