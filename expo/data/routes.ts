import { Route } from '@/types';

export const routes: Route[] = [
  { from: 'JFK', to: 'SFO', durationMinutes: 330, distanceMiles: 2586, funFact: 'San Francisco\'s Golden Gate Bridge is painted "International Orange" so it\'s visible in fog!' },
  { from: 'JFK', to: 'LHR', durationMinutes: 420, distanceMiles: 3459, funFact: 'London has over 170 museums — more than any other city on Earth!' },
  { from: 'JFK', to: 'CDG', durationMinutes: 450, distanceMiles: 3635, funFact: 'The Eiffel Tower grows about 6 inches taller in summer because heat expands the metal!' },
  { from: 'JFK', to: 'MIA', durationMinutes: 180, distanceMiles: 1089, funFact: 'Miami is the only major US city founded by a woman — Julia Tuttle!' },
  { from: 'LHR', to: 'CDG', durationMinutes: 75, distanceMiles: 214, funFact: 'Paris has a street that is only 6 feet wide — the narrowest in the city!' },
  { from: 'LHR', to: 'FCO', durationMinutes: 150, distanceMiles: 890, funFact: 'Ancient Romans used to eat lying down at fancy dinner parties!' },
  { from: 'LHR', to: 'IST', durationMinutes: 240, distanceMiles: 1560, funFact: 'Istanbul is the only city in the world that sits on two continents!' },
  { from: 'LHR', to: 'JFK', durationMinutes: 480, distanceMiles: 3459, funFact: 'The Statue of Liberty was a gift from France and arrived in 350 pieces!' },
  { from: 'LAX', to: 'HNL', durationMinutes: 330, distanceMiles: 2556, funFact: 'Hawaii is the only US state that grows coffee commercially!' },
  { from: 'LAX', to: 'NRT', durationMinutes: 660, distanceMiles: 5451, funFact: 'In Tokyo, you can find vending machines that sell everything from soup to umbrellas!' },
  { from: 'LAX', to: 'SYD', durationMinutes: 900, distanceMiles: 7488, funFact: 'The Sydney Opera House uses over 1 million tiles on its roof!' },
  { from: 'NRT', to: 'SYD', durationMinutes: 570, distanceMiles: 4863, funFact: 'Australia has more kangaroos than people!' },
  { from: 'NRT', to: 'SIN', durationMinutes: 420, distanceMiles: 3312, funFact: 'Singapore\'s Changi Airport has a butterfly garden with over 1,000 butterflies!' },
  { from: 'NRT', to: 'ICN', durationMinutes: 150, distanceMiles: 758, funFact: 'South Korea has the fastest average internet speed in the world!' },
  { from: 'DXB', to: 'SIN', durationMinutes: 420, distanceMiles: 3657, funFact: 'Singapore is one of only three surviving city-states in the world!' },
  { from: 'DXB', to: 'LHR', durationMinutes: 420, distanceMiles: 3400, funFact: 'Dubai\'s Burj Khalifa is so tall, you can watch the sunset twice — once from the bottom and again from the top!' },
  { from: 'CDG', to: 'BCN', durationMinutes: 120, distanceMiles: 530, funFact: 'Barcelona\'s famous Sagrada Família church has been under construction since 1882!' },
  { from: 'CDG', to: 'FCO', durationMinutes: 120, distanceMiles: 687, funFact: 'Rome has a museum entirely dedicated to pasta!' },
  { from: 'CDG', to: 'AMS', durationMinutes: 75, distanceMiles: 264, funFact: 'Amsterdam has more bicycles than people — about 881,000 bikes!' },
  { from: 'SFO', to: 'HNL', durationMinutes: 330, distanceMiles: 2398, funFact: 'Hawaii\'s Mount Mauna Kea is technically taller than Mount Everest when measured from its base!' },
  { from: 'ORD', to: 'LHR', durationMinutes: 480, distanceMiles: 3941, funFact: 'London\'s Big Ben is actually the name of the bell, not the clock tower!' },
  { from: 'ORD', to: 'JFK', durationMinutes: 150, distanceMiles: 740, funFact: 'New York City\'s Central Park is bigger than the country of Monaco!' },
  { from: 'MIA', to: 'GRU', durationMinutes: 510, distanceMiles: 4314, funFact: 'São Paulo has more Japanese restaurants than any city outside Japan!' },
  { from: 'MIA', to: 'MEX', durationMinutes: 210, distanceMiles: 1280, funFact: 'Mexico City was built on top of an ancient Aztec lake city called Tenochtitlan!' },
  { from: 'GRU', to: 'EZE', durationMinutes: 170, distanceMiles: 1060, funFact: 'Buenos Aires has the widest avenue in the world — it has 16 lanes!' },
  { from: 'SIN', to: 'BKK', durationMinutes: 150, distanceMiles: 883, funFact: 'Bangkok\'s full ceremonial name is 168 letters long — the longest city name in the world!' },
  { from: 'SIN', to: 'MLE', durationMinutes: 270, distanceMiles: 1960, funFact: 'The Maldives is the flattest country on Earth — its highest point is only 8 feet above sea level!' },
  { from: 'HKG', to: 'NRT', durationMinutes: 240, distanceMiles: 1791, funFact: 'Tokyo\'s Tsukiji was the largest fish market in the world!' },
  { from: 'HKG', to: 'SIN', durationMinutes: 240, distanceMiles: 1598, funFact: 'Singapore has a building shaped like a durian fruit!' },
  { from: 'DEL', to: 'DXB', durationMinutes: 210, distanceMiles: 1367, funFact: 'Dubai\'s indoor ski resort has real penguins you can meet!' },
  { from: 'DEL', to: 'BKK', durationMinutes: 240, distanceMiles: 1807, funFact: 'Bangkok has floating markets where vendors sell food from boats!' },
  { from: 'CAI', to: 'IST', durationMinutes: 180, distanceMiles: 768, funFact: 'The Great Pyramid of Giza was the tallest building in the world for nearly 4,000 years!' },
  { from: 'CAI', to: 'DXB', durationMinutes: 240, distanceMiles: 1498, funFact: 'Dubai\'s Palm Islands are so big they can be seen from space!' },
  { from: 'YVR', to: 'NRT', durationMinutes: 600, distanceMiles: 4684, funFact: 'Vancouver is surrounded by mountains and ocean — you can ski and swim on the same day!' },
  { from: 'YVR', to: 'LAX', durationMinutes: 180, distanceMiles: 1084, funFact: 'Los Angeles has its own official dinosaur — the Augustynolophus!' },
  { from: 'LIS', to: 'LHR', durationMinutes: 150, distanceMiles: 985, funFact: 'Lisbon is older than Rome — it\'s one of the oldest cities in Western Europe!' },
  { from: 'ATH', to: 'CAI', durationMinutes: 180, distanceMiles: 768, funFact: 'Athens has been continuously inhabited for over 7,000 years!' },
  { from: 'RKV', to: 'LHR', durationMinutes: 180, distanceMiles: 1177, funFact: 'Iceland has no mosquitoes — it\'s one of the few places in the world without them!' },
  { from: 'AMS', to: 'BCN', durationMinutes: 140, distanceMiles: 754, funFact: 'Barcelona has a beach, but it didn\'t exist until 1992 — it was built for the Olympics!' },
  { from: 'FRA', to: 'IST', durationMinutes: 180, distanceMiles: 1160, funFact: 'Istanbul\'s Grand Bazaar has over 4,000 shops and is one of the oldest malls in the world!' },
  { from: 'PEK', to: 'ICN', durationMinutes: 120, distanceMiles: 594, funFact: 'The Great Wall of China is so long, it would stretch from New York to Los Angeles and back!' },
  { from: 'CPT', to: 'DXB', durationMinutes: 540, distanceMiles: 4480, funFact: 'Cape Town has penguins living on its beaches!' },
  { from: 'AKL', to: 'SYD', durationMinutes: 180, distanceMiles: 1340, funFact: 'New Zealand has more sheep than people — about 6 sheep for every person!' },
];

export function getRoutesForCity(cityCode: string): Route[] {
  return routes.filter(r => r.from === cityCode || r.to === cityCode);
}

export function findRoute(from: string, to: string): Route | undefined {
  return routes.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
}

export function getRandomRoutes(count: number): Route[] {
  const shuffled = [...routes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
