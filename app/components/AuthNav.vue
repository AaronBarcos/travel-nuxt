<template>
  <ClientOnly>
    <div class="flex items-center gap-2">
      <template v-if="user">
        <UButton
          to="/profile"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-user"
        >
          Mi perfil
        </UButton>
      </template>
      <template v-else>
        <UButton
          to="/login"
          variant="ghost"
          color="neutral"
          size="sm"
        >
          Iniciar sesión
        </UButton>
        <UButton
          to="/register"
          size="sm"
        >
          Crear cuenta
        </UButton>
      </template>
    </div>
    <template #fallback>
      <div class="flex items-center gap-2">
        <UButton
          to="/login"
          variant="ghost"
          color="neutral"
          size="sm"
        >
          Iniciar sesión
        </UButton>
        <UButton
          to="/register"
          size="sm"
        >
          Crear cuenta
        </UButton>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>
