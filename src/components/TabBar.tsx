import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme, fonts } from '../theme';
import { GameIcon } from './GameIcon';
import { GameIconName } from '../assets/gameIcons';

export type TabId = 'mine' | 'shop' | 'upgrades' | 'prestige';

const TABS: { id: TabId; label: string; icon: GameIconName }[] = [
  { id: 'mine', label: 'Mina', icon: 'pickaxe' },
  { id: 'shop', label: 'Loja', icon: 'cart' },
  { id: 'upgrades', label: 'Melhorias', icon: 'upgrade' },
  { id: 'prestige', label: 'Ascender', icon: 'elevator' },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  bottomInset?: number;
}

export function TabBar({ active, onChange, bottomInset = 0 }: Props) {
  return (
    <View style={[styles.container, { paddingBottom: 8 + bottomInset }]}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable key={tab.id} style={styles.tab} onPress={() => onChange(tab.id)}>
            <GameIcon name={tab.icon} size={22} color={isActive ? theme.accent : theme.textDim} />
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: theme.textDim,
  },
  labelActive: {
    color: theme.text,
  },
  indicator: {
    marginTop: 3,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.accent,
  },
});
