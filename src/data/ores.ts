import { OreDef, OreId } from '../types';

export const ORES: OreDef[] = [
  { id: 'dirt', name: 'Terra', short: 'TERRA', minDepth: 0, value: 1, hardness: 4, weight: 30, color: '#8a6a4f', icon: 'dirt', material: 'soil' },
  { id: 'stone', name: 'Pedra', short: 'PEDRA', minDepth: 0, value: 1, hardness: 7, weight: 26, color: '#8d8d8d', icon: 'stone', material: 'stone' },
  { id: 'coal', name: 'Carvão', short: 'CARVÃO', minDepth: 0, value: 3, hardness: 11, weight: 16, color: '#2b2b2b', icon: 'coal', material: 'stone' },
  { id: 'copper', name: 'Cobre', short: 'COBRE', minDepth: 5, value: 7, hardness: 18, weight: 14, color: '#c47a4a', icon: 'copper', material: 'metal' },
  { id: 'iron', name: 'Ferro', short: 'FERRO', minDepth: 12, value: 17, hardness: 29, weight: 12, color: '#b9b0a6', icon: 'iron', material: 'metal' },
  { id: 'silver', name: 'Prata', short: 'PRATA', minDepth: 22, value: 40, hardness: 43, weight: 10, color: '#d7d9db', icon: 'silver', material: 'metal' },
  { id: 'gold', name: 'Ouro', short: 'OURO', minDepth: 34, value: 90, hardness: 61, weight: 9, color: '#f0c419', icon: 'goldOre', material: 'metal' },
  { id: 'emerald', name: 'Esmeralda', short: 'ESMER.', minDepth: 48, value: 210, hardness: 83, weight: 6, color: '#2ecc71', isGem: true, icon: 'emerald', material: 'crystal' },
  { id: 'ruby', name: 'Rubi', short: 'RUBI', minDepth: 64, value: 425, hardness: 108, weight: 5, color: '#e74c3c', isGem: true, icon: 'ruby', material: 'crystal' },
  { id: 'sapphire', name: 'Safira', short: 'SAFIRA', minDepth: 82, value: 800, hardness: 137, weight: 4, color: '#3498db', isGem: true, icon: 'sapphire', material: 'crystal' },
  { id: 'diamond', name: 'Diamante', short: 'DIAM.', minDepth: 100, value: 1600, hardness: 173, weight: 3.5, color: '#aef2ff', isGem: true, icon: 'diamond', material: 'crystal' },
  { id: 'obsidian', name: 'Obsidiana', short: 'OBSID.', minDepth: 125, value: 3100, hardness: 234, weight: 5, color: '#3b2f4a', icon: 'obsidian', material: 'stone' },
  { id: 'mythril', name: 'Mythril', short: 'MYTHRIL', minDepth: 155, value: 6000, hardness: 306, weight: 3, color: '#7fdcd0', icon: 'mythril', material: 'metal' },
  { id: 'amethyst', name: 'Ametista', short: 'AMET.', minDepth: 190, value: 12000, hardness: 396, weight: 2.5, color: '#9b59b6', isGem: true, icon: 'amethyst', material: 'crystal' },
  { id: 'crystalCore', name: 'Núcleo de Cristal', short: 'NÚCLEO', minDepth: 230, value: 27500, hardness: 540, weight: 1, color: '#ff6ec7', isGem: true, icon: 'crystalCore', material: 'crystal' },
];

export const OREMAP: Record<OreId, OreDef> = ORES.reduce((acc, o) => {
  acc[o.id] = o;
  return acc;
}, {} as Record<OreId, OreDef>);

/** Ores currently available at a given depth, most-recently-unlocked first. */
export function oresAvailableAtDepth(depth: number): OreDef[] {
  return ORES.filter((o) => o.minDepth <= depth);
}
