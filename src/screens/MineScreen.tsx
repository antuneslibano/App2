import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAutosellIntervalMs, getBagCapacity, getBagValue, useGameStore } from '../state/gameStore';
import { MineGrid } from '../components/MineGrid';
import { BagBar } from '../components/BagBar';
import { ComboBadge } from '../components/ComboBadge';
import { BoostRow } from '../components/BoostRow';
import { pickaxeById } from '../data/pickaxes';
import { theme } from '../theme';
import { formatNumber } from '../utils/format';

export function MineScreen() {
  const grid = useGameStore((s) => s.grid);
  const depth = useGameStore((s) => s.depth);
  const pickaxeId = useGameStore((s) => s.pickaxeId);
  const mineArea = useGameStore((s) => s.mineArea);
  const getStats = useGameStore((s) => s.getStats);
  const totalOresMined = useGameStore((s) => s.totalOresMined);
  const bag = useGameStore((s) => s.bag);
  const upgrades = useGameStore((s) => s.upgrades);
  const sellBag = useGameStore((s) => s.sellBag);
  const comboCount = useGameStore((s) => s.comboCount);
  const comboExpireAt = useGameStore((s) => s.comboExpireAt);
  const activeBoosts = useGameStore((s) => s.activeBoosts);
  const autosellAcc = useGameStore((s) => s.autosellAcc);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 300);
    return () => clearInterval(id);
  }, []);

  const pickaxe = pickaxeById(pickaxeId);
  const stats = getStats();
  const bagCapacity = getBagCapacity({ upgrades });
  const bagValue = getBagValue({ bag });
  const displayedCombo = now < comboExpireAt ? comboCount : 0;
  const autosellInterval = getAutosellIntervalMs({ upgrades });
  const autosellRemainingMs = autosellInterval !== null ? Math.max(0, autosellInterval - autosellAcc) : null;

  return (
    <View style={styles.container}>
      <View style={styles.infoBar}>
        <Text style={styles.infoText} numberOfLines={1}>
          {pickaxe.emoji} {pickaxe.name}
        </Text>
        <Text style={styles.infoText} numberOfLines={1}>
          💥 {formatNumber(stats.power)} / toque
        </Text>
      </View>
      <BagBar
        used={bag.length}
        capacity={bagCapacity}
        value={bagValue}
        onSell={sellBag}
        autosellRemainingMs={autosellRemainingMs}
      />
      {/* The badges are overlays rather than siblings: anything that changes height above the
          grid re-measures it and visibly resizes every block. */}
      <View style={styles.stage}>
        <MineGrid grid={grid} onMineArea={mineArea} />
        <BoostRow activeBoosts={activeBoosts} now={now} />
        <ComboBadge combo={displayedCombo} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText} numberOfLines={1}>
          Profundidade: {formatNumber(depth)}m
        </Text>
        <Text style={styles.footerText} numberOfLines={1}>
          Minerado: {formatNumber(totalOresMined)}
        </Text>
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
    gap: 8,
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
