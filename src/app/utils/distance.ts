// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)}km away`;
}

// Venue locations in Sandton, Johannesburg area
export interface VenueLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

export const VENUE_LOCATIONS: VenueLocation[] = [
  {
    id: 'palms',
    name: 'The Palms',
    latitude: -26.107407,
    longitude: 28.056229,
    address: '123 Rivonia Road, Sandton',
  },
  {
    id: 'skybar',
    name: 'Skybar',
    latitude: -26.104533,
    longitude: 28.052826,
    address: '56 West Street, Sandton',
  },
  {
    id: 'delicious',
    name: 'Delicious',
    latitude: -26.109871,
    longitude: 28.058234,
    address: '89 Katherine Street, Sandton',
  },
  {
    id: 'italian',
    name: 'Italian Delights',
    latitude: -26.102356,
    longitude: 28.049127,
    address: '45 Maude Street, Sandton',
  },
  {
    id: 'herbstore',
    name: 'Herbstore',
    latitude: -26.111234,
    longitude: 28.061456,
    address: '12 Alice Lane, Sandton',
  },
];
