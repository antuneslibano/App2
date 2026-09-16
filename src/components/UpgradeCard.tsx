import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { UpgradeTrackDef } from '../types';
import { theme } from '../theme';
import { formatNumber, formatPercent } from '../utils/format';
import { ProgressBar } from './ProgressBar';

interface Props {
  track: UpgradeTrackDef;
  level: number;
  cost: number;
  canAfford: boolean;
  onBuy: () => void;
}

export function UpgradeCard({ track, level, cost, canAfford, onBuy }: Props) {
  const maxed = level >= track.maxLevel;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{track.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{track.name}</Text>
          <Text style={styles.desc}>{track.description}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <ProgressBar ratio={level / track.maxLevel} />
          <Text style={styles.levelText}>
            Nível {level}/{track.maxLevel} · +{formatPercent(level * track.effectPerLevel)}
          </Text>
        </View>
        {maxed ? (
          <View style={styles.badgeDone}>
            <Text style={styles.badgeText}>MAX</Text>
          </View>
        ) : (
          <Pressable style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]} onPress={onBuy} disabled={!canAfford}>
            <Text style={styles.buyText}>🪙 {formatNumber(cost)}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  name: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 14,
  },
  desc: {
    color: theme.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    color: theme.textDim,
    fontSize: 11,
    marginTop: 4,
  },
  badgeDone: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badgeText: {
    color: theme.text,
    fontSize: 10,
    fontWeight: '800',
  },
  buyBtn: {
    backgroundColor: theme.gold,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buyBtnDisabled: {
    opacity: 0.4,
  },
  buyText: {
    color: '#1a1a1a',
    fontWeight: '800',
    fontSize: 12,
  },
});
