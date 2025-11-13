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

// Esquema Zod para las recomendaciones de vuelos
const FlightRecommendations = z.object({
    recommendedFlights: z.array(Flight).describe('Lista de vuelos recomendados'),
    summary: z.string().describe('Resumen de las recomendaciones de vuelos')
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { departureCity, arrivalCity, departureDate, returnDate, tripType, includeAccommodation } = body;

    if (!departureCity || !arrivalCity || !departureDate || !returnDate) {
        throw createError({
            statusCode: 400,
            message: 'Faltan campos requeridos: departureCity, arrivalCity, departureDate, returnDate'
        });
    }

    const response = await openaiClient.responses.create({
        model: 'gpt-5',
        input: [
            {
                role: 'system',
                content: 'Eres un asistente experto en planificación de viajes. Analiza los datos de vuelos del MCP server y proporciona recomendaciones estructuradas.'
            },
            {
                role: 'user',
                content: `I want to travel from ${departureCity} to ${arrivalCity} on ${departureDate} and return on ${returnDate}. ${includeAccommodation ? 'Also include accommodation recommendations.' : ''}`
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
            format: zodTextFormat(FlightRecommendations, 'flight_recommendations')
        }
    });

    return response;
});