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
        <UButton to="/" variant="ghost" color="neutral" size="sm">
          <UIcon name="i-lucide-search" class="size-4 mr-1" />
          Nueva búsqueda
        </UButton>
        <AuthNav />
      </template>
    </UHeader>

    <UMain class="bg-default">
      <UContainer class="py-16 space-y-10">
        <div class="text-center space-y-4">
          <UBadge color="primary" variant="subtle" size="lg">
            Resultados de tu búsqueda
          </UBadge>
          <h2 class="text-4xl font-bold text-highlighted">Estamos preparando tu viaje ideal</h2>
          <p v-if="routeSummary" class="text-muted">{{ routeSummary }}</p>
        </div>

        <!-- Loading State -->
        <UAlert
          v-if="loading"
          color="info"
          variant="subtle"
          icon="i-lucide-loader-circle"
          class="max-w-2xl mx-auto"
        >
          <template #icon>
            <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
          </template>
          <template #title>
            Estamos buscando la mejor combinación para ti...
          </template>
        </UAlert>

        <!-- Error State -->
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          class="max-w-2xl mx-auto"
        >
          <template #title>No se pudo completar la búsqueda</template>
          <template #description>
            <p class="mb-4">{{ error }}</p>
            <UButton to="/" variant="solid" size="sm">
              Volver al inicio
            </UButton>
          </template>
        </UAlert>

        <!-- Results -->
        <TravelResult
          v-if="(loading || results) && !error"
          :state="loading ? 'loading' : 'success'"
          :results="results"
        />

        <!-- Back to search -->
        <div class="text-center">
          <UButton to="/" variant="link" color="primary" icon="i-lucide-arrow-left">
            Hacer una nueva búsqueda
          </UButton>
        </div>
      </UContainer>
    </UMain>
  </div>
</template>

<script setup lang="ts">
import type { TravelRecommendation, TravelSearchInput } from '~/types/travel'

definePageMeta({
  name: 'results',
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  }
})

const { brand } = useAppConfig()
const route = useRoute()

const loading = ref(true)
const error = ref<string | null>(null)
const results = ref<TravelRecommendation | null>(null)
const supabase = useSupabaseClient()
const supabaseUser = useSupabaseUser()
const { consumeCredit, refreshCredits } = useCredits()

const isTripType = (value: unknown): value is TravelSearchInput['tripType'] => {
  return value === 'roundtrip' || value === 'oneway'
}

const queryParams = computed<TravelSearchInput>(() => {
  const query = route.query
  return {
    departureCity: typeof query.departureCity === 'string' ? query.departureCity : '',
    arrivalCity: typeof query.arrivalCity === 'string' ? query.arrivalCity : '',
    departureDate: typeof query.departureDate === 'string' ? query.departureDate : '',
    returnDate: typeof query.returnDate === 'string' ? query.returnDate : '',
    tripType: isTripType(query.tripType) ? query.tripType : 'roundtrip',
    includeAccommodation: query.includeAccommodation === 'true'
  }
})

const hasRequiredParams = computed(() => {
  return Boolean(queryParams.value.departureCity && queryParams.value.arrivalCity && queryParams.value.departureDate)
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const routeSummary = computed(() => {
  if (!hasRequiredParams.value) return ''
  const { departureCity, arrivalCity, departureDate, returnDate, tripType } = queryParams.value
  let summary = `${departureCity} → ${arrivalCity} | Salida: ${formatDate(departureDate)}`
  if (tripType === 'roundtrip' && returnDate) {
    summary += ` | Regreso: ${formatDate(returnDate)}`
  }
  return summary
})

const summaryTitle = computed(() => {
  return routeSummary.value ? `${brand.name} | ${routeSummary.value}` : `${brand.name} | Resultados`
})

useSeoMeta({
  title: () => summaryTitle.value,
  description: () => brand.description,
  ogTitle: () => summaryTitle.value,
  ogDescription: () => brand.description,
  twitterCard: 'summary_large_image'
})

const fetchResults = async () => {
  if (!hasRequiredParams.value) {
    loading.value = false
    error.value = 'Faltan datos en la búsqueda. Por favor, vuelve a intentarlo.'
    return
  }

  loading.value = true
  error.value = null
  results.value = null

  try {
    // Consumir crédito antes de buscar (solo para usuarios no logueados)
    // Los usuarios logueados consumen créditos en el servidor
    let creditConsumed = false
    if (!supabaseUser.value) {
      const creditResult = await consumeCredit()
      if (!creditResult.success) {
        error.value = creditResult.error || 'No tienes créditos suficientes'
        loading.value = false
        return
      }
      creditConsumed = true
    }

    const body: TravelSearchInput & { _creditConsumed?: boolean } = {
      departureCity: queryParams.value.departureCity,
      arrivalCity: queryParams.value.arrivalCity,
      departureDate: queryParams.value.departureDate,
      tripType: queryParams.value.tripType,
      includeAccommodation: queryParams.value.includeAccommodation,
      returnDate: queryParams.value.tripType === 'roundtrip' ? queryParams.value.returnDate : undefined,
      _creditConsumed: creditConsumed
    }

    // Obtener token de sesión para usuarios logueados
    const headers: Record<string, string> = {}
    if (supabaseUser.value) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers['authorization'] = `Bearer ${session.access_token}`
      }
    }

    const response = await $fetch('/api/generate-travel', {
      method: 'POST',
      body,
      headers
    })

    const outputText = (response as any)?.output_text

    if (!outputText) {
      error.value = 'No se recibieron datos de la respuesta.'
      return
    }

    try {
      results.value = JSON.parse(outputText)
    } catch (parseError) {
      console.error('Error al parsear la respuesta:', parseError)
      error.value = 'No se pudieron procesar los datos del viaje.'
    }
  } catch (fetchError: any) {
    const message = fetchError?.data?.message || fetchError?.message || 'Error al buscar viajes.'
    error.value = message
    // Si falla y es usuario no logueado, restaurar crédito
    if (!supabaseUser.value) {
      await refreshCredits()
    }
  } finally {
    loading.value = false
    await refreshCredits()
  }
}

onMounted(fetchResults)
watch(() => route.fullPath, fetchResults)
</script>
