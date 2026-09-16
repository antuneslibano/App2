import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme, cardShadow } from '../theme';
import { formatNumber } from '../utils/format';
import { ProgressBar } from './ProgressBar';

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
        <Text style={styles.label} numberOfLines={1}>
          🎒 Mochila {used}/{capacity} {full ? '· CHEIA' : ''}
        </Text>
        <ProgressBar ratio={capacity > 0 ? used / capacity : 0} color={full ? theme.danger : theme.accent} height={6} />
        {autosellSeconds !== null && (
          <Text style={styles.autosell} numberOfLines={1}>
            📦 Auto-venda em {autosellSeconds}s
          </Text>
        )}
      </View>
      <Pressable style={[styles.sellBtn, used === 0 && styles.sellBtnDisabled]} onPress={onSell} disabled={used === 0}>
        <Text style={styles.sellLabel} numberOfLines={1}>
          🛗 VENDER
        </Text>
        <Text style={styles.sellValue} numberOfLines={1}>
          🪙 {formatNumber(value)}
        </Text>
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
  label: {
    color: theme.textDim,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  autosell: {
    color: theme.accent,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
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
    color: '#1a1a1a',
    fontWeight: '800',
    fontSize: 11,
  },
  sellValue: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 11,
    marginTop: 2,
  },
});
