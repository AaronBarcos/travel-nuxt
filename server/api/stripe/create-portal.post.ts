import { createClient } from '@supabase/supabase-js'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const stripe = await useServerStripe(event)
  
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

  // Obtener cliente de Stripe
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    throw createError({
      statusCode: 404,
      message: 'No se encontró cliente de Stripe'
    })
  }

  // Crear sesión del portal
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${config.public.siteUrl}/profile`
  })

  return {
    url: session.url
  }
})

