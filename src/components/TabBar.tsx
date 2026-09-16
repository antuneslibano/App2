import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../theme';

export type TabId = 'mine' | 'shop' | 'upgrades' | 'prestige';

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'mine', label: 'Mina', emoji: '⛏️' },
  { id: 'shop', label: 'Loja', emoji: '🛒' },
  { id: 'upgrades', label: 'Melhorias', emoji: '🌳' },
  { id: 'prestige', label: 'Ascender', emoji: '🔺' },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable key={tab.id} style={styles.tab} onPress={() => onChange(tab.id)}>
            <Text style={styles.emoji}>{tab.emoji}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
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
    paddingBottom: 18,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    color: theme.textDim,
    fontWeight: '600',
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
