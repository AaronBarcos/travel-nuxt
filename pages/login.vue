<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
          <span class="text-primary-foreground font-bold text-2xl">✈</span>
        </div>
        <h1 class="text-3xl font-bold mb-2">{{ brand.name }}</h1>
        <p class="text-muted-foreground">Inicia sesión en tu cuenta</p>
      </div>

      <!-- Formulario de login -->
      <div class="bg-card border border-border rounded-2xl p-8 shadow-lg">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold mb-2">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="tu@email.com"
              class="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block text-sm font-semibold mb-2">Contraseña</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          <!-- Error message -->
          <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p class="text-destructive text-sm">{{ error }}</p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <!-- Links -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-sm text-muted-foreground">
            ¿No tienes cuenta?
            <NuxtLink to="/register" class="text-primary hover:underline font-medium">
              Regístrate
            </NuxtLink>
          </p>
          <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground transition">
            ← Volver al inicio
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest'
})

const { brand } = useAppConfig()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

useSeoMeta({
  title: `Iniciar sesión | ${brand.name}`,
  description: 'Inicia sesión en tu cuenta para guardar tus búsquedas y favoritos'
})

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) {
      error.value = authError.message
      return
    }

    // Redirigir al inicio después del login
    await router.push('/')
  } catch (err: any) {
    error.value = err?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}

// Si ya está autenticado, redirigir
watch(user, (newUser) => {
  if (newUser) {
    router.push('/')
  }
}, { immediate: true })
</script>

