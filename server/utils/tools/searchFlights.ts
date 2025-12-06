import { z } from 'zod';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken as string;
  }

  const clientId = process.env.AMADEUS_API_KEY || '';
  const clientSecret = process.env.AMADEUS_API_SECRET || '';

  try {
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    
    return accessToken!;
  } catch (error) {
    console.error('Failed to get Amadeus access token:', error);
    throw new Error('Authentication failed');
  }
}

async function searchFlights(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  maxPrice?: number;
  currencyCode?: string;
}) {
  try {
    const token = await getAccessToken();
    
    const searchParams: any = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departDate,
      adults: params.adults,
      currencyCode: params.currencyCode || 'EUR',
      max: 10
    };

    if (params.returnDate) searchParams.returnDate = params.returnDate;
    if (params.children) searchParams.children = params.children;
    if (params.infants) searchParams.infants = params.infants;
    if (params.travelClass) searchParams.travelClass = params.travelClass;
    if (params.nonStop) searchParams.nonStop = params.nonStop;
    if (params.maxPrice) searchParams.maxPrice = params.maxPrice;

    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return transformAmadeusResponse(data.data || []);

  } catch (error) {
    console.error('Amadeus API error:', error);
    return getMockFlightData();
  }
}

function transformAmadeusResponse(offers: any[]) {
  return offers.map(offer => {
    const firstItinerary = offer.itineraries[0];
    const firstSegment = firstItinerary.segments[0];
    const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
    
    return {
      airline: firstSegment.carrierCode,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      departure: firstSegment.departure.at,
      arrival: lastSegment.arrival.at,
      duration: firstItinerary.duration,
      stops: firstSegment.numberOfStops,
      flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
      aircraft: firstSegment.aircraft.code,
      origin: firstSegment.departure.iataCode,
      destination: lastSegment.arrival.iataCode
    };
  });
}

function getMockFlightData() {
  return [
    {
      airline: 'LH',
      price: 450,
      currency: 'EUR',
      departure: '2024-07-15T10:30:00Z',
      arrival: '2024-07-15T14:45:00Z',
      duration: 'PT2H15M',
      stops: 0,
      flightNumber: 'LH123',
      aircraft: '320',
      origin: 'MAD',
      destination: 'FRA'
    },
    {
      airline: 'KL',
      price: 380,
      currency: 'EUR',
      departure: '2024-07-15T08:15:00Z',
      arrival: '2024-07-15T13:30:00Z',
      duration: 'PT4H15M',
      stops: 1,
      flightNumber: 'KL456',
      aircraft: '737',
      origin: 'MAD',
      destination: 'AMS'
    }
  ];
}

export const searchFlightsToolName = 'search_flights';
export const searchFlightsToolDescription = 'Search for flight prices and schedules';
export const searchFlightsToolInputSchema = {
  origin: z.string().describe('Origin city/airport code'),
  destination: z.string().describe('Destination city/airport code'),
  departDate: z.string().describe('Departure date (YYYY-MM-DD)'),
  returnDate: z.string().optional().describe('Return date (YYYY-MM-DD)'),
  passengers: z.number().default(1).describe('Number of passengers'),
  children: z.number().optional().describe('Number of children'),
  infants: z.number().optional().describe('Number of infants'),
  travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional().describe('Travel class'),
  nonStop: z.boolean().optional().describe('Non-stop flights only'),
  maxPrice: z.number().optional().describe('Maximum price'),
  currencyCode: z.string().optional().describe('Currency code')
};

export async function searchFlightsHandler(args: any) {
  try {
    const flightParams = {
      origin: args.origin,
      destination: args.destination,
      departDate: args.departDate,
      returnDate: args.returnDate,
      adults: args.passengers || 1,
      children: args.children,
      infants: args.infants,
      travelClass: args.travelClass,
      nonStop: args.nonStop,
      maxPrice: args.maxPrice,
      currencyCode: args.currencyCode
    };
    
    const results = await searchFlights(flightParams);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }
      ]
    };
  }
}

