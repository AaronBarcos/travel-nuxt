import { createClient } from '@supabase/supabase-js'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const stripe = await useServerStripe(event)
  
  const priceId = config.stripe.proPriceId
  
  if (!priceId) {
    throw createError({
      statusCode: 500,
      message: 'STRIPE_PRO_PRICE_ID no configurado'
    })
  }
  
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

  // Buscar o crear cliente de Stripe
  let stripeCustomerId: string

  const { data: existingCustomer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (existingCustomer) {
    stripeCustomerId = existingCustomer.stripe_customer_id
  } else {
    // Crear cliente en Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id
      }
    })

    // Guardar en la base de datos
    await supabase
      .from('stripe_customers')
      .insert({
        user_id: user.id,
        stripe_customer_id: customer.id
      })

    stripeCustomerId = customer.id
  }

  // Crear sesión de checkout
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: `${config.public.siteUrl}/profile?subscription=success`,
    cancel_url: `${config.public.siteUrl}/pricing?subscription=canceled`,
    metadata: {
      user_id: user.id
    }
  })

  return {
    url: session.url
  }
})

