# Ski Resort Conditions API Integration Guide

## 🎿 Current Status

Your app is now configured to use the **Ski Resort Conditions API** from RapidAPI, but you need to subscribe to the API first.

## ⚡ Quick Setup Steps

### Step 1: Subscribe to the API
1. Go to [Ski Resort Conditions API on RapidAPI](https://rapidapi.com/ski-resort-conditions/api/ski-resort-conditions)
2. Click **"Subscribe to Test"** or choose a pricing plan
3. Most RapidAPI services offer a free tier with limited requests

### Step 2: Verify Your Subscription
Once subscribed, test the API in your RapidAPI dashboard or run:
```bash
curl -H "X-RapidAPI-Key: 3dc6c1d1fcmshb082b065cac2ddfp159c04jsn1d3e546640a2" \
     -H "X-RapidAPI-Host: ski-resort-conditions.p.rapidapi.com" \
     "https://ski-resort-conditions.p.rapidapi.com/get_snow_report"
```

### Step 3: Your App is Ready!
No code changes needed - your app will automatically:
- ✅ Try to load real ski resort data from the API
- ✅ Fall back to sample data if the API is unavailable
- ✅ Show clear messages about which data source is being used

## 🔧 Current Configuration

Your app is configured with:
- **API Host**: `ski-resort-conditions.p.rapidapi.com`
- **Your API Key**: `3dc6c1d1fcmshb082b065cac2ddfp159c04jsn1d3e546640a2`
- **Endpoints**:
  - Get all resorts: `/get_snow_report`
  - Get resort by ID: `/get_snow_report?resort_id={id}`
  - Search by state: `/get_snow_report_by_state?state={state}`
  - Get states: `/get_states`
  - Get resort IDs: `/get_resort_ids`

## 🎯 What Happens Now

### Before Subscription
- ❌ API calls return "You are not subscribed to this API"
- ✅ App falls back to 8 sample ski resorts (including Killington, Vail, Aspen, etc.)
- ✅ All features work with sample data
- 📝 Console shows "API subscription required. Using fallback data."

### After Subscription
- ✅ App loads real ski resort data from the API
- ✅ Access to hundreds of real ski resorts
- ✅ Real-time snow conditions and weather data
- ✅ Up-to-date lift status and trail information

## 📊 Expected API Data

Based on the API name, you'll likely get data including:
- Snow conditions and depth
- Weather information
- Lift status
- Trail conditions
- Resort details and contact info
- Current season information

## 🛠 Customization Options

If you want to modify the behavior, you can edit `src/config/api.ts`:

```typescript
// To temporarily disable API and use sample data
USE_FALLBACK_DATA: true

// To enable API calls (current setting)
USE_FALLBACK_DATA: false
```

## 🔍 Testing Your Setup

1. **Check browser console** for API status messages
2. **Verify data source** - console will show whether using API or fallback data
3. **Test search functionality** - should work with either data source
4. **Monitor network tab** in browser dev tools to see API calls

## 💡 Troubleshooting

### "You are not subscribed to this API"
- Subscribe to the API on RapidAPI
- Check that your API key is correct
- Verify the API host in your headers

### API calls failing
- Check your internet connection
- Verify RapidAPI service status
- App will automatically fall back to sample data

### No data showing
- Check browser console for error messages
- Verify the API response format matches expected structure
- Sample data should always be available as backup

## 🚀 Next Steps

1. **Subscribe to the API** on RapidAPI (usually free tier available)
2. **Test the integration** - your app should automatically work with real data
3. **Customize data mapping** if needed (in `src/services/skiResortAPI.ts`)
4. **Add more features** using additional API endpoints

Your app is ready to work with either sample data or real API data seamlessly!