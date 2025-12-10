<template>
  <div class="min-h-screen bg-background text-foreground">
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
      <div class="max-w-4xl mx-auto px-6 py-16">
        <!-- Success Message -->
        <div v-if="route.query.subscription === 'success'" class="mb-8 bg-accent/20 border border-accent/40 rounded-lg p-4">
          <p class="text-accent font-semibold">🎉 ¡Suscripción activada con éxito!</p>
          <p class="text-sm text-muted-foreground mt-1">Ahora tienes búsquedas ilimitadas</p>
        </div>

        <div class="mb-8">
          <h2 class="text-3xl font-bold mb-2">Mi perfil</h2>
          <p class="text-muted-foreground">Gestiona tu cuenta y revisa tu historial</p>
        </div>

        <!-- Tarjeta de suscripción -->
        <div v-if="isSubscribed" class="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 rounded-2xl p-8 mb-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">👑</span>
                <h3 class="text-xl font-bold">Plan Pro</h3>
              </div>
              <p class="text-sm text-muted-foreground">Búsquedas ilimitadas activas</p>
              <p v-if="subscription?.current_period_end" class="text-xs text-muted-foreground mt-1">
                Próxima renovación: {{ formatDate(subscription.current_period_end) }}
              </p>
            </div>
            <button 
              @click="handleManageSubscription"
              class="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition"
            >
              Gestionar suscripción
            </button>
          </div>
        </div>

        <!-- Banner para no suscritos -->
        <div v-else class="bg-card border border-border rounded-2xl p-6 mb-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 class="font-semibold mb-1">¿Quieres búsquedas ilimitadas?</h3>
              <p class="text-sm text-muted-foreground">Suscríbete al Plan Pro por solo 9,99€/mes</p>
            </div>
            <NuxtLink 
              to="/pricing"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
            >
              Ver planes
            </NuxtLink>
          </div>
        </div>

        <!-- Información del usuario -->
        <div class="bg-card border border-border rounded-2xl p-8 mb-6">
          <h3 class="text-xl font-semibold mb-4">Información de la cuenta</h3>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-muted-foreground mb-1">Correo electrónico</p>
              <p class="font-medium">{{ user?.email }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">ID de usuario</p>
              <p class="font-mono text-sm">{{ user?.id }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Cuenta creada</p>
              <p class="font-medium">{{ formatDate(user?.created_at) }}</p>
            </div>
            <div class="pt-3 border-t border-border">
              <p class="text-sm text-muted-foreground mb-1">Créditos disponibles</p>
              <div class="flex items-center gap-2">
                <span v-if="hasUnlimitedCredits" class="text-2xl font-bold text-accent">∞</span>
                <span v-else class="text-2xl font-bold">{{ credits }}</span>
                <span v-if="hasUnlimitedCredits" class="text-sm text-accent font-medium">Ilimitados (Plan Pro)</span>
                <span v-else class="text-sm text-muted-foreground">búsqueda{{ credits !== 1 ? 's' : '' }} restante{{ credits !== 1 ? 's' : '' }}</span>
              </div>
              <p v-if="!hasUnlimitedCredits" class="text-xs text-muted-foreground mt-2">
                Cada búsqueda consume 1 crédito. Los nuevos usuarios reciben 2 créditos gratis al registrarse.
              </p>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="bg-card border border-border rounded-2xl p-8">
          <div class="space-y-3">
            <button
              @click="handleLogout"
              class="w-full sm:w-auto px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { brand } = useAppConfig()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()
const { credits, hasUnlimitedCredits, refreshCredits } = useCredits()
const { isSubscribed, subscription, openPortal, fetchSubscription } = useSubscription()

useSeoMeta({
  title: `Mi perfil | ${brand.name}`,
  description: 'Gestiona tu cuenta y revisa tu historial de búsquedas'
})

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  await router.push('/')
}

const handleManageSubscription = async () => {
  try {
    await openPortal()
  } catch (err) {
    console.error('[profile] Error al abrir portal:', err)
  }
}

onMounted(() => {
  refreshCredits()
  fetchSubscription()
})
</script>

