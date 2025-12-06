import { z } from 'zod';

const cityToGeocodeMap: { [key: string]: { latitude: number; longitude: number; radius: number } } = {
  'madrid': { latitude: 40.4168, longitude: -3.7038, radius: 50 },
  'barcelona': { latitude: 41.3851, longitude: 2.1734, radius: 50 },
  'alicante': { latitude: 38.3452, longitude: -0.4810, radius: 30 },
  'bilbao': { latitude: 43.2627, longitude: -2.9253, radius: 30 },
  'valencia': { latitude: 39.4699, longitude: -0.3763, radius: 30 },
  'sevilla': { latitude: 37.3891, longitude: -5.9845, radius: 30 },
  'malaga': { latitude: 36.7213, longitude: -4.4214, radius: 30 },
  'palma': { latitude: 39.5696, longitude: 2.6502, radius: 30 },
  'london': { latitude: 51.5074, longitude: -0.1278, radius: 50 },
  'paris': { latitude: 48.8566, longitude: 2.3522, radius: 50 },
  'rome': { latitude: 41.9028, longitude: 12.4964, radius: 50 },
  'berlin': { latitude: 52.5200, longitude: 13.4050, radius: 50 },
  'amsterdam': { latitude: 52.3676, longitude: 4.9041, radius: 30 },
  'new york': { latitude: 40.7128, longitude: -74.0060, radius: 50 },
  'los angeles': { latitude: 34.0522, longitude: -118.2437, radius: 50 },
  'miami': { latitude: 25.7617, longitude: -80.1918, radius: 30 },
  'chicago': { latitude: 41.8781, longitude: -87.6298, radius: 50 },
  'toronto': { latitude: 43.6532, longitude: -79.3832, radius: 50 },
  'tokyo': { latitude: 35.6762, longitude: 139.6503, radius: 50 },
  'sydney': { latitude: -33.8688, longitude: 151.2093, radius: 50 }
};

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
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

function getCityGeocode(cityName: string): { latitude: number; longitude: number; radius: number } | null {
  const normalizedCity = cityName.toLowerCase().trim();
  return cityToGeocodeMap[normalizedCity] || null;
}

async function searchAccommodation(params: {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  budget?: number;
}): Promise<any[]> {
  try {
    console.log(`Searching accommodation for: ${params.city}, ${params.checkIn} to ${params.checkOut}, ${params.guests} guests`);
    
    const token = await getAccessToken();
    const geocode = getCityGeocode(params.city);
    
    if (!geocode) {
      console.warn(`No geocode found for city: ${params.city}, using mock data`);
      return getMockAccommodationData(params);
    }

    console.log(`Found geocode for ${params.city}: lat=${geocode.latitude}, lng=${geocode.longitude}, radius=${geocode.radius}`);

    const hotelSearchParams = new URLSearchParams({
      latitude: geocode.latitude.toString(),
      longitude: geocode.longitude.toString(),
      radius: geocode.radius.toString(),
      radiusUnit: 'KM',
      hotelSource: 'ALL'
    });

    const hotelSearchResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?${hotelSearchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const hotelSearchData = await hotelSearchResponse.json();
    console.log(`Hotel search response: ${hotelSearchData.data?.length || 0} hotels found`);

    if (!hotelSearchData.data || hotelSearchData.data.length === 0) {
      console.log('No hotels found, using mock data');
      return getMockAccommodationData(params);
    }

    const hotelIds = hotelSearchData.data.slice(0, 5).map((hotel: any) => hotel.hotelId);
    console.log(`Getting offers for hotel IDs: ${hotelIds.join(', ')}`);
    
    const offersParams = new URLSearchParams({
      hotelIds: hotelIds.join(','),
      adults: params.guests.toString(),
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      currency: 'EUR',
      lang: 'EN',
      view: 'FULL'
    });

    const offersResponse = await fetch(`https://test.api.amadeus.com/v3/shopping/hotel-offers?${offersParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const offersData = await offersResponse.json();
    console.log(`Offers response: ${offersData.data?.length || 0} offers found`);

    if (!offersData.data || offersData.data.length === 0) {
      console.log('No offers found, using mock data');
      return getMockAccommodationData(params);
    }

    const results = transformAmadeusResponse(offersData.data);
    console.log(`Transformed ${results.length} accommodation results`);
    return results;

  } catch (error) {
    console.error('Amadeus Hotel API error:', error);
    console.log('Falling back to mock data');
    return getMockAccommodationData(params);
  }
}

function transformAmadeusResponse(offers: any[]): any[] {
  return offers.map(offer => {
    const bestOffer = offer.offers[0];
    
    return {
      name: offer.hotel.name,
      type: 'hotel',
      price: parseFloat(bestOffer.price.total),
      currency: bestOffer.price.currency,
      rating: offer.hotel.rating || 0,
      address: `${offer.hotel.name}, ${offer.hotel.contact?.phone || ''}`,
      amenities: offer.hotel.amenities || [],
      imageUrl: offer.hotel.media?.[0]?.uri,
      hotelId: offer.hotel.hotelId,
      latitude: undefined,
      longitude: undefined
    };
  });
}

function getMockAccommodationData(params: { city: string }): any[] {
  return [
    {
      name: 'Hotel Europa',
      type: 'hotel',
      price: 120,
      currency: 'EUR',
      rating: 4.2,
      address: `${params.city} City Center`,
      amenities: ['WiFi', 'Breakfast', 'Air Conditioning', 'Gym', 'Pool'],
      imageUrl: 'https://example.com/hotel-europa.jpg'
    },
    {
      name: 'Central Apartment',
      type: 'apartment',
      price: 85,
      currency: 'EUR',
      rating: 4.5,
      address: `${params.city} Historic District`,
      amenities: ['WiFi', 'Kitchen', 'Washing Machine', 'Balcony'],
      imageUrl: 'https://example.com/apartment.jpg'
    },
    {
      name: 'Budget Hostel',
      type: 'hostel',
      price: 35,
      currency: 'EUR',
      rating: 3.8,
      address: `${params.city} Backpacker Area`,
      amenities: ['WiFi', 'Shared Kitchen', 'Laundry', 'Common Room'],
      imageUrl: 'https://example.com/hostel.jpg'
    }
  ];
}

export const searchAccommodationToolName = 'search_accommodation';
export const searchAccommodationToolDescription = 'Search for hotel and accommodation options in a specific city';
export const searchAccommodationToolInputSchema = {
  city: z.string().describe('City name where to search for accommodation'),
  checkIn: z.string().describe('Check-in date (YYYY-MM-DD)'),
  checkOut: z.string().describe('Check-out date (YYYY-MM-DD)'),
  guests: z.number().describe('Number of guests'),
  budget: z.number().optional().describe('Maximum budget for accommodation')
};

export async function searchAccommodationHandler(args: any) {
  try {
    const results = await searchAccommodation({
      city: args.city,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guests: args.guests,
      budget: args.budget
    });
    
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

