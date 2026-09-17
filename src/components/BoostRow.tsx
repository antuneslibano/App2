import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { BOOSTS } from '../data/boosts';
import { useGameStore } from '../state/gameStore';
import { useNow } from '../utils/useNow';
import { GameIcon } from './GameIcon';

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function BoostRow() {
  // Owns its own clock so counting a boost down doesn't re-render the mine around it.
  const now = useNow(1000);
  const activeBoosts = useGameStore((s) => s.activeBoosts);
  const active = BOOSTS.filter((b) => (activeBoosts[b.id] ?? 0) > now);
  if (active.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {active.map((boost) => (
        <View key={boost.id} style={styles.chip}>
          <GameIcon name={boost.icon} size={13} color={theme.gold} />
          <Text style={styles.chipText}>{formatRemaining((activeBoosts[boost.id] ?? 0) - now)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlays the mine stage instead of sitting in the flex flow, so boosts starting or
  // expiring never resize the grid underneath.
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  chipText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
