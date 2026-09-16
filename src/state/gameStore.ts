import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BlockState, GameState, UpgradeTrackId } from '../types';
import { OREMAP } from '../data/ores';
import { PICKAXES, nextPickaxe, pickaxeById } from '../data/pickaxes';
import { UPGRADE_TRACKS, trackById, upgradeCost } from '../data/upgrades';
import { DRONES, droneById, droneUpgradeCost } from '../data/drones';
import { relicMultiplier, relicsForDepth } from '../data/prestige';
import { pickOreForDepth, effectiveHardness, effectiveValue, randomId } from '../utils/random';

export const GRID_ROWS = 7;
export const GRID_COLS = 5;

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

interface MineResult {
  gold: number;
  gems: number;
  destroyed: boolean;
}

interface DerivedStats {
  power: number;
  luckBonus: number;
  fortuneMultiplier: number;
  droneIntervalMultiplier: number;
  relicMult: number;
}

interface GameActions {
  hydrate: () => void;
  mineBlock: (blockId: string) => void;
  tickDrones: (deltaMs: number) => void;
  buyPickaxe: () => void;
  buyUpgrade: (trackId: UpgradeTrackId) => void;
  buyDrone: (droneId: string) => void;
  ascend: () => void;
  getStats: () => DerivedStats;
  resetSave: () => void;
}

type Store = GameState & { droneAcc: Record<string, number> } & GameActions;

function computeStats(state: GameState): DerivedStats {
  const powerTrack = trackById('power');
  const luckTrack = trackById('luck');
  const fortuneTrack = trackById('fortune');
  const capacityTrack = trackById('capacity');

  const pickaxe = pickaxeById(state.pickaxeId);
  const relicMult = relicMultiplier(state.relics);
  const powerMult = 1 + state.upgrades.power * powerTrack.effectPerLevel;
  const luckBonus = state.upgrades.luck * luckTrack.effectPerLevel;
  const fortuneMultiplier = (1 + state.upgrades.fortune * fortuneTrack.effectPerLevel) * relicMult;
  const droneIntervalMultiplier = Math.max(
    0.25,
    1 - state.upgrades.capacity * capacityTrack.effectPerLevel
  );

  return {
    power: pickaxe.power * powerMult * relicMult,
    luckBonus,
    fortuneMultiplier,
    droneIntervalMultiplier,
    relicMult,
  };
}

function applyDamageToBlock(
  grid: BlockState[],
  blockId: string,
  damage: number,
  fortuneMultiplier: number
): { grid: BlockState[]; result: MineResult } {
  let goldGain = 0;
  let gemGain = 0;
  let destroyed = false;

  const newGrid = grid.map((b) => {
    if (b.id !== blockId) return b;
    const hp = b.hp - damage;
    if (hp <= 0) {
      const oreDef = OREMAP[b.ore];
      goldGain = effectiveValue(oreDef.value, b.depth) * fortuneMultiplier;
      if (oreDef.isGem) {
        gemGain = Math.max(1, Math.round(Math.sqrt(oreDef.value) / 8));
      }
      destroyed = true;
      return { ...b, hp: 0 };
    }
    return { ...b, hp };
  });

  const filtered = destroyed ? newGrid.filter((b) => b.id !== blockId) : newGrid;
  return { grid: filtered, result: { gold: goldGain, gems: gemGain, destroyed } };
}

function pickAutoTarget(grid: BlockState[]): BlockState | undefined {
  if (grid.length === 0) return undefined;
  return grid.reduce((weakest, b) => (b.hp < weakest.hp ? b : weakest), grid[0]);
}

const initialUpgrades: Record<UpgradeTrackId, number> = {
  power: 0,
  luck: 0,
  fortune: 0,
  capacity: 0,
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
    rowsClearedAtDepth: 0,
    totalOresMined: 0,
    relics: 0,
    lifetimeGold: 0,
    lastTickTs: Date.now(),
  };
}

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      ...freshState(),
      droneAcc: {},

      hydrate: () => {
        set({ lastTickTs: Date.now() });
      },

      mineBlock: (blockId: string) => {
        const state = get();
        const stats = computeStats(state);
        const { grid, result } = applyDamageToBlock(state.grid, blockId, stats.power, stats.fortuneMultiplier);

        let { depth, grid: finalGrid } = { depth: state.depth, grid };
        if (finalGrid.length === 0) {
          depth = state.depth + GRID_ROWS;
          finalGrid = generateGrid(depth, stats.luckBonus);
        }

        set({
          grid: finalGrid,
          depth,
          gold: state.gold + result.gold,
          gems: state.gems + result.gems,
          lifetimeGold: state.lifetimeGold + result.gold,
          totalOresMined: state.totalOresMined + (result.destroyed ? 1 : 0),
        });
      },

      tickDrones: (deltaMs: number) => {
        const state = get();
        const stats = computeStats(state);
        const ownedDrones = DRONES.filter((d) => (state.drones[d.id] ?? 0) > 0);
        if (ownedDrones.length === 0) return;

        let grid = state.grid;
        let depth = state.depth;
        let goldGain = 0;
        let gemGain = 0;
        let minedCount = 0;
        const acc = { ...state.droneAcc };

        for (const drone of ownedDrones) {
          const level = state.drones[drone.id] ?? 0;
          const interval = Math.max(80, drone.interval * stats.droneIntervalMultiplier);
          const time = (acc[drone.id] ?? 0) + deltaMs;
          let hits = Math.floor(time / interval);
          acc[drone.id] = time - hits * interval;

          while (hits > 0 && grid.length > 0) {
            const target = pickAutoTarget(grid);
            if (!target) break;
            const damage = drone.power * level * stats.relicMult;
            const { grid: newGrid, result } = applyDamageToBlock(grid, target.id, damage, stats.fortuneMultiplier);
            grid = newGrid;
            goldGain += result.gold;
            gemGain += result.gems;
            if (result.destroyed) minedCount += 1;
            if (grid.length === 0) {
              depth = depth + GRID_ROWS;
              grid = generateGrid(depth, stats.luckBonus);
            }
            hits -= 1;
          }
        }

        set({
          grid,
          depth,
          droneAcc: acc,
          gold: state.gold + goldGain,
          gems: state.gems + gemGain,
          lifetimeGold: state.lifetimeGold + goldGain,
          totalOresMined: state.totalOresMined + minedCount,
        });
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

      ascend: () => {
        const state = get();
        const earned = relicsForDepth(state.depth);
        if (earned <= 0) return;
        set({
          ...freshState(),
          droneAcc: {},
          relics: state.relics + earned,
          lifetimeGold: state.lifetimeGold,
          totalOresMined: state.totalOresMined,
        });
      },

      getStats: () => computeStats(get()),

      resetSave: () => set({ ...freshState(), droneAcc: {} }),
    }),
    {
      name: 'keep-on-mining-save',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { grid, gold, gems, depth, pickaxeId, upgrades, drones, totalOresMined, relics, lifetimeGold } = state;
        return { grid, gold, gems, depth, pickaxeId, upgrades, drones, totalOresMined, relics, lifetimeGold };
      },
    }
  )
);
