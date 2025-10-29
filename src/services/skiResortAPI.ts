import type { SkiResort } from '../types/ski-resort';
import { API_CONFIG } from '../config/api';

// API service for ski resort data
export class SkiResortAPI {
  private static headers = {
    'X-RapidAPI-Key': API_CONFIG.RAPIDAPI_KEY,
    'X-RapidAPI-Host': API_CONFIG.RAPIDAPI_HOST,
    'Content-Type': 'application/json',
  };

  // Fetch all ski resorts
  static async getAllResorts(): Promise<SkiResort[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_RESORTS}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapApiDataToSkiResorts(data);
    } catch (error) {
      console.error('Error fetching ski resorts:', error);
      throw error;
    }
  }

  // Fetch a specific ski resort by ID
  static async getResortById(resortId: string): Promise<SkiResort> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SINGLE_RESORT}/${resortId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapApiDataToSkiResort(data);
    } catch (error) {
      console.error(`Error fetching resort ${resortId}:`, error);
      throw error;
    }
  }

  // Search resorts with filters
  static async searchResorts(searchTerm?: string, filters?: Record<string, unknown>): Promise<SkiResort[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filters?.state && typeof filters.state === 'string') {
        queryParams.append('state', filters.state);
      }
      
      if (filters?.minElevation && typeof filters.minElevation === 'number') {
        queryParams.append('min_elevation', filters.minElevation.toString());
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_RESORTS}?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapApiDataToSkiResorts(data);
    } catch (error) {
      console.error('Error searching ski resorts:', error);
      throw error;
    }
  }

  // Map API response data to our SkiResort interface
  private static mapApiDataToSkiResorts(apiData: unknown): SkiResort[] {
    let resorts = apiData;
    
    if (typeof apiData === 'object' && apiData !== null && 'resorts' in apiData) {
      resorts = (apiData as { resorts: unknown }).resorts;
    }
    
    if (!Array.isArray(resorts)) {
      return [];
    }

    return resorts.map(resort => this.mapApiDataToSkiResort(resort));
  }

  // Map single resort data from API to our SkiResort interface
  private static mapApiDataToSkiResort(apiResort: Record<string, unknown>): SkiResort {
    const getString = (value: unknown): string => typeof value === 'string' ? value : '';
    const getNumber = (value: unknown): number => typeof value === 'number' ? value : 0;
    const getOptionalNumber = (value: unknown): number | undefined => typeof value === 'number' ? value : undefined;
    const getOptionalString = (value: unknown): string | undefined => typeof value === 'string' ? value : undefined;
    const getArray = (value: unknown): string[] => Array.isArray(value) ? value : [];
    
    const resort = apiResort as Record<string, unknown>;
    
    const location = resort.location as Record<string, unknown> || {};
    const coordinates = resort.coordinates as Record<string, unknown> || {};
    const elevation = resort.elevation as Record<string, unknown> || {};
    const lifts = resort.lifts as Record<string, unknown> || {};
    const trails = resort.trails as Record<string, unknown> || {};
    const snowmaking = resort.snowmaking as Record<string, unknown> || {};
    const season = resort.season as Record<string, unknown> || {};
    const pricing = resort.pricing as Record<string, unknown> || {};

    return {
      id: getString(resort['id']) || getString(resort['resort_id']) || '',
      name: getString(resort['name']) || '',
      location: {
        state: getString(resort['state']) || getString(location['state']) || '',
        city: getString(resort['city']) || getString(location['city']) || '',
        coordinates: {
          latitude: getNumber(resort['latitude']) || getNumber(coordinates['latitude']) || 0,
          longitude: getNumber(resort['longitude']) || getNumber(coordinates['longitude']) || 0,
        }
      },
      elevation: {
        base: getNumber(resort['base_elevation']) || getNumber(elevation['base']) || 0,
        summit: getNumber(resort['summit_elevation']) || getNumber(elevation['summit']) || 0,
        vertical: getNumber(resort['vertical_drop']) || getNumber(elevation['vertical']) || 0,
      },
      lifts: {
        total: getNumber(resort['total_lifts']) || getNumber(lifts['total']) || 0,
        chairlifts: getNumber(resort['chairlifts']) || getNumber(lifts['chairlifts']) || 0,
        surfaceLifts: getNumber(resort['surface_lifts']) || getNumber(lifts['surface']) || 0,
        gondolas: getNumber(resort['gondolas']) || getNumber(lifts['gondolas']) || 0,
      },
      trails: {
        total: getNumber(resort['total_trails']) || getNumber(trails['total']) || 0,
        beginner: getNumber(resort['beginner_trails']) || getNumber(trails['beginner']) || 0,
        intermediate: getNumber(resort['intermediate_trails']) || getNumber(trails['intermediate']) || 0,
        advanced: getNumber(resort['advanced_trails']) || getNumber(trails['advanced']) || 0,
        expert: getNumber(resort['expert_trails']) || getNumber(trails['expert']) || 0,
      },
      skiableAcres: getNumber(resort['skiable_acres']) || getNumber(resort['acres']) || 0,
      snowmaking: {
        percentage: getNumber(resort['snowmaking_percentage']) || getNumber(snowmaking['percentage']) || 0,
        acres: getOptionalNumber(resort['snowmaking_acres']) || getOptionalNumber(snowmaking['acres']),
      },
      seasonDates: {
        opening: getOptionalString(resort['season_start']) || getOptionalString(season['opening']),
        closing: getOptionalString(resort['season_end']) || getOptionalString(season['closing']),
      },
      website: getOptionalString(resort['website']) || getOptionalString(resort['url']),
      phoneNumber: getOptionalString(resort['phone']) || getOptionalString(resort['phone_number']),
      description: getString(resort['description']) || '',
      amenities: getArray(resort['amenities']) || [],
      liftTicketPrice: {
        adult: getOptionalNumber(resort['adult_ticket_price']) || getOptionalNumber(pricing['adult']) || 0,
        child: getOptionalNumber(resort['child_ticket_price']) || getOptionalNumber(pricing['child']),
        senior: getOptionalNumber(resort['senior_ticket_price']) || getOptionalNumber(pricing['senior']),
      },
    };
  }
}

// Fallback data in case API is unavailable
export const fallbackResorts: SkiResort[] = [
  // Keep one sample resort as fallback
  {
    id: 'killington-vt',
    name: 'Killington Resort',
    location: {
      state: 'Vermont',
      city: 'Killington',
      coordinates: {
        latitude: 43.6041,
        longitude: -72.8092
      }
    },
    elevation: {
      base: 1165,
      summit: 4241,
      vertical: 3076
    },
    lifts: {
      total: 22,
      chairlifts: 18,
      surfaceLifts: 4,
      gondolas: 2
    },
    trails: {
      total: 155,
      beginner: 20,
      intermediate: 58,
      advanced: 45,
      expert: 32
    },
    skiableAcres: 1509,
    snowmaking: {
      percentage: 70,
      acres: 600
    },
    seasonDates: {
      opening: 'November',
      closing: 'May'
    },
    website: 'https://www.killington.com',
    description: 'The Beast of the East - Vermont\'s largest ski resort',
    amenities: ['Base Lodge', 'Summit Restaurant', 'Ski School', 'Rental Shop', 'Terrain Parks'],
    liftTicketPrice: {
      adult: 129,
      child: 99,
      senior: 99
    }
  }
];