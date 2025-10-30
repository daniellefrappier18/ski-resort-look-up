import type { SkiResort } from '../types/ski-resort';
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
      resort.location.state.toLowerCase() === state.toLowerCase()
    );
  }

  // Search resorts
  static async searchResorts(
    searchTerm: string, 
    filters: { state?: string; minElevation?: number; maxElevation?: number } = {}
  ): Promise<SkiResort[]> {
    console.log(`🔍 Searching resorts with term: "${searchTerm}"`);
    const allResorts = await this.getAllResorts();
    
    return allResorts.filter(resort => {
      const matchesSearch = !searchTerm || 
        resort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resort.location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resort.location.state.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = !filters.state || 
        resort.location.state.toLowerCase() === filters.state.toLowerCase();

      const matchesMinElevation = !filters.minElevation || 
        resort.elevation.summit >= filters.minElevation;

      const matchesMaxElevation = !filters.maxElevation || 
        resort.elevation.summit <= filters.maxElevation;

      return matchesSearch && matchesState && matchesMinElevation && matchesMaxElevation;
    });
  }
}

export default SkiResortAPI;
