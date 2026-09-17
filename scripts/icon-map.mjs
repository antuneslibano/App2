/** Local name -> game-icons.net icon name. Shared by extract-icons.mjs and render-sprites.mjs. */
export const ICONS = {
  // Ores — one clearly different silhouette per ore, so a glance at the grid
  // is enough to tell what is being mined.
  dirt: 'ground-sprout',
  stone: 'stone-block',
  coal: 'coal-pile',
  copper: 'ore',
  iron: 'metal-bar',
  silver: 'minerals',
  goldOre: 'gold-nuggets',
  emerald: 'emerald',
  ruby: 'fire-gem',
  sapphire: 'crystal-shine',
  diamond: 'cut-diamond',
  obsidian: 'rock',
  mythril: 'metal-plate',
  amethyst: 'amethyst',
  crystalCore: 'mineral-heart',
  // Tools and strike feedback
  pickaxe: 'mining',
  warPick: 'war-pick',
  helmet: 'mining-helmet',
  cave: 'cave-entrance',
  // Drones
  drill: 'drill',
  robot: 'tracked-robot',
  drone: 'delivery-drone',
  mech: 'battle-mech',
  ai: 'artificial-intelligence',
  // Currencies
  coins: 'coins',
  gems: 'gems',
  trophy: 'trophy',
  // Gold upgrade tracks
  fist: 'fist',
  clover: 'clover',
  cog: 'cog',
  backpack: 'backpack',
  wagon: 'mine-wagon',
  radar: 'radar-sweep',
  // Gem upgrade tracks
  biceps: 'biceps',
  goldStack: 'gold-stack',
  blast: 'magnet-blast',
  antennas: 'robot-antennas',
  hourglass: 'hourglass',
  sparkles: 'sparkles',
  // Boosts
  fire: 'fire',
  crown: 'crown',
  eagle: 'eagle-emblem',
  // Navigation
  cart: 'shopping-cart',
  upgrade: 'upgrade',
  elevator: 'elevator',
};

/**
 * The icons the mine grid mounts. These ship as PNG sprites instead of vector paths: the
 * grid holds 70 icon views, and re-parsing ~15k characters of path data every time a layer
 * regenerates is the kind of spike you feel. Everything else stays vector — the shop and
 * upgrade screens don't churn.
 */
export const SPRITE_ICONS = [
  'dirt', 'stone', 'coal', 'copper', 'iron', 'silver', 'goldOre', 'emerald', 'ruby',
  'sapphire', 'diamond', 'obsidian', 'mythril', 'amethyst', 'crystalCore', 'warPick',
];
