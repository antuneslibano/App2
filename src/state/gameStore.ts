import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BagItem, BlockState, BoostId, GameState, OreDef, UpgradeTrackId } from '../types';
import { OREMAP, oresAvailableAtDepth } from '../data/ores';
import { PICKAXES, nextPickaxe, pickaxeById } from '../data/pickaxes';
import { UPGRADE_TRACKS, trackById, upgradeCost, BASE_BAG_CAPACITY } from '../data/upgrades';
import { DRONES, droneById, droneUpgradeCost } from '../data/drones';
import { BOOSTS, boostById } from '../data/boosts';
import { relicMultiplier, relicsForDepth } from '../data/prestige';
import { pickOreForDepth, effectiveHardness, effectiveValue, randomId } from '../utils/random';

export const GRID_ROWS = 7;
export const GRID_COLS = 5;
/** Radius of the "reach" circle around the finger while holding, as a fraction of one cell's size. */
export const MINE_RADIUS_FACTOR = 0.75;

const DEAD_ANIM_MS = 380;
const COMBO_WINDOW_MS = 1500;
const MAX_COMBO = 50;
const COMBO_DAMAGE_PER_STACK = 0.02;
const BASE_CRIT_CHANCE = 0.05;
const CRIT_LUCK_SCALE = 0.4;
const MAX_CRIT_CHANCE = 0.6;
const CRIT_MULT = 2.5;
const OFFLINE_CAP_MS = 4 * 60 * 60 * 1000;
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

function gemsForOre(oreValue: number): number {
  return Math.max(1, Math.round(Math.sqrt(oreValue) / 8));
}

interface DerivedStats {
  power: number;
  luckBonus: number;
  fortuneMultiplier: number;
  droneIntervalMultiplier: number;
  relicMult: number;
  critChance: number;
}

interface OfflineReport {
  gold: number;
  elapsedMs: number;
}

interface GameActions {
  hydrate: () => void;
  mineArea: (x: number, y: number, cellSize: number) => void;
  tickDrones: (deltaMs: number) => void;
  tickAutosell: (deltaMs: number) => void;
  cleanupDeadBlocks: () => void;
  sellBag: () => void;
  buyPickaxe: () => void;
  buyUpgrade: (trackId: UpgradeTrackId) => void;
  buyDrone: (droneId: string) => void;
  buyBoost: (boostId: BoostId) => void;
  ascend: () => void;
  getStats: () => DerivedStats;
  dismissOfflineReport: () => void;
  resetSave: () => void;
}

type Store = GameState & {
  droneAcc: Record<string, number>;
  autosellAcc: number;
  pendingOfflineReport: OfflineReport | null;
} & GameActions;

function boostMultiplier(state: GameState, id: BoostId, now: number): number {
  const expiry = state.activeBoosts[id];
  if (!expiry || expiry <= now) return 1;
  return boostById(id).multiplier;
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
    (1 + state.upgrades.fortune * fortuneTrack.effectPerLevel) * relicMult * boostMultiplier(state, 'fortune', now);
  const droneIntervalMultiplier = Math.max(0.25, 1 - state.upgrades.robotics * roboticsTrack.effectPerLevel);
  const critChance = Math.min(MAX_CRIT_CHANCE, BASE_CRIT_CHANCE + luckBonus * CRIT_LUCK_SCALE);

  return {
    power: pickaxe.power * powerMult * relicMult,
    luckBonus,
    fortuneMultiplier,
    droneIntervalMultiplier,
    relicMult,
    critChance,
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

function pickAutoTarget(grid: BlockState[]): BlockState | undefined {
  const alive = grid.filter((b) => !b.deadAt);
  if (alive.length === 0) return undefined;
  return alive.reduce((weakest, b) => (b.hp < weakest.hp ? b : weakest), alive[0]);
}

/** Blocks whose center falls within `radiusPx` of (x, y) in grid-local pixel coordinates. */
function blocksWithinRadius(grid: BlockState[], x: number, y: number, cellSize: number, radiusPx: number): BlockState[] {
  const radiusSq = radiusPx * radiusPx;
  return grid.filter((b) => {
    if (b.deadAt) return false;
    const cx = b.col * cellSize + cellSize / 2;
    const cy = b.row * cellSize + cellSize / 2;
    const dx = cx - x;
    const dy = cy - y;
    return dx * dx + dy * dy <= radiusSq;
  });
}

interface OreRewardResult {
  bag: BagItem[];
  gold: number;
  gems: number;
  bagFull: boolean;
}

/** Resolves what a destroyed block's ore grants — gems go straight to the wallet, everything else fills the bag. */
function applyOreReward(oreDef: OreDef, depth: number, fortuneMultiplier: number, bag: BagItem[], bagCapacity: number): OreRewardResult {
  if (oreDef.isGem) {
    return { bag, gold: 0, gems: gemsForOre(oreDef.value), bagFull: false };
  }
  if (bag.length < bagCapacity) {
    const value = effectiveValue(oreDef.value, depth) * fortuneMultiplier;
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
    totalDamage += hits * drone.power * level * stats.relicMult;
  }
  const minedEquivalent = totalDamage / Math.max(1, avgHardness);
  return Math.round(minedEquivalent * avgValue * stats.fortuneMultiplier);
}

const initialUpgrades: Record<UpgradeTrackId, number> = {
  power: 0,
  luck: 0,
  fortune: 0,
  robotics: 0,
  capacity: 0,
  autosell: 0,
};

function freshState(): GameState {
  return {
    gold: 0,
    gems: 0,
    depth: 0,
    pickaxeId: PICKAXES[0].id,
    upgrades: { ...initialUpgrades },
    drones: {},
    grid: generateGrid(0, 0),
    bag: [],
    totalOresMined: 0,
    relics: 0,
    lifetimeGold: 0,
    lastTickTs: Date.now(),
    comboCount: 0,
    comboExpireAt: 0,
    activeBoosts: {},
  };
}

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      ...freshState(),
      droneAcc: {},
      autosellAcc: 0,
      pendingOfflineReport: null,

      hydrate: () => {
        const state = get();
        const now = Date.now();
        const elapsed = Math.min(now - state.lastTickTs, OFFLINE_CAP_MS);
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
        const radiusPx = cellSize * MINE_RADIUS_FACTOR;
        const targets = blocksWithinRadius(state.grid, x, y, cellSize, radiusPx);
        if (targets.length === 0) return;

        const stats = computeStats(state, now);
        const comboAlive = now < state.comboExpireAt;
        const newComboCount = comboAlive ? Math.min(state.comboCount + 1, MAX_COMBO) : 1;
        const comboMult = 1 + newComboCount * COMBO_DAMAGE_PER_STACK;
        const cap = getBagCapacity(state);

        let grid = state.grid;
        let bag = state.bag;
        let gems = state.gems;
        let totalOresMined = state.totalOresMined;

        for (const target of targets) {
          const isCrit = Math.random() < stats.critChance;
          const damage = stats.power * comboMult * (isCrit ? CRIT_MULT : 1);
          const hp = target.hp - damage;
          if (hp <= 0) {
            const oreDef = OREMAP[target.ore];
            const result = applyOreReward(oreDef, target.depth, stats.fortuneMultiplier, bag, cap);
            bag = result.bag;
            gems += result.gems;
            totalOresMined += 1;
            grid = grid.map((b) =>
              b.id === target.id
                ? { ...b, hp: 0, deadAt: now, reward: { gold: result.gold, gems: result.gems, crit: isCrit, bagFull: result.bagFull } }
                : b
            );
          } else {
            grid = grid.map((b) => (b.id === target.id ? { ...b, hp } : b));
          }
        }

        set({ grid, bag, gems, totalOresMined, comboCount: newComboCount, comboExpireAt: now + COMBO_WINDOW_MS });
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
        let totalOresMined = state.totalOresMined;
        const acc = { ...state.droneAcc };
        const cap = getBagCapacity(state);

        for (const drone of ownedDrones) {
          const level = state.drones[drone.id] ?? 0;
          const interval = Math.max(80, drone.interval * stats.droneIntervalMultiplier);
          const time = (acc[drone.id] ?? 0) + deltaMs;
          let hits = Math.floor(time / interval);
          acc[drone.id] = time - hits * interval;

          while (hits > 0) {
            const target = pickAutoTarget(grid);
            if (!target) break;
            const damage = drone.power * level * stats.relicMult;
            const hp = target.hp - damage;
            if (hp <= 0) {
              const oreDef = OREMAP[target.ore];
              const result = applyOreReward(oreDef, target.depth, stats.fortuneMultiplier, bag, cap);
              bag = result.bag;
              gems += result.gems;
              totalOresMined += 1;
              grid = grid.map((b) =>
                b.id === target.id
                  ? { ...b, hp: 0, deadAt: now, reward: { gold: result.gold, gems: result.gems, crit: false, bagFull: result.bagFull } }
                  : b
              );
            } else {
              grid = grid.map((b) => (b.id === target.id ? { ...b, hp } : b));
            }
            hits -= 1;
          }
        }

        set({ grid, bag, gems, totalOresMined, droneAcc: acc });
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
          set({ grid: generateGrid(depth, stats.luckBonus), depth });
        } else {
          set({ grid: remaining });
        }
      },

      sellBag: () => {
        const state = get();
        if (state.bag.length === 0) return;
        const total = state.bag.reduce((sum: number, item: BagItem) => sum + item.value, 0);
        set({ gold: state.gold + total, lifetimeGold: state.lifetimeGold + total, bag: [] });
      },

      buyPickaxe: () => {
        const state = get();
        const next = nextPickaxe(state.pickaxeId);
        if (!next) return;
        if (state.gold < next.cost) return;
        set({ gold: state.gold - next.cost, pickaxeId: next.id });
      },

      buyUpgrade: (trackId: UpgradeTrackId) => {
        const state = get();
        const track = trackById(trackId);
        const level = state.upgrades[trackId];
        if (level >= track.maxLevel) return;
        const cost = upgradeCost(track, level);
        if (state.gold < cost) return;
        set({
          gold: state.gold - cost,
          upgrades: { ...state.upgrades, [trackId]: level + 1 },
        });
      },

      buyDrone: (droneId: string) => {
        const state = get();
        const drone = droneById(droneId);
        const level = state.drones[droneId] ?? 0;
        const cost = level === 0 ? drone.cost : droneUpgradeCost(drone.cost, level);
        if (state.gold < cost) return;
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
        set({
          gems: state.gems - boost.cost,
          activeBoosts: { ...state.activeBoosts, [boostId]: base + boost.durationMs },
        });
      },

      ascend: () => {
        const state = get();
        const earned = relicsForDepth(state.depth);
        if (earned <= 0) return;
        set({
          ...freshState(),
          droneAcc: {},
          autosellAcc: 0,
          relics: state.relics + earned,
          lifetimeGold: state.lifetimeGold,
          totalOresMined: state.totalOresMined,
        });
      },

      getStats: () => computeStats(get()),

      resetSave: () => set({ ...freshState(), droneAcc: {}, autosellAcc: 0, pendingOfflineReport: null }),
    }),
    {
      name: 'keep-on-mining-save',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persisted: any, version: number) => {
        if (!persisted) return persisted;
        if (version < 2 && persisted.upgrades) {
          const oldCapacity = persisted.upgrades.capacity ?? 0;
          persisted.upgrades.robotics = oldCapacity;
          persisted.upgrades.capacity = 0;
        }
        if (persisted.upgrades && persisted.upgrades.autosell === undefined) {
          persisted.upgrades.autosell = 0;
        }
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
          drones,
          totalOresMined,
          relics,
          lifetimeGold,
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
          drones,
          totalOresMined,
          relics,
          lifetimeGold,
          bag,
          activeBoosts,
          lastTickTs,
        };
      },
    }
  )
);
