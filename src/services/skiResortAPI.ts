import type { SkiResort, SearchFilters } from '../types/ski-resort';
import { usaSkiResorts } from '../data/usa-ski-resorts';

// API service for ski resort data
export class SkiResortAPI {
  // Fetch all ski resorts
  static async getAllResorts(): Promise<SkiResort[]> {
    console.log('ℹ️ Using comprehensive USA ski resort dataset');
    return Promise.resolve(usaSkiResorts);
  }

  // Get resorts by state
  static async getResortsByState(state: string): Promise<SkiResort[]> {
    console.log(`🎿 Filtering resorts by state: ${state}`);
    const allResorts = await this.getAllResorts();
    return allResorts.filter(resort => 
      resort.location.state?.toLowerCase() === state.toLowerCase()
    );
  }

  // Search resorts with comprehensive filtering
  static async searchResorts(
    searchTerm: string, 
    filters: SearchFilters = {}
  ): Promise<SkiResort[]> {
    console.log(`🔍 Searching resorts with term: "${searchTerm}", filters:`, filters);
    const allResorts = await this.getAllResorts();
    
    return allResorts.filter(resort => {
      // Text search
      const matchesSearch = !searchTerm || 
        resort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resort.location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resort.location.state?.toLowerCase().includes(searchTerm.toLowerCase());

      // State filter
      const matchesState = !filters.state || 
        resort.location.state?.toLowerCase() === filters.state.toLowerCase();

      // Elevation filters
      const matchesMinElevation = !filters.minElevation || 
        (resort.elevation.summit !== null && resort.elevation.summit >= filters.minElevation);

      const matchesMaxElevation = !filters.maxElevation || 
        (resort.elevation.summit !== null && resort.elevation.summit <= filters.maxElevation);

      // Lift count filter
      const matchesMinLifts = !filters.minLifts || 
        (resort.lifts.total !== null && resort.lifts.total >= filters.minLifts);

      // Trail count filter
      const matchesMinTrails = !filters.minTrails || 
        (resort.trails.total !== null && resort.trails.total >= filters.minTrails);

      // Skiable acres filter
      const matchesMinSkiableAcres = !filters.minSkiableAcres || 
        (resort.skiableAcres !== null && resort.skiableAcres >= filters.minSkiableAcres);

      // Fixed-grip only filter
      const matchesFixedGripOnly = !filters.fixedGripOnly || 
        resort.lifts.fixedGripOnly === true;

      return matchesSearch && matchesState && matchesMinElevation && 
             matchesMaxElevation && matchesMinLifts && matchesMinTrails && 
             matchesMinSkiableAcres && matchesFixedGripOnly;
    });
  }
}

export default SkiResortAPI;
