<template>
  <div class="min-h-screen bg-default flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-plane" class="text-white size-8" />
        </div>
        <h1 class="text-3xl font-bold text-highlighted mb-2">{{ brand.name }}</h1>
        <p class="text-muted">Crea tu cuenta para comenzar</p>
      </div>

      <!-- Formulario de registro -->
      <UPageCard variant="outline">
        <UAuthForm
          :fields="fields"
          :schema="schema"
          title=""
          :submit="{ label: loading ? 'Creando cuenta...' : 'Crear cuenta', block: true, disabled: loading }"
          @submit="handleRegister"
        >
          <template #validation>
            <UAlert
              v-if="error"
              color="error"
              variant="subtle"
              :title="error"
              icon="i-lucide-alert-circle"
            />
            <UAlert
              v-if="success"
              color="success"
              variant="subtle"
              title="¡Cuenta creada!"
              description="Revisa tu correo para confirmar tu cuenta."
              icon="i-lucide-check-circle"
            />
          </template>

          <template #footer>
            <div class="text-center space-y-2">
              <p class="text-sm text-muted">
                ¿Ya tienes cuenta?
                <NuxtLink to="/login" class="text-primary hover:underline font-medium">
                  Inicia sesión
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
const success = ref(false)

useSeoMeta({
  title: `Registro | ${brand.name}`,
  description: 'Crea tu cuenta para guardar tus búsquedas y favoritos'
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
    required: true,
    help: 'Mínimo 6 caracteres'
  },
  {
    name: 'confirmPassword',
    type: 'password',
    label: 'Confirmar contraseña',
    placeholder: '••••••••',
    required: true
  }
]

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

const handleRegister = async (payload: FormSubmitEvent<Schema>) => {
  loading.value = true
  error.value = null
  success.value = false

  try {
    const { error: authError } = await supabase.auth.signUp({
      email: payload.data.email,
      password: payload.data.password
    })

    if (authError) {
      error.value = authError.message
      return
    }

    success.value = true

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
