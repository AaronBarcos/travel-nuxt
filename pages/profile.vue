<template>
  <div class="min-h-screen bg-background text-foreground">
    <nav class="border-b border-border">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-primary-foreground font-bold">✈</span>
          </div>
          <h1 class="text-xl font-semibold">{{ brand.name }}</h1>
        </div>
        <AuthNav />
      </div>
    </nav>

    <main class="min-h-[calc(100vh-80px)] bg-background">
      <div class="max-w-4xl mx-auto px-6 py-16">
        <div class="mb-8">
          <h2 class="text-3xl font-bold mb-2">Mi perfil</h2>
          <p class="text-muted-foreground">Gestiona tu cuenta y revisa tu historial</p>
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
</script>

