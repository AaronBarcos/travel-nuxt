import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { useServerStripe } from '#stripe/server'
import type Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const stripe = await useServerStripe(event)
  
  // Usar service role para operaciones de webhook (bypass RLS)
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  const signature = event.headers.get('stripe-signature')
  
  if (!signature) {
    throw createError({
      statusCode: 400,
      message: 'No se encontró la firma de Stripe'
    })
  }

  const rawBody = await readRawBody(event)
  
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      message: 'No se encontró el cuerpo de la petición'
    })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe.webhookSecret
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[stripe webhook] Error verificando firma:', message)
    throw createError({
      statusCode: 400,
      message: `Error de webhook: ${message}`
    })
  }

  // Manejar eventos
  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object
      await handleCheckoutCompleted(supabase, stripe, session)
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = stripeEvent.data.object
      await handleSubscriptionUpdate(supabase, subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = stripeEvent.data.object
      await handleSubscriptionDeleted(supabase, subscription)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = stripeEvent.data.object as Stripe.Invoice & { subscription?: string | null }
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        await handleSubscriptionUpdate(supabase, subscription)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = stripeEvent.data.object
      console.warn('[stripe webhook] Pago fallido para invoice:', invoice.id)
      break
    }
  }

  return { received: true }
})

async function handleCheckoutCompleted(
  supabase: SupabaseClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  if (session.mode !== 'subscription' || !session.subscription) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  const userId = session.metadata?.user_id

  if (!userId) {
    console.error('[stripe webhook] No se encontró user_id en metadata de sesión')
    return
  }

  await upsertSubscription(supabase, userId, subscription)
}

async function handleSubscriptionUpdate(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  // Obtener user_id desde stripe_customers
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer)
    .single()

  if (!customer) {
    console.error('[stripe webhook] No se encontró cliente para subscription:', subscription.id)
    return
  }

  await upsertSubscription(supabase, customer.user_id, subscription)
}

async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('[stripe webhook] Error actualizando suscripción cancelada:', error)
  }
}

// Convierte timestamp Unix o Date a ISO string de forma segura
function toISOStringSafe(value: unknown): string | null {
  if (!value) return null
  
  // Si es un número (timestamp Unix en segundos)
  if (typeof value === 'number') {
    const date = new Date(value * 1000)
    return isNaN(date.getTime()) ? null : date.toISOString()
  }
  
  // Si es un string, intentar parsearlo
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date.toISOString()
  }
  
  // Si es un Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString()
  }
  
  return null
}

async function upsertSubscription(
  supabase: SupabaseClient,
  userId: string,
  subscription: Stripe.Subscription
) {
  // Acceder a las propiedades usando Record para evitar errores de tipo
  const sub = subscription as unknown as Record<string, unknown>

  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: sub.id as string,
    stripe_customer_id: (sub.customer as string) || '',
    stripe_price_id: ((sub.items as { data: Array<{ price: { id: string } }> })?.data?.[0]?.price?.id) || '',
    status: (sub.status as string) || 'incomplete',
    current_period_start: toISOStringSafe(sub.current_period_start),
    current_period_end: toISOStringSafe(sub.current_period_end),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    canceled_at: toISOStringSafe(sub.canceled_at),
    updated_at: new Date().toISOString()
  }

  console.log('[stripe webhook] Guardando suscripción:', subscriptionData)

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'stripe_subscription_id'
    })

  if (error) {
    console.error('[stripe webhook] Error guardando suscripción:', error)
  }
}
