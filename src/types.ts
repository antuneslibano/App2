import { GameIconName } from './assets/gameIcons';
import { SpriteName } from './assets/sprites';

export type OreId =
  | 'dirt'
  | 'stone'
  | 'coal'
  | 'copper'
  | 'iron'
  | 'silver'
  | 'gold'
  | 'emerald'
  | 'ruby'
  | 'sapphire'
  | 'diamond'
  | 'obsidian'
  | 'mythril'
  | 'amethyst'
  | 'crystalCore';

/** Which family of mining sounds an ore uses. */
export type MaterialKind = 'soil' | 'stone' | 'metal' | 'crystal';

export interface OreDef {
  id: OreId;
  name: string;
  /** Short label printed on the block face — must stay readable inside one cell. */
  short: string;
  /** Minimum depth (meters) this ore can appear at. */
  minDepth: number;
  /** Base sale value in gold. */
  value: number;
  /** Base hit points required to break a block of this ore. */
  hardness: number;
  /** Relative spawn weight once unlocked. */
  weight: number;
  /** Block color. */
  color: string;
  /** Whether this ore is a "gem" (also grants premium Gems currency on find). */
  isGem?: boolean;
  /** Also the sprite name: ores render from a bitmap in the grid, vector elsewhere. */
  icon: GameIconName & SpriteName;
  material: MaterialKind;
}

export interface PickaxeDef {
  id: string;
  name: string;
  tier: number;
  /** Base damage per tap. */
  power: number;
  /** Gold cost to purchase (0 for the starter pickaxe). */
  cost: number;
  icon: GameIconName;
  /** Tint used for this tier's icon, so progression reads at a glance. */
  color: string;
}

export type UpgradeTrackId = 'power' | 'reach' | 'luck' | 'fortune' | 'robotics' | 'capacity' | 'autosell';

export interface UpgradeTrackDef {
  id: UpgradeTrackId;
  name: string;
  description: string;
  icon: GameIconName;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
  /** Effect magnitude granted per level. */
  effectPerLevel: number;
  /** How to display the accumulated effect. */
  unit: 'percent' | 'flat' | 'radius';
}

export interface DroneDef {
  id: string;
  name: string;
  icon: GameIconName;
  tier: number;
  cost: number;
  /** Damage per tick. */
  power: number;
  /** Milliseconds between ticks. */
  interval: number;
  /** Tint for this drone's sprite on the grid and its shop card. */
  color: string;
}

/** Permanent upgrades bought with Gems. Unlike gold upgrades, these survive ascension. */
export type GemUpgradeId = 'titan' | 'tycoon' | 'blast' | 'swarm' | 'prospector' | 'vault';

export interface GemUpgradeDef {
  id: GemUpgradeId;
  name: string;
  description: string;
  icon: GameIconName;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
  effectPerLevel: number;
  unit: 'percent' | 'radius' | 'hours';
}

export type BoostId = 'power' | 'fortune' | 'luck';

export interface BoostDef {
  id: BoostId;
  name: string;
  description: string;
  icon: GameIconName;
  cost: number;
  durationMs: number;
  multiplier: number;
}

export interface BlockReward {
  gold: number;
  gems: number;
  crit: boolean;
  bagFull: boolean;
}

export interface BlockState {
  id: string;
  ore: OreId;
  maxHp: number;
  hp: number;
  row: number;
  col: number;
  /** Absolute depth in meters this block sits at (used for value/hardness scaling). */
  depth: number;
  /** Timestamp of the last pickaxe strike, used to trigger the strike animation. */
  lastHitAt?: number;
  /** Set the moment the block is destroyed; kept around briefly for the break animation. */
  deadAt?: number;
  reward?: BlockReward;
}

/** A single lump of ore sitting in the player's backpack, value locked in at mining time. */
export interface BagItem {
  id: string;
  ore: OreId;
  value: number;
}

export interface GameState {
  gold: number;
  gems: number;
  depth: number;
  pickaxeId: string;
  upgrades: Record<UpgradeTrackId, number>;
  gemUpgrades: Record<GemUpgradeId, number>;
  drones: Record<string, number>;
  /**
   * Fixed GRID_ROWS x GRID_COLS array indexed by `row * GRID_COLS + col`, with `null` for a
   * cleared cell. The fixed layout lets each cell subscribe to its own slot, so mining one
   * block re-renders one cell instead of the whole grid.
   */
  grid: (BlockState | null)[];
  bag: BagItem[];
  totalOresMined: number;
  relics: number;
  /** Relics bought outright with gems, tracked so their escalating price keeps climbing. */
  boughtRelics: number;
  lifetimeGold: number;
  lifetimeGems: number;
  lastTickTs: number;
  comboCount: number;
  comboExpireAt: number;
  activeBoosts: Partial<Record<BoostId, number>>;
}
