import * as Haptics from 'expo-haptics';

function safe(fn: () => Promise<unknown>) {
  try {
    fn().catch(() => {});
  } catch {
    // Haptics aren't available on this platform (e.g. web) — ignore.
  }
}

/**
 * A wide reach circle can break 20 blocks in the same frame. Firing one native haptic call
 * per block floods the bridge and is felt as a single long buzz anyway, so break/crit
 * feedback is collapsed to one pulse per window.
 */
const BREAK_THROTTLE_MS = 90;
let lastBreakAt = 0;

function throttledBreak(fn: () => Promise<unknown>) {
  const now = Date.now();
  if (now - lastBreakAt < BREAK_THROTTLE_MS) return;
  lastBreakAt = now;
  safe(fn);
}

export const haptics = {
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  break: () => throttledBreak(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  crit: () => throttledBreak(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  purchase: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  denied: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
