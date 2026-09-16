import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BoostDef } from '../types';
import { theme, cardShadow, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { GameIcon } from './GameIcon';

interface Props {
  boost: BoostDef;
  active: boolean;
  canAfford: boolean;
  onBuy: () => void;
}

export function BoostCard({ boost, active, canAfford, onBuy }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconSlot}>
        <GameIcon name={boost.icon} size={28} color={theme.gold} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {boost.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {boost.description}
        </Text>
      </View>
      <Pressable style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]} onPress={onBuy} disabled={!canAfford}>
        <Text style={styles.buyText} numberOfLines={1}>
          {active ? '+TEMPO' : 'ATIVAR'}
        </Text>
        <View style={styles.priceRow}>
          <GameIcon name="gems" size={12} color="#0a2a33" />
          <Text style={styles.buyCost} numberOfLines={1}>
            {formatNumber(boost.cost)}
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
    fontFamily: fonts.display,
    color: '#0a2a33',
    fontSize: 11,
  },
  buyCost: {
    fontFamily: fonts.display,
    color: '#0a2a33',
    fontSize: 11,
  },
});
