# API Configuration Guide

This guide explains how to configure your ski resort app to use a real RapidAPI endpoint for ski resort data.

## Current Status

The app is currently set up to use a RapidAPI endpoint for ski resort data, but falls back to sample data if the API is unavailable. This ensures the app works even during development or if there are API issues.

## Configuring Your RapidAPI Endpoint

### Step 1: Update API Configuration

Edit `/src/config/api.ts` with your actual RapidAPI details:

```typescript
export const API_CONFIG = {
  // Your RapidAPI Key (already configured)
  RAPIDAPI_KEY: '3dc6c1d1fcmshb082b065cac2ddfp159c04jsn1d3e546640a2',
  
  // Replace with your actual RapidAPI endpoint
  BASE_URL: 'https://your-ski-api.p.rapidapi.com',
  
  // Replace with your actual RapidAPI host
  RAPIDAPI_HOST: 'your-ski-api.p.rapidapi.com',
  
  // Update these endpoint paths to match your API
  ENDPOINTS: {
    ALL_RESORTS: '/resorts',           // Get all resorts
    SINGLE_RESORT: '/resort',          // Get single resort (/{id} added automatically)
    SEARCH_RESORTS: '/resorts/search', // Search resorts
  },
};
```

### Step 2: Find Your RapidAPI Details

1. Go to [RapidAPI Hub](https://rapidapi.com/hub)
2. Find a ski resort/mountain data API (search for "ski", "mountain", or "resort")
3. Subscribe to an API plan
4. Go to the API's page and click "Code Snippets"
5. Copy the values for:
   - **Base URL**: Usually in format `https://api-name.p.rapidapi.com`
   - **Host**: Usually same as base URL without `https://`
   - **Endpoints**: Check the API documentation for available endpoints

### Step 3: Popular Ski Resort APIs on RapidAPI

Some potential APIs you could use (check RapidAPI for current availability):

- **Ski Resort Data APIs**: Search for "ski resort", "mountain data"
- **Weather APIs with Mountain Data**: For real-time conditions
- **Geographic APIs**: For location and elevation data

### Step 4: Update Data Mapping (if needed)

If your chosen API returns data in a different format, you may need to update the mapping function in `/src/services/skiResortAPI.ts`:

```typescript
private static mapApiDataToSkiResort(apiResort: Record<string, unknown>): SkiResort {
  // Update this function to map your API's data structure
  // to the SkiResort interface
}
```

### Step 5: Test the Integration

1. Update the configuration
2. Run `npm run dev`
3. Check the browser console for any API errors
4. The app will show sample data if the API fails

## Data Structure Expected

Your API should return data that can be mapped to this structure:

```typescript
interface SkiResort {
  id: string;
  name: string;
  location: {
    state: string;
    city?: string;
    coordinates?: { latitude: number; longitude: number };
  };
  elevation: {
    base: number;    // feet above sea level
    summit: number;  // feet above sea level  
    vertical: number; // vertical drop in feet
  };
  lifts: {
    total: number;
    chairlifts: number;
    surfaceLifts: number;
    gondolas?: number;
  };
  trails: {
    total: number;
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  skiableAcres: number;
  // ... additional optional fields
}
```

## Development vs Production

- **Development**: Set `USE_FALLBACK_DATA: true` in config to always use sample data
- **Production**: The app automatically tries the API first, falls back to sample data if needed

## Troubleshooting

### Common Issues:

1. **CORS Errors**: RapidAPI usually handles CORS, but check your browser console
2. **Authentication Errors**: Verify your RapidAPI key is correct
3. **Rate Limiting**: Check your RapidAPI plan limits
4. **Data Structure Mismatch**: Update the mapping function as needed

### Debugging:

1. Check browser console for error messages
2. Look for API response structure in Network tab
3. Verify the API endpoints are correct in RapidAPI dashboard
4. Test API calls directly using RapidAPI's test interface

## Sample API Call

The app makes calls like this:

```typescript
// Get all resorts
GET https://your-api.p.rapidapi.com/resorts
Headers:
  X-RapidAPI-Key: your-key
  X-RapidAPI-Host: your-api.p.rapidapi.com

// Get specific resort  
GET https://your-api.p.rapidapi.com/resort/killington-vt
```

Make sure your chosen API supports similar endpoints or update the service accordingly.