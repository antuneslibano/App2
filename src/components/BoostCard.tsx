import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BoostDef } from '../types';
import { theme } from '../theme';
import { formatNumber } from '../utils/format';

interface Props {
  boost: BoostDef;
  active: boolean;
  canAfford: boolean;
  onBuy: () => void;
}

export function BoostCard({ boost, active, canAfford, onBuy }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{boost.emoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {boost.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {boost.description}
        </Text>
      </View>
      <Pressable style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]} onPress={onBuy} disabled={!canAfford}>
        <Text style={styles.buyText}>{active ? '+TEMPO' : 'ATIVAR'}</Text>
        <Text style={styles.buyCost}>💎 {formatNumber(boost.cost)}</Text>
      </Pressable>
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
  },
  emoji: {
    fontSize: 26,
    marginRight: 10,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 14,
  },
  desc: {
    color: theme.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  buyBtn: {
    backgroundColor: theme.gem,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 88,
  },
  buyBtnDisabled: {
    opacity: 0.4,
  },
  buyText: {
    color: '#0a2a33',
    fontWeight: '800',
    fontSize: 10,
  },
  buyCost: {
    color: '#0a2a33',
    fontWeight: '700',
    fontSize: 11,
    marginTop: 2,
  },
});
