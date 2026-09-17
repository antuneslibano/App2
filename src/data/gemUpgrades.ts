import { GemUpgradeDef, GemUpgradeId } from '../types';

/**
 * The Gem economy. Gems are the premium currency: they are found by mining gem ore, they
 * survive ascension, and everything here is permanent. These tracks are deliberately much
 * stronger per level than the gold tracks — that is the point of the currency.
 */
export const GEM_UPGRADES: GemUpgradeDef[] = [
  {
    id: 'titan',
    name: 'Núcleo Titã',
    description: 'Poder de mineração permanente. Nunca é perdido ao ascender.',
    icon: 'biceps',
    maxLevel: 15,
    baseCost: 20,
    costGrowth: 1.55,
    effectPerLevel: 0.35, // +35% power per level
    unit: 'percent',
  },
  {
    id: 'tycoon',
    name: 'Selo do Magnata',
    description: 'Ouro permanente por venda. Nunca é perdido ao ascender.',
    icon: 'goldStack',
    maxLevel: 15,
    baseCost: 20,
    costGrowth: 1.55,
    effectPerLevel: 0.35, // +35% gold per level
    unit: 'percent',
  },
  {
    id: 'blast',
    name: 'Onda de Choque',
    description: 'Aumenta permanentemente o raio da sua área de mineração.',
    icon: 'blast',
    maxLevel: 8,
    baseCost: 45,
    costGrowth: 1.8,
    effectPerLevel: 0.14, // +0.14 cells of radius per level
    unit: 'radius',
  },
  {
    id: 'swarm',
    name: 'Enxame de Drones',
    description: 'Multiplica o dano de todos os drones automáticos.',
    icon: 'antennas',
    maxLevel: 12,
    baseCost: 30,
    costGrowth: 1.6,
    effectPerLevel: 0.5, // +50% drone damage per level
    unit: 'percent',
  },
  {
    id: 'prospector',
    name: 'Olho do Garimpeiro',
    description: 'Aumenta quantas gemas cada minério de gema entrega.',
    icon: 'sparkles',
    maxLevel: 10,
    baseCost: 35,
    costGrowth: 1.7,
    effectPerLevel: 0.3, // +30% gems found per level
    unit: 'percent',
  },
  {
    id: 'vault',
    name: 'Cofre Temporal',
    description: 'Aumenta quantas horas de mineração offline os drones acumulam.',
    icon: 'hourglass',
    maxLevel: 10,
    baseCost: 40,
    costGrowth: 1.65,
    effectPerLevel: 2, // +2h of offline cap per level
    unit: 'hours',
  },
];

export const GEM_UPGRADE_MAP: Record<GemUpgradeId, GemUpgradeDef> = GEM_UPGRADES.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {} as Record<GemUpgradeId, GemUpgradeDef>);

export function gemUpgradeById(id: GemUpgradeId): GemUpgradeDef {
  return GEM_UPGRADE_MAP[id];
}

export function gemUpgradeCost(def: GemUpgradeDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(def.costGrowth, level));
}

/**
 * Relics can be bought outright instead of grinding 10.000m for them. The price climbs
 * steeply so it stays a shortcut rather than a replacement for ascending.
 */
export const RELIC_BASE_GEM_COST = 150;

export function relicGemCost(boughtRelics: number): number {
  return Math.round(RELIC_BASE_GEM_COST * Math.pow(1.12, boughtRelics));
}
