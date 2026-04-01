import { City } from '@/types';

export const cities: City[] = [
  { code: 'JFK', name: 'New York', country: 'United States', flagEmoji: '🇺🇸', icon: '🗽', latitude: 40.6413, longitude: -73.7781 },
  { code: 'SFO', name: 'San Francisco', country: 'United States', flagEmoji: '🇺🇸', icon: '🌉', latitude: 37.6213, longitude: -122.3790 },
  { code: 'LAX', name: 'Los Angeles', country: 'United States', flagEmoji: '🇺🇸', icon: '🎬', latitude: 33.9416, longitude: -118.4085 },
  { code: 'ORD', name: 'Chicago', country: 'United States', flagEmoji: '🇺🇸', icon: '🌆', latitude: 41.9742, longitude: -87.9073 },
  { code: 'MIA', name: 'Miami', country: 'United States', flagEmoji: '🇺🇸', icon: '🏖️', latitude: 25.7959, longitude: -80.2870 },
  { code: 'HNL', name: 'Honolulu', country: 'United States', flagEmoji: '🇺🇸', icon: '🌺', latitude: 21.3187, longitude: -157.9225 },
  { code: 'LHR', name: 'London', country: 'United Kingdom', flagEmoji: '🇬🇧', icon: '🎡', latitude: 51.4700, longitude: -0.4543 },
  { code: 'CDG', name: 'Paris', country: 'France', flagEmoji: '🇫🇷', icon: '🗼', latitude: 49.0097, longitude: 2.5479 },
  { code: 'FCO', name: 'Rome', country: 'Italy', flagEmoji: '🇮🇹', icon: '🏛️', latitude: 41.8003, longitude: 12.2389 },
  { code: 'BCN', name: 'Barcelona', country: 'Spain', flagEmoji: '🇪🇸', icon: '⛪', latitude: 41.2974, longitude: 2.0833 },
  { code: 'AMS', name: 'Amsterdam', country: 'Netherlands', flagEmoji: '🇳🇱', icon: '🌷', latitude: 52.3105, longitude: 4.7683 },
  { code: 'FRA', name: 'Frankfurt', country: 'Germany', flagEmoji: '🇩🇪', icon: '🏰', latitude: 50.0379, longitude: 8.5622 },
  { code: 'IST', name: 'Istanbul', country: 'Turkey', flagEmoji: '🇹🇷', icon: '🕌', latitude: 41.2753, longitude: 28.7519 },
  { code: 'DXB', name: 'Dubai', country: 'UAE', flagEmoji: '🇦🇪', icon: '🏙️', latitude: 25.2532, longitude: 55.3657 },
  { code: 'NRT', name: 'Tokyo', country: 'Japan', flagEmoji: '🇯🇵', icon: '⛩️', latitude: 35.7647, longitude: 140.3864 },
  { code: 'ICN', name: 'Seoul', country: 'South Korea', flagEmoji: '🇰🇷', icon: '🎎', latitude: 37.4602, longitude: 126.4407 },
  { code: 'PEK', name: 'Beijing', country: 'China', flagEmoji: '🇨🇳', icon: '🏯', latitude: 40.0799, longitude: 116.6031 },
  { code: 'SIN', name: 'Singapore', country: 'Singapore', flagEmoji: '🇸🇬', icon: '🦁', latitude: 1.3644, longitude: 103.9915 },
  { code: 'BKK', name: 'Bangkok', country: 'Thailand', flagEmoji: '🇹🇭', icon: '🛕', latitude: 13.6900, longitude: 100.7501 },
  { code: 'SYD', name: 'Sydney', country: 'Australia', flagEmoji: '🇦🇺', icon: '🐨', latitude: -33.9461, longitude: 151.1772 },
  { code: 'AKL', name: 'Auckland', country: 'New Zealand', flagEmoji: '🇳🇿', icon: '🥝', latitude: -37.0082, longitude: 174.7850 },
  { code: 'GRU', name: 'São Paulo', country: 'Brazil', flagEmoji: '🇧🇷', icon: '🎭', latitude: -23.4356, longitude: -46.4731 },
  { code: 'EZE', name: 'Buenos Aires', country: 'Argentina', flagEmoji: '🇦🇷', icon: '💃', latitude: -34.8222, longitude: -58.5358 },
  { code: 'MEX', name: 'Mexico City', country: 'Mexico', flagEmoji: '🇲🇽', icon: '🌮', latitude: 19.4361, longitude: -99.0719 },
  { code: 'CPT', name: 'Cape Town', country: 'South Africa', flagEmoji: '🇿🇦', icon: '🦁', latitude: -33.9715, longitude: 18.6021 },
  { code: 'CAI', name: 'Cairo', country: 'Egypt', flagEmoji: '🇪🇬', icon: '🏜️', latitude: 30.1219, longitude: 31.4056 },
  { code: 'DEL', name: 'Delhi', country: 'India', flagEmoji: '🇮🇳', icon: '🕌', latitude: 28.5562, longitude: 77.1000 },
  { code: 'HKG', name: 'Hong Kong', country: 'China', flagEmoji: '🇭🇰', icon: '🏮', latitude: 22.3080, longitude: 113.9185 },
  { code: 'YVR', name: 'Vancouver', country: 'Canada', flagEmoji: '🇨🇦', icon: '🍁', latitude: 49.1967, longitude: -123.1815 },
  { code: 'LIS', name: 'Lisbon', country: 'Portugal', flagEmoji: '🇵🇹', icon: '🚃', latitude: 38.7756, longitude: -9.1354 },
  { code: 'ATH', name: 'Athens', country: 'Greece', flagEmoji: '🇬🇷', icon: '🏛️', latitude: 37.9364, longitude: 23.9445 },
  { code: 'RKV', name: 'Reykjavik', country: 'Iceland', flagEmoji: '🇮🇸', icon: '🌋', latitude: 64.1300, longitude: -21.9408 },
  { code: 'MLE', name: 'Malé', country: 'Maldives', flagEmoji: '🇲🇻', icon: '🏝️', latitude: 4.1918, longitude: 73.5290 },
];

export function getCityByCode(code: string): City | undefined {
  return cities.find(c => c.code === code);
}
