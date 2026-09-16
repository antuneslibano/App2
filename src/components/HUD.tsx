import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { formatNumber } from '../utils/format';

interface Props {
  gold: number;
  gems: number;
  depth: number;
  relics: number;
}

export function HUD({ gold, gems, depth, relics }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.icon}>🪙</Text>
        <Text style={[styles.value, { color: theme.gold }]}>{formatNumber(gold)}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.icon}>💎</Text>
        <Text style={[styles.value, { color: theme.gem }]}>{formatNumber(gems)}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.icon}>⛏️</Text>
        <Text style={styles.value}>{formatNumber(depth)}m</Text>
      </View>
      {relics > 0 && (
        <View style={styles.pill}>
          <Text style={styles.icon}>🔺</Text>
          <Text style={[styles.value, { color: theme.accent }]}>{formatNumber(relics)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  value: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 13,
  },
});
