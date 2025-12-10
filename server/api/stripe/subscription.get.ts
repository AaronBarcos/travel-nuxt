import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  // Obtener usuario autenticado
  const authHeader = event.headers.get('authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'No autorizado'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'No autorizado'
    })
  }

  console.log('user', user.id)

  // Obtener suscripción activa
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  console.log('subscription', subscription)

  if (error && error.code !== 'PGRST116') {
    throw createError({
      statusCode: 500,
      message: 'Error obteniendo suscripción'
    })
  }

  return {
    subscription: subscription || null,
    isSubscribed: !!subscription
  }
})

