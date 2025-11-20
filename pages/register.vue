<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
          <span class="text-primary-foreground font-bold text-2xl">✈</span>
        </div>
        <h1 class="text-3xl font-bold mb-2">{{ brand.name }}</h1>
        <p class="text-muted-foreground">Crea tu cuenta para comenzar</p>
      </div>

      <!-- Formulario de registro -->
      <div class="bg-card border border-border rounded-2xl p-8 shadow-lg">
        <form @submit.prevent="handleRegister" class="space-y-6">
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
              minlength="6"
              class="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <p class="text-xs text-muted-foreground mt-1">Mínimo 6 caracteres</p>
          </div>

          <!-- Confirmar contraseña -->
          <div>
            <label class="block text-sm font-semibold mb-2">Confirmar contraseña</label>
            <input
              v-model="confirmPassword"
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

          <!-- Success message -->
          <div v-if="success" class="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p class="text-green-600 dark:text-green-400 text-sm">
              ¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.
            </p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <!-- Links -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?
            <NuxtLink to="/login" class="text-primary hover:underline font-medium">
              Inicia sesión
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
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

useSeoMeta({
  title: `Registro | ${brand.name}`,
  description: 'Crea tu cuenta para guardar tus búsquedas y favoritos'
})

const handleRegister = async () => {
  loading.value = true
  error.value = null
  success.value = false

  // Validar que las contraseñas coincidan
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    loading.value = false
    return
  }

  // Validar longitud mínima
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    loading.value = false
    return
  }

  try {
    const { error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (authError) {
      error.value = authError.message
      return
    }

    success.value = true
    // Limpiar formulario
    email.value = ''
    password.value = ''
    confirmPassword.value = ''

    // Redirigir después de 2 segundos
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    error.value = err?.message || 'Error al crear la cuenta'
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

