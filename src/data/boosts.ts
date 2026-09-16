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

export function boostById(id: string): BoostDef {
  const b = BOOSTS.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown boost ${id}`);
  return b;
}
