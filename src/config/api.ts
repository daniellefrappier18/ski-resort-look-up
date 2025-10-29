// API Configuration
// Update these values with the actual RapidAPI endpoint details

export const API_CONFIG = {
  // Your RapidAPI Key
  RAPIDAPI_KEY: '3dc6c1d1fcmshb082b065cac2ddfp159c04jsn1d3e546640a2',
  
  // Base URL - replace with the actual ski resort API endpoint
  // Example: https://ski-resorts-and-conditions.p.rapidapi.com
  BASE_URL: 'https://api.skiapi.com/v1',
  
  // RapidAPI Host - replace with the actual host from your RapidAPI dashboard
  // Example: ski-resorts-and-conditions.p.rapidapi.com
  RAPIDAPI_HOST: 'rapidapi.com',
  
  // Endpoints - these should match your actual API structure
  ENDPOINTS: {
    ALL_RESORTS: '/resorts',
    SINGLE_RESORT: '/resort', // Will be used as /resort/{id}
    SEARCH_RESORTS: '/resorts/search',
  },
};

// Environment-based configuration
export const getApiConfig = () => {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  return {
    ...API_CONFIG,
    // In development, you might want to use mock data or different endpoints
    USE_FALLBACK_DATA: isDevelopment, // Set to true to always use fallback data during development
  };
};

/* 
  To update for your specific RapidAPI endpoint:
  
  1. Go to your RapidAPI dashboard
  2. Find your ski resort API subscription
  3. Copy the correct values for:
     - BASE_URL (the main API endpoint)
     - RAPIDAPI_HOST (usually shown in the code examples)
     - Endpoint paths (check the API documentation)
  
  4. Update the values above
  
  Common ski resort APIs on RapidAPI might have endpoints like:
  - /resorts (get all resorts)
  - /resort/{id} (get specific resort)
  - /search?query={term} (search resorts)
  - /resorts?state={state} (filter by state)
*/