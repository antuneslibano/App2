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
    unit: 'percent',
  },
  {
    id: 'luck',
    name: 'Sorte do Minerador',
    description: 'Aumenta a chance de achar minérios raros, gemas e de dar crítico.',
    emoji: '🍀',
    maxLevel: 60,
    baseCost: 90,
    costGrowth: 1.18,
    effectPerLevel: 0.03, // +3% rare weight per level
    unit: 'percent',
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
    unit: 'percent',
  },
  {
    id: 'robotics',
    name: 'Robótica',
    description: 'Deixa os drones automáticos mais rápidos.',
    emoji: '⚡',
    maxLevel: 40,
    baseCost: 120,
    costGrowth: 1.2,
    effectPerLevel: 0.02, // -2% drone interval per level
    unit: 'percent',
  },
  {
    id: 'capacity',
    name: 'Mochila Reforçada',
    description: 'Aumenta quantos minérios você consegue carregar antes de precisar vender.',
    emoji: '🎒',
    maxLevel: 40,
    baseCost: 100,
    costGrowth: 1.15,
    effectPerLevel: 5, // +5 flat bag slots per level
    unit: 'flat',
  },
];

export const BASE_BAG_CAPACITY = 20;

export function upgradeCost(track: UpgradeTrackDef, level: number): number {
  return Math.round(track.baseCost * Math.pow(track.costGrowth, level));
}

export function trackById(id: string): UpgradeTrackDef {
  const t = UPGRADE_TRACKS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown upgrade track ${id}`);
  return t;
}
