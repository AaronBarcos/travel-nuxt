import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import {
  TravelRecommendationSchema,
  TravelSearchSchema
} from '~/types/travel'

const DEFAULT_MCP_SERVER_URL = 'https://travel-mcp.onrender.com/mcp'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  const apiKey = config.openaiApiKey || env?.OPENAI_API_KEY
  const travelMcpUrl = config.travelMcpUrl || DEFAULT_MCP_SERVER_URL

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OPENAI_API_KEY no configurada en runtimeConfig'
    })
  }

  const body = await readBody(event)
  const { departureCity, arrivalCity, departureDate, returnDate, tripType, includeAccommodation } =
    TravelSearchSchema.parse(body)

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