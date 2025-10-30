import type { SkiResort } from '../types/ski-resort';
import { getApiConfig } from '../config/api';
import { enhancedSkiResorts } from './enhancedSkiResortAPI';

// API service for ski resort data
export class SkiResortAPI {
  private static getConfig() {
    return getApiConfig();
  }

  private static getHeaders() {
    const config = this.getConfig();
    return {
      'X-RapidAPI-Key': config.RAPIDAPI_KEY,
      'X-RapidAPI-Host': config.RAPIDAPI_HOST,
      'Content-Type': 'application/json',
    };
  }

  // Fetch all ski resorts
  static async getAllResorts(): Promise<SkiResort[]> {
    const config = this.getConfig();
    
    // If configured to use fallback data, skip API call
    if (config.USE_FALLBACK_DATA) {
      console.log('Using fallback ski resort data (API disabled in development)');
      return fallbackResorts;
    }

    try {
      const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.ALL_RESORTS}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if API requires subscription
      if (data.message && data.message.includes('not subscribed')) {
        console.warn('API subscription required. Using fallback data.');
        return fallbackResorts;
      }
      
      return this.mapApiDataToSkiResorts(data);
    } catch (error) {
      console.error('Error fetching ski resorts:', error);
      // Fall back to sample data if API fails
      console.log('Falling back to sample data due to API error');
      return fallbackResorts;
    }
  }

  // Fetch a specific ski resort by ID
  static async getResortById(resortId: string): Promise<SkiResort> {
    const config = this.getConfig();
    
    // If configured to use fallback data, find the resort in fallback data
    if (config.USE_FALLBACK_DATA) {
      console.log(`Using fallback data for resort ${resortId} (API disabled in development)`);
      const resort = fallbackResorts.find(r => r.id === resortId);
      if (!resort) {
        throw new Error(`Resort ${resortId} not found in fallback data`);
      }
      return resort;
    }

    try {
      // For ski resort conditions API, we might need to use a different endpoint structure
      const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.SINGLE_RESORT}?resort_id=${resortId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if API requires subscription
      if (data.message && data.message.includes('not subscribed')) {
        console.warn('API subscription required. Using fallback data.');
        const resort = fallbackResorts.find(r => r.id === resortId);
        if (!resort) {
          throw new Error(`Resort ${resortId} not found in fallback data`);
        }
        return resort;
      }
      
      return this.mapApiDataToSkiResort(data);
    } catch (error) {
      console.error(`Error fetching resort ${resortId}:`, error);
      // Fall back to sample data
      const resort = fallbackResorts.find(r => r.id === resortId);
      if (!resort) {
        throw new Error(`Resort ${resortId} not found in fallback data`);
      }
      return resort;
    }
  }

  // Search resorts with filters
  static async searchResorts(searchTerm?: string, filters?: Record<string, unknown>): Promise<SkiResort[]> {
    const config = this.getConfig();
    
    // If configured to use fallback data, filter the fallback data
    if (config.USE_FALLBACK_DATA) {
      console.log('Using fallback data for search (API disabled in development)');
      let results = [...fallbackResorts];
      
      // Apply search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter(resort => 
          resort.name.toLowerCase().includes(searchLower) ||
          resort.location.state.toLowerCase().includes(searchLower) ||
          resort.location.city?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply state filter
      if (filters?.state && typeof filters.state === 'string') {
        results = results.filter(resort => 
          resort.location.state.toLowerCase() === (filters.state as string).toLowerCase()
        );
      }
      
      // Apply elevation filter
      if (filters?.minElevation && typeof filters.minElevation === 'number') {
        results = results.filter(resort => 
          resort.elevation.base >= (filters.minElevation as number)
        );
      }
      
      return results;
    }

    try {
      let endpoint = config.ENDPOINTS.ALL_RESORTS;
      const queryParams = new URLSearchParams();
      
      // If searching by state, use the state-specific endpoint
      if (filters?.state && typeof filters.state === 'string') {
        endpoint = config.ENDPOINTS.SEARCH_RESORTS;
        queryParams.append('state', filters.state as string);
      }
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filters?.minElevation && typeof filters.minElevation === 'number') {
        queryParams.append('min_elevation', filters.minElevation.toString());
      }

      const url = queryParams.toString() 
        ? `${config.BASE_URL}${endpoint}?${queryParams.toString()}`
        : `${config.BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if API requires subscription
      if (data.message && data.message.includes('not subscribed')) {
        console.warn('API subscription required. Using fallback data for search.');
        // Fall back to local search with fallback data
        let results = [...fallbackResorts];
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          results = results.filter(resort => 
            resort.name.toLowerCase().includes(searchLower) ||
            resort.location.state.toLowerCase().includes(searchLower) ||
            resort.location.city?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters?.state && typeof filters.state === 'string') {
          results = results.filter(resort => 
            resort.location.state.toLowerCase() === (filters.state as string).toLowerCase()
          );
        }
        
        if (filters?.minElevation && typeof filters.minElevation === 'number') {
          results = results.filter(resort => 
            resort.elevation.base >= (filters.minElevation as number)
          );
        }
        
        return results;
      }
      
      return this.mapApiDataToSkiResorts(data);
    } catch (error) {
      console.error('Error searching ski resorts:', error);
      // Fall back to local search with sample data
      let results = [...fallbackResorts];
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter(resort => 
          resort.name.toLowerCase().includes(searchLower) ||
          resort.location.state.toLowerCase().includes(searchLower) ||
          resort.location.city?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters?.state && typeof filters.state === 'string') {
        results = results.filter(resort => 
          resort.location.state.toLowerCase() === (filters.state as string).toLowerCase()
        );
      }
      
      if (filters?.minElevation && typeof filters.minElevation === 'number') {
        results = results.filter(resort => 
          resort.elevation.base >= (filters.minElevation as number)
        );
      }
      
      return results;
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

// Original fallback data with enhanced scraped data
const originalFallbackResorts: SkiResort[] = [
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
  },
  {
    id: 'aspen-snowmass-co',
    name: 'Aspen Snowmass',
    location: {
      state: 'Colorado',
      city: 'Aspen',
      coordinates: {
        latitude: 39.1911,
        longitude: -106.8175
      }
    },
    elevation: {
      base: 7945,
      summit: 12510,
      vertical: 4565
    },
    lifts: {
      total: 41,
      chairlifts: 35,
      surfaceLifts: 6,
      gondolas: 3
    },
    trails: {
      total: 337,
      beginner: 35,
      intermediate: 154,
      advanced: 98,
      expert: 50
    },
    skiableAcres: 5527,
    snowmaking: {
      percentage: 47,
      acres: 870
    },
    seasonDates: {
      opening: 'November',
      closing: 'April'
    },
    website: 'https://www.aspensnowmass.com',
    description: 'Four mountains, one unforgettable experience in the heart of Colorado',
    amenities: ['Village Base', 'Mountain Dining', 'Ski School', 'Equipment Rental', 'Terrain Parks', 'Alpine Slides'],
    liftTicketPrice: {
      adult: 249,
      child: 169,
      senior: 169
    }
  },
  {
    id: 'vail-co',
    name: 'Vail Mountain Resort',
    location: {
      state: 'Colorado',
      city: 'Vail',
      coordinates: {
        latitude: 39.6403,
        longitude: -106.3548
      }
    },
    elevation: {
      base: 8120,
      summit: 11570,
      vertical: 3450
    },
    lifts: {
      total: 31,
      chairlifts: 26,
      surfaceLifts: 5,
      gondolas: 1
    },
    trails: {
      total: 195,
      beginner: 18,
      intermediate: 53,
      advanced: 44,
      expert: 80
    },
    skiableAcres: 5317,
    snowmaking: {
      percentage: 62,
      acres: 1056
    },
    seasonDates: {
      opening: 'November',
      closing: 'April'
    },
    website: 'https://www.vail.com',
    description: 'America\'s favorite mountain with legendary back bowls',
    amenities: ['Vail Village', 'Blue Sky Basin', 'Ski School', 'Equipment Rental', 'Adventure Ridge'],
    liftTicketPrice: {
      adult: 239,
      child: 159,
      senior: 159
    }
  },
  {
    id: 'park-city-ut',
    name: 'Park City Mountain Resort',
    location: {
      state: 'Utah',
      city: 'Park City',
      coordinates: {
        latitude: 40.6518,
        longitude: -111.5079
      }
    },
    elevation: {
      base: 6800,
      summit: 10026,
      vertical: 3226
    },
    lifts: {
      total: 41,
      chairlifts: 38,
      surfaceLifts: 3,
      gondolas: 1
    },
    trails: {
      total: 348,
      beginner: 8,
      intermediate: 42,
      advanced: 50,
      expert: 0
    },
    skiableAcres: 7300,
    snowmaking: {
      percentage: 22,
      acres: 500
    },
    seasonDates: {
      opening: 'November',
      closing: 'April'
    },
    website: 'https://www.parkcitymountain.com',
    description: 'The largest ski resort in the United States by skiable acreage',
    amenities: ['Park City Base', 'Canyons Village', 'Ski School', 'Equipment Rental', 'Terrain Parks'],
    liftTicketPrice: {
      adult: 199,
      child: 139,
      senior: 139
    }
  },
  {
    id: 'whistler-blackcomb-bc',
    name: 'Whistler Blackcomb',
    location: {
      state: 'British Columbia',
      city: 'Whistler',
      coordinates: {
        latitude: 50.1163,
        longitude: -122.9574
      }
    },
    elevation: {
      base: 2214,
      summit: 7494,
      vertical: 5280
    },
    lifts: {
      total: 37,
      chairlifts: 28,
      surfaceLifts: 9,
      gondolas: 3
    },
    trails: {
      total: 200,
      beginner: 20,
      intermediate: 55,
      advanced: 25,
      expert: 0
    },
    skiableAcres: 8171,
    snowmaking: {
      percentage: 12,
      acres: 296
    },
    seasonDates: {
      opening: 'November',
      closing: 'May'
    },
    website: 'https://www.whistlerblackcomb.com',
    description: 'Two mountains, one unforgettable experience in Canada',
    amenities: ['Whistler Village', 'Peak 2 Peak Gondola', 'Ski School', 'Equipment Rental', 'Terrain Parks'],
    liftTicketPrice: {
      adult: 159,
      child: 119,
      senior: 119
    }
  },
  {
    id: 'mammoth-mountain-ca',
    name: 'Mammoth Mountain',
    location: {
      state: 'California',
      city: 'Mammoth Lakes',
      coordinates: {
        latitude: 37.6308,
        longitude: -119.0326
      }
    },
    elevation: {
      base: 7953,
      summit: 11053,
      vertical: 3100
    },
    lifts: {
      total: 25,
      chairlifts: 20,
      surfaceLifts: 5,
      gondolas: 1
    },
    trails: {
      total: 150,
      beginner: 25,
      intermediate: 40,
      advanced: 20,
      expert: 15
    },
    skiableAcres: 3500,
    snowmaking: {
      percentage: 35,
      acres: 500
    },
    seasonDates: {
      opening: 'November',
      closing: 'June'
    },
    website: 'https://www.mammothmountain.com',
    description: 'California\'s premier mountain resort with the longest season',
    amenities: ['Main Lodge', 'Canyon Lodge', 'Ski School', 'Equipment Rental', 'Terrain Parks', 'Scenic Gondola'],
    liftTicketPrice: {
      adult: 189,
      child: 149,
      senior: 149
    }
  },
  {
    id: 'jackson-hole-wy',
    name: 'Jackson Hole Mountain Resort',
    location: {
      state: 'Wyoming',
      city: 'Teton Village',
      coordinates: {
        latitude: 43.5873,
        longitude: -110.8281
      }
    },
    elevation: {
      base: 6311,
      summit: 10450,
      vertical: 4139
    },
    lifts: {
      total: 13,
      chairlifts: 11,
      surfaceLifts: 2,
      gondolas: 1
    },
    trails: {
      total: 133,
      beginner: 10,
      intermediate: 40,
      advanced: 40,
      expert: 10
    },
    skiableAcres: 2500,
    snowmaking: {
      percentage: 18,
      acres: 200
    },
    seasonDates: {
      opening: 'December',
      closing: 'April'
    },
    website: 'https://www.jacksonhole.com',
    description: 'Like nothing on earth - legendary steep terrain and big mountain skiing',
    amenities: ['Teton Village', 'Aerial Tram', 'Ski School', 'Equipment Rental', 'Terrain Parks'],
    liftTicketPrice: {
      adult: 219,
      child: 159,
      senior: 159
    }
  },
  {
    id: 'stowe-vt',
    name: 'Stowe Mountain Resort',
    location: {
      state: 'Vermont',
      city: 'Stowe',
      coordinates: {
        latitude: 44.4654,
        longitude: -72.7873
      }
    },
    elevation: {
      base: 1339,
      summit: 4395,
      vertical: 3056
    },
    lifts: {
      total: 12,
      chairlifts: 10,
      surfaceLifts: 2,
      gondolas: 1
    },
    trails: {
      total: 116,
      beginner: 16,
      intermediate: 59,
      advanced: 25,
      expert: 16
    },
    skiableAcres: 485,
    snowmaking: {
      percentage: 75,
      acres: 300
    },
    seasonDates: {
      opening: 'November',
      closing: 'April'
    },
    website: 'https://www.stowe.com',
    description: 'Vermont\'s iconic mountain resort with classic New England charm',
    amenities: ['Stowe Village', 'Gondola SkyRide', 'Ski School', 'Equipment Rental', 'Mountain Lodge'],
    liftTicketPrice: {
      adult: 149,
      child: 109,
      senior: 109
    }
  }
];

// Export combined data: enhanced scraped resorts + original fallback data
export const fallbackResorts: SkiResort[] = [...enhancedSkiResorts, ...originalFallbackResorts];