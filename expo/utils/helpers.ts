import { PilotRank } from '@/types';

export function getRankForMinutes(minutes: number): PilotRank {
  const hours = minutes / 60;
  if (hours >= 100) return 'Sky Legend';
  if (hours >= 50) return 'Commander';
  if (hours >= 20) return 'Captain';
  if (hours >= 5) return 'Co-Pilot';
  return 'Cadet';
}

export function getRankEmoji(rank: PilotRank): string {
  switch (rank) {
    case 'Sky Legend': return '🌟';
    case 'Commander': return '🎖️';
    case 'Captain': return '✈️';
    case 'Co-Pilot': return '🛫';
    case 'Cadet': return '🎓';
  }
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateGate(): string {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 6));
  const num = Math.floor(Math.random() * 30) + 1;
  return `${letter}${num}`;
}

export function generateSeat(): string {
  const row = Math.floor(Math.random() * 30) + 1;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seat = letters[Math.floor(Math.random() * letters.length)];
  const types = ['Window Seat', 'Middle Seat', 'Aisle Seat'];
  const type = seat === 'A' || seat === 'F' ? types[0] : seat === 'C' || seat === 'D' ? types[2] : types[1];
  return `${row}${seat} — ${type}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function interpolateCoords(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  t: number
): { lat: number; lon: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const lambda1 = toRad(lon1);
  const lambda2 = toRad(lon2);

  const dPhi = phi2 - phi1;
  const dLambda = lambda2 - lambda1;

  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const delta = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (delta < 1e-6) {
    return { lat: lat1, lon: lon1 };
  }

  const A = Math.sin((1 - t) * delta) / Math.sin(delta);
  const B = Math.sin(t * delta) / Math.sin(delta);

  const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2);
  const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2);
  const z = A * Math.sin(phi1) + B * Math.sin(phi2);

  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lon: toDeg(Math.atan2(y, x)),
  };
}
