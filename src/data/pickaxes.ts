import { PickaxeDef } from '../types';

export const PICKAXES: PickaxeDef[] = [
  { id: 'wood', name: 'Picareta de Madeira', tier: 0, power: 2, cost: 0, icon: 'pickaxe', color: '#a97d52' },
  { id: 'stone', name: 'Picareta de Pedra', tier: 1, power: 5, cost: 2000, icon: 'pickaxe', color: '#9aa0a6' },
  { id: 'copper', name: 'Picareta de Cobre', tier: 2, power: 11, cost: 9500, icon: 'pickaxe', color: '#c47a4a' },
  { id: 'iron', name: 'Picareta de Ferro', tier: 3, power: 24, cost: 44000, icon: 'pickaxe', color: '#cfd3d6' },
  { id: 'steel', name: 'Picareta de Aço', tier: 4, power: 52, cost: 175000, icon: 'pickaxe', color: '#8fa3b8' },
  { id: 'silver', name: 'Picareta de Prata', tier: 5, power: 110, cost: 720000, icon: 'pickaxe', color: '#e3e8ec' },
  { id: 'gold', name: 'Picareta de Ouro', tier: 6, power: 230, cost: 2900000, icon: 'pickaxe', color: '#f0c419' },
  { id: 'diamond', name: 'Picareta de Diamante', tier: 7, power: 480, cost: 11600000, icon: 'pickaxe', color: '#8ef0ff' },
  { id: 'obsidian', name: 'Picareta de Obsidiana', tier: 8, power: 1000, cost: 48000000, icon: 'pickaxe', color: '#a06bd6' },
  { id: 'mythril', name: 'Picareta de Mythril', tier: 9, power: 2100, cost: 190000000, icon: 'pickaxe', color: '#7fdcd0' },
  { id: 'ancient', name: 'Picareta Ancestral', tier: 10, power: 4400, cost: 760000000, icon: 'pickaxe', color: '#ffb347' },
];

const BY_ID: Record<string, PickaxeDef> = Object.fromEntries(PICKAXES.map((x) => [x.id, x]));

/** O(1) lookup: this sits inside the per-swing stat calculation. */
export function pickaxeById(id: string): PickaxeDef {
  const found = BY_ID[id];
  if (!found) throw new Error(`Unknown id ${id}`);
  return found;
}

export function nextPickaxe(currentId: string): PickaxeDef | undefined {
  const current = pickaxeById(currentId);
  return PICKAXES.find((p) => p.tier === current.tier + 1);
}
