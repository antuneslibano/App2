import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const SOURCES = {
  tap: require('../../assets/sfx/tap.wav'),
  break: require('../../assets/sfx/break.wav'),
  crit: require('../../assets/sfx/crit.wav'),
  coin: require('../../assets/sfx/coin.wav'),
  purchase: require('../../assets/sfx/purchase.wav'),
  ascend: require('../../assets/sfx/ascend.wav'),
};

type SfxName = keyof typeof SOURCES;

const VOLUMES: Record<SfxName, number> = {
  tap: 0.35,
  break: 0.6,
  crit: 0.7,
  coin: 0.6,
  purchase: 0.6,
  ascend: 0.7,
};

const players = new Map<SfxName, AudioPlayer>();

/** Mining ticks fire every 150ms; re-triggering a sound faster than this just wastes calls. */
const MIN_REPLAY_GAP_MS: Record<SfxName, number> = {
  tap: 90,
  break: 40,
  crit: 40,
  coin: 120,
  purchase: 120,
  ascend: 500,
};
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
};
