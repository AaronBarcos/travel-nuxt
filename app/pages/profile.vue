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
      <UContainer class="py-16 max-w-4xl">
        <!-- Success Message -->
        <UAlert
          v-if="route.query.subscription === 'success'"
          color="success"
          variant="subtle"
          title="🎉 ¡Suscripción activada con éxito!"
          description="Ahora tienes búsquedas ilimitadas"
          icon="i-lucide-check-circle"
          class="mb-8"
        />

        <div class="mb-8">
          <h2 class="text-3xl font-bold text-highlighted mb-2">Mi perfil</h2>
          <p class="text-muted">Gestiona tu cuenta y revisa tu historial</p>
        </div>

        <!-- Tarjeta de suscripción -->
        <UCard
          v-if="isSubscribed"
          class="mb-6 bg-gradient-to-r from-primary/10 to-warning/10 border-primary/40"
          variant="outline"
        >
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-crown" class="text-warning size-6" />
                <h3 class="text-xl font-bold text-highlighted">Plan Pro</h3>
              </div>
              <p class="text-sm text-muted">Búsquedas ilimitadas activas</p>
              <p v-if="subscription?.current_period_end" class="text-xs text-muted mt-1">
                Próxima renovación: {{ formatDate(subscription.current_period_end) }}
              </p>
            </div>
            <UButton
              variant="outline"
              color="neutral"
              @click="handleManageSubscription"
            >
              Gestionar suscripción
            </UButton>
          </div>
        </UCard>

        <!-- Banner para no suscritos -->
        <UCard v-else class="mb-6" variant="outline">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 class="font-semibold text-highlighted mb-1">¿Quieres búsquedas ilimitadas?</h3>
              <p class="text-sm text-muted">Suscríbete al Plan Pro por solo 9,99€/mes</p>
            </div>
            <UButton to="/pricing">
              Ver planes
            </UButton>
          </div>
        </UCard>

        <!-- Información del usuario -->
        <UCard class="mb-6" variant="outline">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user" class="size-5 text-primary" />
              <h3 class="text-xl font-semibold text-highlighted">Información de la cuenta</h3>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <p class="text-sm text-muted mb-1">Correo electrónico</p>
              <p class="font-medium text-highlighted">{{ user?.email }}</p>
            </div>
            <USeparator />
            <div>
              <p class="text-sm text-muted mb-1">ID de usuario</p>
              <p class="font-mono text-sm text-highlighted">{{ user?.id }}</p>
            </div>
            <USeparator />
            <div>
              <p class="text-sm text-muted mb-1">Cuenta creada</p>
              <p class="font-medium text-highlighted">{{ formatDate(user?.created_at) }}</p>
            </div>
            <USeparator />
            <div>
              <p class="text-sm text-muted mb-1">Créditos disponibles</p>
              <div class="flex items-center gap-2">
                <span v-if="hasUnlimitedCredits" class="text-2xl font-bold text-warning">∞</span>
                <span v-else class="text-2xl font-bold text-highlighted">{{ credits }}</span>
                <UBadge v-if="hasUnlimitedCredits" color="warning" variant="subtle">
                  Ilimitados (Plan Pro)
                </UBadge>
                <span v-else class="text-sm text-muted">
                  búsqueda{{ credits !== 1 ? 's' : '' }} restante{{ credits !== 1 ? 's' : '' }}
                </span>
              </div>
              <p v-if="!hasUnlimitedCredits" class="text-xs text-muted mt-2">
                Cada búsqueda consume 1 crédito. Los nuevos usuarios reciben 2 créditos gratis al registrarse.
              </p>
            </div>
          </div>
        </UCard>

        <!-- Acciones -->
        <UCard variant="outline">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-settings" class="size-5 text-primary" />
              <h3 class="text-xl font-semibold text-highlighted">Acciones</h3>
            </div>
          </template>

          <div class="space-y-3">
            <UButton
              color="error"
              variant="soft"
              @click="handleLogout"
              icon="i-lucide-log-out"
            >
              Cerrar sesión
            </UButton>
          </div>
        </UCard>
      </UContainer>
    </UMain>
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
