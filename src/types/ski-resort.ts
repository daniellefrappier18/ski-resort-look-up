// Types for ski resort data structures

export interface SkiResort {
  id: string;
  name: string;
  location: {
    state: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  elevation: {
    base: number; // feet above sea level
    summit: number; // feet above sea level
    vertical: number; // vertical drop in feet
  };
  lifts: {
    total: number;
    chairlifts: number;
    surfaceLifts: number;
    gondolas?: number;
    funiculars?: number;
  };
  trails: {
    total: number;
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  skiableAcres: number;
  snowmaking: {
    percentage: number; // percentage of trails with snowmaking
    acres?: number;
  };
  seasonDates?: {
    opening?: string; // typical opening date
    closing?: string; // typical closing date
  };
  website?: string;
  phoneNumber?: string;
  description?: string;
  amenities?: string[];
  liftTicketPrice?: {
    adult: number;
    child?: number;
    senior?: number;
  };
}

export interface SearchFilters {
  state?: string;
  minElevation?: number;
  maxElevation?: number;
  minLifts?: number;
  minTrails?: number;
  minSkiableAcres?: number;
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
  averageGrade: number; // percentage
  hasSnowmaking: boolean;
}