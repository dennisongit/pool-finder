import axios from 'axios';
import { env } from './env';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id: string;
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

export interface ReverseGeocodeResult {
  formatted_address: string;
  place_id: string;
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

class GeocodeService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor() {
    this.apiKey = env.GOOGLE_MAPS_API_KEY;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address,
          key: this.apiKey,
        },
        timeout: 10000
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          address_components: result.address_components
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
        },
        timeout: 10000
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          address_components: result.address_components
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  async validateCoordinates(lat: number, lng: number): Promise<boolean> {
    return (
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }

  async getBounds(addresses: string[]): Promise<{
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  } | null> {
    try {
      const geocodePromises = addresses.map(addr => this.geocodeAddress(addr));
      const results = await Promise.all(geocodePromises);
      
      const validResults = results.filter(r => r !== null) as GeocodeResult[];
      
      if (validResults.length === 0) {
        return null;
      }

      const lats = validResults.map(r => r.lat);
      const lngs = validResults.map(r => r.lng);

      return {
        northeast: {
          lat: Math.max(...lats),
          lng: Math.max(...lngs)
        },
        southwest: {
          lat: Math.min(...lats),
          lng: Math.min(...lngs)
        }
      };
    } catch (error) {
      console.error('Error calculating bounds:', error);
      return null;
    }
  }
}

export const geocodeService = new GeocodeService();
