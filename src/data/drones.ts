import { DroneDef } from '../types';

/** Auto-miners ("drones") that dig blocks passively over time, like Keep on Mining's robots. */
export const DRONES: DroneDef[] = [
  { id: 'driller1', name: 'Broca Automática', icon: 'drill', tier: 1, cost: 6500, power: 6, interval: 1000 },
  { id: 'driller2', name: 'Robô Perfurador', icon: 'robot', tier: 2, cost: 120000, power: 30, interval: 900 },
  { id: 'driller3', name: 'Drone de Escavação', icon: 'drone', tier: 3, cost: 1800000, power: 150, interval: 800 },
  { id: 'driller4', name: 'Exo-Minerador', icon: 'rocket', tier: 4, cost: 26000000, power: 700, interval: 700 },
  { id: 'driller5', name: 'IA de Mineração Quântica', icon: 'ai', tier: 5, cost: 340000000, power: 3200, interval: 600 },
];

export function droneById(id: string): DroneDef {
  const d = DRONES.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown drone ${id}`);
  return d;
}

/** Cost to buy the next level of a drone the player already owns some of. */
export function droneUpgradeCost(base: number, ownedLevel: number): number {
  return Math.round(base * Math.pow(1.45, ownedLevel));
}
