import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { UpgradeTrackDef } from '../types';
import { theme, cardShadow, fonts } from '../theme';
import { formatNumber, formatPercent } from '../utils/format';
import { ProgressBar } from './ProgressBar';
import { GameIcon } from './GameIcon';

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
        <View style={styles.iconSlot}>
          <GameIcon name={track.icon} size={26} color={theme.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.desc} numberOfLines={3}>
            {track.description}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <ProgressBar ratio={level / track.maxLevel} />
          <Text style={styles.levelText} numberOfLines={1}>
            Nível {level}/{track.maxLevel} ·{' '}
            {track.unit === 'percent'
              ? `+${formatPercent(level * track.effectPerLevel)}`
              : `+${formatNumber(level * track.effectPerLevel)}`}
          </Text>
        </View>
        {maxed ? (
          <View style={styles.badgeDone}>
            <Text style={styles.badgeText}>MAX</Text>
          </View>
        ) : (
          <Pressable style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]} onPress={onBuy} disabled={!canAfford}>
            <View style={styles.priceRow}>
              <GameIcon name="coins" size={13} color="#1a1a1a" />
              <Text style={styles.buyText} numberOfLines={1}>
                {formatNumber(cost)}
              </Text>
            </View>
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
    ...cardShadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconSlot: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: fonts.display,
    color: theme.text,
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
    fontFamily: fonts.display,
    color: theme.text,
    fontSize: 10,
  },
  buyBtn: {
    backgroundColor: theme.gold,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 84,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    opacity: 0.4,
  },
  buyText: {
    fontFamily: fonts.display,
    color: '#1a1a1a',
    fontSize: 12,
  },
});
