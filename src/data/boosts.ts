import { BoostDef } from '../types';

/** Temporary premium boosts bought with Gems, the main sink for that currency. */
export const BOOSTS: BoostDef[] = [
  {
    id: 'power',
    name: 'Fúria de Mineração',
    description: 'Dobra seu dano por toque por 5 minutos.',
    icon: 'fire',
    cost: 10,
    durationMs: 5 * 60 * 1000,
    multiplier: 2,
  },
  {
    id: 'fortune',
    name: 'Toque de Midas',
    description: 'Dobra o ouro obtido ao vender por 5 minutos.',
    icon: 'crown',
    cost: 10,
    durationMs: 5 * 60 * 1000,
    multiplier: 2,
  },
  {
    id: 'luck',
    name: 'Olho de Águia',
    description: 'Dobra a sorte (raridade e crítico) por 5 minutos.',
    icon: 'eagle',
    cost: 8,
    durationMs: 5 * 60 * 1000,
    multiplier: 2,
  },
];

const BY_ID: Record<string, BoostDef> = Object.fromEntries(BOOSTS.map((x) => [x.id, x]));

/** O(1) lookup: this sits inside the per-swing stat calculation. */
export function boostById(id: string): BoostDef {
  const found = BY_ID[id];
  if (!found) throw new Error(`Unknown id ${id}`);
  return found;
}
