<template>
    <div class="min-h-screen bg-background text-foreground">
        <!-- Navigation -->
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

        <!-- Hero Section with Search -->
        <main class="min-h-[calc(100vh-80px)] bg-background">
            <div class="max-w-6xl mx-auto px-6 py-16">
                <!-- Header -->
                <div class="mb-12 text-center">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4 text-balance">
                        Encuentra tu próxima aventura con la <span class="text-primary">IA</span>
                    </h2>
                    <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Descubre recomendaciones personalizadas impulsadas por IA avanzada. Compara vuelos, hoteles y experiencias en segundos.
                    </p>
                </div>

                <!-- Search Form -->
                <div class="bg-card border border-border rounded-2xl p-8 shadow-lg">
                    <!-- Trip Type Selector -->
                    <div class="mb-8 flex gap-4">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input v-model="tripType" type="radio" value="roundtrip" class="w-4 h-4 accent-primary" />
                            <span class="font-medium">Ida y vuelta</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input v-model="tripType" type="radio" value="oneway" class="w-4 h-4 accent-primary" />
                            <span class="font-medium">Solo ida</span>
                        </label>
                    </div>

                    <!-- Search Inputs Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <!-- Departure City -->
                        <div class="relative">
                            <label class="block text-sm font-semibold mb-2">Desde</label>
                            <div class="relative">
                                <select v-model="departureCity" @change="fieldErrors.departureCity = false"
                                    :class="['w-full px-4 py-3 pr-10 bg-secondary border rounded-lg focus:outline-none focus:ring-2 transition appearance-none cursor-pointer', fieldErrors.departureCity ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20']">
                                    <option value="" disabled>Selecciona ciudad</option>
                                    <option v-for="city in spanishCities" :key="city.value" :value="city.value">{{
                                        city.label }}</option>
                                </select>
                                <span class="absolute right-10 top-3 text-muted-foreground pointer-events-none">✈</span>
                                <span
                                    class="absolute right-3 top-3 text-muted-foreground pointer-events-none select-arrow">▼</span>
                            </div>
                        </div>

                        <!-- Arrival City -->
                        <div class="relative">
                            <label class="block text-sm font-semibold mb-2">Hasta</label>
                            <div class="relative">
                                <select v-model="arrivalCity" @change="fieldErrors.arrivalCity = false"
                                    :class="['w-full px-4 py-3 pr-10 bg-secondary border rounded-lg focus:outline-none focus:ring-2 transition appearance-none cursor-pointer', fieldErrors.arrivalCity ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20']">
                                    <option value="" disabled>Selecciona ciudad</option>
                                    <option v-for="city in spanishCities" :key="city.value" :value="city.value">{{
                                        city.label }}</option>
                                </select>
                                <span
                                    class="absolute right-10 top-3 text-muted-foreground pointer-events-none">📍</span>
                                <span
                                    class="absolute right-3 top-3 text-muted-foreground pointer-events-none select-arrow">▼</span>
                            </div>
                        </div>

                        <!-- Departure Date -->
                        <div class="relative">
                            <label class="block text-sm font-semibold mb-2">Salida</label>
                            <div class="relative">
                                <input v-model="departureDate" @input="fieldErrors.departureDate = false" type="date"
                                    :min="new Date().toISOString().split('T')[0]"
                                    :class="['w-full px-4 py-3 bg-secondary border rounded-lg focus:outline-none focus:ring-2 transition text-foreground', fieldErrors.departureDate ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20']" />
                            </div>
                        </div>

                        <!-- Return Date -->
                        <div class="relative" :class="{ 'opacity-50 pointer-events-none': tripType === 'oneway' }">
                            <label class="block text-sm font-semibold mb-2">Regreso</label>
                            <div class="relative">
                                <input v-model="returnDate" @input="fieldErrors.returnDate = false" type="date"
                                    :min="tripType === 'roundtrip' ? departureDate : undefined"
                                    :disabled="tripType === 'oneway'"
                                    :class="['w-full px-4 py-3 bg-secondary border rounded-lg focus:outline-none focus:ring-2 transition text-foreground disabled:opacity-50', fieldErrors.returnDate ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20']" />
                            </div>
                        </div>
                    </div>

                    <!-- Accommodation Checkbox and Search Button -->
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input v-model="includeAccommodation" type="checkbox"
                                class="w-5 h-5 rounded accent-primary cursor-pointer" />
                            <span class="font-medium">Incluir búsqueda de alojamientos</span>
                            <span class="text-xs text-muted-foreground group-hover:text-foreground transition">La IA recomendará hoteles cercanos</span>
                        </label>
                        <div class="flex gap-3">
                            <button @click="resetForm"
                                class="px-6 py-3 bg-secondary text-foreground border border-border rounded-lg font-semibold hover:bg-secondary/80 hover:shadow-lg transition-all duration-200 whitespace-nowrap">
                                Reiniciar
                            </button>
                            <button @click="searchTrips" :disabled="loading"
                                class="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ loading ? 'Buscando...' : 'Buscar con IA' }}
                            </button>
                        </div>
                    </div>

                    <!-- Error Message -->
                    <div v-if="error" class="mt-8 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p class="text-destructive text-sm">{{ error }}</p>
                    </div>

                    <!-- Recent Searches -->
                    <ClientOnly>
                        <div v-if="recentSearches.length" class="mt-8">
                            <p class="text-sm text-muted-foreground mb-3 font-medium">🕘 Tus últimas búsquedas</p>
                            <div class="flex flex-col gap-4 md:flex-row">
                                <div v-for="search in recentSearches" :key="search.id || search.createdAt || `${search.departureCity}-${search.arrivalCity}-${search.departureDate}`"
                                    @click="fillFormFromSearch(search)"
                                    class="flex-1 bg-secondary/60 border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 hover:bg-secondary/80 cursor-pointer transition">
                                    <div class="flex items-center justify-between text-sm font-semibold mb-1">
                                        <span>{{ search.departureCity }} → {{ search.arrivalCity }}</span>
                                        <span>{{ formatSearchDate(search.departureDate) }}</span>
                                    </div>
                                    <p class="text-xs text-muted-foreground">
                                        {{ search.tripType === 'roundtrip' ? 'Ida y vuelta' : 'Solo ida' }} ·
                                        {{ search.includeAccommodation ? 'Con alojamientos' : 'Solo vuelos' }}
                                    </p>
                                    <p v-if="search.tripType === 'roundtrip' && search.returnDate"
                                        class="text-xs text-muted-foreground mt-1">
                                        Regreso {{ formatSearchDate(search.returnDate) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ClientOnly>

                    <!-- Travel Tips -->
                    <div class="mt-8 pt-8 border-t border-border">
                        <p class="text-sm text-muted-foreground mb-3 font-medium">✨ Consejos de viaje con IA</p>
                        <p class="text-sm text-muted-foreground leading-relaxed">
                            Nuestra IA analiza tendencias de precios, clima y afluencia para encontrar el mejor momento y las mejores ofertas para tu destino.
                        </p>
                    </div>

                </div>

                <!-- Features Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                        <div
                            class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary">
                            🤖</div>
                        <h3 class="font-semibold mb-2">Impulsado por IA</h3>
                        <p class="text-sm text-muted-foreground">Recomendaciones inteligentes basadas en tus preferencias e historial.</p>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                        <div
                            class="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-accent">
                            💰</div>
                        <h3 class="font-semibold mb-2">Mejores precios</h3>
                        <p class="text-sm text-muted-foreground">Comparación en tiempo real entre miles de proveedores.</p>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                        <div
                            class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary">
                            ⚡</div>
                        <h3 class="font-semibold mb-2">Resultados instantáneos</h3>
                        <p class="text-sm text-muted-foreground">Obtén opciones seleccionadas en segundos, no horas.</p>
                    </div>
                </div>

            </div>
        </main>
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

const router = useRouter()
const supabase = useSupabaseClient()
const supabaseUser = useSupabaseUser()

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

<style scoped>
/* Custom scrollbar for date inputs */
::-webkit-calendar-picker-indicator {
    filter: invert(0.7);
    cursor: pointer;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0.6;
}

input[type="date"]:hover::-webkit-calendar-picker-indicator {
    opacity: 1;
}

/* Select arrow styling */
.select-arrow {
    font-size: 0.75rem;
    opacity: 0.6;
}
</style>