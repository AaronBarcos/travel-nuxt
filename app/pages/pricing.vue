<template>
  <div class="min-h-screen bg-default">
    <!-- Navigation Header -->
    <UHeader :title="brand.name" to="/">
      <template #title>
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-plane" class="text-white size-5" />
          </div>
          <span class="text-xl font-semibold text-highlighted">{{ brand.name }}</span>
        </NuxtLink>
      </template>

      <template #right>
        <AuthNav />
      </template>
    </UHeader>

    <UMain class="bg-default">
      <UContainer class="py-16">
        <!-- Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4 text-highlighted">
            Viaja sin límites
          </h2>
          <p class="text-lg text-muted max-w-2xl mx-auto">
            Suscríbete y obtén búsquedas ilimitadas con nuestra IA avanzada
          </p>
        </div>

        <!-- Success/Cancel Messages -->
        <UAlert
          v-if="route.query.subscription === 'success'"
          color="success"
          variant="subtle"
          title="🎉 ¡Suscripción activada con éxito!"
          description="Ahora tienes búsquedas ilimitadas"
          icon="i-lucide-check-circle"
          class="mb-8 max-w-2xl mx-auto"
        />

        <UAlert
          v-if="route.query.subscription === 'canceled'"
          color="error"
          variant="subtle"
          title="Has cancelado el proceso de suscripción"
          icon="i-lucide-x-circle"
          class="mb-8 max-w-2xl mx-auto"
        />

        <!-- Pricing Plans -->
        <UPricingPlans :plans="pricingPlans" class="max-w-4xl mx-auto" scale />

        <!-- Error message -->
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          :title="errorMessage"
          icon="i-lucide-alert-circle"
          class="mt-8 max-w-md mx-auto"
        />

        <!-- FAQ Section -->
        <div class="mt-20">
          <h3 class="text-2xl font-bold text-center text-highlighted mb-10">Preguntas frecuentes</h3>
          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <UPageCard
              title="¿Puedo cancelar en cualquier momento?"
              description="Sí, puedes cancelar tu suscripción cuando quieras desde tu perfil. Seguirás teniendo acceso hasta el final del período de facturación."
              variant="outline"
            />
            <UPageCard
              title="¿Qué métodos de pago aceptan?"
              description="Aceptamos todas las tarjetas de crédito y débito principales a través de Stripe, nuestra pasarela de pago segura."
              variant="outline"
            />
            <UPageCard
              title="¿Qué incluyen las búsquedas ilimitadas?"
              description="Con el plan Pro puedes realizar todas las búsquedas que necesites, incluyendo vuelos, hoteles y recomendaciones personalizadas con IA."
              variant="outline"
            />
            <UPageCard
              title="¿Hay período de prueba?"
              description="El plan gratuito te permite probar la plataforma con 2 búsquedas cada 24 horas antes de decidir si el plan Pro es para ti."
              variant="outline"
            />
          </div>
        </div>
      </UContainer>
    </UMain>
  </div>
</template>

<script setup lang="ts">
import type { PricingPlanProps } from '@nuxt/ui'

definePageMeta({
  name: 'pricing',
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  }
})

const { brand } = useAppConfig()
const route = useRoute()
const supabaseUser = useSupabaseUser()
const { isSubscribed, createCheckout, openPortal } = useSubscription()

useSeoMeta({
  title: `Precios | ${brand.name}`,
  description: 'Planes y precios para búsquedas ilimitadas de viajes con IA',
  ogTitle: `Precios | ${brand.name}`,
  ogDescription: 'Suscríbete y obtén búsquedas ilimitadas con nuestra IA avanzada'
})

const subscribing = ref(false)
const errorMessage = ref<string | null>(null)

const handleSubscribe = async () => {
  if (!supabaseUser.value) {
    return
  }

  subscribing.value = true
  errorMessage.value = null

  try {
    await createCheckout()
  } catch (err: any) {
    console.error('[pricing] Error al crear checkout:', err)
    errorMessage.value = err?.message || 'Error al procesar la suscripción'
  } finally {
    subscribing.value = false
  }
}

const handleManageSubscription = async () => {
  try {
    await openPortal()
  } catch (err: any) {
    console.error('[pricing] Error al abrir portal:', err)
    errorMessage.value = err?.message || 'Error al abrir el portal de facturación'
  }
}

const pricingPlans = computed<PricingPlanProps[]>(() => [
  {
    title: 'Plan Gratuito',
    description: 'Para probar la plataforma',
    price: '0€',
    billingCycle: '/mes',
    features: [
      '2 búsquedas cada 24 horas',
      'Recomendaciones con IA',
      'Búsqueda de vuelos'
    ],
    button: {
      label: 'Plan actual',
      to: '/',
      variant: 'outline' as const,
      color: 'neutral' as const
    },
    variant: 'outline' as const
  },
  {
    title: 'Plan Pro',
    description: 'Para viajeros frecuentes',
    price: '9,99€',
    billingCycle: '/mes',
    badge: 'Recomendado',
    highlight: true,
    scale: true,
    features: [
      { title: 'Búsquedas ilimitadas', icon: 'i-lucide-infinity' },
      { title: 'Recomendaciones con IA avanzada', icon: 'i-lucide-brain' },
      { title: 'Búsqueda de vuelos y hoteles', icon: 'i-lucide-hotel' },
      { title: 'Historial completo de búsquedas', icon: 'i-lucide-history' },
      { title: 'Soporte prioritario', icon: 'i-lucide-headphones' }
    ],
    button: isSubscribed.value
      ? {
          label: 'Gestionar suscripción',
          onClick: handleManageSubscription,
          variant: 'outline' as const,
          color: 'primary' as const
        }
      : {
          label: subscribing.value
            ? 'Procesando...'
            : !supabaseUser.value
              ? 'Inicia sesión para suscribirte'
              : 'Suscribirse ahora',
          onClick: handleSubscribe,
          disabled: subscribing.value || !supabaseUser.value,
          loading: subscribing.value
        },
    variant: 'subtle' as const
  }
])
</script>
