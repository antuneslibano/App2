import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { MineGrid } from '../components/MineGrid';
import { pickaxeById } from '../data/pickaxes';
import { theme } from '../theme';
import { formatNumber } from '../utils/format';

export function MineScreen() {
  const grid = useGameStore((s) => s.grid);
  const depth = useGameStore((s) => s.depth);
  const pickaxeId = useGameStore((s) => s.pickaxeId);
  const mineBlock = useGameStore((s) => s.mineBlock);
  const getStats = useGameStore((s) => s.getStats);
  const totalOresMined = useGameStore((s) => s.totalOresMined);

  const pickaxe = pickaxeById(pickaxeId);
  const stats = getStats();

  return (
    <View style={styles.container}>
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {pickaxe.emoji} {pickaxe.name}
        </Text>
        <Text style={styles.infoText}>💥 {formatNumber(stats.power)} / toque</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MineGrid grid={grid} onMine={mineBlock} />
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Profundidade atual: {formatNumber(depth)}m</Text>
        <Text style={styles.footerText}>Total minerado: {formatNumber(totalOresMined)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoText: {
    color: theme.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: theme.textDim,
    fontSize: 11,
  },
});
