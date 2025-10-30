import type { SkiResort } from '../types/ski-resort';
import { scrapedSkiResorts } from '../data/scraped-ski-resorts';

// Convert all scraped resorts to proper SkiResort format with type assertion
export const enhancedSkiResorts: SkiResort[] = scrapedSkiResorts as SkiResort[];

// Enhanced API service using scraped data
export const getEnhancedResorts = (): SkiResort[] => {
  return enhancedSkiResorts;
};

export const searchEnhancedResorts = (query: string): SkiResort[] => {
  if (!query.trim()) {
    return enhancedSkiResorts;
  }
  
  const searchTerm = query.toLowerCase();
  
  return enhancedSkiResorts.filter(resort =>
    resort.name.toLowerCase().includes(searchTerm) ||
    resort.location.state.toLowerCase().includes(searchTerm) ||
    (resort.location.city && resort.location.city.toLowerCase().includes(searchTerm)) ||
    (resort.description && resort.description.toLowerCase().includes(searchTerm))
  );
};