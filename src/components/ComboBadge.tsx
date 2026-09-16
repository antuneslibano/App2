import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

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
    <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
      <Text style={styles.text}>🔥 Combo x{combo}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    backgroundColor: theme.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  text: {
    color: theme.text,
    fontWeight: '800',
    fontSize: 13,
  },
});
