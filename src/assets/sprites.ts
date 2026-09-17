// Sprite bitmaps for the icons the mine grid mounts — see scripts/render-sprites.mjs.
// White on transparent, tinted per use, so one decoded bitmap serves every cell showing
// that ore. Regenerate with: node scripts/render-sprites.mjs

export const SPRITES = {
  dirt: require('../../assets/sprites/dirt.png'),
  stone: require('../../assets/sprites/stone.png'),
  coal: require('../../assets/sprites/coal.png'),
  copper: require('../../assets/sprites/copper.png'),
  iron: require('../../assets/sprites/iron.png'),
  silver: require('../../assets/sprites/silver.png'),
  goldOre: require('../../assets/sprites/goldOre.png'),
  emerald: require('../../assets/sprites/emerald.png'),
  ruby: require('../../assets/sprites/ruby.png'),
  sapphire: require('../../assets/sprites/sapphire.png'),
  diamond: require('../../assets/sprites/diamond.png'),
  obsidian: require('../../assets/sprites/obsidian.png'),
  mythril: require('../../assets/sprites/mythril.png'),
  amethyst: require('../../assets/sprites/amethyst.png'),
  crystalCore: require('../../assets/sprites/crystalCore.png'),
  warPick: require('../../assets/sprites/warPick.png'),
} as const;

export type SpriteName = keyof typeof SPRITES;
