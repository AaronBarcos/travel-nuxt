import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { createClient } from '@supabase/supabase-js'
import {
  TravelRecommendationSchema,
  TravelSearchSchema
} from '~/types/travel'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  const apiKey = config.openaiApiKey || env?.OPENAI_API_KEY
  const travelMcpUrl = config.travelMcpUrl

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OPENAI_API_KEY no configurada en runtimeConfig'
    })
  }

  const rawBody = await readBody(event)
  const { _creditConsumed, ...searchBody } = rawBody as any
  
  // Verificar y consumir créditos
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  // Obtener token de autorización del header
  const authHeader = event.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (!authError && user) {
      // Verificar si el usuario tiene una suscripción activa
      const { data: isSubscribed } = await supabase.rpc('is_user_subscribed', {
        check_user_id: user.id
      })

      // Si está suscrito, no consumir créditos
      if (!isSubscribed) {
        // Usuario logueado sin suscripción: consumir crédito desde la base de datos
        const { data, error } = await supabase.rpc('consume_user_credit', {
          user_id_param: user.id
        })

        if (error) {
          if (error.code === 'P0001') {
            throw createError({
              statusCode: 403,
              message: 'No tienes créditos suficientes para realizar esta búsqueda'
            })
          }
          throw createError({
            statusCode: 500,
            message: 'Error al verificar créditos'
          })
        }
      }
    }
  } else if (_creditConsumed !== true) {
    // Usuario no logueado: debe haber consumido el crédito en el cliente
    throw createError({
      statusCode: 403,
      message: 'No tienes créditos suficientes para realizar esta búsqueda'
    })
  }
  
  const { departureCity, arrivalCity, departureDate, returnDate, tripType, includeAccommodation } =
    TravelSearchSchema.parse(searchBody)

  let systemInstruction =
    'Eres un asistente experto en planificación de viajes. Analiza los datos del servidor MCP y proporciona recomendaciones estructuradas. Debes proporcionar la combinación más económica de vuelos, siempre que el viaje sea factible.'
  let userInput = `Quiero viajar de ${departureCity} a ${arrivalCity} el ${departureDate}`
  if (returnDate) {
    userInput += ` y volver el ${returnDate}`
  }
  if (includeAccommodation) {
    systemInstruction += ' Añade recomendaciones de alojamientos, siempre que el viaje sea factible.'
    userInput += ' y incluye recomendaciones de alojamientos.'
  }

  const openaiClient = new OpenAI({ apiKey })

  const response = await openaiClient.responses.create({
    model: 'gpt-5.1',
    input: [
      {
        role: 'system',
        content: systemInstruction
      },
      {
        role: 'user',
        content: userInput
      }
    ],
    tools: [
      {
        type: 'mcp',
        server_label: 'travel-mcp',
        server_description: 'A Travel MCP server to assist with travel planning.',
        server_url: travelMcpUrl,
        require_approval: 'never'
      }
    ],
    text: {
      format: zodTextFormat(TravelRecommendationSchema, 'travel_recommendation')
    }
  })

  return response
})