import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { theme, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { GameIcon } from './GameIcon';

interface Props {
  visible: boolean;
  gold: number;
  elapsedMs: number;
  onClose: () => void;
}

function formatElapsed(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

export function OfflineEarningsModal({ visible, gold, elapsedMs, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <GameIcon name="robot" size={38} color={theme.gem} />
            <GameIcon name="pickaxe" size={38} color={theme.gold} />
          </View>
          <Text style={styles.title}>Enquanto você estava fora...</Text>
          <Text style={styles.subtitle}>Seus drones continuaram minerando por {formatElapsed(elapsedMs)}!</Text>
          <View style={styles.goldRow}>
            <GameIcon name="coins" size={26} color={theme.gold} />
            <Text style={styles.gold}>+{formatNumber(gold)}</Text>
          </View>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Coletar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  goldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  title: {
    fontFamily: fonts.display,
    color: theme.text,
    fontSize: 17,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  gold: {
    fontFamily: fonts.display,
    color: theme.gold,
    fontSize: 26,
  },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.display,
    color: theme.text,
    fontSize: 14,
  },
});
