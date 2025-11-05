// Types for ski resort data structures

export interface SkiResort {
  id: string;
  name: string;
  location: {
    state: string | null;
    city: string | null;
    coordinates: {
      latitude: number;
      longitude: number;
    } | null;
  };
  elevation: {
    base: number | null;
    summit: number | null;
    vertical: number | null;
  };
  lifts: {
    total: number | null;
    chairlifts: number | null;
    surfaceLifts: number | null;
    gondolas: number | null;
    funiculars: number | null;
    fixedGripOnly: boolean | null;
  };
  trails: {
    totalKm: number | null;
    beginnerKm: number | null;
    intermediateKm: number | null;
    advancedKm: number | null;
  };
  skiableAcres: number | null;
  website: string | null;
  url: string | null;
  trail_map_url: string | null;
  adult_pass_price?: number | null;
  child_pass_price?: number | null;
}

export interface SearchFilters {
  state?: string;
  minElevation?: number;
  maxElevation?: number;
  minLifts?: number;
  minSlopeKm?: number; // Filter by minimum total slope kilometers
  minSkiableAcres?: number;
  fixedGripOnly?: boolean; // Filter for resorts with only fixed-grip chairlifts
}

export interface LiftStats {
  resortId: string;
  liftName: string;
  type: 'chairlift' | 'gondola' | 'surface' | 'funicular';
  capacity: number; // people per hour
  length: number; // feet
  verticalRise: number; // feet
  speed: number; // feet per minute
}

export interface TrailStats {
  resortId: string;
  trailName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  length: number; // feet
  verticalDrop: number; // feet
  averageGrade: number; // percentage;
}