import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { formatNumber } from '../utils/format';
import { ProgressBar } from './ProgressBar';

interface Props {
  used: number;
  capacity: number;
  value: number;
  onSell: () => void;
}

export function BagBar({ used, capacity, value, onSell }: Props) {
  const full = used >= capacity;
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>
          🎒 Mochila {used}/{capacity} {full ? '· CHEIA' : ''}
        </Text>
        <ProgressBar ratio={capacity > 0 ? used / capacity : 0} color={full ? theme.danger : theme.accent} height={6} />
      </View>
      <Pressable style={[styles.sellBtn, used === 0 && styles.sellBtnDisabled]} onPress={onSell} disabled={used === 0}>
        <Text style={styles.sellLabel}>🛗 VENDER</Text>
        <Text style={styles.sellValue}>🪙 {formatNumber(value)}</Text>
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
