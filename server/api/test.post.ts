import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openaiClient = new OpenAI();

const MCP_SERVER_URL = 'https://travel-mcp.onrender.com/mcp';

// Esquema Zod para un vuelo individual
const Flight = z.object({
    airline: z.string().describe('Código de la aerolínea'),
    price: z.number().describe('Precio del vuelo'),
    currency: z.string().describe('Moneda del precio'),
    departure: z.string().describe('Fecha y hora de salida'),
    arrival: z.string().describe('Fecha y hora de llegada'),
    duration: z.string().describe('Duración del vuelo'),
    stops: z.number().describe('Número de escalas'),
    flightNumber: z.string().describe('Número de vuelo'),
    aircraft: z.string().describe('Código del avión')
});

const Accommodation = z.object({
    name: z.string().describe('Nombre del alojamiento'),
    price: z.number().describe('Precio del alojamiento'),
    currency: z.string().describe('Moneda del precio'),
    rating: z.number().describe('Puntuación del alojamiento'),
    address: z.string().describe('Dirección del alojamiento'),
    amenities: z.array(z.string()).describe('Amenidades del alojamiento'),
});

// Esquema Zod para las recomendaciones de vuelos
const TravelRecommendation = z.object({
    flightsCombination: z.object({
        departureFlight: Flight.describe('Vuelo de ida recomendado'),
        returnFlight: Flight.nullable().optional().describe('Vuelo de vuelta recomendado')
    }).describe('Vuelo de ida y vuelta recomendados'),
    accommodations: Accommodation.describe('Alojamiento recomendado'),
    summary: z.string().describe('Resumen de las recomendaciones de vuelos y alojamientos')
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { departureCity, arrivalCity, departureDate, returnDate, tripType, includeAccommodation } = body;

    if (!departureCity || !arrivalCity || !departureDate) {
        throw createError({
            statusCode: 400,
            message: 'Faltan campos requeridos: departureCity, arrivalCity, departureDate'
        });
    }

    let systemInstruction = `Eres un asistente experto en planificación de viajes. Analiza los datos de vuelos del MCP server y proporciona recomendaciones estructuradas. Debes proporcionar la combinación más económica de vuelos, siempre que el viaje sea factible.`;  
    let userInput = `I want to travel from ${departureCity} to ${arrivalCity} on ${departureDate}`;
    if (returnDate) {
        userInput += ` and return on ${returnDate}`;
    }
    if (includeAccommodation) {
        systemInstruction += ' Añade recomendaciones de alojamientos, siempre que el viaje sea factible.';
        userInput += ' and include accommodation recommendations.';
    }

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
                server_url: MCP_SERVER_URL,
                require_approval: 'never'
            }
        ],
        text: {
            format: zodTextFormat(TravelRecommendation, 'travel_recommendation')
        }
    });

    return response;
});