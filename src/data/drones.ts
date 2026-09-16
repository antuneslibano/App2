import { DroneDef } from '../types';

/** Auto-miners ("drones") that dig blocks passively over time, like Keep on Mining's robots. */
export const DRONES: DroneDef[] = [
  { id: 'driller1', name: 'Broca Automática', emoji: '🤖', tier: 1, cost: 800, power: 6, interval: 1000 },
  { id: 'driller2', name: 'Robô Perfurador', emoji: '🦾', tier: 2, cost: 15000, power: 30, interval: 900 },
  { id: 'driller3', name: 'Drone de Escavação', emoji: '🛸', tier: 3, cost: 220000, power: 150, interval: 800 },
  { id: 'driller4', name: 'Exo-Minerador', emoji: '🚀', tier: 4, cost: 3200000, power: 700, interval: 700 },
  { id: 'driller5', name: 'IA de Mineração Quântica', emoji: '🧠', tier: 5, cost: 42000000, power: 3200, interval: 600 },
];

export function droneById(id: string): DroneDef {
  const d = DRONES.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown drone ${id}`);
  return d;
}

/** Cost to buy the next level of a drone the player already owns some of. */
export function droneUpgradeCost(base: number, ownedLevel: number): number {
  return Math.round(base * Math.pow(1.35, ownedLevel));
}
