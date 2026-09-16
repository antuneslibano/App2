import { UpgradeTrackDef } from '../types';

export const UPGRADE_TRACKS: UpgradeTrackDef[] = [
  {
    id: 'power',
    name: 'Força de Mineração',
    description: '+dano por toque em todas as picaretas.',
    emoji: '💪',
    maxLevel: 60,
    baseCost: 60,
    costGrowth: 1.16,
    effectPerLevel: 0.04, // +4% power per level
  },
  {
    id: 'luck',
    name: 'Sorte do Minerador',
    description: 'Aumenta a chance de encontrar minérios raros e gemas.',
    emoji: '🍀',
    maxLevel: 60,
    baseCost: 90,
    costGrowth: 1.18,
    effectPerLevel: 0.03, // +3% rare weight per level
  },
  {
    id: 'fortune',
    name: 'Fortuna',
    description: 'Aumenta o ouro obtido ao vender minérios.',
    emoji: '💰',
    maxLevel: 60,
    baseCost: 80,
    costGrowth: 1.17,
    effectPerLevel: 0.05, // +5% sell value per level
  },
  {
    id: 'capacity',
    name: 'Robótica',
    description: 'Deixa os drones automáticos mais rápidos.',
    emoji: '⚡',
    maxLevel: 40,
    baseCost: 120,
    costGrowth: 1.2,
    effectPerLevel: 0.02, // -2% drone interval per level
  },
];

export function upgradeCost(track: UpgradeTrackDef, level: number): number {
  return Math.round(track.baseCost * Math.pow(track.costGrowth, level));
}

export function trackById(id: string): UpgradeTrackDef {
  const t = UPGRADE_TRACKS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown upgrade track ${id}`);
  return t;
}
