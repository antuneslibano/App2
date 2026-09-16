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

export interface OreDef {
  id: OreId;
  name: string;
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
  emoji: string;
}

export interface PickaxeDef {
  id: string;
  name: string;
  tier: number;
  /** Base damage per tap. */
  power: number;
  /** Gold cost to purchase (0 for the starter pickaxe). */
  cost: number;
  emoji: string;
}

export type UpgradeTrackId = 'power' | 'luck' | 'fortune' | 'robotics' | 'capacity';

export interface UpgradeTrackDef {
  id: UpgradeTrackId;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
  /** Effect magnitude granted per level. */
  effectPerLevel: number;
  /** How to display the accumulated effect. */
  unit: 'percent' | 'flat';
}

export interface DroneDef {
  id: string;
  name: string;
  emoji: string;
  tier: number;
  cost: number;
  /** Damage per tick. */
  power: number;
  /** Milliseconds between ticks. */
  interval: number;
}

export type BoostId = 'power' | 'fortune' | 'luck';

export interface BoostDef {
  id: BoostId;
  name: string;
  description: string;
  emoji: string;
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
  drones: Record<string, number>;
  grid: BlockState[];
  bag: BagItem[];
  totalOresMined: number;
  relics: number;
  lifetimeGold: number;
  lastTickTs: number;
  comboCount: number;
  comboExpireAt: number;
  activeBoosts: Partial<Record<BoostId, number>>;
}
