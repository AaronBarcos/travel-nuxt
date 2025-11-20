<template>
    <div class="min-h-screen bg-background text-foreground">
        <nav class="border-b border-border">
            <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span class="text-primary-foreground font-bold">✈</span>
                    </div>
                    <h1 class="text-xl font-semibold">{{ brand.name }}</h1>
                </div>
                <div class="flex items-center gap-4">
                    <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground transition">Nueva búsqueda</NuxtLink>
                    <AuthNav />
                </div>
            </div>
        </nav>

        <main class="min-h-[calc(100vh-80px)] bg-background">
            <div class="max-w-6xl mx-auto px-6 py-16 space-y-10">
                <div class="text-center space-y-4">
                    <p class="text-sm uppercase tracking-wide text-primary font-semibold">Resultados de tu búsqueda</p>
                    <h2 class="text-4xl font-bold text-foreground">Estamos preparando tu viaje ideal</h2>
                    <p v-if="routeSummary" class="text-muted-foreground">{{ routeSummary }}</p>
                </div>

                <div v-if="loading" class="bg-card border border-border rounded-xl p-4 text-center text-muted-foreground">
                    <span class="inline-flex items-center gap-2 justify-center">
                        <span class="text-xl animate-pulse">⏳</span>
                        <span>Estamos buscando la mejor combinación para ti...</span>
                    </span>
                </div>

                <div v-if="error" class="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center space-y-3">
                    <p class="text-destructive font-semibold">No se pudo completar la búsqueda</p>
                    <p class="text-sm text-muted-foreground">{{ error }}</p>
                    <NuxtLink to="/" class="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                        Volver al inicio
                    </NuxtLink>
                </div>

                <TravelResult
                    v-if="(loading || results) && !error"
                    :state="loading ? 'loading' : 'success'"
                    :results="results"
                />

                <div class="text-center">
                    <NuxtLink to="/" class="text-primary hover:underline inline-flex items-center gap-2">
                        ← Hacer una nueva búsqueda
                    </NuxtLink>
                </div>
            </div>
        </main>
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

        const response = await $fetch('/api/test', {
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

