import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { PICKAXES, nextPickaxe, pickaxeById } from '../data/pickaxes';
import { DRONES, droneUpgradeCost } from '../data/drones';
import { PickaxeCard } from '../components/PickaxeCard';
import { DroneCard } from '../components/DroneCard';
import { SectionHeader } from '../components/SectionHeader';
import { theme } from '../theme';

export function ShopScreen() {
  const gold = useGameStore((s) => s.gold);
  const pickaxeId = useGameStore((s) => s.pickaxeId);
  const drones = useGameStore((s) => s.drones);
  const buyPickaxe = useGameStore((s) => s.buyPickaxe);
  const buyDrone = useGameStore((s) => s.buyDrone);

  const currentTier = pickaxeById(pickaxeId).tier;
  const next = nextPickaxe(pickaxeId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <SectionHeader title="⛏️ Picaretas" subtitle="Cada picareta aumenta muito seu dano por toque." />
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

      <SectionHeader title="🤖 Drones Automáticos" subtitle="Minerador que trabalha sozinho, mesmo enquanto você navega pelos menus." />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
});
