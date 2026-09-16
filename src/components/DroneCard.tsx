import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DroneDef } from '../types';
import { theme, cardShadow } from '../theme';
import { formatNumber } from '../utils/format';

interface Props {
  drone: DroneDef;
  level: number;
  cost: number;
  canAfford: boolean;
  onBuy: () => void;
}

export function DroneCard({ drone, level, cost, canAfford, onBuy }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{drone.emoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {drone.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {level > 0
            ? `Nível ${level} · dano ${formatNumber(drone.power * level)} a cada ${(drone.interval / 1000).toFixed(1)}s`
            : `Dano ${formatNumber(drone.power)} a cada ${(drone.interval / 1000).toFixed(1)}s`}
        </Text>
      </View>
      <Pressable style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]} onPress={onBuy} disabled={!canAfford}>
        <Text style={styles.buyText} numberOfLines={1}>
          {level > 0 ? 'MELHORAR' : 'COMPRAR'}
        </Text>
        <Text style={styles.buyCost} numberOfLines={1}>
          🪙 {formatNumber(cost)}
        </Text>
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
    ...cardShadow,
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
    backgroundColor: theme.gold,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 92,
  },
  buyBtnDisabled: {
    opacity: 0.4,
  },
  buyText: {
    color: '#1a1a1a',
    fontWeight: '800',
    fontSize: 11,
  },
  buyCost: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 11,
    marginTop: 2,
  },
});
