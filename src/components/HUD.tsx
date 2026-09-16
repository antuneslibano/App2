import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { GameIcon } from './GameIcon';

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
        <GameIcon name="coins" size={15} color={theme.gold} />
        <Text style={[styles.value, { color: theme.gold }]}>{formatNumber(gold)}</Text>
      </View>
      <View style={styles.pill}>
        <GameIcon name="gems" size={15} color={theme.gem} />
        <Text style={[styles.value, { color: theme.gem }]}>{formatNumber(gems)}</Text>
      </View>
      <View style={styles.pill}>
        <GameIcon name="pickaxe" size={15} color={theme.textDim} />
        <Text style={styles.value}>{formatNumber(depth)}m</Text>
      </View>
      {relics > 0 && (
        <View style={styles.pill}>
          <GameIcon name="trophy" size={15} color={theme.accent} />
          <Text style={[styles.value, { color: theme.accent }]}>{formatNumber(relics)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
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
  value: {
    fontFamily: fonts.display,
    color: theme.text,
    fontSize: 13,
  },
});
