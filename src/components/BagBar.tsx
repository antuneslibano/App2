import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme, cardShadow, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { ProgressBar } from './ProgressBar';
import { GameIcon } from './GameIcon';

interface Props {
  used: number;
  capacity: number;
  value: number;
  onSell: () => void;
  autosellRemainingMs?: number | null;
}

export function BagBar({ used, capacity, value, onSell, autosellRemainingMs }: Props) {
  const full = used >= capacity;
  const autosellSeconds = autosellRemainingMs != null ? Math.ceil(autosellRemainingMs / 1000) : null;
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <View style={styles.labelRow}>
          <GameIcon name="backpack" size={13} color={full ? theme.danger : theme.textDim} />
          <Text style={styles.label} numberOfLines={1}>
            Mochila {used}/{capacity}
            {full ? ' · CHEIA' : ''}
          </Text>
        </View>
        <ProgressBar ratio={capacity > 0 ? used / capacity : 0} color={full ? theme.danger : theme.accent} height={6} />
        {/* Always rendered (just transparent when idle) so the card's height never changes —
            any height change here re-measures and resizes the mine grid below. */}
        <View style={[styles.autosellRow, autosellSeconds === null && styles.autosellHidden]}>
          <GameIcon name="wagon" size={11} color={theme.accent} />
          <Text style={styles.autosell} numberOfLines={1}>
            Auto-venda em {autosellSeconds ?? 0}s
          </Text>
        </View>
      </View>
      <Pressable style={[styles.sellBtn, used === 0 && styles.sellBtnDisabled]} onPress={onSell} disabled={used === 0}>
        <View style={styles.sellRow}>
          <GameIcon name="elevator" size={13} color="#1a1a1a" />
          <Text style={styles.sellLabel} numberOfLines={1}>
            VENDER
          </Text>
        </View>
        <View style={styles.sellRow}>
          <GameIcon name="coins" size={12} color="#1a1a1a" />
          <Text style={styles.sellValue} numberOfLines={1}>
            {formatNumber(value)}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
    ...cardShadow,
  },
  info: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  label: {
    color: theme.textDim,
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  sellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autosellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  autosell: {
    color: theme.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  autosellHidden: {
    opacity: 0,
  },
  sellBtn: {
    backgroundColor: theme.gold,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 96,
  },
  sellBtnDisabled: {
    opacity: 0.35,
  },
  sellLabel: {
    fontFamily: fonts.display,
    color: '#1a1a1a',
    fontSize: 11,
  },
  sellValue: {
    fontFamily: fonts.display,
    color: '#1a1a1a',
    fontSize: 11,
  },
});
