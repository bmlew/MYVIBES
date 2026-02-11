import { format, subDays, subMonths } from 'date-fns';

// Mock data generator utilities
const generateTimeSeriesData = (days: number, min: number, max: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return {
      date: date.toISOString(),
      revenue: Math.floor(Math.random() * (max - min) + min),
      bookings: Math.floor(Math.random() * 50) + 10,
      views: Math.floor(Math.random() * 500) + 100
    };
  });
};

export const getAnalytics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return generateTimeSeriesData(14, 2000, 8000);
};

export const getPopularTimes = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const hours = ['12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'];
  return hours.map(hour => ({
    hour,
    bookings: Math.floor(Math.random() * 50) + 5
  }));
};

export const getCuisineStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [
    { name: 'Burgers', orders: 450, percentage: 35 },
    { name: 'Pizza', orders: 320, percentage: 25 },
    { name: 'Salads', orders: 190, percentage: 15 },
    { name: 'Seafood', orders: 150, percentage: 12 },
    { name: 'Steaks', orders: 100, percentage: 8 },
    { name: 'Desserts', orders: 65, percentage: 5 }
  ];
};

export const getDemographics = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [
    { ageGroup: '18-24', count: 450, percentage: 25 },
    { ageGroup: '25-34', count: 850, percentage: 48 },
    { ageGroup: '35-44', count: 320, percentage: 18 },
    { ageGroup: '45-54', count: 120, percentage: 7 },
    { ageGroup: '55+', count: 40, percentage: 2 }
  ];
};

export const getRatingTrends = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return Array.from({ length: 6 }).map((_, i) => ({
    month: format(subMonths(new Date(), 5 - i), 'MMM'),
    rating: 3.5 + Math.random() * 1.5
  }));
};
