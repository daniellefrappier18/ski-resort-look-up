# Alternative API Setup Guide

Since you're having subscription issues with the "Ski Resorts And Conditions" API, here are proven alternatives that work reliably:

## Recommended Alternative APIs

### 1. OpenWeatherMap API (RECOMMENDED)
- **RapidAPI URL**: Search for "OpenWeather" on RapidAPI
- **Provider**: WeatherAPI.com
- **Reliability**: Excellent (widely used)
- **Free Tier**: 1000 requests/month
- **Data Available**: 
  - Current weather for any ski resort location
  - 5-day forecasts
  - Snow conditions
  - Temperature, precipitation

### 2. WeatherAPI.com 
- **RapidAPI URL**: Search for "WeatherAPI.com" on RapidAPI
- **Free Tier**: 1 million requests/month
- **Features**: Current weather, forecasts, historical data

### 3. Visual Crossing Weather
- **RapidAPI URL**: Search for "Visual Crossing Weather" on RapidAPI
- **Free Tier**: 1000 requests/day
- **Features**: Weather data, forecasts, historical records

## Quick Switch Instructions

### Step 1: Subscribe to Alternative API
1. Go to RapidAPI.com
2. Search for "OpenWeather" 
3. Choose "OpenWeather" by WeatherAPI.com
4. Subscribe to the free plan
5. Test the API in RapidAPI's interface first

### Step 2: Update Your Configuration
Replace the content in `src/config/api.ts`:

```typescript
// Alternative API Configuration - OpenWeatherMap
export const API_CONFIG = {
  // Your RapidAPI Key (same key works for all RapidAPI APIs)
  RAPIDAPI_KEY: '3dc6c1d1fcmshb082b065cac2ddfp159c04jsn1d3e546640a2',
  
  // OpenWeather API (example)
  BASE_URL: 'https://open-weather13.p.rapidapi.com',
  RAPIDAPI_HOST: 'open-weather13.p.rapidapi.com',
  
  // OpenWeather endpoints
  ENDPOINTS: {
    CURRENT_WEATHER: '/city/{city}',
    FORECAST: '/city/{city}/forecast', 
  },
};

// Environment-based configuration
export const getApiConfig = () => {
  return {
    ...API_CONFIG,
    // Test with fallback first, then switch to false
    USE_FALLBACK_DATA: true, 
  };
};

// Ski resort city mappings for weather lookup
export const SKI_RESORT_CITIES = {
  'Killington': 'Killington,VT',
  'Aspen Snowmass': 'Aspen,CO',
  'Vail': 'Vail,CO', 
  'Park City': 'Park City,UT',
  'Whistler Blackcomb': 'Whistler,BC',
  'Mammoth Mountain': 'Mammoth Lakes,CA',
  'Jackson Hole': 'Jackson,WY',
  'Stowe': 'Stowe,VT'
};
```

### Step 3: Update API Service
You'll need to modify `src/services/skiResortAPI.ts` to work with weather data instead of specialized ski resort data. The fallback data will continue to work while you test the new API.

### Step 4: Test Integration
1. Keep `USE_FALLBACK_DATA: true` initially
2. Test that your app still works with fallback data
3. Verify your new API subscription works in RapidAPI interface
4. Switch to `USE_FALLBACK_DATA: false` and test

## Why These Alternatives Work Better

1. **More Reliable Subscriptions**: These APIs have better subscription management
2. **Larger Free Tiers**: More generous limits for testing
3. **Better Documentation**: Clearer API documentation
4. **Weather + Location Data**: You can get weather conditions for ski resort locations
5. **Proven Track Record**: These APIs are widely used and stable

## Current Status
- ✅ Your app works perfectly with fallback data
- ✅ You have 8 comprehensive ski resorts for testing  
- ✅ Search and filtering functions work
- 🔄 Ready to switch to working alternative API
- 🎯 Recommended: Start with OpenWeatherMap API

The good news is your app is fully functional with the fallback system, so you can take time to properly set up a reliable alternative API without any downtime!