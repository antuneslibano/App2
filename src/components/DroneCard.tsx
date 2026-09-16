import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DroneDef } from '../types';
import { theme, cardShadow, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { GameIcon } from './GameIcon';

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
      <View style={styles.iconSlot}>
        <GameIcon name={drone.icon} size={28} color={theme.gem} />
      </View>
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
        <View style={styles.priceRow}>
          <GameIcon name="coins" size={12} color="#1a1a1a" />
          <Text style={styles.buyCost} numberOfLines={1}>
            {formatNumber(cost)}
          </Text>
        </View>
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
  iconSlot: {
    width: 32,
    alignItems: 'center',
    marginRight: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontFamily: fonts.display,
    color: theme.text,
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
    fontFamily: fonts.display,
    color: '#1a1a1a',
    fontSize: 11,
  },
  buyCost: {
    fontFamily: fonts.display,
    color: '#1a1a1a',
    fontSize: 11,
  },
});
