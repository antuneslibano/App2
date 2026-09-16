import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { MaterialKind } from '../types';

/**
 * Single-channel game audio: at most one sound is ever audible, so rapid mining
 * never turns into a pile of overlapping samples. A louder event (a block
 * breaking, a critical hit) cuts off a quieter one; a quieter event that arrives
 * while something is playing is simply dropped.
 *
 * Sources are credited in CREDITS.md — mining sounds come from Minetest Game,
 * the rest from Kenney's starter kits.
 */

const CLIPS = {
  dig_soil_1: { src: require('../../assets/sfx/mining/dig_soil_1.ogg'), ms: 320 },
  dig_soil_2: { src: require('../../assets/sfx/mining/dig_soil_2.ogg'), ms: 280 },
  dig_soil_3: { src: require('../../assets/sfx/mining/dig_soil_3.ogg'), ms: 280 },
  dig_stone_1: { src: require('../../assets/sfx/mining/dig_stone_1.ogg'), ms: 280 },
  dig_stone_2: { src: require('../../assets/sfx/mining/dig_stone_2.ogg'), ms: 280 },
  dig_stone_3: { src: require('../../assets/sfx/mining/dig_stone_3.ogg'), ms: 280 },
  dig_metal_1: { src: require('../../assets/sfx/mining/dig_metal_1.ogg'), ms: 224 },
  dig_crystal_1: { src: require('../../assets/sfx/mining/dig_crystal_1.ogg'), ms: 344 },
  dig_crystal_2: { src: require('../../assets/sfx/mining/dig_crystal_2.ogg'), ms: 344 },
  dig_crystal_3: { src: require('../../assets/sfx/mining/dig_crystal_3.ogg'), ms: 344 },
  break_soil_1: { src: require('../../assets/sfx/mining/break_soil_1.ogg'), ms: 280 },
  break_soil_2: { src: require('../../assets/sfx/mining/break_soil_2.ogg'), ms: 280 },
  break_soil_3: { src: require('../../assets/sfx/mining/break_soil_3.ogg'), ms: 280 },
  break_stone_1: { src: require('../../assets/sfx/mining/break_stone_1.ogg'), ms: 274 },
  break_stone_2: { src: require('../../assets/sfx/mining/break_stone_2.ogg'), ms: 270 },
  break_metal_1: { src: require('../../assets/sfx/mining/break_metal_1.ogg'), ms: 500 },
  break_metal_2: { src: require('../../assets/sfx/mining/break_metal_2.ogg'), ms: 500 },
  break_crystal_1: { src: require('../../assets/sfx/mining/break_crystal_1.ogg'), ms: 488 },
  break_crystal_2: { src: require('../../assets/sfx/mining/break_crystal_2.ogg'), ms: 674 },
  crit: { src: require('../../assets/sfx/mining/crit.ogg'), ms: 547 },
  coin: { src: require('../../assets/sfx/coin.ogg'), ms: 287 },
  purchase: { src: require('../../assets/sfx/purchase.ogg'), ms: 100 },
  ascend: { src: require('../../assets/sfx/ascend.ogg'), ms: 168 },
  descend: { src: require('../../assets/sfx/descend.ogg'), ms: 139 },
} as const;

type ClipName = keyof typeof CLIPS;

/** Pickaxe strikes: ore families sound different, and each rotates through variants. */
const DIG_CLIPS: Record<MaterialKind, ClipName[]> = {
  soil: ['dig_soil_1', 'dig_soil_2', 'dig_soil_3'],
  stone: ['dig_stone_1', 'dig_stone_2', 'dig_stone_3'],
  // Ore veins sit in rock, so metal mixes a metallic ring with plain pick-on-stone.
  metal: ['dig_metal_1', 'dig_stone_1', 'dig_stone_3'],
  crystal: ['dig_crystal_1', 'dig_crystal_2', 'dig_crystal_3'],
};

const BREAK_CLIPS: Record<MaterialKind, ClipName[]> = {
  soil: ['break_soil_1', 'break_soil_2', 'break_soil_3'],
  stone: ['break_stone_1', 'break_stone_2'],
  metal: ['break_metal_1', 'break_metal_2'],
  crystal: ['break_crystal_1', 'break_crystal_2'],
};

const VOLUMES: Record<ClipName, number> = {
  dig_soil_1: 0.4, dig_soil_2: 0.4, dig_soil_3: 0.4,
  dig_stone_1: 0.45, dig_stone_2: 0.45, dig_stone_3: 0.45,
  dig_metal_1: 0.45,
  dig_crystal_1: 0.4, dig_crystal_2: 0.4, dig_crystal_3: 0.4,
  break_soil_1: 0.6, break_soil_2: 0.6, break_soil_3: 0.6,
  break_stone_1: 0.65, break_stone_2: 0.65,
  break_metal_1: 0.6, break_metal_2: 0.6,
  break_crystal_1: 0.6, break_crystal_2: 0.5,
  crit: 0.6,
  coin: 0.6,
  purchase: 0.6,
  ascend: 0.7,
  descend: 0.55,
};

/** Higher wins the channel. Equal priority only interrupts when the event says so. */
const enum Priority {
  Dig = 1,
  Event = 2,
  Break = 3,
  Crit = 4,
}

const players = new Map<ClipName, AudioPlayer>();
let activeClip: ClipName | null = null;
let activePriority = 0;
let activeEndsAt = 0;
let initialized = false;

export function initSfx() {
  if (initialized) return;
  initialized = true;
  // Game audio shouldn't hijack music playback or fire while the phone is silenced.
  setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false }).catch(() => {});
  for (const name of Object.keys(CLIPS) as ClipName[]) {
    try {
      const player = createAudioPlayer(CLIPS[name].src);
      player.volume = VOLUMES[name];
      players.set(name, player);
    } catch {
      // Audio is optional — a device that can't create a player just plays no sound.
    }
  }
}

function play(name: ClipName, priority: Priority, interruptsEqual: boolean) {
  const now = Date.now();
  const busy = activeClip !== null && now < activeEndsAt;

  if (busy) {
    const canTakeOver = priority > activePriority || (priority === activePriority && interruptsEqual);
    if (!canTakeOver) return;
    const previous = players.get(activeClip!);
    try {
      previous?.pause();
    } catch {
      // Nothing to do — worst case the old clip finishes under the new one.
    }
  }

  const player = players.get(name);
  if (!player) return;
  try {
    player.seekTo(0).catch(() => {});
    player.play();
    activeClip = name;
    activePriority = priority;
    activeEndsAt = now + CLIPS[name].ms;
  } catch {
    // Ignore playback failures; sound is never load-bearing.
  }
}

/** Remembers the last variant per list so the same sample never repeats back to back. */
const lastVariant = new Map<string, number>();

function pickVariant(key: string, clips: ClipName[]): ClipName {
  if (clips.length === 1) return clips[0];
  const previous = lastVariant.get(key);
  let index = Math.floor(Math.random() * clips.length);
  if (index === previous) index = (index + 1) % clips.length;
  lastVariant.set(key, index);
  return clips[index];
}

export const sfx = {
  /** Pickaxe striking a block that didn't break — the repeating "tec tec tec". */
  dig: (material: MaterialKind) => play(pickVariant(`dig:${material}`, DIG_CLIPS[material]), Priority.Dig, true),
  /** A block shattering. Doesn't interrupt another break, so drone swarms don't stutter. */
  breakOre: (material: MaterialKind, crit = false) =>
    crit
      ? play('crit', Priority.Crit, true)
      : play(pickVariant(`break:${material}`, BREAK_CLIPS[material]), Priority.Break, false),
  coin: () => play('coin', Priority.Event, false),
  purchase: () => play('purchase', Priority.Event, false),
  ascend: () => play('ascend', Priority.Event, false),
  descend: () => play('descend', Priority.Event, false),
};
