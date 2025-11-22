<template>
    <div class="mt-12 space-y-8">
        <!-- Loading Skeleton -->
        <div v-if="state === 'loading'" class="space-y-10">
            <!-- Hero Skeleton -->
            <div class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 text-center">
                <div class="h-4 w-24 bg-secondary animate-pulse rounded mx-auto mb-3"></div>
                <div class="h-8 w-3/4 bg-secondary animate-pulse rounded mx-auto mb-4"></div>
                <div class="h-4 w-2/3 bg-secondary animate-pulse rounded mx-auto"></div>
            </div>

            <!-- Flights Skeleton -->
            <div class="space-y-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-secondary animate-pulse rounded-lg"></div>
                    <div class="space-y-2 flex-1">
                        <div class="h-4 w-32 bg-secondary animate-pulse rounded"></div>
                        <div class="h-6 w-60 bg-secondary animate-pulse rounded"></div>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div v-for="i in 2" :key="`flight-${i}`" class="bg-card border border-border rounded-xl p-6">
                        <div class="h-4 w-24 bg-secondary animate-pulse rounded mb-3"></div>
                        <div class="flex items-center justify-between mb-4">
                            <div class="h-6 w-32 bg-secondary animate-pulse rounded"></div>
                            <div class="h-6 w-24 bg-secondary animate-pulse rounded"></div>
                        </div>
                        <div class="space-y-2">
                            <div class="h-4 w-3/4 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-3/5 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-1/2 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-2/3 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-1/3 bg-secondary animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Accommodations Skeleton -->
            <div class="space-y-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-secondary animate-pulse rounded-lg"></div>
                    <div class="space-y-2 flex-1">
                        <div class="h-4 w-40 bg-secondary animate-pulse rounded"></div>
                        <div class="h-6 w-72 bg-secondary animate-pulse rounded"></div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="i in 3" :key="`accommodation-${i}`" class="bg-card border border-border rounded-xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div class="h-5 w-32 bg-secondary animate-pulse rounded"></div>
                            <div class="h-5 w-20 bg-secondary animate-pulse rounded"></div>
                        </div>
                        <div class="space-y-2 mb-4">
                            <div class="h-4 w-24 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-3/4 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-1/2 bg-secondary animate-pulse rounded"></div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <div v-for="chip in 3" :key="chip" class="h-6 w-16 bg-secondary animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Skeleton -->
            <div class="bg-card border border-border rounded-2xl p-8">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-secondary animate-pulse rounded-xl flex-shrink-0"></div>
                    <div class="flex-1 space-y-3">
                        <div class="h-4 w-32 bg-secondary animate-pulse rounded"></div>
                        <div class="h-6 w-64 bg-secondary animate-pulse rounded"></div>
                        <div class="space-y-2">
                            <div class="h-4 w-full bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-5/6 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-2/3 bg-secondary animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Results -->
        <div v-if="state === 'success'" class="space-y-10">
            <!-- Hero Title -->
            <div class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 text-center">
                <p class="text-sm uppercase tracking-wide text-primary font-semibold mb-2">Resultados</p>
                <h2 class="text-3xl font-bold text-foreground">¡Hemos encontrado la mejor combinación para tu viaje!</h2>
                <p class="text-muted-foreground mt-3">Analizamos los vuelos y alojamientos disponibles para proponerte la opción más conveniente.</p>
            </div>

            <!-- Flights Results -->
            <div v-if="departureFlight || returnFlight" class="space-y-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span class="text-xl">✈️</span>
                    </div>
                    <div>
                        <p class="text-sm uppercase tracking-wide text-primary font-semibold">Vuelos recomendados</p>
                        <h3 class="text-2xl font-bold">La combinación más eficiente para tu viaje</h3>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div v-if="departureFlight" class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition shadow-sm">
                        <p class="text-sm font-semibold text-primary mb-2">Vuelo de ida</p>
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-2xl font-bold">{{ departureFlight.airline }}</span>
                            <span class="text-xl font-bold text-primary">{{ formatPrice(departureFlight.price, departureFlight.currency) }}</span>
                        </div>
                        <div class="space-y-2 text-sm text-muted-foreground">
                            <p><strong class="text-foreground">Salida:</strong> {{ formatDate(departureFlight.departure) }}</p>
                            <p><strong class="text-foreground">Llegada:</strong> {{ formatDate(departureFlight.arrival) }}</p>
                            <p v-if="departureFlight.duration"><strong class="text-foreground">Duración:</strong> {{ formatDuration(departureFlight.duration) }}</p>
                            <p v-if="departureFlight.stops !== undefined">
                                <strong class="text-foreground">Escalas:</strong> {{ departureFlight.stops === 0 ? 'Directo' : `${departureFlight.stops} escala(s)` }}
                            </p>
                            <p v-if="departureFlight.flightNumber"><strong class="text-foreground">Vuelo:</strong> {{ departureFlight.flightNumber }}</p>
                        </div>
                        <div class="mt-4" v-if="departureFlightLink">
                            <a
                                :href="departureFlightLink"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                                Ver en Skyscanner
                                <span aria-hidden="true">↗</span>
                            </a>
                        </div>
                    </div>

                    <div v-if="returnFlight" class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition shadow-sm">
                        <p class="text-sm font-semibold text-primary mb-2">Vuelo de vuelta</p>
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-2xl font-bold">{{ returnFlight.airline }}</span>
                            <span class="text-xl font-bold text-primary">{{ formatPrice(returnFlight.price, returnFlight.currency) }}</span>
                        </div>
                        <div class="space-y-2 text-sm text-muted-foreground">
                            <p><strong class="text-foreground">Salida:</strong> {{ formatDate(returnFlight.departure) }}</p>
                            <p><strong class="text-foreground">Llegada:</strong> {{ formatDate(returnFlight.arrival) }}</p>
                            <p v-if="returnFlight.duration"><strong class="text-foreground">Duración:</strong> {{ formatDuration(returnFlight.duration) }}</p>
                            <p v-if="returnFlight.stops !== undefined">
                                <strong class="text-foreground">Escalas:</strong> {{ returnFlight.stops === 0 ? 'Directo' : `${returnFlight.stops} escala(s)` }}
                            </p>
                            <p v-if="returnFlight.flightNumber"><strong class="text-foreground">Vuelo:</strong> {{ returnFlight.flightNumber }}</p>
                        </div>
                        <div class="mt-4" v-if="returnFlightLink">
                            <a
                                :href="returnFlightLink"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                                Ver en Skyscanner
                                <span aria-hidden="true">↗</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Accommodations Results -->
            <div v-if="accommodationsList && accommodationsList.length > 0" class="space-y-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span class="text-xl">🏨</span>
                    </div>
                    <div>
                        <p class="text-sm uppercase tracking-wide text-primary font-semibold">Alojamientos recomendados</p>
                        <h3 class="text-2xl font-bold">Opciones para completar tu experiencia</h3>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="(accommodation, index) in accommodationsList" :key="index"
                        class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-lg font-semibold">{{ accommodation.name }}</h4>
                            <span class="text-xl font-bold text-primary">{{ formatPrice(accommodation.price, accommodation.currency) }}</span>
                        </div>
                        <div class="space-y-2 text-sm text-muted-foreground mb-4">
                            <p v-if="accommodation.rating">
                                <span class="text-yellow-500">★</span> {{ accommodation.rating }}/5
                            </p>
                            <p v-if="accommodation.address"><strong class="text-foreground">Dirección:</strong> {{ accommodation.address }}</p>
                            <p v-if="accommodation.type"><strong class="text-foreground">Tipo:</strong> {{ accommodation.type }}</p>
                        </div>
                        <div v-if="accommodation.amenities && accommodation.amenities.length > 0" class="flex flex-wrap gap-2">
                            <span v-for="(amenity, amenityIndex) in accommodation.amenities.slice(0, 5)" :key="amenityIndex"
                                class="px-2 py-1 bg-secondary rounded-md text-xs">
                                {{ amenity }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Section -->
            <div v-if="resultText" class="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-2xl">📋</span>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm uppercase tracking-wide text-primary font-semibold mb-2">Resumen del viaje</p>
                        <h3 class="text-xl font-bold mb-3 text-foreground">Justificación de la combinación</h3>
                        <p class="text-muted-foreground leading-relaxed whitespace-pre-line">{{ resultText }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Accommodation, Flight, TravelRecommendation } from '~/types/travel'

interface TravelResultProps {
    state: 'loading' | 'success';
    results?: TravelRecommendation | null;
}

const {
    state,
    results,
} = defineProps<TravelResultProps>();

// Extraer datos de la estructura de respuesta
const resultText = computed(() => {
    return results?.summary || ''
})

const departureFlight = computed<Flight | null>(() => {
    return results?.flightsCombination?.departureFlight || null
})

const returnFlight = computed<Flight | null>(() => {
    return results?.flightsCombination?.returnFlight || null
})

const accommodationsList = computed<Accommodation[]>(() => {
    if (!results?.accommodations) return []
    return Array.isArray(results.accommodations)
        ? results.accommodations
        : [results.accommodations]
})

const departureFlightLink = computed(() => getSkyscannerLink(departureFlight.value))
const returnFlightLink = computed(() => getSkyscannerLink(returnFlight.value))

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatDuration = (duration: string) => {
    if (!duration) return ''
    // PT2H15M -> 2h 15m
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (!match) return duration
    const hours = match[1] ? `${match[1]}h` : ''
    const minutes = match[2] ? `${match[2]}m` : ''
    return `${hours} ${minutes}`.trim()
}

const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
    }).format(price)
}

const formatSkyscannerDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''
    // Formato YYMMDD (ej: 251130 para 30 de noviembre de 2025)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}${month}${day}`
}

const getDepartureTimeRange = (dateString: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return null
    // Calcular minutos desde medianoche
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const totalMinutes = hours * 60 + minutes
    // Crear franja de ±30 minutos
    const start = Math.max(0, totalMinutes - 30)
    const end = Math.min(1439, totalMinutes + 30)
    return `${start}-${end}`
}

// Mapeo básico de códigos IATA de aerolíneas a IDs de Skyscanner
const airlineCodeMap: Record<string, string> = {
    'UX': '-32680', // Air Europa
    'IB': '-32680', // Iberia (usar mismo código por ahora)
    'VY': '-32680', // Vueling
    'FR': '-32680', // Ryanair
    'LH': '-32680', // Lufthansa
    'KL': '-32680', // KLM
    'BA': '-32680', // British Airways
    'AF': '-32680', // Air France
}

const getSkyscannerLink = (flight: Flight | null) => {
    if (!flight?.origin || !flight?.destination || !flight?.departure) return null
    const outboundDate = formatSkyscannerDate(flight.departure)
    if (!outboundDate) return null

    const departureTimeRange = getDepartureTimeRange(flight.departure)
    const airlineCode = airlineCodeMap[flight.airline] || '-32680' // Default a Air Europa si no está en el mapeo
    const isDirect = flight.stops === 0

    const params = new URLSearchParams({
        adultsv2: '1',
        cabinclass: 'economy',
        childrenv2: '',
        ref: 'home',
        rtn: '0',
        outboundaltsenabled: 'false',
        inboundaltsenabled: 'false',
        airlines: airlineCode,
        'departure-times': departureTimeRange || '450-510',
        preferdirects: isDirect ? 'true' : 'false'
    })

    return `https://www.skyscanner.es/transporte/vuelos/${flight.origin.toLowerCase()}/${flight.destination.toLowerCase()}/${outboundDate}/?${params.toString()}`
}

</script>
