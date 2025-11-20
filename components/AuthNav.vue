<template>
  <div class="flex items-center gap-4">
    <template v-if="user">
      <NuxtLink
        to="/profile"
        class="text-sm text-muted-foreground hover:text-foreground transition"
      >
        Mi perfil
      </NuxtLink>
      <button
        @click="handleLogout"
        class="text-sm text-muted-foreground hover:text-foreground transition"
      >
        Cerrar sesión
      </button>
    </template>
    <template v-else>
      <NuxtLink
        to="/login"
        class="text-sm text-muted-foreground hover:text-foreground transition"
      >
        Iniciar sesión
      </NuxtLink>
      <NuxtLink
        to="/register"
        class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
      >
        Crear cuenta
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const handleLogout = async () => {
  await supabase.auth.signOut()
  await router.push('/')
}
</script>

