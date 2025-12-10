<template>
  <ClientOnly>
    <!-- Banner para usuarios no logueados -->
    <div v-if="!user && showBanner" class="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 rounded-xl p-6 mb-8 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3 flex-1">
          <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-xl">🎁</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-foreground mb-1">
              ¡Crea una cuenta y obtén 2 créditos gratis!
            </h3>
            <p class="text-sm text-muted-foreground">
              Regístrate ahora y recibe 2 búsquedas adicionales de forma gratuita. No te pierdas las mejores ofertas de viaje.
            </p>
          </div>
        </div>
        <div class="flex gap-3 flex-shrink-0">
          <NuxtLink
            to="/register"
            class="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            Crear cuenta gratis
          </NuxtLink>
          <button
            @click="dismissBanner"
            class="px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Banner de suscripción para usuarios logueados sin suscripción -->
    <div v-else-if="user && !isSubscribed && showSubscriptionBanner" class="bg-gradient-to-r from-accent/10 via-accent/5 to-primary/10 border border-accent/20 rounded-xl p-6 mb-8 shadow-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3 flex-1">
          <div class="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-xl">👑</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-foreground mb-1">
              ¡Desbloquea búsquedas ilimitadas!
            </h3>
            <p class="text-sm text-muted-foreground">
              Suscríbete al Plan Pro por solo 9,99€/mes y realiza todas las búsquedas que necesites sin límites.
            </p>
          </div>
        </div>
        <div class="flex gap-3 flex-shrink-0">
          <NuxtLink
            to="/pricing"
            class="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            Ver Plan Pro
          </NuxtLink>
          <button
            @click="dismissSubscriptionBanner"
            class="px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
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

