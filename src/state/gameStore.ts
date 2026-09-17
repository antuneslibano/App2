import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BagItem,
  BlockState,
  BoostId,
  GameState,
  GemUpgradeId,
  MaterialKind,
  OreDef,
  UpgradeTrackId,
} from '../types';
import { OREMAP, oresAvailableAtDepth } from '../data/ores';
import { PICKAXES, nextPickaxe, pickaxeById } from '../data/pickaxes';
import { UPGRADE_TRACKS, trackById, upgradeCost, BASE_BAG_CAPACITY } from '../data/upgrades';
import { GEM_UPGRADES, gemUpgradeById, gemUpgradeCost, relicGemCost } from '../data/gemUpgrades';
import { DRONES, droneById, droneUpgradeCost } from '../data/drones';
import { BOOSTS, boostById } from '../data/boosts';
import { relicMultiplier, relicsForDepth } from '../data/prestige';
import { pickOreForDepth, effectiveHardness, effectiveValue, randomId } from '../utils/random';
import { sfx } from '../utils/sfx';

export const GRID_ROWS = 7;
export const GRID_COLS = 5;
/** Gap between the cell bounds and the drawn block, in px. Shared with the hit test. */
export const BLOCK_PADDING = 3;

/**
 * Radius of the "reach" circle, as a fraction of one cell. It starts small enough that a
 * swing only bites the block under the finger, and grows through the Raio de Impacto
 * (gold) and Onda de Choque (gem) upgrades.
 */
export const BASE_MINE_RADIUS_FACTOR = 0.3;
export const MAX_MINE_RADIUS_FACTOR = 2.6;

const DEAD_ANIM_MS = 380;
const COMBO_WINDOW_MS = 1500;
const MAX_COMBO = 50;
const COMBO_DAMAGE_PER_STACK = 0.02;
const BASE_CRIT_CHANCE = 0.05;
const CRIT_LUCK_SCALE = 0.4;
const MAX_CRIT_CHANCE = 0.6;
const CRIT_MULT = 2.5;
const OFFLINE_BASE_CAP_MS = 4 * 60 * 60 * 1000;
const OFFLINE_MIN_MS = 60 * 1000;
const AUTOSELL_BASE_INTERVAL_MS = 30 * 1000;
const AUTOSELL_MIN_INTERVAL_MS = 6 * 1000;

function generateGrid(baseDepth: number, luckBonus: number): BlockState[] {
  const blocks: BlockState[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const depthAtRow = baseDepth + row;
    for (let col = 0; col < GRID_COLS; col++) {
      const ore = pickOreForDepth(depthAtRow, luckBonus);
      const hp = effectiveHardness(ore.hardness, depthAtRow);
      blocks.push({
        id: randomId(),
        ore: ore.id,
        maxHp: hp,
        hp,
        row,
        col,
        depth: depthAtRow,
      });
    }
  }
  return blocks;
}

function gemsForOre(oreValue: number, gemFindMultiplier: number): number {
  return Math.max(1, Math.round((Math.sqrt(oreValue) / 8) * gemFindMultiplier));
}

interface DerivedStats {
  power: number;
  luckBonus: number;
  fortuneMultiplier: number;
  droneIntervalMultiplier: number;
  droneDamageMultiplier: number;
  gemFindMultiplier: number;
  relicMult: number;
  critChance: number;
  /** Reach circle radius, in cells. */
  radiusFactor: number;
}

interface OfflineReport {
  gold: number;
  elapsedMs: number;
}

interface GameActions {
  hydrate: () => void;
  /** Returns the material struck, or null when the swing hit nothing. */
  mineArea: (x: number, y: number, cellSize: number) => MaterialKind | null;
  tickDrones: (deltaMs: number) => void;
  tickAutosell: (deltaMs: number) => void;
  cleanupDeadBlocks: () => void;
  sellBag: () => void;
  buyPickaxe: () => void;
  buyUpgrade: (trackId: UpgradeTrackId) => void;
  buyGemUpgrade: (id: GemUpgradeId) => void;
  buyRelic: () => void;
  buyDrone: (droneId: string) => void;
  buyBoost: (boostId: BoostId) => void;
  ascend: () => void;
  getStats: () => DerivedStats;
  dismissOfflineReport: () => void;
  resetSave: () => void;
}

type Store = GameState & {
  droneAcc: Record<string, number>;
  /** droneId -> id of the block that drone is currently chewing on, for the grid sprites. */
  droneTargets: Record<string, string>;
  autosellAcc: number;
  pendingOfflineReport: OfflineReport | null;
} & GameActions;

function boostMultiplier(state: GameState, id: BoostId, now: number): number {
  const expiry = state.activeBoosts[id];
  if (!expiry || expiry <= now) return 1;
  return boostById(id).multiplier;
}

function gemLevel(state: Pick<GameState, 'gemUpgrades'>, id: GemUpgradeId): number {
  return state.gemUpgrades?.[id] ?? 0;
}

/** Total gem-upgrade effect for a track, i.e. level x effectPerLevel. */
function gemEffect(state: Pick<GameState, 'gemUpgrades'>, id: GemUpgradeId): number {
  return gemLevel(state, id) * gemUpgradeById(id).effectPerLevel;
}

export function getMineRadiusFactor(state: Pick<GameState, 'upgrades' | 'gemUpgrades'>): number {
  const track = trackById('reach');
  const fromGold = (state.upgrades.reach ?? 0) * track.effectPerLevel;
  return Math.min(MAX_MINE_RADIUS_FACTOR, BASE_MINE_RADIUS_FACTOR + fromGold + gemEffect(state, 'blast'));
}

export function getOfflineCapMs(state: Pick<GameState, 'gemUpgrades'>): number {
  return OFFLINE_BASE_CAP_MS + gemEffect(state, 'vault') * 60 * 60 * 1000;
}

function computeStats(state: GameState, now: number = Date.now()): DerivedStats {
  const powerTrack = trackById('power');
  const luckTrack = trackById('luck');
  const fortuneTrack = trackById('fortune');
  const roboticsTrack = trackById('robotics');

  const pickaxe = pickaxeById(state.pickaxeId);
  const relicMult = relicMultiplier(state.relics);
  const powerMult = (1 + state.upgrades.power * powerTrack.effectPerLevel) * boostMultiplier(state, 'power', now);
  const luckBonus = state.upgrades.luck * luckTrack.effectPerLevel * boostMultiplier(state, 'luck', now);
  const fortuneMultiplier =
    (1 + state.upgrades.fortune * fortuneTrack.effectPerLevel) *
    relicMult *
    boostMultiplier(state, 'fortune', now) *
    (1 + gemEffect(state, 'tycoon'));
  const droneIntervalMultiplier = Math.max(0.25, 1 - state.upgrades.robotics * roboticsTrack.effectPerLevel);
  const critChance = Math.min(MAX_CRIT_CHANCE, BASE_CRIT_CHANCE + luckBonus * CRIT_LUCK_SCALE);

  return {
    power: pickaxe.power * powerMult * relicMult * (1 + gemEffect(state, 'titan')),
    luckBonus,
    fortuneMultiplier,
    droneIntervalMultiplier,
    droneDamageMultiplier: relicMult * (1 + gemEffect(state, 'swarm')),
    gemFindMultiplier: 1 + gemEffect(state, 'prospector'),
    relicMult,
    critChance,
    radiusFactor: getMineRadiusFactor(state),
  };
}

export function getBagCapacity(state: Pick<GameState, 'upgrades'>): number {
  const track = trackById('capacity');
  return BASE_BAG_CAPACITY + state.upgrades.capacity * track.effectPerLevel;
}

export function getBagValue(state: Pick<GameState, 'bag'>): number {
  return state.bag.reduce((sum, item) => sum + item.value, 0);
}

/** Seconds between automatic bag sales, or null while the upgrade hasn't been bought yet. */
export function getAutosellIntervalMs(state: Pick<GameState, 'upgrades'>): number | null {
  if (state.upgrades.autosell <= 0) return null;
  const track = trackById('autosell');
  const multiplier = Math.max(0.2, 1 - state.upgrades.autosell * track.effectPerLevel);
  return Math.max(AUTOSELL_MIN_INTERVAL_MS, AUTOSELL_BASE_INTERVAL_MS * multiplier);
}

/**
 * The weakest block a drone can claim. Drones prefer a block no other drone is already on,
 * so damage spreads across the layer and their sprites don't all pile onto one cell.
 */
function pickDroneTarget(grid: BlockState[], claimed: Set<string>): BlockState | undefined {
  let best: BlockState | undefined;
  let fallback: BlockState | undefined;
  for (const b of grid) {
    if (b.deadAt) continue;
    if (!fallback || b.hp < fallback.hp) fallback = b;
    if (claimed.has(b.id)) continue;
    if (!best || b.hp < best.hp) best = b;
  }
  return best ?? fallback;
}

/**
 * Every block the reach circle overlaps — not just the one under the finger. The test is
 * circle-vs-rectangle against the block's *drawn* bounds (the cell minus its padding), so
 * what gets mined is exactly what the circle visibly covers.
 */
export function blocksWithinRadius(
  grid: BlockState[],
  x: number,
  y: number,
  cellSize: number,
  radiusPx: number
): BlockState[] {
  const radiusSq = radiusPx * radiusPx;
  return grid.filter((b) => {
    if (b.deadAt) return false;
    const left = b.col * cellSize + BLOCK_PADDING;
    const top = b.row * cellSize + BLOCK_PADDING;
    const right = left + cellSize - BLOCK_PADDING * 2;
    const bottom = top + cellSize - BLOCK_PADDING * 2;
    // Closest point of the block rectangle to the circle's center.
    const nx = Math.max(left, Math.min(x, right));
    const ny = Math.max(top, Math.min(y, bottom));
    const dx = nx - x;
    const dy = ny - y;
    return dx * dx + dy * dy <= radiusSq;
  });
}

/** Of the blocks in range, the one whose center is closest to the touch point. */
function nearestTarget(targets: BlockState[], x: number, y: number, cellSize: number): BlockState {
  let best = targets[0];
  let bestDist = Infinity;
  for (const b of targets) {
    const dx = b.col * cellSize + cellSize / 2 - x;
    const dy = b.row * cellSize + cellSize / 2 - y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = b;
    }
  }
  return best;
}

interface OreRewardResult {
  bag: BagItem[];
  gold: number;
  gems: number;
  bagFull: boolean;
}

/** Resolves what a destroyed block's ore grants — gems go straight to the wallet, everything else fills the bag. */
function applyOreReward(
  oreDef: OreDef,
  depth: number,
  stats: DerivedStats,
  bag: BagItem[],
  bagCapacity: number
): OreRewardResult {
  if (oreDef.isGem) {
    return { bag, gold: 0, gems: gemsForOre(oreDef.value, stats.gemFindMultiplier), bagFull: false };
  }
  if (bag.length < bagCapacity) {
    const value = effectiveValue(oreDef.value, depth) * stats.fortuneMultiplier;
    return { bag: [...bag, { id: randomId(), ore: oreDef.id, value }], gold: value, gems: 0, bagFull: false };
  }
  return { bag, gold: 0, gems: 0, bagFull: true };
}

function estimateOfflineEarnings(state: GameState, elapsedMs: number): number {
  const ownedDrones = DRONES.filter((d) => (state.drones[d.id] ?? 0) > 0);
  if (ownedDrones.length === 0) return 0;
  const stats = computeStats(state);

  const sample = oresAvailableAtDepth(state.depth);
  if (sample.length === 0) return 0;
  const avgHardness = sample.reduce((s, o) => s + effectiveHardness(o.hardness, state.depth), 0) / sample.length;
  const avgValue = sample.reduce((s, o) => s + effectiveValue(o.value, state.depth), 0) / sample.length;

  let totalDamage = 0;
  for (const drone of ownedDrones) {
    const level = state.drones[drone.id] ?? 0;
    const interval = Math.max(80, drone.interval * stats.droneIntervalMultiplier);
    const hits = Math.floor(elapsedMs / interval);
    totalDamage += hits * drone.power * level * stats.droneDamageMultiplier;
  }
  const minedEquivalent = totalDamage / Math.max(1, avgHardness);
  return Math.round(minedEquivalent * avgValue * stats.fortuneMultiplier);
}

const initialUpgrades: Record<UpgradeTrackId, number> = {
  power: 0,
  reach: 0,
  luck: 0,
  fortune: 0,
  robotics: 0,
  capacity: 0,
  autosell: 0,
};

const initialGemUpgrades: Record<GemUpgradeId, number> = {
  titan: 0,
  tycoon: 0,
  blast: 0,
  swarm: 0,
  prospector: 0,
  vault: 0,
};

/** Everything a run owns. Gems and gem upgrades are deliberately *not* part of this. */
function freshRun() {
  return {
    gold: 0,
    depth: 0,
    pickaxeId: PICKAXES[0].id,
    upgrades: { ...initialUpgrades },
    drones: {},
    grid: generateGrid(0, 0),
    bag: [],
    comboCount: 0,
    comboExpireAt: 0,
    activeBoosts: {},
  };
}

function freshState(): GameState {
  return {
    ...freshRun(),
    gems: 0,
    gemUpgrades: { ...initialGemUpgrades },
    totalOresMined: 0,
    relics: 0,
    boughtRelics: 0,
    lifetimeGold: 0,
    lifetimeGems: 0,
    lastTickTs: Date.now(),
  };
}

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      ...freshState(),
      droneAcc: {},
      droneTargets: {},
      autosellAcc: 0,
      pendingOfflineReport: null,

      hydrate: () => {
        const state = get();
        const now = Date.now();
        const elapsed = Math.min(now - state.lastTickTs, getOfflineCapMs(state));
        let report: OfflineReport | null = null;
        let bonusGold = 0;
        if (elapsed > OFFLINE_MIN_MS) {
          bonusGold = estimateOfflineEarnings(state, elapsed);
          if (bonusGold > 0) {
            report = { gold: bonusGold, elapsedMs: elapsed };
          }
        }
        set({
          lastTickTs: now,
          gold: state.gold + bonusGold,
          lifetimeGold: state.lifetimeGold + bonusGold,
          pendingOfflineReport: report,
        });
      },

      dismissOfflineReport: () => set({ pendingOfflineReport: null }),

      mineArea: (x: number, y: number, cellSize: number) => {
        const state = get();
        const now = Date.now();
        const stats = computeStats(state, now);
        const radiusPx = cellSize * stats.radiusFactor;
        const targets = blocksWithinRadius(state.grid, x, y, cellSize, radiusPx);
        if (targets.length === 0) return null;

        const comboAlive = now < state.comboExpireAt;
        const newComboCount = comboAlive ? Math.min(state.comboCount + 1, MAX_COMBO) : 1;
        const comboMult = 1 + newComboCount * COMBO_DAMAGE_PER_STACK;
        const cap = getBagCapacity(state);

        // One pass over the grid: every block inside the circle takes a full swing.
        const hit = new Map<string, BlockState>();
        let bag = state.bag;
        let gems = state.gems;
        let gemsGained = 0;
        let totalOresMined = state.totalOresMined;

        for (const target of targets) {
          const isCrit = Math.random() < stats.critChance;
          const damage = stats.power * comboMult * (isCrit ? CRIT_MULT : 1);
          const hp = target.hp - damage;
          if (hp <= 0) {
            const oreDef = OREMAP[target.ore];
            const result = applyOreReward(oreDef, target.depth, stats, bag, cap);
            bag = result.bag;
            gems += result.gems;
            gemsGained += result.gems;
            totalOresMined += 1;
            hit.set(target.id, {
              ...target,
              hp: 0,
              lastHitAt: now,
              deadAt: now,
              reward: { gold: result.gold, gems: result.gems, crit: isCrit, bagFull: result.bagFull },
            });
          } else {
            hit.set(target.id, { ...target, hp, lastHitAt: now });
          }
        }

        set({
          grid: state.grid.map((b) => hit.get(b.id) ?? b),
          bag,
          gems,
          lifetimeGems: state.lifetimeGems + gemsGained,
          totalOresMined,
          comboCount: newComboCount,
          comboExpireAt: now + COMBO_WINDOW_MS,
        });
        // The block nearest the finger decides which material the strike sounds like.
        return OREMAP[nearestTarget(targets, x, y, cellSize).ore].material;
      },

      tickDrones: (deltaMs: number) => {
        const state = get();
        const now = Date.now();
        const stats = computeStats(state, now);
        const ownedDrones = DRONES.filter((d) => (state.drones[d.id] ?? 0) > 0);
        if (ownedDrones.length === 0) return;

        let grid = state.grid;
        let bag = state.bag;
        let gems = state.gems;
        let gemsGained = 0;
        let totalOresMined = state.totalOresMined;
        const acc = { ...state.droneAcc };
        const nextTargets: Record<string, string> = {};
        const claimed = new Set<string>();
        const cap = getBagCapacity(state);

        for (const drone of ownedDrones) {
          const level = state.drones[drone.id] ?? 0;
          const interval = Math.max(80, drone.interval * stats.droneIntervalMultiplier);
          const time = (acc[drone.id] ?? 0) + deltaMs;
          let hits = Math.floor(time / interval);
          acc[drone.id] = time - hits * interval;

          let targetId: string | undefined = state.droneTargets[drone.id];

          while (hits > 0) {
            let target: BlockState | undefined = targetId ? grid.find((b) => b.id === targetId) : undefined;
            if (!target || target.deadAt) {
              target = pickDroneTarget(grid, claimed);
              if (!target) break;
              targetId = target.id;
            }
            claimed.add(target.id);

            const damage = drone.power * level * stats.droneDamageMultiplier;
            const hp = target.hp - damage;
            if (hp <= 0) {
              const oreDef = OREMAP[target.ore];
              const result = applyOreReward(oreDef, target.depth, stats, bag, cap);
              bag = result.bag;
              gems += result.gems;
              gemsGained += result.gems;
              totalOresMined += 1;
              const dead = target;
              grid = grid.map((b) =>
                b.id === dead.id
                  ? {
                      ...b,
                      hp: 0,
                      deadAt: now,
                      reward: { gold: result.gold, gems: result.gems, crit: false, bagFull: result.bagFull },
                    }
                  : b
              );
            } else {
              const struck = target;
              grid = grid.map((b) => (b.id === struck.id ? { ...b, hp } : b));
            }
            hits -= 1;
          }

          // Keep a live target for the sprite even on ticks where the drone didn't swing.
          const current = targetId ? grid.find((b) => b.id === targetId) : undefined;
          if (current && !current.deadAt) {
            nextTargets[drone.id] = current.id;
            claimed.add(current.id);
          } else {
            const fresh = pickDroneTarget(grid, claimed);
            if (fresh) {
              nextTargets[drone.id] = fresh.id;
              claimed.add(fresh.id);
            }
          }
        }

        const targetsChanged =
          Object.keys(nextTargets).length !== Object.keys(state.droneTargets).length ||
          Object.keys(nextTargets).some((k) => nextTargets[k] !== state.droneTargets[k]);

        set({
          grid,
          bag,
          gems,
          lifetimeGems: state.lifetimeGems + gemsGained,
          totalOresMined,
          droneAcc: acc,
          ...(targetsChanged ? { droneTargets: nextTargets } : null),
        });
      },

      tickAutosell: (deltaMs: number) => {
        const state = get();
        const interval = getAutosellIntervalMs(state);
        if (interval === null || state.bag.length === 0) {
          if (state.autosellAcc !== 0) set({ autosellAcc: 0 });
          return;
        }
        const acc = state.autosellAcc + deltaMs;
        if (acc < interval) {
          set({ autosellAcc: acc });
          return;
        }
        const total = state.bag.reduce((sum, item) => sum + item.value, 0);
        sfx.coin();
        set({
          gold: state.gold + total,
          lifetimeGold: state.lifetimeGold + total,
          bag: [],
          autosellAcc: acc - interval,
        });
      },

      cleanupDeadBlocks: () => {
        const state = get();
        const now = Date.now();
        if (!state.grid.some((b) => b.deadAt)) return;
        const remaining = state.grid.filter((b) => !b.deadAt || now - b.deadAt < DEAD_ANIM_MS);
        if (remaining.length === state.grid.length) return;
        if (remaining.length === 0) {
          const stats = computeStats(state, now);
          const depth = state.depth + GRID_ROWS;
          sfx.descend();
          set({ grid: generateGrid(depth, stats.luckBonus), depth, droneTargets: {} });
        } else {
          set({ grid: remaining });
        }
      },

      sellBag: () => {
        const state = get();
        if (state.bag.length === 0) return;
        const total = state.bag.reduce((sum: number, item: BagItem) => sum + item.value, 0);
        sfx.coin();
        set({ gold: state.gold + total, lifetimeGold: state.lifetimeGold + total, bag: [] });
      },

      buyPickaxe: () => {
        const state = get();
        const next = nextPickaxe(state.pickaxeId);
        if (!next) return;
        if (state.gold < next.cost) return;
        sfx.purchase();
        set({ gold: state.gold - next.cost, pickaxeId: next.id });
      },

      buyUpgrade: (trackId: UpgradeTrackId) => {
        const state = get();
        const track = trackById(trackId);
        const level = state.upgrades[trackId];
        if (level >= track.maxLevel) return;
        const cost = upgradeCost(track, level);
        if (state.gold < cost) return;
        sfx.purchase();
        set({
          gold: state.gold - cost,
          upgrades: { ...state.upgrades, [trackId]: level + 1 },
        });
      },

      buyGemUpgrade: (id: GemUpgradeId) => {
        const state = get();
        const def = gemUpgradeById(id);
        const level = gemLevel(state, id);
        if (level >= def.maxLevel) return;
        const cost = gemUpgradeCost(def, level);
        if (state.gems < cost) return;
        sfx.purchase();
        set({
          gems: state.gems - cost,
          gemUpgrades: { ...state.gemUpgrades, [id]: level + 1 },
        });
      },

      buyRelic: () => {
        const state = get();
        const cost = relicGemCost(state.boughtRelics);
        if (state.gems < cost) return;
        sfx.ascend();
        set({
          gems: state.gems - cost,
          relics: state.relics + 1,
          boughtRelics: state.boughtRelics + 1,
        });
      },

      buyDrone: (droneId: string) => {
        const state = get();
        const drone = droneById(droneId);
        const level = state.drones[droneId] ?? 0;
        const cost = level === 0 ? drone.cost : droneUpgradeCost(drone.cost, level);
        if (state.gold < cost) return;
        sfx.purchase();
        set({
          gold: state.gold - cost,
          drones: { ...state.drones, [droneId]: level + 1 },
        });
      },

      buyBoost: (boostId: BoostId) => {
        const state = get();
        const boost = boostById(boostId);
        if (state.gems < boost.cost) return;
        const now = Date.now();
        const currentExpiry = state.activeBoosts[boostId] ?? now;
        const base = Math.max(currentExpiry, now);
        sfx.purchase();
        set({
          gems: state.gems - boost.cost,
          activeBoosts: { ...state.activeBoosts, [boostId]: base + boost.durationMs },
        });
      },

      ascend: () => {
        const state = get();
        const earned = relicsForDepth(state.depth);
        if (earned <= 0) return;
        sfx.ascend();
        // Gems, gem upgrades and relics are premium progress: ascending never touches them.
        set({
          ...freshRun(),
          droneAcc: {},
          droneTargets: {},
          autosellAcc: 0,
          relics: state.relics + earned,
          lastTickTs: Date.now(),
        });
      },

      getStats: () => computeStats(get()),

      resetSave: () =>
        set({ ...freshState(), droneAcc: {}, droneTargets: {}, autosellAcc: 0, pendingOfflineReport: null }),
    }),
    {
      name: 'keep-on-mining-save',
      storage: createJSONStorage(() => AsyncStorage),
      version: 4,
      migrate: (persisted: any, version: number) => {
        if (!persisted) return persisted;
        if (version < 2 && persisted.upgrades) {
          const oldCapacity = persisted.upgrades.capacity ?? 0;
          persisted.upgrades.robotics = oldCapacity;
          persisted.upgrades.capacity = 0;
        }
        if (persisted.upgrades) {
          for (const track of UPGRADE_TRACKS) {
            if (persisted.upgrades[track.id] === undefined) persisted.upgrades[track.id] = 0;
          }
        }
        if (!persisted.gemUpgrades) persisted.gemUpgrades = {};
        for (const def of GEM_UPGRADES) {
          if (persisted.gemUpgrades[def.id] === undefined) persisted.gemUpgrades[def.id] = 0;
        }
        if (persisted.boughtRelics === undefined) persisted.boughtRelics = 0;
        if (persisted.lifetimeGems === undefined) persisted.lifetimeGems = persisted.gems ?? 0;
        if (!persisted.bag) persisted.bag = [];
        if (!persisted.activeBoosts) persisted.activeBoosts = {};
        if (persisted.comboCount === undefined) persisted.comboCount = 0;
        if (persisted.comboExpireAt === undefined) persisted.comboExpireAt = 0;
        return persisted;
      },
      partialize: (state) => {
        const {
          grid,
          gold,
          gems,
          depth,
          pickaxeId,
          upgrades,
          gemUpgrades,
          drones,
          totalOresMined,
          relics,
          boughtRelics,
          lifetimeGold,
          lifetimeGems,
          bag,
          activeBoosts,
          lastTickTs,
        } = state;
        return {
          grid,
          gold,
          gems,
          depth,
          pickaxeId,
          upgrades,
          gemUpgrades,
          drones,
          totalOresMined,
          relics,
          boughtRelics,
          lifetimeGold,
          lifetimeGems,
          bag,
          activeBoosts,
          lastTickTs,
        };
      },
    }
  )
);
