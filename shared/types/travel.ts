import { z } from 'zod'

export const FlightSchema = z.object({
  airline: z.string().describe('Código de la aerolínea'),
  price: z.number().describe('Precio del vuelo'),
  currency: z.string().describe('Moneda del precio'),
  departure: z.string().describe('Fecha y hora de salida'),
  arrival: z.string().describe('Fecha y hora de llegada'),
  duration: z.string().describe('Duración del vuelo'),
  stops: z.number().describe('Número de escalas'),
  flightNumber: z.string().describe('Número de vuelo'),
  aircraft: z.string().describe('Código del avión'),
  origin: z.string().describe('Código IATA de origen'),
  destination: z.string().describe('Código IATA de destino')
})

export const AccommodationSchema = z.object({
  name: z.string().describe('Nombre del alojamiento'),
  price: z.number().describe('Precio del alojamiento'),
  currency: z.string().describe('Moneda del precio'),
  rating: z.number().describe('Puntuación del alojamiento'),
  address: z.string().describe('Dirección del alojamiento'),
  amenities: z.array(z.string()).describe('Amenidades del alojamiento'),
  type: z.string().nullable().describe('Tipo de alojamiento'),
  website: z.string().nullable().describe('Web del alojamiento')
})

export const AccommodationListSchema = z.union([
  AccommodationSchema,
  z.array(AccommodationSchema)
])

export const TravelRecommendationSchema = z.object({
  flightsCombination: z
    .object({
      departureFlight: FlightSchema.describe('Vuelo de ida recomendado'),
      returnFlight: FlightSchema.nullable().optional().describe('Vuelo de vuelta recomendado')
    })
    .describe('Vuelo de ida y vuelta recomendados'),
  accommodations: AccommodationListSchema.describe('Alojamientos recomendados'),
  summary: z.string().describe('Resumen de las recomendaciones de vuelos y alojamientos')
})

export const TravelSearchSchema = z.object({
  departureCity: z.string().min(2),
  arrivalCity: z.string().min(2),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  tripType: z.enum(['roundtrip', 'oneway']).default('roundtrip'),
  includeAccommodation: z.boolean().default(false)
})

export type Flight = z.infer<typeof FlightSchema>
export type Accommodation = z.infer<typeof AccommodationSchema>
export type TravelRecommendation = z.infer<typeof TravelRecommendationSchema>
export type TravelSearchInput = z.infer<typeof TravelSearchSchema>

