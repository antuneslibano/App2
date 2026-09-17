import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { useNow } from '../utils/useNow';
import { theme, fonts } from '../theme';
import { GameIcon } from './GameIcon';

export function ComboBadge() {
  // Owns its own clock so the combo expiring doesn't re-render the mine around it.
  const now = useNow(300);
  const comboCount = useGameStore((s) => s.comboCount);
  const comboExpireAt = useGameStore((s) => s.comboExpireAt);
  const combo = now < comboExpireAt ? comboCount : 0;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (combo <= 1) return;
    scale.setValue(1.3);
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, [combo, scale]);

  if (combo <= 1) return null;

  return (
    <Animated.View style={[styles.badge, { transform: [{ scale }] }]} pointerEvents="none">
      <GameIcon name="fire" size={15} color={theme.gold} />
      <Text style={styles.text} numberOfLines={1}>
        Combo x{combo}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Absolutely positioned so mounting/unmounting it never reflows the mine grid below it
  // (a reflow there re-measures the grid and visibly resizes every block).
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    zIndex: 5,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  text: {
    fontFamily: fonts.display,
    color: theme.text,
    fontSize: 13,
  },
});
