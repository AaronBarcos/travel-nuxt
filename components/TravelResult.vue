<template>
    <div class="mt-12 space-y-8">
        <!-- Loading Skeleton -->
        <div v-if="state === 'loading'" class="space-y-8">
            <!-- Flights Skeleton -->
            <div>
                <div class="h-8 w-64 bg-secondary animate-pulse rounded mb-6"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="i in 3" :key="i" class="bg-card border border-border rounded-xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div class="h-8 w-32 bg-secondary animate-pulse rounded"></div>
                            <div class="h-8 w-24 bg-secondary animate-pulse rounded"></div>
                        </div>
                        <div class="space-y-2">
                            <div class="h-4 w-full bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-3/4 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-2/3 bg-secondary animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Accommodations Skeleton -->
            <div>
                <div class="h-8 w-64 bg-secondary animate-pulse rounded mb-6"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="i in 3" :key="i" class="bg-card border border-border rounded-xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div class="h-6 w-40 bg-secondary animate-pulse rounded"></div>
                            <div class="h-6 w-24 bg-secondary animate-pulse rounded"></div>
                        </div>
                        <div class="space-y-2 mb-4">
                            <div class="h-4 w-20 bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-full bg-secondary animate-pulse rounded"></div>
                            <div class="h-4 w-32 bg-secondary animate-pulse rounded"></div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <div class="h-6 w-16 bg-secondary animate-pulse rounded"></div>
                            <div class="h-6 w-20 bg-secondary animate-pulse rounded"></div>
                            <div class="h-6 w-14 bg-secondary animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Results -->
        <div v-if="state === 'success'" class="space-y-8">
            <!-- Summary Section -->
            <div v-if="resultText" class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-2xl">📋</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold mb-3 text-foreground">Resumen de Recomendaciones</h3>
                        <p class="text-muted-foreground leading-relaxed whitespace-pre-line">{{ resultText }}</p>
                    </div>
                </div>
            </div>

            <!-- Flights Results -->
            <div v-if="departureFlight || returnFlight" class="space-y-8">
                <!-- Outbound Flight -->
                <div v-if="departureFlight">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <span class="text-xl">✈️</span>
                        </div>
                        <h3 class="text-2xl font-bold">Vuelo de ida</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition shadow-sm">
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
                        </div>
                    </div>
                </div>

                <!-- Return Flight -->
                <div v-if="returnFlight">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <span class="text-xl">🔄</span>
                        </div>
                        <h3 class="text-2xl font-bold">Vuelo de vuelta</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition shadow-sm">
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
                        </div>
                    </div>
                </div>
            </div>

            <!-- Accommodations Results -->
            <div v-if="accommodationsList && accommodationsList.length > 0">
                <h3 class="text-2xl font-bold mb-6">🏨 Alojamientos Encontrados</h3>
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
        </div>

        <!-- Error State -->
        <div v-if="state === 'error'">
            <p class="text-destructive">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">

interface TravelResultProps {
    state: 'loading' | 'success' | 'error';
    results?: any;
    error?: string;
}

const {
    state,
    results,
    error
} = defineProps<TravelResultProps>();

// Extraer datos de la estructura de respuesta
const resultText = computed(() => {
    return results?.summary || ''
})

const departureFlight = computed(() => {
    return results?.flightsCombination?.departureFlight || null
})

const returnFlight = computed(() => {
    return results?.flightsCombination?.returnFlight || null
})

const accommodationsList = computed(() => {
    if (!results?.accommodations) return []
    // Manejar tanto array como objeto único
    return Array.isArray(results.accommodations) 
        ? results.accommodations 
        : [results.accommodations]
})

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

</script>
