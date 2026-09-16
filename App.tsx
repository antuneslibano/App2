import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HUD } from './src/components/HUD';
import { TabBar, TabId } from './src/components/TabBar';
import { OfflineEarningsModal } from './src/components/OfflineEarningsModal';
import { MineScreen } from './src/screens/MineScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { UpgradesScreen } from './src/screens/UpgradesScreen';
import { PrestigeScreen } from './src/screens/PrestigeScreen';
import { useGameStore } from './src/state/gameStore';
import { theme } from './src/theme';

const TICK_MS = 200;

function AppContent() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>('mine');
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const depth = useGameStore((s) => s.depth);
  const relics = useGameStore((s) => s.relics);
  const tickDrones = useGameStore((s) => s.tickDrones);
  const cleanupDeadBlocks = useGameStore((s) => s.cleanupDeadBlocks);
  const hydrate = useGameStore((s) => s.hydrate);
  const pendingOfflineReport = useGameStore((s) => s.pendingOfflineReport);
  const dismissOfflineReport = useGameStore((s) => s.dismissOfflineReport);

  const lastTick = useRef(Date.now());

  useEffect(() => {
    hydrate();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      tickDrones(delta);
      cleanupDeadBlocks();
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [hydrate, tickDrones, cleanupDeadBlocks]);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.surface} />
      <HUD gold={gold} gems={gems} depth={depth} relics={relics} />
      <View style={styles.content}>
        {tab === 'mine' && <MineScreen />}
        {tab === 'shop' && <ShopScreen />}
        {tab === 'upgrades' && <UpgradesScreen />}
        {tab === 'prestige' && <PrestigeScreen />}
      </View>
      <TabBar active={tab} onChange={setTab} bottomInset={insets.bottom} />
      {pendingOfflineReport && (
        <OfflineEarningsModal
          visible
          gold={pendingOfflineReport.gold}
          elapsedMs={pendingOfflineReport.elapsedMs}
          onClose={dismissOfflineReport}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
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
