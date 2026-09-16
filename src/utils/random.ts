import { OreDef, OreId } from '../types';
import { oresAvailableAtDepth } from '../data/ores';

const FILLER_ORES: OreId[] = ['dirt', 'stone', 'coal'];

/**
 * Picks a weighted-random ore for a block at the given depth.
 * Ores unlocked long ago fade out (except filler ores, which always remain),
 * and `luckBonus` (0..~3) boosts the odds of gems and rarer ores.
 */
export function pickOreForDepth(depth: number, luckBonus: number): OreDef {
  const candidates = oresAvailableAtDepth(depth);
  const weights = candidates.map((ore) => {
    let w = ore.weight;
    if (!FILLER_ORES.includes(ore.id)) {
      const age = Math.max(0, depth - ore.minDepth);
      w *= Math.max(0.2, Math.exp(-age / 90));
    }
    if (ore.isGem || ore.weight < 10) {
      w *= 1 + luckBonus;
    }
    return w;
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/** Blocks get tougher the deeper you go, even for the same ore type. */
export function effectiveHardness(baseHardness: number, depth: number): number {
  return Math.round(baseHardness * (1 + depth * 0.012));
}

/** Deeper ore is worth a little more even at the same rarity, keeping the economy climbing. */
export function effectiveValue(baseValue: number, depth: number): number {
  return baseValue * (1 + depth * 0.006);
}

export function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
