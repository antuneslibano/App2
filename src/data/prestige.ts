/** Ascending back to the surface resets depth/pickaxe/upgrades but grants permanent Relics. */

/** Relics earned for a given max depth reached, mirroring Keep on Mining's elevator reset. */
export function relicsForDepth(depth: number): number {
  if (depth < 100) return 0;
  return Math.floor(Math.pow(depth / 40, 1.5));
}

/** Each Relic grants a permanent +2% multiplier to gold and mining power. */
export const RELIC_BONUS_PER_POINT = 0.02;

export function relicMultiplier(relics: number): number {
  return 1 + relics * RELIC_BONUS_PER_POINT;
}
