export interface City {
  code: string;
  name: string;
  country: string;
  flagEmoji: string;
  icon: string;
  latitude: number;
  longitude: number;
}

export interface Route {
  from: string;
  to: string;
  durationMinutes: number;
  distanceMiles: number;
  funFact: string;
}

export interface FlightLog {
  id: string;
  departureCity: string;
  arrivalCity: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string | null;
  completed: boolean;
  stampEarned: boolean;
}

export type PilotRank = 'Cadet' | 'Co-Pilot' | 'Captain' | 'Commander' | 'Sky Legend';

export interface UserProfile {
  pilotName: string;
  rank: PilotRank;
  totalFocusMinutes: number;
  flightsCompleted: number;
  citiesVisited: string[];
  parentPIN: string;
}

export interface ActiveFlight {
  id: string;
  route: Route;
  fromCity: City;
  toCity: City;
  startedAt: string;
  durationMinutes: number;
  gate: string;
  seat: string;
}
