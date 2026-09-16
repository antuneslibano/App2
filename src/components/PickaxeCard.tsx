import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PickaxeDef } from '../types';
import { theme, cardShadow } from '../theme';
import { formatNumber } from '../utils/format';

interface Props {
  pickaxe: PickaxeDef;
  owned: boolean;
  isCurrent: boolean;
  canAfford: boolean;
  onBuy: () => void;
}

export function PickaxeCard({ pickaxe, owned, isCurrent, canAfford, onBuy }: Props) {
  return (
    <View style={[styles.card, isCurrent && styles.cardActive]}>
      <Text style={styles.emoji}>{pickaxe.emoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {pickaxe.name}
        </Text>
        <Text style={styles.power} numberOfLines={1}>
          Poder: {formatNumber(pickaxe.power)}
        </Text>
      </View>
      {isCurrent ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EM USO</Text>
        </View>
      ) : owned ? (
        <View style={styles.badgeDone}>
          <Text style={styles.badgeText}>OBTIDA</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
          onPress={onBuy}
          disabled={!canAfford}
        >
          <Text style={styles.buyText} numberOfLines={1}>
            🪙 {formatNumber(pickaxe.cost)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    ...cardShadow,
  },
  cardActive: {
    borderColor: theme.accent,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 14,
  },
  power: {
    color: theme.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeDone: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.text,
    fontSize: 10,
    fontWeight: '800',
  },
  buyBtn: {
    backgroundColor: theme.gold,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 84,
    alignItems: 'center',
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
