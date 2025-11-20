<template>
  <ClientOnly>
    <div class="flex items-center gap-4">
      <template v-if="user">
        <NuxtLink
          to="/profile"
          class="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Mi perfil
        </NuxtLink>
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
    <template #fallback>
      <div class="flex items-center gap-4">
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
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>

