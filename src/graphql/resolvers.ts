import { usaSkiResorts } from '../data/load-ski-resorts';
import type { SkiResort } from '../types/ski-resort';

interface ResortFilters {
  state?: string;
  minElevation?: number;
  maxElevation?: number;
  minLifts?: number;
  minTrails?: number;
  minSkiableAcres?: number;
  fixedGripOnly?: boolean;
}

export const resolvers = {
  Query: {
    skiResorts: (_: unknown, { filters, search }: { filters?: ResortFilters; search?: string }): SkiResort[] => {
      let results = usaSkiResorts;

      // Apply search filter first
      if (search) {
        const searchTerm = search.toLowerCase();
        results = results.filter(resort =>
          resort.name.toLowerCase().includes(searchTerm) ||
          resort.location.state?.toLowerCase().includes(searchTerm) ||
          (resort.location.city && resort.location.city.toLowerCase().includes(searchTerm))
        );
      }

      if (filters) {
        results = results.filter(resort => {
          // Filter by state
          if (filters.state && resort.location.state?.toLowerCase() !== filters.state.toLowerCase()) {
            return false;
          }

          // Filter by elevation
          if (filters.minElevation && (!resort.elevation.summit || resort.elevation.summit < filters.minElevation)) {
            return false;
          }
          if (filters.maxElevation && (!resort.elevation.summit || resort.elevation.summit > filters.maxElevation)) {
            return false;
          }

          // Filter by lifts
          if (filters.minLifts && (!resort.lifts.total || resort.lifts.total < filters.minLifts)) {
            return false;
          }

          // Filter by trails
          if (filters.minTrails && (!resort.trails.total || resort.trails.total < filters.minTrails)) {
            return false;
          }

          // Filter by skiable acres
          if (filters.minSkiableAcres && (!resort.skiableAcres || resort.skiableAcres < filters.minSkiableAcres)) {
            return false;
          }

          // Filter by fixed-grip only
          if (filters.fixedGripOnly && !resort.lifts.fixedGripOnly) {
            return false;
          }

          return true;
        });
      }

      return results;
    },

    // Get single resort by ID
    skiResort: (_: unknown, { id }: { id: string }): SkiResort | undefined => {
      return usaSkiResorts.find(resort => resort.id === id);
    },

    // Search resorts by name, state, or city
    searchResorts: (_: unknown, { query }: { query: string }): SkiResort[] => {
      const searchTerm = query.toLowerCase();
      return usaSkiResorts.filter(resort =>
        resort.name.toLowerCase().includes(searchTerm) ||
        resort.location.state?.toLowerCase().includes(searchTerm) ||
        (resort.location.city && resort.location.city.toLowerCase().includes(searchTerm))
      );
    },

    // Get resorts by state
    resortsByState: (_: unknown, { state }: { state: string }): SkiResort[] => {
      return usaSkiResorts.filter(resort => 
        resort.location.state?.toLowerCase() === state.toLowerCase()
      );
    },

    // Get only fixed-grip resorts
    fixedGripResorts: (): SkiResort[] => {
      return usaSkiResorts.filter(resort => resort.lifts.fixedGripOnly);
    },

    // Get all unique states for dropdown
    states: (): string[] => {
      const uniqueStates = [...new Set(usaSkiResorts.map(resort => resort.location.state).filter(Boolean))] as string[];
      return uniqueStates.sort();
    }
  }
};