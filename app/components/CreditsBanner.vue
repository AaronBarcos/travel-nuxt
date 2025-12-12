<template>
  <ClientOnly>
    <!-- Banner para usuarios no logueados -->
    <UAlert
      v-if="!user && showBanner"
      color="primary"
      variant="subtle"
      icon="i-lucide-gift"
      class="mb-8"
      :close="true"
      @update:open="dismissBanner"
    >
      <template #title>
        ¡Crea una cuenta y obtén 2 créditos gratis!
      </template>
      <template #description>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <p class="text-sm">
            Regístrate ahora y recibe 2 búsquedas adicionales de forma gratuita. No te pierdas las mejores ofertas de viaje.
          </p>
          <UButton to="/register" size="sm" class="shrink-0">
            Crear cuenta gratis
          </UButton>
        </div>
      </template>
    </UAlert>

    <!-- Banner de suscripción para usuarios logueados sin suscripción -->
    <UAlert
      v-else-if="user && !isSubscribed && showSubscriptionBanner"
      color="warning"
      variant="subtle"
      icon="i-lucide-crown"
      class="mb-8"
      :close="true"
      @update:open="dismissSubscriptionBanner"
    >
      <template #title>
        ¡Desbloquea búsquedas ilimitadas!
      </template>
      <template #description>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <p class="text-sm">
            Suscríbete al Plan Pro por solo 9,99€/mes y realiza todas las búsquedas que necesites sin límites.
          </p>
          <UButton to="/pricing" color="warning" size="sm" class="shrink-0">
            Ver Plan Pro
          </UButton>
        </div>
      </template>
    </UAlert>
  </ClientOnly>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { isSubscribed } = useSubscription()
const BANNER_DISMISSED_KEY = 'travel_credits_banner_dismissed'
const SUBSCRIPTION_BANNER_KEY = 'travel_subscription_banner_dismissed'
const showBanner = ref(true)
const showSubscriptionBanner = ref(true)

const dismissBanner = () => {
  if (import.meta.client) {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
    showBanner.value = false
  }
}

const dismissSubscriptionBanner = () => {
  if (import.meta.client) {
    localStorage.setItem(SUBSCRIPTION_BANNER_KEY, 'true')
    showSubscriptionBanner.value = false
  }
}

onMounted(() => {
  if (import.meta.client) {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
    showBanner.value = dismissed !== 'true'
    
    const subscriptionDismissed = localStorage.getItem(SUBSCRIPTION_BANNER_KEY)
    showSubscriptionBanner.value = subscriptionDismissed !== 'true'
  }
})

watch(() => user.value, (newUser) => {
  if (newUser) {
    showBanner.value = false
  }
})
</script>
