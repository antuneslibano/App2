import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

/** Kenney's CC-licensed starter-kit audio (see CREDITS.md), mapped onto the game's events. */
const SOURCES = {
  tap: require('../../assets/sfx/tap.ogg'),
  break: require('../../assets/sfx/break.ogg'),
  crit: require('../../assets/sfx/crit.ogg'),
  coin: require('../../assets/sfx/coin.ogg'),
  purchase: require('../../assets/sfx/purchase.ogg'),
  ascend: require('../../assets/sfx/ascend.ogg'),
  descend: require('../../assets/sfx/descend.ogg'),
  toggle: require('../../assets/sfx/toggle.ogg'),
};

type SfxName = keyof typeof SOURCES;

const VOLUMES: Record<SfxName, number> = {
  tap: 0.3,
  break: 0.55,
  crit: 0.5,
  coin: 0.6,
  purchase: 0.6,
  ascend: 0.7,
  descend: 0.5,
  toggle: 0.4,
};

/** Mining ticks fire every 150ms; re-triggering faster than this just stacks noise. */
const MIN_REPLAY_GAP_MS: Record<SfxName, number> = {
  tap: 110,
  break: 60,
  crit: 60,
  coin: 150,
  purchase: 150,
  ascend: 500,
  descend: 400,
  toggle: 80,
};

const players = new Map<SfxName, AudioPlayer>();
const lastPlayedAt = new Map<SfxName, number>();
let initialized = false;

export function initSfx() {
  if (initialized) return;
  initialized = true;
  // Game audio shouldn't hijack music playback or fire while the phone is silenced.
  setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false }).catch(() => {});
  for (const name of Object.keys(SOURCES) as SfxName[]) {
    try {
      const player = createAudioPlayer(SOURCES[name]);
      player.volume = VOLUMES[name];
      players.set(name, player);
    } catch {
      // Audio is optional — a device that can't create a player just plays no sound.
    }
  }
}

function play(name: SfxName) {
  const now = Date.now();
  const last = lastPlayedAt.get(name) ?? 0;
  if (now - last < MIN_REPLAY_GAP_MS[name]) return;
  lastPlayedAt.set(name, now);

  const player = players.get(name);
  if (!player) return;
  try {
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Ignore playback failures; sound is never load-bearing.
  }
}

export const sfx = {
  tap: () => play('tap'),
  break: () => play('break'),
  crit: () => play('crit'),
  coin: () => play('coin'),
  purchase: () => play('purchase'),
  ascend: () => play('ascend'),
  descend: () => play('descend'),
  toggle: () => play('toggle'),
};
