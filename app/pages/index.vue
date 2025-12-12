<template>
  <div class="min-h-screen bg-default">
    <!-- Navigation Header -->
    <UHeader :title="brand.name" to="/">
      <template #title>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-plane" class="text-white size-5" />
          </div>
          <span class="text-xl font-semibold text-highlighted">{{ brand.name }}</span>
        </div>
      </template>

      <template #right>
        <UButton
          :to="'/pricing'"
          variant="ghost"
          color="neutral"
          class="gap-2"
        >
          <UIcon v-if="hasUnlimitedCredits" name="i-lucide-crown" class="text-warning size-4" />
          <UIcon v-else name="i-lucide-credit-card" class="size-4" />
          <span v-if="hasUnlimitedCredits" class="text-sm font-semibold text-warning">Ilimitado</span>
          <span v-else class="text-sm font-semibold">{{ credits }} crédito{{ credits !== 1 ? 's' : '' }}</span>
        </UButton>
        <AuthNav />
      </template>
    </UHeader>

    <!-- Hero Section with Search -->
    <UMain class="bg-default">
      <UContainer class="py-16">
        <!-- Header -->
        <div class="mb-12 text-center">
          <h2 class="text-4xl md:text-5xl font-bold mb-4 text-highlighted text-balance">
            Encuentra tu próxima aventura con la <span class="text-primary">IA</span>
          </h2>
          <p class="text-lg text-muted max-w-2xl mx-auto">
            Descubre recomendaciones personalizadas impulsadas por IA avanzada. Compara vuelos, hoteles y experiencias en segundos.
          </p>
        </div>

        <!-- Credits Banner -->
        <CreditsBanner />

        <!-- Search Form Card -->
        <UCard class="max-w-4xl mx-auto" variant="outline">
          <!-- Trip Type Selector -->
          <div class="mb-8">
            <URadioGroup
              v-model="tripType"
              :items="tripTypeOptions"
              orientation="horizontal"
            />
          </div>

          <!-- Search Inputs Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <!-- Departure City -->
            <UFormField label="Desde" required>
              <USelect
                v-model="departureCity"
                :items="spanishCities"
                placeholder="Selecciona ciudad"
                icon="i-lucide-plane-takeoff"
                :highlight="fieldErrors.departureCity"
                color="error"
                class="w-full"
                @change="fieldErrors.departureCity = false"
              />
            </UFormField>

            <!-- Arrival City -->
            <UFormField label="Hasta" required>
              <USelect
                v-model="arrivalCity"
                :items="spanishCities"
                placeholder="Selecciona ciudad"
                icon="i-lucide-map-pin"
                :highlight="fieldErrors.arrivalCity"
                color="error"
                class="w-full"
                @change="fieldErrors.arrivalCity = false"
              />
            </UFormField>

            <!-- Departure Date -->
            <UFormField label="Salida" required>
              <UInput
                v-model="departureDate"
                type="date"
                :min="new Date().toISOString().split('T')[0]"
                :highlight="fieldErrors.departureDate"
                color="error"
                class="w-full"
                @input="fieldErrors.departureDate = false"
              />
            </UFormField>

            <!-- Return Date -->
            <UFormField label="Regreso" :required="tripType === 'roundtrip'">
              <UInput
                v-model="returnDate"
                type="date"
                :min="tripType === 'roundtrip' ? departureDate : undefined"
                :disabled="tripType === 'oneway'"
                :highlight="fieldErrors.returnDate"
                color="error"
                class="w-full"
                @input="fieldErrors.returnDate = false"
              />
            </UFormField>
          </div>

          <!-- Accommodation Checkbox and Search Button -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <UCheckbox
              v-model="includeAccommodation"
              label="Incluir búsqueda de alojamientos"
              description="La IA recomendará hoteles cercanos"
            />
            <div class="flex gap-3">
              <UButton
                variant="outline"
                color="neutral"
                @click="resetForm"
              >
                Reiniciar
              </UButton>
              <UButton
                :disabled="loading || (!hasUnlimitedCredits && credits <= 0)"
                :loading="loading"
                @click="searchTrips"
              >
                {{ loading ? 'Buscando...' : (!hasUnlimitedCredits && credits <= 0) ? 'Sin créditos' : 'Buscar con IA' }}
              </UButton>
            </div>
          </div>

          <!-- Error Message -->
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :title="error"
            icon="i-lucide-alert-circle"
            class="mt-8"
          >
            <template #description>
              <p v-if="!hasUnlimitedCredits && credits <= 0 && !supabaseUser">
                <NuxtLink to="/register" class="text-primary hover:underline">Crea una cuenta</NuxtLink> para obtener más créditos o espera 24 horas para que se renueven.
              </p>
              <p v-else-if="!hasUnlimitedCredits && credits <= 0 && supabaseUser">
                <NuxtLink to="/pricing" class="text-primary hover:underline font-medium">Suscríbete al Plan Pro</NuxtLink> para búsquedas ilimitadas.
              </p>
            </template>
          </UAlert>

          <!-- Info Message cuando quedan pocos créditos -->
          <UAlert
            v-if="!hasUnlimitedCredits && credits > 0 && credits <= 2 && !error"
            color="warning"
            variant="subtle"
            icon="i-lucide-alert-triangle"
            class="mt-8"
          >
            <template #title>
              <span>Te quedan {{ credits }} crédito{{ credits !== 1 ? 's' : '' }}.</span>
            </template>
            <template #description>
              <span v-if="!supabaseUser">
                <NuxtLink to="/register" class="text-primary hover:underline font-medium">Crea una cuenta</NuxtLink> para obtener más créditos.
              </span>
              <span v-else>
                <NuxtLink to="/pricing" class="text-primary hover:underline font-medium">Suscríbete</NuxtLink> para búsquedas ilimitadas.
              </span>
            </template>
          </UAlert>

          <!-- Recent Searches -->
          <ClientOnly>
            <div v-if="recentSearches.length" class="mt-8">
              <p class="text-sm text-muted mb-3 font-medium flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="size-4" />
                Tus últimas búsquedas
              </p>
              <div class="flex flex-col gap-4 md:flex-row">
                <UCard
                  v-for="search in recentSearches"
                  :key="search.id || search.createdAt || `${search.departureCity}-${search.arrivalCity}-${search.departureDate}`"
                  variant="soft"
                  class="flex-1 cursor-pointer hover:ring-primary/40 transition-all"
                  @click="fillFormFromSearch(search)"
                >
                  <div class="flex items-center justify-between text-sm font-semibold mb-1">
                    <span>{{ search.departureCity }} → {{ search.arrivalCity }}</span>
                    <span>{{ formatSearchDate(search.departureDate) }}</span>
                  </div>
                  <p class="text-xs text-muted">
                    {{ search.tripType === 'roundtrip' ? 'Ida y vuelta' : 'Solo ida' }} ·
                    {{ search.includeAccommodation ? 'Con alojamientos' : 'Solo vuelos' }}
                  </p>
                  <p v-if="search.tripType === 'roundtrip' && search.returnDate" class="text-xs text-muted mt-1">
                    Regreso {{ formatSearchDate(search.returnDate) }}
                  </p>
                </UCard>
              </div>
            </div>
          </ClientOnly>

          <!-- Travel Tips -->
          <USeparator class="my-8" />
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-sparkles" class="text-primary size-5 mt-0.5" />
            <div>
              <p class="text-sm text-muted font-medium mb-1">Consejos de viaje con IA</p>
              <p class="text-sm text-muted leading-relaxed">
                Nuestra IA analiza tendencias de precios, clima y afluencia para encontrar el mejor momento y las mejores ofertas para tu destino.
              </p>
            </div>
          </div>
        </UCard>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <UPageCard
            icon="i-lucide-bot"
            title="Impulsado por IA"
            description="Recomendaciones inteligentes basadas en tus preferencias e historial."
            variant="outline"
          />
          <UPageCard
            icon="i-lucide-piggy-bank"
            title="Mejores precios"
            description="Comparación en tiempo real entre miles de proveedores."
            variant="outline"
          />
          <UPageCard
            icon="i-lucide-zap"
            title="Resultados instantáneos"
            description="Obtén opciones seleccionadas en segundos, no horas."
            variant="outline"
          />
        </div>
      </UContainer>
    </UMain>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'search',
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  }
})

const { brand } = useAppConfig()

useSeoMeta({
  title: `${brand.name} | Buscador de viajes inteligente`,
  description: brand.description,
  ogTitle: `${brand.name} | Buscador de viajes`,
  ogDescription: brand.description,
  twitterCard: 'summary_large_image'
})

const spanishCities = [
  { value: 'Madrid', label: 'Madrid (MAD)' },
  { value: 'Barcelona', label: 'Barcelona (BCN)' },
  { value: 'Valencia', label: 'Valencia (VLC)' },
  { value: 'Sevilla', label: 'Sevilla (SVQ)' },
  { value: 'Málaga', label: 'Málaga (AGP)' },
  { value: 'Bilbao', label: 'Bilbao (BIO)' },
  { value: 'Palma de Mallorca', label: 'Palma de Mallorca (PMI)' },
  { value: 'Alicante', label: 'Alicante (ALC)' },
  { value: 'Las Palmas de Gran Canaria', label: 'Las Palmas de Gran Canaria (LPA)' },
  { value: 'Tenerife Norte', label: 'Tenerife Norte (TFN)' },
  { value: 'Tenerife Sur', label: 'Tenerife Sur (TFS)' },
  { value: 'Ibiza', label: 'Ibiza (IBZ)' },
  { value: 'Menorca', label: 'Menorca (MAH)' },
  { value: 'Santander', label: 'Santander (SDR)' },
  { value: 'Asturias', label: 'Asturias (OVD)' },
  { value: 'A Coruña', label: 'A Coruña (LCG)' },
  { value: 'Vigo', label: 'Vigo (VGO)' },
  { value: 'Santiago de Compostela', label: 'Santiago de Compostela (SCQ)' },
  { value: 'Zaragoza', label: 'Zaragoza (ZAZ)' },
  { value: 'Murcia', label: 'Murcia (RMU)' },
  { value: 'Jerez', label: 'Jerez (XRY)' },
  { value: 'Almería', label: 'Almería (LEI)' },
  { value: 'Reus', label: 'Reus (REU)' },
  { value: 'Girona', label: 'Girona (GRO)' },
  { value: 'Lanzarote', label: 'Lanzarote (ACE)' },
  { value: 'Fuerteventura', label: 'Fuerteventura (FUE)' }
]

const tripTypeOptions = [
  { value: 'roundtrip', label: 'Ida y vuelta' },
  { value: 'oneway', label: 'Solo ida' }
]

const router = useRouter()
const supabase = useSupabaseClient()
const supabaseUser = useSupabaseUser()
const { credits, hasUnlimitedCredits, consumeCredit, refreshCredits } = useCredits()

type TripType = 'roundtrip' | 'oneway'

type RecentTravelSearch = {
  id?: string
  departureCity: string
  arrivalCity: string
  departureDate: string
  returnDate: string | null
  tripType: TripType
  includeAccommodation: boolean
  createdAt?: string
}

const MAX_RECENT_SEARCHES = 3
const RECENT_SEARCHES_STORAGE_KEY = 'travel_recent_searches'

const tripType = ref<TripType>('roundtrip')
const departureCity = ref('')
const arrivalCity = ref('')
const departureDate = ref('')
const returnDate = ref('')
const includeAccommodation = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref({
  departureCity: false,
  arrivalCity: false,
  departureDate: false,
  returnDate: false
})

const recentSearches = ref<RecentTravelSearch[]>([])

const formatSearchDate = (dateStr: string | null) => {
  if (!dateStr) {
    return ''
  }

  const parsedDate = new Date(dateStr)
  if (Number.isNaN(parsedDate.getTime())) {
    return dateStr
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short'
  }).format(parsedDate)
}

const normalizeRecentSearch = (search: RecentTravelSearch) => {
  return {
    ...search,
    returnDate: search.tripType === 'roundtrip' ? search.returnDate : null
  }
}

const getLocalSearches = (): RecentTravelSearch[] => {
  if (!import.meta.client) {
    return []
  }

  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as RecentTravelSearch[]
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('[travel_searches] No se pudieron leer las búsquedas locales', err)
    return []
  }
}

const setLocalSearches = (searches: RecentTravelSearch[]) => {
  if (!import.meta.client) {
    return
  }
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(searches))
  } catch (err) {
    console.error('[travel_searches] No se pudieron guardar las búsquedas locales', err)
  }
}

const updateRecentSearchesState = (entries: RecentTravelSearch[]) => {
  recentSearches.value = entries.slice(0, MAX_RECENT_SEARCHES)
}

const persistRecentSearchLocally = (search: RecentTravelSearch) => {
  if (!import.meta.client) {
    return
  }

  const normalized = normalizeRecentSearch({
    ...search,
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    createdAt: new Date().toISOString()
  })

  const existing = getLocalSearches()
  const updated = [normalized, ...existing].slice(0, MAX_RECENT_SEARCHES)
  setLocalSearches(updated)
  updateRecentSearchesState(updated)
}

const mapDbRowToRecentSearch = (row: Record<string, any>): RecentTravelSearch => ({
  id: row.id,
  departureCity: row.departure_city,
  arrivalCity: row.arrival_city,
  departureDate: row.departure_date,
  returnDate: row.return_date ?? null,
  tripType: row.trip_type,
  includeAccommodation: row.include_accommodation ?? false,
  createdAt: row.created_at
})

const fetchRecentSearchesFromSupabase = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('travel_searches')
      .select('id, departure_city, arrival_city, departure_date, return_date, trip_type, include_accommodation, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_RECENT_SEARCHES)

    if (error) {
      throw error
    }

    if (data) {
      updateRecentSearchesState(data.map(mapDbRowToRecentSearch))
    }
  } catch (err) {
    console.error('[travel_searches] No se pudieron cargar datos de Supabase', err)
  }
}

const loadRecentSearches = async () => {
  if (!import.meta.client) {
    return
  }

  const user = supabaseUser.value
  if (user) {
    await fetchRecentSearchesFromSupabase(user.id)
  } else {
    updateRecentSearchesState(getLocalSearches())
  }
}

onMounted(async () => {
  await loadRecentSearches()
  
  watch(
    () => supabaseUser.value,
    async () => {
      await loadRecentSearches()
    }
  )
})

const persistTravelSearch = async (search: RecentTravelSearch) => {
  const user = supabaseUser.value
  if (user) {
    try {
      const { data, error } = await supabase
        .from('travel_searches')
        .insert({
          user_id: user.id,
          departure_city: search.departureCity,
          arrival_city: search.arrivalCity,
          departure_date: search.departureDate,
          return_date: search.tripType === 'roundtrip' ? search.returnDate : null,
          trip_type: search.tripType,
          include_accommodation: search.includeAccommodation
        })
        .select('id, departure_city, arrival_city, departure_date, return_date, trip_type, include_accommodation, created_at')
        .single()

      if (error) {
        throw error
      }

      if (data) {
        updateRecentSearchesState([
          mapDbRowToRecentSearch(data),
          ...recentSearches.value.filter((entry) => entry.id !== data.id)
        ])
      } else {
        await fetchRecentSearchesFromSupabase(user.id)
      }
    } catch (err) {
      console.error('[travel_searches] No se pudo guardar la búsqueda en Supabase', err)
    }
  } else {
    persistRecentSearchLocally(search)
  }
}

const buildRecentSearchPayload = (): RecentTravelSearch => ({
  departureCity: departureCity.value,
  arrivalCity: arrivalCity.value,
  departureDate: departureDate.value,
  returnDate: tripType.value === 'roundtrip' ? returnDate.value || null : null,
  tripType: tripType.value,
  includeAccommodation: includeAccommodation.value
})

const resetForm = () => {
  tripType.value = 'roundtrip'
  departureCity.value = ''
  arrivalCity.value = ''
  departureDate.value = ''
  returnDate.value = ''
  includeAccommodation.value = false
  error.value = null
  fieldErrors.value = {
    departureCity: false,
    arrivalCity: false,
    departureDate: false,
    returnDate: false
  }
}

const fillFormFromSearch = (search: RecentTravelSearch) => {
  tripType.value = search.tripType
  departureCity.value = search.departureCity
  arrivalCity.value = search.arrivalCity
  departureDate.value = search.departureDate
  returnDate.value = search.returnDate || ''
  includeAccommodation.value = search.includeAccommodation
  error.value = null
  fieldErrors.value = {
    departureCity: false,
    arrivalCity: false,
    departureDate: false,
    returnDate: false
  }
}

const searchTrips = async () => {
  // Resetear errores de campos
  fieldErrors.value = {
    departureCity: false,
    arrivalCity: false,
    departureDate: false,
    returnDate: false
  }

  // Validar campos requeridos
  let hasErrors = false

  if (!departureCity.value) {
    fieldErrors.value.departureCity = true
    hasErrors = true
  }

  if (!arrivalCity.value) {
    fieldErrors.value.arrivalCity = true
    hasErrors = true
  }

  if (!departureDate.value) {
    fieldErrors.value.departureDate = true
    hasErrors = true
  }

  if (tripType.value === 'roundtrip' && !returnDate.value) {
    fieldErrors.value.returnDate = true
    hasErrors = true
  }

  if (hasErrors) {
    error.value = 'Por favor, completa todos los campos requeridos'
    return
  }

  // Verificar créditos antes de buscar (los usuarios suscritos tienen créditos ilimitados)
  if (!hasUnlimitedCredits.value && credits.value <= 0) {
    error.value = 'No tienes créditos suficientes para realizar esta búsqueda. Por favor, inicia sesión para obtener más créditos.'
    return
  }

  loading.value = true
  error.value = null

  const query: Record<string, string> = {
    departureCity: departureCity.value,
    arrivalCity: arrivalCity.value,
    departureDate: departureDate.value,
    tripType: tripType.value,
    includeAccommodation: includeAccommodation.value ? 'true' : 'false'
  }

  if (tripType.value === 'roundtrip' && returnDate.value) {
    query.returnDate = returnDate.value
  }

  const recentSearch = buildRecentSearchPayload()

  try {
    await router.push({
      path: '/results',
      query
    })
    await persistTravelSearch(recentSearch)
  } catch (e: any) {
    error.value = e?.message || 'No se pudo redirigir a la página de resultados'
  } finally {
    loading.value = false
  }
}

watch([departureDate, tripType], () => {
  if (tripType.value === 'roundtrip' && returnDate.value && departureDate.value && returnDate.value < departureDate.value) {
    returnDate.value = departureDate.value
  }

  if (tripType.value === 'oneway') {
    returnDate.value = ''
  }
})
</script>
