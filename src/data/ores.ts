import { OreDef, OreId } from '../types';

export const ORES: OreDef[] = [
  { id: 'dirt', name: 'Terra', minDepth: 0, value: 1, hardness: 4, weight: 30, color: '#8a6a4f', emoji: '🟫' },
  { id: 'stone', name: 'Pedra', minDepth: 0, value: 1, hardness: 7, weight: 26, color: '#8d8d8d', emoji: '⬜' },
  { id: 'coal', name: 'Carvão', minDepth: 0, value: 3, hardness: 11, weight: 16, color: '#2b2b2b', emoji: '⬛' },
  { id: 'copper', name: 'Cobre', minDepth: 5, value: 7, hardness: 18, weight: 14, color: '#c47a4a', emoji: '🟠' },
  { id: 'iron', name: 'Ferro', minDepth: 12, value: 17, hardness: 29, weight: 12, color: '#b9b0a6', emoji: '⚙️' },
  { id: 'silver', name: 'Prata', minDepth: 22, value: 40, hardness: 43, weight: 10, color: '#d7d9db', emoji: '🔘' },
  { id: 'gold', name: 'Ouro', minDepth: 34, value: 90, hardness: 61, weight: 9, color: '#f0c419', emoji: '🟡' },
  { id: 'emerald', name: 'Esmeralda', minDepth: 48, value: 210, hardness: 83, weight: 6, color: '#2ecc71', isGem: true, emoji: '💚' },
  { id: 'ruby', name: 'Rubi', minDepth: 64, value: 425, hardness: 108, weight: 5, color: '#e74c3c', isGem: true, emoji: '❤️' },
  { id: 'sapphire', name: 'Safira', minDepth: 82, value: 800, hardness: 137, weight: 4, color: '#3498db', isGem: true, emoji: '💙' },
  { id: 'diamond', name: 'Diamante', minDepth: 100, value: 1600, hardness: 173, weight: 3.5, color: '#aef2ff', isGem: true, emoji: '💎' },
  { id: 'obsidian', name: 'Obsidiana', minDepth: 125, value: 3100, hardness: 234, weight: 5, color: '#3b2f4a', emoji: '🟪' },
  { id: 'mythril', name: 'Mythril', minDepth: 155, value: 6000, hardness: 306, weight: 3, color: '#7fdcd0', emoji: '🔷' },
  { id: 'amethyst', name: 'Ametista', minDepth: 190, value: 12000, hardness: 396, weight: 2.5, color: '#9b59b6', isGem: true, emoji: '💜' },
  { id: 'crystalCore', name: 'Núcleo de Cristal', minDepth: 230, value: 27500, hardness: 540, weight: 1, color: '#ff6ec7', isGem: true, emoji: '✨' },
];

export const OREMAP: Record<OreId, OreDef> = ORES.reduce((acc, o) => {
  acc[o.id] = o;
  return acc;
}, {} as Record<OreId, OreDef>);

/** Ores currently available at a given depth, most-recently-unlocked first. */
export function oresAvailableAtDepth(depth: number): OreDef[] {
  return ORES.filter((o) => o.minDepth <= depth);
}
