import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import { HUD } from './src/components/HUD';
import { TabBar, TabId } from './src/components/TabBar';
import { MineScreen } from './src/screens/MineScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { UpgradesScreen } from './src/screens/UpgradesScreen';
import { PrestigeScreen } from './src/screens/PrestigeScreen';
import { useGameStore } from './src/state/gameStore';
import { theme } from './src/theme';

const TICK_MS = 200;

export default function App() {
  const [tab, setTab] = useState<TabId>('mine');
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const depth = useGameStore((s) => s.depth);
  const relics = useGameStore((s) => s.relics);
  const tickDrones = useGameStore((s) => s.tickDrones);
  const hydrate = useGameStore((s) => s.hydrate);

  const lastTick = useRef(Date.now());

  useEffect(() => {
    hydrate();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      tickDrones(delta);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [hydrate, tickDrones]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.surface} />
      <HUD gold={gold} gems={gems} depth={depth} relics={relics} />
      <View style={styles.content}>
        {tab === 'mine' && <MineScreen />}
        {tab === 'shop' && <ShopScreen />}
        {tab === 'upgrades' && <UpgradesScreen />}
        {tab === 'prestige' && <PrestigeScreen />}
      </View>
      <TabBar active={tab} onChange={setTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    flex: 1,
  },
});
