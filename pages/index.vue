<template>
    <div class="min-h-screen bg-background text-foreground">
        <!-- Navigation -->
        <nav class="border-b border-border">
            <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span class="text-primary-foreground font-bold">✈</span>
                    </div>
                    <h1 class="text-xl font-semibold">SkyAI</h1>
                </div>
                <div class="flex items-center gap-6">
                    <button class="text-sm text-muted-foreground hover:text-foreground transition">Sign In</button>
                    <button
                        class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">Sign
                        Up</button>
                </div>
            </div>
        </nav>

        <!-- Hero Section with Search -->
        <main class="min-h-[calc(100vh-80px)] bg-background">
            <div class="max-w-6xl mx-auto px-6 py-16">
                <!-- Header -->
                <div class="mb-12 text-center">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4 text-balance">
                        Find your next adventure with <span class="text-primary">AI</span>
                    </h2>
                    <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover personalized travel recommendations powered by advanced AI. Compare flights, hotels,
                        and experiences in seconds.
                    </p>
                </div>

                <!-- Search Form -->
                <div class="bg-card border border-border rounded-2xl p-8 shadow-lg">
                    <!-- Trip Type Selector -->
                    <div class="mb-8 flex gap-4">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input v-model="tripType" type="radio" value="roundtrip" class="w-4 h-4 accent-primary" />
                            <span class="font-medium">Round Trip</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input v-model="tripType" type="radio" value="oneway" class="w-4 h-4 accent-primary" />
                            <span class="font-medium">One Way</span>
                        </label>
                    </div>

                    <!-- Search Inputs Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <!-- Departure City -->
                        <div class="relative">
                            <label class="block text-sm font-semibold mb-2">From</label>
                            <div class="relative">
                                <input v-model="departureCity" type="text" placeholder="Departure city"
                                    class="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder:text-muted-foreground" />
                                <span class="absolute right-3 top-3 text-muted-foreground">✈</span>
                            </div>
                        </div>

                        <!-- Arrival City -->
                        <div class="relative">
                            <label class="block text-sm font-semibold mb-2">To</label>
                            <div class="relative">
                                <input v-model="arrivalCity" type="text" placeholder="Destination city"
                                    class="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition placeholder:text-muted-foreground" />
                                <span class="absolute right-3 top-3 text-muted-foreground">📍</span>
                            </div>
                        </div>

                        <!-- Departure Date -->
                        <div class="relative">
                            <label class="block text-sm font-semibold mb-2">Depart</label>
                            <div class="relative">
                                <input v-model="departureDate" type="date"
                                    class="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-foreground" />
                            </div>
                        </div>

                        <!-- Return Date -->
                        <div class="relative" :class="{ 'opacity-50 pointer-events-none': tripType === 'oneway' }">
                            <label class="block text-sm font-semibold mb-2">Return</label>
                            <div class="relative">
                                <input v-model="returnDate" type="date" :disabled="tripType === 'oneway'"
                                    class="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-foreground disabled:opacity-50" />
                            </div>
                        </div>
                    </div>

                    <!-- Accommodation Checkbox and Search Button -->
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input v-model="includeAccommodation" type="checkbox"
                                class="w-5 h-5 rounded accent-primary cursor-pointer" />
                            <span class="font-medium">Include accommodation search</span>
                            <span class="text-xs text-muted-foreground group-hover:text-foreground transition">AI will
                                recommend nearby hotels</span>
                        </label>
                        <div class="flex gap-3">
                            <button @click="resetForm"
                                class="px-6 py-3 bg-secondary text-foreground border border-border rounded-lg font-semibold hover:bg-secondary/80 hover:shadow-lg transition-all duration-200 whitespace-nowrap">
                                Reset
                            </button>
                            <button @click="searchTrips" :disabled="loading"
                                class="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ loading ? 'Buscando...' : 'Search with AI' }}
                            </button>
                        </div>
                    </div>

                    <!-- Travel Tips -->
                    <div class="mt-8 pt-8 border-t border-border">
                        <p class="text-sm text-muted-foreground mb-3 font-medium">✨ AI Travel Tips</p>
                        <p class="text-sm text-muted-foreground leading-relaxed">
                            Our AI analyzes price trends, weather patterns, and crowd data to find you the best time and
                            deals for your destination.
                        </p>
                    </div>
                </div>

                <!-- Features Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                        <div
                            class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary">
                            🤖</div>
                        <h3 class="font-semibold mb-2">AI-Powered</h3>
                        <p class="text-sm text-muted-foreground">Smart recommendations based on your preferences and
                            history</p>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                        <div
                            class="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-accent">
                            💰</div>
                        <h3 class="font-semibold mb-2">Best Prices</h3>
                        <p class="text-sm text-muted-foreground">Real-time price comparison across thousands of
                            providers</p>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                        <div
                            class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary">
                            ⚡</div>
                        <h3 class="font-semibold mb-2">Instant Results</h3>
                        <p class="text-sm text-muted-foreground">Get curated options in seconds, not hours</p>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="mt-8 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p class="text-destructive text-sm">{{ error }}</p>
                </div>

                <!-- Results Section -->
                <div v-if="results && !loading" class="mt-12 space-y-8">
                    <!-- Flights Results -->
                    <div v-if="results.flights && results.flights.length > 0">
                        <h3 class="text-2xl font-bold mb-6">✈️ Vuelos Encontrados</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="(flight, index) in results.flights" :key="index"
                                class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-2xl font-bold">{{ flight.airline }}</span>
                                    <span class="text-xl font-bold text-primary">{{ formatPrice(flight.price, flight.currency) }}</span>
                                </div>
                                <div class="space-y-2 text-sm text-muted-foreground">
                                    <p><strong class="text-foreground">Salida:</strong> {{ formatDate(flight.departure) }}</p>
                                    <p><strong class="text-foreground">Llegada:</strong> {{ formatDate(flight.arrival) }}</p>
                                    <p v-if="flight.duration"><strong class="text-foreground">Duración:</strong> {{ formatDuration(flight.duration) }}</p>
                                    <p v-if="flight.stops !== undefined">
                                        <strong class="text-foreground">Escalas:</strong> {{ flight.stops === 0 ? 'Directo' : `${flight.stops} escala(s)` }}
                                    </p>
                                    <p v-if="flight.flightNumber"><strong class="text-foreground">Vuelo:</strong> {{ flight.flightNumber }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Accommodations Results -->
                    <div v-if="results.accommodations && results.accommodations.length > 0">
                        <h3 class="text-2xl font-bold mb-6">🏨 Alojamientos Encontrados</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="(accommodation, index) in results.accommodations" :key="index"
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

                    <!-- No Results -->
                    <!-- <div v-if="(!results.flights || results.flights.length === 0) && (!results.accommodations || results.accommodations.length === 0)"
                        class="text-center py-12 bg-card border border-border rounded-xl">
                        <p class="text-muted-foreground">No se encontraron resultados. Intenta con otros parámetros.</p>
                    </div> -->
                    <div v-if="resultText" class="mt-12 bg-card border border-border rounded-lg p-4">
                        <p class="text-muted-foreground">{{ resultText }}</p>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
const tripType = ref('roundtrip')
const departureCity = ref('')
const arrivalCity = ref('')
const departureDate = ref('')
const returnDate = ref('')
const includeAccommodation = ref(false)
const loading = ref(false)
const results = ref<{
    flights: any[];
    accommodations: any[];
} | null>(null)
const resultText = ref<string | null>(null)
const error = ref<string | null>(null)

const resetForm = () => {
    tripType.value = 'roundtrip'
    departureCity.value = ''
    arrivalCity.value = ''
    departureDate.value = ''
    returnDate.value = ''
    includeAccommodation.value = false
    results.value = null
    resultText.value = null
    error.value = null
}

const searchTrips = async () => {
    if (!departureCity.value || !arrivalCity.value || !departureDate.value) {
        error.value = 'Por favor, completa todos los campos requeridos'
        return
    }

    if (tripType.value === 'roundtrip' && !returnDate.value) {
        error.value = 'Por favor, selecciona una fecha de regreso'
        return
    }

    loading.value = true
    error.value = null
    results.value = null

    try {
        const { data: responseData, error: fetchError } = await useFetch('/api/test', {
            method: 'POST',
            body: {
                departureCity: departureCity.value,
                arrivalCity: arrivalCity.value,
                departureDate: departureDate.value,
                returnDate: returnDate.value,
                tripType: tripType.value,
                includeAccommodation: includeAccommodation.value
            }
        })

        if (fetchError.value) {
            error.value = fetchError.value.message || 'Error al buscar viajes'
        } else if (responseData.value) {
            try {
                // Extraer el output_text que contiene el JSON estructurado
                const outputText = responseData.value.output_text
                
                if (outputText) {
                    // Parsear el JSON string
                    const parsedData = JSON.parse(outputText)
                    
                    // Asignar los vuelos recomendados
                    if (parsedData.recommendedFlights && Array.isArray(parsedData.recommendedFlights)) {
                        results.value = {
                            flights: parsedData.recommendedFlights,
                            accommodations: []
                        }
                    }
                    
                    // Asignar el resumen
                    if (parsedData.summary) {
                        resultText.value = parsedData.summary
                    }
                } else {
                    error.value = 'No se recibieron datos de la respuesta'
                }
            } catch (e: any) {
                console.error('Error procesando respuesta:', e)
                error.value = 'Error al procesar los datos de vuelos'
            }
        }
    } catch (e: any) {
        error.value = e.message || 'Error al buscar viajes'
    } finally {
        loading.value = false
    }
}

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
</style>