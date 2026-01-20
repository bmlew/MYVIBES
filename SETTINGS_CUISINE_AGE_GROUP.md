# Quick Guide: Where to Set Cuisine & Age Group

## 📍 Location in Business Dashboard

**Navigation:** Click **"Settings"** in the left sidebar

## What You'll Find:

### In the "Business Information" Card:

1. **Business Name**
2. **Address** 
3. **City**
4. **GPS Coordinates**
5. **Phone / Email**
6. **Description**
7. **👉 CUISINE TYPES** (Restaurant only) - Need to add
8. **👉 AGE GROUP / ATMOSPHERE** - Need to add
9. **Average Price Per Person**

## To Add These Fields:

The fields need to be added to the Settings form in BusinessDashboard.tsx at line ~4664 (right after Description field).

### Code to Add:

```tsx
{/* Cuisine Types - For Restaurants */}
<div>
  <Label>Cuisine Types</Label>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
    {['Italian', 'Seafood', 'Steakhouse', 'Asian', 'Mexican', 'African', 'Fast Food', 'BBQ', 'Vegetarian'].map((cuisine) => (
      <button
        key={cuisine}
        type="button"
        onClick={() => {
          const current = settingsFormData.cuisine_types || [];
          const updated = current.includes(cuisine)
            ? current.filter(c => c !== cuisine)
            : [...current, cuisine];
          setSettingsFormData({ ...settingsFormData, cuisine_types: updated });
        }}
        className={`px-3 py-2 text-sm border rounded-lg transition-all ${
          (settingsFormData.cuisine_types || []).includes(cuisine)
            ? 'border-cyan-600 bg-cyan-600 text-white'
            : 'border-gray-300 hover:border-cyan-300'
        }`}
      >
        {cuisine}
      </button>
    ))}
  </div>
</div>

{/* Age Group */}
<div>
  <Label>Age Group / Atmosphere</Label>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
    {[
      { value: 'all-ages', label: '👨‍👩‍👧‍👦 All Ages', desc: 'Family friendly' },
      { value: 'family-with-pets', label: '🐕 Pet Friendly', desc: 'Dogs welcome' },
      { value: 'adults-18+', label: '🔞 Adults 18+', desc: 'Adult environment' },
      { value: 'adults-21+', label: '🍸 Adults 21+', desc: 'Bar/Lounge' }
    ].map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => setSettingsFormData({ ...settingsFormData, age_group: option.value })}
        className={`p-3 border-2 rounded-lg text-left transition-all ${
          settingsFormData.age_group === option.value
            ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
            : 'border-gray-200 hover:border-cyan-300'
        }`}
      >
        <div className="font-medium text-sm">{option.label}</div>
        <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
      </button>
    ))}
  </div>
</div>
```

## Current Status:

✅ Age group is already in BusinessRegistration (when creating new business)
✅ Age group is saved in settingsFormData state (line 219)
✅ Age group displays in VenueDetail for customers
❌ **MISSING:** UI fields in Settings to edit cuisine_types and age_group

## Next Step:

Add the code above to BusinessDashboard.tsx at line 4664 (right after the Description field).
