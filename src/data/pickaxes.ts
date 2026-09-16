import { PickaxeDef } from '../types';

export const PICKAXES: PickaxeDef[] = [
  { id: 'wood', name: 'Picareta de Madeira', tier: 0, power: 2, cost: 0, emoji: '🪵' },
  { id: 'stone', name: 'Picareta de Pedra', tier: 1, power: 5, cost: 250, emoji: '🪨' },
  { id: 'copper', name: 'Picareta de Cobre', tier: 2, power: 11, cost: 1200, emoji: '🟠' },
  { id: 'iron', name: 'Picareta de Ferro', tier: 3, power: 24, cost: 5500, emoji: '⚙️' },
  { id: 'steel', name: 'Picareta de Aço', tier: 4, power: 52, cost: 22000, emoji: '🔩' },
  { id: 'silver', name: 'Picareta de Prata', tier: 5, power: 110, cost: 90000, emoji: '🔘' },
  { id: 'gold', name: 'Picareta de Ouro', tier: 6, power: 230, cost: 360000, emoji: '🟡' },
  { id: 'diamond', name: 'Picareta de Diamante', tier: 7, power: 480, cost: 1450000, emoji: '💎' },
  { id: 'obsidian', name: 'Picareta de Obsidiana', tier: 8, power: 1000, cost: 6000000, emoji: '🟪' },
  { id: 'mythril', name: 'Picareta de Mythril', tier: 9, power: 2100, cost: 24000000, emoji: '🔷' },
  { id: 'ancient', name: 'Picareta Ancestral', tier: 10, power: 4400, cost: 95000000, emoji: '🏺' },
];

export function pickaxeById(id: string): PickaxeDef {
  const p = PICKAXES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown pickaxe ${id}`);
  return p;
}

export function nextPickaxe(currentId: string): PickaxeDef | undefined {
  const current = pickaxeById(currentId);
  return PICKAXES.find((p) => p.tier === current.tier + 1);
}
