// API Configuration
// Update these values with the actual RapidAPI endpoint details

export const API_CONFIG = {
  // Your RapidAPI Key
  RAPIDAPI_KEY: '3dc6c1d1fcmshb082b065cac2ddfp159c04jsn1d3e546640a2',
  
  // Ski Resorts And Conditions API from RapidAPI (correct URL from screenshot)
  BASE_URL: 'https://ski-resorts-and-conditions.p.rapidapi.com',
  
  // RapidAPI Host for Ski Resorts And Conditions API
  RAPIDAPI_HOST: 'ski-resorts-and-conditions.p.rapidapi.com',
  
  // Endpoints from the Ski Resorts And Conditions API
  ENDPOINTS: {
    ALL_RESORTS: '/',           // Index endpoint to get all resorts
    SINGLE_RESORT: '/resort',   // Resort View endpoint
    SEARCH_RESORTS: '/resorts', // Resorts endpoint
    STATES: '/states',
    RESORT_IDS: '/resort_ids',
  },
};

// Environment-based configuration
export const getApiConfig = () => {
  return {
    ...API_CONFIG,
    // Now using the real Ski Resort Conditions API from RapidAPI
    USE_FALLBACK_DATA: false, // Set to true to use fallback data instead of real API
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