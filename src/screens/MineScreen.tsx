import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { MineGrid } from '../components/MineGrid';
import { BagBar } from '../components/BagBar';
import { ComboBadge } from '../components/ComboBadge';
import { BoostRow } from '../components/BoostRow';
import { LayerLegend } from '../components/LayerLegend';
import { GameIcon } from '../components/GameIcon';
import { pickaxeById } from '../data/pickaxes';
import { theme } from '../theme';
import { formatNumber } from '../utils/format';

/**
 * A layout shell, deliberately holding no state of its own. Everything below subscribes to
 * just the slice it shows, so mining a block re-renders the bag bar and the touched cells —
 * not the whole screen, which is what made a wide reach circle stutter.
 */
export function MineScreen() {
  const mineArea = useGameStore((s) => s.mineArea);

  return (
    <View style={styles.container}>
      <StatsBar />
      <LayerLegend />
      <BagBar />
      {/* The badges are overlays rather than siblings: anything that changes height above the
          grid re-measures it and visibly resizes every block. */}
      <View style={styles.stage}>
        <MineGrid onMineArea={mineArea} />
        <BoostRow />
        <ComboBadge />
      </View>
      <MineFooter />
    </View>
  );
}

/** Selectors here return plain numbers/strings, so a store write only re-renders on a change. */
function StatsBar() {
  const pickaxeId = useGameStore((s) => s.pickaxeId);
  const power = useGameStore((s) => s.getStats().power);
  const radiusFactor = useGameStore((s) => s.getStats().radiusFactor);
  const pickaxe = pickaxeById(pickaxeId);

  return (
    <View style={styles.infoBar}>
      <View style={[styles.infoChip, styles.infoChipGrow]}>
        <GameIcon name={pickaxe.icon} size={15} color={pickaxe.color} />
        <Text style={styles.infoText} numberOfLines={1}>
          {pickaxe.name}
        </Text>
      </View>
      <View style={styles.infoChip}>
        <GameIcon name="fist" size={15} color={theme.gold} />
        <Text style={styles.infoText} numberOfLines={1}>
          {formatNumber(power)} / golpe
        </Text>
      </View>
      <View style={styles.infoChip}>
        <GameIcon name="radar" size={15} color={theme.accent} />
        <Text style={styles.infoText} numberOfLines={1}>
          raio {radiusFactor.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

function MineFooter() {
  const depth = useGameStore((s) => s.depth);
  const totalOresMined = useGameStore((s) => s.totalOresMined);

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText} numberOfLines={1}>
        Profundidade: {formatNumber(depth)}m
      </Text>
      <Text style={styles.footerText} numberOfLines={1}>
        Minerado: {formatNumber(totalOresMined)}
      </Text>
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
    gap: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  infoChipGrow: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  infoText: {
    color: theme.textDim,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  stage: {
    flex: 1,
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
    flexShrink: 1,
  },
});
