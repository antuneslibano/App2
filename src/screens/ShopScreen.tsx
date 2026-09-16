import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { PICKAXES, nextPickaxe, pickaxeById } from '../data/pickaxes';
import { DRONES, droneUpgradeCost } from '../data/drones';
import { BOOSTS } from '../data/boosts';
import { PickaxeCard } from '../components/PickaxeCard';
import { DroneCard } from '../components/DroneCard';
import { BoostCard } from '../components/BoostCard';
import { SectionHeader } from '../components/SectionHeader';
import { theme } from '../theme';

export function ShopScreen() {
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const pickaxeId = useGameStore((s) => s.pickaxeId);
  const drones = useGameStore((s) => s.drones);
  const activeBoosts = useGameStore((s) => s.activeBoosts);
  const buyPickaxe = useGameStore((s) => s.buyPickaxe);
  const buyDrone = useGameStore((s) => s.buyDrone);
  const buyBoost = useGameStore((s) => s.buyBoost);

  const currentTier = pickaxeById(pickaxeId).tier;
  const next = nextPickaxe(pickaxeId);
  const now = Date.now();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <SectionHeader icon="pickaxe" title="Picaretas" subtitle="Cada picareta aumenta muito seu dano por toque." />
      {PICKAXES.map((p) => {
        const owned = p.tier <= currentTier;
        const isCurrent = p.id === pickaxeId;
        const isBuyable = next?.id === p.id;
        return (
          <PickaxeCard
            key={p.id}
            pickaxe={p}
            owned={owned}
            isCurrent={isCurrent}
            canAfford={isBuyable && gold >= p.cost}
            onBuy={() => isBuyable && buyPickaxe()}
          />
        );
      })}

      <SectionHeader icon="robot" title="Drones Automáticos" subtitle="Mineradores que trabalham sozinhos, mesmo enquanto você navega pelos menus." />
      {DRONES.map((d) => {
        const level = drones[d.id] ?? 0;
        const cost = level === 0 ? d.cost : droneUpgradeCost(d.cost, level);
        return (
          <DroneCard
            key={d.id}
            drone={d}
            level={level}
            cost={cost}
            canAfford={gold >= cost}
            onBuy={() => buyDrone(d.id)}
          />
        );
      })}

      <SectionHeader icon="gems" title="Impulsos" subtitle="Ative bônus temporários gastando as gemas que você encontra minerando." />
      {BOOSTS.map((b) => (
        <BoostCard
          key={b.id}
          boost={b}
          active={(activeBoosts[b.id] ?? 0) > now}
          canAfford={gems >= b.cost}
          onBuy={() => buyBoost(b.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
});
