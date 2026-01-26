# 🗺️ Geocoding Troubleshooting Guide

## Current Issue
The geocoding feature is returning incorrect coordinates for business addresses.

## What We Fixed

### 1. Enhanced Server-Side Logging
The geocoding endpoint now logs:
- ✅ Incoming address requests
- ✅ Full address string being geocoded
- ✅ Google Maps API response status
- ✅ Success/error details
- ✅ Fallback to default coordinates

### 2. Added Region Bias for South Africa
The API now includes `&region=za` parameter to prioritize South African results.

### 3. Better Error Handling
- REQUEST_DENIED errors now properly identified
- Helpful error messages about API configuration
- Console logs for debugging

### 4. Enhanced Frontend Display
- Shows the formatted address returned from Google Maps
- Users can verify the location before saving
- Helpful placeholders and tips for address entry

## How to Debug

### Step 1: Check Browser Console
1. Open Developer Tools (F12)
2. Go to the Console tab
3. Click "Get Coordinates" button
4. Look for these log messages:

```
🗺️ Frontend: Geocoding request: {address: "...", city: "..."}
📡 Frontend: Geocoding response status: 200
✅ Frontend: Geocoding data received: {...}
```

### Step 2: Check Server Logs
In your Supabase Dashboard:
1. Go to Edge Functions
2. Click on "make-server-175b2872"
3. View logs and look for:

```
🗺️ Geocoding request received: {...}
📍 Full address to geocode: ...
🌐 Calling Google Maps API...
📊 Google Maps API response status: OK
✅ Geocoding successful: {...}
```

### Step 3: Common Issues & Solutions

#### Issue: "REQUEST_DENIED" Error
**Cause**: Geocoding API not enabled in Google Cloud Console

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Library"
4. Search for "Geocoding API"
5. Click "Enable"

#### Issue: Wrong Coordinates Returned
**Cause**: Address not specific enough or ambiguous

**Solution**:
- Use full street addresses instead of just building names
- Example:
  - ❌ Bad: "fourways mall"
  - ✅ Good: "Fourways Mall, Montecasino Boulevard, Fourways"
  - ✅ Better: "Fourways Mall, Shop 123, Montecasino Boulevard"

#### Issue: Falls Back to Default City Coordinates
**Cause**: Google Maps returns ZERO_RESULTS

**Solution**:
- Try different address formats
- Include suburb name: "Fourways, Sandton"
- Include postal code if known
- Check for typos

### Step 4: Test with Different Addresses

Try these known locations to verify the system works:

```
✅ Test 1: Nelson Mandela Square
Address: "Nelson Mandela Square"
City: "Sandton"
Expected: ~-26.107, 28.056

✅ Test 2: V&A Waterfront
Address: "V&A Waterfront"
City: "Cape Town"
Expected: ~-33.906, 18.421

✅ Test 3: Specific Restaurant
Address: "The Palms Montecasino"
City: "Fourways"
Expected: Accurate coordinates
```

## Address Entry Best Practices

### Do's ✅
- Include landmark names: "Montecasino, Fourways"
- Use full street names: "Montecasino Boulevard"
- Include suburb: "Sandton, Johannesburg"
- Be specific: "Shop 123, Fourways Mall"

### Don'ts ❌
- Don't use abbreviations: "FW Mall"
- Don't use informal names: "that mall by the casino"
- Don't leave out city name
- Don't use only building numbers

## API Key Checklist

Your `GOOGLE_MAPS_API_KEY` must have these APIs enabled:
- ✅ Geocoding API (for address → coordinates)
- ✅ Maps JavaScript API (if showing maps)
- ⚠️ Check API usage limits (free tier = 40,000 requests/month)

## Testing the API Directly

You can test the Google Maps Geocoding API directly:

```bash
# Replace YOUR_API_KEY with your actual key
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Fourways%20Mall,%20Sandton,%20South%20Africa&region=za&key=YOUR_API_KEY"
```

Expected successful response:
```json
{
  "status": "OK",
  "results": [
    {
      "formatted_address": "Fourways Mall, ...",
      "geometry": {
        "location": {
          "lat": -26.0...,
          "lng": 28.0...
        }
      }
    }
  ]
}
```

## Still Having Issues?

### Check These:
1. ✅ API key is set in Supabase secrets: `GOOGLE_MAPS_API_KEY`
2. ✅ Geocoding API is enabled in Google Cloud Console
3. ✅ API key has no domain restrictions blocking server requests
4. ✅ You haven't exceeded API quota limits
5. ✅ Address and city fields are filled in before clicking "Get Coordinates"

### If Coordinates Are Wrong:
1. Check the "📍 Found Location" displayed in the UI
2. If it shows the wrong place, try a more specific address
3. If it's close but not exact, you can manually adjust later
4. Use Google Maps to find the exact address format that works

## Current Coordinates Issue

The coordinates showing (-26.018854, 28.006422) are:
- Not the default Sandton coordinates (-26.1076, 28.0567)
- Not from browser geolocation (only used in customer app)
- Likely returned from Google Maps API

**Most likely cause**: The address "fourways mall" alone is too vague, and Google Maps is returning a different location.

**Solution**: Try "Fourways Mall, Montecasino Boulevard, Sandton" or "Fourways Mall, Sandton, South Africa"
