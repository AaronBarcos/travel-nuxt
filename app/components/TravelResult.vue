<template>
  <div class="mt-12 space-y-8">
    <!-- Loading Skeleton -->
    <div v-if="state === 'loading'" class="space-y-10">
      <!-- Hero Skeleton -->
      <UCard variant="soft" class="text-center p-8">
        <USkeleton class="h-4 w-24 mx-auto mb-3" />
        <USkeleton class="h-8 w-3/4 mx-auto mb-4" />
        <USkeleton class="h-4 w-2/3 mx-auto" />
      </UCard>

      <!-- Flights Skeleton -->
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <USkeleton class="w-10 h-10 rounded-lg" />
          <div class="space-y-2 flex-1">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-6 w-60" />
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard v-for="i in 2" :key="`flight-${i}`" variant="outline">
            <USkeleton class="h-4 w-24 mb-3" />
            <div class="flex items-center justify-between mb-4">
              <USkeleton class="h-6 w-32" />
              <USkeleton class="h-6 w-24" />
            </div>
            <div class="space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-4 w-3/5" />
              <USkeleton class="h-4 w-1/2" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Summary Skeleton -->
      <UCard variant="outline">
        <div class="flex items-start gap-4">
          <USkeleton class="w-12 h-12 rounded-xl flex-shrink-0" />
          <div class="flex-1 space-y-3">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-6 w-64" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-5/6" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Success Results -->
    <div v-if="state === 'success'" class="space-y-10">
      <!-- Hero Title -->
      <UCard variant="soft" class="text-center p-8 bg-primary/5 border-primary/20">
        <UBadge color="primary" variant="subtle" class="mb-3">Resultados</UBadge>
        <h2 class="text-3xl font-bold text-highlighted">¡Hemos encontrado la mejor combinación para tu viaje!</h2>
        <p class="text-muted mt-3">Analizamos los vuelos y alojamientos disponibles para proponerte la opción más conveniente.</p>
      </UCard>

      <!-- Flights Results -->
      <div v-if="departureFlight || returnFlight" class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-plane" class="text-primary size-5" />
          </div>
          <div>
            <UBadge color="primary" variant="subtle" size="sm">Vuelos recomendados</UBadge>
            <h3 class="text-2xl font-bold text-highlighted">La combinación más eficiente para tu viaje</h3>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Departure Flight -->
          <UCard v-if="departureFlight" variant="outline" class="hover:border-primary/50 transition">
            <template #header>
              <UBadge color="primary" variant="soft">Vuelo de ida</UBadge>
            </template>
            
            <div class="flex items-center justify-between mb-4">
              <span class="text-2xl font-bold text-highlighted">{{ departureFlight.airline }}</span>
              <span class="text-xl font-bold text-primary">{{ formatPrice(departureFlight.price, departureFlight.currency) }}</span>
            </div>
            
            <div class="space-y-2 text-sm text-muted">
              <p><strong class="text-highlighted">Salida:</strong> {{ formatDate(departureFlight.departure) }}</p>
              <p><strong class="text-highlighted">Llegada:</strong> {{ formatDate(departureFlight.arrival) }}</p>
              <p v-if="departureFlight.duration"><strong class="text-highlighted">Duración:</strong> {{ formatDuration(departureFlight.duration) }}</p>
              <p v-if="departureFlight.stops !== undefined">
                <strong class="text-highlighted">Escalas:</strong> 
                <UBadge :color="departureFlight.stops === 0 ? 'success' : 'warning'" variant="subtle" size="xs">
                  {{ departureFlight.stops === 0 ? 'Directo' : `${departureFlight.stops} escala(s)` }}
                </UBadge>
              </p>
              <p v-if="departureFlight.flightNumber"><strong class="text-highlighted">Vuelo:</strong> {{ departureFlight.flightNumber }}</p>
            </div>
            
            <template #footer>
              <UButton
                v-if="departureFlightLink"
                :to="departureFlightLink"
                target="_blank"
                variant="ghost"
                color="primary"
                size="sm"
                trailing-icon="i-lucide-external-link"
              >
                Ver en Skyscanner
              </UButton>
            </template>
          </UCard>

          <!-- Return Flight -->
          <UCard v-if="returnFlight" variant="outline" class="hover:border-primary/50 transition">
            <template #header>
              <UBadge color="info" variant="soft">Vuelo de vuelta</UBadge>
            </template>
            
            <div class="flex items-center justify-between mb-4">
              <span class="text-2xl font-bold text-highlighted">{{ returnFlight.airline }}</span>
              <span class="text-xl font-bold text-primary">{{ formatPrice(returnFlight.price, returnFlight.currency) }}</span>
            </div>
            
            <div class="space-y-2 text-sm text-muted">
              <p><strong class="text-highlighted">Salida:</strong> {{ formatDate(returnFlight.departure) }}</p>
              <p><strong class="text-highlighted">Llegada:</strong> {{ formatDate(returnFlight.arrival) }}</p>
              <p v-if="returnFlight.duration"><strong class="text-highlighted">Duración:</strong> {{ formatDuration(returnFlight.duration) }}</p>
              <p v-if="returnFlight.stops !== undefined">
                <strong class="text-highlighted">Escalas:</strong> 
                <UBadge :color="returnFlight.stops === 0 ? 'success' : 'warning'" variant="subtle" size="xs">
                  {{ returnFlight.stops === 0 ? 'Directo' : `${returnFlight.stops} escala(s)` }}
                </UBadge>
              </p>
              <p v-if="returnFlight.flightNumber"><strong class="text-highlighted">Vuelo:</strong> {{ returnFlight.flightNumber }}</p>
            </div>
            
            <template #footer>
              <UButton
                v-if="returnFlightLink"
                :to="returnFlightLink"
                target="_blank"
                variant="ghost"
                color="primary"
                size="sm"
                trailing-icon="i-lucide-external-link"
              >
                Ver en Skyscanner
              </UButton>
            </template>
          </UCard>
        </div>
      </div>

      <!-- Accommodations Results -->
      <div v-if="accommodationsList && accommodationsList.length > 0" class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-hotel" class="text-primary size-5" />
          </div>
          <div>
            <UBadge color="primary" variant="subtle" size="sm">Alojamientos recomendados</UBadge>
            <h3 class="text-2xl font-bold text-highlighted">Opciones para completar tu experiencia</h3>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="(accommodation, index) in accommodationsList"
            :key="index"
            variant="outline"
            class="hover:border-primary/50 transition"
          >
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-highlighted">{{ accommodation.name }}</h4>
              <span class="text-xl font-bold text-primary">{{ formatPrice(accommodation.price, accommodation.currency) }}</span>
            </div>
            
            <div class="space-y-2 text-sm text-muted mb-4">
              <p v-if="accommodation.rating" class="flex items-center gap-1">
                <UIcon name="i-lucide-star" class="text-warning size-4" />
                <span class="font-medium text-highlighted">{{ accommodation.rating }}/5</span>
              </p>
              <p v-if="accommodation.address">
                <strong class="text-highlighted">Dirección:</strong> {{ accommodation.address }}
              </p>
              <p v-if="accommodation.type">
                <strong class="text-highlighted">Tipo:</strong> {{ accommodation.type }}
              </p>
            </div>
            
            <div v-if="accommodation.amenities && accommodation.amenities.length > 0" class="flex flex-wrap gap-1">
              <UBadge
                v-for="(amenity, amenityIndex) in accommodation.amenities.slice(0, 5)"
                :key="amenityIndex"
                color="neutral"
                variant="soft"
                size="xs"
              >
                {{ amenity }}
              </UBadge>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Summary Section -->
      <UCard v-if="resultText" variant="outline">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-clipboard-list" class="text-primary size-6" />
          </div>
          <div class="flex-1">
            <UBadge color="primary" variant="subtle" size="sm" class="mb-2">Resumen del viaje</UBadge>
            <h3 class="text-xl font-bold text-highlighted mb-3">Justificación de la combinación</h3>
            <p class="text-muted leading-relaxed whitespace-pre-line">{{ resultText }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Accommodation, Flight, TravelRecommendation } from '~/types/travel'

interface TravelResultProps {
  state: 'loading' | 'success'
  results?: TravelRecommendation | null
}

const { state, results } = defineProps<TravelResultProps>()

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
