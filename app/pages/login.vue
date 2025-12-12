<template>
  <div class="min-h-screen bg-default flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-plane" class="text-white size-8" />
        </div>
        <h1 class="text-3xl font-bold text-highlighted mb-2">{{ brand.name }}</h1>
        <p class="text-muted">Inicia sesión en tu cuenta</p>
      </div>

      <!-- Formulario de login -->
      <UPageCard variant="outline">
        <UAuthForm
          :fields="fields"
          :schema="schema"
          title=""
          :submit="{ label: loading ? 'Iniciando sesión...' : 'Iniciar sesión', block: true, disabled: loading }"
          @submit="handleLogin"
        >
          <template #validation>
            <UAlert
              v-if="error"
              color="error"
              variant="subtle"
              :title="error"
              icon="i-lucide-alert-circle"
            />
          </template>

          <template #footer>
            <div class="text-center space-y-2">
              <p class="text-sm text-muted">
                ¿No tienes cuenta?
                <NuxtLink to="/register" class="text-primary hover:underline font-medium">
                  Regístrate
                </NuxtLink>
              </p>
              <NuxtLink to="/" class="text-sm text-muted hover:text-highlighted transition flex items-center justify-center gap-1">
                <UIcon name="i-lucide-arrow-left" class="size-4" />
                Volver al inicio
              </NuxtLink>
            </div>
          </template>
        </UAuthForm>
      </UPageCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const { brand } = useAppConfig()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)

useSeoMeta({
  title: `Iniciar sesión | ${brand.name}`,
  description: 'Inicia sesión en tu cuenta para guardar tus búsquedas y favoritos'
})

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Correo electrónico',
    placeholder: 'tu@email.com',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Contraseña',
    placeholder: '••••••••',
    required: true
  }
]

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

type Schema = z.output<typeof schema>

const handleLogin = async (payload: FormSubmitEvent<Schema>) => {
  loading.value = true
  error.value = null

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: payload.data.email,
      password: payload.data.password
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
