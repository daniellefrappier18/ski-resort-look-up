import type { SkiResort } from '../types/ski-resort';
import rawData from './enhanced-usa-ski-resorts.json';

// Type for the raw JSON data structure
interface LiftDetail {
  type: string;
  detachable: boolean;
  fixed_grip: boolean;
  name: string;
}

interface RawSkiResort {
  name: string;
  state: string;
  url: string;
  elevation_base: number | null;
  elevation_top: number | null;
  elevation_difference: number | null;
  slopes_total_km: number | null;
  lifts_total: number | null;
  day_pass_adult: number | null;
  website: string | null;
  season_opening: string | null;
  season_closing: string | null;
  trails_beginner: number | null;
  trails_intermediate: number | null;
  trails_advanced: number | null;
  trails_expert: number | null;
  trails_total: number | null;
  fixed_grip_only: boolean | null;
  lift_details?: LiftDetail[]; // Optional array of detailed lift information
}

// Transform the raw JSON data to match our SkiResort type
function transformResortData(rawResort: RawSkiResort): SkiResort {
  // Helper function to safely convert meters to feet
  const metersToFeet = (meters: number | null): number => {
    return meters ? Math.round(meters * 3.28084) : 0;
  };

  // Helper function to safely convert km² to acres  
  const kmToAcres = (km: number | null): number => {
    return km ? Math.round(km * 247.105) : 0;
  };

  // Helper function to parse lift details
  const parseLiftDetails = (liftDetails?: LiftDetail[]) => {
    if (!liftDetails || liftDetails.length === 0) {
      // Fallback to basic data if no lift_details available
      return {
        total: rawResort.lifts_total ?? 0,
        chairlifts: rawResort.lifts_total ?? 0, // Assume all are chairlifts if no details
        surfaceLifts: 0,
        gondolas: 0,
        funiculars: 0,
        fixedGripOnly: rawResort.fixed_grip_only ?? false
      };
    }

    // Count lifts by type from detailed data
    const chairlifts = liftDetails.filter(lift => lift.type === 'chairlift').length;
    const gondolas = liftDetails.filter(lift => 
      lift.type === 'gondola' || lift.type === 'tram' // Group trams with gondolas (aerial lifts)
    ).length;
    const funiculars = liftDetails.filter(lift => lift.type === 'funicular').length;
    const surfaceLifts = liftDetails.filter(lift => 
      lift.type === 'surface' || 
      lift.type === 'rope tow' || 
      lift.type === 'magic carpet' ||
      lift.type === 'platter lift' ||
      lift.type === 't-bar'
    ).length;

    // Check if all lifts are fixed-grip
    const allFixedGrip = liftDetails.every(lift => lift.fixed_grip === true);
    
    const total = chairlifts + gondolas + funiculars + surfaceLifts;

    return {
      total,
      chairlifts,
      surfaceLifts,
      gondolas,
      funiculars,
      fixedGripOnly: allFixedGrip
    };
  };

  return {
    id: rawResort.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    name: rawResort.name,
    location: {
      state: rawResort.state,
      city: null, // Add city mapping if available in raw data
      coordinates: null // Add coordinates if available
    },
    elevation: {
      base: metersToFeet(rawResort.elevation_base),
      summit: metersToFeet(rawResort.elevation_top),
      vertical: metersToFeet(rawResort.elevation_difference)
    },
    lifts: parseLiftDetails(rawResort.lift_details),
    trails: {
      total: rawResort.trails_total ?? 0, // Default to 0 if null
      beginner: rawResort.trails_beginner ?? 0,
      intermediate: rawResort.trails_intermediate ?? 0,
      advanced: rawResort.trails_advanced ?? 0,
      expert: rawResort.trails_expert ?? 0
    },
    skiableAcres: kmToAcres(rawResort.slopes_total_km),
    seasonDates: rawResort.season_opening && rawResort.season_closing 
      ? `${rawResort.season_opening} - ${rawResort.season_closing}` 
      : 'Season dates not available',
    website: rawResort.website || '',
    phoneNumber: null,
    liftTicketPrice: rawResort.day_pass_adult ?? 0 // Default to 0 if null
  };
}

// Export the transformed data
export const usaSkiResorts: SkiResort[] = (rawData as RawSkiResort[]).map(transformResortData);