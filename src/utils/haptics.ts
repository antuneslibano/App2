import * as Haptics from 'expo-haptics';

function safe(fn: () => Promise<unknown>) {
  try {
    fn().catch(() => {});
  } catch {
    // Haptics aren't available on this platform (e.g. web) — ignore.
  }
}

export const haptics = {
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  break: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  crit: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  purchase: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  denied: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
