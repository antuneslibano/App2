import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlockState, OreId } from '../types';
import { ORES, OREMAP } from '../data/ores';
import { theme, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { effectiveValue } from '../utils/random';
import { inkOn } from '../utils/color';
import { GameIcon } from './GameIcon';

interface Props {
  grid: BlockState[];
}

/** Fixed row height: anything above the grid that grows or shrinks re-measures and resizes it. */
export const LEGEND_HEIGHT = 40;

/**
 * Names every ore still standing in the current layer, with how many are left and what one
 * is worth right now — so it's obvious what the grid is actually made of.
 */
export function LayerLegend({ grid }: Props) {
  const entries = useMemo(() => {
    const counts = new Map<OreId, number>();
    let depthSum = 0;
    let alive = 0;
    for (const b of grid) {
      if (b.deadAt) continue;
      counts.set(b.ore, (counts.get(b.ore) ?? 0) + 1);
      depthSum += b.depth;
      alive += 1;
    }
    const depth = alive > 0 ? depthSum / alive : 0;
    return ORES.filter((o) => counts.has(o.id))
      .map((o) => ({ ore: o, count: counts.get(o.id) ?? 0, worth: effectiveValue(o.value, depth) }))
      .sort((a, b) => b.ore.value - a.ore.value);
  }, [grid]);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="always"
      >
        {entries.map(({ ore, count, worth }) => (
          <View key={ore.id} style={[styles.chip, { borderColor: ore.color }]}>
            <View style={[styles.swatch, { backgroundColor: ore.color }]}>
              <GameIcon name={ore.icon} size={11} color={inkOn(ore.color)} />
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {OREMAP[ore.id].name}
            </Text>
            <Text style={[styles.count, ore.isGem && { color: theme.gem }]} numberOfLines={1}>
              ×{count}
            </Text>
            <Text style={[styles.worth, ore.isGem && { color: theme.gem }]} numberOfLines={1}>
              {ore.isGem ? 'gema' : formatNumber(worth)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: LEGEND_HEIGHT,
    justifyContent: 'center',
  },
  row: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 3,
    paddingRight: 9,
    paddingVertical: 3,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.display,
    color: theme.text,
    fontSize: 11,
  },
  count: {
    color: theme.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  worth: {
    color: theme.gold,
    fontSize: 10,
    fontWeight: '700',
  },
});
