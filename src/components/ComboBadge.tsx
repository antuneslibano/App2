import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { theme, fonts } from '../theme';
import { GameIcon } from './GameIcon';

interface Props {
  combo: number;
}

export function ComboBadge({ combo }: Props) {
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
