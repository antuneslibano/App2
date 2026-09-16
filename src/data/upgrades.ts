import { UpgradeTrackDef } from '../types';

export const UPGRADE_TRACKS: UpgradeTrackDef[] = [
  {
    id: 'power',
    name: 'Força de Mineração',
    description: '+dano por toque em todas as picaretas.',
    icon: 'fist',
    maxLevel: 60,
    baseCost: 400,
    costGrowth: 1.26,
    effectPerLevel: 0.02, // +2% power per level
    unit: 'percent',
  },
  {
    id: 'luck',
    name: 'Sorte do Minerador',
    description: 'Aumenta a chance de achar minérios raros, gemas e de dar crítico.',
    icon: 'clover',
    maxLevel: 60,
    baseCost: 550,
    costGrowth: 1.28,
    effectPerLevel: 0.015, // +1.5% rare weight per level
    unit: 'percent',
  },
  {
    id: 'fortune',
    name: 'Fortuna',
    description: 'Aumenta o ouro obtido ao vender minérios.',
    icon: 'coins',
    maxLevel: 60,
    baseCost: 500,
    costGrowth: 1.27,
    effectPerLevel: 0.025, // +2.5% sell value per level
    unit: 'percent',
  },
  {
    id: 'robotics',
    name: 'Robótica',
    description: 'Deixa os drones automáticos mais rápidos.',
    icon: 'cog',
    maxLevel: 40,
    baseCost: 800,
    costGrowth: 1.3,
    effectPerLevel: 0.012, // -1.2% drone interval per level
    unit: 'percent',
  },
  {
    id: 'capacity',
    name: 'Mochila Reforçada',
    description: 'Aumenta quantos minérios você consegue carregar antes de precisar vender.',
    icon: 'backpack',
    maxLevel: 40,
    baseCost: 900,
    costGrowth: 1.22,
    effectPerLevel: 5, // +5 flat bag slots per level
    unit: 'flat',
  },
  {
    id: 'autosell',
    name: 'Vendedor Automático',
    description: 'Vende sua mochila sozinha em intervalos regulares, mesmo sem apertar VENDER.',
    icon: 'wagon',
    maxLevel: 20,
    baseCost: 2500,
    costGrowth: 1.35,
    effectPerLevel: 0.04, // -4% autosell interval per level
    unit: 'percent',
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
