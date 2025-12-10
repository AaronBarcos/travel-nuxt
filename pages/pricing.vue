<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Navigation -->
    <nav class="border-b border-border">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-primary-foreground font-bold">✈</span>
          </div>
          <h1 class="text-xl font-semibold">{{ brand.name }}</h1>
        </NuxtLink>
        <AuthNav />
      </div>
    </nav>

    <main class="min-h-[calc(100vh-80px)] bg-background">
      <div class="max-w-5xl mx-auto px-6 py-16">
        <!-- Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4">
            Viaja sin límites
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suscríbete y obtén búsquedas ilimitadas con nuestra IA avanzada
          </p>
        </div>

        <!-- Success/Cancel Messages -->
        <div v-if="route.query.subscription === 'success'" class="mb-8 bg-accent/20 border border-accent/40 rounded-lg p-4 text-center">
          <p class="text-accent font-semibold">🎉 ¡Suscripción activada con éxito!</p>
          <p class="text-sm text-muted-foreground mt-1">Ahora tienes búsquedas ilimitadas</p>
        </div>

        <div v-if="route.query.subscription === 'canceled'" class="mb-8 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p class="text-destructive font-medium">Has cancelado el proceso de suscripción</p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Plan Gratuito -->
          <div class="bg-card border border-border rounded-2xl p-8">
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-2">Plan Gratuito</h3>
              <p class="text-muted-foreground text-sm">Para probar la plataforma</p>
            </div>
            <div class="mb-6">
              <span class="text-4xl font-bold">0€</span>
              <span class="text-muted-foreground">/mes</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                2 búsquedas cada 24 horas
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                Recomendaciones con IA
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                Búsqueda de vuelos
              </li>
              <li class="flex items-center gap-2 text-sm text-muted-foreground">
                <span>✗</span>
                Búsquedas ilimitadas
              </li>
              <li class="flex items-center gap-2 text-sm text-muted-foreground">
                <span>✗</span>
                Soporte prioritario
              </li>
            </ul>
            <NuxtLink 
              to="/" 
              class="block w-full py-3 bg-secondary text-center rounded-lg font-medium hover:bg-secondary/80 transition"
            >
              Plan actual
            </NuxtLink>
          </div>

          <!-- Plan Pro -->
          <div class="bg-card border-2 border-primary rounded-2xl p-8 relative">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Recomendado
            </div>
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-2">Plan Pro</h3>
              <p class="text-muted-foreground text-sm">Para viajeros frecuentes</p>
            </div>
            <div class="mb-6">
              <span class="text-4xl font-bold">9,99€</span>
              <span class="text-muted-foreground">/mes</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                <strong>Búsquedas ilimitadas</strong>
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                Recomendaciones con IA avanzada
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                Búsqueda de vuelos y hoteles
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                Historial completo de búsquedas
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="text-accent">✓</span>
                Soporte prioritario
              </li>
            </ul>
            <button 
              v-if="!isSubscribed"
              @click="handleSubscribe"
              :disabled="subscribing || !supabaseUser"
              class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ subscribing ? 'Procesando...' : !supabaseUser ? 'Inicia sesión para suscribirte' : 'Suscribirse ahora' }}
            </button>
            <div v-else class="text-center">
              <p class="text-accent font-semibold mb-2">✓ Ya estás suscrito</p>
              <button 
                @click="handleManageSubscription"
                class="text-sm text-primary hover:underline"
              >
                Gestionar suscripción
              </button>
            </div>
            <p v-if="!supabaseUser" class="text-xs text-muted-foreground text-center mt-3">
              <NuxtLink to="/login" class="text-primary hover:underline">Inicia sesión</NuxtLink> o 
              <NuxtLink to="/register" class="text-primary hover:underline">regístrate</NuxtLink> para suscribirte
            </p>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="mt-8 max-w-md mx-auto bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p class="text-destructive text-sm">{{ errorMessage }}</p>
        </div>

        <!-- FAQ Section -->
        <div class="mt-20">
          <h3 class="text-2xl font-bold text-center mb-10">Preguntas frecuentes</h3>
          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div class="bg-card border border-border rounded-xl p-6">
              <h4 class="font-semibold mb-2">¿Puedo cancelar en cualquier momento?</h4>
              <p class="text-sm text-muted-foreground">Sí, puedes cancelar tu suscripción cuando quieras desde tu perfil. Seguirás teniendo acceso hasta el final del período de facturación.</p>
            </div>
            <div class="bg-card border border-border rounded-xl p-6">
              <h4 class="font-semibold mb-2">¿Qué métodos de pago aceptan?</h4>
              <p class="text-sm text-muted-foreground">Aceptamos todas las tarjetas de crédito y débito principales a través de Stripe, nuestra pasarela de pago segura.</p>
            </div>
            <div class="bg-card border border-border rounded-xl p-6">
              <h4 class="font-semibold mb-2">¿Qué incluyen las búsquedas ilimitadas?</h4>
              <p class="text-sm text-muted-foreground">Con el plan Pro puedes realizar todas las búsquedas que necesites, incluyendo vuelos, hoteles y recomendaciones personalizadas con IA.</p>
            </div>
            <div class="bg-card border border-border rounded-xl p-6">
              <h4 class="font-semibold mb-2">¿Hay período de prueba?</h4>
              <p class="text-sm text-muted-foreground">El plan gratuito te permite probar la plataforma con 2 búsquedas cada 24 horas antes de decidir si el plan Pro es para ti.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
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
</script>

