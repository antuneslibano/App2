import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { UPGRADE_TRACKS, upgradeCost } from '../data/upgrades';
import { UpgradeCard } from '../components/UpgradeCard';
import { SectionHeader } from '../components/SectionHeader';
import { theme } from '../theme';

export function UpgradesScreen() {
  const gold = useGameStore((s) => s.gold);
  const upgrades = useGameStore((s) => s.upgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <SectionHeader icon="upgrade" title="Árvore de Melhorias" subtitle="Invista seu ouro em melhorias permanentes." />
      {UPGRADE_TRACKS.map((track) => {
        const level = upgrades[track.id];
        const cost = upgradeCost(track, level);
        return (
          <UpgradeCard
            key={track.id}
            track={track}
            level={level}
            cost={cost}
            canAfford={gold >= cost && level < track.maxLevel}
            onBuy={() => buyUpgrade(track.id)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
});
